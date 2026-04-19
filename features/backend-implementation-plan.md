# AI-Transcribe: Backend Implementation Plan

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Dependencies & Setup](#dependencies--setup)
4. [Database Design](#database-design)
5. [API Endpoints](#api-endpoints)
6. [Authentication & Authorization](#authentication--authorization)
7. [File Management](#file-management)
8. [AI Service Integration](#ai-service-integration)
9. [Usage Tracking](#usage-tracking)
10. [Error Handling & Validation](#error-handling--validation)
11. [Security Measures](#security-measures)
12. [Testing Strategy](#testing-strategy)
13. [Implementation Phases](#implementation-phases)
14. [Deployment](#deployment)

---

## Architecture Overview

**Stack:**
- **Framework:** FastAPI (Python 3.12+)
- **Database:** PostgreSQL 15+
- **ORM:** SQLAlchemy 2.0+ (async optional)
- **Migrations:** Alembic
- **Auth:** JWT (python-jose) + bcrypt
- **File Storage:** Local filesystem (MVP), Cloud (R2/S3 later)
- **AI Provider:** Google Gemini API (via google-genai Python SDK or REST)
- **Validation:** Pydantic v2

**Pattern:** Clean Architecture / Repository Pattern
```
app/
├── routers/         # API endpoint definitions (FastAPI APIRouter)
├── models/          # SQLAlchemy ORM models
├── schemas/         # Pydantic request/response validation
├── services/        # Business logic (AI service, file service)
├── repositories/    # Data access layer (CRUD operations)
├── dependencies.py  # FastAPI dependencies (get_db, get_current_user)
├── config.py        # Configuration (env vars, settings)
└── utils/           # Helpers (JWT utils, password hashing, logging)
```

**Data Flow:**
```
Frontend Request → FastAPI Router → Service Layer → Repository → Database
                          ↓
                    Gemini API (external)
                          ↓
                   Response back to frontend
```

---

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app instance + CORS + middleware
│   ├── config.py                  # Settings (pydantic BaseSettings)
│   ├── dependencies.py            # get_db, get_current_user, limiter
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py               # User model
│   │   ├── project.py            # Project model
│   │   ├── usage_log.py          # UsageLog model
│   │   └── audit_log.py          # AuditLog model (optional)
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py               # UserCreate, UserResponse, UserUpdate
│   │   ├── project.py            # ProjectCreate, ProjectResponse, ProjectUpdate
│   │   ├── auth.py               # LoginRequest, RegisterRequest, Token
│   │   ├── ai.py                 # TranscribeRequest, AlignRequest, JobStatus
│   │   └── usage.py              # UsageSummary, UsageFilter
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py               # /api/auth/*
│   │   ├── users.py              # /api/users/*
│   │   ├── projects.py           # /api/projects/*
│   │   ├── ai.py                 # /api/ai/*
│   │   ├── usage.py              # /api/usage/*
│   │   └── admin.py              # /api/admin/*
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py       # login, register, verify_password, etc.
│   │   ├── ai_service.py         # transcribe_audio, align_transcript
│   │   ├── file_service.py       # save_file, delete_file, validate_file
│   │   └── usage_service.py      # log_usage, get_summary
│   │
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── user_repository.py
│   │   ├── project_repository.py
│   │   └── usage_repository.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── jwt.py                # create_access_token, verify_token
│       ├── password.py           # hash_password, verify_password
│       └── logger.py             # Structured logger setup
│
├── alembic/
│   ├── versions/                 # Migration files
│   └── env.py
├── alembic.ini
├── requirements.txt
├── requirements-dev.txt
├── .env.example
├── .gitignore
├── README.md                     # Backend-specific (or root README covers both)
└── tests/
    ├── __init__.py
    ├── conftest.py              # pytest fixtures
    ├── test_auth.py
    ├── test_projects.py
    ├── test_ai.py
    ├── test_admin.py
    └── test_utils.py
```

---

## Dependencies & Setup

### requirements.txt

```txt
fastapi==0.115.6
uvicorn[standard]==0.32.1
sqlalchemy==2.0.36
alembic==1.14.0
psycopg2-binary==2.9.10  # or asyncpg for async
pydantic==2.10.4
pydantic[email]==2.10.4
python-jose[cryptography]==3.3.0
bcrypt==4.2.1
python-multipart==0.0.20  # for file uploads
google-genai==1.29.0      # Gemini API SDK (Python)
slowapi==0.1.9            # rate limiting
redis==5.2.1             # optional: for rate limiting storage, caching
python-json-logger==2.0.7
```

### requirements-dev.txt

```txt
pytest==8.3.4
pytest-asyncio==0.24.0
pytest-cov==6.0.0
pytest-mock==3.14.0
httpx==0.28.1
faker==33.1.0
black==24.10.0
flake8==7.1.1
mypy==1.14.1
pre-commit==4.0.1
```

### Setup Steps

```bash
# 1. Create virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 3. Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql postgresql-contrib
# Windows: download installer

# 4. Create database
createdb ai_transcribe_db  # or: psql -c "CREATE DATABASE ai_transcribe_db;"

# 5. Configure environment
cp .env.example .env
# Edit .env with your values:

# 6. Run migrations
alembic upgrade head

# 7. Start dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 8. Visit API docs
# http://localhost:8000/docs
# http://localhost:8000/redoc
```

---

## Database Design

### Schema

#### users table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    company VARCHAR(255),
    language VARCHAR(50) DEFAULT 'English (US)',
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro', 'enterprise')),
    plan_expires_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'deactivated', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan ON users(plan);
```

#### projects table
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    audio_file_url TEXT NOT NULL,
    audio_duration FLOAT NOT NULL,  -- seconds
    file_size_bytes BIGINT,
    language_detected VARCHAR(50),
    transcript_text TEXT,
    segments JSONB,  -- array of {id, start, end, text}
    tokens_used INTEGER DEFAULT 0,
    ai_model_used VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_progments_language ON projects(language_detected);
```

#### usage_logs table
```sql
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('transcribe', 'align', 'export_video', 'export_srt')),
    tokens_consumed INTEGER NOT NULL,
    ai_model VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_timestamp ON usage_logs(created_at DESC);
CREATE INDEX idx_usage_logs_project_id ON usage_logs(project_id);
```

#### audit_logs table (optional but recommended)
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### Alembic Migration (Initial)

```python
# alembic/versions/001_initial_schema.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table('users',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('mobile', sa.String(20)),
        sa.Column('company', sa.String(255)),
        sa.Column('language', sa.String(50), nullable=False, server_default='English (US)'),
        sa.Column('avatar_url', sa.Text),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('two_factor_enabled', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('two_factor_secret', sa.String(255)),
        sa.Column('plan', sa.String(50), nullable=False, server_default='free'),
        sa.Column('plan_expires_at', sa.TIMESTAMP(timezone=True)),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_plan', 'users', ['plan'])

    op.create_table('projects',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('audio_file_url', sa.Text(), nullable=False),
        sa.Column('audio_duration', sa.Float(), nullable=False),
        sa.Column('file_size_bytes', sa.BigInteger()),
        sa.Column('language_detected', sa.String(50)),
        sa.Column('transcript_text', sa.Text()),
        sa.Column('segments', sa.JSON(), default=sa.text("'[]'::jsonb")),
        sa.Column('tokens_used', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('ai_model_used', sa.String(50)),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_foreign_key('fk_projects_user', 'projects', 'users', ['user_id'], ['id'], ondelete='CASCADE')
    op.create_index('idx_projects_user_id', 'projects', ['user_id'])
    op.create_index('idx_projects_created_at', 'projects', ['created_at'], descending=True)

    op.create_table('usage_logs',
        sa.Column('id', sa.UUID(), nullable=False, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('project_id', sa.UUID()),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('tokens_consumed', sa.Integer(), nullable=False),
        sa.Column('ai_model', sa.String(50)),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_foreign_key('fk_usage_logs_user', 'usage_logs', 'users', ['user_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_usage_logs_project', 'usage_logs', 'projects', ['project_id'], ['id'], ondelete='SET NULL')
    op.create_index('idx_usage_logs_user_id', 'usage_logs', ['user_id'])
    op.create_index('idx_usage_logs_timestamp', 'usage_logs', ['created_at'], descending=True)

def downgrade():
    op.drop_table('usage_logs')
    op.drop_table('projects')
    op.drop_table('users')
```

---

## API Endpoints

### Base URL Pattern: `/api/v1/...` (versioned)

### 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login with email/password | No |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/me` | Update own profile | Yes |
| POST | `/change-password` | Change password | Yes |
| POST | `/refresh` | Refresh JWT token | Yes (refresh) |
| POST | `/logout` | Logout (blacklist token) | Yes |
| GET | `/google/url` | Get Google OAuth URL | No |
| GET | `/google/callback` | OAuth callback handler | No |

**Example: `POST /api/v1/auth/register`**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "mobile": "+91 9876543210"
}

Response (201):
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "plan": "free",
  "status": "active",
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

### 2. Users (`/api/v1/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/me` | Get current user | Yes |
| PUT | `/me` | Update profile | Yes |
| POST | `/me/avatar` | Upload avatar image | Yes |
| DELETE | `/me` | Delete account (soft delete) | Yes |

### 3. Projects (`/api/v1/projects`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create project + upload audio | Yes |
| GET | `/` | List my projects (pagination) | Yes |
| GET | `/{id}` | Get single project details | Yes (owner/admin) |
| PUT | `/{id}` | Update project (segments, transcript) | Yes (owner/admin) |
| DELETE | `/{id}` | Delete project + file | Yes (owner/admin) |
| GET | `/{id}/audio` | Download audio file | Yes (owner/admin) |
| GET | `/{id}/export/srt` | Export SRT file | Yes (owner/admin) |
| POST | `/{id}/export/video` | Start video export job | Yes (owner/admin) |
| GET | `/{id}/status` | Get project processing status | Yes (owner/admin) |

**Query params for list:** `?limit=20&offset=0`

**Example: `POST /api/v1/projects`**
```http
Content-Type: multipart/form-data

{
  "file": <audio file>,
  "name": "My Podcast.mp3",
  "duration": 125.5  // optional, will calculate if not provided
}

Response (201):
{
  "id": "project-uuid",
  "name": "My Podcast.mp3",
  "audio_file_url": "/uploads/user-uuid/project-uuid.mp3",
  "audio_duration": 125.5,
  "segments": [],
  "transcript_text": null,
  "created_at": "2026-04-18T...",
  "user_id": "user-uuid"
}
```

### 4. AI Transcription & Alignment (`/api/v1/ai`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/transcribe` | Start transcription job | Yes |
| POST | `/align` | Start alignment job | Yes |
| GET | `/job/{job_id}` | Get job status & result | Yes |

**Job Status Model:**
```json
{
  "job_id": "uuid",
  "status": "pending|processing|completed|failed",
  "type": "transcribe|align",
  "project_id": "uuid",
  "result": { ... },  // varies by type
  "error": "Error message if failed",
  "created_at": "2026-04-18T...",
  "completed_at": "2026-04-18T..."
}
```

**Flow:**
1. Frontend calls `POST /ai/transcribe` with `{project_id}`
2. Backend creates `Job` record (status: pending), enqueues task (or processes synchronously for MVP)
3. Frontend polls `GET /ai/job/{job_id}` every 2 seconds
4. When status = "completed", frontend reads `result.transcript` or `result.segments`

**Note:** For MVP, process synchronously (no Celery). Return 202 Accepted + job_id, but actually do work in same request. Polling still works (job already done).

### 5. Usage (`/api/v1/usage`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Current user's usage summary | Yes |
| GET | `/history` | Paginated usage logs | Yes |

**Response:**
```json
{
  "summary": {
    "this_month_tokens": 12500,
    "last_30_days_tokens": 24500,
    "project_count": 12,
    "remaining_tokens": 35500  // if plan has limit
  },
  "history": [
    {
      "id": "uuid",
      "project_name": "Podcast.mp3",
      "action": "transcribe",
      "tokens": 1200,
      "ai_model": "gemini-3-flash",
      "created_at": "2026-04-18T..."
    }
  ]
}
```

### 6. Admin (`/api/v1/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Dashboard statistics | Yes (admin) |
| GET | `/users` | List all users (filterable) | Yes (admin) |
| GET | `/users/{id}` | Get single user details | Yes (admin) |
| PUT | `/users/{id}/activate` | Activate user | Yes (admin) |
| PUT | `/users/{id}/deactivate` | Deactivate user | Yes (admin) |
| PUT | `/users/{id}/plan` | Change subscription plan | Yes (admin) |
| DELETE | `/users/{id}` | Delete user (hard) | Yes (admin) |
| GET | `/projects` | List all projects | Yes (admin) |
| DELETE | `/projects/{id}` | Force delete any project | Yes (admin) |
| GET | `/usage` | All usage logs (filterable) | Yes (admin) |

**Example: `GET /api/v1/admin/stats`**
```json
{
  "total_users": 1250,
  "active_subscribers": 450,
  "total_tokens_used": 1520000,
  "monthly_revenue": 4250.00
}
```

---

## Authentication & Authorization

### JWT Token Strategy

**Tokens:**
- **Access Token:** Short-lived (15 minutes), sent in `Authorization: Bearer <token>` header
- **Refresh Token:** Long-lived (7 days), sent in httpOnly cookie (`refresh_token`)

**Flow:**
```
1. User logs in with credentials
   → POST /api/auth/login
   → Server validates, generates access_token + refresh_token
   → Server sets httpOnly cookie: Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict
   → Server returns { access_token, user }

2. Frontend stores access_token in memory (or localStorage with XSS protection)
   → All subsequent requests include: Authorization: Bearer <access_token>

3. When access_token expires (401):
   → Frontend calls POST /api/auth/refresh with no body (cookie sent automatically)
   → Server verifies refresh_token from cookie, issues new access_token
   → Frontend updates token, retries original request

4. Logout:
   → Frontend calls POST /api/auth/logout
   → Server adds refresh_token to blacklist (in-memory set or Redis)
   → Frontend deletes access_token from storage
   → Cookie cleared by server (Set-Cookie: refresh_token=; Max-Age=0)
```

### Password Hashing

```python
from bcrypt import hashpw, gensalt, checkpw

def hash_password(password: str) -> str:
    return hashpw(password.encode('utf-8'), gensalt(rounds=12)).decode('utf-8')

def verify_password(plain_password: str, hashed: str) -> bool:
    return checkpw(plain_password.encode('utf-8'), hashed.encode('utf-8'))
```

### Role-Based Access Control (RBAC)

**User Roles (in `users.plan` field):**
- `free` — limited features, low token quota
- `basic` — core features, higher quota
- `pro` — all features, high quota
- `enterprise` — unlimited, admin panel access
- `admin` — special flag (could be separate column `is_admin` boolean)

**Authorization:**
```python
# dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = verify_token(token)  # raises if invalid
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.status != 'active':
        raise HTTPException(403, "User deactivated")
    return user

async def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if user.plan not in ('enterprise', 'admin'):
        raise HTTPException(403, "Admin access required")
    return user
```

**Usage in router:**
```python
@router.get("/me")
async def read_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/admin/stats")
async def admin_stats(admin: User = Depends(get_current_admin)):
    # only admins can reach here
    ...
```

---

## File Management

### Storage Strategy (MVP: Local, Later: Cloud)

**Local Storage:**
```
backend/
└── uploads/
    └── {user_id}/
        ├── {project_id}.mp3
        ├── {project_id}.wav
        └── ...
```

**Configuration:**
```python
# config.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
MAX_FILE_SIZE = 200 * 1024 * 1024  # 200MB
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg"}
ALLOWED_MIME_TYPES = {"audio/mpeg", "audio/wav", "audio/mp4", "audio/ogg"}
```

**File Service:**

```python
# services/file_service.py
import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.config import UPLOAD_DIR, MAX_FILE_SIZE, ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES

class FileService:
    @staticmethod
    async def save_file(user_id: str, file: UploadFile) -> dict:
        """Save uploaded file to user's upload directory"""
        # Validate size
        if file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(413, "File too large (max 200MB)")

        # Validate extension & MIME
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(400, f"Unsupported file type: {ext}")

        # Generate UUID filename
        file_id = str(uuid.uuid4())
        user_dir = UPLOAD_DIR / user_id
        user_dir.mkdir(parents=True, exist_ok=True)
        file_path = user_dir / f"{file_id}{ext}"

        # Write file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        # Return metadata
        return {
            "file_id": file_id,
            "file_path": str(file_path.relative_to(BASE_DIR)),
            "original_name": file.filename,
            "size": len(content),
            "mime_type": file.content_type
        }

    @staticmethod
    def delete_file(relative_path: str):
        """Delete file from disk"""
        full_path = BASE_DIR / relative_path
        if full_path.exists():
            full_path.unlink()

    @staticmethod
    def get_file_url(project_id: str, user_id: str) -> str:
        """Generate download URL (for now, serve via API)"""
        return f"/api/v1/projects/{project_id}/audio"
```

**File Download Endpoint:**
```python
@router.get("/{project_id}/audio")
async def download_audio(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(404, "Project not found")

    file_path = BASE_DIR / project.audio_file_url
    if not file_path.exists():
        raise HTTPException(404, "File not found on disk")

    return FileResponse(
        path=file_path,
        filename=project.name,
        media_type="audio/mpeg"
    )
```

**Cloud Migration (Future):**
- Replace `FileService.save_file()` with upload to S3/R2 using boto3
- Generate presigned URLs for direct upload/download
- Delete from cloud storage instead of local

---

## AI Service Integration

### Gemini API Configuration

```python
# services/ai_service.py
import os
import json
import base64
from google import genai
from google.genai import types
from app.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)

class AIService:
    MODEL_TRANSCRIBE = "gemini-2.0-flash-exp"  # or latest
    MODEL_ALIGN = "gemini-2.0-flash-exp"

    @staticmethod
    async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.mp3") -> dict:
        """Transcribe audio to text with language detection"""
        # Encode to base64
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')

        prompt = """
        Analyze this audio file.
        1. Detect the language. If Hindi+English mix, call it "Hinglish".
        2. Provide full, accurate transcript.
        3. Use "Hinglish" formatting: Hindi in Devanagari, English in Latin.
        4. Capture speaking style, pauses, emphasis in formatting.

        Return JSON:
        {
          "language": "Hinglish|Hindi|English|...",
          "transcript": "Full transcribed text here..."
        }
        """

        try:
            response = client.models.generate_content(
                model=AIService.MODEL_TRANSCRIBE,
                contents=[
                    types.Part.from_text(text=prompt),
                    types.Part.from_bytes(
                        data=audio_b64,
                        mime_type="audio/mpeg"
                    )
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            result = json.loads(response.text)
            return {
                "language": result.get("language", "Unknown"),
                "transcript": result.get("transcript", "")
            }
        except Exception as e:
            # Log error, retry, or raise HTTPException
            raise

    @staticmethod
    async def align_transcript(audio_bytes: bytes, transcript: str) -> list:
        """Align transcript text to audio timestamps (forced alignment)"""
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')

        prompt = f"""
        I have an audio file and its transcript.
        TRANSCRIPT: "{transcript}"

        CRITICAL TASK: PERFORM PRECISION FORCED ALIGNMENT
        1. Analyze audio second-by-second.
        2. Match every word to exact timestamp.
        3. Group into natural caption segments (3-6 words each).
        4. Provide EXACT start/end times for each segment (millisecond precision).
        5. NO overlapping segments.
        6. Maintain original Hinglish script (Hindi in Devanagari, English in Latin).
        7. Every word MUST be included.

        Return JSON:
        {{
          "segments": [
            {{"start": 1.45, "end": 3.21, "text": "Hello world"}},
            ...
          ]
        }}
        """

        try:
            response = client.models.generate_content(
                model=AIService.MODEL_ALIGN,
                contents=[
                    types.Part.from_text(text=prompt),
                    types.Part.from_bytes(
                        data=audio_b64,
                        mime_type="audio/mpeg"
                    )
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            result = json.loads(response.text)
            return result.get("segments", [])
        except Exception as e:
            raise
```

### Job Tracking (Sync for MVP)

For MVP, AI calls are **synchronous** (frontend waits). But we still want polling to show progress.

```python
# services/job_service.py
from enum import Enum
from datetime import datetime
from uuid import uuid4

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class JobService:
    # In-memory job store for MVP (dict[job_id -> job_data])
    # In production: use database table `jobs` or Redis
    jobs = {}

    @staticmethod
    def create_job(job_type: str, project_id: str) -> str:
        job_id = str(uuid4())
        JobService.jobs[job_id] = {
            "job_id": job_id,
            "type": job_type,
            "project_id": project_id,
            "status": JobStatus.PENDING,
            "created_at": datetime.utcnow(),
            "completed_at": None,
            "result": None,
            "error": None
        }
        return job_id

    @staticmethod
    def update_job(job_id: str, status: JobStatus, result=None, error=None):
        if job_id in JobService.jobs:
            JobService.jobs[job_id]["status"] = status
            JobService.jobs[job_id]["updated_at"] = datetime.utcnow()
            if result:
                JobService.jobs[job_id]["result"] = result
            if error:
                JobService.jobs[job_id]["error"] = error
            if status == JobStatus.COMPLETED:
                JobService.jobs[job_id]["completed_at"] = datetime.utcnow()

    @staticmethod
    def get_job(job_id: str) -> dict:
        return JobService.jobs.get(job_id)
```

**API Endpoint using JobService:**

```python
@router.post("/ai/transcribe")
async def start_transcription(
    project_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(404, "Project not found")

    # 2. Create job record
    job_id = JobService.create_job("transcribe", project_id)

    # 3. For MVP, do work synchronously (not ideal UX but simpler)
    #    Later: enqueue Celery task
    try:
        # Read audio file from disk
        audio_path = BASE_DIR / project.audio_file_url
        with open(audio_path, "rb") as f:
            audio_bytes = f.read()

        # Call AI
        result = await AIService.transcribe_audio(audio_bytes, project.name)

        # Update project
        project.transcript_text = result["transcript"]
        project.language_detected = result["language"]
        db.commit()

        # Update job
        JobService.update_job(job_id, JobStatus.COMPLETED, result={"transcript": result["transcript"]})

        return {"job_id": job_id, "status": "completed", "result": result}
    except Exception as e:
        JobService.update_job(job_id, JobStatus.FAILED, error=str(e))
        raise HTTPException(500, f"Transcription failed: {str(e)}")

@router.get("/ai/job/{job_id}")
async def get_job_status(job_id: str, current_user: User = Depends(get_current_user)):
    job = JobService.get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return job
```

---

## Usage Tracking

### Usage Log Model

```python
# models/usage_log.py
from sqlalchemy import Column, String, UUID, Integer, DateTime, ForeignKey, text as sql_text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(PGUUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(PGUUID, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    project_id = Column(PGUUID, ForeignKey('projects.id', ondelete='SET NULL'))
    action = Column(String(50), nullable=False)  # 'transcribe', 'align', 'export_video'
    tokens_consumed = Column(Integer, nullable=False)
    ai_model = Column(String(50))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=sql_text('NOW()'))

    # Relationships (optional)
    user = relationship("User")
    project = relationship("Project")
```

### Usage Service

```python
# services/usage_service.py
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.usage_log import UsageLog
from app.models.project import Project

class UsageService:
    @staticmethod
    def log_usage(
        db: Session,
        user_id: str,
        action: str,
        tokens: int,
        ai_model: str,
        project_id: str = None
    ):
        """Log an AI usage event"""
        log = UsageLog(
            user_id=user_id,
            project_id=project_id,
            action=action,
            tokens_consumed=tokens,
            ai_model=ai_model
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def get_monthly_summary(db: Session, user_id: str, days: int = 30) -> dict:
        """Get token usage summary for last N days"""
        since = datetime.utcnow() - timedelta(days=days)

        total_tokens = db.query(
            sa.func.sum(UsageLog.tokens_consumed)
        ).filter(
            UsageLog.user_id == user_id,
            UsageLog.created_at >= since
        ).scalar() or 0

        project_count = db.query(
            sa.func.count(Project.id)
        ).filter(
            Project.user_id == user_id,
            Project.created_at >= since
        ).scalar() or 0

        by_action = db.query(
            UsageLog.action,
            sa.func.sum(UsageLog.tokens_consumed).label('total')
        ).filter(
            UsageLog.user_id == user_id,
            UsageLog.created_at >= since
        ).group_by(UsageLog.action).all()

        return {
            "total_tokens": total_tokens,
            "project_count": project_count,
            "by_action": {a: t for a, t in by_action}
        }
```

**Integrate with AI service:**

```python
# In ai_service.py, after successful Gemini call:
tokens_used = estimate_tokens_from_response(response)  # or parse from API response
UsageService.log_usage(
    db=db_session,
    user_id=current_user.id,
    project_id=project_id,
    action="transcribe",
    tokens=tokens_used,
    ai_model=model_name
)
```

---

## Error Handling & Validation

### HTTP Exceptions

```python
from fastapi import HTTPException, status

# Common exceptions:
HTTPException(400, "Bad request")  # validation
HTTPException(401, "Unauthorized")  # not authenticated
HTTPException(403, "Forbidden")  # authenticated but no permission
HTTPException(404, "Not found")
HTTPException(413, "File too large")
HTTPException(429, "Rate limit exceeded")
HTTPException(500, "Internal server error")
```

### Pydantic Validation

```python
# schemas/auth.py
from pydantic import BaseModel, EmailStr, validator
from typing import Optional

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    mobile: Optional[str] = None

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain a digit')
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"  # reference to User schema
```

### Global Exception Handler

```python
# app/main.py
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # Log error
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

---

## Security Measures

### Rate Limiting

```python
# dependencies.py
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException

limiter = Limiter(key_func=get_remote_address)

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    raise HTTPException(429, "Too many requests")

# In routers:
@router.post("/register")
@limiter.limit("5/minute")  # 5 attempts per minute per IP
async def register(...):
    ...
```

### Input Sanitization

- Validate all inputs with Pydantic (automatic)
- File uploads: validate MIME + file extension + magic bytes (use `python-magic`)
- SQL queries: always use parameterized queries (SQLAlchemy does this automatically)
- No `eval()`, `exec()`, or arbitrary code execution

### Headers & CORS

```python
# app/main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # never use "*" in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Optional: allow only specific hosts
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["yourdomain.com", "*.yourdomain.com"]
)
```

### Secure File Uploads

```python
# services/file_service.py (continued)
import magic  # python-magic library

def validate_file_content(file_bytes: bytes, expected_mime: str) -> bool:
    """Verify actual file content, not just extension"""
    mime = magic.from_buffer(file_bytes, mime=True)
    return mime == expected_mime
```

---

## Testing Strategy

### Unit Tests (pytest)

```python
# tests/test_auth.py
def test_hash_password():
    password = "SecurePass123!"
    hashed = hash_password(password)
    assert verify_password(password, hashed) is True
    assert verify_password("wrong", hashed) is False

def test_jwt_token():
    data = {"sub": "user-id-123"}
    token = create_access_token(data)
    payload = verify_token(token)
    assert payload["sub"] == "user-id-123"
```

### Integration Tests (TestClient)

```python
# tests/test_projects.py
def test_create_project(client: TestClient, test_user):
    # Login to get token
    res = client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": "testpass123"
    })
    token = res.json()["access_token"]

    # Create project with file
    with open("tests/fixtures/sample.mp3", "rb") as f:
        response = client.post(
            "/api/v1/projects",
            files={"file": ("sample.mp3", f, "audio/mpeg")},
            headers={"Authorization": f"Bearer {token}"}
        )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["name"] == "sample.mp3"
```

### Mocking External APIs

```python
# tests/conftest.py
from unittest.mock import patch, MagicMock
import pytest

@pytest.fixture
def mock_gemini():
    with patch("app.services.ai_service.client.models.generate_content") as mock:
        mock.return_value = MagicMock(
            text='{"language": "English", "transcript": "Hello world test"}'
        )
        yield mock
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1, 25 SP)
- [x] Backend project setup (folder structure, config, requirements)
- [x] Database schema + initial migration
- [x] SQLAlchemy models + Pydantic schemas
- [ ] Auth endpoints (register, login, me, logout)
- [ ] JWT token system
- [ ] Password hashing + validation
- [ ] Rate limiting
- [ ] Basic logging

**Deliverable:** Working auth system; user can register/login

### Phase 2: Core CRUD (Week 2, 13 SP)
- [ ] File upload endpoint (local storage)
- [ ] Project CRUD endpoints
- [ ] Project ownership enforcement (user can only access own projects)
- [ ] Frontend dashboard connects to API
- [ ] Profile settings integration

**Deliverable:** User can create project, upload audio, see in dashboard

### Phase 3: AI Integration (Week 3, 5 SP)
- [ ] Gemini AI transcription endpoint (synchronous)
- [ ] Gemini AI alignment endpoint
- [ ] Job status polling
- [ ] Connect frontend "Transcribe" and "Smart AI Sync"
- [ ] Display transcript + segments

**Deliverable:** Full transcription + alignment flow works end-to-end

### Phase 4: Polish & Monitoring (Week 4, 12 SP)
- [ ] Usage tracking + token logging
- [ ] Admin stats endpoint
- [ ] Admin user list + management
- [ ] Auto-save draft (frontend + backend)
- [ ] Error boundaries + toast notifications (frontend)
- [ ] Logging middleware
- [ ] Sentry error tracking
- [ ] Health check endpoint
- [ ] Security headers

**Deliverable:** MVP feature-complete, ready for internal testing

### Phase 5: Testing & Security (Week 5, 10 SP)
- [ ] Unit tests (backend): auth, services, repositories
- [ ] Integration tests (API endpoints)
- [ ] Frontend testing (jest/vitest)
- [ ] Security hardening:
  - [ ] Rate limits tuned
  - [ ] File validation (magic bytes)
  - [ ] Account lockout after 5 failures
  - [ ] Password reset flow (token-based, email placeholder)
- [ ] Load testing (basic)

**Deliverable:** Test suite >70% coverage, security complete

### Phase 6: Documentation & Deployment (Week 6, 5 SP)
- [ ] Comprehensive README
- [ ] API documentation (Swagger UI with examples)
- [ ] Deploy to staging (Railway/Render)
- [ ] Test production deployment
- [ ] Deploy frontend to Vercel
- [ ] End-to-end QA in production
- [ ] Fix bugs

**Deliverable:** Production-deployed, beta-ready

---

## Deployment Configuration

### Environment Variables

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_transcribe_db
GEMINI_API_KEY=your-gemini-key-here
SECRET_KEY=32-random-hex-chars-minimum
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=209715200  # 200MB in bytes
SENTRY_DSN=  # optional
ENVIRONMENT=development  # or production
```

### Production Deployment (Railway)

1. Create `railway.json` (optional):
```json
{
  "plugins": [
    {
      "plugin": "postgresql"
    }
  ]
}
```

2. Connect GitHub repo to Railway
3. Add PostgreSQL service
4. Set environment variables in Railway dashboard
5. Set build command: `pip install -r requirements.txt && alembic upgrade head`
6. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add health check: `/health`
8. Deploy!

### Post-Deploy Checklist

- [ ] Run migrations: `alembic upgrade head`
- [ ] Create admin user via Django shell or script:
  ```python
  from app.services.auth_service import hash_password
  from app.models.user import User
  from app.database import SessionLocal

  db = SessionLocal()
  admin = User(
      email="admin@example.com",
      password_hash=hash_password("securepassword"),
      name="Admin",
      plan="enterprise",
      is_verified=True
  )
  db.add(admin)
  db.commit()
  ```
- [ ] Test `/health` endpoint
- [ ] Test `/api/v1/auth/register` with curl
- [ ] Test full flow: signup → upload → transcribe → align → export
- [ ] Set up monitoring (UptimeRobot ping `/health`)
- [ ] Set up Sentry (if using)

---

## Monitoring & Observability

### Structured Logging

```python
# utils/logger.py
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger("ai-transcribe")
handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter(
    '%(asctime)s %(name)s %(levelname)s %(message)s'
)
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

**Log format:**
```json
{
  "timestamp": "2026-04-18T12:34:56Z",
  "level": "INFO",
  "name": "ai-transcribe",
  "message": "User logged in",
  "user_id": "uuid",
  "endpoint": "/api/v1/auth/login",
  "duration_ms": 45
}
```

### Metrics to Track

- Request count per endpoint
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Gemini API latency
- Token consumption per user
- Concurrent uploads
- Disk usage (uploads folder size)
- Database connection pool usage

---

## Future Enhancements (Post-MVP)

### Async Task Queue (Celery + Redis)
- Offload transcription/alignment to background workers
- Return immediate job_id, process in background
- Real-time progress updates via WebSocket or polling
- Result notification (email or frontend push)

### Cloud Storage
- Replace local filesystem with S3/R2
- Presigned URLs for direct client upload (no backend proxy)
- CDN for serving files (Cloudflare)

### Caching
- Redis cache for:
  - User profile (reduce DB queries)
  - Project details (read-heavy)
  - Usage summaries

### API Versioning
- Current: `/api/v1/`
- Future: migrate to `/api/v2/` with breaking changes
- Keep v1 stable while developing v2

### WebSockets
- Real-time transcription progress
- Real-time updates when project modified by another user (collaboration)
- Notification system

---

## Troubleshooting

### Common Issues

**1. "Database connection refused"**
```bash
# Check PostgreSQL is running
pg_isready
# Start it
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux
```

**2. "ModuleNotFoundError: No module named 'app'"**
```bash
# Ensure PYTHONPATH includes backend/
export PYTHONPATH=/path/to/backend:$PYTHONPATH
# Or run from backend/ directory: uvicorn app.main:app
```

**3. "Authentication failed" JWT errors**
```bash
# Ensure SECRET_KEY is set and consistent
# If changed, all existing tokens invalidate
```

**4. File upload not working**
```bash
# Check uploads/ directory exists and is writable
mkdir -p backend/uploads
chmod 755 backend/uploads
```

---

## Next Steps

1. **Create backend directory structure** (copy from Section above)
2. **Write `requirements.txt`**
3. **Set up PostgreSQL** (install + create DB)
4. **Write `.env.example`**
5. **Implement `config.py`** (pydantic settings)
6. **Create `models/` + `schemas/`** (User, Project, UsageLog)
7. **Run initial migration** (`alembic revision --autogenerate` + `upgrade head`)
8. **Implement auth endpoints** (`routers/auth.py`)
9. **Test with Postman/curl**
10. **Connect frontend auth**

**Estimated completion:** 6-8 weeks for full MVP backend

---

**Last Updated:** 2026-04-18  
**Owner:** Backend team / Solo developer  
**Related:** See `features.md` for full task list, `Workflow.md` for data flow diagrams
