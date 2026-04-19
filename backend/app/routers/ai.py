"""
AI router: transcription and alignment endpoints.
Endpoints:
- POST /api/v1/ai/transcribe/{project_id} -> transcribe uploaded audio via Gemini
- POST /api/v1/ai/align/{project_id}      -> align transcript to timestamps
"""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.services import transcribe_audio, align_transcript, get_audio_file_path
from app.dependencies import get_current_user
from app.schemas.ai import TranscribeResponse, AlignResponse
from typing import Optional
import uuid

router = APIRouter()


@router.post("/transcribe/{project_id}", response_model=TranscribeResponse)
def transcribe(
    project_id: uuid.UUID,
    model: str = "gemini-2.0-flash-exp",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate ownership
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    audio_path = get_audio_file_path(project.audio_file_url)
    if not audio_path.endswith((".mp3", ".wav", ".m4a", ".ogg", ".flac")):
        raise HTTPException(status_code=400, detail="Unsupported audio format")
    try:
        transcript, language = transcribe_audio(db, project.id, audio_path, model=model)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    return TranscribeResponse(transcript=transcript, language=language)


@router.post("/align/{project_id}", response_model=AlignResponse)
def align(
    project_id: uuid.UUID,
    transcript: str = Body(...),
    model: str = "gemini-2.0-flash-exp",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    audio_path = get_audio_file_path(project.audio_file_url)
    try:
        segments = align_transcript(db, project.id, audio_path, transcript, model=model)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alignment failed: {str(e)}")
    return AlignResponse(segments=segments)
