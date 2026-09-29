"""
routers/webhooks.py
Outgoing Webhook system for alurku.
Supports CRUD webhooks, HMAC-SHA256 signed event dispatching, test-ping, delivery logs.
"""
import json
import hmac
import hashlib
import threading
from datetime import datetime
from typing import List, Optional

import requests as http_requests
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db, Webhook, WebhookDelivery, Workspace, WorkspaceMember
from schemas import WebhookCreateModel, WebhookUpdateModel
from dependencies import get_current_user

router = APIRouter()


def _is_workspace_admin(db: Session, workspace_id: int, username: str) -> bool:
    """Check if user is owner or admin of workspace."""
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if ws and ws.owner_username == username:
        return True
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == username,
        WorkspaceMember.role == "admin",
    ).first()
    return member is not None


def _get_webhook_or_403(db: Session, webhook_id: int, username: str) -> Webhook:
    wh = db.query(Webhook).filter(Webhook.id == webhook_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Webhook tidak ditemukan.")
    if not _is_workspace_admin(db, wh.workspace_id, username):
        raise HTTPException(status_code=403, detail="Akses ditolak.")
    return wh


def _fire_webhook(db_factory, webhook_id: int, event_type: str, payload: dict):
    """Background function: sends HTTP POST to webhook URL and records delivery."""
    db = db_factory()
    try:
        wh = db.query(Webhook).filter(Webhook.id == webhook_id).first()
        if not wh or not wh.is_active:
            return

        body = json.dumps(payload, default=str)
        headers = {
            "Content-Type": "application/json",
            "X-Alurku-Event": event_type,
            "X-Alurku-Timestamp": datetime.utcnow().isoformat(),
        }
        if wh.secret:
            sig = hmac.new(wh.secret.encode(), body.encode(), hashlib.sha256).hexdigest()
            headers["X-Alurku-Signature"] = f"sha256={sig}"

        status_code = None
        response_body = None
        success = 0
        try:
            resp = http_requests.post(wh.url, data=body, headers=headers, timeout=10)
            status_code = resp.status_code
            response_body = resp.text[:2000]
            success = 1 if 200 <= resp.status_code < 300 else 0
        except Exception as exc:
            response_body = str(exc)[:500]

        delivery = WebhookDelivery(
            webhook_id=webhook_id,
            event_type=event_type,
            payload=body,
            response_status=status_code,
            response_body=response_body,
            success=success,
        )
        db.add(delivery)
        db.commit()
    except Exception:
        pass
    finally:
        db.close()


def dispatch_webhook_event(db: Session, workspace_id: int, event_type: str, payload: dict):
    """Dispatch event to all active webhooks in workspace subscribing to this event type."""
    from database import SessionLocal
    webhooks = db.query(Webhook).filter(
        Webhook.workspace_id == workspace_id,
        Webhook.is_active == 1,
    ).all()
    for wh in webhooks:
        try:
            subscribed = json.loads(wh.events or "[]")
        except Exception:
            subscribed = []
        # Empty list or '*' means subscribe to all
        if not subscribed or "*" in subscribed or event_type in subscribed:
            t = threading.Thread(
                target=_fire_webhook,
                args=(SessionLocal, wh.id, event_type, payload),
                daemon=True,
            )
            t.start()


# ── CRUD Endpoints ───────────────────────────────────────────────────────────

@router.get("/api/workspaces/{workspace_id}/webhooks")
def list_webhooks(
    workspace_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not _is_workspace_admin(db, workspace_id, current_user):
        raise HTTPException(status_code=403, detail="Akses ditolak. Hanya admin atau owner workspace yang dapat mengelola webhook.")
    webhooks = db.query(Webhook).filter(Webhook.workspace_id == workspace_id).order_by(Webhook.created_at.desc()).all()
    return {"webhooks": [
        {
            "id": wh.id,
            "url": wh.url,
            "events": json.loads(wh.events or "[]"),
            "is_active": wh.is_active,
            "created_at": wh.created_at.isoformat() if wh.created_at else None,
        }
        for wh in webhooks
    ]}


@router.post("/api/workspaces/{workspace_id}/webhooks")
def create_webhook(
    workspace_id: int,
    payload: WebhookCreateModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not _is_workspace_admin(db, workspace_id, current_user):
        raise HTTPException(status_code=403, detail="Akses ditolak.")
    if not payload.url.startswith("http"):
        raise HTTPException(status_code=422, detail="URL webhook harus dimulai dengan http:// atau https://")

    events_json = json.dumps(payload.events or [])
    wh = Webhook(
        workspace_id=workspace_id,
        url=payload.url,
        secret=payload.secret,
        events=events_json,
        is_active=payload.is_active if payload.is_active is not None else 1,
    )
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return {
        "message": "Webhook berhasil dibuat.",
        "webhook": {
            "id": wh.id,
            "url": wh.url,
            "events": json.loads(wh.events or "[]"),
            "is_active": wh.is_active,
            "created_at": wh.created_at.isoformat() if wh.created_at else None,
        }
    }


@router.put("/api/webhooks/{webhook_id}")
def update_webhook(
    webhook_id: int,
    payload: WebhookUpdateModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wh = _get_webhook_or_403(db, webhook_id, current_user)
    if payload.url is not None:
        if not payload.url.startswith("http"):
            raise HTTPException(status_code=422, detail="URL webhook harus dimulai dengan http:// atau https://")
        wh.url = payload.url
    if payload.secret is not None:
        wh.secret = payload.secret
    if payload.events is not None:
        wh.events = json.dumps(payload.events)
    if payload.is_active is not None:
        wh.is_active = payload.is_active
    db.commit()
    return {"message": "Webhook diperbarui.", "webhook_id": wh.id}


@router.delete("/api/webhooks/{webhook_id}")
def delete_webhook(
    webhook_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wh = _get_webhook_or_403(db, webhook_id, current_user)
    db.delete(wh)
    db.commit()
    return {"message": "Webhook dihapus."}


@router.post("/api/webhooks/{webhook_id}/test-ping")
def test_ping_webhook(
    webhook_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wh = _get_webhook_or_403(db, webhook_id, current_user)
    payload = {
        "event": "ping",
        "message": "Test ping dari alurku. Webhook System",
        "workspace_id": wh.workspace_id,
        "webhook_id": wh.id,
        "timestamp": datetime.utcnow().isoformat(),
    }
    body = json.dumps(payload)
    headers = {
        "Content-Type": "application/json",
        "X-Alurku-Event": "ping",
    }
    if wh.secret:
        sig = hmac.new(wh.secret.encode(), body.encode(), hashlib.sha256).hexdigest()
        headers["X-Alurku-Signature"] = f"sha256={sig}"

    status_code = None
    response_body = "Timeout atau URL tidak dapat dijangkau."
    success = 0
    try:
        resp = http_requests.post(wh.url, data=body, headers=headers, timeout=8)
        status_code = resp.status_code
        response_body = resp.text[:500]
        success = 1 if 200 <= resp.status_code < 300 else 0
    except Exception as exc:
        response_body = str(exc)[:500]

    # Record delivery
    delivery = WebhookDelivery(
        webhook_id=webhook_id,
        event_type="ping",
        payload=body,
        response_status=status_code,
        response_body=response_body,
        success=success,
    )
    db.add(delivery)
    db.commit()

    return {
        "success": bool(success),
        "status_code": status_code,
        "response": response_body,
    }


@router.get("/api/webhooks/{webhook_id}/deliveries")
def get_webhook_deliveries(
    webhook_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_webhook_or_403(db, webhook_id, current_user)
    deliveries = (
        db.query(WebhookDelivery)
        .filter(WebhookDelivery.webhook_id == webhook_id)
        .order_by(WebhookDelivery.created_at.desc())
        .limit(20)
        .all()
    )
    return {"deliveries": [
        {
            "id": d.id,
            "event_type": d.event_type,
            "response_status": d.response_status,
            "success": bool(d.success),
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in deliveries
    ]}
