# Re-export schemas for convenient imports
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    TokenRefresh,
    UserResponse,
    UserUpdate,
    ChangePasswordRequest,
)
from app.schemas.user import UserProfileResponse, UserPublicResponse
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    ProjectMini,
    SegmentItem,
)
from app.schemas.ai import TranscribeResponse, AlignResponse
from app.schemas.usage import UsageLogResponse, UsageSummary, UsageFilter

__all__ = [
    # auth
    "RegisterRequest",
    "LoginRequest",
    "TokenResponse",
    "TokenRefresh",
    "UserResponse",
    "UserUpdate",
    "ChangePasswordRequest",
    # user
    "UserProfileResponse",
    "UserPublicResponse",
    # project
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "ProjectListResponse",
    "ProjectMini",
    "SegmentItem",
    # ai
    "TranscribeResponse",
    "AlignResponse",
    # usage
    "UsageLogResponse",
    "UsageSummary",
    "UsageFilter",
]
