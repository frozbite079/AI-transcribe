"""
Usage and analytics schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
import uuid


class UsageLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    action: str
    tokens_consumed: int
    ai_model: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UsageSummary(BaseModel):
    total_tokens: int
    total_projects: int
    total_duration: float  # seconds
    by_plan: dict
    daily_usage: List[dict]  # [{date, tokens}]


class UsageFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    project_id: Optional[uuid.UUID] = None
    limit: int = Field(100, le=1000)
    offset: int = Field(0, ge=0)
