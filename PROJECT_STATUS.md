# AI Transcribe - Project Status & Stack Structure

## 📊 Project Completion Status

### ✅ **COMPLETED (Core MVP - 100%)**

#### Backend (FastAPI)
- [x] JWT Authentication (register, login, logout, refresh, token blacklist)
- [x] User model + CRUD operations
- [x] Project model + CRUD operations (including file uploads)
- [x] UsageLog model + tracking
- [x] AI integration endpoints (transcribe, align using Gemini)
- [x] **SRT Export endpoint** (`GET /api/v1/projects/{id}/export/srt`)
- [x] Audio streaming endpoint (authenticated)
- [x] CORS configuration
- [x] Database migrations (Alembic)
- [x] File validation (size, MIME types)
- [x] Error handling (HTTPException)

#### Frontend (React + TypeScript)
- [x] API layer (Axios with interceptors, auto token refresh)
- [x] Global state management (AuthContext, ProjectContext)
- [x] Authentication UI (login, registration with real backend)
- [x] Audio upload with backend project creation
- [x] AI transcription - calls backend Gemini
- [x] AI alignment - calls backend Gemini
- [x] Video Studio (caption editor with WaveSurfer)
- [x] Caption editing (undo/redo, styling controls)
- [x] Real-time caption preview on video placeholder
- [x] UserDashboard (shows projects, token usage)
- [x] SRT download functionality (frontend generation + backend export)
- [x] Project deletion
- [x] TypeScript zero errors

#### Integration
- [x] Frontend ↔ Backend API fully wired
- [x] JWT token handling (store, attach, refresh)
- [x] File upload → Project creation flow
- [x] Audio streaming with JWT query param
- [x] Transcribe & align workflows complete
- [x] Test credentials created (2 users)

---

### ⚠️ **REMAINING (Polish & Production Hardening)**

#### A. Critical User Experience (Do Next)
- [ ] **Loading spinners** for transcribe/align buttons (operations take 30+ seconds)
- [ ] **Error toasts/snackbars** - show API errors to users (currently console only)
- [ ] **Audio duration display** - show "0:00" currently (use ffprobe or estimate from file size)
- [ ] **Verify SRT download** in all browsers (test Chrome, Firefox, Safari)
- [ ] **Loading skeleton** for UserDashboard while fetching projects

#### B. Important for Stability
- [ ] **Rate limiting** (per-user/IP) - protect against abuse & high AI costs
- [ ] **Actual token counting** - use tiktoken or Gemini API metadata instead of heuristic
- [ ] **Pagination** for projects list (currently loads all)
- [ ] **Project details page** (`/projects/:id`) - individual view
- [ ] **File deletion cleanup** - verify audio file removed from disk when project deleted
- [ ] **Request validation** - stricter MIME checking, file size enforcement at endpoint level

#### C. Security & Production Readiness
- [ ] **Use strong JWT secret** (current is demo key from .env.example)
- [ ] **HTTPS enforcement** (CORS to production domain)
- [ ] **Structured logging** (JSON logs with request IDs)
- [ ] **Sentry integration** (already configured but not used)
- [ ] **Prometheus metrics** (QPS, latency, token usage)
- [ ] **Detailed health checks** (DB connectivity, disk space)
- [ ] **Database connection pooling** (add pgbouncer for Postgres)
- [ ] **Backup strategy** for uploads + database

#### D. Missing Features (Non-Core)
- [ ] **Google OAuth** (backend placeholder exists, frontend button disabled)
- [ ] **User profile settings** (ProfileSettings component exists - needs implementation)
- [ ] **Admin dashboard** (AdminDashboard exists - needs admin-only data & controls)
- [ ] **Real usage metrics** on dashboard (currently static "$245 savings")
- [ ] **Email verification** flow
- [ ] **Password reset** flow

#### E. Deployment & DevOps
- [ ] **Dockerfiles** (backend + frontend)
- [ ] **docker-compose.yml** for local dev (Postgres + backend + frontend)
- [ ] **CI/CD pipeline** (GitHub Actions - test, build, deploy)
- [ ] **Production environment** config
- [ ] **Migration automation** in deploy script

---

### 📋 **QUICK SUMMARY**

