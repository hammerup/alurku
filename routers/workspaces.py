from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from database import get_db, User, Workspace, WorkspaceMember
from schemas import WorkspaceCreateModel, WorkspaceInviteModel
from dependencies import get_current_user

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])


def get_active_workspace_id(
    x_workspace_id: Optional[int] = Header(None, alias="X-Workspace-ID"),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> int:
    if not x_workspace_id:
        membership = db.query(WorkspaceMember).filter(WorkspaceMember.username == current_user).first()
        if not membership:
            raise HTTPException(status_code=403, detail="User is not a member of any workspace")
        return membership.workspace_id
    
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == x_workspace_id,
        WorkspaceMember.username == current_user
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Access denied: You are not a member of this workspace")
        
    return x_workspace_id


@router.get("")
def list_workspaces(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Mengambil daftar semua workspace di mana pengguna saat ini terdaftar sebagai anggota.
    Ini sangat berguna bagi data analyst untuk menganalisis retensi pengguna dan pola keterlibatan tim (CRM).
    """
    memberships = db.query(WorkspaceMember).filter(WorkspaceMember.username == current_user).all()
    workspace_ids = [m.workspace_id for m in memberships]
    
    workspaces = db.query(Workspace).filter(Workspace.id.in_(workspace_ids)).all()
    
    result = []
    for ws in workspaces:
        # Get member count for CRM tracking
        member_count = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == ws.id).count()
        result.append({
            "id": ws.id,
            "name": ws.name,
            "owner_username": ws.owner_username,
            "created_at": ws.created_at.strftime("%Y-%m-%d %H:%M:%S") if ws.created_at else None,
            "member_count": member_count
        })
    return result


@router.post("")
def create_workspace(
    payload: WorkspaceCreateModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Membuat workspace baru dan mendaftarkan pembuat sebagai Admin.
    """
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Workspace name cannot be empty")
        
    new_ws = Workspace(
        name=payload.name.strip(),
        owner_username=current_user
    )
    db.add(new_ws)
    db.flush()
    
    ws_member = WorkspaceMember(
        workspace_id=new_ws.id,
        username=current_user,
        role="admin"
    )
    db.add(ws_member)
    db.commit()
    
    return {
        "message": "Workspace created successfully",
        "workspace": {
            "id": new_ws.id,
            "name": new_ws.name,
            "owner_username": new_ws.owner_username,
            "created_at": new_ws.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
    }


@router.post("/{workspace_id}/invite")
def invite_to_workspace(
    workspace_id: int,
    payload: WorkspaceInviteModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mengundang pengguna lain ke workspace. Hanya Admin workspace yang dapat mengundang.
    """
    # Verify current user is admin of this workspace
    admin_check = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == current_user,
        WorkspaceMember.role == "admin"
    ).first()
    if not admin_check:
        raise HTTPException(status_code=403, detail="Only workspace admins can invite new members")
        
    # Find target user by username or email
    target_user = db.query(User).filter(
        (User.username == payload.username_or_email) | (User.email == payload.username_or_email)
    ).first()
    if not target_user:
        raise HTTPException(status_code=444, detail="User not found")
        
    # Check if already a member
    existing = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == target_user.username
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member of this workspace")
        
    new_member = WorkspaceMember(
        workspace_id=workspace_id,
        username=target_user.username,
        role=payload.role if payload.role in ["admin", "member", "viewer"] else "member"
    )
    db.add(new_member)
    db.commit()
    
    return {
        "message": f"Successfully invited @{target_user.username} to the workspace"
    }


@router.get("/{workspace_id}/members")
def list_workspace_members(
    workspace_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mengambil daftar semua anggota di workspace ini.
    Membantu CRM/analisis melacak seberapa aktif workspace tersebut.
    """
    # Verify current user is member of this workspace
    member_check = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == current_user
    ).first()
    if not member_check:
        raise HTTPException(status_code=403, detail="Access denied: You are not a member of this workspace")
        
    memberships = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace_id).all()
    usernames = [m.username for m in memberships]
    
    users = db.query(User).filter(User.username.in_(usernames)).all()
    user_map = {u.username: u for u in users}
    
    result = []
    for m in memberships:
        u = user_map.get(m.username)
        result.append({
            "username": m.username,
            "full_name": u.full_name if u else None,
            "email": u.email if u else None,
            "role": m.role,
            "joined_at": m.joined_at.strftime("%Y-%m-%d %H:%M:%S") if m.joined_at else None
        })
    return result


@router.put("/{workspace_id}")
def update_workspace(
    workspace_id: int,
    payload: WorkspaceCreateModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mengubah nama workspace. Hanya Admin workspace yang dapat melakukannya.
    """
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Workspace name cannot be empty")
        
    admin_check = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == current_user,
        WorkspaceMember.role == "admin"
    ).first()
    if not admin_check:
        raise HTTPException(status_code=403, detail="Only workspace admins can rename the workspace")
        
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
        
    ws.name = payload.name.strip()
    db.commit()
    
    return {
        "message": "Workspace updated successfully",
        "workspace": {
            "id": ws.id,
            "name": ws.name
        }
    }

