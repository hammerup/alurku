from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks, Header
from sqlalchemy.orm import Session
from typing import Optional
from sqlalchemy import or_, and_, func, text
import re
import json
from datetime import datetime, timedelta
import os
import time
import requests
from google import genai

from database import get_db, User, Request, Subtask, Board, BoardMember, LeaveDay, LeaveRecord, Comment, Notification, DirectMessage, Workspace, WorkspaceMember, get_security_log, set_security_log
from routers.workspaces import get_active_workspace_id
from schemas import *
from dependencies import *
from utils import *

router = APIRouter()

@router.post("/api/ai/generate")
def generate_ai_text(
    payload: AIGenerateModel, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    now_time = time.time()
    last_generate_time = get_security_log(db, f"ai_generate:{current_user}", 0)
    if (now_time - last_generate_time) < 1:
        raise HTTPException(
            status_code=429,
            detail="Please wait 1 second before generating another AI response.",
        )
    set_security_log(db, f"ai_generate:{current_user}", now_time)

    groq_api_key = os.getenv("GROQ_API_KEY")
    gemini_api_key = os.getenv("GEMINI_API_KEY")

    error_msgs = []

    final_prompt = payload.prompt

    def call_gemini():
        if not gemini_api_key:
            raise Exception("Gemini API Key missing in .env")
        client = genai.Client(api_key=gemini_api_key.strip())
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash", contents=final_prompt
            )
            return {"text": response.text, "provider": "Google Gemini"}
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                raise Exception(
                    "Gemini API free tier limit reached. Please wait a moment or switch to GPT-OSS 120B."
                )
            raise Exception(error_str)

    def call_llama():
        if not groq_api_key:
            raise Exception("Groq API Key missing in .env")
        headers = {
            "Authorization": f"Bearer {groq_api_key.strip()}",
            "Content-Type": "application/json",
        }
        data = {
            "model": "openai/gpt-oss-120b",
            "messages": [{"role": "user", "content": final_prompt}],
        }
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=data,
        )
        if response.status_code == 429:
            raise Exception("Groq AI limit reached. Please wait a moment.")
        response.raise_for_status()
        return {
            "text": response.json()["choices"][0]["message"]["content"],
            "provider": "GPT-OSS 120B",
        }

    # Strict User Selection
    if payload.provider == "gemini":
        try:
            return call_gemini()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini Error: {str(e)}")
    elif payload.provider == "llama":
        try:
            return call_llama()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"GPT-OSS Error: {str(e)}")

    # Default Fallback Logic (Auto) — Groq dulu karena lebih cepat, Gemini sebagai fallback
    if groq_api_key:
        try:
            return call_llama()
        except Exception as e:
            error_msgs.append(f"Groq: {str(e)}")

    if gemini_api_key:
        try:
            return call_gemini()
        except Exception as e:
            error_msgs.append(f"Gemini: {str(e)}")

    if not gemini_api_key and not groq_api_key:
        raise HTTPException(
            status_code=400,
            detail="No AI configured. Please set GEMINI_API_KEY or GROQ_API_KEY in the .env file.",
        )

    # Jika kedua AI gagal terhubung
    raise HTTPException(
        status_code=500, detail="AI generation failed. " + " | ".join(error_msgs)
    )


