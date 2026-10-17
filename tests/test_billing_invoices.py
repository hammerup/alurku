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


@pytest.fixture(scope="module")
def billing_user_token_ws(client):
    username = "billing_test_user_99"
    password = "testpass999"
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            user = User(
                username=username,
                email=f"{username}@example.com",
                full_name="Billing Test User",
                password=get_password_hash(password),
                is_verified=1,
            )
            db.add(user)
            db.commit()

        ws = db.query(Workspace).filter(Workspace.owner_username == username).first()
        if not ws:
            ws = Workspace(name="Billing WS", owner_username=username, tier="free")
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
    db = SessionLocal()
    try:
        ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
        assert ws.tier in ("pro", "business"), f"Expected workspace tier to be upgraded, got {ws.tier}"
    finally:
        db.close()


def test_list_invoices(client, billing_user_token_ws):
    token, ws_id, username = billing_user_token_ws
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
    # Fetch list and get first invoice number
    resp = client.get(f"/api/workspaces/{ws_id}/invoices", headers={"Authorization": f"Bearer {token}"})
    inv_number = resp.json()["invoices"][0]["invoice_number"]

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
