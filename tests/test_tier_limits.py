import pytest
from fastapi.testclient import TestClient
import sys
import os
import random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api import app
from database import SessionLocal, User, Workspace, WorkspaceMember, Board, set_security_log, get_security_log
from services.tier_service import TIER_LIMITS, get_tier_config, set_security_log, get_user_ai_usage_month

client = TestClient(app)


def setup_test_user():
    rand_id = random.randint(10000, 99999)
    user_payload = {
        "full_name": f"Tier Tester {rand_id}",
        "email": f"tiertest_{rand_id}@alurku.com",
        "username": f"tiertest_{rand_id}",
        "password": "Password123!"
    }
    db = SessionLocal()
    policies = get_security_log(db, "system_policies", {})
    if not isinstance(policies, dict):
        policies = {}
    set_security_log(db, "system_policies", {**policies, "allow_public_signup": True})
    db.commit()

    resp = client.post("/api/register", json=user_payload)
    assert resp.status_code == 200

    db.query(User).filter(User.username == user_payload["username"]).update({"is_verified": 1})
    db.commit()
    db.close()

    resp_login = client.post("/api/login", json={"username": user_payload["username"], "password": user_payload["password"]})
    assert resp_login.status_code == 200
    token = resp_login.json()["token"]
    return user_payload["username"], token


def test_free_tier_limits_and_upgrade_flow():
    username, token = setup_test_user()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Check auto-created workspace & usage endpoint
    resp_ws = client.get("/api/workspaces", headers=headers)
    assert resp_ws.status_code == 200
    workspaces = resp_ws.json()
    assert len(workspaces) == 1
    ws = workspaces[0]
    ws_id = ws["id"]
    assert ws["tier"] == "free"

    resp_usage = client.get(f"/api/workspaces/{ws_id}/usage", headers=headers)
    assert resp_usage.status_code == 200
    usage = resp_usage.json()
    assert usage["tier"] == "free"
    assert usage["projects"]["max"] == 3
    assert usage["members"]["max"] == 3
    assert usage["ai_requests"]["max"] == 50

    # 2. Test Project limit (max 3 in Free tier)
    for i in range(1, 4):
        resp_p = client.post("/api/boards", json={"name": f"Project {i}", "workspace_id": ws_id}, headers=headers)
        assert resp_p.status_code == 200

    # 4th project must be blocked with 403
    resp_p4 = client.post("/api/boards", json={"name": "Project 4 - Over Limit", "workspace_id": ws_id}, headers=headers)
    assert resp_p4.status_code == 403
    assert "Batas Proyek Tercapai" in resp_p4.json()["detail"]

    # 3. Test Member limit (max 3 members including owner in Free tier)
    invited_users = []
    for i in range(1, 3):
        u_name, _ = setup_test_user()
        invited_users.append(u_name)
        resp_inv = client.post(f"/api/workspaces/{ws_id}/invite", json={"username_or_email": u_name}, headers=headers)
        assert resp_inv.status_code == 200

    # 4th member invite must be blocked
    u_overflow, _ = setup_test_user()
    resp_inv_block = client.post(f"/api/workspaces/{ws_id}/invite", json={"username_or_email": u_overflow}, headers=headers)
    assert resp_inv_block.status_code == 403
    assert "Batas Anggota Tercapai" in resp_inv_block.json()["detail"]

    # 4. Test Storage limit guard
    from services.tier_service import enforce_can_upload_storage
    from fastapi import HTTPException
    db = SessionLocal()
    with pytest.raises(HTTPException) as exc_info:
        enforce_can_upload_storage(db, ws_id, incoming_bytes=600 * 1024 * 1024)
    assert exc_info.value.status_code == 403
    assert "Kapasitas Penyimpanan Penuh" in exc_info.value.detail

    # 5. Test AI monthly limit guard
    from services.tier_service import enforce_can_use_ai
    set_security_log(db, f"ai_quota:{username}:{usage['ai_requests']['month']}", 50)
    db.commit()

    with pytest.raises(HTTPException) as exc_ai:
        enforce_can_use_ai(db, username, "free")
    assert exc_ai.value.status_code == 403
    assert "Kuota AI Bulanan Habis" in exc_ai.value.detail

    # 6. Test Upgrade to Pro tier
    resp_upgrade = client.put(f"/api/workspaces/{ws_id}/tier", json={"tier": "pro"}, headers=headers)
    assert resp_upgrade.status_code == 200
    assert resp_upgrade.json()["tier"] == "pro"

    # Verify updated usage telemetry
    resp_usage_pro = client.get(f"/api/workspaces/{ws_id}/usage", headers=headers)
    assert resp_usage_pro.status_code == 200
    pro_usage = resp_usage_pro.json()
    assert pro_usage["tier"] == "pro"
    assert pro_usage["projects"]["is_unlimited"] is True
    assert pro_usage["members"]["max"] == 25
    assert pro_usage["ai_requests"]["max"] == 1500

    # Project 4 can now be created freely under Pro tier!
    resp_p4_pro = client.post("/api/boards", json={"name": "Project 4 - Pro Allowed", "workspace_id": ws_id}, headers=headers)
    assert resp_p4_pro.status_code == 200

    # Overflow member can now be invited freely under Pro tier!
    resp_inv_pro = client.post(f"/api/workspaces/{ws_id}/invite", json={"username_or_email": u_overflow}, headers=headers)
    assert resp_inv_pro.status_code == 200

    # User with 50 AI requests can now use AI because Pro has 1,500 quota
    enforce_can_use_ai(db, username, "pro")
    db.close()
