"""
UsageLog model for SQLAlchemy.
Tracks AI usage per user per project.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.project import Project


class UsageLog(Base):
    __tablename__ = "usage_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # 'transcribe', 'align', 'export_video', 'export_srt'
    tokens_consumed: Mapped[int] = mapped_column(Integer, nullable=False)
    ai_model: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    # Relationships - string references
    user: Mapped["User"] = relationship("User", back_populates="usage_logs")
    project: Mapped[Optional["Project"]] = relationship("Project", back_populates="usage_logs")

    def __repr__(self):
        return f"<UsageLog(id={self.id}, action='{self.action}', tokens={self.tokens_consumed})>"
