"""
Deaf First API — v2.0.0
Multi-cloud Sign Language AI backend for the MBTQ / Deaf First ecosystem.

Neural flow: Intent → DeafAUTH → FibonRose → SignAI (multi-cloud) → PinkSync
"""
import base64
import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any, Dict, List, Optional

import cv2
import numpy as np
import uvicorn
from fastapi import Depends, FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, field_validator

from modules.deafauth import DeafAuthService
from modules.fibonrose import FibonRoseEngine
from modules.pinksync import PinkSyncMessaging
from modules.signai import SignAIProcessor
from modules.deaf_components import DeafUIService
from providers.base import ALLOWED_VIDEO_FORMATS, safe_temp_video

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Service Container ────────────────────────────────────────────────────────

class DeafFirstServices:
    """Initialised once at startup in dependency-graph order."""

    def __init__(self) -> None:
        self.fibonrose = FibonRoseEngine()
        self.deafauth = DeafAuthService(self.fibonrose)
        self.pinksync = PinkSyncMessaging(self.deafauth, self.fibonrose)
        self.signai = SignAIProcessor(self.deafauth, self.fibonrose)
        self.deaf_ui = DeafUIService()
        logger.info(
            "Deaf First services online | SignAI primary=%s | providers=%s",
            self.signai.primary_provider,
            list(self.signai.list_providers()),
        )


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Deaf First API starting up…")
    app.state.svc = DeafFirstServices()
    yield
    logger.info("Deaf First API shutting down.")


# ─── App ──────────────────────────────────────────────────────────────────────

_cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()] or ["*"]

app = FastAPI(
    title="Deaf First API",
    description=(
        "Deaf-first, multi-cloud sign language AI backend. "
        "Supports AWS Rekognition, Azure Cognitive, Google Vision, OpenAI, and local MediaPipe."
    ),
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)


# ─── Auth dependency ──────────────────────────────────────────────────────────

