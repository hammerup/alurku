"""
tests/test_billing_invoices.py
Unit tests for billing checkout and invoice generation in alurku.
SSOT pricing: Pro Rp79k (yearly)/Rp99k (monthly), Business Rp199k (yearly)/Rp249k (monthly)
"""
import pytest
from fastapi.testclient import TestClient
from backend_api import app
from database import SessionLocal, User, Workspace, WorkspaceMember, Invoice
from dependencies import get_password_hash


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture
def billing_user_token_ws(client):
    import uuid
    uid = uuid.uuid4().hex[:6]
    username = f"billing_usr_{uid}"
    password = "testpass999"
    db = SessionLocal()
    try:
        user = User(
            username=username,
            email=f"{username}@example.com",
            full_name="Billing Test User",
            password=get_password_hash(password),
            is_verified=1,
        )
        db.add(user)
        db.commit()

        ws = Workspace(name=f"Billing WS {uid}", owner_username=username, tier="free")
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
    return token, workspace_id, username


def test_checkout_pro_yearly(client, billing_user_token_ws):
    token, ws_id, username = billing_user_token_ws
    resp = client.post(
        f"/api/workspaces/{ws_id}/checkout",
        json={"tier": "pro", "billing_cycle": "yearly", "payment_method": "qris"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "invoice" in data
    inv = data["invoice"]
    # SSOT: Pro yearly = Rp 79.000/bln billed annually = Rp 948.000
    assert inv["amount"] == 948_000, f"Expected 948000, got {inv['amount']}"
    assert inv["tier"] == "pro"
    assert inv["billing_cycle"] == "yearly"
    assert inv["invoice_number"].startswith("INV-")
    assert inv["status"] == "paid"


def test_checkout_pro_monthly(client, billing_user_token_ws):
    token, ws_id, username = billing_user_token_ws
    resp = client.post(
        f"/api/workspaces/{ws_id}/checkout",
        json={"tier": "pro", "billing_cycle": "monthly", "payment_method": "va_bca"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    inv = resp.json()["invoice"]
    # SSOT: Pro monthly = Rp 99.000
    assert inv["amount"] == 99_000, f"Expected 99000, got {inv['amount']}"


def test_checkout_business_yearly(client, billing_user_token_ws):
    token, ws_id, username = billing_user_token_ws
    resp = client.post(
        f"/api/workspaces/{ws_id}/checkout",
        json={"tier": "business", "billing_cycle": "yearly", "payment_method": "credit_card"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    inv = resp.json()["invoice"]
    # SSOT: Business yearly = Rp 199.000/bln billed annually = Rp 2.388.000
    assert inv["amount"] == 2_388_000, f"Expected 2388000, got {inv['amount']}"


def test_checkout_upgrades_workspace_tier(client, billing_user_token_ws):
    token, ws_id, username = billing_user_token_ws
    client.post(
        f"/api/workspaces/{ws_id}/checkout",
        json={"tier": "pro", "billing_cycle": "monthly", "payment_method": "qris"},
        headers={"Authorization": f"Bearer {token}"},
    )
    db = SessionLocal()
    try:
        ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
        assert ws.tier in ("pro", "business"), f"Expected workspace tier to be upgraded, got {ws.tier}"
    finally:
        db.close()


def test_list_invoices(client, billing_user_token_ws):
    token, ws_id, username = billing_user_token_ws
    client.post(
        f"/api/workspaces/{ws_id}/checkout",
        json={"tier": "pro", "billing_cycle": "monthly", "payment_method": "qris"},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = client.get(
        f"/api/workspaces/{ws_id}/invoices",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "invoices" in data
    assert len(data["invoices"]) >= 1


def test_get_invoice_detail(client, billing_user_token_ws):
    token, ws_id, username = billing_user_token_ws
    checkout_resp = client.post(
        f"/api/workspaces/{ws_id}/checkout",
        json={"tier": "pro", "billing_cycle": "monthly", "payment_method": "qris"},
        headers={"Authorization": f"Bearer {token}"},
    )
    inv_number = checkout_resp.json()["invoice"]["invoice_number"]

    resp = client.get(f"/api/invoices/{inv_number}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["invoice_number"] == inv_number
    assert "workspace_name" in data


def test_checkout_invalid_tier(client, billing_user_token_ws):
    token, ws_id, _ = billing_user_token_ws
    resp = client.post(
        f"/api/workspaces/{ws_id}/checkout",
        json={"tier": "enterprise", "billing_cycle": "monthly"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 422, resp.text


def test_invoices_access_denied_non_member(client, billing_user_token_ws):
    _, ws_id, _ = billing_user_token_ws
    # Register outsider
    username2 = "outsider_billing_88"
    db = SessionLocal()
    try:
        user2 = db.query(User).filter(User.username == username2).first()
        if not user2:
            user2 = User(username=username2, email=f"{username2}@example.com",
                         full_name="Outsider", password=get_password_hash("pass123"), is_verified=1)
            db.add(user2)
            db.commit()
    finally:
        db.close()
    resp2 = client.post("/api/login", json={"username": username2, "password": "pass123"})
    token2 = resp2.json()["token"]

    resp = client.get(f"/api/workspaces/{ws_id}/invoices", headers={"Authorization": f"Bearer {token2}"})
    assert resp.status_code == 403, resp.text


def test_checkout_idempotency(client, billing_user_token_ws):
    token, ws_id, username = billing_user_token_ws
    idempotency_key = "test-idem-key-9999"

    # First checkout
    resp1 = client.post(
        f"/api/workspaces/{ws_id}/checkout",
        json={"tier": "pro", "billing_cycle": "monthly", "payment_method": "qris", "idempotency_key": idempotency_key},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp1.status_code == 200, resp1.text
    inv1 = resp1.json()["invoice"]

    # Replay with same idempotency key
    resp2 = client.post(
        f"/api/workspaces/{ws_id}/checkout",
        json={"tier": "pro", "billing_cycle": "monthly", "payment_method": "qris", "idempotency_key": idempotency_key},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp2.status_code == 200, resp2.text
    inv2 = resp2.json()["invoice"]

    assert inv1["invoice_number"] == inv2["invoice_number"]
    assert resp2.json().get("is_idempotent_replay") is True


def test_checkout_subscription_lifecycle_dates(client, billing_user_token_ws):
    token, ws_id, username = billing_user_token_ws
    resp = client.post(
        f"/api/workspaces/{ws_id}/checkout",
        json={"tier": "business", "billing_cycle": "yearly", "payment_method": "credit_card"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "subscription" in data
    sub = data["subscription"]
    assert sub["tier"] == "business"
    assert sub["cycle"] == "yearly"
    assert sub["status"] == "active"
    assert sub["days_remaining"] >= 364

    # Verify workspace record in DB has subscription fields
    db = SessionLocal()
    try:
        ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
        assert ws.subscription_cycle == "yearly"
        assert ws.subscription_status == "active"
        assert ws.subscription_expires_at is not None
    finally:
        db.close()


def test_expiration_downgrade_engine(client, billing_user_token_ws):
    from datetime import datetime, timedelta
    from services.tier_service import check_and_expire_workspace_subscriptions, get_effective_workspace_tier

    token, ws_id, username = billing_user_token_ws
    db = SessionLocal()
    try:
        ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
        # Simulate expired subscription (expired 2 days ago)
        ws.tier = "pro"
        ws.subscription_status = "active"
        ws.subscription_expires_at = datetime.utcnow() - timedelta(days=2)
        db.commit()

        # Check effective tier
        eff_tier = get_effective_workspace_tier(db, ws)
        assert eff_tier == "free"

        # Run expiration processor
        count = check_and_expire_workspace_subscriptions(db)
        db.refresh(ws)
        assert ws.tier == "free"
        assert ws.subscription_status == "expired"
    finally:
        db.close()


def test_checkout_rate_limiting(client, billing_user_token_ws):
    token, ws_id, username = billing_user_token_ws
    # Attempt rapid checkouts to reach rate limit threshold of 5
    statuses = []
    for i in range(6):
        r = client.post(
            f"/api/workspaces/{ws_id}/checkout",
            json={"tier": "pro", "billing_cycle": "monthly", "payment_method": "qris"},
            headers={"Authorization": f"Bearer {token}"},
        )
        statuses.append(r.status_code)
    
    # At least one request should be rate-limited (429)
    assert 429 in statuses, f"Expected 429 in {statuses}"

