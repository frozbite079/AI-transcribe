# 🏗️ AI Transcribe - Technology Stack

## 📦 **Full Stack Architecture**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                             │
│                   (React + TypeScript + Vite)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  UI Components   │   State    │     API Calls     │   Styling          │
│  ────────────────┼────────────┼───────────────────┼─────────────────── │
│  • AuthPage      │  Contexts │  services/        │  Tailwind CSS v4   │
│  • UserDashboard │  AuthCtx  │  ├─ auth.ts       │  (utility-first)   │
│  • MainApp       │  ProjCtx  │  └─ projects.ts   │  Motion (anim)     │
│  • VideoStudio   │  localStorage │ Axios (HTTP) │  Lucide Icons      │
│                  │           │                   │  Custom fonts      │
├─────────────────────────────────────────────────────────────────────────┤
│                     ROUTING & STATE MANAGEMENT                         │
│  React Router DOM (routes,OutletContext)                               │
│  WaveSurfer.js (audio visualization)                                    │
└─────────────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS (development)
┌─────────────────────────────────────────────────────────────────────────┐
│                             BACKEND LAYER                               │
│                      (FastAPI + Python 3.12)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  API Layer       │  Service Layer   │  Repository  │   ORM (SQLAlchemy)│
│  ────────────────┼──────────────────┼──────────────┼─────────────────── │
│  routers/        │  services/       │  repositories│  models/          │
│  ├─ auth.py      │  ├─ auth_        │  __init__.py │  ├─ user.py       │
│  ├─ projects.py  │  ├─ file_        │  (CRUD func) │  ├─ project.py    │
│  ├─ ai.py        │  ├─ ai_          │              │  └─ usage_log.py  │
│  └─ usage.py     │  ├─ usage_       │              │                  │
│                  │  └─ __init__.py  │              │                  │
├─────────────────────────────────────────────────────────────────────────┤
│  FastAPI Dependencies (depends: get_current_user, get_db)              │
│  Pydantic (validation/serialization)                                   │
│  Passlib (password hashing)                                            │
│  Python-Jose (JWT tokens)                                              │
│  Alembic (database migrations)                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              ↕ SQLAlchemy
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATABASE LAYER                               │
│                      (PostgreSQL 14+)                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Tables: users, projects, usage_logs                                    │
│  Postgres extensions: UUID, JSONB, trigger for timestamps              │
│  Relationships: 1NF (foreign keys with CASCADE/SET NULL)               │
└─────────────────────────────────────────────────────────────────────────┘
                              ↕ SQLAlchemy
┌─────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────────────┤
│  Google Gemini AI (genai SDK)                                           │
│  • Model: gemini-2.0-flash-exp (transcription + alignment)             │
│  • Audio → base64 → Gemini API → JSON response                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 **Frontend Stack Details**

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | 19.0.0 | UI library |
| **Language** | TypeScript | ~5.8.2 | Type safety |
| **Build Tool** | Vite | 6.2.0 | Fast dev server + bundler |
| **Router** | React Router DOM | 7.14.1 | Client-side routing |
| **Styling** | Tailwind CSS | 4.1.14 | Utility-first CSS |
| **Icons** | Lucide React | 0.546.0 | Icon library |
| **Animations** | Motion (Framer Motion) | 12.23.24 | Page/component transitions |
| **Audio** | WaveSurfer.js | 7.12.4 | Audio waveform visualization |
| **HTTP Client** | Axios | 1.15.0 | API requests with interceptors |
| **Utils** | clsx + tailwind-merge | 2.1.1 + 3.5.0 | Class name composition |
| **State** | React Context API | built-in | Global state (user, projects) |

---

## 🐍 **Backend Stack Details**

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | FastAPI | latest | Async API framework (Auto docs, validation) |
| **Language** | Python | 3.12 | Backend language |
| **ASGI Server** | Uvicorn | latest | Production ASGI server |
| **Database** | PostgreSQL | 14+ | Primary data store |
| **ORM** | SQLAlchemy | 2.x | Database abstraction |
| **Migrations** | Alembic | latest | Schema version control |
| **Validation** | Pydantic | v2 | Data validation & serialization |
| **Auth** | python-jose | latest | JWT encoding/decoding |
| **Password** | passlib[bcrypt] | latest | Password hashing |
| **AI SDK** | google-genai | 1.29.0 | Gemini API client |
| **Env Config** | pydantic-settings | latest | .env loading |
| **Dev Tools** | ruff (optional) | - | Linting (in requirements-dev) |

