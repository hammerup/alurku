from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from database import get_db, User, Workspace, WorkspaceMember
from schemas import WorkspaceCreateModel, WorkspaceInviteModel
from dependencies import get_current_user


class WorkspaceRoleUpdateModel(BaseModel):
    role: str

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
    Jika belum memiliki workspace, buatkan otomatis satu Workspace Pribadi untuk kelancaran sistem.
    """
    memberships = db.query(WorkspaceMember).filter(WorkspaceMember.username == current_user).all()
    
    if not memberships:
        # Auto-provisioning workspace pribadi jika kosong
        user = db.query(User).filter(User.username == current_user).first()
        full_name = user.full_name if user else current_user
        
        new_ws = Workspace(
            name=f"Workspace Pribadi {full_name}",
            owner_username=current_user,
            created_at=datetime.now()
        )
        db.add(new_ws)
        db.flush()
        
        new_member = WorkspaceMember(
            workspace_id=new_ws.id,
            username=current_user,
            role="admin"
        )
        db.add(new_member)
        db.commit()
        
        # Ambil kembali daftar membership terbaru
        memberships = [new_member]
        
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
    
    # Send email notification asynchronously
    if target_user.email:
        try:
            from services.email_service import send_email_async
            workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
            ws_name = workspace.name if workspace else "Workspace"
            
            subject = f"[alurku.] Undangan Bergabung ke Ruang Kerja '{ws_name}'"
            html_content = f"""
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px;">
                <h2 style="color: #111E38;">Halo @{target_user.username},</h2>
                <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                    Anda telah diundang oleh <strong>@{current_user}</strong> untuk bergabung dan berkolaborasi di dalam Ruang Kerja (Workspace) <strong>{ws_name}</strong> pada aplikasi <strong>alurku.</strong>.
                </p>
                <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                    Silakan masuk ke akun Anda untuk mulai melihat proyek dan berkolaborasi dengan tim.
                </p>
                <div style="margin-top: 30px; text-align: center;">
                    <a href="https://alurku.app/masuk" style="background-color: #FACC15; color: #111E38; padding: 12px 24px; text-decoration: none; border-radius: 20px; font-weight: bold; font-size: 14px; display: inline-block;">Masuk ke alurku.</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin-top: 35px; margin-bottom: 20px;" />
                <p style="font-size: 12px; color: #777777; text-align: center;">
                    Pesan ini dikirim secara otomatis oleh sistem alurku.
                </p>
            </div>
            """
            send_email_async(target_user.email, subject, html_content)
        except Exception as ex:
            print(f"Error triggering workspace invite email: {ex}")
            
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


@router.put("/{workspace_id}/members/{username}")
def update_workspace_member_role(
    workspace_id: int,
    username: str,
    payload: WorkspaceRoleUpdateModel,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mengubah peran anggota dalam workspace. Hanya Admin workspace yang dapat melakukannya.
    """
    if payload.role not in ["admin", "member", "viewer"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin', 'member', or 'viewer'.")
        
    # Verify current user is admin
    admin_check = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == current_user,
        WorkspaceMember.role == "admin"
    ).first()
    if not admin_check:
        raise HTTPException(status_code=403, detail="Only workspace admins can update member roles")
        
    # Find target membership
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == username
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Member not found in this workspace")
        
    # Prevent changing workspace owner's role
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if workspace and workspace.owner_username == username:
        raise HTTPException(status_code=400, detail="Cannot change role of the workspace owner.")
        
    old_role = membership.role
    membership.role = payload.role
    db.commit()
    
    # Log and broadcast
    try:
        from utils import log_and_broadcast_activity
        log_and_broadcast_activity(
            db, 
            workspace_id, 
            current_user, 
            "workspace_member_role_updated", 
            username, 
            {"updated_user": username, "old_role": old_role, "new_role": payload.role}
        )
    except Exception:
        pass
        
    return {
        "message": f"Successfully updated @{username} role to {payload.role}"
    }


@router.delete("/{workspace_id}/members/{username}")
def remove_workspace_member(
    workspace_id: int,
    username: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Menghapus anggota dari workspace (Admin mengeluarkan anggota, atau anggota keluar sendiri).
    """
    # Find the membership
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == username
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Member not found in this workspace")
        
    # Check authorization:
    # 1. Admin of workspace deleting someone else
    # 2. User deleting themselves (leaving the workspace)
    is_self = (current_user == username)
    
    admin_check = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == current_user,
        WorkspaceMember.role == "admin"
    ).first()
    
    if not is_self and not admin_check:
        raise HTTPException(status_code=403, detail="Only admins can remove other members")
        
    # Prevent owner from leaving without transferring ownership
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if workspace and workspace.owner_username == username:
        raise HTTPException(
            status_code=400, 
            detail="Pemilik workspace tidak dapat keluar. Harap ubah kepemilikan workspace terlebih dahulu sebelum keluar."
        )
        
    db.delete(membership)
    db.commit()
    
    action_type = "workspace_left" if is_self else "workspace_member_removed"
    try:
        from utils import log_and_broadcast_activity
        log_and_broadcast_activity(
            db, 
            workspace_id, 
            current_user, 
            action_type, 
            username, 
            {"removed_user": username}
        )
    except Exception:
        pass
        
    return {
        "message": f"Successfully removed @{username} from the workspace" if not is_self else "You have left the workspace"
    }


