import pytest
import io
import random
from fastapi.testclient import TestClient
from backend_api import app
from database import SessionLocal, User, Board, BoardMember, Request, TaskAttachment, Workspace, WorkspaceMember
from dependencies import get_password_hash

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_attachment_env():
    rand_suffix = random.randint(10000, 99999)
    db = SessionLocal()
    
    username = f"att_user_{rand_suffix}"
    email = f"att_user_{rand_suffix}@alurku.app"
    password = "Password123!"

    try:
        user = User(
            username=username,
            email=email,
            full_name="Attachment Tester",
            password=get_password_hash(password),
            is_verified=1,
            account_status="active"
        )
        db.add(user)
        db.commit()

        # Login
        login_res = client.post("/api/login", json={"username": username, "password": password})
        assert login_res.status_code == 200, login_res.text
        token = login_res.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create Workspace
        ws = Workspace(name="Attachment Test WS", owner_username=username)
        db.add(ws)
        db.commit()
        db.refresh(ws)

        wm = WorkspaceMember(workspace_id=ws.id, username=username, role="admin")
        db.add(wm)

        # Create Board
        board = Board(
            name="Attachment Project",
            owner_username=username,
            workspace_id=ws.id,
            statuses='["Pending", "In Progress", "Done"]',
            categories='["Development", "Design"]'
        )
        db.add(board)
        db.commit()
        db.refresh(board)

        # Create Task
        task = Request(
            project_name="Test Task for Attachments",
            requester=f"@{username}",
            category="Development",
            owner_username=username,
            board_id=board.id,
            workspace_id=ws.id,
            status="Pending"
        )
        db.add(task)
        db.commit()
        db.refresh(task)

        yield {
            "headers": headers,
            "task_id": task.id,
            "username": username
        }

    finally:
        # Cleanup
        try:
            db.query(TaskAttachment).filter(TaskAttachment.uploader_username == username).delete()
            db.query(Request).filter(Request.owner_username == username).delete()
            db.query(Board).filter(Board.owner_username == username).delete()
            db.query(WorkspaceMember).filter(WorkspaceMember.username == username).delete()
            db.query(Workspace).filter(Workspace.owner_username == username).delete()
            db.query(User).filter(User.username == username).delete()
            db.commit()
        except Exception:
            pass
        db.close()


def test_upload_valid_attachment(setup_attachment_env):
    headers = setup_attachment_env["headers"]
    task_id = setup_attachment_env["task_id"]

    file_content = b"Hello from Alurku attachment test document!"
    files = [
        ("files", ("test_document.txt", io.BytesIO(file_content), "text/plain"))
    ]
    
    res = client.post(f"/api/tasks/{task_id}/attachments", files=files, headers=headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert len(data["attachments"]) == 1
    att = data["attachments"][0]
    assert att["filename"] == "test_document.txt"
    assert att["file_size"] == len(file_content)
    att_id = att["id"]

    # Verify listing
    list_res = client.get(f"/api/tasks/{task_id}/attachments", headers=headers)
    assert list_res.status_code == 200
    attachments = list_res.json()["attachments"]
    assert any(a["id"] == att_id for a in attachments)

    # Verify download
    dl_res = client.get(f"/api/attachments/{att_id}/download", headers=headers)
    assert dl_res.status_code == 200
    assert dl_res.content == file_content
    assert "test_document.txt" in dl_res.headers.get("Content-Disposition", "")

    # Verify preview
    pv_res = client.get(f"/api/attachments/{att_id}/preview", headers=headers)
    assert pv_res.status_code == 200
    assert "inline" in pv_res.headers.get("Content-Disposition", "")

    # Verify delete
    del_res = client.delete(f"/api/tasks/{task_id}/attachments/{att_id}", headers=headers)
    assert del_res.status_code == 200

    # Verify deleted from list
    list_after = client.get(f"/api/tasks/{task_id}/attachments", headers=headers)
    assert not any(a["id"] == att_id for a in list_after.json()["attachments"])


def test_reject_dangerous_extension(setup_attachment_env):
    headers = setup_attachment_env["headers"]
    task_id = setup_attachment_env["task_id"]

    malicious_content = b"echo 'malicious script'"
    files = [
        ("files", ("exploit.exe", io.BytesIO(malicious_content), "application/octet-stream"))
    ]
    res = client.post(f"/api/tasks/{task_id}/attachments", files=files, headers=headers)
    assert res.status_code == 400
    assert "tidak diizinkan" in res.json()["detail"]


def test_reject_unsupported_extension(setup_attachment_env):
    headers = setup_attachment_env["headers"]
    task_id = setup_attachment_env["task_id"]

    files = [
        ("files", ("unknown.xyz123", io.BytesIO(b"data"), "application/octet-stream"))
    ]
    res = client.post(f"/api/tasks/{task_id}/attachments", files=files, headers=headers)
    assert res.status_code == 400
    assert "belum didukung" in res.json()["detail"]