---

## 🔧 **Development Tools**

| Tool | Purpose |
|------|---------|
| **Git** | Version control (GitHub: frozbite079/AI-transcribe) |
| **GitHub** | Remote repository + future CI/CD |
| **VSCode / IDE** | Code editing |
| **Postman / curl** | API testing |
| **PgAdmin / DBeaver** | Database management (optional) |
| **Python venv** | Python virtual environment |
| **npm** | Node package manager |

---

## 📦 **Key Dependencies (Backend)**

### Production (requirements.txt)
```
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy==2.0.38
psycopg[binary]==3.2.3
alembic==0.26.0
pydantic==2.10.4
pydantic-settings==2.7.1
python-jose[cryptography]==3.4.0
passlib[bcrypt]==1.7.4
google-genai==1.29.0
```

### Development (requirements-dev.txt)
```
pytest==8.3.4
pytest-asyncio==0.24.0
ruff==0.8.3
```

---

## 📦 **Key Dependencies (Frontend)**

```
"dependencies": {
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.14.1",
  "axios": "^1.15.0",
  "lucide-react": "^0.546.0",
  "motion": "^12.23.24",
  "tails-merge": "^3.5.0",
  "clsx": "^2.1.1",
  "wavesurfer.js": "^7.12.4",
  "@google/genai": "^1.29.0",
  "@tailwindcss/vite": "^4.1.14",
  "vite": "^6.2.0"
}
```

---

## 🗂️ **Directory Tree (Final Structure)**

