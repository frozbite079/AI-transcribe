"""
Usage router: user usage summaries and logs.
Endpoints:
- GET /api/v1/usage/summary -> total tokens, projects, duration
- GET /api/v1/usage/logs    -> paginated usage logs
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services import get_user_usage_summary
from app.repositories import get_usage_logs_by_user
from app.schemas.usage import UsageLogResponse, UsageFilter
from app.dependencies import get_current_user
from typing import Optional
from datetime import date
import uuid

router = APIRouter()


@router.get("/summary")
def usage_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    summary = get_user_usage_summary(
        db, current_user.id, start_date=start_date, end_date=end_date
    )
    return summary


@router.get("/logs", response_model=list[UsageLogResponse])
def usage_logs(
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0),
    project_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logs = get_usage_logs_by_user(
        db,
        current_user.id,
        limit=limit,
        offset=offset,
        project_id=project_id,
    )
    return logs
