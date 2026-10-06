from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_uri: str
    mongo_db: str = "accident_hotspot"
    predictions_collection: str = "dashboard_predictions_cell_month"
    # Comma-separated frontend origins allowed to call this API.
    # When deployed, set CORS_ORIGINS to the frontend URL (e.g. https://my-app.onrender.com).
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()