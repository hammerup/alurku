from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, text
import re
import json
from datetime import datetime, timedelta
import os

from database import (
    get_db, User, Request, Subtask, Board, BoardMember, LeaveDay, LeaveRecord,
    Comment, Notification, DirectMessage, SecurityLog, get_security_log, set_security_log,
    get_system_policies
)
from schemas import *
from dependencies import *
from utils import *

router = APIRouter()

@router.get("/api/admin/config")
def get_system_config(current_user: str = Depends(get_current_user)):
    if current_user != "admin":
        raise HTTPException(
            status_code=403, detail="Only 'admin' can access system configuration."
        )
    return {
        "smtp_server": os.getenv("SMTP_SERVER", ""),
        "smtp_port": os.getenv("SMTP_PORT", ""),
        "smtp_username": os.getenv("SMTP_USERNAME", ""),
        "smtp_password": "********" if os.getenv("SMTP_PASSWORD") else "",
        "gemini_api_key": "********" if os.getenv("GEMINI_API_KEY") else "",
        "groq_api_key": "********" if os.getenv("GROQ_API_KEY") else "",
        "database_url": "********" if os.getenv("DATABASE_URL") else "",
        "google_calendar_api_key": (
            "********" if os.getenv("GOOGLE_CALENDAR_API_KEY") else ""
        ),
        "secret_key": "********" if os.getenv("SECRET_KEY") else "",
    }


@router.put("/api/admin/config")
def update_system_config(
    payload: SystemConfigModel, current_user: str = Depends(get_current_user)
):
    if current_user != "admin":
        raise HTTPException(
            status_code=403, detail="Only 'admin' can modify system configuration."
        )

    if payload.smtp_server is not None:
        update_env_var("SMTP_SERVER", payload.smtp_server)
    if payload.smtp_port is not None:
        update_env_var("SMTP_PORT", payload.smtp_port)
    if payload.smtp_username is not None:
        update_env_var("SMTP_USERNAME", payload.smtp_username)
    if payload.smtp_password and payload.smtp_password != "********":
        update_env_var("SMTP_PASSWORD", payload.smtp_password)
    if payload.gemini_api_key and payload.gemini_api_key != "********":
        update_env_var("GEMINI_API_KEY", payload.gemini_api_key)
    if payload.groq_api_key and payload.groq_api_key != "********":
        update_env_var("GROQ_API_KEY", payload.groq_api_key)
    if payload.database_url and payload.database_url != "********":
        update_env_var("DATABASE_URL", payload.database_url)
    if (
        payload.google_calendar_api_key
        and payload.google_calendar_api_key != "********"
    ):
        update_env_var("GOOGLE_CALENDAR_API_KEY", payload.google_calendar_api_key)
    if payload.secret_key and payload.secret_key != "********":
        update_env_var("SECRET_KEY", payload.secret_key)

    return {"message": "System configuration updated successfully!"}


