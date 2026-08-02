"""DeafAUTH service stub — wire to your JWT / Firebase backend."""
import os
import logging
from typing import Any, Dict, Optional

from jose import jwt, JWTError

logger = logging.getLogger(__name__)

_SECRET = os.getenv("DEAFAUTH_JWT_SECRET", "dev-deafauth-secret-change-in-prod")
_ALGORITHM = "HS256"


class DeafAuthService:
    def __init__(self, fibonrose=None) -> None:
        self._fibonrose = fibonrose

    async def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify a DeafAUTH JWT and return the identity payload."""
        try:
            payload = jwt.decode(token, _SECRET, algorithms=[_ALGORITHM])
            return {
                "user_id": payload.get("uid") or payload.get("sub"),
                "role": payload.get("role", "member"),
                "email": payload.get("email"),
                "accessibility_claims": payload.get("accessibilityClaims", {}),
                "fibonrose_score": payload.get("fibonroseScore", 0),
                "dao_member": payload.get("daoMember", False),
            }
        except JWTError as exc:
            logger.warning("DeafAUTH token verification failed: %s", exc)
            raise ValueError("Invalid or expired DeafAUTH token") from exc

    async def register_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        # TODO: connect to your user store / Firebase
        raise NotImplementedError("DeafAUTH.register_user — connect to your user store")

    async def authenticate(self, credentials: Dict[str, Any]) -> Dict[str, Any]:
        # TODO: connect to your auth provider
        raise NotImplementedError("DeafAUTH.authenticate — connect to your auth provider")
