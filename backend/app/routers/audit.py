from fastapi import APIRouter
from app.models.schemas import AuditEntry
from app.services.audit_service import get_audit_log, get_flagged_for_review

router = APIRouter(tags=["audit"])


@router.get("/audit-log", response_model=list[AuditEntry])
def audit_log_endpoint(
    nct_id: str | None = None, patient_id: str | None = None, limit: int | None = None
):
    return get_audit_log(nct_id=nct_id, patient_id=patient_id, limit=limit)


@router.get("/flagged-for-review", response_model=list[AuditEntry])
def flagged_for_review_endpoint(
    nct_id: str | None = None, patient_id: str | None = None, limit: int | None = None
):
    return get_flagged_for_review(nct_id=nct_id, patient_id=patient_id, limit=limit)
