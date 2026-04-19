# AI-Transcribe: Core Development Tasks (Frontend + Backend + Database)

**Last Updated:** 2026-04-18  
**Current State:** Frontend prototype complete, backend not started  
**Goal:** Build MVP with user authentication, project persistence, secure API, and full frontend-backend integration

**Excluded Tasks:** Docker, CI/CD, advanced monitoring, legal/compliance, billing, email, team features, mobile app, and all post-MVP enhancements are documented in `non-core-tasks.md`.

---

## 📋 Core Task Summary

| Area | Story Points | Status |
|------|-------------|--------|
| **Backend API (FastAPI)** | 40 | ❌ Not started |
| **Database (PostgreSQL)** | 13 | ❌ Not started |
| **Frontend-Backend Integration** | 20 | ❌ Not started |
| **Frontend Polish & Testing** | 15 | ⏳ In progress |
| **Backend Testing** | 10 | ❌ Not started |
| **Basic DevOps & Deployment** | 5 | ❌ Not started |
| **Basic Security** | 8 | ❌ Not started |
| **Documentation** | 3 | ❌ Not started |
| **Total** | **~114 SP** | |

**Timeline:** 6-8 weeks (1 senior full-stack developer)

---

## PRIORITY 1: Backend API (FastAPI) - 40 SP

### 1.1 Project Setup (3 SP)
- [ ] Backend directory structure: `app/` with routers, models, schemas, services, repositories
- [ ] `requirements.txt` with FastAPI, Uvicorn, SQLAlchemy, Alembic, Pydantic, Bcrypt, Python-Jose, etc.
- [ ] `.env.example` with DATABASE_URL, GEMINI_API_KEY, SECRET_KEY, CORS_ORIGINS
- [ ] FastAPI app with CORS middleware (allow localhost:3000 + production frontend)
- [ ] Health check endpoint (`GET /health` → {"status":"ok"})
- [ ] Basic logging setup (structured JSON to stdout)

**Valid:** `uvicorn app.main:app --reload` serves on `http://localhost:8000`

### 1.2 Database Schema & Migration (5 SP)
- [ ] Design tables:
  - `users`: id, email, password_hash, name, mobile, company, language, plan, status, is_verified, created_at, updated_at
  - `projects`: id, user_id (FK), name, audio_file_url, audio_duration, transcript_text, segments (JSON), tokens_used, ai_model_used, created_at, updated_at
  - `usage_logs`: id, user_id, project_id, action, tokens_consumed, ai_model, timestamp
- [ ] Create SQLAlchemy models (`app/models/`)
- [ ] Create Pydantic schemas (`app/schemas/`) for request/response validation
- [ ] Initialize Alembic: `alembic init alembic`
- [ ] Generate initial migration: `alembic revision --autogenerate`
- [ ] Add indexes: `idx_users_email`, `idx_projects_user_id`, `idx_projects_created_at`, `idx_usage_logs_user_timestamp`
- [ ] Apply: `alembic upgrade head`
- [ ] Write unit tests for models (basic instantiation)

**Deliverable:** PostgreSQL database with production-ready schema, versioned migrations

### 1.3 Authentication System (12 SP)
**Endpoints:**
- [ ] `POST /api/auth/register` - register with email, password, name, mobile
- [ ] `POST /api/auth/login` - returns { access_token, refresh_token, user }
- [ ] `GET /api/auth/me` - get current user profile
- [ ] `PUT /api/auth/me` - update name, mobile, company, language
- [ ] `POST /api/auth/change-password` - with old/new password
- [ ] `POST /api/auth/refresh` - refresh access token using refresh token
- [ ] `POST /api/auth/logout` - blacklist refresh token
- [ ] `GET /api/auth/google/url` - return OAuth URL (placeholder, not implemented)

