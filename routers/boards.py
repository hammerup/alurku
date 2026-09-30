from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks, Request as FastAPIRequest
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, text
import re
import json
import csv
import io
from datetime import datetime, timedelta
import os

from database import get_db, User, Request, Subtask, Board, BoardMember, LeaveDay, LeaveRecord, Comment, Notification, DirectMessage, Workspace, WorkspaceMember
from schemas import *
from dependencies import *
from utils import *
from routers.workspaces import get_active_workspace_id, get_write_active_workspace_id
from services.tier_service import enforce_can_create_project

router = APIRouter()

@router.get("/api/boards")
def get_boards(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
    workspace_id: int = Depends(get_active_workspace_id)
):
    # Ensure starter onboarding board exists for an instant Aha! Moment
    starter_board_exists = db.query(Board).filter(
        Board.workspace_id == workspace_id,
        Board.name == "Mulai Cepat alurku."
    ).first()
    if not starter_board_exists:
        try:
            seed_starter_board_for_workspace(db, workspace_id, current_user)
        except Exception as e:
            print(f"[Seed Starter Board Warning]: {e}")

    # Auto-create a private "Personal Tasks" board if it doesn't exist in the active workspace
    todo_exists = db.query(Board).filter(
        Board.owner_username == current_user,
        Board.is_private == 1,
        Board.workspace_id == workspace_id
    ).first()
    
    if not todo_exists:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        default_statuses = json.dumps(["Pending", "In Progress", "Done", "Rejected"])
        default_categories = json.dumps(
            [
                "Development",
                "Design",
                "Marketing",
                "Research",
                "Maintenance",
                "Consulting",
                "Other",
            ]
        )
        new_todo = Board(
            name="Personal Tasks",
            owner_username=current_user,
            created_at=now_str,
            statuses=default_statuses,
            categories=default_categories,
            is_private=1,
            workspace_id=workspace_id
        )
        db.add(new_todo)
        try:
            db.commit()
        except Exception as e:
            db.rollback()

    owned = db.query(Board).filter(
        Board.owner_username == current_user,
        Board.workspace_id == workspace_id,
        or_(Board.is_archived == 0, Board.is_archived == None)
    ).all()
    member_links = (
        db.query(BoardMember)
        .filter(
            BoardMember.member_username == current_user,
            BoardMember.status == "accepted",
        )
        .all()
    )
    shared = [
        b for m in member_links
        if (b := db.query(Board).filter(Board.id == m.board_id, Board.workspace_id == workspace_id).first()) is not None
        and b.owner_username != current_user
    ]

    # Workspace Owners & Admins can supervision-access ALL public workspace boards
    ws_obj = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    is_ws_owner = (ws_obj and ws_obj.owner_username == current_user)
    ws_membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == current_user
    ).first()
    is_ws_admin = is_ws_owner or (ws_membership and ws_membership.role == "admin") or is_user_superadmin(db, current_user)

    ws_public_boards = []
    if is_ws_admin:
        ws_public_boards = db.query(Board).filter(
            Board.workspace_id == workspace_id,
            or_(Board.is_private == 0, Board.is_private == None),
            or_(Board.is_archived == 0, Board.is_archived == None)
        ).all()

    # Auto-access System Feedback board for superadmins
    is_sa = db.query(User).filter(User.username == current_user, User.is_superadmin == 1).first()
    if is_sa:
        feedback_board = db.query(Board).filter(Board.owner_username == "admin", Board.name == "System Feedback").first()
        if feedback_board:
            if feedback_board.owner_username == current_user:
                if not any(b.id == feedback_board.id for b in owned):
                    owned.append(feedback_board)
            else:
                if not any(b.id == feedback_board.id for b in shared):
                    shared.append(feedback_board)

    leave_dates = get_leave_dates(db)
    personal_leaves_db = (
        db.query(LeaveRecord.leave_date, LeaveRecord.username)
        .filter(LeaveRecord.leave_type == "personal")
        .all()
    )
    personal_leaves = {}
    for ldate, uname in personal_leaves_db:
        if uname not in personal_leaves:
            personal_leaves[uname] = set()
        if ldate:
            date_str = ldate.strftime("%Y-%m-%d") if hasattr(ldate, "strftime") else str(ldate)[:10]
            personal_leaves[uname].add(date_str)

    def get_metrics(board_id):
        tasks = (
            db.query(Request)
            .filter(
                Request.board_id == board_id,
                or_(Request.requester == None, Request.requester != "System"),
                or_(
                    Request.project_name == None,
                    Request.project_name != "[SYSTEM] PROJECT CHAT",
                ),
            )
            .all()
        )
        total = len(tasks)
        done = sum(1 for t in tasks if t.status == "Done")
        my_pending = 0
        curr_user_lower = current_user.lower()

        member_critical = defaultdict(int)
        member_active = defaultdict(int)

        for t in tasks:
            if t.status in ["Done", "Rejected"]:
                continue
            assignees = get_assignees(t.requester)
            if t.owner_username:
                assignees.add(t.owner_username)

            is_mine = curr_user_lower in [a.lower() for a in assignees]

            if (
                not is_mine
                and t.owner_username
                and t.owner_username.lower() == curr_user_lower
            ):
                is_mine = True

            if not is_mine:
                subs = db.query(Subtask).filter(Subtask.request_id == t.id).all()
                for s in subs:
                    if (
                        s.assignee
                        and s.assignee.lower() == curr_user_lower
                        and s.is_done == 0
                    ):
                        is_mine = True
                        break
            if is_mine:
                my_pending += 1

            # For Health Alert Summary
            task_leaves = set(leave_dates)
            for a in assignees:
                task_leaves.update(personal_leaves.get(a, set()))

            prio_str, prio_lvl = calculate_priority(t.deadline or "", task_leaves)
            for a in assignees:
                member_active[a] += 1
                if prio_lvl == "critical":
                    member_critical[a] += 1

        alert_msg = ""
        if member_critical:
            max_c = max(member_critical.values())
            top_c = [m for m, c in member_critical.items() if c == max_c]
            names = (
                f"@{top_c[0]}, @{top_c[1]} and {len(top_c)-2} others"
                if len(top_c) > 2
                else " and ".join([f"@{m}" for m in top_c])
            )
            alert_msg = f"Attention! {names} has {max_c} critical task(s). They might need immediate backup."
        elif member_active:
            max_a = max(member_active.values())
            if max_a >= 3:
                top_a = [m for m, c in member_active.items() if c == max_a]
                names = " and ".join([f"@{m}" for m in top_a[:2]]) + (
                    " and others" if len(top_a) > 2 else ""
                )
                alert_msg = (
                    f"Workload Notice: {names} is carrying {max_a} active requests."
                )

        if not alert_msg and total > 0 and done == total:
            alert_msg = "All tasks are completed! Great job team. ✨"
        elif not alert_msg and total > 0:
            alert_msg = "Project is on track. Keep it up! ✨"

        requests_count = db.query(BoardMember).filter(BoardMember.board_id == board_id, BoardMember.status == "requesting").count()

        return total, done, my_pending, alert_msg, requests_count

    res = []
    valid_owned = [b for b in owned if not evaluate_board_lifecycle(db, b)]
    for b in valid_owned:
        total, done, my_pending, alert_msg, requests_count = get_metrics(b.id)

        # Pre-fetch Top 5 Members untuk List View UI
        members_db = (
            db.query(BoardMember.member_username)
            .filter(BoardMember.board_id == b.id, BoardMember.status == "accepted")
            .limit(19)
            .all()
        )
        team = [b.owner_username] + [
            m[0] for m in members_db if m[0] != b.owner_username
        ]
        team_preview = team[:20]

        res.append(
            {
                "id": b.id,
                "name": b.name,
                "owner_username": b.owner_username,
                "role": "owner",
                "total_tasks": total,
                "done_tasks": done,
                "my_pending": my_pending,
                "statuses": b.statuses,
                "categories": b.categories,
                "deletion_date": b.deletion_date,
                "created_at": b.created_at,
                "team_preview": team_preview,
                "health_alert": alert_msg,
                "is_private": getattr(b, "is_private", 0),
                "access_requests_count": requests_count,
            }
        )
    valid_shared = [b for b in shared if b and not evaluate_board_lifecycle(db, b)]
    for b in valid_shared:
        if True:
            total, done, my_pending, alert_msg, requests_count = get_metrics(b.id)

            # Pre-fetch Top 5 Members untuk List View UI
            members_db = (
                db.query(BoardMember.member_username)
                .filter(BoardMember.board_id == b.id, BoardMember.status == "accepted")
                .limit(19)
                .all()
            )
            team = [b.owner_username] + [
                m[0] for m in members_db if m[0] != b.owner_username
            ]
            team_preview = team[:20]

            res.append(
                {
                    "id": b.id,
                    "name": b.name,
                    "owner_username": b.owner_username,
                    "role": "member",
                    "total_tasks": total,
                    "done_tasks": done,
                    "my_pending": my_pending,
                    "statuses": b.statuses,
                    "categories": b.categories,
                    "deletion_date": b.deletion_date,
                    "created_at": b.created_at,
                    "team_preview": team_preview,
                    "health_alert": alert_msg,
                    "is_private": getattr(b, "is_private", 0),
                    "access_requests_count": requests_count,
                }
            )
    ws_res = list(res)
    if is_ws_admin and ws_public_boards:
        existing_ids = {b["id"] for b in ws_res}
        for pb in ws_public_boards:
            if pb and pb.id not in existing_ids and not evaluate_board_lifecycle(db, pb):
                total, done, my_pending, alert_msg, requests_count = get_metrics(pb.id)
                members_db = (
                    db.query(BoardMember.member_username)
                    .filter(BoardMember.board_id == pb.id, BoardMember.status == "accepted")
                    .limit(19)
                    .all()
                )
                team = [pb.owner_username] + [
                    m[0] for m in members_db if m[0] != pb.owner_username
                ]
                ws_res.append(
                    {
                        "id": pb.id,
                        "name": pb.name,
                        "owner_username": pb.owner_username,
                        "role": "workspace_admin" if pb.owner_username != current_user else "owner",
                        "total_tasks": total,
                        "done_tasks": done,
                        "my_pending": my_pending,
                        "statuses": pb.statuses,
                        "categories": pb.categories,
                        "deletion_date": pb.deletion_date,
                        "created_at": pb.created_at,
                        "team_preview": team[:20],
                        "health_alert": alert_msg,
                        "is_private": getattr(pb, "is_private", 0),
                        "access_requests_count": requests_count,
                    }
                )

    return {"boards": res, "workspace_boards": ws_res}


