from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, text
import re
import json
from datetime import datetime, timedelta
import os
import urllib.parse
import requests

from database import get_db, User, Request, Subtask, Board, BoardMember, LeaveDay, LeaveRecord, Comment, Notification, DirectMessage, Workspace, WorkspaceMember
from schemas import *
from dependencies import *
from utils import *

router = APIRouter()

@router.get("/api/leaves/holidays")
def get_public_holidays(year: int = 2026):
    gcal_key = os.getenv("GOOGLE_CALENDAR_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gcal_key:
        try:
            cal_id = urllib.parse.quote("en.indonesian#holiday@group.v.calendar.google.com")
            time_min = f"{year}-01-01T00:00:00Z"
            time_max = f"{year}-12-31T23:59:59Z"
            url = f"https://www.googleapis.com/calendar/v3/calendars/{cal_id}/events?key={gcal_key.strip()}&timeMin={time_min}&timeMax={time_max}&singleEvents=true&orderBy=startTime"
            res = requests.get(url, timeout=10)
            if res.status_code == 200:
                items = res.json().get("items", [])
                holidays = []
                for it in items:
                    date_val = it.get("start", {}).get("date") or str(it.get("start", {}).get("dateTime", ""))[:10]
                    if date_val:
                        holidays.append({
                            "id": f"gcal-{it.get('id')}",
                            "leave_date": date_val,
                            "description": it.get("summary", "Hari Libur Nasional"),
                            "leave_type": "public_holiday",
                            "is_google": True,
                        })
                if holidays:
                    return {"holidays": holidays, "source": "google_calendar"}
        except Exception as e:
            print(f"GCal fetch error: {e}")

    # Fallback dataset
    calendar_fallback = {
        2026: [
            {"leave_date": "2026-01-01", "description": "Tahun Baru 2026 Masehi"},
            {"leave_date": "2026-01-16", "description": "Isra Mikraj Nabi Muhammad SAW"},
            {"leave_date": "2026-02-17", "description": "Tahun Baru Imlek 2577 Kongzili"},
            {"leave_date": "2026-03-19", "description": "Hari Suci Nyepi Tahun Baru Saka 1948"},
            {"leave_date": "2026-03-21", "description": "Hari Raya Idul Fitri 1447 H"},
            {"leave_date": "2026-03-22", "description": "Hari Raya Idul Fitri 1447 H"},
            {"leave_date": "2026-04-03", "description": "Wafat Yesus Kristus"},
            {"leave_date": "2026-04-05", "description": "Kebangkitan Yesus Kristus (Paskah)"},
            {"leave_date": "2026-05-01", "description": "Hari Buruh Internasional"},
            {"leave_date": "2026-05-14", "description": "Kenaikan Yesus Kristus"},
            {"leave_date": "2026-05-27", "description": "Hari Raya Idul Adha 1447 H"},
            {"leave_date": "2026-05-31", "description": "Hari Raya Waisak 2570 BE"},
            {"leave_date": "2026-06-01", "description": "Hari Lahir Pancasila"},
            {"leave_date": "2026-06-16", "description": "Tahun Baru Islam 1448 H"},
            {"leave_date": "2026-08-17", "description": "Hari Proklamasi Kemerdekaan RI"},
            {"leave_date": "2026-08-25", "description": "Maulid Nabi Muhammad SAW"},
            {"leave_date": "2026-12-25", "description": "Hari Raya Natal"},
        ]
    }
    fallback_list = calendar_fallback.get(year, [
        {"leave_date": f"{year}-01-01", "description": "Tahun Baru Masehi"},
        {"leave_date": f"{year}-05-01", "description": "Hari Buruh Internasional"},
        {"leave_date": f"{year}-06-01", "description": "Hari Lahir Pancasila"},
        {"leave_date": f"{year}-08-17", "description": "Hari Proklamasi Kemerdekaan RI"},
        {"leave_date": f"{year}-12-25", "description": "Hari Raya Natal"},
    ])
    return {
        "holidays": [
            {
                "id": f"gcal-fallback-{year}-{i}",
                "leave_date": h["leave_date"],
                "description": h["description"],
                "leave_type": "public_holiday",
                "is_google": True,
            }
            for i, h in enumerate(fallback_list)
        ],
        "source": "fallback",
    }

@router.get("/api/leaves")
def get_leaves(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    # Cari ID project (board) yang Anda miliki atau ikuti
    owned_boards = db.query(Board.id).filter(Board.owner_username == current_user)
    member_boards = db.query(BoardMember.board_id).filter(
        BoardMember.member_username == current_user, BoardMember.status == "accepted"
    )

    # Kumpulkan username seluruh rekan satu tim Anda dari Boards
    team_members = (
        db.query(BoardMember.member_username)
        .filter(
            or_(
                BoardMember.board_id.in_(owned_boards),
                BoardMember.board_id.in_(member_boards),
            )
        )
        .all()
    )
    owners = (
        db.query(Board.owner_username)
        .filter(or_(Board.id.in_(owned_boards), Board.id.in_(member_boards)))
        .all()
    )

    team_usernames = set([m[0] for m in team_members] + [o[0] for o in owners])
    team_usernames.add(current_user)

    # Kumpulkan juga rekan satu ruang kerja (Workspace Members) agar cuti rekan selalu tersinkronisasi
    try:
        owned_ws = db.query(Workspace.id).filter(Workspace.owner_username == current_user)
        member_ws = db.query(WorkspaceMember.workspace_id).filter(WorkspaceMember.username == current_user)
        all_ws_ids = set([w[0] for w in owned_ws.all()] + [w[0] for w in member_ws.all()])
        if all_ws_ids:
            ws_members = db.query(WorkspaceMember.username).filter(WorkspaceMember.workspace_id.in_(all_ws_ids)).all()
            ws_owners = db.query(Workspace.owner_username).filter(Workspace.id.in_(all_ws_ids)).all()
            for (u,) in ws_members:
                if u: team_usernames.add(u)
            for (u,) in ws_owners:
                if u: team_usernames.add(u)
    except Exception as e:
        print(f"Workspace leaves lookup error: {e}")

    # Ambil Hari Libur Nasional, Cuti Bersama, dan Cuti Personal milik Anda & tim Anda
    leaves = (
        db.query(LeaveRecord)
        .filter(
            or_(
                LeaveRecord.leave_type.in_(["mass_leave", "public_holiday"]),
                and_(
                    LeaveRecord.leave_type == "personal",
                    LeaveRecord.username.in_(team_usernames),
                ),
            )
        )
        .all()
    )

    db_leaves = [
        {
            "id": l.id,
            "leave_date": l.leave_date.strftime("%Y-%m-%d") if hasattr(l.leave_date, "strftime") else str(l.leave_date)[:10],
            "description": l.description,
            "leave_type": l.leave_type,
            "username": l.username,
        }
        for l in leaves
    ]

    # Sertakan juga Hari Libur Nasional resmi Google Calendar untuk tahun berjalan
    try:
        current_year = datetime.now().year
        gcal_holidays = get_public_holidays(current_year).get("holidays", [])
        existing_keys = set(f"{l['leave_date']}_{(l.get('description') or '').lower()}" for l in db_leaves)
        for g in gcal_holidays:
            k = f"{g['leave_date']}_{(g.get('description') or '').lower()}"
            if k not in existing_keys:
                db_leaves.append(g)
                existing_keys.add(k)
    except Exception as e:
        print(f"Error merging holidays to leaves: {e}")

    return {
        "leaves": db_leaves
    }


@router.get("/api/leaves/workload-summary")
def get_workload_leaves_summary(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Returns unified team leaves and capacity deductions for Workload Analytics & Burnout Prevention.
    """
    leaves_data = get_leaves(current_user=current_user, db=db)
    all_leaves = leaves_data.get("leaves", [])

    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    week_start = now - timedelta(days=now.weekday())
    week_end = week_start + timedelta(days=6)
    week_start_str = week_start.strftime("%Y-%m-%d")
    week_end_str = week_end.strftime("%Y-%m-%d")

    active_leaves_today = []
    weekly_leave_days = {}

    for l in all_leaves:
        ld = l.get("leave_date")
        uname = l.get("username")
        ltype = l.get("leave_type")

        if ld == today_str:
            active_leaves_today.append({
                "username": uname,
                "description": l.get("description"),
                "leave_type": ltype,
                "leave_date": ld
            })

        if ld and week_start_str <= ld <= week_end_str:
            if ltype in ["mass_leave", "public_holiday"]:
                weekly_leave_days["__all__"] = weekly_leave_days.get("__all__", 0) + 1
            elif uname:
                weekly_leave_days[uname] = weekly_leave_days.get(uname, 0) + 1

    return {
        "leaves": all_leaves,
        "today": today_str,
        "week_start": week_start_str,
        "week_end": week_end_str,
        "active_leaves_today": active_leaves_today,
        "weekly_leave_days": weekly_leave_days,
    }



@router.post("/api/leaves")
def create_leave(
    payload: LeaveModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.leave_type == "mass_leave" and not is_user_superadmin(db, current_user):
        raise HTTPException(
            status_code=403, detail="Only Super Admins can set mass leaves."
        )
    username = current_user if payload.leave_type == "personal" else None

    start_dt = datetime.strptime(payload.start_date, "%Y-%m-%d")
    end_dt = (
        datetime.strptime(payload.end_date, "%Y-%m-%d")
        if payload.end_date
        else start_dt
    )
    delta = end_dt - start_dt

    for i in range(delta.days + 1):
        cur_date = (start_dt + timedelta(days=i)).strftime("%Y-%m-%d")
        existing = (
            db.query(LeaveRecord)
            .filter(
                LeaveRecord.leave_date == cur_date,
                LeaveRecord.leave_type == payload.leave_type,
                LeaveRecord.username == username,
            )
            .first()
        )
        if not existing:
            new_leave = LeaveRecord(
                leave_date=cur_date,
                description=payload.description,
                leave_type=payload.leave_type,
                username=username,
            )
            db.add(new_leave)

    db.commit()
    return {"message": "Leave date(s) added successfully"}


@router.delete("/api/leaves/{leave_id}")
def delete_leave(
    leave_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    leave = db.query(LeaveRecord).filter(LeaveRecord.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Not found")
    if leave.leave_type == "mass_leave" and not is_user_superadmin(db, current_user):
        raise HTTPException(status_code=403)
    if leave.leave_type == "personal" and leave.username != current_user:
        raise HTTPException(status_code=403)
    if leave.leave_type == "public_holiday":
        raise HTTPException(
            status_code=403, detail="Cannot manually delete public holidays."
        )
    db.delete(leave)
    db.commit()
    return {"message": "Leave removed"}

