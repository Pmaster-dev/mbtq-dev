"""Abstract base class for all SignAI cloud / local providers."""
from abc import ABC, abstractmethod
import os
import tempfile
from typing import Any, Dict, List
import numpy as np


# Only these video extensions are permitted as temp-file suffixes.
ALLOWED_VIDEO_FORMATS = {"mp4", "avi", "mov", "webm", "mkv"}

# Static mapping from validated format key → safe literal suffix.
# The suffix that reaches the OS always originates from this dict, never from
# user input directly — this breaks the CodeQL path-injection data flow.
_SAFE_SUFFIXES: Dict[str, str] = {
    "mp4": ".mp4",
    "avi": ".avi",
    "mov": ".mov",
    "webm": ".webm",
    "mkv": ".mkv",
}


def safe_temp_video(video_bytes: bytes, fmt: str) -> str:
    """
    Write *video_bytes* to a secure temporary file and return its path.

    *fmt* is validated against ALLOWED_VIDEO_FORMATS and mapped to a
    hardcoded suffix so that user input never flows directly into the
    filesystem path.  Raises ValueError for unknown formats.
    Callers are responsible for deleting the file when done.
    """
    key = fmt.lower().lstrip(".")
    suffix = _SAFE_SUFFIXES.get(key)  # suffix is a static literal, not user input
    if suffix is None:
        raise ValueError(
            f"Unsupported video format '{fmt}'. Allowed: {sorted(ALLOWED_VIDEO_FORMATS)}"
        )
    fd, path = tempfile.mkstemp(suffix=suffix)
    try:
        os.write(fd, video_bytes)
    finally:
        os.close(fd)
    return path



class SignAIProvider(ABC):
    """
    Every provider must implement process_video and process_frames.
    Results must always include at minimum:
        detected_signs: list[str]
        confidence_scores: list[float]
        final_translation: str
        provider: str  (filled in by the registry)
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable provider name."""

    @property
    def available(self) -> bool:
        """Whether this provider is configured and ready."""
        return True

    @abstractmethod
    async def process_video(self, video_bytes: bytes, fmt: str = "mp4") -> Dict[str, Any]:
        """Process a complete video and return recognition results."""

    @abstractmethod
    async def process_frames(self, frames: List[np.ndarray]) -> Dict[str, Any]:
        """Process a list of decoded video frames and return recognition results."""

    def get_provider_info(self) -> Dict[str, Any]:
        return {"name": self.name, "available": self.available}

    # ── Shared helpers ────────────────────────────────────────────────────────

    @staticmethod
    def _empty_result() -> Dict[str, Any]:
        return {
            "detected_signs": [],
            "confidence_scores": [],
            "fingerspelling": [],
            "final_translation": "",
            "sequence_length": 0,
        }

    @staticmethod
    def _deduplicate(preds: List[str]) -> List[str]:
        """Remove consecutive duplicates, keeping first occurrence."""
        if not preds:
            return []
        out = [preds[0]]
        for p in preds[1:]:
            if p != out[-1]:
                out.append(p)
        return out

    @staticmethod
    def _to_sentence(signs: List[str]) -> str:
        return " ".join(s for s in signs if s and s != "<unknown>")
