"""
User-related schemas.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class UserProfileResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    mobile: Optional[str] = None
    company: Optional[str] = None
    language: str
    avatar_url: Optional[str] = None
    is_verified: bool
    plan: str
    plan_expires_at: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserPublicResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str

    class Config:
        from_attributes = True