| Category | Done | Needed | % Complete |
|----------|------|--------|------------|
| Backend API | 14 endpoints | Rate limiting, metrics | 95% |
| Frontend UI | All pages | Polishing (loaders, toasts) | 90% |
| Auth Flow | Complete | Email verification, password reset | 80% |
| AI Workflow | Complete | Token counting accuracy | 90% |
| Data Export | Complete | None | 🎉 100% |
| DevOps | Basic | Docker, CI/CD, monitoring | 30% |

**Overall MVP: 95%** (only UX polish remaining)
**Production Ready: ~40%** (needs security, monitoring, deployment)

---

## 🏗️ **Project Stack Structure**

```
AI-transcribe/
│
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, CORS, router inclusion
│   │   ├── config.py            # Pydantic Settings (.env loading)
│   │   ├── database.py          # SQLAlchemy engine + SessionLocal
│   │   ├── dependencies.py      # FastAPI deps: get_db, get_current_user, get_optional_user
│   │   │
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── user.py          # User table (auth)
│   │   │   ├── project.py       # Project table (transcriptions)
│   │   │   └── usage_log.py     # UsageLog table (tracking)
│   │   │
│   │   ├── schemas/             # Pydantic schemas (request/response validation)
│   │   │   ├── auth.py          # Register, Login, Token, UserResponse
│   │   │   ├── user.py          # UserUpdate, UserMini
│   │   │   ├── project.py       # ProjectResponse, ProjectListResponse, ProjectUpdate
│   │   │   ├── ai.py            # TranscribeResponse, AlignResponse
│   │   │   └── usage.py         # UsageLogResponse, UsageSummary
│   │   │
│   │   ├── repositories/        # Data Access Layer (thin CRUD wrappers)
│   │   │   └── __init__.py      # get_user_by_id, get_project_by_id, create_project, update_project, etc.
│   │   │
│   │   ├── services/            # Business Logic Layer
│   │   │   ├── auth_service.py  # register_user, authenticate_user, generate_tokens, etc.
│   │   │   ├── file_service.py  # validate_audio_file, save_uploaded_file, delete_project_file
│   │   │   ├── ai_service.py    # transcribe_audio, align_transcript (Gemini calls)
│   │   │   ├── usage_service.py # get_user_usage_summary
│   │   │   └── __init__.py      # Re-exports all services
│   │   │
│   │   ├── utils/               # Utilities
│   │   │   └── __init__.py      # hash_password, verify_password, create_access_token, create_refresh_token, decode_token, token blacklist
│   │   │
│   │   └── routers/             # FastAPI Routers (endpoints)
│   │       ├── auth.py          # /api/v1/auth/*
│   │       ├── projects.py      # /api/v1/projects/* (+ export/srt)
│   │       ├── ai.py            # /api/v1/ai/*
│   │       └── usage.py         # /api/v1/usage/*
│   │
│   ├── alembic/                 # Database migrations
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   ├── versions/
│   │   │   └── 2c9acda0b30f_initial_schema_users_projects_usage_logs.py
│   │   └── README
│   │
│   ├── uploads/                 # Uploaded audio files (created at runtime)
│   │   └── {user_id}/
│   │
│   ├── tests/                   # Unit/Integration tests (empty)
│   │
│   ├── requirements.txt         # Production deps (fastapi, sqlalchemy, psycopg, etc.)
│   ├── requirements-dev.txt     # Dev deps (alembic, pytest, etc.)
│   ├── .env.example             # Environment template (NOT committed)
│   ├── .env                     # Local env (gitignored)
│   └── server.log               # Uvicorn logs (gitignored)
│
├── frontend/                    # React Frontend (Vite + TypeScript)
│   ├── index.html               # Entry HTML
│   ├── vite.config.ts           # Vite configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── tailwind.config.js       # Tailwind CSS (if present)
│   ├── package.json             # Node dependencies
│   ├── package-lock.json
│   │
│   ├── public/                  # Static assets (if any)
│   │
│   ├── src/
│   │   ├── main.tsx             # React entry point (providers wrapper)
│   │   ├── App.tsx              # Main app component (Layout, routes, MainApp)
│   │   ├── index.css            # Global styles
│   │   │
│   │   ├── components/          # React Components
│   │   │   ├── AuthPage.tsx     # Login / Registration form
│   │   │   ├── UserDashboard.tsx # Project history + usage stats
│   │   │   ├── ProfileSettings.tsx # User profile (placeholder)
│   │   │   ├── AdminDashboard.tsx # Admin panel (placeholder)
│   │   │   └── (other UI comps in same folder)
│   │   │
│   │   ├── contexts/            # React Contexts (global state)
│   │   │   ├── AuthContext.tsx  # { user, isAuthenticated, login, logout, ... }
│   │   │   └── ProjectContext.tsx # { projects, currentProject, createProject, loadProjects, ... }
│   │   │
│   │   ├── services/            # API service layer
│   │   │   ├── auth.ts          # authService.{login, register, logout, getMe, ...}
│   │   │   └── projects.ts      # projectsService.{list, get, create, update, delete, transcribe, align, getAudioUrl, downloadSrt, ...}
│   │   │
│   │   ├── lib/                 # Utilities
│   │   │   ├── api.ts           # Axios instance with interceptors
│   │   │   └── utils.ts         # clsx/tailwind helper (cn)
│   │   │
│   │   ├── types/               # TypeScript type definitions
│   │   │   └── api.ts           # User, Project, UsageLog, TokenResponse, etc.
│   │   │
│   │   └── (other imported libs: lucide-react, motion/react, wavesurfer, etc.)
│   │
│   ├── .env.local               # Vite env (VITE_API_BASE_URL) - gitignored
│   └── .env.example             # Template for .env.local (optional)
│
├── features/                     # Feature documentation (planning)
│   ├── Workflow.md
│   ├── features.md
│   ├── backend-implementation-plan.md
│   └── non-core-tasks.md
│
├── INTEGRATION_SUMMARY.md        # Detailed integration report
├── README.md                     # Main project README
├── .gitignore                    # Excludes: node_modules, .env, venv, uploads, logs, etc.
└── (future: docker-compose.yml, Dockerfile, CI configs)

```

