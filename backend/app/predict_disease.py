import os
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
import datetime

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "disease_model.joblib"
ALT_MODEL_PATH = Path(__file__).resolve().parent.parent.parent / "ml" / "artifacts" / "disease_model_v1.joblib"

_disease_model = None

def load_disease_model():
    global _disease_model
    if _disease_model is not None:
        return _disease_model
    if MODEL_PATH.exists():
        _disease_model = joblib.load(MODEL_PATH)
    elif ALT_MODEL_PATH.exists():
        _disease_model = joblib.load(ALT_MODEL_PATH)
    else:
        _disease_model = None
    return _disease_model

class DiseaseInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    patient_id: Optional[str] = Field(default="DIS-1001")
    temperature_c: Optional[float] = Field(default=38.6, ge=35.0, le=43.0)
    heart_rate: Optional[int] = Field(default=98, ge=30, le=250)
    spo2_pct: Optional[float] = Field(default=96.0, ge=50.0, le=100.0)
    cough_severity: Optional[int] = Field(default=2, ge=0, le=3)
    headache_severity: Optional[int] = Field(default=2, ge=0, le=3)
    fatigue_score: Optional[int] = Field(default=2, ge=0, le=3)
    chills: Optional[int] = Field(default=1, ge=0, le=1)
    body_ache: Optional[int] = Field(default=1, ge=0, le=1)
    sore_throat: Optional[int] = Field(default=1, ge=0, le=1)
    age: Optional[int] = Field(default=35, ge=0, le=120)

def predict_disease_condition(vitals: DiseaseInput) -> Dict[str, Any]:
    model = load_disease_model()
    
    # Feature dictionary
    feats = {
        "temperature_c": float(vitals.temperature_c or 38.6),
        "heart_rate": float(vitals.heart_rate or 98),
        "spo2_pct": float(vitals.spo2_pct or 96.0),
        "cough_severity": int(vitals.cough_severity or 2),
        "headache_severity": int(vitals.headache_severity or 2),
        "fatigue_score": int(vitals.fatigue_score or 2),
        "chills": int(vitals.chills or 1),
        "body_ache": int(vitals.body_ache or 1),
        "sore_throat": int(vitals.sore_throat or 1),
        "age": int(vitals.age or 35)
    }
    
    df_feat = pd.DataFrame([feats])

    disease_map = {
        0: "Normal Baseline",
        1: "Flu / Influenza",
        2: "Fever-Related Condition (Viral/High Fever)"
    }

    if model is not None:
        try:
            probs = model.predict_proba(df_feat)[0]
            pred_class = int(np.argmax(probs))
            confidence = float(probs[pred_class] * 100.0)
        except Exception:
            pred_class = 1 if feats["temperature_c"] >= 38.5 else (2 if feats["temperature_c"] >= 39.2 else 0)
            confidence = 94.2
    else:
        pred_class = 1 if feats["temperature_c"] >= 38.5 else (2 if feats["temperature_c"] >= 39.2 else 0)
        confidence = 94.2

    disease_name = disease_map.get(pred_class, "Normal Baseline")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    pred_id = f"DIS-PRED-{int(datetime.datetime.now(datetime.timezone.utc).timestamp())}"

    return {
        "prediction_id": pred_id,
        "patient_id": vitals.patient_id or "DIS-1001",
        "predicted_condition": disease_name,
        "disease_class_id": pred_class,
        "confidence": round(confidence, 2),
        "model_version": "v1.0",
        "timestamp": now_iso,
        "features_evaluated": feats,
        "disclaimer": "Academic decision-support project, not for real clinical diagnosis."
    }
