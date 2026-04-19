"""
File service: handle file uploads, validation, deletion, serving.
"""

import os
import uuid
from fastapi import UploadFile, HTTPException
from app.config import settings
from app.database import SessionLocal
from sqlalchemy.orm import Session
from app.models.project import Project
from app.repositories import get_project_by_id, delete_project as repo_delete_project
from typing import Optional


# Allowed audio MIME types
ALLOWED_MIME_TYPES = {
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/flac",
    "audio/m4a",
    "audio/mp4",
}


def validate_audio_file(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed: {', '.join(ALLOWED_MIME_TYPES)}",
        )


def get_user_upload_dir(user_id: uuid.UUID) -> str:
    """Returns path: ./uploads/{user_id}/"""
    base = os.path.abspath(settings.upload_dir)
    user_dir = os.path.join(base, str(user_id))
    os.makedirs(user_dir, exist_ok=True)
    return user_dir


def save_uploaded_file(user_id: uuid.UUID, file: UploadFile) -> tuple[str, int]:
    """
    Save file to disk.
    Returns (file_url, file_size_bytes).
    file_url is a relative path from backend root.
    """
    validate_audio_file(file)

    # Read file content (streaming for large files could be added later)
    content = file.file.read()
    file_size = len(content)

    if file_size > settings.max_file_size:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size is {settings.max_file_size // (1024 * 1024)}MB",
        )

    # Generate unique filename
    ext = os.path.splitext(file.filename or "upload")[1] or ".mp3"
    filename = f"{uuid.uuid4()}{ext}"
    user_dir = get_user_upload_dir(user_id)
    file_path = os.path.join(user_dir, filename)

    with open(file_path, "wb") as f:
        f.write(content)

    # Return relative URL (to be stored in DB)
    file_url = f"/uploads/{user_id}/{filename}"
    return file_url, file_size


def delete_project_file(db: Session, project_id: uuid.UUID) -> bool:
    """Delete project record and its associated audio file."""
    project = get_project_by_id(db, project_id)
    if not project:
        return False
    # Delete file from disk
    if project.audio_file_url:
        full_path = os.path.join(
            os.path.abspath(settings.upload_dir), project.audio_file_url.lstrip("/")
        )
        try:
            if os.path.exists(full_path):
                os.remove(full_path)
        except Exception:
            pass  # Log but continue
    repo_delete_project(db, project)
    return True


def get_audio_file_path(relative_url: str) -> str:
    """Convert stored relative URL to absolute filesystem path."""
    return os.path.join(os.path.abspath(settings.upload_dir), relative_url.lstrip("/"))
