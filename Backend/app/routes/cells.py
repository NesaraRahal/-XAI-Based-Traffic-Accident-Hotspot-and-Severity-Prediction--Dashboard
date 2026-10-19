from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.auth.deps import allowed_divisions, division_filter, get_current_user
from app.models.schemas import CellPrediction, CellSummary
from app.services import hotspot_service, xai_service

router = APIRouter(prefix="/cells", tags=["cells"])


@router.get("", response_model=List[CellSummary])
async def get_cells(
    year_month: Optional[str] = Query(None, description="Filter by YYYY-MM"),
    police_division: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
):
    return await hotspot_service.list_cells(year_month, division_filter(user, police_division))


@router.get("/months", response_model=List[str])
async def get_months(_: dict = Depends(get_current_user)):
    return await xai_service.list_months()


@router.get("/divisions", response_model=List[str])
async def get_divisions(user: dict = Depends(get_current_user)):
    """Divisions this user may view: all of them for admins, their own for police."""
    divisions = await xai_service.list_divisions()
    allowed = allowed_divisions(user)
    return divisions if allowed is None else [d for d in divisions if d in allowed]


@router.get("/{h3_cell}", response_model=CellPrediction)
async def get_cell(h3_cell: str, year_month: str = Query(...), user: dict = Depends(get_current_user)):
    # Cells outside a police user's jurisdiction come back as "not found".
    doc = await hotspot_service.get_cell(h3_cell, year_month, division_filter(user))
    if not doc:
        raise HTTPException(status_code=404, detail="Cell prediction not found")
    return doc
