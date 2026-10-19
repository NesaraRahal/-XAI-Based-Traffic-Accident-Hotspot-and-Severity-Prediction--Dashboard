from typing import Optional
from app.database.connection import get_dashboard_collection


async def get_severity(h3_cell: str, year_month: str, scope: Optional[dict] = None) -> Optional[dict]:
    doc = await get_dashboard_collection().find_one(
        {**(scope or {}), "h3_cell": h3_cell, "year_month": year_month},
        {"_id": 0, "severity": 1, "historical_context": 1, "h3_cell": 1, "year_month": 1},
    )
    return doc
