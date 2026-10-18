"""
services/tier_service.py
Monetization & Tier Packaging Enforcement Engine for alurku.
Implements quota thresholds, usage calculations, and security guard checks.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from database import Workspace, WorkspaceMember, Board, Request, TaskAttachment, SecurityLog, get_security_log, set_security_log

# Grace Period policy: 3 days after subscription_expires_at before hard downgrade to Free
GRACE_PERIOD_DAYS = 3

# Official Tier Limits Matrix based on alurku-pricing-and-packaging specification
TIER_LIMITS: Dict[str, Dict[str, Any]] = {
    "free": {
        "tier_name": "Gratis (Starter)",
        "max_workspaces_owned": 1,
        "max_members_per_workspace": 3,
        "max_projects_per_workspace": 3,
        "max_storage_bytes": 500 * 1024 * 1024,  # 500 MB
        "max_ai_requests_monthly": 50,
        "allowed_views": ["kanban", "list", "calendar"],
        "has_gantt": False,
        "has_workload_analytics": False,
        "has_custom_roles": False,
    },
    "pro": {
        "tier_name": "Pro (Agile Team)",
        "max_workspaces_owned": 3,
        "max_members_per_workspace": 25,
        "max_projects_per_workspace": None,  # Unlimited
        "max_storage_bytes": 15 * 1024 * 1024 * 1024,  # 15 GB
        "max_ai_requests_monthly": 1500,
        "allowed_views": ["kanban", "list", "calendar", "timeline", "analytics"],
        "has_gantt": True,
        "has_workload_analytics": True,
        "has_custom_roles": False,
    },
    "business": {
        "tier_name": "Business (Scale)",
        "max_workspaces_owned": None,  # Unlimited
        "max_members_per_workspace": None,  # Unlimited
        "max_projects_per_workspace": None,  # Unlimited
        "max_storage_bytes": 100 * 1024 * 1024 * 1024,  # 100 GB
        "max_ai_requests_monthly": 5000,
        "allowed_views": ["kanban", "list", "calendar", "timeline", "analytics"],
        "has_gantt": True,
        "has_workload_analytics": True,
        "has_custom_roles": True,
    },
}


def get_tier_config(tier: Optional[str]) -> Dict[str, Any]:
    """Returns the limit configuration dict for a given tier string."""
    normalized = (tier or "free").lower().strip()
    return TIER_LIMITS.get(normalized, TIER_LIMITS["free"])


def get_current_month_key() -> str:
    """Returns current year-month string, e.g. '2026-09'."""
    return datetime.utcnow().strftime("%Y-%m")


def get_user_ai_usage_month(db: Session, username: str) -> int:
    """Gets total AI requests consumed by user in the current calendar month."""
    month_key = get_current_month_key()
    sec_key = f"ai_quota:{username}:{month_key}"
    return int(get_security_log(db, sec_key, 0))


def increment_user_ai_usage_month(db: Session, username: str) -> int:
    """Increments user's monthly AI requests counter."""
    month_key = get_current_month_key()
    sec_key = f"ai_quota:{username}:{month_key}"
    current_count = int(get_security_log(db, sec_key, 0))
    new_count = current_count + 1
    set_security_log(db, sec_key, new_count)
    return new_count


def get_workspace_storage_usage_bytes(db: Session, workspace_id: int) -> int:
    """Calculates total bytes occupied by task attachments in a workspace."""
    # Find all requests (tasks) in this workspace
    total_bytes = (
        db.query(func.coalesce(func.sum(TaskAttachment.file_size), 0))
        .join(Request, TaskAttachment.task_id == Request.id)
        .filter(Request.workspace_id == workspace_id)
        .scalar()
    )
    return int(total_bytes or 0)


def get_user_highest_tier(db: Session, username: str) -> str:
    """Finds the user's highest tier across all workspaces they own, verifying expiration & grace period."""
    user_workspaces = db.query(Workspace).filter(Workspace.owner_username == username).all()
    now = datetime.utcnow()
    highest_tier = "free"
    for ws in user_workspaces:
        # If workspace subscription has expired past the 3-day grace period, it does not grant paid tier
        if getattr(ws, "subscription_expires_at", None):
            grace_deadline = ws.subscription_expires_at + timedelta(days=GRACE_PERIOD_DAYS)
            if now > grace_deadline:
                continue
        ws_tier = (getattr(ws, "tier", "free") or "free").lower().strip()
        if ws_tier == "business":
            return "business"
        elif ws_tier == "pro":
            highest_tier = "pro"
    return highest_tier


