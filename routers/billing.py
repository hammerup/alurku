"""
routers/billing.py
Billing Checkout & Invoice generation simulator for alurku.
SSOT Pricing (per LandingPricingPage.jsx /harga):
  Pro:      Rp 79.000/bln (yearly) | Rp 99.000/bln (monthly)
  Business: Rp 199.000/bln (yearly) | Rp 249.000/bln (monthly)
"""
import random
import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db, Invoice, Workspace, WorkspaceMember
from schemas import CheckoutRequestModel
from dependencies import get_current_user
from utils import create_notification

router = APIRouter()

# ── SSOT Pricing Matrix ───────────────────────────────────────────────────────
PRICING = {
    "pro": {
        "monthly": 99_000,
        "yearly":  79_000,
    },
    "business": {
        "monthly": 249_000,
        "yearly":  199_000,
    },
}

TIER_LABELS = {
    "pro": "Pro (Agile Team)",
    "business": "Business (Scale)",
}

PAYMENT_LABELS = {
    "qris": "QRIS",
    "va_bca": "Virtual Account BCA",
    "va_mandiri": "Virtual Account Mandiri",
    "credit_card": "Kartu Kredit",
}


def _invoice_number() -> str:
    month_key = datetime.utcnow().strftime("%Y%m")
    rand4 = random.randint(1000, 9999)
    return f"INV-{month_key}-{rand4}"


def _is_workspace_admin_or_owner(db: Session, workspace_id: int, username: str) -> bool:
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if ws and ws.owner_username == username:
        return True
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == username,
        WorkspaceMember.role.in_(["admin"]),
    ).first()
    return member is not None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/api/workspaces/{workspace_id}/checkout")
def checkout(
    workspace_id: int,
    payload: CheckoutRequestModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Simulate checkout: validate pricing, create invoice, upgrade workspace tier."""
    tier = payload.tier.lower().strip()
    cycle = payload.billing_cycle.lower().strip()
    method = payload.payment_method or "qris"

    if tier not in PRICING:
        raise HTTPException(status_code=422, detail="Tier tidak valid. Pilih 'pro' atau 'business'.")
    if cycle not in ("monthly", "yearly"):
        raise HTTPException(status_code=422, detail="Siklus penagihan tidak valid. Pilih 'monthly' atau 'yearly'.")

    # Authorization: only workspace owner can checkout
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace tidak ditemukan.")
    if ws.owner_username != current_user:
        raise HTTPException(status_code=403, detail="Hanya pemilik workspace yang dapat melakukan checkout.")

    monthly_rate = PRICING[tier][cycle]
    amount = monthly_rate * 12 if cycle == "yearly" else monthly_rate

    # Generate unique invoice number
    inv_number = _invoice_number()
    while db.query(Invoice).filter(Invoice.invoice_number == inv_number).first():
        inv_number = _invoice_number()

    now = datetime.utcnow()
    invoice = Invoice(
        invoice_number=inv_number,
        workspace_id=workspace_id,
        username=current_user,
        tier=tier,
        billing_cycle=cycle,
        amount=amount,
        status="paid",
        payment_method=method,
        created_at=now,
        paid_at=now,
    )
    db.add(invoice)

    # Account-wide subscription: upgrade ALL workspaces owned by this user
    owned_workspaces = db.query(Workspace).filter(Workspace.owner_username == current_user).all()
    for owned_ws in owned_workspaces:
        # Only upgrade if new tier is "higher" than existing
        tier_rank = {"free": 0, "pro": 1, "business": 2}
        if tier_rank.get(tier, 0) >= tier_rank.get(owned_ws.tier or "free", 0):
            owned_ws.tier = tier

    db.commit()
    db.refresh(invoice)

    # Notification
    tier_label = TIER_LABELS.get(tier, tier.capitalize())
    create_notification(
        db,
        current_user,
        f"Pembayaran berhasil! Workspace '{ws.name}' kini berlangganan paket {tier_label}. No. Faktur: {inv_number}.",
        "billing_success",
        None,
    )

    return {
        "message": f"Pembayaran berhasil! Workspace berhasil diupgrade ke paket {tier_label}.",
        "invoice": {
            "invoice_number": invoice.invoice_number,
            "workspace_id": invoice.workspace_id,
            "username": invoice.username,
            "tier": invoice.tier,
            "tier_label": tier_label,
            "billing_cycle": invoice.billing_cycle,
            "amount": invoice.amount,
            "status": invoice.status,
            "payment_method": PAYMENT_LABELS.get(method, method),
            "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else None,
        },
    }


@router.get("/api/workspaces/{workspace_id}/invoices")
def list_invoices(
    workspace_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns all invoices for this workspace (owner or admin only)."""
    if not _is_workspace_admin_or_owner(db, workspace_id, current_user):
        raise HTTPException(status_code=403, detail="Akses ditolak.")

    invoices = (
        db.query(Invoice)
        .filter(Invoice.workspace_id == workspace_id)
        .order_by(Invoice.created_at.desc())
        .all()
    )
    return {"invoices": [
        {
            "invoice_number": inv.invoice_number,
            "workspace_id": inv.workspace_id,
            "username": inv.username,
            "tier": inv.tier,
            "tier_label": TIER_LABELS.get(inv.tier, inv.tier.capitalize()),
            "billing_cycle": inv.billing_cycle,
            "amount": inv.amount,
            "status": inv.status,
            "payment_method": PAYMENT_LABELS.get(inv.payment_method, inv.payment_method),
            "created_at": inv.created_at.isoformat() if inv.created_at else None,
            "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
        }
        for inv in invoices
    ]}


@router.get("/api/invoices/{invoice_number}")
def get_invoice(
    invoice_number: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns full invoice details for receipt printing."""
    inv = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Faktur tidak ditemukan.")
    if inv.username != current_user and not _is_workspace_admin_or_owner(db, inv.workspace_id, current_user):
        raise HTTPException(status_code=403, detail="Akses ditolak.")

    ws = db.query(Workspace).filter(Workspace.id == inv.workspace_id).first()
    return {
        "invoice_number": inv.invoice_number,
        "workspace_id": inv.workspace_id,
        "workspace_name": ws.name if ws else "—",
        "username": inv.username,
        "tier": inv.tier,
        "tier_label": TIER_LABELS.get(inv.tier, inv.tier.capitalize()),
        "billing_cycle": inv.billing_cycle,
        "amount": inv.amount,
        "status": inv.status,
        "payment_method": PAYMENT_LABELS.get(inv.payment_method, inv.payment_method),
        "created_at": inv.created_at.isoformat() if inv.created_at else None,
        "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
    }
