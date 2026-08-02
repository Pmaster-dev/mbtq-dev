"""DeafUI component service stub."""
import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


class DeafUIService:
    async def get_available_components(self, preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [
            {"id": "sign-visual-system", "type": "SignVisualSystem", "status": "stable"},
            {"id": "signer-panel", "type": "SignerPanel", "status": "stable"},
            {"id": "confidence-cue", "type": "ConfidenceCue", "status": "stable"},
            {"id": "action-log", "type": "ActionLog", "status": "stable"},
        ]

    async def customize_interface(self, ui_preferences: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        return {"user_id": user_id, "applied": ui_preferences, "status": "saved"}
