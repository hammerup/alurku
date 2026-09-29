"""
tests/test_webhooks.py
Unit tests for the Webhook system in alurku.
"""
import json
import pytest
from fastapi.testclient import TestClient
from backend_api import app
from database import SessionLocal, User, Workspace, WorkspaceMember, Webhook, WebhookDelivery
from dependencies import get_password_hash


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def token_and_workspace(client):
    """Register a test user, create workspace, and return (token, workspace_id)."""
    username = "wh_test_user_88"
    password = "testpass123"
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            user = User(
                username=username,
                email=f"{username}@example.com",
                full_name="Webhook Test User",
                password=get_password_hash(password),
                is_verified=1,
            )
            db.add(user)
            db.commit()

        ws = db.query(Workspace).filter(Workspace.owner_username == username).first()
        if not ws:
            ws = Workspace(name="WH Test Workspace", owner_username=username)
            db.add(ws)
            db.flush()
            member = WorkspaceMember(workspace_id=ws.id, username=username, role="admin")
            db.add(member)
            db.commit()
        workspace_id = ws.id
    finally:
        db.close()

    resp = client.post("/api/login", json={"username": username, "password": password})
    assert resp.status_code == 200, resp.text
    token = resp.json()["token"]
    return token, workspace_id


def test_create_webhook(client, token_and_workspace):
    token, ws_id = token_and_workspace
    resp = client.post(
        f"/api/workspaces/{ws_id}/webhooks",
        json={"url": "https://example.com/hook", "events": ["task.created", "task.completed"]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "webhook" in data
    assert data["webhook"]["url"] == "https://example.com/hook"
    assert "task.created" in data["webhook"]["events"]


def test_list_webhooks(client, token_and_workspace):
    token, ws_id = token_and_workspace
    resp = client.get(
        f"/api/workspaces/{ws_id}/webhooks",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "webhooks" in data
    assert len(data["webhooks"]) >= 1


def test_update_webhook(client, token_and_workspace):
    token, ws_id = token_and_workspace
    # Get first webhook
    resp = client.get(f"/api/workspaces/{ws_id}/webhooks", headers={"Authorization": f"Bearer {token}"})
    webhook_id = resp.json()["webhooks"][0]["id"]

    resp = client.put(
        f"/api/webhooks/{webhook_id}",
        json={"url": "https://updated-url.com/hook", "is_active": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    assert "diperbarui" in resp.json()["message"]


def test_test_ping_webhook(client, token_and_workspace):
    token, ws_id = token_and_workspace
    # Re-activate and get webhook ID
    resp = client.get(f"/api/workspaces/{ws_id}/webhooks", headers={"Authorization": f"Bearer {token}"})
    webhook_id = resp.json()["webhooks"][0]["id"]
    # Reactivate
    client.put(f"/api/webhooks/{webhook_id}", json={"is_active": 1}, headers={"Authorization": f"Bearer {token}"})

    # Test ping (will likely fail HTTP since it's a test URL, but endpoint should return gracefully)
    resp = client.post(
        f"/api/webhooks/{webhook_id}/test-ping",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "success" in data


def test_webhook_deliveries(client, token_and_workspace):
    token, ws_id = token_and_workspace
    resp = client.get(f"/api/workspaces/{ws_id}/webhooks", headers={"Authorization": f"Bearer {token}"})
    webhook_id = resp.json()["webhooks"][0]["id"]

    resp = client.get(
        f"/api/webhooks/{webhook_id}/deliveries",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "deliveries" in data
    # Should have at least 1 delivery from test-ping above
    assert len(data["deliveries"]) >= 1


def test_delete_webhook(client, token_and_workspace):
    token, ws_id = token_and_workspace
    resp = client.get(f"/api/workspaces/{ws_id}/webhooks", headers={"Authorization": f"Bearer {token}"})
    webhook_id = resp.json()["webhooks"][0]["id"]

    resp = client.delete(
        f"/api/webhooks/{webhook_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    assert "dihapus" in resp.json()["message"]
