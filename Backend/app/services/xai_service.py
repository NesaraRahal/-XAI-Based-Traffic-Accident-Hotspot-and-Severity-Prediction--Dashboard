from typing import Optional
from app.database.connection import get_dashboard_collection


async def get_xai(h3_cell: str, year_month: str, scope: Optional[dict] = None) -> Optional[dict]:
    doc = await get_dashboard_collection().find_one(
        {**(scope or {}), "h3_cell": h3_cell, "year_month": year_month},
        {
            "_id": 0,
            "h3_cell": 1,
            "year_month": 1,
            "hotspot.top_shap_features": 1,
            "severity.top_shap_features": 1,
            "severity.predicted_class": 1,
        },
    )
    if not doc:
        return None
    return {
        "h3_cell": doc["h3_cell"],
        "year_month": doc["year_month"],
        "hotspot": doc["hotspot"]["top_shap_features"],
        "severity_predicted_class": doc["severity"]["predicted_class"],
        "severity": doc["severity"]["top_shap_features"],
    }


async def list_months() -> list[str]:
    return sorted(await get_dashboard_collection().distinct("year_month"))


async def list_divisions() -> list[str]:
    values = await get_dashboard_collection().distinct("location.police_division")
    return sorted(v for v in values if v)