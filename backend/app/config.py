"""
Application configuration using Pydantic Settings.
Loads environment variables from .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings with environment variable loading."""

    # Database
    database_url: str = (
        "postgresql://childlike:k2QGj2*4f9N1@localhost:5433/ai_transcribe_db"
    )

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # CORS
    cors_origins: str = "http://localhost:3000"

    # File Storage
    upload_dir: str = "./uploads"
    max_file_size: int = 209715200  # 200MB in bytes

    # Gemini AI
    gemini_api_key: Optional[str] = None

    # Environment
    environment: str = "development"

    # Sentry (optional)
    sentry_dsn: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
