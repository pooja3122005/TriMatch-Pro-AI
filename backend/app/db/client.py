import os
from functools import lru_cache
import httpx
from supabase import Client, ClientOptions, create_client
from app.core.config import settings

_HTTPX_CLIENT = httpx.Client(transport=httpx.HTTPTransport(retries=3), timeout=30)


@lru_cache
def get_client() -> Client:
    url = settings.DATABASE_URL or os.getenv("DATABASE_URL", "")
    key = settings.SUPABASE_ANON_KEY or os.getenv("SUPABASE_ANON_KEY", "")
    if not url or not key:
        raise ValueError("DATABASE_URL and SUPABASE_ANON_KEY must be set in environment or .env file")
    return create_client(url, key, options=ClientOptions(httpx_client=_HTTPX_CLIENT))
