# AI-Transcribe: System & Feature Workflows

## Table of Contents
1. [User Journey Workflow](#user-journey-workflow)
2. [Feature Interaction Flow](#feature-interaction-flow)
3. [Technical Data Flow](#technical-data-flow)
4. [Development Workflow](#development-workflow)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Deployment Process](#deployment-process)
7. [Monitoring & Alerting](#monitoring--alerting)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## User Journey Workflow

### New User Onboarding Flow

```
Landing (Home Page) 
    ↓
[Public - No auth required]
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Upload Audio File (MP3/WAV)                                │
│  └─► Creates object URL → WaveSurfer visualization         │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Choose Path:                                              │
│  ┌─────────────────────────┬─────────────────────────────┐ │
│  │ Path A: AI Transcription│ Path B: Manual Analysis     │ │
│  │ 1. Click "Transcribe"   │ 1. Click "Auto-Detect"     │ │
│  │ 2. Gemini API returns   │ 2. Web Audio API analyzes   │ │
│  │    full transcript      │ 3. Creates empty segments    │ │
│  │ 3. Language detected    │ 4. User manually types text │ │
│  └─────────────────────────┴─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Smart AI Sync (Alignment)                                 │
│  └─► Audio + Transcript → Gemini → Segments with timestamps│
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Caption Editor                                            │
│  └─► Edit text, adjust times, merge/split, undo/redo       │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Decision Point:                                           │
│  ┌──────────────────┬─────────────────┬─────────────────┐  │
│  │ Need quick capt? │ Need fancy video?│ Need to save?  │  │
│  │ → Export SRT     │ → Go to Studio  │ → Save Project  │  │
│  └──────────────────┴─────────────────┴─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Studio mode OR Download/Export                            │
│  ├─► Studio: Render with effects → Record → Export Video  │
│  └─► Export: SRT file downloaded to local machine          │
└─────────────────────────────────────────────────────────────┘
    ↓
    END
```

### Authenticated User Full Workflow

```
[User visits site]
    ↓
Is Authenticated?
├─► NO ──► Show Landing + Upload (limited features)
│            │
│            └─► Prompt to Sign Up / Login
│
YES (Logged In)
    ↓
┌───────────────────────────────────────────────────────────────┐
│  Dashboard View                                               │
│  └─► See: Project History, Token Usage, Plan Status          │
└───────────────────────────────────────────────────────────────┘
    ↓
Create New Project ──► Same flow as above ──► Save Project
    │                                                    │
    │                                                    └─► Project appears in Dashboard history
    │
    └─► Load Existing Project
            └─► Fetch from API ──► Restore segments ──► Edit
```

### Admin User Workflow

```
/admin route
    ↓
Admin Authentication Required? (JWT + admin role)
├─► NO ──► Redirect to /login
│
YES
    ↓
┌───────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                              │
│  ├─► Stats Overview (users, revenue, tokens)                 │
│  ├─► Usage Charts (7-day trends)                             │
│  └─► User Management Table                                   │
│       ├─► Search users (name/email)                          │
│       ├─► Filter by plan/status                              │
│       ├─► Activate/Deactivate users                          │
│       └─► View individual user details                       │
└───────────────────────────────────────────────────────────────┘
    ↓
(Optional) Export reports
    ↓
Logout
```

---

## Feature Interaction Flow

### Transcription Pipeline

```
User Action: "Transcribe Audio (AI)" button click
    ↓
Frontend checks:
├─► Is audio file loaded? (yes/no)
├─► Is Gemini API key present? (.env)
└─► Is user authenticated? (optional for now)
    ↓
Prepare audio data:
├─► Read File → ArrayBuffer
├─► Convert to Base64
└─► Validate MIME type (audio/*)
    ↓
Call Gemini API:
Request: {
  model: "gemini-3.1-pro-preview",
  contents: [{
    parts: [
      { text: "Analyze this audio..." },
      { inlineData: { mimeType, data: base64 } }
    ]
  }],
  config: { responseMimeType: "application/json" }
}
    ↓
Gemini processes audio (10-30 seconds typical)
    ↓
Response received:
{
  "language": "Hinglish",
  "transcript": "Full transcribed text..."
}
    ↓
Frontend updates state:
├─► setTranscript(response.transcript)
├─► setDetectedLanguage(response.language)
└─► Switch to 'transcript' tab automatically
    ↓
User clicks "Smart AI Sync" button
    ↓
Prepare alignment request:
├─► Audio: same base64
├─► Transcript: from state
└─► Prompt: "PERFORM PRECISION FORCED ALIGNMENT..."
    ↓
Call Gemini API (alignment)
    ↓
Response received:
{
  "segments": [
    { "start": 1.45, "end": 3.21, "text": "Hello world" },
    ...
  ]
}
    ↓
Frontend processes segments:
├─► Map each segment → add unique ID
├─► Parse float timestamps
├─► Sort by start time
└─► setSegments(newSegments)
    ↓
Undo stack initialized with initial state
    ↓
Display segments in Caption Editor grid
```

### Video Export Pipeline

```
User Action: "Export MOV" button click (in Studio)
    ↓
Pre-export checks:
├─► Is recording already in progress? (prevent double)
├─► Are segments present? (warn if empty)
├─► Is audio loaded? (need duration)
└─► Is canvas ready?
    ↓
Start Recording Flow:
├─► Create canvas stream: canvas.captureStream(30fps)
├─► Set up MediaRecorder (VP9 codec, 8Mbps)
├─► Clear canvas to transparent
├─► Set wavesurfer to time=0
├─► Start playback (wavesurfer.play())
├─► MediaRecorder.start(100ms chunks)
└─► UI: isRecording = true, show REC badge
    ↓
Real-time rendering:
┌─────────────────────────────────────────────┐
│  requestAnimationFrame loop                 │
│  ├─► Get currentTime from wavesurfer        │
│  ├─► Find active segment at currentTime     │
│  ├─► Apply transition effects               │
│  ├─► Clear canvas                           │
│  ├─► Draw text with styling                 │
│  └─► Repeat every frame (~16ms)             │
└─────────────────────────────────────────────┘
    ↓
When playback reaches end (currentTime >= duration):
    ↓
Stop Recording:
├─► wavesurfer.pause()
├─► mediaRecorder.stop()
└─► UI: isRecording = false
    ↓
MediaRecorder onstop event:
├─► Collect Blob chunks → WebM blob
└─► Set isExporting = true, show progress modal
    ↓
FFmpeg.wasm Processing:
├─► Load FFmpeg core (from unpkg CDN)
├─► Write input.webm to FFmpeg FS
├─► Execute: ffmpeg -i input.webm -c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le -qscale 11 -vendor apl0 output.mov
├─► Monitor FFmpeg logs → parse time=XX:XX:XX.XX → update progress bar
└─► Read output.mov from FS
    ↓
Create MOV blob → Create download URL → Auto-click download link
    ↓
Cleanup:
├─► Revoke object URL
├─► Set isExporting = false
└─► Reset progress bar
    ↓
Fallback (if FFmpeg fails):
└─► Direct WebM download (captions-alpha-fallback.webm)
```

### Undo/Redo System

```
State change detected (segments, font, colors, etc.)
    ↓
Debounce: wait 500ms (avoid flooding on every keystroke)
    ↓
Compare with last state in undoStack:
├─► Same? → Do nothing (skip push)
└─► Different? → Push to undoStack (keep last 50 states)
    ↓
Clear redoStack (new branch)
    ↓
User clicks Undo button:
├─► Check: undoStack.length > 1? (yes → proceed)
├─► Pop current state → push to redoStack
├─► Pop previous state → applyState()
└─► Decrement undoStack
    ↓
applyState(previousState):
├─► setSegments(prevState.segments)
├─► Set all styling states (...fontFamily, fontSize, etc.)
└─► UI updates to previous snapshot
    ↓
User clicks Redo button:
├─► Check: redoStack.length > 0
├─► Pop from redoStack → applyState()
└─► Push current to undoStack
```

### Segment Merge & Split

**Merge Workflow:**
```
User selects 3+ segments (checkboxes)
    ↓
Click "Merge (3)" button
    ↓
Validation: selectedSegmentIds.size >= 2? yes → proceed
    ↓
Filter segments array → get selected ones
    ↓
Sort selected by start time
    ↓
Create mergedSegment:
├─► id: crypto.randomUUID()
├─► start: first.start
├─► end: last.end
├─► text: join all selected.text with spaces
    ↓
setSegments():
├─► Filter out selected segments
├─► Add mergedSegment
├─► Sort all by start time
└─► Clear selection
```

**Split Workflow (per segment):**
```
User clicks "Split" icon on segment card
    ↓
Get segment.text
    ↓
Split by spaces → words array
    ↓
Validation: words.length > 1? yes → proceed
    ↓
Calculate wordDuration = (segment.end - segment.start) / words.length
    ↓
Create newSegments array:
For each word at index i:
├─► id: crypto.randomUUID()
├─► start: segment.start + (i * wordDuration)
├─► end: segment.start + ((i+1) * wordDuration)
├─► text: word
    ↓
setSegments():
├─► Filter out original segment
├─► Add all new word-segments
├─► Sort by start time
└─► Update UI
```

### Auto-Detect (Audio Analysis) Flow

```
User clicks "Auto-Detect Timings" button
    ↓
Preconditions: audioFile exists
    ↓
isAnalyzing = true
    ↓
Create Web Audio Context:
├─► new (window.AudioContext || webkitAudioContext)()
├─► decodeAudioData(arrayBuffer)
└─► Get channelData[0] (mono)
    ↓
Audio Profiling Phase (50ms chunks):
├─► Calculate RMS (Root Mean Square) values
├─► Sort RMS values
├─► noiseFloor = 10th percentile
├─► peakVolume = 95th percentile
└─► Auto-calculate parameters:
    ├─► threshold = noiseFloor + (peakVolume - noiseFloor) * 0.15
    ├─► minSilence = 0.05s
    ├─► minSpeech = 0.08s
    └─► padding = 0.04s
    ↓
Update UI sliders to show auto-detected values
    ↓
Detection Phase (10ms resolution):
┌─────────────────────────────────────────────────────┐
│  Loop through audio samples in steps:               │
│  ├─► Calculate RMS for current 10ms chunk           │
│  ├─► RMS > threshold?                               │
│  │   ├─► YES → entering speech region               │
│  │   │       speechStart = time - padding           │
│  │   └─► NO                                          │
│  │       └─► Already in speech?                      │
│  │           ├─► YES → check silence duration        │
│  │           │   └─► silenceDuration >= minSilence?  │
│  │           │       └─► YES → create segment        │
│  │           │           (speechStart → silenceStart+padding) │
│  │           └─► NO → continue silent               │
│  └─► Track silenceStart timestamp                    │
└─────────────────────────────────────────────────────┘
    ↓
After loop: Handle trailing speech (if still inSpeech)
    ↓
setSegments(newSegments)
    ↓
isAnalyzing = false
```

### Sync All Segments (Re-alignment)

```
User edits segment texts manually → timestamps may be wrong
    ↓
Click "Auto Sync" button (in Caption Editor toolbar)
    ↓
Prepare segments JSON: segments.map(s => ({start, end, text}))
    ↓
Call Gemini API with prompt:
"I have an audio file and its current caption segments.
 CURRENT SEGMENTS: [JSON array]
 CRITICAL TASK: RE-SYNCHRONIZE TIMINGS
 1. Keep EXACT text for each segment
 2. Match to precise audio timestamp
 3. Provide exact start/end times
 4. Ensure NO overlaps"
    ↓
Gemini returns corrected segments
    ↓
Frontend:
├─► Sort by start time
├─► Assign new IDs (seg-sync-{timestamp}-{index})
├─► Parse float timestamps
└─► setSegments(sortedNewSegments)
    ↓
UI updates with synchronized timing
```

---

## Technical Data Flow

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            BROWSER (Client)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ React App (TypeScript + Vite + TailwindCSS)                     │   │
│  │                                                                 │   │
│  │  ┌─────────────────┐    ┌──────────────────┐                   │   │
│  │  │   Components    │    │     Hooks        │                   │   │
│  │  │                 │    │                  │                   │   │
│  │  │ • App.tsx      │    │ • useState      │                   │   │
│  │  │ • VideoStudio  │    │ • useEffect     │                   │   │
│  │  │ • Timeline     │    │ • useRef        │                   │   │
│  │  │ • AuthPage     │    │ • useCallback   │                   │   │
│  │  │ • Dashboard    │    │ • useNavigate   │                   │   │
│  │  └────────┬────────┘    └────────┬────────┘                   │   │
│  │           │                       │                            │   │
│  │           └───────────┬───────────┘                            │   │
│  │                       │                                         │   │
│  │  ┌───────────────────▼───────────────────┐                     │   │
│  │  │         State Management              │                     │   │
│  │  │  segments, audioUrl, transcript,      │                     │   │
│  │  │  fontFamily, fontSize, isRecording    │                     │   │
│  │  └───────────────────┬───────────────────┘                     │   │
│  │                       │                                         │   │
│  │  ┌───────────────────▼───────────────────┐                     │   │
│  │  │         External Libraries            │                     │   │
│  │  │  • WaveSurfer.js (audio)              │                     │   │
│  │  │  • @google/genai (Gemini API)         │                     │   │
│  │  │  • FFmpeg.wasm (video export)         │                     │   │
│  │  │  • React Router DOM                   │                     │   │
│  │  │  • Lucide Icons                       │                     │   │
│  │  │  • Recharts (charts)                  │                     │   │
│  │  └───────────────────┬───────────────────┘                     │   │
│  │                       │                                         │   │
│  │  ┌───────────────────▼───────────────────┐                     │   │
│  │  │       Browser Web APIs                │                     │   │
│  │  │  • Web Audio API (analysis)           │                     │   │
│  │  │  • Canvas 2D (preview)                │                     │   │
│  │  │  • MediaRecorder (capture)            │                     │   │
│  │  │  • File API (uploads)                 │                     │   │
│  │  └───────────────────────────────────────┘                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │         Data Layer (In-Memory Only - No Persistence)           │    │
│  │  • useState for all reactive state                             │    │
│  │  • undoStack/redoStack for history                             │    │
│  │  • URL.createObjectURL for audio blob                           │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    External Services                            │    │
│  │  ┌─────────────────┐         ┌──────────────────┐              │    │
│  │  │ Google Gemini   │         │  FFmpeg Core     │              │    │
│  │  │   API Direct    │         │  (WASM from      │              │    │
│  │  │  (⚠️ EXPOSED!)  │         │   unpkg CDN)     │              │    │
│  │  └────────┬────────┘         └────────┬─────────┘              │    │
│  │            │                           │                         │    │
│  │            └───────────┬───────────────┘                         │    │
│  │                        │                                         │    │
│  │  ⚠️  NO BACKEND PROXY - API key exposed in .env                 │    │
│  │  ⚠️  NO PERSISTENCE - Data lost on refresh                     │    │
│  │  ⚠️  NO AUTH MIDDLEWARE - Mocked only                           │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### State Management Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         App.tsx (Main State)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Core States:                                                       │
│  ├─► audioFile: File | null                                         │
│  ├─► audioUrl: string | null (object URL)                           │
│  ├─► segments: CaptionSegment[] (array)                             │
│  ├─► transcript: string                                             │
│  ├─► isTranscribing: boolean                                        │
│  ├─► isAligning: boolean                                            │
│  ├─► currentTime: number (seconds)                                  │
│  ├─► duration: number                                               │
│  └─► detectedLanguage: string | null                                │
│                                                                     │
│  Studio States:                                                     │
│  ├─► fontFamily: string                                             │
│  ├─► fontSize: number                                               │
│  ├─► fontColor: string (hex)                                        │
│  ├─► strokeColor: string (hex)                                      │
│  ├─► strokeWidth: number                                            │
│  ├─► textShadow: boolean                                            │
│  ├─► textAlign: 'left' | 'center' | 'right'                         │
│  ├─► textPosition: number (%)                                       │
│  ├─► transitionType: string                                         │
│  └─► isRecording: boolean                                           │
│                                                                     │
│  History States:                                                    │
│  ├─► undoStack: HistoryState[] (max 50)                             │
│  └─► redoStack: HistoryState[]                                      │
│                                                                     │
│  Derived States:                                                    │
│  └─► activeTab: 'captions' | 'transcript' | 'studio'               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ Passed as props
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   Component Tree (Props Drilling)                   │
├─────────────────────────────────────────────────────────────────────┤
│  App.tsx                                                           │
│    ├─► Layout (nav, outlet)                                        │
│    ├─► UserDashboard                                               │
│    ├─► ProfileSettings                                             │
│    ├─► AuthPage                                                    │
│    ├─► AdminDashboard                                              │
│    ├─► MainApp (embedded routes)                                   │
│    │    ├─► Caption Editor (transcript + segments list)            │
│    │    └─► VideoStudio (canvas + timeline + controls)             │
│    └─► WaveSurfer instance (ref)                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### API Call Diagram (Current vs Planned)

```
CURRENT STATE (Frontend-only, mocked):
┌──────────────┐
│   Browser    │
│   (React)    │
└──────┬───────┘
       │
       ├─► Direct call to Gemini API (client-side)
       │   ⚠️  API key exposed in bundle
       │   ⚠️  No rate limiting or auth
       │
       ├─► Mock "API calls" with setTimeout
       │   └─► AuthPage: simulate 1.5s delay, then redirect
       │   └─► AdminDashboard: hardcoded mock data
       │   └─► UserDashboard: hardcoded history array
       │
       └─► No file upload (local blob URLs only)
           └─► No persistent storage

───────────────────────────────────────────────────────────────────────

FUTURE STATE (Full-stack, secure):
┌──────────────┐
│   Browser    │
│   (React)    │
└──────┬───────┘
       │
       │ HTTPS requests (with JWT in cookie/header)
       ↓
┌──────────────┐
│  FastAPI     │
│  Backend     │
│  (Python)    │
└──────┬───────┘
       │
       ├─► Auth Routes (/api/auth/*)
       │   └─► Validate credentials → JWT token
       │
       ├─► Project Routes (/api/projects/*)
       │   ├─► Upload audio → S3
       │   ├─► Save project metadata → PostgreSQL
       │   └─► Queue transcription job (Celery)
       │
       ├─► Gemini API (server-side)
       │   └─► Key stored securely in environment (NOT exposed)
       │
       ├─► File Storage (S3/GCS)
       │   └─► Store audio files + exports
       │
       ├─► Database (PostgreSQL)
       │   ├─► Users
       │   ├─► Projects
       │   ├─► Usage logs
       │   └─► Subscriptions
       │
       ├─► Redis (cache + task queue)
       │   └─► Background workers for video export
       │
       └─► Webhooks (Stripe, email service)
```

---

## Development Workflow

### Git Workflow (GitFlow-inspired)

```
main (production-ready) [protected]
   │
   ├─► Tags: v1.0.0, v1.1.0, v2.0.0
   │
   ├─► Hotfix branches (for critical bugs)
   │   └─► hotfix/xxx → merge to main + develop
   │
   └─► Release branches (for releases)
       └─► release/v1.2.0 → merge to main + develop

develop (integration branch) [protected]
   │
   ├─► Feature branches (for each feature)
   │   └─► feature/backend-auth
   │   └─► feature/video-export
   │   └─► feature/stripe-integration
   │
   ├─► Bugfix branches
   │   └─► fix/alignment-bug
   │
   └─► Chore branches (infra, CI/CD, docs)
       └─► chore/ci-pipeline

Feature Branch Lifecycle:
1. Create: git checkout -b feature/xxx develop
2. Develop: commit often (atomic commits)
3. Test: ensure all tests pass locally
4. PR: push → open PR to develop
5. Review: at least 1-2 reviewers
6. CI: all checks pass
7. Merge: squash & merge to develop
8. Delete: feature branch auto-deleted
```

### Code Standards

**Frontend:**
- TypeScript strict mode
- ESLint + Prettier
- Components in PascalCase
- Files: `.tsx` for React, `.ts` for utilities
- 2-space indentation, single quotes
- TailwindCSS utilities order: layout → spacing → typography → colors

**Backend:**
- Python 3.12+
- Black formatter (line length 88)
- Type hints (PEP 484)
- Pydantic v2 for schemas
- SQLAlchemy 2.0+ (async if needed)
- Alembic for migrations
- docstrings (Google style)

**Commits:**
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Imperative mood: "Add auth middleware" not "Added auth middleware"
- Scope in parentheses: `feat(auth): add JWT token refresh`

**Pull Requests:**
- Title: Conventional Commit format
- Description: What/Why/How + screenshots (if UI)
- Linked issue:Closes #123
- Must pass CI checks
- Requires 1 review approval (2 for critical)

---

## CI/CD Pipeline

### GitHub Actions Workflow

**.github/workflows/ci.yml** (Continuous Integration)

```yaml
name: CI

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop]

jobs:
  lint-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - with: { node-version: '20' }
      - run: cd frontend && npm ci
      - run: cd frontend && npm run test

  build-frontend:
    runs-on: ubuntu-latest
    needs: [lint-frontend, test-frontend]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - uses: actions/upload-pages-artifact@v3
        if: github.ref == 'refs/heads/main'
        with:
          path: frontend/dist/

  lint-backend:
    runs-on: ubuntu-latest
    if: github.event_name != 'push' || github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: cd backend && pip install black flake8 mypy
      - run: cd backend && black --check .
      - run: cd backend && flake8 .
      - run: cd backend && mypy app/ --ignore-missing-imports

  test-backend:
    runs-on: ubuntu-latest
    needs: lint-backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: cd backend && pip install -r requirements-dev.txt
      - run: cd backend && pytest tests/ -v --cov=app

  docker-build:
    runs-on: ubuntu-latest
    needs: [lint-backend, test-backend]
    if: github.event_name != 'push' || github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && docker build -t ai-transcribe-backend:latest .
```

### CD (Continuous Deployment)

**.github/workflows/deploy.yml**

```yaml
name: Deploy

on:
  push:
    tags: ['v*']

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        run: |
          echo "Deploying backend to Railway..."
          # railway deploy --detect

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

---

## Deployment Process

### Environment Strategy

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Local Dev  │    │ Staging     │    │ Production  │
│             │    │             │    │             │
│ .env.local  │    │ .env.staging│    │ .env.prod  │
│             │    │             │    │             │
│ DB: local   │    │ DB: cloud   │    │ DB: cloud  │
│            │    │             │    │            │
│ • FastAPI   │    │ • FastAPI   │    │ • FastAPI  │
│ • Vite dev  │    │ • Docker    │    │ • Docker   │
│ • Mock data │    │ • Test API  │    │ • Real API │
└─────────────┘    └─────────────┘    └─────────────┘
        │                  │                   │
        └──────────────────┴───────────────────┘
                           │
                    CI/CD Pipeline
```

### Step-by-Step Deployment

**1. Local Development:**
```bash
# Frontend
cd frontend
npm install
echo "GEMINI_API_KEY=dev_key" > .env.local  # personal key
npm run dev  # http://localhost:3000

# Backend (when ready)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload  # http://localhost:8000
```

**2. Staging Deployment:**
```bash
# Push to develop branch triggers:
# 1. Build backend Docker image
# 2. Push to container registry (GHCR/ECR)
# 3. Deploy to staging environment (Railway/Render preview)
# 4. Run database migrations
# 5. Smoke tests (health check endpoint)
# 6. Report status to PR
```

**3. Production Deployment:**
```bash
# Tag release: git tag v1.0.0 && git push --tags
# Triggers:
# 1. Build & push backend Docker image with tag
# 2. Deploy to production (zero-downtime strategy)
#    - Rolling update (K8s) OR
#    - Blue-green (two deployments, switch load balancer)
# 3. Run migrations
# 4. Warm up cache
# 5. Health check pass → mark healthy
# 6. Deploy frontend (Vercel/Netlify auto-deploy on main)
# 7. Invalidate CDN cache (if any)
# 8. Smoke tests in production
# 9. Notify team (Slack/Discord)
```

**4. Rollback Plan:**
```bash
# If production issues detected:
# Option A: Git rollback
git revert <bad-commit>
git push

# Option B: Docker rollback
docker service update --rollback ai-transcribe-backend

# Option C: Vercel rollback
# (Vercel automatically keeps previous deployments)
# Click "Deployments" → "Promote" previous version
```

---

## Monitoring & Alerting

### Application Metrics

```
┌─────────────────────────────────────────────────────────┐
│                     Metrics Collected                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (via Google Analytics / custom):             │
│  ├─► Page views (per route)                            │
│  ├─► User engagement (time on page)                    │
│  ├─► Feature usage (clicks on Transcribe, Studio, etc)│
│  ├─► Conversion rates (visitor → signup)               │
│  ├─► Error rates (JS errors)                           │
│  └─► Performance (Core Web Vitals: LCP, FID, CLS)     │
│                                                         │
│  Backend (via Prometheus / Grafana):                   │
│  ├─► Request rate (requests/sec)                       │
│  ├─► Response time (p50, p95, p99)                     │
│  ├─► Error rate (4xx, 5xx)                             │
│  ├─► Token consumption per user/project                │
│  ├─► Active users (DAU, WAU, MAU)                      │
│  ├─► Gemini API latency & cost                         │
│  ├─► Database connection pool usage                    │
│  ├─► Queue length (Celery tasks)                       │
│  └─► System resources (CPU, RAM, Disk)                 │
│                                                         │
│  Infrastructure (cloud provider):                      │
│  ├─► Uptime (ping every 1 min)                         │
│  ├─► SSL certificate expiry                             │
│  ├─► Disk usage                                        │
│  └─► Network throughput                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Alerting Rules

| Severity | Condition | Notification | SLA |
|----------|-----------|-------------|-----|
| **Critical** (P0) | Service down (5xx > 5 min) | PagerDuty + Slack @channel | < 5 min |
| **High** (P1) | Error rate > 5% for 10 min | Slack #alerts | < 30 min |
| **Medium** (P2) | Response time p95 > 2s | Slack #alerts | < 2 hrs |
| **Low** (P3) | Disk usage > 85% | Email | < 24 hrs |

### Logging Structure

```json
{
  "timestamp": "2026-04-18T12:34:56.789Z",
  "level": "INFO",
  "service": "ai-transcribe-backend",
  "environment": "production",
  "request_id": "uuid-v4",
  "user_id": "uuid-v4" (if authenticated),
  "endpoint": "/api/projects/123/transcribe",
  "method": "POST",
  "status_code": 200,
  "duration_ms": 2543,
  "tokens_used": 1250,
  "ai_model": "gemini-3-flash",
  "message": "Transcription completed"
}
```

---

## Troubleshooting Guide

### Common Frontend Issues

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| `GEMINI_API_KEY not found` | `.env.local` missing or wrong location | Create `.env.local` in `frontend/` directory |
| `WaveSurfer not loading` | Container element missing or zero width | Ensure waveformRef container is mounted, check CSS |
| `FFmpeg failed to load` | CSP blocking CDN, no internet | Check network, unpkg.com accessibility |
| `Audio context suspended` | Browser autoplay policy | User gesture required (click) to resume audio context |
| `Canvas appears blank` | Text color matches background, font not loaded | Verify colors, add font loading wait |
| `Cannot read property 'play' of undefined` | wavesurfer ref not initialized yet | Check `wavesurfer.current` exists before calling |

### Common Backend Issues (When Implemented)

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| 403 Forbidden | CORS not configured | Add `CORSMiddleware` in FastAPI |
| 401 Unauthorized | Invalid/missing JWT | Verify token in Authorization header |
| 413 Payload Too Large | Audio file exceeds limit | Increase `--client-max-body-size` or reject early |
| 500 Internal Error | Gemini API key invalid | Check env var, test API in isolation |
| Database connection error | Pool exhausted or wrong credentials | Check DB connection string, increase pool size |
| Celery task stuck | Redis down or worker crashed | Restart worker, check Redis logs |
| File upload fails | S3 permissions/bucket not exist | Verify AWS credentials, bucket region |
| Slow transcription | Gemini API latency | Add timeout, retry logic, queue for async |

### Debugging Steps

**Frontend:**
1. Open DevTools → Console (check errors)
2. Network tab → inspect API calls
3. Application → Storage → check localStorage/cookies
4. Disable extensions (ad blockers may interfere)
5. Hard refresh (Ctrl+Shift+R)

**Backend:**
1. Check logs: `docker logs <container>` or `journalctl -u service`
2. Health endpoint: `curl http://localhost:8000/health`
3. Test API directly: `curl -X POST http://localhost:8000/api/projects/test`
4. Check Redis: `redis-cli ping`
5. Database: `psql -h localhost -U user -d db -c "\dt"`
6. Verify env vars: `printenv | grep -i "API_KEY\|DATABASE"`

---

## Feature Dependencies Graph

```
Backend Setup (BLOCKER)
├─► Database (PostgreSQL)
│   └─► Users, Projects, Usage tables
├─► File Storage (S3/GCS)
│   └─► Audio upload/download endpoints
└─► API Endpoints (FastAPI)
    └─► All REST routes

        ↓

Authentication (Prerequisite for most features)
├─► JWT system
├─► Login/Register endpoints
├─► Protected route middleware
└─► User session management

        ↓

Core Features Enablement:
├─► Project Persistence ──► Save/Load projects
├─► Token Tracking ────────► Usage limits & billing
├─► Admin API ─────────────► User management
└─► Real History ─────────► Dashboard displays actual data

        ↓

Advanced Features:
├─► Async Task Queue ─────► Background video export
├─► Email Service ────────► Password reset, verification
├─► Stripe Integration ───► Subscriptions & payments
└─► Analytics ────────────► Usage insights, funnels
```

---

## Data Retention & Backup Policy

### Backup Frequency
- **Database**: Daily automated backups (retained 30 days) + WAL archiving
- **Audio Files**: S3 versioning enabled + Cross-Region Replication (optional)
- **User Exports**: Not stored (user downloads locally)

### Retention Periods
- **Active user data**: Indefinite (as long as account active)
- **Deleted accounts**: Hard delete after 30 days (or anonymize)
- **Audio files**: Delete when parent project deleted
- **Export files**: Ephemeral (user downloads, not stored)
- **Logs**: 90 days (application), 1 year (audit logs)

### Recovery Procedures
1. Database restore: `pg_restore` from latest backup
2. Point-in-time recovery (PITR) available via WAL
3. S3 file restore: Versioning allows recovery of deleted objects
4. Test restores monthly (disaster recovery drill)

---

## Change Log

**v1.0** (2026-04-18) - Initial comprehensive feature documentation
- Created features.md with all completed & remaining work
- Created Workflow.md with system flows
- Analyzed 2163-line App.tsx, all 6 components
- Identified 13 major work streams, 100+ tasks

---

**Document maintainers:** @bhavan (project owner)  
**Last reviewed:** 2026-04-18  
**Next review:** 2026-05-18 (monthly)
