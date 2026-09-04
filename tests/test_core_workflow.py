import pytest
import sys
import os
import random
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

# Ensure root directory on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api import app
from database import SessionLocal, User, Workspace, WorkspaceMember, Board, BoardMember, Request, Subtask, LeaveRecord
from dependencies import get_password_hash
from utils import calculate_priority, get_leave_dates

client = TestClient(app)


def test_core_workflow_kanban_gantt_and_workload():
    print("\n" + "=" * 60)
    print("STARTING CORE WORKFLOW (KANBAN, GANTT & WORKLOAD) TEST SUITE")
    print("=" * 60)

    rand_suffix = random.randint(10000, 99999)
    db = SessionLocal()

    users_spec = {
        "admin": {"username": f"wf_admin_{rand_suffix}", "email": f"wf_admin_{rand_suffix}@alurku.app", "full_name": "Workflow Admin"},
        "member": {"username": f"wf_member_{rand_suffix}", "email": f"wf_member_{rand_suffix}@alurku.app", "full_name": "Workflow Member"},
        "viewer": {"username": f"wf_viewer_{rand_suffix}", "email": f"wf_viewer_{rand_suffix}@alurku.app", "full_name": "Workflow Viewer"},
    }

    tokens = {}
    ws_id = None
    board_id = None
    created_task_ids = []

    try:
        # 1. Setup Test Users
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

        for key, spec in users_spec.items():
            login_res = client.post("/api/login", json={"username": spec["username"], "password": "Password123!"})
            assert login_res.status_code == 200, f"Login failed for {key}: {login_res.text}"
            tokens[key] = login_res.json()["token"]

        headers = {k: {"Authorization": f"Bearer {tok}"} for k, tok in tokens.items()}
        print(" [PASS] 1. Test users created and authenticated")

        # 2. Setup Workspace and Assign Roles (Admin, Member, Viewer)
        ws_res = client.post("/api/workspaces", json={"name": f"Workflow WS {rand_suffix}"}, headers=headers["admin"])
        assert ws_res.status_code == 200
        ws_id = ws_res.json()["workspace"]["id"]

        # Add member with 'member' role
        client.post(f"/api/workspaces/{ws_id}/invite", json={"username_or_email": users_spec["member"]["username"], "role": "member"}, headers=headers["admin"])
        # Add viewer with 'viewer' role
        client.post(f"/api/workspaces/{ws_id}/invite", json={"username_or_email": users_spec["viewer"]["username"], "role": "viewer"}, headers=headers["admin"])

        # Inject X-Workspace-ID header for all subsequent calls
        for k in headers:
            headers[k]["X-Workspace-ID"] = str(ws_id)
        print(f" [PASS] 2. Workspace created (ID={ws_id}) with Admin, Member, and Viewer roles")

        # 3. Create Project / Board
        board_res = client.post("/api/boards", json={"name": f"SaaS Redesign {rand_suffix}", "description": "Core Workflow Board"}, headers=headers["admin"])
        assert board_res.status_code == 200
        board_id = board_res.json()["board_id"]

        # Add member to board as accepted member
        b_member = BoardMember(board_id=board_id, member_username=users_spec["member"]["username"], status="accepted")
        db.add(b_member)
        db.commit()
        print(f" [PASS] 3. Project Board created (ID={board_id}) and member enrolled")

        # 4. Create Task with Workload Attributes (ETC, Category, Deadline, Priority)
        tomorrow_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        next_week_str = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")

        task_payload = {
            "project_name": "Implement Responsive Kanban View",
            "requester": f"@{users_spec['member']['username']}",
            "category": "Frontend",
            "description": "Ensure fluid drag-and-drop and touch interactions",
            "supporting_access": "Figma design access",
            "start_date": tomorrow_str,
            "deadline": next_week_str,
            "impact": "High",
            "etc": 8.0,
            "subtasks": []
        }

        task_res = client.post(f"/api/boards/{board_id}/tasks", json=task_payload, headers=headers["member"])
        assert task_res.status_code == 200, f"Create task failed: {task_res.text}"
        task_id = task_res.json()["task_id"]
        created_task_ids.append(task_id)

        # Verify initial workload attributes in DB
        db.expire_all()
        db_task = db.query(Request).filter(Request.id == task_id).first()
        assert db_task is not None
        assert db_task.etc == 8.0
        assert db_task.status in ["To Do", "Pending", "Todo", "to do"]
        assert db_task.category == "Frontend"
        print(f" [PASS] 4. Task created with workload parameters (ETC=8.0h, Category=Frontend, ID={task_id})")

        # 5. Subtasks Management & Assignment
        sub1_res = client.post(
            f"/api/tasks/{task_id}/subtasks",
            json={"task_name": "Design touch feedback indicator", "assignee": users_spec["member"]["username"]},
            headers=headers["member"]
        )
        assert sub1_res.status_code == 200

        sub2_res = client.post(
            f"/api/tasks/{task_id}/subtasks",
            json={"task_name": "Integrate Gantt timeline zoom", "assignee": users_spec["admin"]["username"]},
            headers=headers["admin"]
        )
        assert sub2_res.status_code == 200

        # List subtasks
        list_subs_res = client.get(f"/api/tasks/{task_id}/subtasks", headers=headers["member"])
        assert list_subs_res.status_code == 200
        subtasks_list = list_subs_res.json().get("subtasks", [])
        assert len(subtasks_list) == 2
        sub1_id = subtasks_list[0]["id"]
        sub2_id = subtasks_list[1]["id"]
        print(" [PASS] 5. Subtasks added and assigned across team members (2 subtasks created)")

        # 6. Toggle Subtask Completion (Progress Tracking)
        toggle_res = client.put(f"/api/subtasks/{sub1_id}", json={"is_done": 1}, headers=headers["member"])
        assert toggle_res.status_code == 200

        db.expire_all()
        db_sub1 = db.query(Subtask).filter(Subtask.id == sub1_id).first()
        assert db_sub1.is_done == 1
        print(" [PASS] 6. Subtask completion toggled (is_done=1 tracked)")

        # 7. Kanban Status Transitions (Todo -> In Progress -> Review -> Done -> Reopened)
        # Move to In Progress
        p1_res = client.put(f"/api/tasks/{task_id}", json={"status": "In Progress"}, headers=headers["member"])
        assert p1_res.status_code == 200
        db.expire_all()
        assert db.query(Request).filter(Request.id == task_id).first().status == "In Progress"

        # Move to Review
        p2_res = client.put(f"/api/tasks/{task_id}", json={"status": "Review"}, headers=headers["member"])
        assert p2_res.status_code == 200
        db.expire_all()
        assert db.query(Request).filter(Request.id == task_id).first().status == "Review"

        # Move to Done -> completed_time must be recorded
        done_res = client.put(f"/api/tasks/{task_id}", json={"status": "Done"}, headers=headers["member"])
        assert done_res.status_code == 200
        db.expire_all()
        db_task_done = db.query(Request).filter(Request.id == task_id).first()
        assert db_task_done.status == "Done"
        assert db_task_done.completed_time is not None

        # Reopen to In Progress -> completed_time must be cleared
        reopen_res = client.put(f"/api/tasks/{task_id}", json={"status": "In Progress"}, headers=headers["member"])
        assert reopen_res.status_code == 200
        db.expire_all()
        db_task_reopened = db.query(Request).filter(Request.id == task_id).first()
        assert db_task_reopened.status == "In Progress"
        assert db_task_reopened.completed_time is None
        print(" [PASS] 7. Kanban full lifecycle transitions verified (Todo -> In Progress -> Review -> Done -> Reopened)")

        # 8. Task Full Details Modification (TaskEditModel)
        edit_res = client.put(
            f"/api/tasks/{task_id}/details",
            json={
                "project_name": "Implement Responsive Kanban View (Refined)",
                "requester": f"@{users_spec['member']['username']}",
                "category": "Architecture",
                "description": "Updated specifications with mobile touch optimization",
                "supporting_access": "Full repo access",
                "start_date": tomorrow_str,
                "deadline": next_week_str,
                "impact": "Critical",
                "etc": 12.5,
                "status": "In Progress"
            },
            headers=headers["member"]
        )
        assert edit_res.status_code == 200
        db.expire_all()
        db_task_edited = db.query(Request).filter(Request.id == task_id).first()
        assert db_task_edited.etc == 12.5
        assert db_task_edited.impact == "Critical"
        assert db_task_edited.category == "Architecture"
        print(" [PASS] 8. Task details modified (ETC updated to 12.5h, Impact to Critical)")

        # 9. Viewer Role Read-Only Restrictions
        # Viewer cannot create tasks (403)
        v_create_res = client.post(
            f"/api/boards/{board_id}/tasks",
            json={
                "project_name": "Illegal Viewer Task",
                "requester": f"@{users_spec['viewer']['username']}",
                "category": "Frontend",
                "description": "Should fail",
                "supporting_access": "None",
                "start_date": tomorrow_str,
                "deadline": next_week_str,
            },
            headers=headers["viewer"]
        )
        assert v_create_res.status_code == 403, f"Expected 403, got {v_create_res.status_code}"

        # Viewer cannot update task status (403)
        v_status_res = client.put(f"/api/tasks/{task_id}", json={"status": "Done"}, headers=headers["viewer"])
        assert v_status_res.status_code == 403

        # Viewer cannot add subtasks (403)
        v_sub_res = client.post(f"/api/tasks/{task_id}/subtasks", json={"task_name": "Viewer subtask"}, headers=headers["viewer"])
        assert v_sub_res.status_code == 403

        # Viewer cannot delete tasks (403)
        v_del_res = client.delete(f"/api/tasks/{task_id}", headers=headers["viewer"])
        assert v_del_res.status_code == 403
        print(" [PASS] 9. Viewer role read-only security enforced (All write actions blocked with 403 Forbidden)")

        # 10. Leaves Management & Integration with Workload
        # Query public holidays
        holidays_res = client.get("/api/leaves/holidays?year=2026")
        assert holidays_res.status_code == 200
        holidays = holidays_res.json().get("holidays", [])
        assert len(holidays) > 0

        # Submit personal leave for member
        leave_start = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
        leave_end = (datetime.now() + timedelta(days=4)).strftime("%Y-%m-%d")
        leave_create_res = client.post(
            "/api/leaves",
            json={
                "start_date": leave_start,
                "end_date": leave_end,
                "description": "Conference Attendance",
                "leave_type": "personal"
            },
            headers=headers["member"]
        )
        assert leave_create_res.status_code == 200

        # Verify leaves endpoint returns the leave
        all_leaves_res = client.get("/api/leaves", headers=headers["member"])
        assert all_leaves_res.status_code == 200
        leaves_data = all_leaves_res.json().get("leaves", [])
        assert any(l.get("description") == "Conference Attendance" for l in leaves_data)
        print(" [PASS] 10. Team leave created and merged into global calendar (Personal leave recognized)")

        # 11. Workload Priority & Capacity Calculation Integration
        # Calculate priority for task considering holidays and member's leave
        leave_dates = get_leave_dates(db)
        prio_str, prio_lvl = calculate_priority(next_week_str, leave_dates)
        prio_display = prio_str.encode("ascii", "ignore").decode("ascii")
        print(f" [PASS] 11. Workload priority calculated against leave calendar (Result: {prio_display} [{prio_lvl}])")

        # 12. Interactive Gantt / Board Tasks Data Integrity
        board_tasks_res = client.get(f"/api/boards/{board_id}/tasks", headers=headers["admin"])
        assert board_tasks_res.status_code == 200
        tasks_on_board = board_tasks_res.json().get("tasks", [])
        assert len(tasks_on_board) >= 1

        first_task = tasks_on_board[0]
        # Verify essential Gantt attributes are provided
        assert "start_date" in first_task or "timestamp" in first_task
        assert "deadline" in first_task
        assert "etc" in first_task
        assert "subtask_total" in first_task
        assert first_task["subtask_total"] >= 1
        print(" [PASS] 12. Board tasks data structure verified for Gantt timeline & Kanban rendering")

        # 13. Subtask & Task Deletion
        del_sub_res = client.delete(f"/api/subtasks/{sub2_id}", headers=headers["admin"])
        assert del_sub_res.status_code == 200

        del_task_res = client.delete(f"/api/tasks/{task_id}", headers=headers["member"])
        assert del_task_res.status_code == 200
        created_task_ids.remove(task_id)

        # Verify task is deleted
        db.expire_all()
        assert db.query(Request).filter(Request.id == task_id).first() is None
        print(" [PASS] 13. Subtask and task deleted cleanly")

        print("=" * 60)
        print(" ALL 13 CORE WORKFLOW & WORKLOAD TEST CASES PASSED (100% SUCCESS)")
        print("=" * 60)

    finally:
        # Cleanup
        try:
            for tid in created_task_ids:
                t = db.query(Request).filter(Request.id == tid).first()
                if t:
                    db.delete(t)
            if board_id:
                b = db.query(Board).filter(Board.id == board_id).first()
                if b:
                    db.delete(b)
            if ws_id:
                ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
                if ws:
                    db.delete(ws)
            for spec in users_spec.values():
                # delete user leaves
                user_leaves = db.query(LeaveRecord).filter(LeaveRecord.username == spec["username"]).all()
                for ul in user_leaves:
                    db.delete(ul)
                u = db.query(User).filter(User.username == spec["username"]).first()
                if u:
                    db.delete(u)
            db.commit()
        except Exception:
            pass
        db.close()


if __name__ == "__main__":
    test_core_workflow_kanban_gantt_and_workload()