**Security:**
- [ ] Password hashing: `bcrypt.gensym(rounds=12)`
- [ ] JWT: HS256 algorithm, 15-minute access, 7-day refresh
- [ ] Refresh token stored in httpOnly cookie (set via response)
- [ ] Rate limit: 5 attempts per minute per IP on login/register (slowapi)
- [ ] Implement `get_current_user` dependency for protected routes
- [ ] Password strength: min 8 chars, letter+number
- [ ] Email format validation (Pydantic)
- [ ] Implement token blacklist (in-memory or Redis later)

**Testing:**
- [ ] Unit: hash/verify, JWT encode/decode
- [ ] Integration: register → login → access protected → refresh → logout

**Deliverable:** Secure JWT authentication with refresh, logout, rate limiting

### 1.4 Project & File Management API (8 SP)
**File Upload:**
- [ ] `POST /api/projects` (multipart: file + JSON metadata)
  - [ ] Validate: audio/* MIME, size < 200MB
  - [ ] Save to `uploads/{user_id}/{uuid}.{ext}`
  - [ ] Create project record in DB
  - [ ] Return `{id, name, audio_file_url, user_id}`

**Project CRUD:**
- [ ] `GET /api/projects` - list my projects (pagination: `?limit=20&offset=0`)
- [ ] `GET /api/projects/:id` - get single project with segments, transcript
- [ ] `PUT /api/projects/:id` - update segments, transcript, metadata
- [ ] `DELETE /api/projects/:id` - delete record + file from disk

**Audio Access:**
- [ ] `GET /api/projects/:id/audio` - serve audio file (Range header support)

**Testing:**
- [ ] Test upload (small 1MB, large 200MB, wrong type)
- [ ] Test CRUD operations (own projects only)
- [ ] Test 403 on other user's project

**Deliverable:** Full project lifecycle with local file storage

### 1.5 Gemini AI Integration (Backend) - 5 SP
- [ ] `app/services/ai_service.py`
- [ ] Use `google-genai` SDK in Python or call REST API directly
- [ ] `transcribe_audio(audio_bytes: bytes, model: str) -> {language, transcript}`
- [ ] `align_transcript(audio_bytes: bytes, transcript: str, model: str) -> list[{start,end,text}]`
- [ ] Encode audio to base64
- [ ] Add error handling (API errors, timeouts)
- [ ] Add retry with exponential backoff (3 attempts)
- [ ] Log token usage per call
- [ ] **Never expose API key** - load from `GEMINI_API_KEY` env var

**Endpoints:**
- [ ] `POST /api/ai/transcribe` - body: `{project_id, audio_file}` → returns job_id
- [ ] `POST /api/ai/align` - body: `{project_id, transcript}` → returns job_id
- [ ] `GET /api/ai/job/:job_id` - poll for status: pending/processing/completed/failed + result

**Testing:**
- [ ] Mock Gemini API with sample responses
- [ ] Test retry logic
- [ ] Test token logging

**Deliverable:** Secure AI transcription/alignment endpoints (backend-only key)

### 1.6 Usage Tracking (3 SP)
- [ ] Create `usage_logs` table
- [ ] Decorator `@track_usage(action, tokens)` to log each AI call
- [ ] `GET /api/usage` - current user's monthly usage summary
- [ ] `GET /api/admin/usage` - admin: all users with filters (date range, user, action)

**Deliverable:** Token accounting system

### 1.7 Admin API (2 SP)
- [ ] `GET /api/admin/stats` → `{total_users, active_subs, total_tokens, monthly_revenue}`
- [ ] `GET /api/admin/users` (covered in User Management)
- [ ] `GET /api/admin/projects` - list all projects (with user email)
- [ ] `DELETE /api/admin/projects/:id` - force delete

**Deliverable:** Admin endpoints for dashboard

---

## PRIORITY 2: Database (PostgreSQL) - 13 SP

### 2.1 Database Setup (3 SP)
- [ ] Install PostgreSQL 15+ (local)
- [ ] Create DB: `createdb ai_transcribe_db`
- [ ] Create user with password
- [ ] `DATABASE_URL=postgresql://user:pass@localhost:5432/ai_transcribe_db`
- [ ] Install: `pip install sqlalchemy alembic psycopg2-binary` (or asyncpg if async)
- [ ] `alembic init alembic` ; configure `alembic.ini`
- [ ] Test connection from Python REPL

### 2.2 Schema & Migrations (5 SP)
- [ ] Write initial migration (all 3 tables + constraints + indexes)
- [ ] Run `alembic upgrade head`
- [ ] Add foreign keys (projects.user_id → users.id, ON DELETE CASCADE)
- [ ] Add check constraints: `plan IN ('free','basic','pro','enterprise')`, `status IN ('active','deactivated')`
- [ ] Indexes:
  - `users(email)` unique
  - `projects(user_id, created_at DESC)`
  - `usage_logs(user_id, timestamp DESC)`
- [ ] Seed admin user (optional)

### 2.3 Repository Layer (3 SP)
- [ ] `app/repositories/user_repository.py`:
  - `get_by_email(email)`, `get_by_id(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `list(filters, limit, offset)`
- [ ] `app/repositories/project_repository.py`:
  - `create(user_id, name, audio_url, duration)`, `get_by_id(id, user_id)`, `get_all_by_user(user_id)`, `update(id, data)`, `delete(id)`
- [ ] `app/repositories/usage_repository.py`:
  - `log(user_id, project_id, action, tokens, model)`, `get_user_summary(user_id, days=30)`
- [ ] Unit tests with mocked DB session (use `unittest.mock`)

### 2.4 Performance & Backups (2 SP)
- [ ] Configure pool_size=20, max_overflow=30 in SQLAlchemy engine
- [ ] Set up daily backup: `pg_dump -U user ai_transcribe_db > backup_$(date +%F).sql`
- [ ] Create ER diagram (dbdiagram.io or draw.io)

---

## PRIORITY 3: Frontend-Backend Integration - 20 SP

### 3.1 API Client (3 SP)
- [ ] `frontend/src/lib/api.ts`: Axios instance with baseURL from `import.meta.env.VITE_API_BASE_URL`
- [ ] Request interceptor: add `Authorization: Bearer <token>` header (token in localStorage)
- [ ] Response interceptor: on 401 → clear auth state + redirect to `/login`
- [ ] Error toast integration (import `toast` from `react-toastify`)
- [ ] TypeScript types: `User`, `Project`, `Segment`, `UsageSummary`, `AdminStats`, etc. (`types/api.ts`)

**Service Modules:**
- [ ] `authService.ts`: `login(email,password)`, `register(data)`, `logout()`, `me()`, `updateProfile(data)`, `changePassword(old,new)`
- [ ] `projectService.ts`: `create(file,meta)`, `list(limit,offset)`, `get(id)`, `update(id,data)`, `delete(id)`, `uploadAudio(projectId,file)`
- [ ] `aiService.ts`: `transcribe(projectId,file)`, `align(projectId,transcript)`, `getJobStatus(jobId)`
- [ ] `usageService.ts`: `getSummary()`, `getHistory()`
- [ ] `adminService.ts`: `getStats()`, `getUsers(filters)`, `activateUser(id)`, `deactivateUser(id)`, `getProjects()`

### 3.2 Authentication Integration (5 SP)
**AuthPage.tsx:**
- [ ] Replace `setTimeout` mock with `authService.login(formData)`
- [ ] Replace signup mock with `authService.register(formData)`
- [ ] On success: store token (localStorage.setItem('token', res.access_token)), redirect to `/`
- [ ] On error: show toast error
- [ ] Google OAuth: `window.open` popup → poll localStorage for token or use `postMessage`
- [ ] Logout: `authService.logout()` → clear token → redirect `/login`

**Auth Context:**
- [ ] Create `AuthContext.tsx` providing `{user, token, login, logout, isAuthenticated}`
- [ ] Wrap app in `AuthProvider` in `main.tsx`
- [ ] Consume context in Layout to show user dropdown

**Protected Routes:**
- [ ] `ProtectedRoute.tsx`: checks `isAuthenticated`, else redirect to `/login`
- [ ] `AdminRoute.tsx`: additionally checks `user.plan === 'enterprise'` or `user.is_admin`
- [ ] Apply to `/dashboard`, `/settings`, `/admin`

**Testing:**
- [ ] Mock API with MSW (Mock Service Worker)
- [ ] Test login flow end-to-end with fake user

### 3.3 Dashboard Integration (3 SP)
**UserDashboard.tsx:**
- [ ] `useEffect` → `projectService.list(10, 0)` → setHistory
- [ ] Show skeleton while loading
- [ ] Delete button: `await projectService.delete(id)` → remove from list
- [ ] Download buttons: `window.open('/api/projects/'+id+'/audio')` (browser downloads)
- [ ] Stats: `await usageService.getSummary()` → setUsage
- [ ] Plan: from user context (`user.plan`)

**Testing:**
- [ ] Verify projects load on mount
- [ ] Verify delete removes row

### 3.4 Profile Integration (2 SP)
**ProfileSettings.tsx:**
- [ ] On mount: `const { data } = await authService.me()` → populate form
- [ ] Save: `await authService.updateProfile(formData)` → success toast
- [ ] Change password modal: `await authService.changePassword({old, new})`
- [ ] Avatar: file input → `authService.uploadAvatar(file)` (optional)

### 3.5 Admin Integration (3 SP)
**AdminDashboard.tsx:**
- [ ] On mount: `Promise.all([adminService.getStats(), adminService.getUsers(), adminService.getUsage()])`
- [ ] Loading skeletons for stats cards
- [ ] Users table: map `users` → rows with plan badge, status dot
- [ ] Search: `adminService.getUsers({search})` on input change (debounced)
- [ ] Filter: `adminService.getUsers({plan, status})` on tab click
- [ ] Activate/Deactivate: call respective API → update local state
- [ ] Usage chart: `usageData` from `adminService.getUsage()` pass to Recharts

### 3.6 Main App Integration (4 SP)
**App.tsx - Upload:**
- [ ] `handleFileUpload`: `const project = await projectService.create(file, {name: file.name}); setProjectId(project.id)`
- [ ] Show progress: use `axios.CancelToken.source()` and `onUploadProgress` event
- [ ] Error: catch and show toast

**App.tsx - Transcription:**
- [ ] `transcribeAudio`: `await aiService.transcribe(projectId, audioFile)` → returns job_id
- [ ] Poll `aiService.getJobStatus(jobId)` every 2s until completed
- [ ] On complete: set transcript, detect language
- [ ] AbortController to cancel polling

**App.tsx - Alignment:**
- [ ] `alignTranscript`: `await aiService.align(projectId, transcript)` → job_id
- [ ] Poll status → setSegments when done
- [ ] Auto-initialize undoStack after segments set

**App.tsx - Auto-Save:**
- [ ] `useEffect` with 30s interval: if projectId & (segments changed), `projectService.update(projectId, {segments, transcript})`
- [ ] Debounce (wait 1s after last change before saving)
- [ ] On unmount: trigger save if dirty
- [ ] On page load: if projectId exists, fetch project → restore state

**App.tsx - Export:**
- [ ] SRT: `const res = await fetch('/api/projects/'+id+'/export/srt'); const blob = await res.blob(); download(blob)`
- [ ] Video: `await aiService.exportVideo(projectId)` → job_id → poll → download when ready

**App.tsx - Errors:**
- [ ] Wrap API calls in try/catch → toast.error()
- [ ] If 401 on any call: clear token, redirect `/login`
- [ ] Global error boundary for React crashes (log to Sentry later)

**Testing:**
- [ ] Manual QA: full flow from upload to export
- [ ] Verify auto-save persists across refresh

---

## PRIORITY 4: Frontend Improvements - 10 SP

### 4.1 UI Polish (3 SP)
- [ ] Add `react-toastify` for success/error toasts
- [ ] Create `Skeleton` component (shimmer effect)
  - [ ] Stats cards skeleton
  - [ ] History table rows (3 placeholder rows)
  - [ ] Admin user table skeleton
  - [ ] VideoStudio canvas placeholder
- [ ] Confirmation modal before delete (project, segment) - use `window.confirm` temporarily or create `Dialog` component
- [ ] File upload: show file size, duration, name in UI

### 4.2 Performance (2 SP)
- [ ] Lazy load VideoStudio: `const VideoStudio = lazy(() => import('./components/VideoStudio'))`
- [ ] Lazy load WaveSurfer: only initialize on upload
- [ ] Bundle analyzer: `npm install --save-dev rollup-plugin-visualizer` → check bundle
- [ ] Memoize Timeline component if re-rendering too much
- [ ] Debounce `updateSegmentText` API call (if directly saving)

### 4.3 Error Boundaries (2 SP)
- [ ] Create `ErrorBoundary.tsx` (class component with `getDerivedStateFromError`)
- [ ] Wrap `<App>` in `ErrorBoundary` in `main.tsx`
- [ ] Show error UI with "Try Again" button (reload page)
- [ ] Log error to console (Sentry later)

### 4.4 Accessibility (2 SP)
- [ ] Add `aria-label` to icon-only buttons (Play, Pause, Delete, etc.)
- [ ] Add `role="alert"` to error messages
- [ ] Ensure all inputs have `<label htmlFor="...">`
- [ ] Test keyboard navigation (Tab through all controls)
- [ ] Check color contrast with axe DevTools
- [ ] Add `:focus-visible` styles (Tailwind `focus-visible:`)

### 4.5 Frontend Testing - 5 SP
**Setup:**
- [ ] Choose Vitest + React Testing Library
- [ ] `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
- [ ] `vitest.config.ts` with test environment jsdom
- [ ] Add `"test": "vitest"` to package.json scripts

**Tests:**
- [ ] `utils.test.ts`: test `cn()` function merges classes correctly
- [ ] `formatTime.test.ts`: test time formatting (seconds → SRT timestamp)
- [ ] `App.test.tsx`:
  - [ ] Renders upload when no audio
  - [ ] Shows player after upload
  - [ ] Click Transcribe button → shows loading state
- [ ] `CaptionSegmentList.test.tsx`: renders segments, click checkbox selects
- [ ] `VideoStudio.test.tsx`: canvas present, controls render
- [ ] Mock services: `mocks/api.ts` using `msw`

**Deliverable:** 70%+ frontend coverage, CI-ready

---

## PRIORITY 5: Backend Testing - 10 SP

### 5.1 Setup (2 SP)
- [ ] `pip install pytest pytest-asyncio pytest-cov pytest-mock httpx faker`
- [ ] `pytest.ini` with `asyncio_mode = auto`
- [ ] Create `tests/conftest.py`:
  - [ ] `client = TestClient(app)` fixture
  - [ ] `db_session` fixture (transaction rollback after each test)
  - [ ] `test_user` fixture (create test user)
  - [ ] `auth_headers` fixture (login, return {Authorization: Bearer ...})
- [ ] Add `pytest-cov` to requirements-dev.txt
- [ ] Add test command: `pytest -v --cov=app --cov-report=html`

### 5.2 Unit Tests (3 SP)
- [ ] `tests/services/test_ai_service.py`:
  - [ ] Mock Gemini API response
  - [ ] Test `transcribe_audio()` returns {language, transcript}
  - [ ] Test `align_transcript()` returns segment list
  - [ ] Test error handling (API timeout)
- [ ] `tests/repositories/test_user_repository.py`:
  - [ ] `test_get_by_email_found()`
  - [ ] `test_get_by_id_not_found()`
  - [ ] `test_create_user()`
  - [ ] `test_update_user()`
- [ ] `tests/utils/test_jwt.py`: token encode/decode, expiration
- [ ] `tests/utils/test_password.py`: hash/verify

### 5.3 Integration Tests (5 SP)
- [ ] `tests/api/test_auth.py`:
  - [ ] `test_register_success()`
  - [ ] `test_register_duplicate_email_400()`
  - [ ] `test_login_invalid_credentials_401()`
  - [ ] `test_get_me_unauthorized_401()`
- [ ] `tests/api/test_projects.py`:
  - [ ] `test_create_project_with_file()` (use `tmp_path` + test file)
  - [ ] `test_list_projects_returns_only_own()`
  - [ ] `test_get_other_user_project_403()`
  - [ ] `test_delete_project_removes_file()`
- [ ] `tests/api/test_ai.py`:
  - [ ] `test_transcribe_endpoint_returns_job()` (mock AI service)
  - [ ] `test_align_endpoint_returns_job()`
  - [ ] `test_job_status_polling()`
- [ ] `tests/api/test_admin.py`:
  - [ ] `test_admin_stats_requires_admin_403()`
  - [ ] `test_admin_list_users()`

**Deliverable:** Backend test suite 70%+ coverage, CI-ready

---

## PRIORITY 6: Basic DevOps & Deployment (No Docker) - 5 SP

### 6.1 Documentation (2 SP)
- [ ] Write comprehensive `README.md`:
  - [ ] Project description (one paragraph)
  - [ ] Tech stack table
  - [ ] Architecture diagram (ASCII or Mermaid)
  - [ ] Local development setup (step-by-step for frontend + backend)
  - [ ] Environment variables (`.env.example` reference)
  - [ ] Database setup (PostgreSQL install + create + migrate)
  - [ ] Running tests (`pytest`, `npm test`)
  - [ ] Deployment guide (Railway/Render)
  - [ ] Troubleshooting (common errors)
- [ ] Create `.env.example` in backend/ (all vars documented)
- [ ] Create `scripts/setup.sh` (install deps, create DB, migrate)
- [ ] Create `scripts/run.sh` (start backend)
- [ ] Create `scripts/test.sh` (run pytest)
- [ ] Add `backend/requirements-dev.txt` (testing tools)
- [ ] Add `CONTRIBUTING.md` (code style, PR process)
- [ ] Add `CODE_OF_CONDUCT.md`

### 6.2 Manual Deployment (3 SP)
**Platform:** [Railway](https://railway.app) or [Render](https://render.com) (easiest for Python)

- [ ] Sign up + connect GitHub repository
- [ ] Create new service (Python)
  - [ ] Build command: `pip install -r requirements.txt && alembic upgrade head`
  - [ ] Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - [ ] Set environment variables (copy from `.env.example`)
  - [ ] Add PostgreSQL plugin/service
  - [ ] Set health check path: `/health`
- [ ] Enable automatic deploys on push to `main`
- [ ] Run migrations on deploy (via "Postdeploy" script in Railway/Render)
- [ ] Test: `https://your-app.up.railway.app/health` returns 200
- [ ] Deploy frontend to Vercel/Netlify:
  - [ ] Connect repo
  - [ ] Build command: `npm run build`
  - [ ] Output dir: `frontend/dist`
  - [ ] Env var: `VITE_API_BASE_URL=https://your-backend.up.railway.app`
- [ ] Test full flow in production
- [ ] Set up custom domain (optional)

**Deliverable:** Publicly accessible production app at `https://yourdomain.com`

---

## PRIORITY 7: Basic Security Hardening - 8 SP

### 7.1 Application Security (4 SP)
- [ ] CORS: `allow_origins=[process.env.FRONTEND_URL]` (not `*`)
- [ ] Rate limiting: `pip install slowapi` → `@limiter.limit("5/minute")` on auth endpoints
- [ ] Request size: `app.add_middleware(TrustedHostMiddleware, allowed_hosts=[...])` + uvicorn `--limit-max-size 209715200`
- [ ] Security headers (custom middleware):
  ```python
  app.add_middleware(SUBSecureHeadersMiddleware, 
    content_security_policy="default-src 'self'; script-src 'self' 'unsafe-inline'",
    strict_transport_security=True
  )
  ```
- [ ] File validation: verify magic bytes (not just extension)
- [ ] Ensure no `eval()` or `exec()` in code
- [ ] Remove any `sqlalchemy.text()` with string formatting (use parameters)

### 7.2 Authentication Security (3 SP)
- [ ] Generate strong `SECRET_KEY`: `openssl rand -hex 32`
- [ ] Access token: 15 minutes
- [ ] Refresh token: 7 days, rotated on each use
- [ ] Logout: add refresh token to deny-list (in-memory set or Redis set)
- [ ] Rate limit: `5/min` per IP on `/auth/login`, `/auth/register`
- [ ] After 5 failed attempts → lock account for 15 min (store `failed_attempts`, `locked_until` in users table)
- [ ] Implement `POST /auth/forgot-password` (generate token, email placeholder)
- [ ] Implement `POST /auth/reset-password` (verify token, update password)

### 7.3 Data Security (1 SP)
- [ ] Set `SESSION_COOKIE_SECURE=True`, `SESSION_COOKIE_HTTPONLY=True`, `SESSION_COOKIE_SAMESITE=Strict`
- [ ] Add HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [ ] `DELETE /api/users/me` - soft-delete (set status='deactivated') with cascade to projects
- [ ] Audit log table: `audit_logs(id, user_id, action, resource_type, resource_id, metadata, timestamp)`
- [ ] Privacy policy page in frontend (`/privacy`)

---

## PRIORITY 8: Monitoring & Logging - 3 SP

### 8.1 Logging (1.5 SP)
- [ ] `pip install python-json-logger`
- [ ] Configure logger in `app/config.py`:
  ```python
  logging.basicConfig(
      format='{"timestamp":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}',
      level=logging.INFO
  )
  ```
- [ ] Middleware to log each request:
  ```python
  @app.middleware("http")
  async def log_requests(request: Request, call_next):
      start = time.time()
      response = await call_next(request)
      duration = time.time() - start
      logger.info({
          "method": request.method,
          "path": request.url.path,
          "status": response.status_code,
          "duration_ms": round(duration*1000, 2),
          "user_id": getattr(request.state, 'user_id', None)
      })
      return response
  ```
- [ ] Log important events: user login/logout, project created/deleted, transcription completed

### 8.2 Error Tracking (1 SP)
- [ ] Sign up for [Sentry](https://sentry.io) (free tier)
- [ ] `pip install sentry-sdk[fastapi]`
- [ ] Initialize in `main.py`:
  ```python
  import sentry_sdk
  sentry_sdk.init(dsn=os.getenv("SENTRY_DSN"), traces_sample_rate=1.0)
  ```
- [ ] Frontend: `npm install @sentry/react @sentry/tracing`
- [ ] Initialize in `main.tsx` with DSN from env
- [ ] Test: throw error → verify appears in Sentry dashboard

### 8.3 Health & Uptime (0.5 SP)
- [ ] `GET /health` checks:
  ```python
  @app.get("/health")
  async def health():
      try:
          # Test DB
          db.execute(text("SELECT 1"))
          return {"status": "ok", "database": "connected"}
      except:
          return {"status": "error", "database": "disconnected"}, 500
  ```
- [ ] Sign up for UptimeRobot (free)
- [ ] Add monitor: `https://your-app.com/health` every 5 min
- [ ] Set email alert if down > 2 min

---

## PRIORITY 9: Documentation - 3 SP

### 9.1 API Documentation (1.5 SP)
- [ ] FastAPI auto-generates OpenAPI at `/docs` and `/redoc`
- [ ] Enhance with descriptions, examples:
  ```python
  @router.post("/register", summary="Register new user", response_description="User created")
  ```
- [ ] Add example request/response bodies in docstrings
- [ ] Group endpoints with `@router.tags(["auth"])`
- [ ] Add security scheme in `app/main.py`:
  ```python
  app.openapi_schema = ...
  ```
- [ ] Test all examples in Swagger UI

### 9.2 Developer README (1 SP)
- [ ] Create root `README.md` (not frontend/README.md)
- [ ] Include:
  - Project overview & screenshots
  - Tech stack (table)
  - Architecture diagram
  - Local setup (frontend + backend)
  - Environment variables (`.env.example`)
  - Database migrations
  - Running tests
  - Deployment steps
  - Troubleshooting (common errors + fixes)
  - API endpoint summary (or link to `/docs`)
- [ ] `CONTRIBUTING.md` (how to submit PRs)
- [ ] `CODE_OF_CONDUCT.md` (standard template)

### 9.3 In-Code Docs (0.5 SP)
- [ ] Add docstrings to all functions (Google style)
- [ ] Add JSDoc to frontend functions (types, params, returns)
- [ ] Document complex logic (audio analysis algorithm, alignment strategy)

**Deliverable:** Complete documentation suite

---

## 🎯 Immediate Next Steps (First Week)

**Day 1-2: Backend Foundation**
1. Create backend folder structure
2. Set up FastAPI + CORS + health endpoint
3. Install PostgreSQL + create DB
4. Write initial migration (users table + indexes)
5. Run `alembic upgrade head`

**Day 3-4: Auth System**
6. Implement `/auth/register` and `/auth/login`
7. JWT token generation + verification
8. Test with Postman/curl (register → login → get /me with token)
9. Add rate limiting
10. Add password hashing

**Day 5: Integration & Testing**
11. Connect frontend login form to backend
12. Verify token storage + protected routes
13. Write unit tests for auth service
14. Write integration tests for auth endpoints

**Week 2 Preview:**
15. Project CRUD API
16. File upload to local disk
17. Frontend dashboard integration with real projects
18. Gemini AI transcription endpoint

---

## 🔄 Dependencies & Order

```
Phase A (Week 1):
  DB setup → Auth → Test Auth → Connect Frontend

Phase B (Week 2):
  Project CRUD → File upload → Dashboard API → Dashboard frontend

Phase C (Week 3):
  Gemini integration (backend) → Transcription endpoint
  Frontend transcribe button → polling → display transcript

Phase D (Week 4):
  Alignment endpoint → frontend sync → segment editor ready
  Auto-save draft → recover on reload

Phase E (Week 5):
  Video export endpoint async
  Usage tracking
  Admin stats & user management

Phase F (Week 6):
  Polish: error boundaries, toasts, skeletons
  Security hardening
  Manual QA testing

Phase G (Week 7-8):
  Write tests (unit + integration)
  Deploy to staging
  End-to-end testing
  Deploy to production
```

---

## ✅ MVP Definition (Minimum Viable Product)

**User Flow:** Sign up → Login → Upload audio → Transcribe with AI → Align captions → Edit → Export SRT & Video → View history

**Must-Have:**
- [x] Authentication (register, login, logout, JWT)
- [ ] Project persistence (CRUD)
- [ ] Audio file storage (local disk)
- [ ] AI transcription (backend Gemini)
- [ ] AI alignment (backend Gemini)
- [ ] Caption editor (already built)
- [ ] SRT export (already built)
- [ ] Video export (already built) ✓
- [ ] User dashboard with history
- [ ] Admin panel with user list & stats
- [ ] Token usage tracking

**Out of Scope (Post-MVP):**
- Docker, CI/CD, email, billing, teams, mobile, advanced monitoring, legal docs, performance optimization

---

## 📊 Success Criteria

**Technical:**
- [ ] All 112 core tasks complete
- [ ] API response time p95 < 500ms (excluding AI which depends on Gemini)
- [ ] Frontend Lighthouse >85
- [ ] Test coverage: Backend 80%+, Frontend 70%+
- [ ] Zero critical security vulnerabilities
- [ ] Production deployment accessible

**Functional:**
- [ ] 10 beta users can complete full workflow without assistance
- [ ] No data loss on refresh (auto-save works)
- [ ] Transcription accuracy acceptable (>85% word accuracy)
- [ ] Video export succeeds for 90% of test videos

---

**Next Action:** Start with **Priority 1.1** - set up backend project structure and database.

**All deferred work** (Docker, CI/CD, monitoring, legal, etc.) tracked separately in `non-core-tasks.md`.