@router.post("/api/admin/verify-sudo")
def verify_sudo(
    payload: SudoVerifyModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user != "admin":
        raise HTTPException(
            status_code=403, detail="Only admin can perform this action."
        )
    user = db.query(User).filter(User.username == current_user).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect password.")
    return {"message": "Verified"}


@router.get("/api/admin/users")
def get_all_users(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    users = db.query(User).all()
    return {
        "users": [
            evaluate_user_lifecycle(db, u)
            and {
                "username": u.username,
                "full_name": u.full_name,
                "email": u.email,
                "is_verified": u.is_verified,
                "account_status": u.account_status,
                "deletion_date": u.deletion_date,
                "created_at": u.created_at,
                "is_superadmin": u.is_superadmin,
            }
            for u in users
        ]
    }


@router.put("/api/admin/users/status")
def update_user_status(
    payload: AdminActionModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    username = payload.username
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403)
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404)
    if username == "admin":
        raise HTTPException(status_code=400, detail="Cannot modify root admin")

    user.account_status = payload.status
    if payload.status == "pending_deletion":
        # Gunakan soft_delete_grace_days dari org policy (default 90 hari)
        policies = get_system_policies(db)
        grace_days = max(7, min(int(policies.get("soft_delete_grace_days", 90)), 365))
        user.deletion_date = (datetime.now() + timedelta(days=grace_days)).strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    elif payload.status == "offboarding" and payload.offboard_date:
        user.deletion_date = payload.offboard_date + " 23:59:59"
    else:
        user.deletion_date = None

    db.commit()
    return {"message": f"User status updated to {payload.status.replace('_', ' ')}"}


@router.put("/api/admin/users/superadmin")
def toggle_superadmin(
    payload: AdminActionModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    username = payload.username
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403)
    if username == "admin":
        raise HTTPException(status_code=400, detail="Cannot demote root admin")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404)

    user.is_superadmin = 1 if user.is_superadmin == 0 else 0
    db.commit()
    status_str = (
        "promoted to Super Admin"
        if user.is_superadmin == 1
        else "demoted to regular user"
    )
    return {"message": f"User @{username} has been {status_str}."}


