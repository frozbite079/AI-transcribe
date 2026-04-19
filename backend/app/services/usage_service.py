"""
Usage service: aggregate usage data, summaries, reports.
"""

from datetime import datetime, timedelta, date
from app.database import SessionLocal
from sqlalchemy.orm import Session
from app.repositories import (
    sum_tokens_by_user,
    count_projects,
    sum_audio_duration,
    get_usage_logs_by_user,
)
from app.models.usage_log import UsageLog
from typing import List, Optional
import uuid


def get_user_usage_summary(
    db: Session, user_id: uuid.UUID, *, start_date=None, end_date=None
) -> dict:
    total_tokens = sum_tokens_by_user(db, user_id, start_date, end_date)
    total_projects = count_projects(db, user_id)
    total_duration = sum_audio_duration(db, user_id)
    return {
        "total_tokens": total_tokens,
        "total_projects": total_projects,
        "total_duration_seconds": total_duration,
    }
