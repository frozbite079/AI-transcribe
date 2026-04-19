"""
AI service: transcribe audio and align transcript using Gemini API.
"""

import os
import base64
import uuid
from google import genai
from google.genai import types
from app.config import settings
from app.models.project import Project
from app.database import SessionLocal
from sqlalchemy.orm import Session
from app.repositories import create_usage_log, update_project
from typing import Optional


# Initialize Gemini client
_client: Optional[genai.Client] = None


def get_gemini_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def transcribe_audio(
    db: Session,
    project_id: uuid.UUID,
    audio_path: str,
    mime_type: str = "audio/mpeg",
    model: str = "gemini-2.0-flash-exp",
) -> tuple[str, str]:
    """
    Send audio to Gemini for transcription.
    Returns (transcript, detected_language).
    """
    client = get_gemini_client()

    # Read audio file
    with open(audio_path, "rb") as f:
        audio_bytes = f.read()
    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

    prompt = """
    Analyze this audio file.
    1. Detect the language of the speech. If it's a mix of Hindi and English, call it "Hinglish".
    2. Provide a full, accurate transcript of the speech.
    3. CRITICAL: Use "Hinglish" formatting. If the speaker says a Hindi word, write it in Hindi (Devanagari script). If they say an English word, write it in English (Latin script).
    4. Capture the speaking style, including pauses and emphasis, in the text formatting if possible.

    Return the result as a JSON object with two fields:
    "language": The detected language name (e.g., "Hinglish", "Hindi", "English").
    "transcript": The full text transcript in mixed script (Hindi + English).
    """

    response = client.models.generate_content(
        model=model,
        contents=[
            types.Content(
                parts=[
                    types.Part(text=prompt),
                    types.Part(
                        inline_data=types.Blob(
                            mime_type=mime_type, data=audio_b64.encode("utf-8")
                        )
                    ),
                ]
            )
        ],
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    import json

    data = json.loads(response.text)
    transcript = data.get("transcript", "")
    language = data.get("language", "Unknown")

    # Log usage (approximate tokens: simple heuristic)
    # In production, use actual token count from response
    tokens = len(transcript.split()) * 2  # rough estimate
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        project.transcript_text = transcript
        project.tokens_used += tokens
        project.ai_model_used = model
        db.commit()
        create_usage_log(
            db,
            user_id=project.user_id,
            project_id=project_id,
            action="transcribe",
            tokens_consumed=tokens,
            ai_model=model,
        )

    return transcript, language


def align_transcript(
    db: Session,
    project_id: uuid.UUID,
    audio_path: str,
    transcript: str,
    mime_type: str = "audio/mpeg",
    model: str = "gemini-2.0-flash-exp",
) -> list:
    """
    Align transcript text to audio timestamps.
    Returns list of segments: [{"start": float, "end": float, "text": str}, ...].
    """
    client = get_gemini_client()

    with open(audio_path, "rb") as f:
        audio_bytes = f.read()
    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

    prompt = f"""
    I have an audio file and its transcript.
    TRANSCRIPT: "{transcript}"

    CRITICAL TASK: PERFORM PRECISION FORCED ALIGNMENT
    1. Analyze the audio second-by-second with extreme care.
    2. Match every single word in the transcript to its exact timestamp in the audio.
    3. Group these words into natural, readable caption segments (typically 3-6 words per segment).
    4. For each segment, provide the EXACT start time (when the first word begins) and the EXACT end time (when the last word ends).
    5. The timings must be accurate to the millisecond (e.g., 1.245).
    6. Ensure there are NO overlapping segments.
    7. Maintain the original Hinglish script (Hindi in Devanagari, English in Latin).
    8. If there are pauses between sentences or phrases, ensure the segments reflect that—do NOT extend a segment's end time into a period of silence.
    9. Every word from the transcript MUST be included in the segments in the correct order.

    Return the result as a JSON object with a "segments" field, which is an array of objects:
    {{
      "segments": [
        {{
          "start": number (seconds, e.g. 1.45),
          "end": number (seconds, e.g. 3.21),
          "text": "The phrase text"
        }}
      ]
    }}
    """

    response = client.models.generate_content(
        model=model,
        contents=[
            types.Content(
                parts=[
                    types.Part(text=prompt),
                    types.Part(
                        inline_data=types.Blob(
                            mime_type=mime_type, data=audio_b64.encode("utf-8")
                        )
                    ),
                ]
            )
        ],
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    import json

    data = json.loads(response.text)
    segments = data.get("segments", [])

    # Save segments to project
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        project.segments = segments
        tokens = sum(len(seg.get("text", "").split()) for seg in segments) * 2
        project.tokens_used += tokens
        db.commit()
        create_usage_log(
            db,
            user_id=project.user_id,
            project_id=project_id,
            action="align",
            tokens_consumed=tokens,
            ai_model=model,
        )

    return segments