@router.put("/api/admin/users/verify")
def manual_verify_user(
    payload: AdminActionModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    username = payload.username
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified == 1:
        return {"message": f"User @{username} is already verified."}

    user.is_verified = 1
    db.commit()
    return {"message": f"User @{username} has been manually verified."}


@router.post("/api/admin/users/delete")
def admin_delete_user(
    payload: AdminActionModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    username = payload.username
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    if username == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete root admin")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Proactive Ownership Transfer: Reassign owned projects to a team member or admin
    owned_boards = db.query(Board).filter(Board.owner_username == username).all()
    for board in owned_boards:
        # Find the first available team member in the project
        first_member = (
            db.query(BoardMember)
            .filter(
                BoardMember.board_id == board.id,
                BoardMember.status == "accepted",
                BoardMember.member_username != username,
            )
            .first()
        )

        new_owner = "admin"  # Default fallback
        if first_member:
            new_owner = first_member.member_username
            # Promote the member to owner by removing their member entry
            db.delete(first_member)

        board.owner_username = new_owner
        # Log this important event in the project's chat for audit trail
        chat_task = get_or_create_chat_task(db, board.id)
        log_activity(
            db,
            chat_task.id,
            f"**System**: Ownership of this project was automatically transferred to **@{new_owner}** because the original owner **@{username}** was deleted.",
        )

    # Sapu bersih relasi terkait agar tidak terjadi SQL Integrity Error
    db.query(Notification).filter(Notification.user_username == username).delete()
    db.query(BoardMember).filter(BoardMember.member_username == username).delete()
    db.query(LeaveRecord).filter(LeaveRecord.username == username).delete()

    try:
        db.delete(user)
        db.commit()
        return {"message": f"User {username} deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Cannot delete user. They have existing active tasks/comments.",
        )


@router.get("/api/admin/boards")
def get_all_boards_admin(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    boards = db.query(Board).all()
    res = []
    for b in boards:
        owner = db.query(User).filter(User.username == b.owner_username).first()
        owner_status = owner.account_status if owner else "orphan"
        res.append(
            {
                "id": b.id,
                "name": b.name,
                "owner_username": b.owner_username,
                "owner_status": owner_status,
                "created_at": b.created_at,
            }
        )
    return {"boards": res}


@router.put("/api/admin/boards/{board_id}/transfer")
def admin_transfer_board(
    board_id: int,
    payload: TransferBoardModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Project not found")

    new_user = db.query(User).filter(User.username == payload.new_owner).first()
    if not new_user:
        raise HTTPException(status_code=404, detail="New owner user not found")

    board.owner_username = new_user.username
    db.commit()
    create_notification(
        db,
        new_user.username,
        f"Admin transferred ownership of project '{board.name}' to you.",
        "info",
        board.id,
    )
    return {"message": f"Project ownership transferred to @{new_user.username}"}


@router.get("/api/admin/stats")
def get_admin_dashboard_stats(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    total_users = db.query(func.count(User.username)).scalar() or 0
    verified_users = db.query(func.count(User.username)).filter(User.is_verified == 1).scalar() or 0
    superadmins = db.query(func.count(User.username)).filter(User.is_superadmin == 1).scalar() or 0
    frozen_users = db.query(func.count(User.username)).filter(User.account_status == "frozen").scalar() or 0
    pending_deletions = db.query(func.count(User.username)).filter(User.account_status.in_(["pending_deletion", "offboarding"])).scalar() or 0

    total_boards = db.query(func.count(Board.id)).scalar() or 0
    # A board is orphaned if its owner's account status is "pending_deletion", "offboarding", "frozen", or the user doesn't exist
    # For simplicity here we just return the total_boards, but let's calculate orphans by querying Board joined with User
    orphaned_boards = db.query(func.count(Board.id)).outerjoin(User, Board.owner_username == User.username).filter(
        or_(User.username == None, User.account_status.in_(["pending_deletion", "offboarding", "frozen"]))
    ).scalar() or 0

    total_tasks = db.query(func.count(Request.id)).scalar() or 0
    completed_tasks = db.query(func.count(Request.id)).filter(Request.status.ilike("%done%")).scalar() or 0
    pending_tasks = total_tasks - completed_tasks
    total_subtasks = db.query(func.count(Subtask.id)).scalar() or 0
    total_comments = db.query(func.count(Comment.id)).scalar() or 0

    return {
        "users": {
            "total": total_users,
            "verified": verified_users,
            "superadmins": superadmins,
            "frozen": frozen_users,
            "pending_deletions": pending_deletions,
        },
        "projects": {
            "total": total_boards,
            "orphans": orphaned_boards,
        },
        "tasks": {
            "total": total_tasks,
            "pending": pending_tasks,
            "completed": completed_tasks,
            "subtasks": total_subtasks,
            "comments": total_comments,
        },
        "system_health": {
            "database_online": True,
            "db_type": "PostgreSQL" if "postgresql" in os.getenv("DATABASE_URL", "").lower() else "SQLite",
            "smtp_configured": bool(os.getenv("SMTP_SERVER")),
            "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
            "groq_configured": bool(os.getenv("GROQ_API_KEY")),
            "calendar_configured": bool(os.getenv("GOOGLE_CALENDAR_API_KEY")),
            "server_time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "server_time_iso": datetime.utcnow().isoformat() + "Z",
            "server_timezone": "UTC",
        }
    }


@router.get("/api/admin/policies")
def get_admin_system_policies(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    return get_system_policies(db)


@router.put("/api/admin/policies")
def update_system_policies(
    payload: SystemPolicyModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    set_security_log(db, "system_policies", payload.dict())
    return {"message": "Kebijakan sistem berhasil diperbarui / System policies updated successfully!"}


@router.get("/api/public/policies")
def get_public_policies(db: Session = Depends(get_db)):
    """
    Public endpoint — no auth required.
    Returns only safe, UI-relevant policy fields for the frontend
    (excludes any internal or sensitive settings).
    """
    p = get_system_policies(db)
    return {
        "org_name": p.get("org_name", "alurku."),
        "default_language": p.get("default_language", "id"),
        "allow_public_signup": p.get("allow_public_signup", True),
        "default_ai_engine": p.get("default_ai_engine", "auto"),
        "enable_proactive_nudge": p.get("enable_proactive_nudge", True),
        "enable_auto_subtasks": p.get("enable_auto_subtasks", True),
    }


@router.post("/api/admin/maintenance/cleanup-orphans")
def cleanup_orphaned_records(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    valid_task_ids = [t[0] for t in db.query(Request.id).all()]
    deleted_subtasks = db.query(Subtask).filter(~Subtask.request_id.in_(valid_task_ids)).delete(synchronize_session=False) if valid_task_ids else 0
    deleted_comments = db.query(Comment).filter(~Comment.request_id.in_(valid_task_ids)).delete(synchronize_session=False) if valid_task_ids else 0

    db.commit()
    return {
        "message": f"Pembersihan data selesai: {deleted_subtasks} subtask yatim dan {deleted_comments} komentar usang dibersihkan.",
        "cleaned_subtasks": deleted_subtasks,
        "cleaned_comments": deleted_comments,
    }


@router.post("/api/admin/maintenance/purge-expired")
def purge_expired_accounts(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    expired_users = db.query(User).filter(
        User.account_status.in_(["pending_deletion", "offboarding"]),
        User.deletion_date != None,
        User.deletion_date <= now_str,
        User.username != "admin"
    ).all()

    count = 0
    for u in expired_users:
        db.query(Notification).filter(Notification.user_username == u.username).delete()
        db.query(BoardMember).filter(BoardMember.member_username == u.username).delete()
        db.query(LeaveRecord).filter(LeaveRecord.username == u.username).delete()
        db.delete(u)
        count += 1

    db.commit()
    return {"message": f"Berhasil menghapus {count} akun kedaluwarsa secara permanen.", "purged_count": count}


@router.get("/api/admin/content/search")
def admin_content_search(
    q: str = "",
    type: str = "all",
    username: str = "",
    from_date: str = "",
    to_date: str = "",
    page: int = 1,
    per_page: int = 25,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Search across all user-generated content for ToS compliance review."""
    if not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    if per_page > 100:
        per_page = 100
    offset = (page - 1) * per_page
    search_pattern = f"%{q}%" if q else "%"

    results = []
    total = 0

    # Parse date filters safely
    parsed_from = None
    parsed_to = None
    if from_date:
        try:
            parsed_from = datetime.strptime(from_date, "%Y-%m-%d")
        except Exception:
            pass
    if to_date:
        try:
            parsed_to = datetime.strptime(to_date, "%Y-%m-%d") + timedelta(days=1, microseconds=-1)
        except Exception:
            pass

    def apply_date_filter(query, date_col):
        if parsed_from:
            query = query.filter(date_col >= parsed_from)
        if parsed_to:
            query = query.filter(date_col <= parsed_to)
        return query

    # 1. Search Tasks (title + description, excluding internal system tasks)
    if type in ("all", "task"):
        task_query = db.query(Request).filter(
            Request.project_name != "[SYSTEM] PROJECT CHAT"
        )
        if username:
            task_query = task_query.filter(
                or_(Request.requester == username, Request.owner_username == username)
            )
        if q:
            task_query = task_query.filter(
                or_(
                    Request.description.ilike(search_pattern),
                    Request.project_name.ilike(search_pattern),
                    Request.category.ilike(search_pattern),
                )
            )
        task_query = apply_date_filter(task_query, Request.timestamp)
        task_count = task_query.count()
        total += task_count

        tasks = (
            task_query.order_by(Request.id.desc())
            .offset(offset if type == "task" else 0)
            .limit(per_page if type == "task" else min(per_page, 15))
            .all()
        )
        for t in tasks:
            board = db.query(Board).filter(Board.id == t.board_id).first() if t.board_id else None
            results.append({
                "id": t.id,
                "type": "task",
                "author": t.requester or t.owner_username or "Unknown",
                "preview": (t.project_name or "")[:80],
                "content": f"{t.project_name}\n\n{t.description or ''}\n\nCategory: {t.category or ''}",
                "project_name": board.name if board else None,
                "task_title": t.project_name,
                "board_id": t.board_id,
                "task_id": t.id,
                "created_at": t.timestamp.isoformat() if t.timestamp else None,
            })

    # 2. Search Task Comments (normal tasks, not chat)
    if type in ("all", "task_comment"):
        comment_query = (
            db.query(Comment)
            .join(Request, Comment.request_id == Request.id)
            .filter(Request.project_name != "[SYSTEM] PROJECT CHAT")
        )
        if username:
            comment_query = comment_query.filter(Comment.username == username)
        if q:
            comment_query = comment_query.filter(Comment.text.ilike(search_pattern))
        comment_query = apply_date_filter(comment_query, Comment.timestamp)
        comment_count = comment_query.count()
        total += comment_count

        comments = (
            comment_query.order_by(Comment.id.desc())
            .offset(offset if type == "task_comment" else 0)
            .limit(per_page if type == "task_comment" else min(per_page, 15))
            .all()
        )
        for c in comments:
            task = db.query(Request).filter(Request.id == c.request_id).first()
            board = db.query(Board).filter(Board.id == task.board_id).first() if (task and task.board_id) else None
            results.append({
                "id": c.id,
                "type": "task_comment",
                "author": c.username,
                "preview": (c.text or "")[:80],
                "content": c.text,
                "project_name": board.name if board else None,
                "task_title": task.project_name if task else None,
                "board_id": task.board_id if task else None,
                "task_id": c.request_id,
                "created_at": c.timestamp.isoformat() if c.timestamp else None,
            })

    # 3. Search Team Chat (comments on [SYSTEM] PROJECT CHAT tasks)
    if type in ("all", "chat"):
        chat_query = (
            db.query(Comment)
            .join(Request, Comment.request_id == Request.id)
            .filter(Request.project_name == "[SYSTEM] PROJECT CHAT")
        )
        if username:
            chat_query = chat_query.filter(Comment.username == username)
        if q:
            chat_query = chat_query.filter(Comment.text.ilike(search_pattern))
        chat_query = apply_date_filter(chat_query, Comment.timestamp)
        chat_count = chat_query.count()
        total += chat_count

        chats = (
            chat_query.order_by(Comment.id.desc())
            .offset(offset if type == "chat" else 0)
            .limit(per_page if type == "chat" else min(per_page, 15))
            .all()
        )
        for ch in chats:
            chat_task = db.query(Request).filter(Request.id == ch.request_id).first()
            board = db.query(Board).filter(Board.id == chat_task.board_id).first() if (chat_task and chat_task.board_id) else None
            results.append({
                "id": ch.id,
                "type": "chat",
                "author": ch.username,
                "preview": (ch.text or "")[:80],
                "content": ch.text,
                "project_name": board.name if board else None,
                "task_title": None,
                "board_id": chat_task.board_id if chat_task else None,
                "task_id": ch.request_id,
                "created_at": ch.timestamp.isoformat() if ch.timestamp else None,
            })

    # 4. Search Direct Messages
    if type in ("all", "dm"):
        dm_query = db.query(DirectMessage)
        if username:
            dm_query = dm_query.filter(
                or_(
                    DirectMessage.sender_username == username,
                    DirectMessage.receiver_username == username,
                )
            )
        if q:
            dm_query = dm_query.filter(DirectMessage.text.ilike(search_pattern))
        dm_query = apply_date_filter(dm_query, DirectMessage.timestamp)
        dm_count = dm_query.count()
        total += dm_count

        dms = (
            dm_query.order_by(DirectMessage.id.desc())
            .offset(offset if type == "dm" else 0)
            .limit(per_page if type == "dm" else min(per_page, 15))
            .all()
        )
        for dm in dms:
            results.append({
                "id": dm.id,
                "type": "dm",
                "author": dm.sender_username,
                "preview": (dm.text or "")[:80],
                "content": dm.text,
                "project_name": None,
                "task_title": f"DM → @{dm.receiver_username}",
                "board_id": None,
                "task_id": None,
                "created_at": dm.timestamp.isoformat() if dm.timestamp else None,
            })

    # Sort all results by created_at descending when type is 'all'
    if type == "all":
        results.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        results = results[:per_page]

    return {
        "results": results,
        "total": total,
        "page": page,
        "per_page": per_page,
    }

