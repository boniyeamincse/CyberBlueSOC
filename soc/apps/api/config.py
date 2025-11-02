from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    oidc_issuer: str
    oidc_audience: str
    database_url: str
    cors_origins: List[str] = ["https://soc.local", "https://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()