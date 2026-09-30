import pytest
import sys
import os
import random
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api import app
from database import SessionLocal, User, Workspace, WorkspaceMember, Board, Request
from dependencies import get_password_hash

client = TestClient(app)

def test_task_tags_lifecycle():
    rand_suffix = random.randint(10000, 99999)
    db = SessionLocal()

    username = f"tag_tester_{rand_suffix}"
    email = f"tag_tester_{rand_suffix}@alurku.app"

    try:
        # 1. Create and authenticate user
        user = User(
            username=username,
            email=email,
            full_name="Tag Tester",
            password=get_password_hash("Password123!"),
            is_verified=1,
            account_status="active"
        )
        db.add(user)
        db.commit()

        login_res = client.post("/api/login", json={"username": username, "password": "Password123!"})
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create workspace
        ws_res = client.post("/api/workspaces", json={"name": f"Tag Test Workspace {rand_suffix}"}, headers=headers)
        assert ws_res.status_code == 200, f"Create workspace failed: {ws_res.text}"
        ws_id = ws_res.json()["workspace"]["id"]
        headers["X-Active-Workspace-ID"] = str(ws_id)

        # 3. Create project/board
        board_res = client.post("/api/boards", json={"name": f"Tag Test Board {rand_suffix}"}, headers=headers)
        assert board_res.status_code == 200, f"Create board failed: {board_res.text}"
        board_id = board_res.json()["board_id"]

        # 4. Create task WITH tags (as a list of strings)
        initial_tags = ["Bug", "Urgent", "Frontend"]
        task_payload = {
            "project_name": "Fix Navbar Rendering Bug",
            "requester": f"@{username}",
            "category": "Development",
            "description": "Fix alignment on smaller screens",
            "supporting_access": "https://alurku.app",
            "start_date": "2026-09-30",
            "deadline": "2026-10-05 17:00:00",
            "impact": "High",
            "etc": 3.0,
            "tags": initial_tags,
            "subtasks": []
        }
        create_res = client.post(f"/api/boards/{board_id}/tasks", json=task_payload, headers=headers)
        assert create_res.status_code == 200, f"Create task failed: {create_res.text}"
        task_data = create_res.json()
        task_id = task_data.get("task_id")
        assert task_id is not None
        assert "tags" in task_data
        assert task_data["tags"] == initial_tags

        # 5. Fetch board tasks and verify tags are present
        board_tasks_res = client.get(f"/api/boards/{board_id}/tasks", headers=headers)
        assert board_tasks_res.status_code == 200, f"Get board tasks failed: {board_tasks_res.text}"
        tasks = board_tasks_res.json().get("tasks", [])
        assert len(tasks) >= 1
        created_task = next((t for t in tasks if t["id"] == task_id), None)
        assert created_task is not None
        assert "tags" in created_task
        assert created_task["tags"] == ["Bug", "Urgent", "Frontend"]

        # 6. Fetch single task detail and verify tags
        detail_res = client.get(f"/api/tasks/{task_id}", headers=headers)
        assert detail_res.status_code == 200, f"Get task detail failed: {detail_res.text}"
        detail_data = detail_res.json()
        assert "task" in detail_data
        assert detail_data["task"]["tags"] == ["Bug", "Urgent", "Frontend"]

        # 7. Update task tags via PUT /api/tasks/{task_id}/details
        updated_tags = ["Bug", "Urgent", "UI/UX", "Review"]
        update_detail_payload = {
            "project_name": "Fix Navbar Rendering Bug (Updated)",
            "requester": f"@{username}",
            "category": "Development",
            "description": "Fix alignment on smaller screens - updated details",
            "supporting_access": "https://alurku.app",
            "start_date": "2026-09-30",
            "deadline": "2026-10-05 17:00:00",
            "impact": "High",
            "etc": 4.0,
            "status": "Pending",
            "board_id": board_id,
            "tags": updated_tags
        }
        update_detail_res = client.put(f"/api/tasks/{task_id}/details", json=update_detail_payload, headers=headers)
        assert update_detail_res.status_code == 200, f"Update task details failed: {update_detail_res.text}"
        assert update_detail_res.json()["tags"] == updated_tags

        # Verify detail reflects updated tags
        detail_res2 = client.get(f"/api/tasks/{task_id}", headers=headers)
        assert detail_res2.status_code == 200
        assert detail_res2.json()["task"]["tags"] == updated_tags

        # 8. Update task tags via dedicated PUT /api/tasks/{task_id}/tags
        new_tag_set = ["Backend", "Security"]
        tags_update_res = client.put(f"/api/tasks/{task_id}/tags", json={"tags": new_tag_set}, headers=headers)
        assert tags_update_res.status_code == 200, f"Update tags failed: {tags_update_res.text}"
        assert tags_update_res.json()["tags"] == new_tag_set

        # Verify board tasks returns the latest tags
        board_tasks_res2 = client.get(f"/api/boards/{board_id}/tasks", headers=headers)
        assert board_tasks_res2.status_code == 200
        task_after_tag_update = next(t for t in board_tasks_res2.json()["tasks"] if t["id"] == task_id)
        assert task_after_tag_update["tags"] == new_tag_set

        # 9. Update task tags via status PUT /api/tasks/{task_id} with TaskUpdateModel
        status_tag_res = client.put(f"/api/tasks/{task_id}", json={"status": "In Progress", "tags": ["DevOps", "CI/CD"]}, headers=headers)
        assert status_tag_res.status_code == 200
        assert status_tag_res.json()["tags"] == ["DevOps", "CI/CD"]

        # 10. Verify get_all_global_tasks returns tags
        all_tasks_res = client.get("/api/tasks/all", headers=headers)
        assert all_tasks_res.status_code == 200
        all_task_item = next((t for t in all_tasks_res.json()["tasks"] if t["id"] == task_id), None)
        assert all_task_item is not None
        assert all_task_item["tags"] == ["DevOps", "CI/CD"]

        # 11. Verify my-tasks endpoint returns tags
        my_tasks_res = client.get("/api/my-tasks", headers=headers)
        assert my_tasks_res.status_code == 200
        my_task_item = next((t for t in my_tasks_res.json()["tasks"] if t["id"] == task_id), None)
        assert my_task_item is not None
        assert my_task_item["tags"] == ["DevOps", "CI/CD"]

        # 12. Create task with comma-separated tags string and verify auto-serialization
        comma_task_payload = {
            "project_name": "Task with comma string tags",
            "requester": f"@{username}",
            "category": "Design",
            "description": "Comma tags test",
            "supporting_access": "",
            "start_date": "2026-09-30",
            "deadline": "2026-10-05 17:00:00",
            "tags": "Mobile, Flutter, Urgent",
            "subtasks": []
        }
        comma_res = client.post(f"/api/boards/{board_id}/tasks", json=comma_task_payload, headers=headers)
        assert comma_res.status_code == 200
        assert comma_res.json()["tags"] == ["Mobile", "Flutter", "Urgent"]

    finally:
        # Cleanup test data
        try:
            db.query(Request).filter(Request.owner_username == username).delete()
            db.query(Board).filter(Board.owner_username == username).delete()
            db.query(WorkspaceMember).filter(WorkspaceMember.username == username).delete()
            db.query(Workspace).filter(Workspace.owner_username == username).delete()
            db.query(User).filter(User.username == username).delete()
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()
