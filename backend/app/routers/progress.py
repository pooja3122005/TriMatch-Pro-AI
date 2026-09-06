from fastapi import APIRouter
from app.db.client import get_client
from app.models.schemas import TrialProgressResponse
from app.services.progress_service import compute_trial_progress, store_trial_metrics

router = APIRouter(prefix="/trials", tags=["progress"])


@router.get("/{nct_id}/progress", response_model=TrialProgressResponse)
def get_trial_progress(nct_id: str, primary_test_code: str | None = None):
    client = get_client()
    progress = compute_trial_progress(client, nct_id, primary_test_code=primary_test_code)
    return TrialProgressResponse(**progress)


@router.post("/{nct_id}/compute-metrics", response_model=TrialProgressResponse)
def compute_metrics(nct_id: str, primary_test_code: str | None = None):
    client = get_client()
    progress = compute_trial_progress(client, nct_id, primary_test_code=primary_test_code)
    store_trial_metrics(client, progress)
    return TrialProgressResponse(**progress)
