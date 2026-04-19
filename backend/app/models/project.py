"""
Project model for SQLAlchemy.
Represents an audio transcription project.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import (
    String,
    Integer,
    Float,
    DateTime,
    Text,
    JSON,
    ForeignKey,
    CheckConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.usage_log import UsageLog


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    audio_file_url: Mapped[str] = mapped_column(Text, nullable=False)
    audio_duration: Mapped[float] = mapped_column(Float, nullable=False)  # seconds
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    language_detected: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    transcript_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    segments: Mapped[Optional[list]] = mapped_column(
        JSONB, nullable=True, server_default="[]"
    )
    tokens_used: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    ai_model_used: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
        onupdate=text("now()"),
    )

    # Relationships - use string references to avoid circular imports
    user: Mapped["User"] = relationship("User", back_populates="projects")
    usage_logs: Mapped[list["UsageLog"]] = relationship(
        "UsageLog", back_populates="project", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Project(id={self.id}, name='{self.name}', user_id={self.user_id})>"
