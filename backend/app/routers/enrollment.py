from typing import Literal
from fastapi import APIRouter, HTTPException
from app.db.client import get_client
from app.models.schemas import AuditLogRow, EnrollmentRecord
from app.services.enrollment_service import (
    InvalidTransitionError,
    consent_patient,
    decline_patient,
    enroll_patient,
    invite_patient,
    list_enrollment,
    list_patient_enrollment,
    list_trial_audit,
    withdraw_patient,
)

router = APIRouter(tags=["enrollment"])


def _run_transition(fn, *args):
    try:
        return fn(*args)
    except InvalidTransitionError as exc:
        raise HTTPException(status_code=409, detail=str(exc))


@router.post("/trials/{nct_id}/patients/{patient_id}/invite", response_model=EnrollmentRecord)
def invite(nct_id: str, patient_id: str):
    client = get_client()
    return _run_transition(invite_patient, client, patient_id, nct_id)


@router.post("/trials/{nct_id}/patients/{patient_id}/consent", response_model=EnrollmentRecord)
def consent(nct_id: str, patient_id: str):
    client = get_client()
    return _run_transition(consent_patient, client, patient_id, nct_id)


@router.post("/trials/{nct_id}/patients/{patient_id}/enroll", response_model=EnrollmentRecord)
def enroll(nct_id: str, patient_id: str):
    client = get_client()
    return _run_transition(enroll_patient, client, patient_id, nct_id)


@router.post("/trials/{nct_id}/patients/{patient_id}/withdraw", response_model=EnrollmentRecord)
def withdraw(nct_id: str, patient_id: str, actor: Literal["patient", "researcher"] = "researcher"):
    client = get_client()
    return _run_transition(withdraw_patient, client, patient_id, nct_id, actor)


@router.post("/trials/{nct_id}/patients/{patient_id}/decline", response_model=EnrollmentRecord)
def decline(nct_id: str, patient_id: str):
    client = get_client()
    return _run_transition(decline_patient, client, patient_id, nct_id)


@router.get("/trials/{nct_id}/enrollment", response_model=list[EnrollmentRecord])
def get_enrollment(nct_id: str):
    client = get_client()
    return list_enrollment(client, nct_id)


@router.get("/patients/{patient_id}/enrollment", response_model=list[EnrollmentRecord])
def get_patient_enrollment(patient_id: str):
    client = get_client()
    return list_patient_enrollment(client, patient_id)


@router.get("/trials/{nct_id}/audit", response_model=list[AuditLogRow])
def get_trial_audit(nct_id: str, limit: int = 200):
    client = get_client()
    return list_trial_audit(client, nct_id, limit=limit)
