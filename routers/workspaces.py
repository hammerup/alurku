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


def get_write_active_workspace_id(
    workspace_id: int = Depends(get_active_workspace_id),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> int:
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == current_user
    ).first()
    if membership and membership.role == "viewer":
        raise HTTPException(
            status_code=403, 
            detail="Akses Ditolak: Pengguna dengan role Viewer hanya memiliki akses baca (Read-Only) dan tidak dapat menambah, mengedit, atau menghapus data."
        )
    return workspace_id



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
    Mengundang pengguna lain ke workspace. Hanya Admin workspace, Owner, atau System Admin yang dapat mengundang.
    Mendukung undangan anggota terdaftar maupun rekan baru via email.
    """
    # 1. Verify workspace exists
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # 2. Verify current user is owner, admin of this workspace, or system administrator
    from utils import is_user_superadmin, create_notification, log_and_broadcast_activity
    is_sa = is_user_superadmin(db, current_user)
    is_owner = (workspace.owner_username == current_user)
    admin_check = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == current_user,
        WorkspaceMember.role == "admin"
    ).first()
    if not is_owner and not admin_check and not is_sa:
        raise HTTPException(status_code=403, detail="Hanya Admin Workspace, Pemilik, atau System Administrator yang dapat mengundang anggota baru.")

    raw_target = payload.username_or_email.strip()
    if not raw_target:
        raise HTTPException(status_code=400, detail="Mohon masukkan username atau alamat email.")

    # 3. Prevent self-invite
    if raw_target.lower() == current_user.lower():
        raise HTTPException(status_code=400, detail="Tidak dapat mengundang diri sendiri ke ruang kerja.")

    # 4. Find target user by username or email
    target_user = db.query(User).filter(
        (User.username.ilike(raw_target)) | (User.email.ilike(raw_target))
    ).first()

    ws_name = workspace.name

    # 5. Handle unregistered user invite via email
    if not target_user:
        if "@" in raw_target and "." in raw_target:
            try:
                from services.email_service import send_email_async
                subject = f"[alurku.] Undangan Bergabung ke Ruang Kerja '{ws_name}'"
                html_content = f"""
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #111E38; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #111E38; font-weight: 800;">Undangan Ruang Kerja alurku.</h2>
                    <p>Halo,</p>
                    <p><strong>@{current_user}</strong> mengundang Anda untuk bergabung dan berkolaborasi di Ruang Kerja (Workspace) <strong>"{ws_name}"</strong> sebagai <strong>{payload.role}</strong> pada aplikasi <strong>alurku.</strong>.</p>
                    <p>Silakan mendaftar akun alurku. untuk langsung mulai berkolaborasi:</p>
                    <p style="margin-top: 25px; text-align: center;">
                        <a href="https://alurku.app/daftar?email={raw_target}" style="background-color: #FACC15; color: #111E38; padding: 12px 28px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">Daftar Akun alurku.</a>
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 15px;" />
                    <p style="font-size: 12px; color: #64748b; text-align: center;">alurku. - Kuasai Waktumu, Lancarkan Alurmu.</p>
                </div>
                """
                send_email_async(raw_target, subject, html_content)
                return {
                    "message": f"Undangan telah dikirimkan ke email {raw_target}. Rekan Anda dapat mendaftar untuk bergabung.",
                    "status": "invited_unregistered"
                }
            except Exception as ex:
                print(f"Error triggering workspace invite email: {ex}")
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan. Pastikan username atau email yang dimasukkan benar.")

    # 6. Check if target user is self
    if target_user.username.lower() == current_user.lower():
        raise HTTPException(status_code=400, detail="Tidak dapat mengundang diri sendiri ke ruang kerja.")

    # 7. Check if already a member
    existing = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == target_user.username
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member of this workspace")

    role_to_assign = payload.role if payload.role in ["admin", "member", "viewer"] else "member"
    new_member = WorkspaceMember(
        workspace_id=workspace_id,
        username=target_user.username,
        role=role_to_assign
    )
    db.add(new_member)
    db.commit()

    # 8. Send in-app notification
    try:
        create_notification(
            db,
            target_user.username,
            f"@{current_user} menambahkan Anda ke ruang kerja '{ws_name}' sebagai {role_to_assign}.",
            "team_invite"
        )
    except Exception:
        pass

    # 9. Log and broadcast activity feed
    try:
        log_and_broadcast_activity(
            db,
            workspace_id,
            current_user,
            "workspace_member_invited",
            target_user.username,
            {"invited_user": target_user.username, "role": role_to_assign}
        )
    except Exception:
        pass

    # 10. Send email notification asynchronously to registered user
    if target_user.email:
        try:
            from services.email_service import send_email_async
            subject = f"[alurku.] Undangan Bergabung ke Ruang Kerja '{ws_name}'"
            html_content = f"""
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px;">
                <h2 style="color: #111E38;">Halo @{target_user.username},</h2>
                <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                    Anda telah diundang oleh <strong>@{current_user}</strong> untuk bergabung dan berkolaborasi di dalam Ruang Kerja (Workspace) <strong>{ws_name}</strong> sebagai <strong>{role_to_assign}</strong> pada aplikasi <strong>alurku.</strong>.
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
        
    # Verify current user is owner, admin, or system administrator
    from utils import is_user_superadmin
    is_sa = is_user_superadmin(db, current_user)
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    is_owner = (workspace.owner_username == current_user)
    admin_check = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == current_user,
        WorkspaceMember.role == "admin"
    ).first()
    if not is_owner and not admin_check and not is_sa:
        raise HTTPException(status_code=403, detail="Only workspace admins or system administrators can update member roles")
        
    # Find target membership
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == username
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Member not found in this workspace")
        
    # Prevent changing workspace owner's role
    if workspace.owner_username == username:
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
        
    # 1. Verify workspace exists
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Check authorization:
    # 1. Workspace owner
    # 2. Admin of workspace deleting someone else
    # 3. User deleting themselves (leaving the workspace)
    # 4. System Administrator
    is_self = (current_user == username)
    is_owner = (workspace.owner_username == current_user)
    from utils import is_user_superadmin
    is_sa = is_user_superadmin(db, current_user)
    
    admin_check = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.username == current_user,
        WorkspaceMember.role == "admin"
    ).first()
    
    if not is_self and not is_owner and not admin_check and not is_sa:
        raise HTTPException(status_code=403, detail="Only admins or system administrators can remove other members")
        
    # Prevent owner from leaving without transferring ownership
    if workspace.owner_username == username:
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


@router.delete("/{workspace_id}")
def delete_workspace(
    workspace_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Menghapus workspace secara permanen. Hanya Owner workspace yang dapat menghapus.
    """
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
        
    if workspace.owner_username != current_user:
        raise HTTPException(
            status_code=403, 
            detail="Hanya Pemilik (Owner) workspace yang dapat menghapus workspace secara permanen."
        )
        
    ws_name = workspace.name
    db.delete(workspace)
    db.commit()
    
    return {"message": f"Workspace '{ws_name}' berhasil dihapus secara permanen."}



