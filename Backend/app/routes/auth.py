from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.auth.deps import get_current_user, require_admin
from app.auth.security import create_access_token, verify_password
from app.config import settings
from app.models.schemas import (
    AuthResponse, LoginRequest, SignupRequest, UserPublic, UserUpdate,
)
from app.services import user_service, xai_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/divisions", response_model=List[str])
async def signup_divisions():
    """Public list of police divisions, so the sign-up form can offer them."""
    return await xai_service.list_divisions()


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest):
    divisions = await xai_service.list_divisions()
    if body.division not in divisions:
        raise HTTPException(status_code=400, detail="Unknown police division")
    try:
        user = await user_service.create_user(
            email=body.email,
            password=body.password,
            name=body.name,
            role="police",  # admins are never self-registered
            divisions=[body.division],
            status="pending" if settings.require_approval else "active",
        )
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    if user["status"] == "pending":
        return AuthResponse(
            user=user_service.to_public(user),
            message="Account created. An administrator needs to approve it before you can sign in.",
        )
    return AuthResponse(
        access_token=create_access_token(str(user["_id"]), user["role"]),
        user=user_service.to_public(user),
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    user = await user_service.get_by_email(body.email)
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if user.get("status") == "pending":
        raise HTTPException(status_code=403, detail="Your account is waiting for admin approval")
    if user.get("status") != "active":
        raise HTTPException(status_code=403, detail="This account has been disabled")
    return AuthResponse(
        access_token=create_access_token(str(user["_id"]), user["role"]),
        user=user_service.to_public(user),
    )


@router.get("/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return user_service.to_public(user)


# ── Admin: manage accounts ────────────────────────────────────────────

@router.get("/users", response_model=List[UserPublic])
async def list_users(_: dict = Depends(require_admin)):
    return await user_service.list_users()


@router.patch("/users/{user_id}", response_model=UserPublic)
async def update_user(user_id: str, body: UserUpdate, admin: dict = Depends(require_admin)):
    target = await user_service.get_by_id(user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    changes = body.model_dump(exclude_none=True)
    is_self = str(target["_id"]) == str(admin["_id"])
    if is_self and (changes.get("role", "admin") != "admin" or changes.get("status", "active") != "active"):
        raise HTTPException(status_code=400, detail="You can't demote or disable your own account")

    if "divisions" in changes:
        known = set(await xai_service.list_divisions())
        unknown = [d for d in changes["divisions"] if d not in known]
        if unknown:
            raise HTTPException(status_code=400, detail=f"Unknown division(s): {', '.join(unknown)}")

    new_role = changes.get("role", target.get("role"))
    new_divisions = changes.get("divisions", target.get("divisions") or [])
    if new_role == "police" and not new_divisions:
        raise HTTPException(status_code=400, detail="A police account needs at least one division")

    updated = await user_service.update_user(user_id, changes)
    return user_service.to_public(updated)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    if user_id == str(admin["_id"]):
        raise HTTPException(status_code=400, detail="You can't delete your own account")
    if not await user_service.delete_user(user_id):
        raise HTTPException(status_code=404, detail="User not found")
