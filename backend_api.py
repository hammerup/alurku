import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from schemas import *
from datetime import datetime
from datetime import timedelta
import bcrypt
import jwt


import re
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, text
from typing import List, Optional
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import threading
import json
import html
import time
from collections import defaultdict
from google import genai

# Import logika db dari file Anda yang sudah ada
from database import (
    setup_db,
    get_leave_dates,
    get_db,
    User,
    Request,
    Subtask,
    Board,
    BoardMember,
    LeaveDay,
    LeaveRecord,
    Comment,
    Notification,
    DirectMessage,
    SessionLocal,
)
from utils import calculate_priority, create_notification, parse_raw_date, get_assignees
from fastapi.encoders import ENCODERS_BY_TYPE
import datetime

ENCODERS_BY_TYPE[datetime.datetime] = lambda dt: dt.strftime("%Y-%m-%d %H:%M:%S")
ENCODERS_BY_TYPE[datetime.date] = lambda d: d.strftime("%Y-%m-%d")

app = FastAPI(title="INNOCEAN Tracker API")

# Jalankan inisialisasi DB awal (tanpa alter migrations manual)
setup_db()

load_dotenv()





# Ambil URL frontend dari .env (jika ada), supaya bisa connect dari Vercel
FRONTEND_URL = os.getenv(
    "FRONTEND_URL", "https://innocean-tracker.vercel.app"
)  # Sesuaikan dengan URL Vercel Innocean Anda

# Mengizinkan React/Vue (Frontend) mengakses API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        FRONTEND_URL,
    ],  # Batasi hanya dari domain Frontend yang sah
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from dependencies import *


from services.email_service import send_email_async



























# Schema untuk input form


# Schema untuk update status


# Schema untuk update detail task


# Schema untuk input subtask






















































@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "INNOCEAN Tracker API is running smoothly! All systems go.",
    }


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return {}




















































# --- Auth Router ---
from routers.auth import router as auth_router
app.include_router(auth_router)