@router.post("/api/boards")
def create_board(
    payload: BoardModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
    workspace_id: int = Depends(get_write_active_workspace_id)
):
    if not payload.name or len(payload.name.strip()) == 0 or len(payload.name) > 100:
        raise HTTPException(
            status_code=400, detail="Project name must be between 1 and 100 characters."
        )

    # Enforce tier package active projects limit (exclude personal tasks list)
    is_personal_todo = payload.name.lower().strip() in ["to-do list", "personal tasks", "tugas pribadi"] or payload.is_private == 1
    if not is_personal_todo:
        enforce_can_create_project(db, workspace_id)

    # Cek apakah project dengan nama yang sama sudah pernah dibuat oleh user ini di workspace ini
    existing_board = (
        db.query(Board)
        .filter(
            Board.name == payload.name.strip(),
            Board.owner_username == current_user,
            Board.workspace_id == workspace_id
        )
        .first()
    )
    if existing_board:
        raise HTTPException(
            status_code=400, detail="You already have a project with this exact name."
        )

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    default_statuses = json.dumps(["Pending", "In Progress", "Done", "Rejected"])
    default_categories = json.dumps(
        [
            "Development",
            "Design",
            "Marketing",
            "Research",
            "Maintenance",
            "Consulting",
            "Other",
        ]
    )
    
    is_private = 1 if payload.name.lower() in ["to-do list", "personal tasks", "tugas pribadi"] else payload.is_private
    new_board = Board(
        name=payload.name,
        owner_username=current_user,
        created_at=now_str,
        statuses=default_statuses,
        categories=default_categories,
        is_private=is_private,
        workspace_id=workspace_id
    )
    db.add(new_board)
    db.commit()
    db.refresh(new_board)
    return {
        "message": "Project created successfully!",
        "board_id": new_board.id,
        "board_name": new_board.name,
    }


