"""Password hashing and login tokens.

Passwords are hashed with PBKDF2-HMAC-SHA256 (Python standard library, no native
build step needed on Windows or Render). Tokens are signed JWTs (HS256).
"""
import base64
import hashlib
import hmac
import logging
import secrets
from datetime import datetime, timedelta, timezone

import jwt

from app.config import settings

log = logging.getLogger(__name__)

_PBKDF2_ITERATIONS = 260_000
_ALGORITHM = "HS256"

if settings.jwt_secret:
    _SECRET = settings.jwt_secret
else:
    _SECRET = secrets.token_urlsafe(48)
    log.warning(
        "JWT_SECRET is not set - using a random secret. "
        "Everyone will be logged out whenever the server restarts. Set JWT_SECRET in .env / Render."
    )


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ITERATIONS)
    return "pbkdf2_sha256${}${}${}".format(
        _PBKDF2_ITERATIONS,
        base64.b64encode(salt).decode(),
        base64.b64encode(digest).decode(),
    )


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, iterations, salt_b64, hash_b64 = stored.split("$")
        if scheme != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(iterations))
        return hmac.compare_digest(digest, expected)
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "iat": now,
        "exp": now + timedelta(hours=settings.jwt_expire_hours),
    }
    return jwt.encode(payload, _SECRET, algorithm=_ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, _SECRET, algorithms=[_ALGORITHM])
    except jwt.PyJWTError:
        return None
