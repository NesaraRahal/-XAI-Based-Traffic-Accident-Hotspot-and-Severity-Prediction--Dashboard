from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_uri: str
    mongo_db: str = "accident_hotspot"
    predictions_collection: str = "dashboard_predictions_cell_month"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()