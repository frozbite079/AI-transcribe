"""
Database configuration and session management.
SQLAlchemy 2.0+ style with sync engine.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from contextlib import contextmanager
from app.config import settings

# Create synchronous engine (for sync SQLAlchemy)
engine = create_engine(
    settings.database_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Check connection before using
    echo=settings.environment == "development",  # Log SQL in dev
)

# SessionLocal factory (for dependency injection)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db() -> Session:
    """
    FastAPI dependency that provides a database session.
    Used as: Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """
    Context manager for non-FastAPI code (scripts, tests).
    Usage: with get_db_context() as db: ...
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
