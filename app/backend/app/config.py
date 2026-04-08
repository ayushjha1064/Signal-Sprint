from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT_DIR / "piro_model"
DEFAULT_MODEL_FILE = MODEL_DIR / "model.pkl"
DEFAULT_PREDICT_SCRIPT = MODEL_DIR / "predict.py"
DEFAULT_UPLOAD_DIR = ROOT_DIR / "backend" / "uploads"


class Settings(BaseSettings):
    app_name: str = "DMC Dustbin Monitor API"
    environment: str = "development"
    max_upload_size_mb: int = 10
    model_file: Path = DEFAULT_MODEL_FILE
    predict_script: Path = DEFAULT_PREDICT_SCRIPT
    upload_dir: Path = DEFAULT_UPLOAD_DIR
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    return settings
