import pytest
from fastapi.testclient import TestClient
import sys
import os
import io
import random
import json

# Add root directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api import app
from database import SessionLocal, User, Board, BoardMember, Request, Subtask, Workspace, WorkspaceMember, set_security_log, get_security_log

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_test_environment():
    db = SessionLocal()
    # Ensure public signup is enabled
    existing_p = get_security_log(db, "system_policies", {})
    if not isinstance(existing_p, dict):
        existing_p = {}
    set_security_log(db, "system_policies", {**existing_p, "allow_public_signup": True, "allowed_domains": ""})
    db.commit()

    rand_id = random.randint(10000, 99999)
    username_a = f"exporter_{rand_id}"
    user_a = {
        "full_name": f"Export Master {rand_id}",
        "email": f"export_{rand_id}@alurku.com",
        "username": username_a,
        "password": "SecretPassword123!"
    }
    username_b = f"outsider_{rand_id}"
    user_b = {
        "full_name": f"Outsider {rand_id}",
        "email": f"outsider_{rand_id}@alurku.com",
        "username": username_b,
        "password": "SecretPassword123!"
    }

    # Register users
    resp_a = client.post("/api/register", json=user_a)
    assert resp_a.status_code == 200
    resp_b = client.post("/api/register", json=user_b)
    assert resp_b.status_code == 200

    # Auto-verify email
    db.query(User).filter(User.username.in_([username_a, username_b])).update({"is_verified": 1})
    db.commit()

    # Login user A
    login_a = client.post("/api/login", json={"username": user_a["username"], "password": user_a["password"]})
    assert login_a.status_code == 200
    token_a = login_a.json()["token"]

    # Login user B
    login_b = client.post("/api/login", json={"username": user_b["username"], "password": user_b["password"]})
    assert login_b.status_code == 200
    token_b = login_b.json()["token"]

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Retrieve auto-provisioned workspace for User A
    ws_resp = client.get("/api/workspaces", headers=headers_a)
    assert ws_resp.status_code == 200
    ws_list = ws_resp.json()
    assert len(ws_list) >= 1
    workspace_id = ws_list[0]["id"]

    headers_a["X-Workspace-ID"] = str(workspace_id)

    # Create a project board for User A
    board_resp = client.post(
        "/api/boards",
        json={"name": f"Export Board {rand_id}", "is_private": 0},
        headers=headers_a
    )
    assert board_resp.status_code == 200
    board_id = board_resp.json().get("board_id") or board_resp.json().get("id")

    # Create sample task with subtasks
    task_payload = {
        "project_name": "Task for CSV Export",
        "requester": f"@{username_a}",
        "category": "Development",
        "description": "Export test task brief description",
        "supporting_access": "https://alurku.com",
        "start_date": "2026-10-01",
        "deadline": "2026-10-15",
        "impact": "High",
        "etc": 4.5,
        "subtasks": [
            {"task_name": "Subtask 1 - Architecture", "assignee": username_a},
            {"task_name": "Subtask 2 - QA Review", "assignee": ""}
        ]
    }
    create_task_resp = client.post(f"/api/boards/{board_id}/tasks", json=task_payload, headers=headers_a)
    assert create_task_resp.status_code == 200

    db.close()

    yield {
        "username_a": username_a,
        "username_b": username_b,
        "token_a": token_a,
        "token_b": token_b,
        "headers_a": headers_a,
        "headers_b": headers_b,
        "workspace_id": workspace_id,
        "board_id": board_id,
    }


def test_export_csv_endpoint(setup_test_environment):
    env = setup_test_environment
    board_id = env["board_id"]
    headers_a = env["headers_a"]
    headers_b = env["headers_b"]

    # 1. User A successfully exports CSV
    resp = client.get(f"/api/boards/{board_id}/export-csv", headers=headers_a)
    assert resp.status_code == 200
    assert "text/csv" in resp.headers.get("content-type", "")
    assert f'attachment; filename="alurku-board-{board_id}-tasks.csv"' in resp.headers.get("content-disposition", "")

    csv_text = resp.text
    # Expected headers: ID, Judul Tugas, Pemohon, Kategori, Status, Prioritas, Start Date, Deadline, Estimasi Jam, Subtasks
    expected_headers = ["ID", "Judul Tugas", "Pemohon", "Kategori", "Status", "Prioritas", "Start Date", "Deadline", "Estimasi Jam", "Subtasks"]
    for header in expected_headers:
        assert header in csv_text

    # Expected task contents in CSV
    assert "Task for CSV Export" in csv_text
    assert "Development" in csv_text
    assert "High" in csv_text
    assert "Subtask 1 - Architecture" in csv_text

    # 2. User B (outsider) gets 403 Access Denied
    resp_denied = client.get(f"/api/boards/{board_id}/export-csv", headers=headers_b)
    assert resp_denied.status_code == 403


