"""Dashboard accounts, stored in the `dashboard_users` collection."""
import logging
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import DuplicateKeyError, PyMongoError

from app.auth.security import hash_password
from app.config import settings
from app.database.connection import get_collection

log = logging.getLogger(__name__)


def _users():
    return get_collection(settings.users_collection)


def to_public(user: dict) -> dict:
    """Account fields that are safe to send to the browser."""
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name") or "",
        "role": user.get("role", "police"),
        "divisions": list(user.get("divisions") or []),
        "status": user.get("status", "pending"),
        "created_at": user.get("created_at"),
    }


async def ensure_indexes() -> None:
    try:
        await _users().create_index("email", unique=True)
    except PyMongoError as exc:  # e.g. a read-only database user
        log.warning("Could not create users index: %s", exc)


async def get_by_email(email: str) -> Optional[dict]:
    return await _users().find_one({"email": email.strip().lower()})


async def get_by_id(user_id: str) -> Optional[dict]:
    try:
        oid = ObjectId(user_id)
    except (InvalidId, TypeError):
        return None
    return await _users().find_one({"_id": oid})


async def create_user(
    *, email: str, password: str, name: str, role: str, divisions: list[str], status: str
) -> dict:
    doc = {
        "email": email.strip().lower(),
        "name": name.strip(),
        "password_hash": hash_password(password),
        "role": role,
        "divisions": divisions,
        "status": status,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await _users().insert_one(doc)  # raises DuplicateKeyError if email exists
    doc["_id"] = result.inserted_id
    return doc


async def list_users() -> list[dict]:
    cursor = _users().find({}, {"password_hash": 0}).sort("created_at", -1)
    return [to_public(u) async for u in cursor]


async def update_user(user_id: str, changes: dict) -> Optional[dict]:
    try:
        oid = ObjectId(user_id)
    except (InvalidId, TypeError):
        return None
    if changes:
        await _users().update_one({"_id": oid}, {"$set": changes})
    return await _users().find_one({"_id": oid})


async def delete_user(user_id: str) -> bool:
    try:
        oid = ObjectId(user_id)
    except (InvalidId, TypeError):
        return False
    result = await _users().delete_one({"_id": oid})
    return result.deleted_count == 1


async def ensure_bootstrap_admin() -> None:
    """Create the ADMIN_EMAIL / ADMIN_PASSWORD account on startup if it doesn't exist yet."""
    if not (settings.admin_email and settings.admin_password):
        return
    try:
        if await get_by_email(settings.admin_email):
            return
        await create_user(
            email=settings.admin_email,
            password=settings.admin_password,
            name=settings.admin_name,
            role="admin",
            divisions=[],
            status="active",
        )
        log.info("Created bootstrap admin account %s", settings.admin_email)
    except DuplicateKeyError:
        pass
    except PyMongoError as exc:
        log.warning("Could not create bootstrap admin: %s", exc)
