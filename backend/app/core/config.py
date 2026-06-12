# config.py
# Propósito: Configuración general: variables de entorno, CORS, base de datos, API

import os
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "ContaPro ERP Colombia"
    APP_VERSION: str = "1.0.0"
    API_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "contapro"
    POSTGRES_PASSWORD: str = "contapro123"
    POSTGRES_DB: str = "contapro_erp"
    DATABASE_URL: Optional[str] = None

    REDIS_URL: str = "redis://localhost:6379/0"

    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4"

    DIAN_API_URL: Optional[str] = None
    DIAN_API_KEY: Optional[str] = None
    DIAN_TEST_MODE: bool = True

    SENTRY_DSN: Optional[str] = None

    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_PROJECT_REF: Optional[str] = None

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000"]

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    @property
    def async_database_url(self) -> str:
        # Use SQLite for local development if PostgreSQL is not available
        use_sqlite = os.getenv("USE_SQLITE", "false").lower() == "true"
        if use_sqlite:
            return "sqlite+aiosqlite:///./contapro_erp.db"
        
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgresql://"):
                scheme = "postgresql+psycopg://"
                rest = url[len("postgresql://"):]
                return scheme + rest
            return url
        return f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(extra="ignore", env_file=".env", case_sensitive=True)


settings = Settings()
