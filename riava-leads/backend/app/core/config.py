from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "Riava Leads"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ENCRYPTION_KEY: str  # Fernet key for encrypting Meta tokens at rest

    # Database
    DATABASE_URL: str
    SYNC_DATABASE_URL: str = ""  # Used by Alembic

    # Redis
    REDIS_URL: str

    # Celery
    CELERY_BROKER_URL: str = ""
    CELERY_RESULT_BACKEND: str = ""

    # Meta / Facebook
    META_APP_ID: str = ""
    META_APP_SECRET: str = ""
    META_VERIFY_TOKEN: str = ""
    META_WEBHOOK_SECRET: str = ""
    META_API_VERSION: str = "v21.0"
    META_REDIRECT_URI: str = "http://localhost:8000/api/v1/meta/oauth/callback"

    # WhatsApp
    WHATSAPP_TOKEN: str = ""
    WHATSAPP_PHONE_ID: str = ""

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    EMAILS_FROM_NAME: str = "Riava Leads"
    EMAILS_FROM_EMAIL: str = "noreply@riava.cl"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    AUTH_RATE_LIMIT_PER_MINUTE: int = 10

    @field_validator("SYNC_DATABASE_URL", mode="before")
    @classmethod
    def build_sync_url(cls, v: str, info) -> str:
        if v:
            return v
        db_url = info.data.get("DATABASE_URL", "")
        return db_url.replace("postgresql+asyncpg://", "postgresql://")

    @field_validator("CELERY_BROKER_URL", mode="before")
    @classmethod
    def build_celery_broker(cls, v: str, info) -> str:
        return v or info.data.get("REDIS_URL", "").replace("/0", "/1")

    @field_validator("CELERY_RESULT_BACKEND", mode="before")
    @classmethod
    def build_celery_backend(cls, v: str, info) -> str:
        return v or info.data.get("REDIS_URL", "").replace("/0", "/2")

    def get_allowed_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


settings = Settings()
