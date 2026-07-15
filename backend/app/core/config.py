from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str

    HOST: str
    PORT: int

    GEMINI_API_KEY: str
    GEMINI_MODEL: str
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/metro_guide"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )


settings = Settings()