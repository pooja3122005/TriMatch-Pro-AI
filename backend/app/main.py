from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from postgrest.exceptions import APIError

from app.core.config import settings
from app.core.logging import logger
from app.routers import audit, enrollment, matching, patients, progress, trials

load_dotenv()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(APIError)
def handle_postgrest_api_error(request: Request, exc: APIError):
    """Gracefully handle Postgrest database errors as structured JSON responses."""
    if exc.code == "22P02":
        return JSONResponse(status_code=404, content={"detail": "Patient not found"})
    logger.error(f"Postgrest error: {exc.message} (code {exc.code})")
    return JSONResponse(
        status_code=502,
        content={"detail": exc.message or "Database error"},
    )


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "backend",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


# Mount all modular routers to root and forward compatible /api
for r in [
    trials.router,
    matching.router,
    enrollment.router,
    progress.router,
    patients.router,
    audit.router,
]:
    app.include_router(r)
    app.include_router(r, prefix=settings.API_V1_STR)


# Serve built React Frontend if available
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "static"

dist_target = FRONTEND_DIST if FRONTEND_DIST.exists() else (STATIC_DIR if STATIC_DIR.exists() else None)

if dist_target and dist_target.exists():
    class NoCacheHTMLStatic(StaticFiles):
        async def get_response(self, path: str, scope):
            response = await super().get_response(path, scope)
            if path.endswith(".html") or response.media_type == "text/html":
                response.headers["cache-control"] = "no-cache"
            return response

    app.mount("/", NoCacheHTMLStatic(directory=str(dist_target), html=True), name="static")

    @app.get("/{full_path:path}")
    async def spa_catch_all(full_path: str):
        index_file = dist_target / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Not found"})
