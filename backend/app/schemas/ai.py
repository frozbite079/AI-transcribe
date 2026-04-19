"""
AI/Transcription schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Any


class TranscribeRequest(BaseModel):
    # Multipart form data, so fields come from form
    pass  # Placeholder, actual handling via Form/File in router


class AlignRequest(BaseModel):
    transcript: str
    segments: Optional[List[Any]] = None


class AlignResponse(BaseModel):
    segments: List[Any]
    message: str = "Alignment complete"


class TranscribeResponse(BaseModel):
    transcript: str
    language: str
