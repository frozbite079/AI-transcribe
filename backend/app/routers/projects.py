"""
Projects router: CRUD for transcription projects + file uploads.
Endpoints:
- POST   /api/v1/projects          -> create project + upload audio
- GET    /api/v1/projects          -> list user projects
- GET    /api/v1/projects/{id}     -> get single project (with segments/transcript)
- PUT    /api/v1/projects/{id}     -> update project metadata/segments/transcript
- DELETE /api/v1/projects/{id}     -> delete project + file
- GET    /api/v1/projects/{id}/audio -> stream audio file (Range support omitted for MVP)
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.schemas.project import ProjectResponse, ProjectListResponse, ProjectUpdate
from app.services import save_uploaded_file, delete_project_file, get_audio_file_path
from app.repositories import (
    get_project_by_id,
    get_projects_by_user,
    create_project,
    update_project,
    delete_project as repo_delete_project,
)
from app.dependencies import get_current_user, get_optional_user
from app.utils import decode_token
from typing import Optional, List
import os
import uuid

router = APIRouter()


@router.post("/", response_model=ProjectResponse, status_code=201)
async def create_project(
    name: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Save file
    file_url, file_size = save_uploaded_file(current_user.id, file)

    # Get audio duration (quick estimate via file size for mp3? Better: use ffprobe later. MVP: set 0)
    # For MVP we can compute approximate duration from file size assuming 128kbps mp3? Or later.
    audio_duration = 0.0  # placeholder

    project = create_project(
        db,
        user_id=current_user.id,
        name=name,
        audio_file_url=file_url,
        audio_duration=audio_duration,
        file_size_bytes=file_size,
    )
    return project


@router.get("/", response_model=List[ProjectListResponse])
def list_projects(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    projects = get_projects_by_user(db, current_user.id, limit=limit, offset=offset)
    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = get_project_by_id(db, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: uuid.UUID,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = get_project_by_id(db, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    project = update_project(db, project, **data.dict(exclude_unset=True))
    return project


@router.delete("/{project_id}")
def delete_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = get_project_by_id(db, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    success = delete_project_file(db, project_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete project")
    return {"detail": "Project deleted"}


@router.get("/{project_id}/audio")
def serve_audio(
    project_id: uuid.UUID,
    token: str | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    project = get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if token:
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user or project.user_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user:
        if project.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    else:
        raise HTTPException(status_code=401, detail="Authentication required")
    file_path = get_audio_file_path(project.audio_file_url)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(
        file_path,
        media_type="audio/mpeg",
        filename=os.path.basename(file_path),
    )


def format_srt_timestamp(seconds: float) -> str:
    """Convert seconds to SRT timestamp format: HH:MM:SS,mmm."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


@router.get("/{project_id}/export/srt")
def export_srt(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Export project captions as SRT file.
    Returns plain text SRT format with sequential numbering.
    """
    project = get_project_by_id(db, project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    if not project.segments or len(project.segments) == 0:
        raise HTTPException(
            status_code=400, detail="No captions available. Run alignment first."
        )

    srt_lines = []
    for idx, segment in enumerate(project.segments, start=1):
        start = format_srt_timestamp(segment.get("start", 0))
        end = format_srt_timestamp(segment.get("end", 0))
        text = segment.get("text", "").strip()
        srt_lines.append(str(idx))
        srt_lines.append(f"{start} --> {end}")
        srt_lines.append(text)
        srt_lines.append("")

    srt_content = "\n".join(srt_lines)

    # Return as plain text file download
    from fastapi.responses import PlainTextResponse

    filename = f"{project.name or 'captions'}.srt"
    return PlainTextResponse(
        content=srt_content,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "text/plain; charset=utf-8",
        },
    )
