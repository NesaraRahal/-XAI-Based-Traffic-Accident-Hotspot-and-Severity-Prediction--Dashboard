from fastapi import APIRouter, Depends, HTTPException, Query
from app.auth.deps import division_filter, get_current_user
from app.services import severity_service

router = APIRouter(prefix="/severity", tags=["severity"])


@router.get("/{h3_cell}")
async def get_severity(h3_cell: str, year_month: str = Query(...), user: dict = Depends(get_current_user)):
    doc = await severity_service.get_severity(h3_cell, year_month, division_filter(user))
    if not doc:
        raise HTTPException(status_code=404, detail="Severity prediction not found")
    return doc
