"""FastAPI dependencies: who is calling, and which police divisions they may see."""
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.security import decode_access_token
from app.services import user_service

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> dict:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not signed in or session expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if creds is None:
        raise unauthorized
    payload = decode_access_token(creds.credentials)
    if not payload or "sub" not in payload:
        raise unauthorized
    # Always re-read the account so role / division / status changes apply immediately.
    user = await user_service.get_by_id(payload["sub"])
    if not user or user.get("status") != "active":
        raise unauthorized
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins only")
    return user


def allowed_divisions(user: dict) -> Optional[list[str]]:
    """None means unrestricted (admin). A list means the user may only see these divisions."""
    if user.get("role") == "admin":
        return None
    return list(user.get("divisions") or [])


def division_filter(user: dict, requested: Optional[str] = None) -> dict:
    """Mongo filter on location.police_division for this user.

    - Admin: optional filter on the requested division.
    - Police: the requested division must be one of theirs (else 403);
      with no request, restricted to all of their divisions.
    """
    allowed = allowed_divisions(user)
    if allowed is None:
        return {"location.police_division": requested} if requested else {}
    if requested:
        if requested not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="That police division is outside your jurisdiction",
            )
        return {"location.police_division": requested}
    return {"location.police_division": {"$in": allowed}}