---

## 🔄 **Architecture Overview**

### **Backend Layers (Clean Architecture-ish)**
```
┌─────────────────────────────────────────────┐
│         FastAPI Endpoints (routers/)        │  ← HTTP layer
│    auth, projects, ai, usage routers        │
├─────────────────────────────────────────────┤
│        Dependencies (dependencies.py)       │  ← Auth: get_current_user, get_db
├─────────────────────────────────────────────┤
│         Service Layer (services/)           │  ← Business logic
│  auth_service, file_service, ai_service    │
├─────────────────────────────────────────────┤
│      Repository Layer (repositories/)       │  ← Data access (thin wrappers)
│    get_project_by_id, create_project, etc.  │
├─────────────────────────────────────────────┤
│         Models (SQLAlchemy ORM)             │  ← Database schema
│        User, Project, UsageLog              │
├─────────────────────────────────────────────┤
│         Database (PostgreSQL)               │
└─────────────────────────────────────────────┘
```

### **Frontend Architecture (React)**
```
┌─────────────────────────────────────────┐
│           React App (App.tsx)           │  ← Router + Layout
├─────────────────────────────────────────┤
│       Global State (Contexts)           │
│  AuthContext, ProjectContext            │
├─────────────────────────────────────────┤
│         API Services Layer              │
│   auth.ts, projects.ts ( Axios )        │
├─────────────────────────────────────────┤
│         Components                      │
│  AuthPage, UserDashboard, MainApp       │
├─────────────────────────────────────────┤
│          State Hooks                    │
│  useState, useContext, useRef           │
└─────────────────────────────────────────┘
```

---

## 🌐 **Database Schema (PostgreSQL)**

