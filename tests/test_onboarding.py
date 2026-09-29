"""
tests/test_onboarding.py
Tests for the first-time user experience (FTUE) and 60-second Aha! Moment onboarding flow.
Verifies that newly registered users receive a populated starter board with interactive tasks.
"""
import pytest
import random
from fastapi.testclient import TestClient
from backend_api import app
from database import SessionLocal, User, Board, Request, Subtask

client = TestClient(app)


def test_new_user_onboarding_starter_board_and_tasks():
    rand_id = random.randint(10000, 99999)
    user_data = {
        "full_name": f"Onboarding Tester {rand_id}",
        "email": f"onboarding_{rand_id}@example.com",
        "username": f"onboard_{rand_id}",
        "password": "Password123!"
    }

    # 1. Register new user
    resp_reg = client.post("/api/register", json=user_data)
    assert resp_reg.status_code == 200, resp_reg.text

    # Verify user email directly in DB
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == user_data["username"]).first()
        assert user is not None
        user.is_verified = 1
        db.commit()
    finally:
        db.close()

    # 2. Login as the new user
    resp_login = client.post("/api/login", json={"username": user_data["username"], "password": user_data["password"]})
    assert resp_login.status_code == 200, resp_login.text
    token = resp_login.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Retrieve workspaces
    resp_ws = client.get("/api/workspaces", headers=headers)
    assert resp_ws.status_code == 200
    workspaces = resp_ws.json()
    assert len(workspaces) == 1
    default_ws_id = workspaces[0]["id"]

    # 4. Retrieve boards in the default workspace
    headers_ws = {"Authorization": f"Bearer {token}", "X-Workspace-ID": str(default_ws_id)}
    resp_boards = client.get("/api/boards", headers=headers_ws)
    assert resp_boards.status_code == 200
    data = resp_boards.json()
    boards = data.get("boards", [])
    if not boards:
        boards = data.get("workspace_boards", [])

    # The user should IMMEDIATELY have a starter board (Zero empty state!)
    assert len(boards) >= 1, "New user must have at least 1 starter board for the Aha! Moment"
    starter_board = next((b for b in boards if "Mulai Cepat alurku." in b["name"]), None)
    assert starter_board is not None, f"Expected 'Mulai Cepat alurku.' in boards: {[b['name'] for b in boards]}"

    # 5. Retrieve tasks from the starter board
    resp_tasks = client.get(f"/api/boards/{starter_board['id']}/tasks", headers=headers_ws)
    assert resp_tasks.status_code == 200
    task_data = resp_tasks.json()
    tasks = task_data.get("tasks", task_data) if isinstance(task_data, dict) else task_data

    # Must contain 3 starter tasks
    assert len(tasks) == 3, f"Expected 3 starter tasks, got {len(tasks)}"

    statuses = {t["status"] for t in tasks}
    assert "To Do" in statuses
    assert "In Progress" in statuses
    assert "Done" in statuses

    # Verify task 1 has subtasks and tags
    task_todo = next(t for t in tasks if t["status"] == "To Do")
    assert task_todo.get("subtask_total") == 2
    assert task_todo.get("subtask_done") == 1
    assert "Panduan" in (task_todo.get("tags") or [])
