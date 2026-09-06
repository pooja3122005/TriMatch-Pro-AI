from fastapi import APIRouter, HTTPException
from app.db.client import get_client
from app.models.schemas import (
    Candidate,
    CandidateListResponse,
    DBCandidateListResponse,
    DBCandidateSummary,
    LabResultRecord,
    MatchRequest,
    MatchResponse,
    ParseCriteriaRequest,
    ParseCriteriaResponse,
)
from app.services.audit_service import log_match_results
from app.services.coarse_filter_service import coarse_filter_patient_ids
from app.services.db_matching_service import match_patient_db
from app.services.llm_service import parse_criteria
from app.services.matching_service import match_patient
from app.services.patient_service import get_patient, load_patients
from app.services.trial_service import fetch_trial

router = APIRouter(tags=["matching"])

_MAX_EVALUATE_DEFAULT = 200
_OVERALL_RANK = {"eligible": 0, "needs more data": 1, "ineligible": 2}


@router.post("/trials/{nct_id}/match/{patient_id}", response_model=MatchResponse)
def match_db_patient(nct_id: str, patient_id: str):
    client = get_client()

    patient_check = (
        client.table("patients").select("patient_id").eq("patient_id", patient_id).limit(1).execute()
    )
    if not patient_check.data:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    criteria_rows = client.table("trial_criteria").select("*").eq("nct_id", nct_id).execute().data
    if not criteria_rows:
        raise HTTPException(
            status_code=404,
            detail=f"No parsed criteria for trial {nct_id} -- call POST /trials/{nct_id}/parse-criteria first",
        )

    overall, results = match_patient_db(client, patient_id, nct_id, criteria_rows=criteria_rows)
    return MatchResponse(patient_id=patient_id, overall=overall, results=results)


@router.get("/lab-results/{lab_result_id}", response_model=LabResultRecord)
def get_lab_result(lab_result_id: int):
    """Source data verification: fetches the exact lab_results row a match verdict cites."""
    client = get_client()
    res = client.table("lab_results").select("*").eq("lab_result_id", lab_result_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail=f"Lab result {lab_result_id} not found")
    return res.data[0]


@router.get("/trials/{nct_id}/db-candidates", response_model=DBCandidateListResponse)
def get_db_candidates(nct_id: str, limit: int = 50, max_evaluate: int = _MAX_EVALUATE_DEFAULT):
    client = get_client()

    criteria_rows = client.table("trial_criteria").select("*").eq("nct_id", nct_id).execute().data
    if not criteria_rows:
        raise HTTPException(
            status_code=404,
            detail=f"No parsed criteria for trial {nct_id} -- call POST /trials/{nct_id}/parse-criteria first",
        )

    total_patients = (
        client.table("patients").select("patient_id", count="exact").limit(0).execute().count
    )

    safe_ids = coarse_filter_patient_ids(client, criteria_rows)
    if safe_ids is None:
        all_ids = client.table("patients").select("patient_id").limit(2000).execute().data
        candidate_ids = sorted(r["patient_id"] for r in all_ids)
    else:
        candidate_ids = sorted(safe_ids)

    coarse_filtered_count = len(candidate_ids)
    to_evaluate = candidate_ids[:max_evaluate]

    demographics = {}
    if to_evaluate:
        demo_rows = (
            client.table("patients")
            .select("patient_id, age, gender")
            .in_("patient_id", to_evaluate)
            .execute()
            .data
        )
        demographics = {r["patient_id"]: (r["age"], r["gender"]) for r in demo_rows}

    candidates = []
    for pid in to_evaluate:
        overall, results = match_patient_db(client, pid, nct_id, criteria_rows=criteria_rows)
        age, sex = demographics.get(pid, (None, None))
        candidates.append(
            DBCandidateSummary(
                patient_id=pid,
                age=age,
                sex=sex,
                overall=overall,
                pass_count=sum(1 for r in results if r.verdict == "pass"),
                fail_count=sum(1 for r in results if r.verdict == "fail"),
                unknown_count=sum(1 for r in results if r.verdict == "unknown"),
            )
        )

    candidates.sort(
        key=lambda c: (_OVERALL_RANK[c.overall], -c.pass_count, c.unknown_count, c.fail_count)
    )

    return DBCandidateListResponse(
        nct_id=nct_id,
        total_patients=total_patients or 0,
        coarse_filtered_count=coarse_filtered_count,
        evaluated_count=len(candidates),
        returned=min(limit, len(candidates)),
        candidates=candidates[:limit],
    )


@router.post("/parse-criteria", response_model=ParseCriteriaResponse)
def parse_criteria_endpoint(request: ParseCriteriaRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")
    criteria = parse_criteria(request.text)
    return ParseCriteriaResponse(criteria=criteria)


@router.post("/match", response_model=MatchResponse)
def match_endpoint(request: MatchRequest):
    patient = get_patient(request.patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail=f"Patient {request.patient_id} not found")
    overall, results = match_patient(patient, request.criteria)
    log_match_results(patient.id, results, nct_id=request.nct_id)
    return MatchResponse(patient_id=patient.id, overall=overall, results=results)


@router.get("/trials/{nct_id}/candidates", response_model=CandidateListResponse)
async def get_candidates(nct_id: str):
    trial = await fetch_trial(nct_id)
    eligibility_text = trial.get("eligibility_criteria")
    if not eligibility_text:
        raise HTTPException(
            status_code=422, detail=f"Trial {nct_id} has no eligibility criteria text"
        )
    criteria = parse_criteria(eligibility_text)

    candidates = []
    for patient in load_patients():
        overall, results = match_patient(patient, criteria)
        log_match_results(patient.id, results, nct_id=nct_id)
        candidates.append(
            Candidate(
                patient_id=patient.id,
                overall=overall,
                pass_count=sum(1 for r in results if r.verdict == "pass"),
                fail_count=sum(1 for r in results if r.verdict == "fail"),
                unknown_count=sum(1 for r in results if r.verdict == "unknown"),
                results=results,
            )
        )

    candidates.sort(
        key=lambda c: (_OVERALL_RANK[c.overall], -c.pass_count, c.unknown_count, c.fail_count)
    )

    return CandidateListResponse(
        nct_id=trial["nct_id"], title=trial["title"], criteria=criteria, candidates=candidates
    )
