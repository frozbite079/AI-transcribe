"""
Repository layer: CRUD operations for each model.
Thin wrappers around SQLAlchemy sessions.
"""

from app.models.user import User
from app.models.project import Project
from app.models.usage_log import UsageLog
from app.database import SessionLocal
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

# ---------- User Repository ----------


def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, **kwargs) -> User:
    user = User(**kwargs)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, **kwargs) -> User:
    for key, value in kwargs.items():
        if value is not None:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def verify_user_email(db: Session, user: User) -> User:
    user.is_verified = True
    db.commit()
    db.refresh(user)
    return user


# ---------- Project Repository ----------


def get_project_by_id(db: Session, project_id: uuid.UUID) -> Optional[Project]:
    return db.query(Project).filter(Project.id == project_id).first()


def get_projects_by_user(
    db: Session, user_id: uuid.UUID, limit: int = 20, offset: int = 0
) -> List[Project]:
    return (
        db.query(Project)
        .filter(Project.user_id == user_id)
        .order_by(Project.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )


def count_projects_by_user(db: Session, user_id: uuid.UUID) -> int:
    return db.query(Project).filter(Project.user_id == user_id).count()


def create_project(db: Session, **kwargs) -> Project:
    project = Project(**kwargs)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project: Project, **kwargs) -> Project:
    for key, value in kwargs.items():
        if value is not None:
            setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: Project) -> None:
    db.delete(project)
    db.commit()


# ---------- UsageLog Repository ----------


def create_usage_log(db: Session, **kwargs) -> UsageLog:
    log = UsageLog(**kwargs)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_usage_logs_by_user(
    db: Session,
    user_id: uuid.UUID,
    limit: int = 100,
    offset: int = 0,
    project_id: Optional[uuid.UUID] = None,
) -> List[UsageLog]:
    query = db.query(UsageLog).filter(UsageLog.user_id == user_id)
    if project_id:
        query = query.filter(UsageLog.project_id == project_id)
    return query.order_by(UsageLog.created_at.desc()).limit(limit).offset(offset).all()


def sum_tokens_by_user(
    db: Session, user_id: uuid.UUID, start_date=None, end_date=None
) -> int:
    from sqlalchemy import func

    query = db.query(func.sum(UsageLog.tokens_consumed)).filter(
        UsageLog.user_id == user_id
    )
    if start_date:
        query = query.filter(UsageLog.created_at >= start_date)
    if end_date:
        query = query.filter(UsageLog.created_at <= end_date)
    result = query.scalar()
    return result or 0


def count_projects(db: Session, user_id: uuid.UUID) -> int:
    return db.query(Project).filter(Project.user_id == user_id).count()


def sum_audio_duration(db: Session, user_id: uuid.UUID) -> float:
    from sqlalchemy import func

    result = (
        db.query(func.sum(Project.audio_duration))
        .filter(Project.user_id == user_id)
        .scalar()
    )
    return result or 0.0
