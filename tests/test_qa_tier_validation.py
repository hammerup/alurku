import pytest
import random
from fastapi.testclient import TestClient
from backend_api import app
from database import SessionLocal, User, Workspace, get_security_log, set_security_log
from services.tier_service import get_user_highest_tier

client = TestClient(app)

def test_point_1_comprehensive_validation():
    rand_id = random.randint(10000, 99999)
    username = f"qatest_{rand_id}"
    pwd = "Password123!"
    payload = {
        "full_name": f"QA User {rand_id}",
        "email": f"{username}@alurku.com",
        "username": username,
        "password": pwd
    }

    db = SessionLocal()
    policies = get_security_log(db, "system_policies", {})
    if not isinstance(policies, dict):
        policies = {}
    set_security_log(db, "system_policies", {**policies, "allow_public_signup": True})
    db.commit()

    # 1. Register & verify user
    resp = client.post("/api/register", json=payload)
    assert resp.status_code == 200, f"Register failed: {resp.text}"
    db.query(User).filter(User.username == username).update({"is_verified": 1})
    db.commit()

    login_resp = client.post("/api/login", json={"username": username, "password": pwd})
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # (a) Akun Free hanya bisa memiliki 1 workspace; pembuatan workspace ke-2 ditolak (403).
    res_ws = client.get("/api/workspaces", headers=headers)
    assert res_ws.status_code == 200
    ws_list = res_ws.json()
    assert len(ws_list) == 1, f"Expected 1 workspace, got {len(ws_list)}"
    assert ws_list[0]["tier"] == "free", f"Expected free tier, got {ws_list[0]['tier']}"
    ws_1_id = ws_list[0]["id"]

    res_create2_fail = client.post("/api/workspaces", json={"name": "WS 2 - Expect Block"}, headers=headers)
    assert res_create2_fail.status_code == 403, f"Expected 403, got {res_create2_fail.status_code}"
    assert "Batas Paket Tercapai" in res_create2_fail.json()["detail"]
    assert "hanya mengizinkan maksimal 1 Workspace" in res_create2_fail.json()["detail"]

    # (b) Setelah akun upgrade ke Pro (kuota 3 workspace), pembuatan workspace ke-2 dan ke-3 sukses dan OTOMATIS mewarisi tier 'pro' (bukan free).
    res_upgrade_pro = client.put(f"/api/workspaces/{ws_1_id}/tier", json={"tier": "pro"}, headers=headers)
    assert res_upgrade_pro.status_code == 200
    assert res_upgrade_pro.json()["tier"] == "pro"

    res_create2 = client.post("/api/workspaces", json={"name": "WS 2 - Pro Allowed"}, headers=headers)
    assert res_create2.status_code == 200, f"WS 2 creation failed: {res_create2.text}"
    ws2_data = res_create2.json()["workspace"]
    assert ws2_data["tier"] == "pro", f"WS 2 tier is {ws2_data['tier']}, expected pro"

    res_create3 = client.post("/api/workspaces", json={"name": "WS 3 - Pro Allowed"}, headers=headers)
    assert res_create3.status_code == 200, f"WS 3 creation failed: {res_create3.text}"
    ws3_data = res_create3.json()["workspace"]
    assert ws3_data["tier"] == "pro", f"WS 3 tier is {ws3_data['tier']}, expected pro"

    # (c) Semua workspace milik user Pro terdata sebagai 'pro' saat query GET /api/workspaces.
    res_ws_all_pro = client.get("/api/workspaces", headers=headers)
    assert res_ws_all_pro.status_code == 200
    pro_workspaces = res_ws_all_pro.json()
    assert len(pro_workspaces) == 3, f"Expected 3 workspaces, got {len(pro_workspaces)}"
    for w in pro_workspaces:
        assert w["tier"] == "pro", f"Workspace {w['id']} has tier {w['tier']}, expected pro"

    # (d) Pembuatan workspace ke-4 di Pro ditolak (403).
    res_create4_fail = client.post("/api/workspaces", json={"name": "WS 4 - Pro Block"}, headers=headers)
    assert res_create4_fail.status_code == 403, f"Expected 403, got {res_create4_fail.status_code}"
    assert "Batas Paket Tercapai" in res_create4_fail.json()["detail"]
    assert "hanya mengizinkan maksimal 3 Workspace" in res_create4_fail.json()["detail"]

    # (e) Setelah upgrade ke Business (unlimited workspaces), seluruh workspace eksisting milik user otomatis ter-upgrade ke 'business', dan workspace baru (ke-4 dst) otomatis berstatus 'business'.
    res_upgrade_biz = client.put(f"/api/workspaces/{ws_1_id}/tier", json={"tier": "business"}, headers=headers)
    assert res_upgrade_biz.status_code == 200
    assert res_upgrade_biz.json()["tier"] == "business"
    assert res_upgrade_biz.json()["workspaces_updated"] == 3

    res_ws_all_biz = client.get("/api/workspaces", headers=headers)
    assert res_ws_all_biz.status_code == 200
    biz_workspaces = res_ws_all_biz.json()
    assert len(biz_workspaces) == 3
    for w in biz_workspaces:
        assert w["tier"] == "business", f"Workspace {w['id']} has tier {w['tier']}, expected business"

    res_create4_biz = client.post("/api/workspaces", json={"name": "WS 4 - Business Allowed"}, headers=headers)
    assert res_create4_biz.status_code == 200, f"WS 4 business creation failed: {res_create4_biz.text}"
    ws4_data = res_create4_biz.json()["workspace"]
    assert ws4_data["tier"] == "business", f"WS 4 tier is {ws4_data['tier']}, expected business"

    # (f) Periksa kondisi database SQLite / PostgreSQL untuk memastikan tidak ada workspace Pro/Business yang tertinggal sebagai 'free'.
    db_workspaces = db.query(Workspace).filter(Workspace.owner_username == username).all()
    assert len(db_workspaces) == 4
    for db_ws in db_workspaces:
        assert db_ws.tier == "business", f"DB workspace {db_ws.id} has tier {db_ws.tier}, expected business"

    # Check overall database consistency for all Pro/Business owners
    all_workspaces = db.query(Workspace).all()
    owners = set(w.owner_username for w in all_workspaces if w.owner_username)
    for owner in owners:
        highest = get_user_highest_tier(db, owner)
        if highest in ("pro", "business"):
            owned = db.query(Workspace).filter(Workspace.owner_username == owner).all()
            for w in owned:
                assert w.tier == highest, f"Owner {owner} has workspace {w.id} with tier {w.tier} but highest is {highest}"

    db.close()
