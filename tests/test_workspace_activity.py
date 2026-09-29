"""
tests/test_workspace_activity.py
Tests for the enhanced workspace activity endpoint with filtering and pagination.
"""
import pytest
from fastapi.testclient import TestClient
from backend_api import app
from database import SessionLocal, User, Workspace, WorkspaceMember
from dependencies import get_password_hash


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def activity_token_ws(client):
    username = "activity_test_user_77"
    password = "actpass777"
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            user = User(username=username, email=f"{username}@example.com",
                        full_name="Activity Test User",
                        password=get_password_hash(password), is_verified=1)
            db.add(user)
            db.commit()

        ws = db.query(Workspace).filter(Workspace.owner_username == username).first()
        if not ws:
            ws = Workspace(name="Activity WS", owner_username=username)
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


def test_activity_feed_returns_structured_response(client, activity_token_ws):
    """Should return {activities, total, page, limit} structure."""
    token, ws_id = activity_token_ws
    resp = client.get(
        f"/api/workspaces/{ws_id}/activity",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "activities" in data
    assert "total" in data
    assert "page" in data
    assert "limit" in data


def test_activity_pagination(client, activity_token_ws):
    """Pagination with page=1 and limit=5 should return at most 5 items."""
    token, ws_id = activity_token_ws
    resp = client.get(
        f"/api/workspaces/{ws_id}/activity?page=1&limit=5",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["limit"] == 5
    assert data["page"] == 1
    assert len(data["activities"]) <= 5


def test_activity_action_filter(client, activity_token_ws):
    """Filtering by action should only return matching activities."""
    token, ws_id = activity_token_ws
    resp = client.get(
        f"/api/workspaces/{ws_id}/activity?action=task_created",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    for act in data["activities"]:
        assert act["action"] == "task_created"


def test_activity_access_denied_non_member(client, activity_token_ws):
    """Non-member should get 403."""
    _, ws_id = activity_token_ws
    username2 = "outsider_activity_22"
    db = SessionLocal()
    try:
        user2 = db.query(User).filter(User.username == username2).first()
        if not user2:
            user2 = User(username=username2, email=f"{username2}@example.com",
                         full_name="Outsider", password=get_password_hash("pass"), is_verified=1)
            db.add(user2)
            db.commit()
    finally:
        db.close()
    resp2 = client.post("/api/login", json={"username": username2, "password": "pass"})
    token2 = resp2.json()["token"]

    resp = client.get(
        f"/api/workspaces/{ws_id}/activity",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert resp.status_code == 403, resp.text
