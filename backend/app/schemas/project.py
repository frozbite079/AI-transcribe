"""
Project schemas: create, update, response, list.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
import uuid


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    transcript_text: Optional[str] = None
    segments: Optional[List[Any]] = None


class SegmentItem(BaseModel):
    start: float
    end: float
    text: str


class ProjectResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    audio_file_url: str
    audio_duration: float
    file_size_bytes: Optional[int] = None
    language_detected: Optional[str] = None
    transcript_text: Optional[str] = None
    segments: List[Any] = []
    tokens_used: int = 0
    ai_model_used: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    id: uuid.UUID
    name: str
    audio_duration: float
    transcript_text: Optional[str] = None
    tokens_used: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectMini(BaseModel):
    id: uuid.UUID
    name: str

    class Config:
        from_attributes = True
