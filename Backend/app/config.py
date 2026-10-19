from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_uri: str
    mongo_db: str = "accident_hotspot"
    predictions_collection: str = "dashboard_predictions_cell_month"
    # Comma-separated frontend origins allowed to call this API.
    # When deployed, set CORS_ORIGINS to the frontend URL (e.g. https://my-app.onrender.com).
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # ── Authentication ────────────────────────────────────────────────
    # Where dashboard accounts are stored (same database as the predictions).
    users_collection: str = "dashboard_users"
    # Secret used to sign login tokens. MUST be set in production (any long random string);
    # if left empty a random one is generated at startup, which logs everyone out on every restart.
    jwt_secret: str = ""
    jwt_expire_hours: int = 12
    # When true, police sign-ups stay "pending" until an admin approves them.
    require_approval: bool = True
    # Optional bootstrap admin: created on startup if no account with this email exists.
    admin_email: str = ""
    admin_password: str = ""
    admin_name: str = "Administrator"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
