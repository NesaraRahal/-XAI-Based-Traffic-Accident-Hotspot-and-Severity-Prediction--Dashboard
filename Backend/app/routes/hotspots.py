from typing import List, Optional
from fastapi import APIRouter, Query
from app.models.schemas import CellSummary
from app.services import hotspot_service

router = APIRouter(prefix="/hotspots", tags=["hotspots"])


@router.get("", response_model=List[CellSummary])
async def get_hotspots(
    year_month: Optional[str] = Query(None),
    police_division: Optional[str] = Query(None),
    limit: Optional[int] = Query(None, ge=1, le=500),
):
    return await hotspot_service.list_hotspots(year_month, police_division, limit)