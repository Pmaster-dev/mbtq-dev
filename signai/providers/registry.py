"""
Provider registry — initialises available cloud/local providers,
selects the primary, and handles automatic failover.
"""
import os
import logging
from typing import Callable, Coroutine, Dict, List, Optional, Any

from .base import SignAIProvider
from .local import LocalMediaPipeProvider

logger = logging.getLogger(__name__)

# Preference order when auto-selecting primary
_PROVIDER_ORDER = ["aws", "azure", "google", "openai", "local"]


def _try_import(name: str) -> Optional[SignAIProvider]:
    try:
        if name == "aws":
            from .aws import AWSRekognitionProvider
            return AWSRekognitionProvider()
        if name == "azure":
            from .azure import AzureCognitiveProvider
            return AzureCognitiveProvider()
        if name == "google":
            from .google import GoogleVisionProvider
            return GoogleVisionProvider()
        if name == "openai":
            from .openai_provider import OpenAIVisionProvider
            return OpenAIVisionProvider()
    except Exception as exc:
        logger.warning("Provider '%s' failed to initialise: %s", name, exc)
    return None


class ProviderRegistry:
    """
    Manages multiple SignAI providers with automatic failover.

    Env vars:
        SIGNAI_PRIMARY_PROVIDER  — preferred provider key (default: auto-select)
        SIGNAI_ENABLE_PROVIDERS  — comma-separated allow-list (default: all)
    """

    def __init__(self) -> None:
        self._providers: Dict[str, SignAIProvider] = {}
        self._primary: str = "local"
        self._initialise()

    # ── Initialisation ────────────────────────────────────────────────────────

    def _initialise(self) -> None:
        enable_list = os.getenv("SIGNAI_ENABLE_PROVIDERS", "")
        allowed = {p.strip() for p in enable_list.split(",") if p.strip()} or set(_PROVIDER_ORDER)

        # Local is always registered first (zero-dep fallback)
        self._providers["local"] = LocalMediaPipeProvider()

        # Cloud providers — only register when env vars are present
        _cloud_guards = {
            "aws": lambda: bool(os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY")),
            "azure": lambda: bool(os.getenv("AZURE_VISION_KEY") and os.getenv("AZURE_VISION_ENDPOINT")),
            "google": lambda: bool(os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or os.getenv("GOOGLE_CLOUD_PROJECT")),
            "openai": lambda: bool(os.getenv("OPENAI_API_KEY")),
        }

        for key, guard in _cloud_guards.items():
            if key in allowed and guard():
                provider = _try_import(key)
                if provider:
                    self._providers[key] = provider
                    logger.info("SignAI provider registered: %s", key)

        # Determine primary
        preferred = os.getenv("SIGNAI_PRIMARY_PROVIDER", "")
        if preferred and preferred in self._providers:
            self._primary = preferred
        else:
            for key in _PROVIDER_ORDER:
                if key in self._providers:
                    self._primary = key
                    break

        logger.info(
            "SignAI primary provider: %s | available: %s",
            self._primary,
            list(self._providers),
        )

    # ── Public API ────────────────────────────────────────────────────────────

    def get(self, name: Optional[str] = None) -> SignAIProvider:
        key = name or self._primary
        if key not in self._providers:
            raise ValueError(
                f"Provider '{key}' not configured. Available: {list(self._providers)}"
            )
        return self._providers[key]

    async def run_with_failover(
        self,
        fn: Callable[[SignAIProvider], Coroutine[Any, Any, Dict[str, Any]]],
        provider_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Run *fn* against the requested (or primary) provider.
        On failure, cascade through the remaining providers in order.
        """
        primary_key = provider_name or self._primary
        order = [primary_key] + [k for k in _PROVIDER_ORDER if k != primary_key and k in self._providers]

        last_exc: Optional[Exception] = None
        for key in order:
            if key not in self._providers:
                continue
            provider = self._providers[key]
            try:
                result = await fn(provider)
                result.setdefault("provider", provider.name)
                if last_exc:
                    result["failover_from"] = primary_key
                    result["failover_reason"] = str(last_exc)
                return result
            except Exception as exc:
                logger.warning("Provider '%s' failed: %s — trying next.", key, exc)
                last_exc = exc

        raise RuntimeError(
            f"All SignAI providers failed. Last error: {last_exc}"
        )

    def list_providers(self) -> Dict[str, Dict[str, Any]]:
        return {k: p.get_provider_info() for k, p in self._providers.items()}

    @property
    def primary(self) -> str:
        return self._primary
