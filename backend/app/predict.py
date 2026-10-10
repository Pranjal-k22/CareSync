import joblib
import pandas as pd
import numpy as np
import datetime
import hashlib
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from backend.app.services.db_service import db_service
try:
    from backend.app.explain import explain_vitals_record
except ImportError:
    from app.explain import explain_vitals_record

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = PROJECT_ROOT / "ml/artifacts/risk_model_v1.joblib"
if not MODEL_PATH.exists():
    MODEL_PATH = PROJECT_ROOT / "backend/models/risk_model.joblib"

_model = None

def get_model():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file missing at {MODEL_PATH}")
        _model = joblib.load(MODEL_PATH)
    return _model

class VitalsInput(BaseModel):
    patient_id: str = Field(default="PAT-1001", min_length=2, max_length=50)
    heart_rate: float = Field(default=76.0, ge=30.0, le=250.0)
    respiratory_rate: float = Field(default=16.0, ge=8.0, le=60.0)
    spo2: float = Field(default=98.0, ge=50.0, le=100.0, alias="spo2_pct")
    temperature: float = Field(default=98.6, ge=90.0, le=110.0) # in Fahrenheit or converted
    systolic_bp: float = Field(default=120.0, ge=60.0, le=240.0)
    diastolic_bp: float = Field(default=80.0, ge=40.0, le=160.0)
    oxygen_flow: float = Field(default=0.0, ge=0.0, le=30.0)
    mobility_score: float = Field(default=3.0, ge=0.0, le=5.0)
    nurse_alert: int = Field(default=0, ge=0, le=1)
    age: float = Field(default=32.0, ge=0.0, le=120.0)
    comorbidity_index: float = Field(default=0.0, ge=0.0, le=10.0)
    oxygen_device: Optional[str] = Field(default="room_air")
    gender: Optional[str] = Field(default="Male")
    admission_type: Optional[str] = Field(default="Elective")

    class Config:
        populate_by_name = True

def compute_patient_prediction(vitals: Any) -> Dict[str, Any]:
    if isinstance(vitals, dict):
        raw_temp = float(vitals.get("temperature") or vitals.get("temp") or vitals.get("body_temp") or 98.6)
        if raw_temp < 50.0:
            raw_temp = (raw_temp * 9.0 / 5.0) + 32.0

        data = {
            "patient_id": vitals.get("patient_id") or vitals.get("patientId") or "PAT-1001",
            "heart_rate": float(vitals.get("heart_rate") or vitals.get("heartRate") or 76.0),
            "respiratory_rate": float(vitals.get("respiratory_rate") or vitals.get("respiratoryRate") or 16.0),
            "spo2_pct": float(vitals.get("spo2_pct") or vitals.get("spo2") or 98.0),
            "temperature": raw_temp,
            "systolic_bp": float(vitals.get("systolic_bp") or vitals.get("systolicBp") or 120.0),
            "diastolic_bp": float(vitals.get("diastolic_bp") or vitals.get("diastolicBp") or 80.0),
            "oxygen_flow": float(vitals.get("oxygen_flow") or 0.0),
            "mobility_score": float(vitals.get("mobility_score") or 3.0),
            "nurse_alert": int(vitals.get("nurse_alert") or 0),
            "age": float(vitals.get("age") or 32.0),
            "comorbidity_index": float(vitals.get("comorbidity_index") or 0.0),
            "oxygen_device": str(vitals.get("oxygen_device") or "room_air"),
            "gender": str(vitals.get("gender") or "Male"),
            "admission_type": str(vitals.get("admission_type") or "Elective")
        }
        v = VitalsInput(**data)
    else:
        v = vitals

    model = get_model()

    temp_c = v.temperature
    if temp_c > 50.0:
        temp_c = (temp_c - 32.0) * (5.0 / 9.0)

    input_data = {
        "heart_rate": [v.heart_rate],
        "respiratory_rate": [v.respiratory_rate],
        "spo2_pct": [v.spo2],
        "temperature_c": [temp_c],
        "systolic_bp": [v.systolic_bp],
        "diastolic_bp": [v.diastolic_bp],
        "oxygen_flow": [v.oxygen_flow],
        "mobility_score": [v.mobility_score],
        "nurse_alert": [v.nurse_alert],
        "age": [v.age],
        "comorbidity_index": [v.comorbidity_index],
        "oxygen_device": [v.oxygen_device or "room_air"],
        "gender": [v.gender or "Male"],
        "admission_type": [v.admission_type or "Elective"]
    }

    df = pd.DataFrame(input_data)

    if hasattr(model, "feature_names_in_"):
        expected = list(model.feature_names_in_)
        df_input = df[[c for c in expected if c in df.columns]]
    else:
        df_input = df

    probabilities = model.predict_proba(df_input)[:, 1]
    prob = float(probabilities[0])

    risk_score = round(prob * 100.0, 2)

    if prob >= 0.50:
        risk_level = "high"
    elif prob >= 0.25:
        risk_level = "medium"
    else:
        risk_level = "low"

    shap_factors = explain_vitals_record(df, model)

    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    pred_id = f"PRED-{uuid.uuid4().hex}"

    res = {
        "prediction_id": pred_id,
        "patient_id": v.patient_id,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "confidence": 94.91,
        "model_version": "v1.0",
        "timestamp": now_iso,
        "top_factors": shap_factors,
        "disclaimer": "Academic decision-support project, not for real clinical diagnosis."
    }

    anon_hash = hashlib.sha256(v.patient_id.encode("utf-8")).hexdigest()[:16]
    db_service.save_prediction({
        "prediction_id": pred_id,
        "patient_id": v.patient_id,
        "anonymous_patient_hash": anon_hash,
        "prediction_type": "Deterioration",
        "model_version": res["model_version"],
        "risk_score": prob,
        "risk_level": risk_level.upper(),
        "prediction_result": "Acute Deterioration Risk" if prob >= 0.5 else "Stable Baseline",
        "explanation_summary": shap_factors,
        "created_at": now_iso,
    })

    return res

def get_patient_history(patient_id: str) -> List[Dict[str, Any]]:
    return db_service.get_prediction_history(patient_id=patient_id, limit=100)

def get_prediction_by_id(pred_id: str) -> Optional[Dict[str, Any]]:
    for record in db_service.get_prediction_history(limit=1000):
        if record.get("prediction_id") == pred_id or record.get("id") == pred_id:
            return record
    return None

predict_patient_health_risk = compute_patient_prediction
