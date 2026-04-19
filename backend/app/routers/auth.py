"""
Authentication router: /api/v1/auth/*
Endpoints: register, login, me, change-password, refresh, logout.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    UserUpdate,
    ChangePasswordRequest,
)
from app.services import (
    register_user,
    authenticate_user,
    generate_tokens,
    refresh_access_token,
    logout_user,
    update_user_profile,
    change_password,
)
from app.models.user import User
from app.dependencies import get_current_user
from app.utils import hash_password
from typing import Optional

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=201)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = register_user(db, data)
    return user


@router.post("/login", response_model=TokenResponse)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db, LoginRequest(email=form_data.username, password=form_data.password)
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    tokens = generate_tokens(str(user.id))
    # Set refresh token as httpOnly cookie (not strictly needed for API but good practice)
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=settings.environment == "production",
        samesite="strict",
        max_age=settings.refresh_token_expire_days * 86400,
    )
    return tokens


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = update_user_profile(db, current_user, data)
    return user


@router.post("/change-password")
def change_pwd(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    change_password(db, current_user, data)
    return {"detail": "Password updated"}


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    response: Response,
    token: str,
    db: Session = Depends(get_db),
):
    new_tokens = refresh_access_token(token)
    if not new_tokens:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    response.set_cookie(
        key="refresh_token",
        value=new_tokens["refresh_token"],
        httponly=True,
        secure=settings.environment == "production",
        samesite="strict",
        max_age=settings.refresh_token_expire_days * 86400,
    )
    return new_tokens


@router.post("/logout")
def logout(response: Response, refresh_token: str):
    logout_user(refresh_token)
    response.delete_cookie(key="refresh_token")
    return {"detail": "Logged out"}


# Placeholder for OAuth
@router.get("/google/url")
def google_oauth_url():
    return {"url": "https://accounts.google.com/o/oauth2/v2/auth?... (not implemented)"}