def test_import_csv_endpoint_comma(setup_test_environment):
    env = setup_test_environment
    board_id = env["board_id"]
    headers_a = env["headers_a"]

    # Prepare sample valid CSV data with comma delimiter
    csv_content = (
        "Judul Tugas,Pemohon,Kategori,Status,Prioritas,Start Date,Deadline,Estimasi Jam,Subtasks\n"
        "Fitur Integrasi CSV,@alice,Development,Pending,High,2026-10-01,2026-10-10,3.5,[x] Buat Parser (@alice); [ ] Testing Impor (@bob)\n"
        "Desain Halaman Impor,@charlie,Design,In Progress,Medium,2026-10-02,2026-10-12,2.0,Wireframe Baru; Mockup Figma\n"
    )

    file_bytes = io.BytesIO(csv_content.encode("utf-8"))
    files = {"file": ("tasks_comma.csv", file_bytes, "text/csv")}

    resp = client.post(f"/api/boards/{board_id}/import-csv", files=files, headers=headers_a)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["imported_count"] == 2

    # Verify tasks and subtasks are created in database
    db = SessionLocal()
    task1 = db.query(Request).filter(Request.board_id == board_id, Request.project_name == "Fitur Integrasi CSV").first()
    assert task1 is not None
    assert task1.category == "Development"
    assert task1.impact == "High"
    assert task1.etc == 3.5

    subtasks1 = db.query(Subtask).filter(Subtask.request_id == task1.id).order_by(Subtask.position.asc()).all()
    assert len(subtasks1) == 2
    assert subtasks1[0].task_name == "Buat Parser"
    assert subtasks1[0].is_done == 1
    assert subtasks1[0].assignee == "alice"
    assert subtasks1[1].task_name == "Testing Impor"
    assert subtasks1[1].is_done == 0
    assert subtasks1[1].assignee == "bob"

    task2 = db.query(Request).filter(Request.board_id == board_id, Request.project_name == "Desain Halaman Impor").first()
    assert task2 is not None
    assert task2.category == "Design"
    assert task2.status == "In Progress"

    subtasks2 = db.query(Subtask).filter(Subtask.request_id == task2.id).order_by(Subtask.position.asc()).all()
    assert len(subtasks2) == 2
    assert subtasks2[0].task_name == "Wireframe Baru"
    assert subtasks2[1].task_name == "Mockup Figma"

    db.close()


def test_import_csv_endpoint_semicolon(setup_test_environment):
    env = setup_test_environment
    board_id = env["board_id"]
    headers_a = env["headers_a"]

    # Semicolon-delimited CSV test
    csv_content = (
        "Judul Tugas;Pemohon;Kategori;Status;Prioritas;Start Date;Deadline;Estimasi Jam;Subtasks\n"
        "Migrasi Database PostgreSQL;@dave;Maintenance;Pending;High;2026-10-05;2026-10-20;5;[ ] Backup Skema; [x] Buat Skrip\n"
    )

    file_bytes = io.BytesIO(csv_content.encode("utf-8-sig"))
    files = {"file": ("tasks_semicolon.csv", file_bytes, "text/csv")}

    resp = client.post(f"/api/boards/{board_id}/import-csv", files=files, headers=headers_a)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["imported_count"] == 1

    # Verify task in DB
    db = SessionLocal()
    task = db.query(Request).filter(Request.board_id == board_id, Request.project_name == "Migrasi Database PostgreSQL").first()
    assert task is not None
    assert task.category == "Maintenance"
    assert task.etc == 5.0
    db.close()


def test_import_csv_access_denied(setup_test_environment):
    env = setup_test_environment
    board_id = env["board_id"]
    headers_b = env["headers_b"]

    csv_content = "Judul Tugas,Pemohon\nTugas Ilegal,@hacker\n"
    file_bytes = io.BytesIO(csv_content.encode("utf-8"))
    files = {"file": ("illegal.csv", file_bytes, "text/csv")}

    resp = client.post(f"/api/boards/{board_id}/import-csv", files=files, headers=headers_b)
    assert resp.status_code == 403


def test_export_json_endpoint(setup_test_environment):
    env = setup_test_environment
    workspace_id = env["workspace_id"]
    headers_a = env["headers_a"]
    headers_b = env["headers_b"]

    # 1. User A successfully exports JSON
    resp = client.get(f"/api/workspaces/{workspace_id}/export-json", headers=headers_a)
    assert resp.status_code == 200
    data = resp.json()

    assert "version" in data
    assert data["version"] == "1.0"
    assert "exported_at" in data
    assert "workspace" in data
    assert data["workspace"]["id"] == workspace_id
    assert "owner_username" in data["workspace"]

    assert "members" in data
    assert len(data["members"]) >= 1

    assert "boards" in data
    assert len(data["boards"]) >= 1

    # Verify boards contain tasks and subtasks
    found_board = False
    for b in data["boards"]:
        if b["id"] == env["board_id"]:
            found_board = True
            assert "tasks" in b
            assert len(b["tasks"]) >= 1
            for t in b["tasks"]:
                assert "id" in t
                assert "project_name" in t
                assert "subtasks" in t
    assert found_board is True

    # 2. User B (outsider) gets 403 Access Denied
    resp_denied = client.get(f"/api/workspaces/{workspace_id}/export-json", headers=headers_b)
    assert resp_denied.status_code == 403

    # 3. Nonexistent workspace returns 404
    resp_404 = client.get("/api/workspaces/99999999/export-json", headers=headers_a)
    assert resp_404.status_code == 404
