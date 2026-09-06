from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from app.core.config import settings
from app.db.client import get_client
from app.models.schemas import (
    Patient,
    PatientSignupRequest,
    PatientSignupResponse,
    UploadDocumentResponse,
    UploadLabRequest,
    UploadLabResponse,
)
from app.services.document_upload_service import SUPPORTED_DOCUMENT_TYPES, store_patient_document
from app.services.lab_upload_service import ingest_lab_report, ingest_lab_report_file
from app.services.llm_service import SUPPORTED_DOCUMENT_FILE_MIME_TYPES
from app.services.patient_signup_service import create_patient
from app.services.patient_service import get_patient, load_patients

router = APIRouter(tags=["patients"])


@router.post("/patients/signup", response_model=PatientSignupResponse)
def patient_signup(request: PatientSignupRequest):
    client = get_client()
    result = create_patient(client, request)
    return PatientSignupResponse(**result)


@router.get("/patients", response_model=list[Patient])
def list_patients():
    return load_patients()


@router.get("/patients/{patient_id}", response_model=Patient)
def get_patient_by_id(patient_id: str):
    patient = get_patient(patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
    return patient


@router.post("/patients/{patient_id}/upload-lab", response_model=UploadLabResponse)
def upload_lab_report(patient_id: str, request: UploadLabRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")

    client = get_client()
    patient_check = (
        client.table("patients").select("patient_id").eq("patient_id", patient_id).limit(1).execute()
    )
    if not patient_check.data:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    result = ingest_lab_report(client, patient_id, request.text)
    return UploadLabResponse(patient_id=patient_id, **result)


@router.post("/patients/{patient_id}/upload-lab-file", response_model=UploadLabResponse)
async def upload_lab_report_file(patient_id: str, file: UploadFile = File(...)):
    client = get_client()
    patient_check = (
        client.table("patients").select("patient_id").eq("patient_id", patient_id).limit(1).execute()
    )
    if not patient_check.data:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(content) > settings.MAX_UPLOAD_FILE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large (max {settings.MAX_UPLOAD_FILE_BYTES // (1024 * 1024)}MB)",
        )

    mime_type = file.content_type or ""
    if mime_type == "text/plain":
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Could not read this file as UTF-8 text")
        if not text.strip():
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        result = ingest_lab_report(client, patient_id, text)
    elif mime_type in SUPPORTED_DOCUMENT_FILE_MIME_TYPES:
        result = ingest_lab_report_file(client, patient_id, content, mime_type, file.filename)
    else:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {mime_type or 'unknown'}. "
            "Upload a PDF, PNG, JPEG, or plain text file.",
        )

    return UploadLabResponse(patient_id=patient_id, **result)


@router.post("/patients/{patient_id}/upload-document", response_model=UploadDocumentResponse)
async def upload_patient_document(
    patient_id: str, document_type: str = Form(...), file: UploadFile = File(...)
):
    if document_type not in SUPPORTED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported document_type: {document_type!r}. "
            f"Must be one of: {', '.join(sorted(SUPPORTED_DOCUMENT_TYPES))}.",
        )

    client = get_client()
    patient_check = (
        client.table("patients").select("patient_id").eq("patient_id", patient_id).limit(1).execute()
    )
    if not patient_check.data:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(content) > settings.MAX_UPLOAD_FILE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large (max {settings.MAX_UPLOAD_FILE_BYTES // (1024 * 1024)}MB)",
        )

    result = store_patient_document(client, patient_id, document_type, content, file.filename)
    return UploadDocumentResponse(patient_id=patient_id, **result)
