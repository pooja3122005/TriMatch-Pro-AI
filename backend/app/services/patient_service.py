import json
from functools import lru_cache
from pathlib import Path
from app.models.schemas import Patient

_POSSIBLE_PATHS = [
    Path(__file__).resolve().parent.parent.parent / "data" / "patients.json",
    Path(__file__).resolve().parent.parent / "data" / "patients.json",
    Path(__file__).resolve().parent / "data" / "patients.json",
]


def _get_data_file() -> Path:
    for p in _POSSIBLE_PATHS:
        if p.exists():
            return p
    return _POSSIBLE_PATHS[0]


@lru_cache
def load_patients() -> list[Patient]:
    data_file = _get_data_file()
    with open(data_file, "r", encoding="utf-8") as f:
        raw = json.load(f)
    return [Patient(**p) for p in raw]


def get_patient(patient_id: str) -> Patient | None:
    for patient in load_patients():
        if patient.id == patient_id:
            return patient
    return None
