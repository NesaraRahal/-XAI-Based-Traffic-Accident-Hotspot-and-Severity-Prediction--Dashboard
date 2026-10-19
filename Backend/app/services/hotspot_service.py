from typing import List, Optional
from app.database.connection import get_dashboard_collection
from app.models.schemas import CellSummary


def _to_summary(doc: dict) -> CellSummary:
    return CellSummary(
        h3_cell=doc["h3_cell"],
        year_month=doc["year_month"],
        cell_lat=doc["location"]["cell_lat"],
        cell_lng=doc["location"]["cell_lng"],
        police_division=doc["location"].get("police_division"),
        hotspot_predicted=doc["hotspot"]["predicted"],
        hotspot_probability=doc["hotspot"]["probability"],
        severity_predicted_class=doc["severity"]["predicted_class"],
        observed_is_hotspot=doc["observed"]["is_hotspot"],
        observed_accident_count=doc["observed"]["accident_count"],
    )


async def list_cells(
    year_month: Optional[str] = None,
    scope: Optional[dict] = None,
) -> List[CellSummary]:
    """`scope` is the caller's police-division filter (see app.auth.deps.division_filter)."""
    query: dict = dict(scope or {})
    if year_month:
        query["year_month"] = year_month

    cursor = get_dashboard_collection().find(query, {"_id": 0})
    return [_to_summary(doc) async for doc in cursor]


async def list_hotspots(
    year_month: Optional[str] = None,
    scope: Optional[dict] = None,
    limit: Optional[int] = None,
) -> List[CellSummary]:
    query: dict = {**(scope or {}), "hotspot.predicted": True}
    if year_month:
        query["year_month"] = year_month

    cursor = get_dashboard_collection().find(query, {"_id": 0}).sort(
        "hotspot.probability", -1
    )
    if limit:
        cursor = cursor.limit(limit)

    return [_to_summary(doc) async for doc in cursor]


async def get_cell(h3_cell: str, year_month: str, scope: Optional[dict] = None) -> Optional[dict]:
    return await get_dashboard_collection().find_one(
        {**(scope or {}), "h3_cell": h3_cell, "year_month": year_month},
        {"_id": 0},
    )
