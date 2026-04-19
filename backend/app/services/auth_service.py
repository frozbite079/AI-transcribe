"""
Auth service: register, login, token refresh, logout.
Orchestrates repositories + utilities.
"""

from app.database import SessionLocal
from app.models.user import User
from app.repositories import (
    get_user_by_email,
    create_user,
    update_user,
    verify_user_email,
)
from app.utils import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    blacklist_token,
    is_token_blacklisted,
)
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserUpdate,
    ChangePasswordRequest,
)
from typing import Optional


def register_user(db: SessionLocal, data: RegisterRequest) -> User:
    existing = get_user_by_email(db, data.email)
    if existing:
        raise ValueError("Email already registered")
    user = create_user(
        db,
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
        mobile=data.mobile,
        company=data.company,
        language=data.language,
    )
    return user


def authenticate_user(db: SessionLocal, data: LoginRequest) -> Optional[User]:
    user = get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.password_hash):
        return None
    return user


def generate_tokens(user_id: str) -> dict:
    access = create_access_token(subject=user_id)
    refresh = create_refresh_token(subject=user_id)
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "expires_in": 15 * 60,  # seconds
    }


def refresh_access_token(refresh_token: str) -> Optional[dict]:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        return None
    if is_token_blacklisted(refresh_token):
        return None
    user_id = payload["sub"]
    return {
        "access_token": create_access_token(subject=user_id),
        "token_type": "bearer",
        "expires_in": 15 * 60,
    }


def logout_user(refresh_token: str) -> None:
    blacklist_token(refresh_token)


def update_user_profile(db: SessionLocal, user: User, data: UserUpdate) -> User:
    return update_user(db, user, **data.dict(exclude_unset=True))


def change_password(db: SessionLocal, user: User, data: ChangePasswordRequest) -> None:
    if not verify_password(data.old_password, user.password_hash):
        raise ValueError("Incorrect old password")
    user.password_hash = hash_password(data.new_password)
    db.commit()
    db.refresh(user)
