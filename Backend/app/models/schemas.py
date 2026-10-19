from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, EmailStr, Field


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

# ── Authentication ────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    division: str = Field(min_length=1, description="Police division this officer is responsible for")


class UserPublic(BaseModel):
    id: str
    email: str
    name: str
    role: Literal["admin", "police"]
    divisions: List[str]
    status: Literal["active", "pending", "disabled"]
    created_at: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserPublic
    message: Optional[str] = None


class UserUpdate(BaseModel):
    role: Optional[Literal["admin", "police"]] = None
    divisions: Optional[List[str]] = None
    status: Optional[Literal["active", "pending", "disabled"]] = None