@router.get("/api/ai/context")
def get_ai_context(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
    workspace_id: int = Depends(get_active_workspace_id)
):
    """Returns a security-scoped summary of workspace data for AI context injection.
    All data is filtered to only what the current user can access."""

    # 1. Get workspace name
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    workspace_name = workspace.name if workspace else "Unknown"

    # 2. Get boards the user owns or is a member of, within this workspace
    owned_subq = db.query(Board.id).filter(
        Board.owner_username == current_user,
        or_(Board.workspace_id == workspace_id, Board.workspace_id == None)
    )
    shared_subq = db.query(BoardMember.board_id).filter(
        BoardMember.member_username == current_user,
        BoardMember.status == "accepted"
    )
    accessible_boards = db.query(Board).filter(
        or_(Board.workspace_id == workspace_id, Board.workspace_id == None),
        or_(Board.id.in_(owned_subq), Board.id.in_(shared_subq))
    ).limit(20).all()

    accessible_board_ids = [b.id for b in accessible_boards]
    project_names = [b.name for b in accessible_boards]

    # 3. Get team members from accessible boards
    team_set = set()
    for b in accessible_boards:
        if b.owner_username:
            team_set.add(b.owner_username)
    if accessible_board_ids:
        board_members = db.query(BoardMember.member_username).filter(
            BoardMember.board_id.in_(accessible_board_ids),
            BoardMember.status == "accepted"
        ).all()
        for (uname,) in board_members:
            team_set.add(uname)
    # Also add workspace members
    ws_members = db.query(WorkspaceMember.username).filter(
        WorkspaceMember.workspace_id == workspace_id
    ).all()
    for (uname,) in ws_members:
        team_set.add(uname)
    team_members = sorted([u for u in team_set if u and u != "admin"])

    # 4. Get task statistics
    base_filter = [
        or_(Request.workspace_id == workspace_id, Request.workspace_id == None),
        or_(
            Request.board_id.in_(owned_subq),
            Request.board_id.in_(shared_subq),
            Request.board_id == None,
            Request.board_id == 0
        ),
        or_(Request.requester == None, Request.requester != "System"),
        or_(Request.project_name == None, Request.project_name != "[SYSTEM] PROJECT CHAT"),
    ]

    user_filter = [
        *base_filter,
        or_(
            Request.owner_username == current_user,
            Request.requester.ilike(f"%@{current_user}%"),
            Request.requester == current_user
        )
    ]

    total = db.query(func.count(Request.id)).filter(*base_filter).scalar() or 0
    done = db.query(func.count(Request.id)).filter(*base_filter, Request.status == "Done").scalar() or 0
    in_progress = db.query(func.count(Request.id)).filter(*base_filter, Request.status == "In Progress").scalar() or 0
    open_tasks = db.query(func.count(Request.id)).filter(*base_filter, Request.status == "Open").scalar() or 0
    rejected = db.query(func.count(Request.id)).filter(*base_filter, Request.status == "Rejected").scalar() or 0

    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    overdue = db.query(func.count(Request.id)).filter(
        *base_filter,
        Request.deadline < today_start,
        Request.status.notin_(["Done", "Rejected"])
    ).scalar() or 0

    due_today = db.query(func.count(Request.id)).filter(
        *base_filter,
        Request.deadline >= today_start,
        Request.deadline <= today_end,
        Request.status.notin_(["Done", "Rejected"])
    ).scalar() or 0

    # User personal statistics (matches UI header cards)
    my_active = db.query(func.count(Request.id)).filter(*user_filter, Request.status.notin_(["Done", "Rejected"])).scalar() or 0
    my_due_today = db.query(func.count(Request.id)).filter(
        *user_filter,
        Request.deadline >= today_start,
        Request.deadline <= today_end,
        Request.status.notin_(["Done", "Rejected"])
    ).scalar() or 0
    my_overdue = db.query(func.count(Request.id)).filter(
        *user_filter,
        Request.deadline < today_start,
        Request.status.notin_(["Done", "Rejected"])
    ).scalar() or 0

    # 5. Get current user's active tasks (max 10)
    boards_dict = {b.id: b.name for b in accessible_boards}

    my_tasks_query = db.query(Request).filter(
        *user_filter,
        Request.status.notin_(["Done", "Rejected"]),
    ).order_by(Request.deadline.asc().nullslast()).limit(10).all()

    my_active_tasks = []
    for t in my_tasks_query:
        dl = ""
        if t.deadline:
            dl = t.deadline.strftime("%Y-%m-%d") if hasattr(t.deadline, "strftime") else str(t.deadline)[:10]
        my_active_tasks.append({
            "id": t.id,
            "title": t.project_name,
            "status": t.status,
            "deadline": dl,
            "project": boards_dict.get(t.board_id, "Unknown"),
            "assignee": t.requester or ""
        })

    # 6. Get recent team tasks (not owned by current user, max 5)
    team_tasks_query = db.query(Request).filter(
        *base_filter,
        Request.status.notin_(["Done", "Rejected"]),
        Request.owner_username != current_user,
    ).order_by(Request.deadline.asc().nullslast()).limit(5).all()

    recent_team_tasks = []
    for t in team_tasks_query:
        dl = ""
        if t.deadline:
            dl = t.deadline.strftime("%Y-%m-%d") if hasattr(t.deadline, "strftime") else str(t.deadline)[:10]
        recent_team_tasks.append({
            "id": t.id,
            "title": t.project_name,
            "status": t.status,
            "deadline": dl,
            "project": boards_dict.get(t.board_id, "Unknown"),
            "assignee": t.requester or ""
        })

    return {
        "workspace_name": workspace_name,
        "projects": project_names[:10],
        "team_members": team_members[:10],
        "my_stats": {
            "active": my_active,
            "due_today": my_due_today,
            "overdue": my_overdue
        },
        "workspace_stats": {
            "total": total,
            "done": done,
            "in_progress": in_progress,
            "open": open_tasks,
            "rejected": rejected,
            "overdue": overdue,
            "due_today": due_today
        },
        "my_active_tasks": my_active_tasks,
        "recent_team_tasks": recent_team_tasks
    }

