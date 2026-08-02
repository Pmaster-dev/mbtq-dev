"""Abstract base class for all SignAI cloud / local providers."""
from abc import ABC, abstractmethod
from typing import Any, Dict, List
import numpy as np


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
