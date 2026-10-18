"""
routers/billing.py
Billing Checkout & Invoice generation simulator for alurku.
SSOT Pricing (per LandingPricingPage.jsx /harga):
  Pro:      Rp 79.000/bln (yearly) | Rp 99.000/bln (monthly)
  Business: Rp 199.000/bln (yearly) | Rp 249.000/bln (monthly)
"""
import os
import random
import json
import hmac
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Depends, Request, Header
from sqlalchemy.orm import Session

from database import get_db, Invoice, Workspace, WorkspaceMember, get_system_policies
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


def _verify_webhook_signature(
    payload_bytes: bytes,
    signature_header: Optional[str] = None,
    token_header: Optional[str] = None,
) -> bool:
    """
    Validates webhook authenticity via HMAC SHA-256 signature or shared secret token.
    Supported by Mayar, Midtrans, and standard payment gateways.
    """
    secret = (os.getenv("MAYAR_WEBHOOK_TOKEN") or os.getenv("MAYAR_API_KEY") or "").strip()
    if not secret:
        # If secret is not configured in environment, allow webhook in non-enforcing / development mode
        return True

    # 1. Direct token header comparison (x-callback-token or Authorization: Bearer <secret>)
    if token_header:
        cleaned_tok = token_header.replace("Bearer ", "").strip()
        if hmac.compare_digest(cleaned_tok, secret):
            return True

    # 2. Cryptographic HMAC SHA-256 signature verification (x-mayar-signature or x-signature)
    if signature_header:
        computed_sig = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
        if hmac.compare_digest(computed_sig.lower(), signature_header.strip().lower()):
            return True

    return False


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/api/workspaces/{workspace_id}/checkout")
def checkout(
    workspace_id: int,
    payload: CheckoutRequestModel,
    request: Request,
    idempotency_header: Optional[str] = Header(None, alias="Idempotency-Key"),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Simulate checkout: validate pricing, enforce idempotency & rate limits, record invoice with B2B tax details, upgrade subscription."""
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

    # 1. Idempotency Check: if identical idempotency_key was already processed, return existing invoice
    idempotency_key = (payload.idempotency_key or idempotency_header or "").strip() or None
    if idempotency_key:
        existing_invoice = db.query(Invoice).filter(
            Invoice.idempotency_key == idempotency_key,
            Invoice.workspace_id == workspace_id,
        ).first()
        if existing_invoice:
            tier_label = TIER_LABELS.get(existing_invoice.tier, existing_invoice.tier.capitalize())
            return {
                "message": f"Transaksi ini telah berhasil diproses sebelumnya (Idempotent).",
                "is_idempotent_replay": True,
                "invoice": {
                    "invoice_number": existing_invoice.invoice_number,
                    "workspace_id": existing_invoice.workspace_id,
                    "username": existing_invoice.username,
                    "tier": existing_invoice.tier,
                    "tier_label": tier_label,
                    "billing_cycle": existing_invoice.billing_cycle,
                    "subtotal": existing_invoice.subtotal if existing_invoice.subtotal is not None else existing_invoice.amount,
                    "tax_rate": existing_invoice.tax_rate if existing_invoice.tax_rate is not None else 0.0,
                    "tax_amount": existing_invoice.tax_amount if existing_invoice.tax_amount is not None else 0,
                    "amount": existing_invoice.amount,
                    "status": existing_invoice.status,
                    "payment_method": PAYMENT_LABELS.get(existing_invoice.payment_method, existing_invoice.payment_method),
                    "company_name": existing_invoice.company_name,
                    "tax_id": existing_invoice.tax_id,
                    "billing_address": existing_invoice.billing_address,
                    "paid_at": existing_invoice.paid_at.isoformat() if existing_invoice.paid_at else None,
                },
            }

    # 2. Rate Limiting: max 5 checkouts per 15 minutes per user
    now = datetime.utcnow()
    window_start = now - timedelta(minutes=15)
    recent_attempts = db.query(Invoice).filter(
        Invoice.username == current_user,
        Invoice.created_at >= window_start,
    ).count()
    if recent_attempts >= 5:
        raise HTTPException(
            status_code=429,
            detail="Terlalu banyak percobaan pembayaran dalam waktu singkat. Mohon tunggu 15 menit sebelum mencoba kembali.",
        )

    # Dynamic tax calculation from system policies (PPN %)
    policies = get_system_policies(db)
    tax_rate = float(policies.get("tax_rate_percent", 0) or 0)
    monthly_rate = PRICING[tier][cycle]
    subtotal = monthly_rate * 12 if cycle == "yearly" else monthly_rate
    tax_amount = int(round(subtotal * (tax_rate / 100.0)))
    total_amount = subtotal + tax_amount

    # Generate unique invoice number
    inv_number = _invoice_number()
    while db.query(Invoice).filter(Invoice.invoice_number == inv_number).first():
        inv_number = _invoice_number()

    client_ip = request.client.host if request.client else "unknown"
    company_name = (payload.company_name or "").strip() or None
    tax_id = (payload.tax_id or "").strip() or None
    billing_address = (payload.billing_address or "").strip() or None

    invoice = Invoice(
        invoice_number=inv_number,
        workspace_id=workspace_id,
        username=current_user,
        tier=tier,
        billing_cycle=cycle,
        subtotal=subtotal,
        tax_rate=tax_rate,
        tax_amount=tax_amount,
        amount=total_amount,
        status="paid",
        payment_method=method,
        idempotency_key=idempotency_key,
        client_ip=client_ip,
        company_name=company_name,
        tax_id=tax_id,
        billing_address=billing_address,
        created_at=now,
        paid_at=now,
    )
    db.add(invoice)

    # 3. Subscription Lifecycle Expiration calculation (+365 days for yearly, +30 days for monthly)
    expires_at = now + timedelta(days=365) if cycle == "yearly" else now + timedelta(days=30)

    # Account-wide subscription: upgrade ALL workspaces owned by this user
    owned_workspaces = db.query(Workspace).filter(Workspace.owner_username == current_user).all()
    for owned_ws in owned_workspaces:
        # Only upgrade if new tier is "higher" than existing
        tier_rank = {"free": 0, "pro": 1, "business": 2}
        if tier_rank.get(tier, 0) >= tier_rank.get(owned_ws.tier or "free", 0):
            owned_ws.tier = tier
            owned_ws.subscription_cycle = cycle
            owned_ws.subscription_status = "active"
            owned_ws.subscription_started_at = now
            owned_ws.subscription_expires_at = expires_at

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
        "subscription": {
            "tier": tier,
            "cycle": cycle,
            "status": "active",
            "started_at": now.isoformat(),
            "expires_at": expires_at.isoformat(),
            "days_remaining": (expires_at - now).days,
        },
        "invoice": {
            "invoice_number": invoice.invoice_number,
            "workspace_id": invoice.workspace_id,
            "username": invoice.username,
            "tier": invoice.tier,
            "tier_label": tier_label,
            "billing_cycle": invoice.billing_cycle,
            "subtotal": invoice.subtotal if invoice.subtotal is not None else invoice.amount,
            "tax_rate": invoice.tax_rate if invoice.tax_rate is not None else 0.0,
            "tax_amount": invoice.tax_amount if invoice.tax_amount is not None else 0,
            "amount": invoice.amount,
            "status": invoice.status,
            "payment_method": PAYMENT_LABELS.get(method, method),
            "company_name": invoice.company_name,
            "tax_id": invoice.tax_id,
            "billing_address": invoice.billing_address,
            "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else None,
        },
    }


@router.post("/api/billing/webhook")
@router.post("/api/billing/webhook/mayar")
async def billing_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_mayar_signature: Optional[str] = Header(None, alias="x-mayar-signature"),
    x_signature: Optional[str] = Header(None, alias="x-signature"),
    x_callback_token: Optional[str] = Header(None, alias="x-callback-token"),
    authorization: Optional[str] = Header(None, alias="authorization"),
):
    """
    Payment gateway webhook receiver (supports Mayar & generic webhooks).
    Validates cryptographic signature/token, activates subscription upon successful payment,
    and records invoice lifecycle transitions.
    """
    body_bytes = await request.body()
    sig = x_mayar_signature or x_signature
    tok = x_callback_token or authorization

    if not _verify_webhook_signature(body_bytes, sig, tok):
        raise HTTPException(status_code=401, detail="Verifikasi signature webhook pembayaran gagal.")

    try:
        payload = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
    except Exception:
        raise HTTPException(status_code=400, detail="Format JSON payload webhook tidak valid.")

    # Event extraction: supports Mayar format {event: "payment.received", data: {...}}
    # as well as flat format {event: "payment.received", invoice_number: "..."}
    event = (payload.get("event") or payload.get("status") or "").lower().strip()
    data = payload.get("data") if isinstance(payload.get("data"), dict) else payload

    inv_num = (
        data.get("invoice_number")
        or data.get("external_id")
        or data.get("order_id")
        or payload.get("invoice_number")
        or ""
    ).strip()

    if not inv_num:
        return {"status": "ok", "message": "Webhook ping/test diterima tanpa nomor faktur.", "event": event}

    invoice = db.query(Invoice).filter(Invoice.invoice_number == inv_num).first()
    if not invoice:
        invoice = db.query(Invoice).filter(Invoice.idempotency_key == inv_num).first()

    if not invoice:
        return {"status": "ignored", "message": f"Faktur '{inv_num}' tidak ditemukan.", "event": event}

    now = datetime.utcnow()

    # Success / Settlement events
    if event in ("payment.received", "payment.settled", "invoice.paid", "paid", "settlement", "success"):
        invoice.status = "paid"
        invoice.paid_at = now

        if data.get("payment_method"):
            invoice.payment_method = data.get("payment_method")

        # Expiration calculation (+365 days yearly, +30 days monthly)
        cycle = invoice.billing_cycle
        expires_at = now + timedelta(days=365) if cycle == "yearly" else now + timedelta(days=30)

        # Upgrade all workspaces of the owner
        owned_workspaces = db.query(Workspace).filter(Workspace.owner_username == invoice.username).all()
        tier_rank = {"free": 0, "pro": 1, "business": 2}
        for ws in owned_workspaces:
            if tier_rank.get(invoice.tier, 0) >= tier_rank.get(ws.tier or "free", 0):
                ws.tier = invoice.tier
                ws.subscription_cycle = cycle
                ws.subscription_status = "active"
                ws.subscription_started_at = now
                ws.subscription_expires_at = expires_at

        db.commit()

        tier_label = TIER_LABELS.get(invoice.tier, invoice.tier.capitalize())
        create_notification(
            db,
            invoice.username,
            f"Pembayaran diterima via Gateway! Ruang kerja kini aktif berlangganan paket {tier_label}. No. Faktur: {invoice.invoice_number}.",
            "billing_success",
            None,
        )

        return {
            "status": "ok",
            "message": "Pembayaran diverifikasi dan langganan berhasil diaktifkan.",
            "event": event,
            "invoice_number": invoice.invoice_number,
            "tier": invoice.tier,
            "invoice_status": invoice.status,
        }

    elif event in ("payment.failed", "invoice.expired", "expire", "cancel", "failed"):
        invoice.status = "failed"
        db.commit()
        return {
            "status": "ok",
            "message": "Status faktur ditandai gagal/kedaluwarsa.",
            "event": event,
            "invoice_number": invoice.invoice_number,
        }

    return {"status": "ok", "message": f"Event '{event}' diterima dan diabaikan.", "event": event}


@router.post("/api/billing/cron/process-expirations")
def process_expirations(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger periodic check to process grace periods, expirations, and H-7 / H-3 reminders."""
    from services.tier_service import check_and_expire_workspace_subscriptions, send_subscription_due_reminders
    expired_count = check_and_expire_workspace_subscriptions(db)
    reminders = send_subscription_due_reminders(db)
    return {
        "message": f"Pemeriksaan kedaluwarsa selesai. {expired_count} workspace diturunkan ke paket Gratis.",
        "expired_workspaces_count": expired_count,
        "reminders_sent": reminders,
        "checked_at": datetime.utcnow().isoformat(),
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
            "subtotal": inv.subtotal if inv.subtotal is not None else inv.amount,
            "tax_rate": inv.tax_rate if inv.tax_rate is not None else 0.0,
            "tax_amount": inv.tax_amount if inv.tax_amount is not None else 0,
            "amount": inv.amount,
            "status": inv.status,
            "payment_method": PAYMENT_LABELS.get(inv.payment_method, inv.payment_method),
            "company_name": inv.company_name,
            "tax_id": inv.tax_id,
            "billing_address": inv.billing_address,
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
    """Returns full invoice details with B2B tax information for receipt printing."""
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
        "subtotal": inv.subtotal if inv.subtotal is not None else inv.amount,
        "tax_rate": inv.tax_rate if inv.tax_rate is not None else 0.0,
        "tax_amount": inv.tax_amount if inv.tax_amount is not None else 0,
        "amount": inv.amount,
        "status": inv.status,
        "payment_method": PAYMENT_LABELS.get(inv.payment_method, inv.payment_method),
        "company_name": inv.company_name,
        "tax_id": inv.tax_id,
        "billing_address": inv.billing_address,
        "created_at": inv.created_at.isoformat() if inv.created_at else None,
        "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
    }
