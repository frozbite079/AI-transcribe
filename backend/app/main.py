"""
Main FastAPI application entry point.
Configures CORS, middleware, and includes routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers.auth import router as auth_router
from app.routers.projects import router as projects_router
from app.routers.ai import router as ai_router
from app.routers.usage import router as usage_router

app = FastAPI(
    title="AI-Transcribe API",
    version="1.0.0",
    description="Backend API for AI-powered audio transcription",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS (allow frontend origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/health")
async def health_check():
    return {"status": "ok"}


# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(usage_router, prefix="/api/v1/usage", tags=["usage"])
