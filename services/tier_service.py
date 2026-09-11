"""
services/tier_service.py
Monetization & Tier Packaging Enforcement Engine for alurku.
Implements quota thresholds, usage calculations, and security guard checks.
"""

from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from database import Workspace, WorkspaceMember, Board, Request, TaskAttachment, SecurityLog, get_security_log, set_security_log


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


def get_workspace_usage_summary(db: Session, workspace_id: int, username: str) -> Dict[str, Any]:
    """
    Returns full telemetry of limits vs active usage for the given workspace.
    """
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace tidak ditemukan.")

    tier = getattr(workspace, "tier", "free") or "free"
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
    # If user owns workspaces, find their highest tier workspace
    user_workspaces = db.query(Workspace).filter(Workspace.owner_username == username).all()
    highest_tier = "free"
    for ws in user_workspaces:
        ws_tier = getattr(ws, "tier", "free") or "free"
        if ws_tier == "business":
            highest_tier = "business"
            break
        elif ws_tier == "pro":
            highest_tier = "pro"

    cfg = get_tier_config(highest_tier)
    max_ws = cfg["max_workspaces_owned"]

    if max_ws is not None and owned_count >= max_ws:
        raise HTTPException(
            status_code=403,
            detail=f"Batas Paket Tercapai: Paket Anda ({cfg['tier_name']}) hanya mengizinkan maksimal {max_ws} Workspace. Silakan tingkatkan ke Pro atau Business untuk menambah ruang kerja."
        )


def enforce_can_invite_member(db: Session, workspace: Workspace):
    """Guards against exceeding member count limit in the workspace."""
    tier = getattr(workspace, "tier", "free") or "free"
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

    tier = getattr(workspace, "tier", "free") or "free"
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

    tier = getattr(workspace, "tier", "free") or "free"
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
