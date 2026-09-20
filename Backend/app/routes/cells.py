from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import CellPrediction, CellSummary
from app.services import hotspot_service, xai_service

router = APIRouter(prefix="/cells", tags=["cells"])


@router.get("", response_model=List[CellSummary])
async def get_cells(
    year_month: Optional[str] = Query(None, description="Filter by YYYY-MM"),
    police_division: Optional[str] = Query(None),
):
    return await hotspot_service.list_cells(year_month, police_division)


@router.get("/months", response_model=List[str])
async def get_months():
    return await xai_service.list_months()


@router.get("/divisions", response_model=List[str])
async def get_divisions():
    return await xai_service.list_divisions()


@router.get("/{h3_cell}", response_model=CellPrediction)
async def get_cell(h3_cell: str, year_month: str = Query(...)):
    doc = await hotspot_service.get_cell(h3_cell, year_month)
    if not doc:
        raise HTTPException(status_code=404, detail="Cell prediction not found")
    return doc