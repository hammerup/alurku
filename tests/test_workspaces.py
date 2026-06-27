import pytest
from fastapi.testclient import TestClient
import sys
import os
import random

# Add root directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api import app

client = TestClient(app)


def test_workspace_lifecycle_and_tenant_isolation():
    # Generate unique test accounts to avoid db collisions
    rand_id = random.randint(1000, 9999)
    user_a = {
        "full_name": f"User Alpha {rand_id}",
        "email": f"alpha_{rand_id}@alurku.com",
        "username": f"alpha_{rand_id}",
        "password": "SecretPassword123!"
    }
    user_b = {
        "full_name": f"User Beta {rand_id}",
        "email": f"beta_{rand_id}@alurku.com",
        "username": f"beta_{rand_id}",
        "password": "SecretPassword123!"
    }

    # 1. Register User A and User B
    resp_reg_a = client.post("/api/register", json=user_a)
    assert resp_reg_a.status_code == 200
    
    resp_reg_b = client.post("/api/register", json=user_b)
    assert resp_reg_b.status_code == 200

    # Auto-verify email to bypass is_verified check (manually update in test db)
    from database import SessionLocal, User
    db = SessionLocal()
    db.query(User).filter(User.username == user_a["username"]).update({"is_verified": 1})
    db.query(User).filter(User.username == user_b["username"]).update({"is_verified": 1})
    db.commit()
    db.close()

    # 2. Login as User A and User B
    resp_login_a = client.post("/api/login", json={"username": user_a["username"], "password": user_a["password"]})
    assert resp_login_a.status_code == 200
    token_a = resp_login_a.json()["token"]

    resp_login_b = client.post("/api/login", json={"username": user_b["username"], "password": user_b["password"]})
    assert resp_login_b.status_code == 200
    token_b = resp_login_b.json()["token"]

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Retrieve list of workspaces for A (should have 1 auto-created workspace)
    resp_ws_a = client.get("/api/workspaces", headers=headers_a)
    assert resp_ws_a.status_code == 200
    ws_list_a = resp_ws_a.json()
    assert len(ws_list_a) == 1
    assert ws_list_a[0]["owner_username"] == user_a["username"]
    default_ws_id = ws_list_a[0]["id"]

    # 4. Create a new custom Workspace from A
    custom_ws_name = f"Alurku Team Workspace {rand_id}"
    resp_create = client.post("/api/workspaces", json={"name": custom_ws_name}, headers=headers_a)
    assert resp_create.status_code == 200
    custom_ws_id = resp_create.json()["workspace"]["id"]

    # Listing workspaces for A should now return 2 workspaces
    resp_ws_a_updated = client.get("/api/workspaces", headers=headers_a)
    assert len(resp_ws_a_updated.json()) == 2

    # 5. Invite User B to A's Custom Workspace
    resp_invite = client.post(
        f"/api/workspaces/{custom_ws_id}/invite",
        json={"username_or_email": user_b["username"]},
        headers=headers_a
    )
    assert resp_invite.status_code == 200

    # 6. Listing workspaces for B should now return B's own default workspace AND A's custom workspace
    resp_ws_b = client.get("/api/workspaces", headers=headers_b)
    assert resp_ws_b.status_code == 200
    ws_list_b = resp_ws_b.json()
    assert len(ws_list_b) == 2
    
    # 7. Verify Tenant Isolation: User B tries to view or create boards in User A's default workspace
    # Should return 403 Forbidden because User B has not been invited to A's default workspace.
    headers_b_wrong_ws = {"Authorization": f"Bearer {token_b}", "X-Workspace-ID": str(default_ws_id)}
    
    resp_isolate_get = client.get("/api/boards", headers=headers_b_wrong_ws)
    assert resp_isolate_get.status_code == 403
    
    resp_isolate_post = client.post(
        "/api/boards",
        json={"name": "Hacked Board", "is_private": 0},
        headers=headers_b_wrong_ws
    )
    assert resp_isolate_post.status_code == 403