def get_effective_workspace_tier(db: Session, workspace: Workspace) -> str:
    """
    Returns the effective tier for a workspace.
    In alurku's account-wide subscription model, every workspace owned by a user
    inherits the highest tier of that owner's subscription.
    Also verifies whether the subscription has expired or is currently in 3-day grace period.
    """
    if not workspace:
        return "free"

    now = datetime.utcnow()
    # Check if this workspace subscription has passed expiration date
    if getattr(workspace, "subscription_expires_at", None) and workspace.subscription_expires_at < now:
        grace_deadline = workspace.subscription_expires_at + timedelta(days=GRACE_PERIOD_DAYS)
        if now <= grace_deadline:
            # Within Grace Period (3 days): keep active paid tier, update status to grace_period
            if getattr(workspace, "subscription_status", "active") != "grace_period":
                workspace.subscription_status = "grace_period"
                try:
                    db.commit()
                except Exception:
                    db.rollback()
        else:
            # Past grace period: hard downgrade to free
            if workspace.tier != "free" or getattr(workspace, "subscription_status", "active") != "expired":
                workspace.tier = "free"
                workspace.subscription_status = "expired"
                try:
                    db.commit()
                except Exception:
                    db.rollback()

    direct_tier = (getattr(workspace, "tier", "free") or "free").lower().strip()
    if direct_tier == "business":
        return "business"

    if workspace.owner_username:
        owner_tier = get_user_highest_tier(db, workspace.owner_username)
        tier_hierarchy = {"free": 0, "pro": 1, "business": 2}
        if tier_hierarchy.get(owner_tier, 0) > tier_hierarchy.get(direct_tier, 0):
            # Sync to DB so it persists and UI/meters see the same tier
            workspace.tier = owner_tier
            try:
                db.commit()
            except Exception:
                db.rollback()
            return owner_tier
        elif tier_hierarchy.get(owner_tier, 0) < tier_hierarchy.get(direct_tier, 0):
            # If owner's tier dropped to free (e.g. expired past grace period), sync workspace down
            workspace.tier = owner_tier
            try:
                db.commit()
            except Exception:
                db.rollback()
            return owner_tier

    return direct_tier


def check_and_expire_workspace_subscriptions(db: Session) -> int:
    """
    Checks all workspaces where tier is pro or business, and subscription_expires_at < now.
    - If now <= expires_at + 3 days: transitions to 'grace_period' and notifies owner.
    - If now > expires_at + 3 days: sets tier='free', subscription_status='expired', and notifies owner.
    Returns the total number of workspaces downgraded to Free.
    """
    now = datetime.utcnow()
    expired_workspaces = (
        db.query(Workspace)
        .filter(
            or_(
                Workspace.tier.in_(["pro", "business"]),
                Workspace.subscription_status == "grace_period",
            ),
            Workspace.subscription_expires_at.isnot(None),
            Workspace.subscription_expires_at < now,
        )
        .all()
    )
    downgraded_count = 0
    for ws in expired_workspaces:
        grace_deadline = ws.subscription_expires_at + timedelta(days=GRACE_PERIOD_DAYS)
        if now <= grace_deadline:
            # Within Grace Period (3 days)
            if ws.subscription_status != "grace_period":
                ws.subscription_status = "grace_period"
                try:
                    from utils import create_notification
                    days_left = max(0, (grace_deadline - now).days)
                    create_notification(
                        db,
                        ws.owner_username,
                        f"Masa aktif langganan paket {ws.tier.capitalize()} untuk ruang kerja '{ws.name}' telah berakhir dan memasuki Masa Tenggang (Grace Period {days_left} hari tersisa). Perpanjang sekarang agar akses tidak terputus.",
                        "subscription_grace_period",
                        None,
                    )
                except Exception:
                    pass
        else:
            # Past grace period -> Downgrade to Free
            old_tier = ws.tier
            ws.tier = "free"
            ws.subscription_status = "expired"
            downgraded_count += 1
            try:
                from utils import create_notification
                create_notification(
                    db,
                    ws.owner_username,
                    f"Masa tenggang (Grace Period) langganan paket {old_tier.capitalize()} untuk ruang kerja '{ws.name}' telah berakhir. Ruang kerja telah dialihkan ke paket Gratis.",
                    "subscription_expired",
                    None,
                )
            except Exception:
                pass

    if len(expired_workspaces) > 0:
        try:
            db.commit()
        except Exception:
            db.rollback()
    return downgraded_count


