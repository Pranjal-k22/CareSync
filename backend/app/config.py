import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent

class AppConfig(BaseModel):
    # Environment & Server
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")

    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "replace-with-a-random-48-byte-secret")
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*")

    # Database & Supabase
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/healconnect")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "your-supabase-anon-key")

    # Models & Artifact Paths
    MODEL_PATH: str = os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "registry" / "deterioration" / "v1" / "model.joblib"))
    DETERIORATION_MODEL_PATH: str = os.getenv("DETERIORATION_MODEL_PATH", str(BASE_DIR / "models" / "registry" / "deterioration" / "v1" / "model.joblib"))
    DISEASE_MODEL_PATH: str = os.getenv("DISEASE_MODEL_PATH", str(BASE_DIR / "models" / "registry" / "disease" / "flu_v1" / "model.joblib"))

settings = AppConfig()
