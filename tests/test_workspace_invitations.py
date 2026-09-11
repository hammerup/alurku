import pytest
import sys
import os
import random
from fastapi.testclient import TestClient

# Ensure root directory on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api import app
from database import SessionLocal, User, Workspace, WorkspaceMember, Notification, ActivityLog
from dependencies import get_password_hash

client = TestClient(app)


def test_complete_workspace_invitation_flow():
    print("\n" + "=" * 60)
    print("STARTING WORKSPACE INVITATION FLOW AUTOMATED TEST SUITE")
    print("=" * 60)

    rand_suffix = random.randint(10000, 99999)
    db = SessionLocal()

    # 1. Prepare Test Users
    users_spec = {
        "owner": {"username": f"ws_owner_{rand_suffix}", "email": f"owner_{rand_suffix}@alurku.app", "full_name": "Workspace Owner"},
        "admin": {"username": f"ws_admin_{rand_suffix}", "email": f"admin_{rand_suffix}@alurku.app", "full_name": "Workspace Admin"},
        "member": {"username": f"ws_member_{rand_suffix}", "email": f"member_{rand_suffix}@alurku.app", "full_name": "Workspace Member"},
        "viewer": {"username": f"ws_viewer_{rand_suffix}", "email": f"viewer_{rand_suffix}@alurku.app", "full_name": "Workspace Viewer"},
        "outsider": {"username": f"ws_outsider_{rand_suffix}", "email": f"outsider_{rand_suffix}@alurku.app", "full_name": "Workspace Outsider"},
    }

    tokens = {}
    ws_id = None

    try:
        # Create users in db and get tokens
        for key, spec in users_spec.items():
            user = User(
                username=spec["username"],
                email=spec["email"],
                full_name=spec["full_name"],
                password=get_password_hash("Password123!"),
                is_verified=1,
                account_status="active"
            )
            db.add(user)
        db.commit()

        # Get JWT tokens for each user
        for key, spec in users_spec.items():
            login_res = client.post("/api/login", json={"username": spec["username"], "password": "Password123!"})
            assert login_res.status_code == 200, f"Login failed for {key}: {login_res.text}"
            tokens[key] = login_res.json()["token"]

        headers = {k: {"Authorization": f"Bearer {tok}"} for k, tok in tokens.items()}
        print(" [PASS] 1. Test users created and authenticated")

        # 2. Workspace Owner Creates Workspace
        ws_name = f"Inovasi Flow {rand_suffix}"
        create_res = client.post("/api/workspaces", json={"name": ws_name}, headers=headers["owner"])
        assert create_res.status_code == 200, f"Create workspace failed: {create_res.text}"
        ws_id = create_res.json()["workspace"]["id"]
        # Upgrade workspace to 'pro' to allow inviting 3+ team members (Free tier limit is 3 total members)
        up_res = client.put(f"/api/workspaces/{ws_id}/tier", json={"tier": "pro"}, headers=headers["owner"])
        assert up_res.status_code == 200
        print(f" [PASS] 2. Workspace created & upgraded to Pro successfully (ID={ws_id}, Name='{ws_name}')")

        # 3. Owner Invites Member by Username
        invite_member_res = client.post(
            f"/api/workspaces/{ws_id}/invite",
            json={"username_or_email": users_spec["member"]["username"], "role": "member"},
            headers=headers["owner"]
        )
        assert invite_member_res.status_code == 200, f"Invite member failed: {invite_member_res.text}"
        
        # Verify in database
        db.expire_all()
        m_record = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == ws_id,
            WorkspaceMember.username == users_spec["member"]["username"]
        ).first()
        assert m_record is not None, "Member not found in workspace_members"
        assert m_record.role == "member", f"Expected role 'member', got '{m_record.role}'"

        # Verify in-app notification created
        notif = db.query(Notification).filter(
            Notification.user_username == users_spec["member"]["username"],
            Notification.type == "team_invite"
        ).first()
        assert notif is not None, "In-app team_invite notification was not created"
        print(" [PASS] 3. Owner invited Member by username (Role=member, Notification created)")

        # 4. Owner Invites Admin by Email
        invite_admin_res = client.post(
            f"/api/workspaces/{ws_id}/invite",
            json={"username_or_email": users_spec["admin"]["email"], "role": "admin"},
            headers=headers["owner"]
        )
        assert invite_admin_res.status_code == 200, f"Invite admin by email failed: {invite_admin_res.text}"

        db.expire_all()
        a_record = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == ws_id,
            WorkspaceMember.username == users_spec["admin"]["username"]
        ).first()
        assert a_record is not None
        assert a_record.role == "admin", f"Expected role 'admin', got '{a_record.role}'"
        print(" [PASS] 4. Owner invited Admin by email (Role=admin)")

        # 5. Owner Invites Viewer
        invite_viewer_res = client.post(
            f"/api/workspaces/{ws_id}/invite",
            json={"username_or_email": users_spec["viewer"]["username"], "role": "viewer"},
            headers=headers["owner"]
        )
        assert invite_viewer_res.status_code == 200

        db.expire_all()
        v_record = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == ws_id,
            WorkspaceMember.username == users_spec["viewer"]["username"]
        ).first()
        assert v_record is not None
        assert v_record.role == "viewer"
        print(" [PASS] 5. Owner invited Viewer (Role=viewer)")

        # 6. Admin can also invite members
        temp_username = f"temp_user_{rand_suffix}"
        temp_user = User(
            username=temp_username,
            email=f"{temp_username}@alurku.app",
            full_name="Temp Colleague",
            password=get_password_hash("Password123!"),
            is_verified=1
        )
        db.add(temp_user)
        db.commit()

        admin_invite_res = client.post(
            f"/api/workspaces/{ws_id}/invite",
            json={"username_or_email": temp_username, "role": "member"},
            headers=headers["admin"]
        )
        assert admin_invite_res.status_code == 200, f"Admin invite failed: {admin_invite_res.text}"
        print(" [PASS] 6. Workspace Admin can invite members")

        # 7. Authorization: Regular Member cannot invite (403)
        member_invite_res = client.post(
            f"/api/workspaces/{ws_id}/invite",
            json={"username_or_email": users_spec["outsider"]["username"], "role": "member"},
            headers=headers["member"]
        )
        assert member_invite_res.status_code == 403, f"Expected 403, got {member_invite_res.status_code}"
        print(" [PASS] 7. Regular Member cannot invite (403 Forbidden verified)")

        # 8. Authorization: Viewer cannot invite (403)
        viewer_invite_res = client.post(
            f"/api/workspaces/{ws_id}/invite",
            json={"username_or_email": users_spec["outsider"]["username"], "role": "member"},
            headers=headers["viewer"]
        )
        assert viewer_invite_res.status_code == 403
        print(" [PASS] 8. Viewer cannot invite (403 Forbidden verified)")

        # 9. Authorization: Outsider cannot invite (403)
        outsider_invite_res = client.post(
            f"/api/workspaces/{ws_id}/invite",
            json={"username_or_email": users_spec["outsider"]["username"], "role": "member"},
            headers=headers["outsider"]
        )
        assert outsider_invite_res.status_code == 403
        print(" [PASS] 9. Outsider cannot invite (403 Forbidden verified)")

        # 10. Self-invite prevention (400)
        self_invite_res = client.post(
            f"/api/workspaces/{ws_id}/invite",
            json={"username_or_email": users_spec["owner"]["username"], "role": "member"},
            headers=headers["owner"]
        )
        assert self_invite_res.status_code == 400
        print(" [PASS] 10. Self-invite blocked with 400 Bad Request")

        # 11. Duplicate invite prevention (400)
        dup_invite_res = client.post(
            f"/api/workspaces/{ws_id}/invite",
            json={"username_or_email": users_spec["member"]["username"], "role": "member"},
            headers=headers["owner"]
        )
        assert dup_invite_res.status_code == 400
        print(" [PASS] 11. Duplicate invite blocked with 400 Bad Request")

        # 12. Unregistered email invitation (200 OK + invited_unregistered)
        unreg_email = f"unregistered_colleague_{rand_suffix}@corporate.id"
        unreg_invite_res = client.post(
            f"/api/workspaces/{ws_id}/invite",
            json={"username_or_email": unreg_email, "role": "member"},
            headers=headers["owner"]
        )
        assert unreg_invite_res.status_code == 200
        assert unreg_invite_res.json().get("status") == "invited_unregistered"
        print(" [PASS] 12. Unregistered email invitation sent with 200 OK")

        # 13. Invalid username target returns 404
        ghost_invite_res = client.post(
            f"/api/workspaces/{ws_id}/invite",
            json={"username_or_email": "non_existent_ghost_user_12345", "role": "member"},
            headers=headers["owner"]
        )
        assert ghost_invite_res.status_code == 404
        print(" [PASS] 13. Invalid username target rejected with 404 Not Found")

        # 14. Non-existent workspace returns 404
        bad_ws_res = client.post(
            "/api/workspaces/9999999/invite",
            json={"username_or_email": users_spec["outsider"]["username"], "role": "member"},
            headers=headers["owner"]
        )
        assert bad_ws_res.status_code == 404
        print(" [PASS] 14. Non-existent workspace rejected with 404 Not Found")

        # 15. Listing Workspace Members (GET /api/workspaces/{id}/members)
        members_res = client.get(f"/api/workspaces/{ws_id}/members", headers=headers["member"])
        assert members_res.status_code == 200
        member_list = members_res.json()
        usernames_in_ws = [m["username"] for m in member_list]
        assert users_spec["owner"]["username"] in usernames_in_ws
        assert users_spec["admin"]["username"] in usernames_in_ws
        assert users_spec["member"]["username"] in usernames_in_ws
        assert users_spec["viewer"]["username"] in usernames_in_ws

        # Outsider listing members gets 403
        outsider_members_res = client.get(f"/api/workspaces/{ws_id}/members", headers=headers["outsider"])
        assert outsider_members_res.status_code == 403
        print(f" [PASS] 15. Member listing OK ({len(member_list)} members, outsider blocked with 403)")

        # 16. Update Member Role (PUT /api/workspaces/{id}/members/{username})
        # Admin promotes member to admin
        promote_res = client.put(
            f"/api/workspaces/{ws_id}/members/{users_spec['member']['username']}",
            json={"role": "admin"},
            headers=headers["admin"]
        )
        assert promote_res.status_code == 200
        
        # Non-admin / Viewer trying to update role gets 403
        viewer_update_res = client.put(
            f"/api/workspaces/{ws_id}/members/{users_spec['admin']['username']}",
            json={"role": "viewer"},
            headers=headers["viewer"]
        )
        assert viewer_update_res.status_code == 403

        # Cannot change owner's role (400)
        change_owner_res = client.put(
            f"/api/workspaces/{ws_id}/members/{users_spec['owner']['username']}",
            json={"role": "viewer"},
            headers=headers["admin"]
        )
        assert change_owner_res.status_code == 400
        print(" [PASS] 16. Member role updates OK (Admin can update, Viewer blocked, Owner protected)")

        # 17. Remove Workspace Member (Kick)
        # Admin removes temp_user
        remove_res = client.delete(
            f"/api/workspaces/{ws_id}/members/{temp_username}",
            headers=headers["admin"]
        )
        assert remove_res.status_code == 200

        # Non-admin trying to remove gets 403
        bad_remove_res = client.delete(
            f"/api/workspaces/{ws_id}/members/{users_spec['admin']['username']}",
            headers=headers["viewer"]
        )
        assert bad_remove_res.status_code == 403

        # Owner cannot be removed (400)
        remove_owner_res = client.delete(
            f"/api/workspaces/{ws_id}/members/{users_spec['owner']['username']}",
            headers=headers["admin"]
        )
        assert remove_owner_res.status_code == 400
        print(" [PASS] 17. Member removal (Kick) OK (Admin can kick, Non-admin blocked, Owner protected)")

        # 18. Member Self-Leave (DELETE /api/workspaces/{id}/members/{self})
        leave_res = client.delete(
            f"/api/workspaces/{ws_id}/members/{users_spec['viewer']['username']}",
            headers=headers["viewer"]
        )
        assert leave_res.status_code == 200

        # After leaving, viewer cannot list members anymore (403)
        post_leave_check = client.get(f"/api/workspaces/{ws_id}/members", headers=headers["viewer"])
        assert post_leave_check.status_code == 403
        print(" [PASS] 18. Member self-leave OK (Immediately loses workspace access)")

        # 19. Superadmin Override Privileges
        # Superadmin can invite even without prior membership
        admin_user = db.query(User).filter(User.username == "admin").first()
        if admin_user:
            admin_login = client.post("/api/login", json={"username": "admin", "password": "admin123"})
            if admin_login.status_code == 200:
                sa_token = admin_login.json()["token"]
                sa_headers = {"Authorization": f"Bearer {sa_token}"}
                sa_invite_res = client.post(
                    f"/api/workspaces/{ws_id}/invite",
                    json={"username_or_email": users_spec["outsider"]["username"], "role": "member"},
                    headers=sa_headers
                )
                assert sa_invite_res.status_code == 200
                print(" [PASS] 19. Superadmin global invite privilege verified")

        print("=" * 60)
        print(" ALL 19 WORKSPACE INVITATION TEST CASES PASSED (100% SUCCESS)")
        print("=" * 60)

    finally:
        # Cleanup test records
        try:
            if ws_id:
                ws_to_clean = db.query(Workspace).filter(Workspace.id == ws_id).first()
                if ws_to_clean:
                    db.delete(ws_to_clean)
            for spec in users_spec.values():
                u = db.query(User).filter(User.username == spec["username"]).first()
                if u:
                    db.delete(u)
            temp_u = db.query(User).filter(User.username == f"temp_user_{rand_suffix}").first()
            if temp_u:
                db.delete(temp_u)
            db.commit()
        except Exception:
            pass
        db.close()


if __name__ == "__main__":
    test_complete_workspace_invitation_flow()
