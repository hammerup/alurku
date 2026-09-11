import os
import uuid
import re
from pathlib import Path
from typing import Tuple, BinaryIO, Optional
from fastapi import UploadFile, HTTPException

# Directory for local file storage fallback (when R2/S3 is not configured)
UPLOAD_BASE_DIR = Path("uploads/attachments")
UPLOAD_BASE_DIR.mkdir(parents=True, exist_ok=True)

# 10 MB default limit (customizable via SystemPolicy / environment)
MAX_FILE_SIZE = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", 10 * 1024 * 1024))

# Security: Block executable, script, and dangerous extensions
BLOCKED_EXTENSIONS = {
    ".exe", ".bat", ".cmd", ".sh", ".bash", ".py", ".pyw", ".js", ".mjs",
    ".ts", ".vbs", ".vbe", ".msi", ".jar", ".com", ".scr", ".pif", ".hta",
    ".cpl", ".reg", ".ps1", ".psm1", ".php", ".phtml", ".asp", ".aspx", ".cgi"
}

# Whitelist of standard MIME types / extensions safe for task collaboration
ALLOWED_EXTENSIONS = {
    # Documents
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".txt", ".csv", ".rtf", ".md",
    # Images
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp", ".ico",
    # Archives & Media
    ".zip", ".rar", ".7z", ".tar", ".gz",
    ".mp3", ".wav", ".mp4", ".mov"
}


def is_r2_configured() -> bool:
    """Returns True if Cloudflare R2 / S3 environment variables are fully provided."""
    required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"]
    return all(bool(os.getenv(k)) for k in required)


def sanitize_filename(filename: str) -> str:
    """Sanitize original filename to prevent directory traversal and special character exploits."""
    clean = os.path.basename(filename)
    # Remove control chars and path separators
    clean = re.sub(r'[\r\n\t\\/:]', '_', clean)
    clean = clean.strip().replace('..', '_')
    if not clean:
        clean = "attachment"
    return clean[:200]


def validate_file_metadata(original_filename: str, file_size: int, content_type: Optional[str] = None):
    """Enforce size, extension, and MIME security policies."""
    ext = Path(original_filename).suffix.lower()
    
    if not ext or ext in BLOCKED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Tipe file '{ext}' tidak diizinkan demi alasan keamanan sistem."
        )
        
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Ekstensi file '{ext}' belum didukung. Silakan gunakan dokumen, gambar, atau arsip (.zip)."
        )

    if file_size > MAX_FILE_SIZE:
        max_mb = MAX_FILE_SIZE // (1024 * 1024)
        raise HTTPException(
            status_code=400,
            detail=f"Ukuran file melebihi batas maksimal ({max_mb} MB)."
        )


def get_r2_client():
    """Lazily construct S3/R2 boto3 client."""
    try:
        import boto3
        from botocore.config import Config
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="Modul 'boto3' belum terinstall untuk koneksi Cloudflare R2."
        )

    account_id = os.getenv("R2_ACCOUNT_ID")
    access_key = os.getenv("R2_ACCESS_KEY_ID")
    secret_key = os.getenv("R2_SECRET_ACCESS_KEY")
    endpoint_url = os.getenv("R2_ENDPOINT_URL") or f"https://{account_id}.r2.cloudflarestorage.com"

    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4"),
    )


async def save_uploaded_file(file: UploadFile, task_id: int) -> Tuple[str, str, int, str]:
    """
    Reads and stores an uploaded file into Local storage or Cloudflare R2.
    Returns: (original_filename, stored_path, file_size, storage_backend)
    """
    clean_name = sanitize_filename(file.filename or "file")
    content = await file.read()
    file_size = len(content)

    validate_file_metadata(clean_name, file_size, file.content_type)

    ext = Path(clean_name).suffix.lower()
    unique_key = f"tasks/{task_id}/{uuid.uuid4().hex}_{clean_name}"

    if is_r2_configured():
        # Cloudflare R2 Storage Engine
        bucket_name = os.getenv("R2_BUCKET_NAME")
        client = get_r2_client()
        content_type = file.content_type or "application/octet-stream"
        
        client.put_object(
            Bucket=bucket_name,
            Key=unique_key,
            Body=content,
            ContentType=content_type
        )
        return clean_name, unique_key, file_size, "r2"
    else:
        # Local Disk Storage Fallback
        target_dir = UPLOAD_BASE_DIR / str(task_id)
        target_dir.mkdir(parents=True, exist_ok=True)
        
        local_filename = f"{uuid.uuid4().hex}{ext}"
        target_path = target_dir / local_filename
        
        with open(target_path, "wb") as f:
            f.write(content)
            
        relative_path = f"{task_id}/{local_filename}"
        return clean_name, relative_path, file_size, "local"


def get_file_stream(stored_path: str, storage_backend: str):
    """
    Opens and returns a generator/stream for the file.
    For local: returns open file handle.
    For R2: returns streaming body.
    """
    if storage_backend == "r2":
        bucket_name = os.getenv("R2_BUCKET_NAME")
        client = get_r2_client()
        response = client.get_object(Bucket=bucket_name, Key=stored_path)
        return response["Body"]
    else:
        full_path = UPLOAD_BASE_DIR / stored_path
        if not full_path.exists():
            raise HTTPException(status_code=404, detail="File fisik tidak ditemukan pada server.")
        return open(full_path, "rb")


def delete_stored_file(stored_path: str, storage_backend: str) -> bool:
    """Deletes stored file from either Local storage or Cloudflare R2."""
    try:
        if storage_backend == "r2":
            bucket_name = os.getenv("R2_BUCKET_NAME")
            client = get_r2_client()
            client.delete_object(Bucket=bucket_name, Key=stored_path)
            return True
        else:
            full_path = UPLOAD_BASE_DIR / stored_path
            if full_path.exists():
                full_path.unlink()
            return True
    except Exception as e:
        print(f"[Storage Service] Error deleting file {stored_path}: {e}")
        return False
