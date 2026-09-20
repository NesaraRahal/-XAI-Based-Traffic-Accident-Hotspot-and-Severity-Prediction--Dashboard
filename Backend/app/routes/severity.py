from fastapi import APIRouter, HTTPException, Query
from app.services import severity_service

router = APIRouter(prefix="/severity", tags=["severity"])


@router.get("/{h3_cell}")
async def get_severity(h3_cell: str, year_month: str = Query(...)):
    doc = await severity_service.get_severity(h3_cell, year_month)
    if not doc:
        raise HTTPException(status_code=404, detail="Severity prediction not found")
    return doc