@app.get("/api/invitations")
def get_invitations(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    invites = (
        db.query(BoardMember)
        .filter(
            BoardMember.member_username == current_user, BoardMember.status == "pending"
        )
        .all()
    )
    res = []
    for i in invites:
        board = db.query(Board).filter(Board.id == i.board_id).first()
        if board:
            res.append(
                {
                    "id": i.id,
                    "board_name": board.name,
                    "owner_username": board.owner_username,
                }
            )
    return {"invitations": res}


@app.put("/api/invitations/{invite_id}/accept")
def accept_invite(
    invite_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inv = (
        db.query(BoardMember)
        .filter(
            BoardMember.id == invite_id, BoardMember.member_username == current_user
        )
        .first()
    )
    if inv:
        inv.status = "accepted"
        db.commit()
    return {"message": "Invitation accepted"}


@app.delete("/api/invitations/{invite_id}/decline")
def decline_invite(
    invite_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(BoardMember).filter(
        BoardMember.id == invite_id, BoardMember.member_username == current_user
    ).delete()
    db.commit()
    return {"message": "Invitation declined"}
























@app.post("/api/feedback")
def submit_feedback(
    payload: FeedbackModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = (
        db.query(Board)
        .filter(Board.owner_username == "admin", Board.name == "System Feedback")
        .first()
    )
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if not board:
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
        board = Board(
            name="System Feedback",
            owner_username="admin",
            created_at=now_str,
            statuses=default_statuses,
            categories=default_categories,
        )
        db.add(board)
        db.commit()
        db.refresh(board)

    deadline_str = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d 17:00:00")
    start_str = datetime.now().strftime("%Y-%m-%d")

    # Generate tracking number based on count
    total_feedback = db.query(Request).filter(Request.board_id == board.id).count()
    ticket_num = f"TKT-{total_feedback + 1:04d}"

    is_support = "[SUPPORT TICKET]" in payload.text
    prefix = "🛠️ Support" if is_support else "💡 Idea"
    clean_desc = payload.text.replace("[SUPPORT TICKET] ", "").strip()

    new_task = Request(
        board_id=board.id,
        timestamp=now_str,
        project_name=f"{prefix} [{ticket_num}] - {current_user}",
        requester=current_user,
        category="Support" if is_support else "Feedback",
        description=clean_desc,
        supporting_access="",
        start_date=start_str,
        deadline=deadline_str,
        status="Pending",
        owner_username="admin",
    )
    db.add(new_task)
    db.commit()

    admin_user = db.query(User).filter(User.username == "admin").first()
    if admin_user:
        create_notification(
            db,
            "admin",
            f"@{current_user} submitted a new system ticket ({ticket_num}).",
            "task_assigned",
            new_task.id,
        )
    return {"message": "Thank you! Your feedback has been placed in the Admin's queue."}






# --- ADMIN ENDPOINTS ---






















# --- LEAVE MANAGEMENT ---






# --- PROJECT CHAT (TEAM CHAT) ENDPOINTS ---










# --- DIRECT MESSAGE (DM) ENDPOINTS ---
















def run_auto_nudge():
    db = SessionLocal()
    try:
        tasks = db.query(Request).filter(
            Request.auto_nudge == True,
            Request.status.notin_(["Done", "Rejected"]),
            Request.deadline != None
        ).all()

        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        now_str = datetime.now().strftime("%Y-%m-%d")

        for task in tasks:
            deadline_date = parse_raw_date(task.deadline)
            if not deadline_date:
                continue
            
            deadline_date = deadline_date.replace(hour=0, minute=0, second=0, microsecond=0)
            days_diff = (deadline_date - today).days

            # Kirim peringatan pada H-7, H-3, H-2, H-1, Hari H, dan keterlambatan hingga 7 hari
            if days_diff in [7, 3, 2, 1, 0] or (-7 <= days_diff < 0):
                assignees = get_assignees(task.requester)
                targets = assignees.copy()
                if task.owner_username:
                    targets.add(task.owner_username)
                    
                pending_subtasks = db.query(Subtask).filter(Subtask.request_id == task.id, Subtask.is_done == 0).all()
                for st in pending_subtasks:
                    if st.assignee:
                        targets.add(st.assignee)
                        
                mention_str = " ".join([f"@{m}" for m in targets])

                if days_diff > 0:
                    msg = f"🔔 **Auto Nudge:** {mention_str}\nThis task is due in **{days_diff} day(s)**. Please ensure everything is on track!"
                elif days_diff == 0:
                    msg = f"🚨 **Auto Nudge:** {mention_str}\nThis task is due **TODAY**. Please complete it as soon as possible."
                else:
                    msg = f"🔴 **Auto Nudge:** {mention_str}\nThis task is **OVERDUE** by {abs(days_diff)} day(s). Immediate action is required!"

                # Mencegah spam komentar di hari yang sama
                tomorrow = today + timedelta(days=1)
                last_nudge = db.query(Comment).filter(
                    Comment.request_id == task.id,
                    Comment.username == "Smart Assistant 🤖",
                    Comment.timestamp >= today,
                    Comment.timestamp < tomorrow,
                    Comment.text.like("%**Auto Nudge:**%")
                ).first()

                if not last_nudge:
                    now_full = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    new_comment = Comment(
                        request_id=task.id,
                        username="Smart Assistant 🤖",
                        text=msg,
                        timestamp=now_full
                    )
                    db.add(new_comment)
                    db.commit()
                    
                    for m in targets:
                        create_notification(
                            db, m, f"Auto Nudge: {task.project_name} is {'overdue' if days_diff < 0 else 'due soon'}.", "auto_nudge", task.id
                        )
        
        # Log successful run today
        from database import set_security_log
        set_security_log(db, "auto_nudge_last_run_date", now_str)
        
    except Exception as e:
        print(f"Auto Nudge Error: {e}")
    finally:
        db.close()

# --- Dynamically Extracted Routers ---
from routers.boards import router as boards_router
app.include_router(boards_router)
from routers.tasks import router as tasks_router
app.include_router(tasks_router)
from routers.admin import router as admin_router
app.include_router(admin_router)
from routers.users import router as users_router
app.include_router(users_router)
from routers.chat import router as chat_router
app.include_router(chat_router)
from routers.leaves import router as leaves_router
app.include_router(leaves_router)
from routers.ai import router as ai_router
app.include_router(ai_router)

def run_startup_auto_nudge():
    # Only run if current local time is past 08:00 AM
    now = datetime.now()
    if now.hour < 8:
        return
        
    db = SessionLocal()
    try:
        from database import get_security_log
        today_str = now.strftime("%Y-%m-%d")
        last_run = get_security_log(db, "auto_nudge_last_run_date", "")
        if last_run != today_str:
            # Haven't run today yet (missed due to cold start), let's run it
            run_auto_nudge()
    except Exception as e:
        print(f"Startup Auto Nudge error: {e}")
    finally:
        db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(run_auto_nudge, 'cron', hour=8, minute=0)
scheduler.start()

# Check and run if the server started/woke up late today (past 08:00 AM) and missed the scheduled job
threading.Thread(target=run_startup_auto_nudge, daemon=True).start()