from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    BOT_TOKEN: str
    DATABASE_URL: str = "sqlite+aiosqlite:///./quiz_funnel.db"
    CHANNEL_ID: str = ""
    CRM_WEBHOOK_URL: str = ""


settings = Settings()
