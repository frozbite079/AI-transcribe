"""
Auth schemas: registration, login, token responses.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    name: str = Field(..., min_length=1, max_length=255)
    mobile: Optional[str] = Field(None, max_length=20)
    company: Optional[str] = Field(None, max_length=255)
    language: str = Field(default="English (US)", max_length=50)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class TokenRefresh(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    mobile: Optional[str] = None
    company: Optional[str] = None
    language: str
    avatar_url: Optional[str] = None
    is_verified: bool
    two_factor_enabled: bool
    plan: str
    plan_expires_at: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    mobile: Optional[str] = Field(None, max_length=20)
    company: Optional[str] = Field(None, max_length=255)
    language: Optional[str] = Field(None, max_length=50)


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