@router.post("/api/boards/{board_id}/join")
def join_board(
    board_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
    workspace_id: int = Depends(get_write_active_workspace_id)
):
    board = db.query(Board).filter(Board.id == board_id, Board.workspace_id == workspace_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Project not found")

    if getattr(board, "is_private", 0) == 1 and board.owner_username != current_user:
        raise HTTPException(status_code=403, detail="Cannot join a private project without an invitation.")

    existing_member = db.query(BoardMember).filter(
        BoardMember.board_id == board_id,
        BoardMember.member_username == current_user
    ).first()

    if existing_member:
        if existing_member.status != "accepted":
            existing_member.status = "accepted"
            db.commit()
    else:
        new_member = BoardMember(
            board_id=board_id,
            member_username=current_user,
            status="accepted"
        )
        db.add(new_member)
        db.commit()

    return {"message": f"Successfully joined project '{board.name}'!"}


@router.put("/api/boards/{board_id}/settings")
def update_board_settings(
    board_id: int,
    payload: BoardSettingsModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if not check_board_access(db, board_id, current_user) and not is_user_superadmin(
        db, current_user
    ):
        raise HTTPException(
            status_code=403, detail="Only project members can update board settings"
        )
    board.statuses = payload.statuses
    board.categories = payload.categories
    db.commit()
    update_board_activity(db, board_id)
    return {"message": "Board settings updated"}


@router.put("/api/boards/{board_id}")
def rename_board(
    board_id: int,
    payload: dict,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mengubah nama project (board). Hanya pemilik proyek yang dapat melakukannya.
    """
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Project not found")
    if board.owner_username != current_user:
        raise HTTPException(
            status_code=403, detail="Only the project owner can rename this project."
        )
    new_name = payload.get("name", "").strip()
    if not new_name:
        raise HTTPException(status_code=400, detail="Project name cannot be empty")
    board.name = new_name
    if "description" in payload:
        board.description = payload.get("description", "").strip()
    db.commit()
    return {"message": "Project renamed successfully", "board": {"id": board.id, "name": board.name, "description": board.description}}



@router.delete("/api/boards/{board_id}")
def delete_board(
    board_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Project not found.")

    is_admin = is_user_superadmin(db, current_user)
    is_owner = board.owner_username == current_user

    # Super Admins can delete any project. Regular users can only delete their own.
    if not is_admin and not is_owner:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this project."
        )

    # Safeguard: Prevent non-admins from deleting their own private default workspaces. Admins can override.
    if getattr(board, "is_private", 0) == 1 and board.name.lower() in ["to-do list", "personal tasks", "tugas pribadi"] and not is_admin:
        raise HTTPException(status_code=403, detail="Cannot delete your private default workspace.")

    db.query(BoardMember).filter(BoardMember.board_id == board_id).delete()
    tasks = db.query(Request).filter(Request.board_id == board_id).all()
    for t in tasks:
        db.query(Subtask).filter(Subtask.request_id == t.id).delete()
        db.query(Comment).filter(Comment.request_id == t.id).delete()
    db.query(Request).filter(Request.board_id == board_id).delete()
    db.delete(board)
    db.commit()
    return {"message": "Project deleted successfully!"}


@router.get("/api/boards/archived")
def get_archived_boards(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
    workspace_id: int = Depends(get_active_workspace_id)
):
    """Get all archived boards owned by the current user."""
    archived = db.query(Board).filter(
        Board.owner_username == current_user,
        Board.workspace_id == workspace_id,
        Board.is_archived == 1
    ).all()
    result = []
    for b in archived:
        task_count = db.query(Request).filter(Request.board_id == b.id).count()
        result.append({
            "id": b.id,
            "name": b.name,
            "description": b.description,
            "created_at": b.created_at.isoformat() if b.created_at else None,
            "last_activity_date": b.last_activity_date.isoformat() if b.last_activity_date else None,
            "task_count": task_count,
            "is_private": b.is_private,
        })
    return result


@router.patch("/api/boards/{board_id}/archive")
def archive_board(
    board_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Soft-archive a board. Only the owner can archive their own board."""
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Project not found.")
    if board.owner_username != current_user and not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Only the project owner can archive this project.")
    if getattr(board, "is_private", 0) == 1 and board.name.lower() in ["to-do list", "personal tasks", "tugas pribadi"]:
        raise HTTPException(status_code=403, detail="Cannot archive your default Personal Tasks board.")
    board.is_archived = 1
    db.commit()
    return {"message": "Project archived successfully.", "board_id": board_id}


@router.patch("/api/boards/{board_id}/unarchive")
def unarchive_board(
    board_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Restore an archived board back to the active projects list."""
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Project not found.")
    if board.owner_username != current_user and not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403, detail="Only the project owner can restore this project.")
    board.is_archived = 0
    db.commit()
    return {"message": "Project restored successfully.", "board_id": board_id}


@router.get("/api/boards/{board_id}/tasks")
def get_board_tasks(
    board_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not check_board_access(db, board_id, current_user):
        raise HTTPException(status_code=403, detail="Access denied")
    board = db.query(Board).filter(Board.id == board_id).first()
    if board and evaluate_board_lifecycle(db, board):
        raise HTTPException(
            status_code=404,
            detail="Project has been auto-deleted due to 6 months of inactivity.",
        )
    leave_dates = get_leave_dates(db)

    personal_leaves_db = (
        db.query(LeaveRecord.leave_date, LeaveRecord.username)
        .filter(LeaveRecord.leave_type == "personal")
        .all()
    )
    personal_leaves = {}
    for ldate, uname in personal_leaves_db:
        if uname not in personal_leaves:
            personal_leaves[uname] = set()
        if ldate:
            date_str = ldate.strftime("%Y-%m-%d") if hasattr(ldate, "strftime") else str(ldate)[:10]
            personal_leaves[uname].add(date_str)

    global_queues = get_all_queues(db, leave_dates)

    tasks = (
        db.query(Request)
        .filter(
            Request.board_id == board_id,
            or_(Request.requester == None, Request.requester != "System"),
            or_(
                Request.project_name == None,
                Request.project_name != "[SYSTEM] PROJECT CHAT",
            ),
        )
        .all()
    )

    tasks_list = []
    for task in tasks:
        q_info = global_queues.get(task.id, {})
        t_dict = {
            "id": task.id,
            "board_id": task.board_id,
            "board_name": board.name if board else "Unknown",
            "timestamp": task.timestamp,
            "project_name": task.project_name,
            "requester": task.requester,
            "category": task.category,
            "description": task.description,
            "supporting_access": task.supporting_access,
            "start_date": format_dt(task.start_date) or (format_dt(task.timestamp).split(" ")[0] if task.timestamp else None),
            "deadline": format_dt(task.deadline),
            "impact": getattr(task, "impact", "Medium"),
            "etc": getattr(task, "etc", 2),
            "auto_nudge": bool(getattr(task, "auto_nudge", False)),
            "recurring": getattr(task, "recurring", "none"),
            "status": task.status,
            "tags": parse_tags(task.tags),
            "completed_time": task.completed_time,
            "owner_username": task.owner_username,
            "queue_global_number": q_info.get("global_q"),
            "total_global_queue": q_info.get("global_t"),
            "queue_project_number": q_info.get("project_q"),
            "total_project_queue": q_info.get("project_t"),
            "main_assignee": q_info.get("main_assignee"),
        }
        subtasks = (
            db.query(Subtask)
            .filter(Subtask.request_id == task.id)
            .order_by(Subtask.position.asc(), Subtask.id.asc())
            .all()
        )
        t_dict["subtask_total"] = len(subtasks)
        t_dict["subtask_done"] = sum(1 for s in subtasks if s.is_done == 1)
        t_dict["subtask_assignees"] = ", ".join(
            [s.assignee for s in subtasks if s.assignee]
        )
        t_dict["subtask_details"] = "\n".join(
            [
                f"[{'x' if s.is_done else ' '}] {s.task_name} (@{s.assignee or 'unassigned'})"
                for s in subtasks
            ]
        )

        assignees = get_assignees(task.requester)
        # Tambahkan pekerja sub-task ke dalam perhitungan kalkulasi Cuti
        for s in subtasks:
            if s.assignee:
                assignees.add(s.assignee)

        task_leaves = set(leave_dates)
        for a in assignees:
            task_leaves.update(personal_leaves.get(a, set()))

        prio_str, prio_lvl = calculate_priority(task.deadline or "", task_leaves)
        t_dict["priority_str"] = prio_str
        t_dict["priority_lvl"] = prio_lvl
        tasks_list.append(t_dict)

    return {"tasks": tasks_list}


@router.get("/api/boards/{board_id}/tasks/light")
def get_light_tasks(
    board_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not check_board_access(db, board_id, current_user):
        raise HTTPException(status_code=403, detail="Access denied")

    tasks = (
        db.query(Request)
        .filter(
            Request.board_id == board_id,
            Request.project_name != "[SYSTEM] PROJECT CHAT",
            Request.status.notin_(["Done", "Rejected"]),
        )
        .order_by(Request.id.desc())
        .all()
    )

    is_super = is_user_superadmin(db, current_user)
    board = db.query(Board).filter(Board.id == board_id).first()
    is_board_owner = board and board.owner_username == current_user

    res = []
    for t in tasks:
        involved = False
        if is_super or is_board_owner or t.owner_username == current_user:
            involved = True
        else:
            assignees = get_assignees(t.requester)
            if current_user in assignees:
                involved = True
            else:
                subs = db.query(Subtask).filter(Subtask.request_id == t.id).all()
                if any(s.assignee == current_user for s in subs):
                    involved = True
        res.append(
            {
                "id": t.id,
                "project_name": t.project_name,
                "status": t.status,
                "is_involved": involved,
                "tags": parse_tags(t.tags),
            }
        )

    return {"tasks": res}


@router.get("/api/boards/{board_id}/export-csv")
def export_board_csv(
    board_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if not check_board_access(db, board_id, current_user):
        raise HTTPException(status_code=403, detail="Access denied")

    tasks = (
        db.query(Request)
        .filter(
            Request.board_id == board_id,
            or_(Request.requester == None, Request.requester != "System"),
            or_(
                Request.project_name == None,
                Request.project_name != "[SYSTEM] PROJECT CHAT",
            ),
        )
        .order_by(Request.id.asc())
        .all()
    )

    output = io.StringIO()
    output.write("\ufeff")
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    headers = [
        "ID",
        "Judul Tugas",
        "Pemohon",
        "Kategori",
        "Status",
        "Prioritas",
        "Start Date",
        "Deadline",
        "Estimasi Jam",
        "Subtasks",
    ]
    writer.writerow(headers)

    for task in tasks:
        subtasks = (
            db.query(Subtask)
            .filter(Subtask.request_id == task.id)
            .order_by(Subtask.position.asc(), Subtask.id.asc())
            .all()
        )
        subtasks_str = "; ".join(
            f"[{'x' if s.is_done else ' '}] {s.task_name}" + (f" (@{s.assignee})" if s.assignee else "")
            for s in subtasks if s.task_name
        )

        start_date_str = ""
        if task.start_date:
            start_date_str = task.start_date.strftime("%Y-%m-%d %H:%M:%S") if hasattr(task.start_date, "strftime") else str(task.start_date)
        deadline_str = ""
        if task.deadline:
            deadline_str = task.deadline.strftime("%Y-%m-%d %H:%M:%S") if hasattr(task.deadline, "strftime") else str(task.deadline)

        etc_val = task.etc if task.etc is not None else 2.0
        if isinstance(etc_val, float) and etc_val.is_integer():
            etc_val = int(etc_val)

        writer.writerow([
            task.id,
            task.project_name or "",
            task.requester or "",
            task.category or "",
            task.status or "Pending",
            task.impact or "Medium",
            start_date_str,
            deadline_str,
            etc_val,
            subtasks_str,
        ])

    csv_content = output.getvalue()
    filename = f"alurku-board-{board_id}-tasks.csv"

    return StreamingResponse(
        io.BytesIO(csv_content.encode("utf-8")),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


@router.post("/api/boards/{board_id}/import-csv")
async def import_board_csv(
    board_id: int,
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if not check_board_access(db, board_id, current_user):
        raise HTTPException(status_code=403, detail="Access denied")
    if not is_board_writer(db, board_id, current_user):
        raise HTTPException(
            status_code=403,
            detail="Mode Pengawas Workspace (Read-Only): Anda tidak memiliki izin menulis di proyek ini."
        )

    content_bytes = await file.read()
    if not content_bytes:
        raise HTTPException(status_code=400, detail="File CSV kosong.")

    try:
        text_content = content_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            text_content = content_bytes.decode("latin-1")
        except Exception:
            raise HTTPException(status_code=400, detail="Format encoding file tidak didukung.")

    lines = [l for l in text_content.splitlines() if l.strip()]
    if not lines:
        raise HTTPException(status_code=400, detail="File CSV tidak memiliki baris data.")

    first_line = lines[0]
    delimiter = ";" if first_line.count(";") > first_line.count(",") else ","

    reader = csv.reader(lines, delimiter=delimiter)
    try:
        raw_headers = next(reader)
    except StopIteration:
        raise HTTPException(status_code=400, detail="Header CSV tidak ditemukan.")

    header_map = {}
    for idx, h in enumerate(raw_headers):
        clean_h = h.strip().lower().replace("_", " ")
        if clean_h in ("id", "task id", "no"):
            header_map["id"] = idx
        elif clean_h in ("judul tugas", "judul", "task name", "task", "title", "nama tugas"):
            header_map["project_name"] = idx
        elif clean_h in ("pemohon", "requester", "assignee", "pekerja"):
            header_map["requester"] = idx
        elif clean_h in ("kategori", "category"):
            header_map["category"] = idx
        elif clean_h in ("status",):
            header_map["status"] = idx
        elif clean_h in ("prioritas", "priority", "impact"):
            header_map["impact"] = idx
        elif clean_h in ("start date", "tanggal mulai", "start"):
            header_map["start_date"] = idx
        elif clean_h in ("deadline", "tenggat", "tenggat waktu", "due date"):
            header_map["deadline"] = idx
        elif clean_h in ("estimasi jam", "etc", "estimasi", "etc (hrs)", "hours"):
            header_map["etc"] = idx
        elif clean_h in ("subtasks", "sub-task", "sub task", "subtugas"):
            header_map["subtasks"] = idx
        elif clean_h in ("deskripsi", "description", "desc"):
            header_map["description"] = idx

    if "project_name" not in header_map:
        raise HTTPException(
            status_code=400,
            detail="Kolom 'Judul Tugas' atau 'Task Name' wajib ada di file CSV."
        )

    def parse_date_str(val: str):
        if not val or not val.strip():
            return None
        val = val.strip()
        formats = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d %H:%M",
            "%Y-%m-%d",
            "%d/%m/%Y %H:%M:%S",
            "%d/%m/%Y %H:%M",
            "%d/%m/%Y",
            "%Y/%m/%d",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M",
        ]
        for fmt in formats:
            try:
                return datetime.strptime(val, fmt)
            except ValueError:
                continue
        return None

    board_categories = []
    if board.categories:
        try:
            board_categories = json.loads(board.categories)
        except Exception:
            board_categories = []
    default_category = board_categories[0] if board_categories else "Development"

    created_tasks = []
    now = datetime.utcnow()

    for row_idx, row in enumerate(reader):
        if not row or not any(field.strip() for field in row):
            continue

        def get_val(key, default=""):
            idx = header_map.get(key)
            if idx is not None and idx < len(row):
                return row[idx].strip()
            return default

        project_name = get_val("project_name")
        if not project_name:
            continue

        requester = get_val("requester", f"@{current_user}")
        category = get_val("category", default_category)
        status = get_val("status", "Pending")
        impact = get_val("impact", "Medium")
        desc = get_val("description", "")
        start_date_val = parse_date_str(get_val("start_date"))
        deadline_val = parse_date_str(get_val("deadline"))

        etc_str = get_val("etc", "2")
        try:
            etc_val = float(etc_str)
        except (ValueError, TypeError):
            etc_val = 2.0

        task_ts = (now + timedelta(seconds=row_idx)).strftime("%Y-%m-%d %H:%M:%S")

        new_task = Request(
            board_id=board_id,
            workspace_id=board.workspace_id,
            timestamp=task_ts,
            project_name=project_name,
            requester=requester,
            category=category,
            description=desc,
            supporting_access="",
            start_date=start_date_val,
            deadline=deadline_val,
            impact=impact,
            etc=etc_val,
            status=status,
            owner_username=current_user,
        )
        setattr(new_task, "recurring", "none")
        db.add(new_task)
        db.flush()

        subtasks_raw = get_val("subtasks", "")
        if subtasks_raw:
            subtask_items = [st.strip() for st in re.split(r'[;\n|]+', subtasks_raw) if st.strip()]
            for s_idx, st_item in enumerate(subtask_items):
                is_done = 1 if re.match(r'^\[[xX]\]', st_item) else 0
                cleaned_name = re.sub(r'^\[[ xX]\]\s*', '', st_item)

                assignee_match = re.search(r'\(@([a-zA-Z0-9_.-]+)\)', cleaned_name)
                assignee = None
                if assignee_match:
                    assignee = assignee_match.group(1)
                    cleaned_name = re.sub(r'\(@[a-zA-Z0-9_.-]+\)', '', cleaned_name).strip()

                if cleaned_name:
                    db.add(
                        Subtask(
                            request_id=new_task.id,
                            task_name=cleaned_name,
                            is_done=is_done,
                            assignee=assignee,
                            position=s_idx,
                        )
                    )

        created_tasks.append(new_task.id)

    board.last_activity_date = datetime.utcnow()
    db.commit()

    return {
        "success": True,
        "imported_count": len(created_tasks),
        "task_ids": created_tasks,
        "message": f"Berhasil mengimpor {len(created_tasks)} tugas."
    }


@router.post("/api/boards/{board_id}/tasks")
def create_task(
    board_id: int,
    task: RequestFormModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
    workspace_id: int = Depends(get_write_active_workspace_id)
):
    if len(task.project_name) > 255 or len(task.description) > 10000:
        raise HTTPException(
            status_code=400, detail="Payload size exceeds maximum allowed limit."
        )

    # Verify board belongs to current workspace
    board = db.query(Board).filter(Board.id == board_id, Board.workspace_id == workspace_id).first()
    if not board:
        raise HTTPException(status_code=403, detail="Access denied")
    if not is_board_writer(db, board_id, current_user):
        raise HTTPException(
            status_code=403,
            detail="Mode Pengawas Workspace (Read-Only): Anda sedang memantau proyek ini sebagai Admin. Silakan klik 'Bergabung dengan Proyek' terlebih dahulu untuk mulai membuat tugas."
        )

    now = datetime.now()
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S")

    # Mencegah error UNIQUE constraint pada kolom timestamp saat bulk create
    counter = 0
    while db.query(Request).filter(Request.timestamp == timestamp).first():
        counter += 1
        timestamp = (now + timedelta(seconds=counter)).strftime("%Y-%m-%d %H:%M:%S")
        
    if board and getattr(board, "is_private", 0) == 1:
        assignees = get_assignees(task.requester)
        if any(a.lower() != current_user.lower() for a in assignees):
            raise HTTPException(status_code=400, detail="Cannot assign tasks to other users in a private workspace.")
        for st in task.subtasks:
            if st.get("assignee") and st.get("assignee").lower() != current_user.lower():
                raise HTTPException(status_code=400, detail="Cannot assign subtasks to other users in a private workspace.")

    try:
        new_task = Request(
            board_id=board_id,
            workspace_id=workspace_id,
            timestamp=timestamp,
            project_name=task.project_name,
            requester=task.requester,
            category=task.category,
            description=task.description,
            supporting_access=task.supporting_access,
            start_date=task.start_date if task.start_date and task.start_date.strip() else None,
            deadline=task.deadline if task.deadline and task.deadline.strip() else None,
            impact=task.impact or "Medium",
            etc=task.etc if task.etc is not None else 2,
            auto_nudge=True if task.auto_nudge else False,
            status="Pending",
            owner_username=current_user,
            tags=serialize_tags(getattr(task, "tags", None)),
        )
        setattr(new_task, "recurring", task.recurring or "none")
        db.add(new_task)
        db.flush()  # Flush untuk mendapatkan ID task yang baru dibuat tanpa melakukan commit

        # Masukkan semua sub-task awal yang dikirim dari Frontend
        subtask_assignees = set()
        newly_invited = []
        for idx, st in enumerate(task.subtasks):
            name = st.get("task_name", "").strip()
            if name:
                assignee = st.get("assignee")
                db.add(
                    Subtask(
                        request_id=new_task.id,
                        task_name=name,
                        assignee=assignee,
                        position=idx,
                    )
                )
                if assignee and assignee != current_user:
                    subtask_assignees.add(assignee)

        db.commit()
        log_activity(db, new_task.id, f"**@{current_user}** created this task.")
        if workspace_id and getattr(board, "is_private", 0) != 1:
            log_and_broadcast_activity(
                db,
                workspace_id,
                current_user,
                "task_created",
                new_task.project_name or "Untitled",
                {"task_id": new_task.id}
            )

        assignees = get_assignees(task.requester)
        all_involved = assignees.union(subtask_assignees)
        for m in all_involved:
            if m != current_user:
                if auto_add_to_board(db, board_id, m, current_user):
                    newly_invited.append(f"@{m}")
                target = db.query(User).filter(User.username == m).first()
                if target and check_board_access(db, board_id, m):
                    create_notification(
                        db,
                        m,
                        f"@{current_user} assigned you a new task: {task.project_name or 'Untitled'}",
                        "task_assigned",
                        new_task.id,
                    )

        update_board_activity(db, board_id)

        response_message = "Task created successfully"
        if newly_invited:
            invited_str = ", ".join(newly_invited)
            response_message += f". Also, {invited_str} "
            if len(newly_invited) > 1:
                response_message += "were automatically invited to the project."
            else:
                response_message += "was automatically invited to the project."

        return {
            "message": response_message,
            "project": task.project_name,
            "task_id": new_task.id,
            "tags": parse_tags(new_task.tags),
            "task": {
                "id": new_task.id,
                "project_name": new_task.project_name,
                "board_id": new_task.board_id,
                "tags": parse_tags(new_task.tags),
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/boards/{board_id}/request-access")
def request_board_access(
    board_id: int,
    task_id: Optional[int] = None,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Project not found")
    if getattr(board, "is_private", 0) == 1:
        raise HTTPException(status_code=403, detail="Cannot request access to a private workspace.")

    existing = db.query(BoardMember).filter(BoardMember.board_id == board_id, BoardMember.member_username == current_user).first()
    if existing:
        if existing.status == "accepted":
            return {"message": "You are already a member."}
        elif existing.status == "requesting":
            return {"message": "Access request already sent."}
        elif existing.status == "pending":
            return {"message": "You already have a pending invitation. Please check your invitations."}

    new_req = BoardMember(board_id=board_id, member_username=current_user, status="requesting")
    db.add(new_req)
    db.commit()

    task_info = ""
    if task_id:
        task = db.query(Request).filter(Request.id == task_id).first()
        if task:
            task_info = f" to view task: {task.project_name} <!--TASK_ID:{task.id}-->"

    create_notification(
        db, board.owner_username,
        f"@{current_user} is requesting access to your project: {board.name}{task_info}",
        "access_request", board.id
    )
    return {"message": "Access request sent successfully!"}


@router.put("/api/boards/{board_id}/requests/{member_id}/accept")
def accept_access_request(board_id: int, member_id: int, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board or (board.owner_username != current_user and not is_user_superadmin(db, current_user)):
        raise HTTPException(status_code=403, detail="Only owner can accept requests.")
    
    req = db.query(BoardMember).filter(BoardMember.id == member_id, BoardMember.board_id == board_id, BoardMember.status == "requesting").first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req.status = "accepted"
    db.commit()
    
    last_req_notif = db.query(Notification).filter(
        Notification.user_username == board.owner_username,
        Notification.type == "access_request",
        Notification.message.like(f"%@{req.member_username} is requesting access%"),
        Notification.related_task_id == board_id
    ).order_by(Notification.id.desc()).first()

    task_info = ""
    if last_req_notif:
        import re
        match = re.search(r'<!--TASK_ID:(\d+)-->', last_req_notif.message)
        if match:
            task_id_match = match.group(1)
            task = db.query(Request).filter(Request.id == int(task_id_match)).first()
            if task:
                task_info = f" You can now view the task: {task.project_name} <!--TASK_ID:{task.id}-->"

    create_notification(
        db, req.member_username,
        f"Your request to join project '{board.name}' has been accepted. You are now a member!{task_info}",
        "access_accepted", board.id
    )
    return {"message": "Access request accepted"}


@router.post("/api/boards/{board_id}/invite")
def invite_board_member(
    board_id: int,
    payload: InviteModel,
    request: FastAPIRequest = None,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=444, detail="Project not found")

    is_owner = (board.owner_username == current_user)
    is_sa = is_user_superadmin(db, current_user)
    is_ws_admin = False
    if board.workspace_id:
        ws_member = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == board.workspace_id,
            WorkspaceMember.username == current_user,
            WorkspaceMember.role == "admin"
        ).first()
        if ws_member:
            is_ws_admin = True

    if not is_owner and not is_ws_admin and not is_sa:
        raise HTTPException(
            status_code=403, detail="Hanya Pemilik Project, Admin Workspace, atau System Administrator yang dapat mengundang anggota."
        )

    if getattr(board, "is_private", 0) == 1 and not is_owner and not is_sa:
        raise HTTPException(status_code=403, detail="Tidak dapat mengundang anggota ke project pribadi milik pengguna lain.")

    owned_boards = (
        db.query(Board.id).filter(Board.owner_username == current_user).subquery()
    )
    unique_members_count = (
        db.query(BoardMember.member_username)
        .filter(BoardMember.board_id.in_(owned_boards))
        .distinct()
        .count()
    )

    raw_inputs = [
        x.strip()
        for x in payload.members_input.replace(";", ",").split(",")
        if x.strip()
    ]
    if not raw_inputs:
        raise HTTPException(
            status_code=400, detail="Please provide at least one username or email."
        )

    success_count = 0
    errors = []

    for identifier in raw_inputs:
        target = (
            db.query(User)
            .filter(or_(User.username == identifier, User.email == identifier))
            .first()
        )
        if not target:
            if "@" in identifier and "." in identifier:
                try:
                    from services.email_service import send_email_async
                    signup_link = get_frontend_url(request, f"/daftar?email={identifier}")
                    subject = f"Undangan Bergabung ke Project '{board.name}' di alurku."
                    html_content = f"""
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #111E38;">
                        <h2>Undangan Project alurku.</h2>
                        <p>Halo,</p>
                        <p><strong>@{current_user}</strong> mengundang Anda untuk bergabung dan berkolaborasi di project <strong>"{board.name}"</strong> pada aplikasi alurku.</p>
                        <p>Silakan mendaftar akun alurku. untuk langsung mengakses project Anda:</p>
                        <p style="margin-top: 20px;">
                            <a href="{signup_link}" style="background-color: #FACC15; color: #111E38; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">Daftar Akun alurku.</a>
                        </p>
                        <br/>
                        <p style="font-size: 12px; color: #666;">alurku. - Master your time, smooth your flow.</p>
                    </div>
                    """
                    send_email_async(identifier, subject, html_content)
                    success_count += 1
                    continue
                except Exception as err_email:
                    print(f"Failed to send invite email: {err_email}")

            errors.append(f"'{identifier}' (Belum terdaftar di alurku.)")
            continue

        if target.username == "admin":
            errors.append(f"'{identifier}' (Tidak dapat mengundang system admin)")
            continue

        if target.username == current_user:
            errors.append(f"'{identifier}' (Tidak dapat mengundang diri sendiri)")
            continue

        existing_connection = (
            db.query(BoardMember)
            .filter(
                BoardMember.board_id == board_id,
                BoardMember.member_username == target.username,
            )
            .first()
        )
        if existing_connection:
            errors.append(f"'{identifier}' (Sudah menjadi anggota project ini)")
            continue

        new_invite = BoardMember(board_id=board_id, member_username=target.username, status="accepted")
        db.add(new_invite)

        # Auto-provision workspace membership as VIEWER (Guest/Client Role) to prevent internal workspace activity leaks
        if board.workspace_id:
            ws_membership = db.query(WorkspaceMember).filter(
                WorkspaceMember.workspace_id == board.workspace_id,
                WorkspaceMember.username == target.username
            ).first()
            if not ws_membership:
                new_ws_member = WorkspaceMember(
                    workspace_id=board.workspace_id,
                    username=target.username,
                    role="viewer"
                )
                db.add(new_ws_member)

        create_notification(
            db,
            target.username,
            f"@{current_user} invited you to project: {board.name}",
            "team_invite",
        )
        success_count += 1

    db.commit()

    if success_count == 0:
        raise HTTPException(
            status_code=400, detail=f"Failed to invite. Issues: {', '.join(errors)}"
        )

    msg = f"Successfully invited {success_count} user(s)."
    if errors:
        msg += f" Skipped: {', '.join(errors)}"

    return {"message": msg}


@router.get("/api/boards/{board_id}/members")
def get_board_members(
    board_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not check_board_access(db, board_id, current_user):
        raise HTTPException(status_code=403)
    board = db.query(Board).filter(Board.id == board_id).first()
    members = (
        db.query(BoardMember)
        .filter(BoardMember.board_id == board_id, BoardMember.status == "accepted")
        .all()
    )

    all_members = set([board.owner_username] + [m.member_username for m in members])
    return {"members": list(all_members)}


@router.get("/api/boards/{board_id}/manage")
def manage_board(
    board_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not check_board_access(db, board_id, current_user):
        raise HTTPException(status_code=403)
    members = db.query(BoardMember).filter(BoardMember.board_id == board_id).all()
    return {
        "team": [
            {"id": m.id, "username": m.member_username, "status": m.status}
            for m in members
        ]
    }


@router.delete("/api/boards/{board_id}/revoke/{member_id}")
def revoke_board_member(
    board_id: int,
    member_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(Board).filter(Board.id == board_id).first()

    inv = (
        db.query(BoardMember)
        .filter(BoardMember.id == member_id, BoardMember.board_id == board_id)
        .first()
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Project member not found")

    if not board or (
        board.owner_username != current_user
        and inv.member_username != current_user
        and not is_user_superadmin(db, current_user)
    ):
        raise HTTPException(
            status_code=403, detail="Only project owner can revoke access, or you can leave by yourself."
        )

    db.delete(inv)
    db.commit()
    return {"message": "Access revoked successfully"}


@router.put("/api/boards/{board_id}/transfer-member")
def transfer_board_to_member(
    board_id: int,
    payload: TransferToMemberModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board or board.owner_username != current_user:
        raise HTTPException(
            status_code=403, detail="Only the current owner can transfer ownership."
        )

    member = (
        db.query(BoardMember)
        .filter(
            BoardMember.board_id == board_id,
            BoardMember.member_username == payload.new_owner,
            BoardMember.status == "accepted",
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=400,
            detail="The selected user must be an active team member first.",
        )

    old_owner = board.owner_username
    board.owner_username = payload.new_owner
    db.delete(member)  # Hapus penerima dari status anggota biasa

    new_member = BoardMember(
        board_id=board_id, member_username=old_owner, status="accepted"
    )
    db.add(new_member)  # Jadikan owner lama sebagai anggota biasa

    db.commit()
    create_notification(
        db,
        payload.new_owner,
        f"@{old_owner} transferred ownership of project '{board.name}' to you.",
        "info",
        board.id,
    )
    return {"message": f"Ownership successfully transferred to @{payload.new_owner}"}


@router.get("/api/boards/{board_id}/chat")
@router.get("/api/boards/{board_id}/comments")
def get_board_chat(
    board_id: int,
    offset: int = 0,
    limit: int = 50,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not check_board_access(db, board_id, current_user):
        raise HTTPException(status_code=403)
    chat_task = get_or_create_chat_task(db, board_id)
    comments = (
        db.query(Comment)
        .filter(Comment.request_id == chat_task.id)
        .order_by(Comment.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    comments.reverse()
    res = []
    for c in comments:
        if c.username != "System":
            clean_text, rx = parse_comment_text(c.text)
            res.append(
                {
                    "id": c.id,
                    "username": c.username,
                    "text": clean_text,
                    "timestamp": c.timestamp,
                    "reactions": rx,
                }
            )
    return {"messages": res, "comments": res}


@router.post("/api/boards/{board_id}/chat")
@router.post("/api/boards/{board_id}/comments")
def add_board_chat(
    board_id: int,
    payload: CommentModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if len(payload.text) > 3000:
        raise HTTPException(
            status_code=400,
            detail="Message text is too long (Maximum 3000 characters).",
        )

    if not check_board_access(db, board_id, current_user):
        raise HTTPException(status_code=403)
            
    board = db.query(Board).filter(Board.id == board_id).first()
    if board and getattr(board, "is_private", 0) == 1:
        raise HTTPException(status_code=400, detail="Cannot chat in a private workspace.")
            
    chat_task = get_or_create_chat_task(db, board_id)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    new_msg = Comment(
        request_id=chat_task.id,
        username=current_user,
        text=payload.text,
        timestamp=now_str,
    )
    db.add(new_msg)
    db.commit()

    mentions = set(re.findall(r"@([\w.-]+)", payload.text or ""))
    board = db.query(Board).filter(Board.id == board_id).first()
    if "team" in {m.lower() for m in mentions}:
        members = (
            db.query(BoardMember)
            .filter(BoardMember.board_id == board_id, BoardMember.status == "accepted")
            .all()
        )
        team_users = {m.member_username for m in members}
        if board:
            team_users.add(board.owner_username)
        for tu in team_users:
            if tu.lower() != current_user.lower():
                create_notification(
                    db,
                    tu,
                    f"@{current_user} mentioned @team in {board.name} chat",
                    "team_chat_no_email",
                    board_id,
                )
    else:
        for m in mentions:
            if m.lower() != current_user.lower() and check_board_access(
                db, board_id, m
            ):
                create_notification(
                    db,
                    m,
                    f"@{current_user} mentioned you in {board.name if board else 'Project'} chat",
                    "team_chat",
                    board_id,
                )

    update_board_activity(db, board_id)
    return {"message": "Chat sent"}


@router.delete("/api/boards/{board_id}/chat/{comment_id}")
def delete_board_chat(
    board_id: int,
    comment_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not check_board_access(db, board_id, current_user):
        raise HTTPException(status_code=403)
    chat_task = get_or_create_chat_task(db, board_id)
    comment = (
        db.query(Comment)
        .filter(Comment.id == comment_id, Comment.request_id == chat_task.id)
        .first()
    )
    if not comment:
        raise HTTPException(status_code=404)
    if comment.username != current_user and not is_user_superadmin(db, current_user):
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this message"
        )
    db.delete(comment)
    db.commit()
    return {"message": "Message deleted"}