def send_subscription_due_reminders(db: Session) -> Dict[str, int]:
    """
    Scans active subscriptions expiring in 7 days (H-7) or 3 days (H-3)
    and sends proactive reminder notifications to workspace owners.
    Deduplicates using SecurityLog to prevent duplicate notifications on the same date.
    """
    now = datetime.utcnow()
    active_workspaces = (
        db.query(Workspace)
        .filter(
            Workspace.tier.in_(["pro", "business"]),
            Workspace.subscription_expires_at.isnot(None),
            Workspace.subscription_expires_at > now,
        )
        .all()
    )

    h7_count = 0
    h3_count = 0

    for ws in active_workspaces:
        days_left = (ws.subscription_expires_at - now).days
        exp_date_str = ws.subscription_expires_at.strftime("%Y-%m-%d")
        tier_label = ws.tier.capitalize()

        if days_left == 7:
            dedup_key = f"sub_reminder_h7:{ws.id}:{exp_date_str}"
            if not get_security_log(db, dedup_key):
                try:
                    from utils import create_notification
                    create_notification(
                        db,
                        ws.owner_username,
                        f"Pengingat: Langganan paket {tier_label} untuk ruang kerja '{ws.name}' akan berakhir dalam 7 hari ({exp_date_str}). Perpanjang langganan Anda agar alur kerja tetap lancar.",
                        "subscription_reminder_h7",
                        None,
                    )
                    set_security_log(db, dedup_key, 1)
                    h7_count += 1
                except Exception:
                    pass

        elif days_left == 3:
            dedup_key = f"sub_reminder_h3:{ws.id}:{exp_date_str}"
            if not get_security_log(db, dedup_key):
                try:
                    from utils import create_notification
                    create_notification(
                        db,
                        ws.owner_username,
                        f"Perhatian: Langganan paket {tier_label} untuk ruang kerja '{ws.name}' akan berakhir dalam 3 hari ({exp_date_str}). Segera perpanjang untuk menghindari gangguan layanan.",
                        "subscription_reminder_h3",
                        None,
                    )
                    set_security_log(db, dedup_key, 1)
                    h3_count += 1
                except Exception:
                    pass

    return {"h7_reminders_sent": h7_count, "h3_reminders_sent": h3_count}


def sync_all_users_workspace_tiers(db: Session):
    """
    Data migration/sync helper: ensures all workspaces owned by any user
    are upgraded to that owner's highest tier.
    """
    workspaces = db.query(Workspace).all()
    owners = set(ws.owner_username for ws in workspaces if ws.owner_username)
    for owner in owners:
        highest = get_user_highest_tier(db, owner)
        if highest in ("pro", "business"):
            owned = db.query(Workspace).filter(Workspace.owner_username == owner).all()
            for ws in owned:
                if ws.tier != highest:
                    ws.tier = highest
    try:
        db.commit()
    except Exception:
        db.rollback()