```sql
users
├── id (UUID, PK)
├── email (unique)
├── password_hash
├── name
├── mobile, company, language
├── avatar_url
├── is_verified, two_factor_enabled, two_factor_secret
├── plan (enum: free, pro, enterprise)
├── plan_expires_at
├── status (active, suspended, deleted)
├── created_at, updated_at

projects
├── id (UUID, PK)
├── user_id (FK → users.id, CASCADE)
├── name
├── audio_file_url (text: /uploads/{user_id}/{filename})
├── audio_duration (float, seconds)
├── file_size_bytes (int)
├── language_detected (varchar)
├── transcript_text (text)
├── segments (JSONB: [{start, end, text}])
├── tokens_used (int, default 0)
├── ai_model_used (varchar)
└── created_at, updated_at

usage_logs
├── id (UUID, PK)
├── user_id (FK → users.id, CASCADE)
├── project_id (FK → projects.id, SET NULL)
├── action (varchar: 'transcribe', 'alignment', 'export')
├── tokens_consumed (int)
├── ai_model (varchar)
└── created_at (timestamp with timezone)
```

---

## 🔐 **Authentication Flow**

```
1. Register
   POST /api/v1/auth/register
   → bcrypt hash password
   → create user in DB
   → return User object

2. Login
   POST /api/v1/auth/login (form-data)
   → verify password (bcrypt)
   → generate access_token (15 min) + refresh_token (7 days)
   → set httpOnly cookie for refresh_token
   → return { access_token, refresh_token, token_type }

3. API Request (authenticated)
   GET /api/v1/projects/
   → Header: Authorization: Bearer {access_token}
   → decode JWT, verify not blacklisted
   → get user from DB
   → execute endpoint

4. Token Expiry (401 response)
   → Axios interceptor catches 401
   → POST /api/v1/auth/refresh with refresh_token (cookie)
   → get new access_token
   → retry original request
   → if refresh fails → redirect to /login

5. Logout
   POST /api/v1/auth/logout
   → add access_token to blacklist (in-memory)
   → delete refresh_token cookie
   → clear localStorage
```

---

## 📁 **Key Files Reference**

### Backend
| File | Purpose |
|------|---------|
| `backend/app/main.py` | FastAPI app creation, CORS, router registration |
| `backend/app/config.py` | Settings class (loads from .env) |
| `backend/app/database.py` | SQLAlchemy engine + SessionLocal |
| `backend/app/models/user.py` | User ORM model |
| `backend/app/models/project.py` | Project ORM model |
| `backend/app/models/usage_log.py` | UsageLog ORM model |
| `backend/app/schemas/project.py` | Pydantic schemas for projects |
| `backend/app/services/ai_service.py` | Gemini transcription & alignment |
| `backend/app/services/file_service.py` | File upload, validation, serving |
| `backend/app/routers/projects.py` | Projects CRUD + SRT export |
| `backend/alembic/versions/2c9acda0b30f_*.py` | Initial migration |

### Frontend
| File | Purpose |
|------|---------|
| `frontend/src/lib/api.ts` | Axios instance with interceptors |
| `frontend/src/contexts/AuthContext.tsx` | Auth state provider |
| `frontend/src/contexts/ProjectContext.tsx` | Project state provider |
| `frontend/src/App.tsx` | Main app, routing, integration |
| `frontend/src/components/AuthPage.tsx` | Login/Register form |
| `frontend/src/components/UserDashboard.tsx` | Project list + usage |
| `frontend/src/services/auth.ts` | Auth API methods |
| `frontend/src/services/projects.ts` | Projects API methods (incl. SRT) |
| `frontend/src/types/api.ts` | TypeScript interfaces |

---

## 🚀 **How to Run Locally**

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 14+ (or use SQLite temporarily)
- Gemini API key

### Setup Steps

#### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env:
# - DATABASE_URL (PostgreSQL connection)
# - GEMINI_API_KEY (your key)
# - SECRET_KEY (generate: openssl rand -hex 32)

# Initialize database
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port=8000
```

#### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # set VITE_API_BASE_URL=http://localhost:8000
npm run dev
# → http://localhost:3000
```

#### 3. Create Test User
```bash
# Via API (or use browser UI)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123!","mobile":"+1234567890"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test%40example.com&password=TestPass123!"
```

---

## 📝 **API Endpoints Summary**

