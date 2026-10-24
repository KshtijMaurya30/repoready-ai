from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables or .env."""

    app_name: str = "RepoReady AI API"
    environment: str = "development"
    google_api_key: str | None = None
    gemma_model: str | None = None
    gemma_model_supports_vision: bool = False
    github_token: str | None = None
    github_api_base: str = "https://api.github.com"
    frontend_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    max_image_bytes: int = 8 * 1024 * 1024
    rate_limit_per_minute: int = 20
    request_timeout_seconds: float = 15.0

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("frontend_origins", mode="before")
    @classmethod
    def parse_frontend_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()