```
AI-transcribe/
├── .gitignore
├── README.md                         # Main project README
├── PROJECT_STATUS.md                 # THIS FILE - Status & checklist
├── STACK_STRUCTURE.md               # THIS FILE - Tech stack
├── INTEGRATION_SUMMARY.md           # Detailed integration report
│
├── backend/                         # FastAPI backend
│   ├── .env.example                 # Environment template
│   ├── .env                         # Local env (gitignored)
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── alembic.ini
│   ├── setup_postgres.sh
│   ├── setup_db.sh
│   ├── test_db_connection.py
│   │
│   ├── app/                         # Main application package
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app + CORS + routers
│   │   ├── config.py                # Settings (Pydantic BaseSettings)
│   │   ├── database.py              # SQLAlchemy engine + SessionLocal
│   │   ├── dependencies.py          # FastAPI dependency functions
│   │   │
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # User model
│   │   │   ├── project.py           # Project model
│   │   │   └── usage_log.py         # UsageLog model
│   │   │
│   │   ├── schemas/                 # Pydantic models (request/response)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py              # RegisterRequest, LoginRequest, TokenResponse, UserResponse
│   │   │   ├── user.py              # UserUpdate, UserMini
│   │   │   ├── project.py           # ProjectCreate, ProjectResponse, ProjectListResponse, ProjectUpdate
│   │   │   ├── ai.py                # TranscribeResponse, AlignResponse
│   │   │   └── usage.py             # UsageLogResponse, UsageSummary
│   │   │
│   │   ├── repositories/            # Repository pattern (data access)
│   │   │   ├── __init__.py
│   │   │   ├── user_repository.py   # (optional separate file)
│   │   │   ├── project_repository.py # (optional separate file)
│   │   │   └── usage_repository.py  # (optional separate file)
│   │   │   # NOTE: Currently consolidated in __init__.py
│   │   │
│   │   ├── services/                # Business logic layer
│   │   │   ├── __init__.py          # Re-exports all services
│   │   │   ├── auth_service.py      # register_user, authenticate_user, generate_tokens, etc.
│   │   │   ├── file_service.py      # validate_audio_file, save_uploaded_file, delete_project_file
│   │   │   ├── ai_service.py        # transcribe_audio, align_transcript (Gemini)
│   │   │   └── usage_service.py     # get_user_usage_summary
│   │   │
│   │   ├── utils/                   # Helper utilities
│   │   │   └── __init__.py          # hash_password, verify_password, create_*_token, decode_token, blacklist
│   │   │
│   │   └── routers/                 # FastAPI routers (endpoints)
│   │       ├── __init__.py
│   │       ├── auth.py              # /api/v1/auth/*
│   │       ├── projects.py          # /api/v1/projects/* (+ /export/srt)
│   │       ├── ai.py                # /api/v1/ai/*
│   │       └── usage.py             # /api/v1/usage/*
│   │
│   ├── alembic/                     # Database migrations
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   ├── versions/
│   │   │   └── 2c9acda0b30f_initial_schema_users_projects_usage_logs.py
│   │   └── README
│   │
│   ├── tests/                       # Unit & integration tests
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_projects.py
│   │   └── test_ai.py
│   │
│   ├── uploads/                     # Uploaded audio files (runtime)
│   │   └── {user_id}/
│   │
│   └── venv/                        # Python virtualenv (gitignored)
│
├── frontend/                        # React frontend
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js (if present)
│   ├── package.json
│   ├── package-lock.json
│   │
│   ├── public/                      # Static public assets
│   │
│   ├── src/
│   │   ├── main.tsx                 # Entry point (createRoot)
│   │   ├── App.tsx                  # Layout + Routes + MainApp logic
│   │   ├── index.css                # Global CSS + Tailwind imports
│   │   │
│   │   ├── components/              # React components
│   │   │   ├── AuthPage.tsx         # Login/Register forms
│   │   │   ├── UserDashboard.tsx    # Project list + usage stats
│   │   │   ├── ProfileSettings.tsx  # User profile (placeholder)
│   │   │   ├── AdminDashboard.tsx   # Admin panel (placeholder)
│   │   │   ├── WaveSurferPlayer.tsx # (WaveSurfer component) - if exists
│   │   │   ├── VideoStudio.tsx      # Video caption preview & editing
│   │   │   ├── StudioPanel.tsx      # Studio controls
│   │   │   ├── CaptionList.tsx      # Caption list with timestamps
│   │   │   ├── CaptionItem.tsx      # Individual caption editing
│   │   │   ├── CaptionEditor.tsx    # Rich text editor for captions
│   │   │   └── ... (other UI components)
│   │   │
│   │   ├── contexts/                # React Context providers
│   │   │   ├── AuthContext.tsx      # { user, isLoading, login, register, logout }
│   │   │   └── ProjectContext.tsx   # { projects, currentProject, createProject, loadProjects }
│   │   │
│   │   ├── services/                # API service layer
│   │   │   ├── auth.ts              # authService.{register, login, logout, getMe, ...}
│   │   │   └── projects.ts          # projectsService.{list, get, create, update, delete, transcribe, align, getAudioUrl, downloadSrt}
│   │   │
│   │   ├── lib/                     # Shared utilities
│   │   │   ├── api.ts               # Axios instance with interceptors
│   │   │   └── utils.ts             # cn() helper (clsx+tailwind-merge)
│   │   │
│   │   ├── types/                   # TypeScript type definitions
│   │   │   └── api.ts               # User, Project, UsageLog, TokenResponse, etc.
│   │   │
│   │   ├── hooks/                   # Custom hooks (if any)
│   │   │
│   │   └── __tests__/               # Jest/Vitest tests (optional)
│   │
│   ├── .env.local                   # Vite env (VITE_API_BASE_URL)
│   └── .env.example                 # Template for .env.local (optional)
│
├── features/                        # Feature documentation (planning stage)
│   ├── Workflow.md
│   ├── features.md
│   ├── backend-implementation-plan.md
│   └── non-core-tasks.md
│
├── uploads/                         # Runtime audio uploads (gitignored)
├── server.log                       # Backend logs (gitignored)
├── .gitignore
└── README.md
```

---

## 🔌 **API Request/Response Flow Example**

```
User Clicks "Transcribe" in Frontend
        ↓
MainApp.tsx → projectsService.transcribe(projectId, model)
        ↓
Axios POST /api/v1/ai/transcribe/{id} (with JWT in Authorization header)
        ↓
FastAPI Router (ai.py) → Depends(get_current_user)
        ↓
Dependency: decode JWT → get User from DB
        ↓
Service layer (ai_service.py): transcribe_audio(db, project_id, audio_path, model)
        ↓
Read audio file from disk → base64 encode → call Gemini API
        ↓
Parse Gemini JSON response → extract {transcript, language}
        ↓
Update Project in DB: transcript_text, tokens_used, ai_model_used
        ↓
Create UsageLog entry
        ↓
Return { "transcript": "...", "language": "English (US)" }
        ↓
Axios response → projectsService.transcribe() resolves
        ↓
MainApp.tsx → setTranscript(result.transcript), setDetectedLanguage(result.language)
        ↓
ProjectContext.updateProject() → refreshProject(projectId)
        ↓
UI updates: show transcript in "Transcript" tab
```

---

## 🔒 **Security Layers**

