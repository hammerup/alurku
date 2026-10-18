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
    # SSOT: Pro yearly base subtotal = Rp 79.000 * 12 = Rp 948.000
    # Tax: 11% PPN = Rp 104.280 -> Total amount = Rp 1.052.280
    assert inv["subtotal"] == 948_000, f"Expected subtotal 948000, got {inv.get('subtotal')}"
    assert inv["tax_rate"] == 11.0, f"Expected tax_rate 11.0, got {inv.get('tax_rate')}"
    assert inv["tax_amount"] == 104_280, f"Expected tax_amount 104280, got {inv.get('tax_amount')}"
    assert inv["amount"] == 1_052_280, f"Expected 1052280, got {inv['amount']}"
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
    # SSOT: Pro monthly base subtotal = Rp 99.000
    # Tax: 11% PPN = Rp 10.890 -> Total amount = Rp 109.890
    assert inv["subtotal"] == 99_000, f"Expected subtotal 99000, got {inv.get('subtotal')}"
    assert inv["tax_rate"] == 11.0, f"Expected tax_rate 11.0, got {inv.get('tax_rate')}"
    assert inv["tax_amount"] == 10_890, f"Expected tax_amount 10890, got {inv.get('tax_amount')}"
    assert inv["amount"] == 109_890, f"Expected 109890, got {inv['amount']}"


