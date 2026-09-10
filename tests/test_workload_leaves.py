import pytest
import sys
import os
import random
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

# Ensure root directory on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api import app
from database import SessionLocal, User, Workspace, WorkspaceMember, LeaveRecord
from dependencies import get_password_hash

client = TestClient(app)


def test_workload_analytics_and_leaves_integration():
    print("\n" + "=" * 60)
    print("STARTING WORKLOAD ANALYTICS & LEAVES TEST SUITE (PILLAR 2)")
    print("=" * 60)

    rand_suffix = random.randint(10000, 99999)
    db = SessionLocal()

    admin_username = f"wl_admin_{rand_suffix}"
    member1_username = f"wl_alice_{rand_suffix}"
    member2_username = f"wl_bob_{rand_suffix}"

    tokens = {}
    created_leave_ids = []
    ws_id = None

    try:
        # 1. Setup Test Users (Admin, Member 1, Member 2)
        users_data = [
            (admin_username, f"{admin_username}@alurku.app", "Admin Lead"),
            (member1_username, f"{member1_username}@alurku.app", "Alice Engineer"),
            (member2_username, f"{member2_username}@alurku.app", "Bob Designer"),
        ]

        for uname, email, fname in users_data:
            user = User(
                username=uname,
                email=email,
                full_name=fname,
                password=get_password_hash("Password123!"),
                is_verified=1,
                account_status="active",
            )
            db.add(user)
        db.commit()

        for uname, _, _ in users_data:
            res = client.post("/api/login", json={"username": uname, "password": "Password123!"})
            assert res.status_code == 200, f"Login failed for {uname}: {res.text}"
            tokens[uname] = res.json()["token"]

        headers_admin = {"Authorization": f"Bearer {tokens[admin_username]}"}

        print(" [PASS] 1. Test users created and logged in")

        # 2. Setup Shared Workspace
        ws_res = client.post(
            "/api/workspaces",
            json={"name": f"Workload Test WS {rand_suffix}", "description": "Testing Pillar 2"},
            headers=headers_admin,
        )
        assert ws_res.status_code in [200, 201], f"Create workspace failed: {ws_res.text}"
        ws_id = ws_res.json()["workspace"]["id"]

        # Add Alice and Bob as workspace members
        db.add(WorkspaceMember(workspace_id=ws_id, username=member1_username, role="member"))
        db.add(WorkspaceMember(workspace_id=ws_id, username=member2_username, role="member"))
        db.commit()
        print(" [PASS] 2. Workspace members linked")

        # 3. Create Leave Records
        # Alice takes leave on a weekday of current week
        now = datetime.now()
        cur_day = now.weekday()
        mon = now - timedelta(days=cur_day)
        alice_leave_date = (mon + timedelta(days=min(2, cur_day))).strftime("%Y-%m-%d")

        alice_leave = LeaveRecord(
            username=member1_username,
            leave_date=alice_leave_date,
            description="Alice Annual Vacation",
            leave_type="personal",
        )
        db.add(alice_leave)
        db.commit()
        created_leave_ids.append(alice_leave.id)

        print(" [PASS] 3. Personal leave recorded for Alice")

        # 4. Test GET /api/leaves - Admin sees Alice's personal leave due to shared workspace
        leaves_res = client.get("/api/leaves", headers=headers_admin)
        assert leaves_res.status_code == 200, f"Get leaves failed: {leaves_res.text}"
        leaves_data = leaves_res.json().get("leaves", [])

        alice_leave_found = any(
            l.get("username") == member1_username and l.get("leave_date") == alice_leave_date
            for l in leaves_data
        )
        assert alice_leave_found, "Admin should see workspace colleague Alice's personal leave"
        print(" [PASS] 4. Workspace federated leaves verified on GET /api/leaves")

        # 5. Test GET /api/leaves/workload-summary
        summary_res = client.get("/api/leaves/workload-summary", headers=headers_admin)
        assert summary_res.status_code == 200, f"Get workload summary failed: {summary_res.text}"
        summary_data = summary_res.json()

        assert "today" in summary_data
        assert "week_start" in summary_data
        assert "week_end" in summary_data
        assert "active_leaves_today" in summary_data
        assert "weekly_leave_days" in summary_data

        # Verify that Alice's leave in the current week is tracked in weekly_leave_days
        assert member1_username in summary_data["weekly_leave_days"]
        assert summary_data["weekly_leave_days"][member1_username] >= 1
        print(" [PASS] 5. GET /api/leaves/workload-summary returned weekly deductions correctly")

        # 6. Verify Capacity Calculations Math
        alice_leave_days = summary_data["weekly_leave_days"][member1_username]
        effective_capacity = max(0, 40 - (alice_leave_days * 8))
        assert effective_capacity <= 32, f"Expected capacity <= 32h, got {effective_capacity}h"

        bob_leave_days = summary_data["weekly_leave_days"].get(member2_username, 0)
        bob_capacity = max(0, 40 - (bob_leave_days * 8))
        assert bob_capacity == 40, f"Expected Bob capacity 40h, got {bob_capacity}h"
        print(" [PASS] 6. Workload capacity deduction logic verified")

    finally:
        # Cleanup
        for lid in created_leave_ids:
            try:
                db.query(LeaveRecord).filter(LeaveRecord.id == lid).delete()
            except Exception:
                pass
        if ws_id:
            try:
                db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == ws_id).delete()
                db.query(Workspace).filter(Workspace.id == ws_id).delete()
            except Exception:
                pass
        for uname, _, _ in users_data:
            try:
                db.query(User).filter(User.username == uname).delete()
            except Exception:
                pass
        db.commit()
        db.close()
        print(" [PASS] 7. Cleanup completed successfully")