```
Authentication (7)
  POST   /api/v1/auth/register          → Register new user
  POST   /api/v1/auth/login             → Login (form-data)
  GET    /api/v1/auth/me                → Get current user
  PUT    /api/v1/auth/me                → Update profile
  POST   /api/v1/auth/change-password   → Change password
  POST   /api/v1/auth/refresh           → Refresh access token
  POST   /api/v1/auth/logout            → Logout (blacklist)

Projects (7)
  POST   /api/v1/projects/              → Create + upload audio
  GET    /api/v1/projects/              → List user's projects
  GET    /api/v1/projects/{id}          → Get project details
  PUT    /api/v1/projects/{id}          → Update project
  DELETE /api/v1/projects/{id}          → Delete project + file
  GET    /api/v1/projects/{id}/audio    → Stream audio (JWT token)
  GET    /api/v1/projects/{id}/export/srt → Download SRT file

AI (2)
  POST   /api/v1/ai/transcribe/{id}     → Transcribe audio (Gemini)
  POST   /api/v1/ai/align/{id}          → Align transcript (Gemini)

Usage (2)
  GET    /api/v1/usage/summary          → Token/project/duration totals
  GET    /api/v1/usage/logs             → Paginated usage logs

Public
  GET    /health                        → Health check
  GET    /docs                          → Swagger UI
  GET    /redoc                         → ReDoc
```

---

## 🎯 **Core User Journey (MVP)**

```
User Flow:
1. Visit http://localhost:3000
   ↓
2. Click "Get Started" → /signup
   ↓ Fill form → POST /api/v1/auth/register
   ↓
3. Auto-login → redirect to /
   ↓
4. Drop audio file → POST /api/v1/projects (multipart)
   ↓ Project created, audio streaming URL set
   ↓
5. Click "Transcribe" → POST /api/v1/ai/transcribe/{id}
   ↓ Backend calls Gemini, stores transcript
   ↓
6. Click "Align" → POST /api/v1/ai/align/{id}
   ↓ Backend calls Gemini, stores segments
   ↓
7. Edit captions in Video Studio (optional)
   ↓
8. Click "Download SRT" → GET /api/v1/projects/{id}/export/srt
   ↓ SRT file downloads to computer
   ↓
9. Import SRT into video editor (Premiere, DaVinci, etc.)
   ✅ Done!
```

---

## 📊 **Current Status at a Glance**

| Feature | Status | Notes |
|---------|--------|-------|
| User registration | ✅ Done | Works, returns 201 |
| User login | ✅ Done | JWT tokens returned |
| Project creation (upload) | ✅ Done | File saved, DB record created |
| Audio streaming | ✅ Done | Authenticated via JWT query param |
| Transcription (Gemini) | ✅ Done | Calls Gemini 2.0 Flash Preview |
| Alignment (Gemini) | ✅ Done | Forced alignment, returns segments |
| Caption editing | ✅ Done | In-browser editor with undo/redo |
| Video preview | ✅ Done | Captions overlay on placeholder |
| SRT export (frontend) | ✅ Done | Generates in browser |
| SRT export (backend endpoint) | ✅ Done | `GET /export/srt` |
| Dashboard project list | ✅ Done | Loads from backend |
| Token usage tracking | ✅ Done | Updated on each AI call |
| Error handling | ⚠️ Partial | Console logs only, need UI toasts |
| Loading states | ⚠️ Partial | Basic, need progress indicators |
| Audio duration | ⚠️ Todo | Shows 0:00 currently |
| Rate limiting | ❌ Missing | No protection yet |
| Email verification | ❌ Missing | Not implemented |
| Password reset | ❌ Missing | Not implemented |
| Google OAuth | ❌ Missing | Placeholder only |
| Admin dashboard | ❌ Missing | UI only |
| Docker deployment | ❌ Missing | Manual setup only |
| CI/CD | ❌ Missing | No automation |

---

## 🎉 **What Makes This MVP "Done"?**

The **Core MVP** is defined as: *"A user can upload an audio file and get a downloadable SRT file with accurate captions."*

**All steps are now functional:**
1. ✅ User creates account
2. ✅ User uploads audio
3. ✅ Backend calls Gemini to transcribe
4. ✅ Backend calls Gemini to align
5. ✅ Frontend displays editable captions
6. ✅ User can download `.srt` file from dashboard

**The product is now USABLE.** Remaining items are polish, security, and scaling - not blockers for a beta launch with a small group of users.

---

*Last updated: 2026-04-19*
*Project: AI Transcribe - Perfect Captions AI*
*Stack: FastAPI + React + TypeScript + PostgreSQL + Gemini AI*
