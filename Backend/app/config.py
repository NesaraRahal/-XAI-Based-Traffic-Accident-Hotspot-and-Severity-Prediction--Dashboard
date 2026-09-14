from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_uri: str
    mongo_db: str
    collection_name: str = "dashboard_predictions_cell_month"

    class Config:
        env_file = ".env"
        env_prefix = ""  # MONGO_URI, MONGO_DB map directly

settings = Settings()