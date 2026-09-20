from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import XaiResponse
from app.services import xai_service

router = APIRouter(prefix="/xai", tags=["xai"])


@router.get("/{h3_cell}", response_model=XaiResponse)
async def get_xai(h3_cell: str, year_month: str = Query(...)):
    doc = await xai_service.get_xai(h3_cell, year_month)
    if not doc:
        raise HTTPException(status_code=404, detail="XAI data not found")
    return doc