from fastapi import APIRouter, File, HTTPException, UploadFile
from app.db.client import get_client
from app.models.schemas import (
    ImportTrialResponse,
    ParseCriteriaToDBResponse,
    TrialCriterionRow,
    UploadTrialResponse,
)
from app.core.config import settings
from app.services.trial_service import criterion_to_db_row, fetch_trial, to_trial_row
from app.services.llm_service import SUPPORTED_DOCUMENT_FILE_MIME_TYPES, parse_criteria
from app.services.trial_upload_service import ingest_trial_document, ingest_trial_document_file

router = APIRouter(prefix="/trials", tags=["trials"])


@router.get("/{nct_id}")
async def get_trial(nct_id: str):
    """Fetches live trial metadata from ClinicalTrials.gov with database fallback."""
    try:
        return await fetch_trial(nct_id)
    except HTTPException as exc:
        if exc.status_code != 404:
            raise
        client = get_client()
        res = client.table("trials").select("*").eq("nct_id", nct_id).limit(1).execute()
        if not res.data:
            raise
        row = res.data[0]
        return {
            "nct_id": row["nct_id"],
            "title": row.get("title"),
            "phase": row.get("phase"),
            "overall_status": row.get("status"),
            "primary_endpoint": row.get("primary_endpoint"),
            "eligibility_criteria": None,
            "brief_summary": None,
            "conditions": [],
            "study_type": None,
            "interventions": [],
            "minimum_age": None,
            "maximum_age": None,
            "eligible_sex": None,
            "healthy_volunteers": None,
        }


@router.post("/{nct_id}/import", response_model=ImportTrialResponse)
async def import_trial(nct_id: str):
    trial = await fetch_trial(nct_id)
    row = to_trial_row(trial)

    client = get_client()
    client.table("trials").upsert(row, on_conflict="nct_id").execute()

    return ImportTrialResponse(
        **row, eligibility_criteria=trial.get("eligibility_criteria")
    )


@router.post("/{nct_id}/parse-criteria", response_model=ParseCriteriaToDBResponse)
async def parse_trial_criteria(nct_id: str):
    trial = await fetch_trial(nct_id)
    eligibility_text = trial.get("eligibility_criteria")
    if not eligibility_text:
        raise HTTPException(
            status_code=422, detail=f"Trial {nct_id} has no eligibility criteria text"
        )

    client = get_client()
    client.table("trials").upsert(to_trial_row(trial), on_conflict="nct_id").execute()

    criteria = parse_criteria(eligibility_text)

    client.table("trial_criteria").delete().eq("nct_id", nct_id).execute()
    rows = [criterion_to_db_row(nct_id, c) for c in criteria]
    inserted = client.table("trial_criteria").insert(rows).execute()

    return ParseCriteriaToDBResponse(
        nct_id=nct_id,
        total=len(criteria),
        inclusion=sum(1 for c in criteria if c.type == "inclusion"),
        exclusion=sum(1 for c in criteria if c.type == "exclusion"),
        needs_review=sum(1 for c in criteria if c.needs_review),
        criteria=[TrialCriterionRow(**row) for row in inserted.data],
    )


@router.post("/upload-document", response_model=UploadTrialResponse)
async def upload_trial_document(file: UploadFile = File(...)):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(content) > settings.MAX_UPLOAD_FILE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large (max {settings.MAX_UPLOAD_FILE_BYTES // (1024 * 1024)}MB)",
        )

    client = get_client()
    mime_type = file.content_type or ""
    if mime_type == "text/plain":
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Could not read this file as UTF-8 text")
        if not text.strip():
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        result = ingest_trial_document(client, text)
    elif mime_type in SUPPORTED_DOCUMENT_FILE_MIME_TYPES:
        result = ingest_trial_document_file(client, content, mime_type)
    else:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {mime_type or 'unknown'}. "
            "Upload a PDF, PNG, JPEG, or plain text file.",
        )

    if result.get("error"):
        raise HTTPException(status_code=422, detail=result["error"])

    return UploadTrialResponse(**{k: v for k, v in result.items() if k != "error"})
