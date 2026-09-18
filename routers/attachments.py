from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import urllib.parse

from database import get_db, Request, TaskAttachment
from dependencies import get_current_user
from utils import has_task_read_access, is_workspace_viewer, is_board_writer, is_task_admin, log_activity, update_board_activity
from services.tier_service import enforce_can_upload_storage
from services.storage_service import save_uploaded_file, get_file_stream, delete_stored_file

router = APIRouter()

@router.get("/api/tasks/{task_id}/attachments")
def list_task_attachments(
    task_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Request).filter(Request.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task tidak ditemukan.")
    if not has_task_read_access(db, task, current_user):
        raise HTTPException(status_code=403, detail="Akses ditolak.")

    records = (
        db.query(TaskAttachment)
        .filter(TaskAttachment.task_id == task_id)
        .order_by(TaskAttachment.created_at.desc())
        .all()
    )

    attachments = []
    for a in records:
        created_str = a.created_at.strftime("%Y-%m-%d %H:%M:%S") if a.created_at else None
        attachments.append({
            "id": a.id,
            "task_id": a.task_id,
            "filename": a.filename,
            "file_size": a.file_size,
            "content_type": a.content_type,
            "uploader_username": a.uploader_username,
            "created_at": created_str,
            "download_url": f"/api/attachments/{a.id}/download",
            "preview_url": f"/api/attachments/{a.id}/preview",
        })

    return {"attachments": attachments}


@router.post("/api/tasks/{task_id}/attachments")
async def upload_task_attachments(
    task_id: int,
    files: List[UploadFile] = File(...),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Request).filter(Request.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task tidak ditemukan.")
    if not has_task_read_access(db, task, current_user):
        raise HTTPException(status_code=403, detail="Akses ditolak.")
    if is_workspace_viewer(db, getattr(task, 'workspace_id', None), current_user):
        raise HTTPException(status_code=403, detail="Akses Ditolak: Role Viewer tidak dapat mengunggah file.")
    if not is_board_writer(db, task.board_id, current_user):
        raise HTTPException(status_code=403, detail="Anda belum bergabung dengan proyek ini.")

    # Enforce workspace tier storage limit (pre-check total size of batch)
    incoming_total_bytes = sum(getattr(f, "size", 0) or 0 for f in files)
    if task.workspace_id:
        enforce_can_upload_storage(db, task.workspace_id, incoming_total_bytes)

    uploaded_records = []
    uploaded_names = []

    for f in files:
        if not f.filename:
            continue
        original_name, stored_path, size_bytes, backend = await save_uploaded_file(f, task_id)
        
        attachment = TaskAttachment(
            task_id=task_id,
            filename=original_name,
            stored_path=stored_path,
            storage_backend=backend,
            file_size=size_bytes,
            content_type=f.content_type or "application/octet-stream",
            uploader_username=current_user,
        )
        db.add(attachment)
        db.flush()

        uploaded_names.append(original_name)
        uploaded_records.append({
            "id": attachment.id,
            "task_id": task_id,
            "filename": original_name,
            "file_size": size_bytes,
            "content_type": attachment.content_type,
            "uploader_username": current_user,
            "created_at": attachment.created_at.strftime("%Y-%m-%d %H:%M:%S") if attachment.created_at else None,
            "download_url": f"/api/attachments/{attachment.id}/download",
            "preview_url": f"/api/attachments/{attachment.id}/preview",
        })

    db.commit()

    if uploaded_names:
        summary_names = ", ".join(uploaded_names[:3])
        if len(uploaded_names) > 3:
            summary_names += f" dan {len(uploaded_names) - 3} file lainnya"
        log_activity(db, task_id, f"**@{current_user}** mengunggah lampiran: **{summary_names}**.")
        update_board_activity(db, task.board_id)

    return {
        "message": f"Berhasil mengunggah {len(uploaded_records)} file lampiran.",
        "attachments": uploaded_records,
    }


@router.get("/api/attachments/{attachment_id}/download")
def download_attachment(
    attachment_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attachment = db.query(TaskAttachment).filter(TaskAttachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="File lampiran tidak ditemukan.")

    task = db.query(Request).filter(Request.id == attachment.task_id).first()
    if not task or not has_task_read_access(db, task, current_user):
        raise HTTPException(status_code=403, detail="Akses ditolak.")

    stream = get_file_stream(attachment.stored_path, attachment.storage_backend)
    
    encoded_filename = urllib.parse.quote(attachment.filename)
    headers = {
        "Content-Disposition": f"attachment; filename=\"{attachment.filename}\"; filename*=UTF-8''{encoded_filename}",
        "Content-Length": str(attachment.file_size) if attachment.file_size else None,
    }
    headers = {k: v for k, v in headers.items() if v is not None}

    return StreamingResponse(
        stream if hasattr(stream, "read") else iter([stream]),
        media_type=attachment.content_type or "application/octet-stream",
        headers=headers,
    )


@router.get("/api/attachments/{attachment_id}/preview")
def preview_attachment(
    attachment_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attachment = db.query(TaskAttachment).filter(TaskAttachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="File lampiran tidak ditemukan.")

    task = db.query(Request).filter(Request.id == attachment.task_id).first()
    if not task or not has_task_read_access(db, task, current_user):
        raise HTTPException(status_code=403, detail="Akses ditolak.")

    stream = get_file_stream(attachment.stored_path, attachment.storage_backend)
    
    encoded_filename = urllib.parse.quote(attachment.filename)
    headers = {
        "Content-Disposition": f"inline; filename=\"{attachment.filename}\"; filename*=UTF-8''{encoded_filename}",
        "Content-Length": str(attachment.file_size) if attachment.file_size else None,
    }
    headers = {k: v for k, v in headers.items() if v is not None}

    return StreamingResponse(
        stream if hasattr(stream, "read") else iter([stream]),
        media_type=attachment.content_type or "application/octet-stream",
        headers=headers,
    )


@router.delete("/api/tasks/{task_id}/attachments/{attachment_id}")
def delete_task_attachment(
    task_id: int,
    attachment_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attachment = (
        db.query(TaskAttachment)
        .filter(TaskAttachment.id == attachment_id, TaskAttachment.task_id == task_id)
        .first()
    )
    if not attachment:
        raise HTTPException(status_code=404, detail="File lampiran tidak ditemukan.")

    task = db.query(Request).filter(Request.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task tidak ditemukan.")

    is_uploader = attachment.uploader_username.lower() == current_user.lower()
    is_admin = is_task_admin(db, task, current_user)
    
    if not (is_uploader or is_admin):
        raise HTTPException(
            status_code=403,
            detail="Hanya pengunggah file atau Admin Tugas yang dapat menghapus lampiran ini."
        )

    # Delete physical file from storage
    delete_stored_file(attachment.stored_path, attachment.storage_backend)
    
    deleted_filename = attachment.filename
    db.delete(attachment)
    db.commit()

    log_activity(db, task_id, f"**@{current_user}** menghapus lampiran **{deleted_filename}**.")
    update_board_activity(db, task.board_id)

    return {"message": f"Lampiran '{deleted_filename}' berhasil dihapus."}