async def verify_deaf_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Dict[str, Any]:
    """DeafAUTH gatekeeper — validates JWT and checks FibonRose trust score."""
    if not credentials:
        raise HTTPException(status_code=401, detail="DeafAUTH token required")
    svc: DeafFirstServices = app.state.svc
    try:
        user = await svc.deafauth.verify_token(credentials.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired DeafAUTH token")

    trust = await svc.fibonrose.validate_user_trust(user["user_id"])
    if trust < float(os.getenv("DEAFAUTH_MIN_TRUST", "0.5")):
        raise HTTPException(status_code=403, detail="Insufficient trust score")

    user["trust_score"] = trust
    return user


# ─── Pydantic models ──────────────────────────────────────────────────────────

class VideoRequest(BaseModel):
    video_base64: str
    format: str = "mp4"
    provider: Optional[str] = None  # aws | azure | google | openai | local

    @field_validator("format")
    @classmethod
    def validate_format(cls, v: str) -> str:
        v = v.lower().lstrip(".")
        if v not in ALLOWED_VIDEO_FORMATS:
            raise ValueError(f"format must be one of {sorted(ALLOWED_VIDEO_FORMATS)}")
        return v


class TrainingRequest(BaseModel):
    video_base64: str
    label: str
    signer_id: str
    format: str = "mp4"

    @field_validator("format")
    @classmethod
    def validate_format(cls, v: str) -> str:
        v = v.lower().lstrip(".")
        if v not in ALLOWED_VIDEO_FORMATS:
            raise ValueError(f"format must be one of {sorted(ALLOWED_VIDEO_FORMATS)}")
        return v

class TextToASLRequest(BaseModel):
    text: str
    provider: Optional[str] = None


# ─── Root / health ────────────────────────────────────────────────────────────

@app.get("/")
async def root() -> Dict[str, Any]:
    svc: DeafFirstServices = app.state.svc
    return {
        "api": "Deaf First API",
        "version": "2.0.0",
        "architecture": "Intent → DeafAUTH → FibonRose → SignAI → PinkSync",
        "signai_primary_provider": svc.signai.primary_provider,
        "signai_providers": list(svc.signai.list_providers()),
    }


@app.get("/api/v2/health")
async def health() -> Dict[str, Any]:
    svc: DeafFirstServices = app.state.svc
    providers = svc.signai.list_providers()
    # Quick smoke-test on the local provider
    test_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    local_ok = True
    try:
        from providers.local import LocalMediaPipeProvider
        p = svc.signai.registry.get("local")
        await p.process_frames([test_frame])
    except Exception:
        local_ok = False

    return {
        "status": "healthy",
        "local_provider_ok": local_ok,
        "providers": providers,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ─── DeafAUTH endpoints ───────────────────────────────────────────────────────

@app.post("/api/auth/register")
async def register(user_data: Dict[str, Any]) -> Dict[str, Any]:
    svc: DeafFirstServices = app.state.svc
    try:
        result = await svc.deafauth.register_user(user_data)
        trust = await svc.fibonrose.create_trust_profile(result["user_id"])
        return {
            "user_id": result["user_id"],
            "auth_token": result["token"],
            "trust_score": trust["initial_score"],
            "community_status": "pending_validation",
        }
    except NotImplementedError as exc:
        raise HTTPException(status_code=501, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/auth/login")
async def login(credentials: Dict[str, Any]) -> Dict[str, Any]:
    svc: DeafFirstServices = app.state.svc
    try:
        return await svc.deafauth.authenticate(credentials)
    except NotImplementedError as exc:
        raise HTTPException(status_code=501, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")


@app.get("/api/auth/profile")
async def profile(current_user: Dict[str, Any] = Depends(verify_deaf_auth)) -> Dict[str, Any]:
    svc: DeafFirstServices = app.state.svc
    trust = await svc.fibonrose.get_trust_metrics(current_user["user_id"])
    return {"user": current_user, **trust}


# ─── FibonRose / trust endpoints ──────────────────────────────────────────────

@app.get("/api/trust/score/{user_id}")
async def trust_score(
    user_id: str,
    _: Dict[str, Any] = Depends(verify_deaf_auth),
) -> Dict[str, Any]:
    svc: DeafFirstServices = app.state.svc
    score = await svc.fibonrose.get_trust_score(user_id)
    return {"user_id": user_id, "trust_score": score}


@app.post("/api/trust/validate")
async def validate_action(
    action_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(verify_deaf_auth),
) -> Dict[str, Any]:
    svc: DeafFirstServices = app.state.svc
    return await svc.fibonrose.validate_action(action_data, current_user["user_id"])


@app.post("/api/dao/vote")
async def dao_vote(
    vote_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(verify_deaf_auth),
) -> Dict[str, Any]:
    svc: DeafFirstServices = app.state.svc
    can_vote = await svc.fibonrose.can_participate_in_governance(current_user["user_id"])
    if not can_vote:
        raise HTTPException(status_code=403, detail="Insufficient trust for DAO participation")
    try:
        return await svc.fibonrose.process_dao_vote(vote_data, current_user["user_id"])
    except NotImplementedError as exc:
        raise HTTPException(status_code=501, detail=str(exc))


# ─── SignAI endpoints (multi-cloud) ───────────────────────────────────────────

@app.post("/api/v2/signai/recognize")
async def recognize_video(
    req: VideoRequest,
    current_user: Dict[str, Any] = Depends(verify_deaf_auth),
) -> Dict[str, Any]:
    """
    Recognise signs in a base64-encoded video.
    Use ?provider=aws|azure|google|openai|local to pin a specific provider,
    or omit to use the configured primary with automatic failover.
    """
    svc: DeafFirstServices = app.state.svc
    result = await svc.signai.recognize_signs(
        {"video_base64": req.video_base64, "format": req.format},
        current_user["user_id"],
        req.provider,
    )
    return {"status": "success", "processing_time": datetime.utcnow().isoformat(), **result}


@app.post("/api/v2/signai/generate")
async def generate_asl(
    req: TextToASLRequest,
    current_user: Dict[str, Any] = Depends(verify_deaf_auth),
) -> Dict[str, Any]:
    """Generate ASL animation metadata from plain text."""
    svc: DeafFirstServices = app.state.svc
    return await svc.signai.generate_asl_animation(
        req.text,
        current_user.get("accessibility_claims", {}),
        req.provider,
    )


@app.get("/api/v2/signai/providers")
async def list_providers(
    _: Dict[str, Any] = Depends(verify_deaf_auth),
) -> Dict[str, Any]:
    """List all configured SignAI providers and their status."""
    svc: DeafFirstServices = app.state.svc
    return {
        "primary": svc.signai.primary_provider,
        "providers": svc.signai.list_providers(),
    }


@app.websocket("/api/v2/signai/stream")
async def sign_stream(websocket: WebSocket, token: Optional[str] = None) -> None:
    """
    Real-time WebSocket sign recognition.
    Send JSON frames: {"frame": "<base64 JPEG>", "provider": "local"}
    Receive: {"translation": "...", "confidence": 0.9, "provider": "local"}
    """
    await websocket.accept()
    svc: DeafFirstServices = app.state.svc

    # Authenticate via token query param
    if token:
        try:
            await svc.deafauth.verify_token(token)
        except Exception:
            await websocket.close(code=1008)  # Policy violation
            return

    frame_buffer: List[np.ndarray] = []
    buffer_size = int(os.getenv("SIGNAI_STREAM_BUFFER", "30"))

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            provider_name: Optional[str] = data.get("provider")

            frame_bytes = base64.b64decode(data["frame"])
            arr = np.frombuffer(frame_bytes, dtype=np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if frame is not None:
                frame_buffer.append(frame)

            if len(frame_buffer) >= buffer_size:
                result = await svc.signai.recognize_from_frames(frame_buffer, provider_name)
                scores = result.get("confidence_scores", [0])
                await websocket.send_text(json.dumps({
                    "translation": result.get("final_translation", ""),
                    "confidence": sum(scores) / len(scores) if scores else 0.0,
                    "provider": result.get("provider", "unknown"),
                    "timestamp": datetime.utcnow().isoformat(),
                }))
                frame_buffer = frame_buffer[-10:]  # keep recent context
    except Exception as exc:
        logger.error("WebSocket error: %s", exc)
        await websocket.close(code=1000)


# ─── Training endpoint ────────────────────────────────────────────────────────

@app.post("/api/v2/signai/train")
async def add_training_data(
    req: TrainingRequest,
    current_user: Dict[str, Any] = Depends(verify_deaf_auth),
) -> Dict[str, Any]:
    """Add labelled training video to the local provider database."""
    svc: DeafFirstServices = app.state.svc
    video_bytes = base64.b64decode(req.video_base64)

    tmp = safe_temp_video(video_bytes, req.format)
    cap = cv2.VideoCapture(tmp)
    frames: List[np.ndarray] = []
    try:
        while cap.isOpened():
            ok, frame = cap.read()
            if not ok:
                break
            frames.append(frame)
    finally:
        cap.release()
        os.unlink(tmp)

    return await svc.signai.add_training_data(frames, req.label, req.signer_id)


# ─── PinkSync endpoints ───────────────────────────────────────────────────────

@app.websocket("/api/pinksync/connect")
async def pinksync_ws(websocket: WebSocket, token: Optional[str] = None) -> None:
    """PinkSync real-time coordination WebSocket."""
    await websocket.accept()
    svc: DeafFirstServices = app.state.svc

    if not token:
        await websocket.close(code=1008)
        return

    try:
        user = await svc.deafauth.verify_token(token)
    except Exception:
        await websocket.close(code=1008)
        return

    await svc.pinksync.register_connection(websocket, user)
    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            resp = await svc.pinksync.process_message(msg, user)
            await websocket.send_text(json.dumps(resp))
    except Exception:
        await websocket.close(code=1000)


@app.post("/api/pinksync/automation")
async def pinksync_automation(
    data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(verify_deaf_auth),
) -> Dict[str, Any]:
    svc: DeafFirstServices = app.state.svc
    return await svc.pinksync.execute_automation(data, current_user)


# ─── DeafUI endpoints ─────────────────────────────────────────────────────────

@app.get("/api/ui/components")
async def ui_components(
    current_user: Dict[str, Any] = Depends(verify_deaf_auth),
) -> List[Dict[str, Any]]:
    svc: DeafFirstServices = app.state.svc
    return await svc.deaf_ui.get_available_components(current_user.get("accessibility_claims", {}))


@app.post("/api/ui/customize")
async def ui_customize(
    preferences: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(verify_deaf_auth),
) -> Dict[str, Any]:
    svc: DeafFirstServices = app.state.svc
    return await svc.deaf_ui.customize_interface(preferences, current_user["user_id"])


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8080")),
        log_level="info",
        access_log=True,
    )