```
Layer 1: Authentication (JWT)
  └─ Every protected endpoint requires: Authorization: Bearer <token>

Layer 2: Authorization (Ownership)
  └─ get_current_user dependency fetches User from DB
  └─ Each endpoint checks: project.user_id == current_user.id

Layer 3: Input Validation (Pydantic)
  └─ Request bodies validated via schemas (RegisterRequest, ProjectUpdate, etc.)
  └─ Automatic 422 errors for invalid data

Layer 4: File Security
  └─ MIME type whitelist (audio/mpeg, audio/wav, etc.)
  └─ Max file size (200MB configurable)
  └─ Files stored in user-specific directories
  └─ No direct path traversal (UUID filenames)

Layer 5: Token Blacklist
  └─ Logged-out tokens added to in-memory blacklist
  └─ Checked on every request in get_current_user

Layer 6: HTTPS (future)
  └─ CORS restricted to frontend origin
  └─ Production: HTTPS + secure cookies
```

---

## 📡 **Network Requests Summary**

| Request | Method | Endpoint | Auth? | Body | Response |
|---------|--------|----------|-------|------|----------|
| Register | POST | `/api/v1/auth/register` | No | JSON (name, email, password) | User |
| Login | POST | `/api/v1/auth/login` | No | Form (username, password) | {access_token, refresh_token} |
| Get Me | GET | `/api/v1/auth/me` | Yes | - | User |
| Create Project | POST | `/api/v1/projects/` | Yes | FormData (name, file) | Project |
| List Projects | GET | `/api/v1/projects/` | Yes | Query (limit, offset) | [Project] |
| Get Project | GET | `/api/v1/projects/{id}` | Yes | - | Project |
| Update Project | PUT | `/api/v1/projects/{id}` | Yes | JSON (name, transcript, segments) | Project |
| Delete Project | DELETE | `/api/v1/projects/{id}` | Yes | - | {detail} |
| Stream Audio | GET | `/api/v1/projects/{id}/audio` | Yes (token= or header) | - | FileResponse (audio/mpeg) |
| Export SRT | GET | `/api/v1/projects/{id}/export/srt` | Yes | - | PlainText (text/plain) |
| Transcribe | POST | `/api/v1/ai/transcribe/{id}` | Yes | JSON {model?} | {transcript, language} |
| Align | POST | `/api/v1/ai/align/{id}` | Yes | JSON {transcript, model?} | {segments: [...]} |
| Refresh Token | POST | `/api/v1/auth/refresh` | No | JSON {token} | {access_token, refresh_token} |
| Logout | POST | `/api/v1/auth/logout` | No | JSON {refresh_token} | {detail} |

---

## 🎯 **Deployment Architecture (Future)**

```
Production (AWS / Railway / DigitalOcean)
├── Frontend (Vite build)
│   └── Hosted on Vercel / Netlify / S3 + CloudFront
│       └── Static files: index.html, JS bundles, assets
│
├── Backend (FastAPI)
│   └── Hosted on Railway / Render / EC2 / Docker
│       ├── Gunicorn + Uvicorn workers
│       ├── PostgreSQL (managed: Supabase / RDS / Neon)
│       ├── Redis (for production token blacklist + rate limiting)
│       ├── Cloud Storage (S3 / Cloudflare R2) for audio files
│       └── Environment variables (SECRET_KEY, DATABASE_URL, etc.)
│
├── CDN (optional)
│   └── Cloudflare (caching, DDoS protection)
│
└── Monitoring
    ├── Sentry (error tracking)
    ├── Prometheus + Grafana (metrics)
    └── Log aggregation ( Papertrail / LogDNA )
```

---

## 📚 **Documentation Files**

| File | Purpose |
|------|---------|
| `README.md` | Main project README (setup, features, screenshots) |
| `PROJECT_STATUS.md` | ✅ THIS FILE - Completion status, what's done/needed |
| `STACK_STRUCTURE.md` | ✅ THIS FILE - Tech stack, architecture, tree |
| `INTEGRATION_SUMMARY.md` | Detailed integration report (backend + frontend) |
| `features/Workflow.md` | User workflow documentation |
| `features/features.md` | Feature list and descriptions |
| `features/backend-implementation-plan.md` | Backend planning doc |
| `features/non-core-tasks.md` | Optional enhancements |
| `backend/README.md` (optional) | Backend-specific docs |
| `frontend/README.md` (optional) | Frontend-specific docs |

---

*Generated: 2026-04-19*
*Project: AI Transcribe - Perfect Captions AI*
*License: (to be added)*
