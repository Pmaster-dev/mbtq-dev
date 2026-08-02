"""OpenAI GPT-4o Vision SignAI provider."""
import os
import base64
import logging
import asyncio
import tempfile
from typing import Any, Dict, List

import cv2
import numpy as np

from .base import SignAIProvider

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are an ASL (American Sign Language) expert. "
    "You will be shown a frame from a signing video. "
    "Identify any hand signs, fingerspelling, or body-language grammar markers visible. "
    "Reply with a JSON object: "
    '{"signs": ["word1", "word2"], "fingerspelling": ["A","B"], "confidence": 0.9}. '
    "If nothing is recognisable, return empty lists."
)


class OpenAIVisionProvider(SignAIProvider):
    """
    Uses OpenAI GPT-4o Vision to interpret individual frames.

    Required env vars:
        OPENAI_API_KEY

    Optional env vars:
        OPENAI_MODEL    — default: gpt-4o
        OPENAI_MAX_FRAMES — max frames to send per request (default: 8)
    """

    def __init__(self) -> None:
        import openai  # lazy import

        self._client = openai.AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
        self._model = os.getenv("OPENAI_MODEL", "gpt-4o")
        self._max_frames = int(os.getenv("OPENAI_MAX_FRAMES", "8"))
        logger.info("OpenAI Vision provider initialised (model=%s)", self._model)

    @property
    def name(self) -> str:
        return "openai"

    @property
    def available(self) -> bool:
        return bool(os.getenv("OPENAI_API_KEY"))

    async def process_video(self, video_bytes: bytes, fmt: str = "mp4") -> Dict[str, Any]:
        with tempfile.NamedTemporaryFile(suffix=f".{fmt}", delete=False) as f:
            f.write(video_bytes)
            tmp = f.name

        try:
            cap = cv2.VideoCapture(tmp)
            frames: List[np.ndarray] = []
            while cap.isOpened():
                ok, frame = cap.read()
                if not ok:
                    break
                frames.append(frame)
            cap.release()
        finally:
            os.unlink(tmp)

        return await self.process_frames(frames)

    async def process_frames(self, frames: List[np.ndarray]) -> Dict[str, Any]:
        if not frames:
            return self._empty_result()

        # Sample evenly across the video, capped at max_frames
        step = max(1, len(frames) // self._max_frames)
        sampled = frames[::step][: self._max_frames]

        results = await asyncio.gather(*[self._analyse_frame(f) for f in sampled])

        all_signs: List[str] = []
        all_letters: List[str] = []
        confidences: List[float] = []

        for r in results:
            all_signs.extend(r.get("signs", []))
            all_letters.extend(r.get("fingerspelling", []))
            confidences.append(float(r.get("confidence", 0.7)))

        deduped = self._deduplicate(all_signs)
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.0

        return {
            "detected_signs": deduped,
            "confidence_scores": [avg_conf] * len(deduped),
            "fingerspelling": list(dict.fromkeys(all_letters)),  # dedupe letters
            "final_translation": self._to_sentence(deduped),
            "sequence_length": len(frames),
        }

    async def _analyse_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        try:
            import json

            _, jpg = cv2.imencode(".jpg", frame)
            b64 = base64.b64encode(jpg.tobytes()).decode()

            response = await self._client.chat.completions.create(
                model=self._model,
                max_tokens=256,
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{b64}"},
                            }
                        ],
                    },
                ],
            )
            raw = response.choices[0].message.content or "{}"
            # Strip markdown fences if present
            raw = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
            return json.loads(raw)
        except Exception as exc:
            logger.warning("OpenAI frame analysis failed: %s", exc)
            return {"signs": [], "fingerspelling": [], "confidence": 0.0}