def get_workspace_usage_summary(db: Session, workspace_id: int, username: str) -> Dict[str, Any]:
    """
    Returns full telemetry of limits vs active usage for the given workspace.
    """
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace tidak ditemukan.")

    tier = get_effective_workspace_tier(db, workspace)
    cfg = get_tier_config(tier)

    # Active members count
    member_count = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace_id).count()

    # Active projects (boards) count - exclude personal to-do list from project cap count
    projects_count = (
        db.query(Board)
        .filter(
            Board.workspace_id == workspace_id,
            or_(Board.is_archived == 0, Board.is_archived == None),
            or_(Board.is_private == 0, Board.is_private == None),
        )
        .count()
    )

    # Total file attachments storage in bytes
    storage_used_bytes = get_workspace_storage_usage_bytes(db, workspace_id)

    # User monthly AI requests count
    ai_requests_used = get_user_ai_usage_month(db, username)

    # Owned workspaces count by this owner
    owned_workspaces_count = db.query(Workspace).filter(Workspace.owner_username == workspace.owner_username).count()

    return {
        "workspace_id": workspace.id,
        "workspace_name": workspace.name,
        "owner_username": workspace.owner_username,
        "tier": tier,
        "tier_name": cfg["tier_name"],
        "members": {
            "used": member_count,
            "max": cfg["max_members_per_workspace"],
            "is_unlimited": cfg["max_members_per_workspace"] is None,
        },
        "projects": {
            "used": projects_count,
            "max": cfg["max_projects_per_workspace"],
            "is_unlimited": cfg["max_projects_per_workspace"] is None,
        },
        "storage": {
            "used_bytes": storage_used_bytes,
            "used_mb": round(storage_used_bytes / (1024 * 1024), 1),
            "max_bytes": cfg["max_storage_bytes"],
            "max_mb": round(cfg["max_storage_bytes"] / (1024 * 1024), 1),
            "percentage": min(round((storage_used_bytes / cfg["max_storage_bytes"]) * 100, 1), 100.0) if cfg["max_storage_bytes"] else 0,
        },
        "ai_requests": {
            "used": ai_requests_used,
            "max": cfg["max_ai_requests_monthly"],
            "percentage": min(round((ai_requests_used / cfg["max_ai_requests_monthly"]) * 100, 1), 100.0) if cfg["max_ai_requests_monthly"] else 0,
            "month": get_current_month_key(),
        },
        "workspaces_owned": {
            "used": owned_workspaces_count,
            "max": cfg["max_workspaces_owned"],
            "is_unlimited": cfg["max_workspaces_owned"] is None,
        },
        "features": {
            "has_gantt": cfg["has_gantt"],
            "has_workload_analytics": cfg["has_workload_analytics"],
            "has_custom_roles": cfg["has_custom_roles"],
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# Quota Enforcers / Limit Guards
# ─────────────────────────────────────────────────────────────────────────────

def enforce_can_create_workspace(db: Session, username: str):
    """Guards against exceeding maximum owned workspaces count."""
    owned_count = db.query(Workspace).filter(Workspace.owner_username == username).count()
    highest_tier = get_user_highest_tier(db, username)
    cfg = get_tier_config(highest_tier)
    max_ws = cfg["max_workspaces_owned"]

    if max_ws is not None and owned_count >= max_ws:
        raise HTTPException(
            status_code=403,
            detail=f"Batas Paket Tercapai: Paket Anda ({cfg['tier_name']}) hanya mengizinkan maksimal {max_ws} Workspace. Silakan tingkatkan ke Pro atau Business untuk menambah ruang kerja."
        )


def enforce_can_invite_member(db: Session, workspace: Workspace):
    """Guards against exceeding member count limit in the workspace."""
    tier = get_effective_workspace_tier(db, workspace)
    cfg = get_tier_config(tier)
    max_members = cfg["max_members_per_workspace"]

    if max_members is not None:
        current_members = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace.id).count()
        if current_members >= max_members:
            raise HTTPException(
                status_code=403,
                detail=f"Batas Anggota Tercapai: Ruang kerja paket {cfg['tier_name']} memiliki batas maksimal {max_members} anggota tim. Tingkatkan ke Paket Pro untuk berkolaborasi hingga 25 anggota!"
            )


def enforce_can_create_project(db: Session, workspace_id: int):
    """Guards against exceeding active projects/boards limit in the workspace."""
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        return

    tier = get_effective_workspace_tier(db, workspace)
    cfg = get_tier_config(tier)
    max_projects = cfg["max_projects_per_workspace"]

    if max_projects is not None:
        current_projects = (
            db.query(Board)
            .filter(
                Board.workspace_id == workspace_id,
                or_(Board.is_archived == 0, Board.is_archived == None),
                or_(Board.is_private == 0, Board.is_private == None),
            )
            .count()
        )
        if current_projects >= max_projects:
            raise HTTPException(
                status_code=403,
                detail=f"Batas Proyek Tercapai: Paket {cfg['tier_name']} dibatasi maksimal {max_projects} proyek aktif. Tingkatkan ke Paket Pro untuk membuat proyek tanpa batas (Unlimited Projects)!"
            )


def enforce_can_upload_storage(db: Session, workspace_id: int, incoming_bytes: int):
    """Guards against exceeding workspace attachments storage capacity."""
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        return

    tier = get_effective_workspace_tier(db, workspace)
    cfg = get_tier_config(tier)
    max_bytes = cfg["max_storage_bytes"]

    current_bytes = get_workspace_storage_usage_bytes(db, workspace_id)
    if (current_bytes + incoming_bytes) > max_bytes:
        max_mb = round(max_bytes / (1024 * 1024), 0)
        raise HTTPException(
            status_code=403,
            detail=f"Kapasitas Penyimpanan Penuh: Total file lampiran di ruang kerja ini telah mencapai batas kuota {max_mb} MB ({cfg['tier_name']}). Tingkatkan paket Anda untuk mendapatkan kapasitas hingga 15 GB!"
        )


def enforce_can_use_ai(db: Session, username: str, tier: str = "free"):
    """Guards against exceeding user monthly AI requests limit."""
    cfg = get_tier_config(tier)
    max_reqs = cfg["max_ai_requests_monthly"]

    used_reqs = get_user_ai_usage_month(db, username)
    if used_reqs >= max_reqs:
        raise HTTPException(
            status_code=403,
            detail=f"Kuota AI Bulanan Habis: Anda telah menggunakan {used_reqs}/{max_reqs} kuota AI bulan ini ({cfg['tier_name']}). Kuota akan diperbarui awal bulan depan, atau Anda dapat meningkatkan ke Paket Pro (1.500 requests/bln)!"
        )
