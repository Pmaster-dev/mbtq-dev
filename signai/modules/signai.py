"""SignAI processor — orchestrates multi-cloud provider calls."""
import logging
import os
from typing import Any, Dict, List, Optional

import numpy as np

from signai.providers.registry import ProviderRegistry

logger = logging.getLogger(__name__)


class SignAIProcessor:
    """
    High-level SignAI service used by the FastAPI routes.
    Delegates to the ProviderRegistry for multi-cloud execution with failover.
    """

    def __init__(self, deafauth=None, fibonrose=None) -> None:
        self._deafauth = deafauth
        self._fibonrose = fibonrose
        self.registry = ProviderRegistry()
        logger.info(
            "SignAI processor ready | primary=%s | providers=%s",
            self.registry.primary,
            list(self.registry.list_providers()),
        )

    # ── Public API ────────────────────────────────────────────────────────────

    async def recognize_signs(
        self,
        video_data: Dict[str, Any],
        user_id: str,
        provider_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Recognise signs from a base64-encoded video payload.
        video_data keys: video_base64, format (default "mp4")
        """
        import base64

        raw = video_data.get("video_base64", "")
        fmt = video_data.get("format", "mp4")

        try:
            video_bytes = base64.b64decode(raw)
        except Exception as exc:
            return {"error": f"Invalid base64 video data: {exc}"}

        async def _run(provider):
            return await provider.process_video(video_bytes, fmt)

        result = await self.registry.run_with_failover(_run, provider_name)
        result["user_id"] = user_id
        return result

    async def recognize_from_frames(
        self,
        frames: List[np.ndarray],
        provider_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        async def _run(provider):
            return await provider.process_frames(frames)

        return await self.registry.run_with_failover(_run, provider_name)

    async def generate_asl_animation(
        self,
        text: str,
        preferences: Dict[str, Any],
        provider_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Text → ASL animation metadata.
        Currently a stub; extend with a generative model per provider.
        """
        words = text.strip().split()
        return {
            "text": text,
            "signs": words,
            "animation_url": None,
            "preferences_applied": preferences,
            "note": "Generation model not yet loaded. Signs list is word-split placeholder.",
        }

    async def add_training_data(
        self,
        frames: List[np.ndarray],
        label: str,
        signer_id: str,
    ) -> Dict[str, Any]:
        """Store new training frames in the local provider's database."""
        from signai.providers.local import LocalMediaPipeProvider

        local: LocalMediaPipeProvider = self.registry.get("local")  # type: ignore
        return local.add_training_data(label, frames, signer_id)

    def list_providers(self) -> Dict[str, Dict[str, Any]]:
        return self.registry.list_providers()

    @property
    def primary_provider(self) -> str:
        return self.registry.primary