def test_checkout_business_yearly(client, billing_user_token_ws):
    token, ws_id, username = billing_user_token_ws
    resp = client.post(
        f"/api/workspaces/{ws_id}/checkout",
        json={"tier": "business", "billing_cycle": "yearly", "payment_method": "credit_card"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    inv = resp.json()["invoice"]
    # SSOT: Business yearly base subtotal = Rp 199.000 * 12 = Rp 2.388.000
    # Tax: 11% PPN = Rp 262.680 -> Total amount = Rp 2.650.680
    assert inv["subtotal"] == 2_388_000, f"Expected subtotal 2388000, got {inv.get('subtotal')}"
    assert inv["tax_rate"] == 11.0, f"Expected tax_rate 11.0, got {inv.get('tax_rate')}"
    assert inv["tax_amount"] == 262_680, f"Expected tax_amount 262680, got {inv.get('tax_amount')}"
    assert inv["amount"] == 2_650_680, f"Expected 2650680, got {inv['amount']}"


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


def test_expiration_downgrade_and_grace_period_engine(client, billing_user_token_ws):
    from datetime import datetime, timedelta
    from services.tier_service import check_and_expire_workspace_subscriptions, get_effective_workspace_tier

    token, ws_id, username = billing_user_token_ws
    db = SessionLocal()
    try:
        ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
        
        # 1. Test Grace Period: expired 1 day ago (within 3-day grace period)
        ws.tier = "pro"
        ws.subscription_status = "active"
        ws.subscription_expires_at = datetime.utcnow() - timedelta(days=1)
        db.commit()

        # Workspace should retain paid tier during grace period
        eff_tier_grace = get_effective_workspace_tier(db, ws)
        assert eff_tier_grace == "pro"
        assert ws.subscription_status == "grace_period"

        # 2. Test Hard Downgrade: expired 4 days ago (past 3-day grace period)
        ws.tier = "pro"
        ws.subscription_status = "grace_period"
        ws.subscription_expires_at = datetime.utcnow() - timedelta(days=4)
        db.commit()

        # Run expiration processor
        count = check_and_expire_workspace_subscriptions(db)
        db.refresh(ws)
        assert ws.tier == "free"
        assert ws.subscription_status == "expired"
        assert count >= 1
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


def test_checkout_b2b_tax_invoice(client, billing_user_token_ws):
    token, ws_id, username = billing_user_token_ws
    company = "PT Teknologi Maju Nusantara"
    tax_id = "01.234.567.8-999.000"
    address = "Gedung Menara Cyber Lt. 12, Jakarta"

    resp = client.post(
        f"/api/workspaces/{ws_id}/checkout",
        json={
            "tier": "business",
            "billing_cycle": "yearly",
            "payment_method": "va_bca",
            "company_name": company,
            "tax_id": tax_id,
            "billing_address": address,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    inv = resp.json()["invoice"]
    assert inv["company_name"] == company
    assert inv["tax_id"] == tax_id
    assert inv["billing_address"] == address

    # Verify retrieval via GET /api/invoices/{invoice_number}
    inv_num = inv["invoice_number"]
    detail_resp = client.get(f"/api/invoices/{inv_num}", headers={"Authorization": f"Bearer {token}"})
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["company_name"] == company
    assert detail["tax_id"] == tax_id
    assert detail["billing_address"] == address


def test_webhook_payment_gateway_activation(client, billing_user_token_ws):
    import os
    token, ws_id, username = billing_user_token_ws
    # 1. Create a pending invoice directly in DB
    db = SessionLocal()
    inv_num = f"INV-TEST-WH-{ws_id}"
    try:
        existing = db.query(Invoice).filter(Invoice.invoice_number == inv_num).first()
        if existing:
            db.delete(existing)
            db.commit()

        invoice = Invoice(
            invoice_number=inv_num,
            workspace_id=ws_id,
            username=username,
            tier="business",
            billing_cycle="yearly",
            amount=2_388_000,
            status="pending",
            payment_method="qris",
        )
        db.add(invoice)
        db.commit()
    finally:
        db.close()

    # 2. Simulate Payment Gateway Webhook event with valid auth token
    secret_token = os.getenv("MAYAR_WEBHOOK_TOKEN", "")
    headers = {"x-callback-token": secret_token} if secret_token else {}

    webhook_payload = {
        "event": "payment.received",
        "data": {
            "invoice_number": inv_num,
            "amount": 2_388_000,
            "payment_method": "qris",
            "status": "paid",
        }
    }
    wh_resp = client.post(
        "/api/billing/webhook/mayar",
        json=webhook_payload,
        headers=headers,
    )
    assert wh_resp.status_code == 200, wh_resp.text
    res = wh_resp.json()
    assert res["status"] == "ok"
    assert res["invoice_status"] == "paid"

    # 3. Verify workspace was upgraded to Business
    db = SessionLocal()
    try:
        ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
        assert ws.tier == "business"
        assert ws.subscription_status == "active"
        assert ws.subscription_expires_at is not None
    finally:
        db.close()


def test_webhook_signature_verification_security(client):
    import os, hmac, hashlib, json

    secret_key = "test_mayar_secret_webhook_token_123"
    os.environ["MAYAR_WEBHOOK_TOKEN"] = secret_key

    try:
        payload = {"event": "payment.received", "data": {"invoice_number": "INV-DUMMY-999"}}
        payload_bytes = json.dumps(payload).encode("utf-8")

        # Valid HMAC signature
        valid_sig = hmac.new(secret_key.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
        resp_valid = client.post(
            "/api/billing/webhook",
            data=payload_bytes,
            headers={"Content-Type": "application/json", "x-mayar-signature": valid_sig},
        )
        assert resp_valid.status_code == 200

        # Invalid HMAC signature should be rejected with 401
        invalid_sig = "tampered_fake_signature_hex"
        resp_invalid = client.post(
            "/api/billing/webhook",
            data=payload_bytes,
            headers={"Content-Type": "application/json", "x-mayar-signature": invalid_sig},
        )
        assert resp_invalid.status_code == 401
        assert "gagal" in resp_invalid.json()["detail"].lower()
    finally:
        os.environ.pop("MAYAR_WEBHOOK_TOKEN", None)


def test_proactive_subscription_reminders(client, billing_user_token_ws):
    from datetime import datetime, timedelta
    from services.tier_service import send_subscription_due_reminders

    token, ws_id, username = billing_user_token_ws
    db = SessionLocal()
    try:
        ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
        # Set subscription to expire exactly in 7 days
        ws.tier = "pro"
        ws.subscription_status = "active"
        ws.subscription_expires_at = datetime.utcnow() + timedelta(days=7, hours=1)
        db.commit()

        # Run reminders
        reminders = send_subscription_due_reminders(db)
        assert reminders["h7_reminders_sent"] >= 1
    finally:
        db.close()


def test_dynamic_tax_policy_setting(client, billing_user_token_ws):
    """Verifies administrator can adjust PPN tax percentage and checkout calculates tax dynamically."""
    from database import get_system_policies, set_system_policies

    token, ws_id, username = billing_user_token_ws
    db = SessionLocal()
    original_policies = get_system_policies(db)
    try:
        # 1. Set PPN to 0% (e.g. Non-PKP / Tax Exempt)
        set_system_policies(db, {"tax_rate_percent": 0.0})

        resp_zero = client.post(
            f"/api/workspaces/{ws_id}/checkout",
            json={"tier": "pro", "billing_cycle": "monthly", "payment_method": "qris"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp_zero.status_code == 200
        inv_zero = resp_zero.json()["invoice"]
        assert inv_zero["subtotal"] == 99_000
        assert inv_zero["tax_rate"] == 0.0
        assert inv_zero["tax_amount"] == 0
        assert inv_zero["amount"] == 99_000

        # 2. Set PPN to 12% (upcoming VAT rate)
        set_system_policies(db, {"tax_rate_percent": 12.0})

        resp_twelve = client.post(
            f"/api/workspaces/{ws_id}/checkout",
            json={"tier": "pro", "billing_cycle": "monthly", "payment_method": "va_mandiri"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp_twelve.status_code == 200
        inv_twelve = resp_twelve.json()["invoice"]
        assert inv_twelve["subtotal"] == 99_000
        assert inv_twelve["tax_rate"] == 12.0
        expected_tax = int(round(99_000 * 0.12))  # 11,880
        assert inv_twelve["tax_amount"] == expected_tax
        assert inv_twelve["amount"] == 99_000 + expected_tax

        # 3. Verify get_invoice reflects dynamic tax fields
        inv_number = inv_twelve["invoice_number"]
        detail_resp = client.get(f"/api/invoices/{inv_number}", headers={"Authorization": f"Bearer {token}"})
        assert detail_resp.status_code == 200
        detail = detail_resp.json()
        assert detail["subtotal"] == 99_000
        assert detail["tax_rate"] == 12.0
        assert detail["tax_amount"] == expected_tax
        assert detail["amount"] == 99_000 + expected_tax

    finally:
        # Restore original policies
        set_system_policies(db, original_policies)
        db.close()


def test_tier_limits_telemetry_includes_workspaces_and_projects(client, billing_user_token_ws):
    """Verifies that workspace telemetry endpoint includes workspaces_owned and projects."""
    token, ws_id, username = billing_user_token_ws
    resp = client.get(
        f"/api/workspaces/{ws_id}/usage",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    # Telemetry must include workspaces_owned
    assert "workspaces_owned" in data
    assert "used" in data["workspaces_owned"]
    assert "max" in data["workspaces_owned"]
    assert "is_unlimited" in data["workspaces_owned"]
    assert data["workspaces_owned"]["used"] >= 1

    # Telemetry must include projects
    assert "projects" in data
    assert "used" in data["projects"]
    assert "max" in data["projects"]
    assert "is_unlimited" in data["projects"]

    # Telemetry must include members, storage, ai_requests
    assert "members" in data
    assert "storage" in data
    assert "ai_requests" in data


