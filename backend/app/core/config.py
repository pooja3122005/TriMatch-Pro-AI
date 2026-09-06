import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend folder or project root
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")
load_dotenv()


class Settings:
    PROJECT_NAME: str = "TriMatch Pro AI Backend"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    MAX_UPLOAD_FILE_BYTES: int = 15 * 1024 * 1024  # 15MB
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]


settings = Settings()
