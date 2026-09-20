from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class Location(BaseModel):
    cell_lat: float
    cell_lng: float
    police_division: Optional[str] = None


class ShapFeature(BaseModel):
    feature: str
    label: str
    value: Optional[float | int | str] = None
    shap: float
    direction: str


class HotspotBlock(BaseModel):
    predicted: bool
    probability: float
    threshold: float
    top_shap_features: List[ShapFeature]


class SeverityBlock(BaseModel):
    predicted_class: str
    class_probabilities: Dict[str, float]
    top_shap_features: List[ShapFeature]


class HistoricalContext(BaseModel):
    accidents_180d: int
    severity_mix_180d: Optional[Dict[str, float]] = None


class Observed(BaseModel):
    accident_count: int
    is_hotspot: bool
    severity_defined: bool
    dominant_severity: Optional[str] = None


class ModelMetadata(BaseModel):
    hotspot_model: str
    severity_model: str
    evaluation_window: str


class CellPrediction(BaseModel):
    """Full document as stored in Mongo."""
    h3_cell: str
    year_month: str
    generated_at: str
    location: Location
    hotspot: HotspotBlock
    severity: SeverityBlock
    historical_context: HistoricalContext
    observed: Observed
    model_metadata: ModelMetadata


class CellSummary(BaseModel):
    """Lightweight projection for map/list views."""
    h3_cell: str
    year_month: str
    cell_lat: float
    cell_lng: float
    police_division: Optional[str] = None
    hotspot_predicted: bool
    hotspot_probability: float
    severity_predicted_class: str
    observed_is_hotspot: bool
    observed_accident_count: int


class XaiResponse(BaseModel):
    h3_cell: str
    year_month: str
    hotspot: List[ShapFeature]
    severity_predicted_class: str
    severity: List[ShapFeature]