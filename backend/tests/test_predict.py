import pytest
import pandas as pd
from backend.app.predict import compute_patient_prediction, VitalsInput

def test_vitals_validation_and_prediction():
    vitals = VitalsInput(
        patient_id="PAT-1001",
        heart_rate=125.0,
        spo2_pct=88.0,
        temperature=102.5,
        systolic_bp=145.0,
        diastolic_bp=90.0,
        respiratory_rate=24.0,
        age=65.0,
        gender="Male"
    )

    res = compute_patient_prediction(vitals)

    assert res["patient_id"] == "PAT-1001"
    assert "risk_score" in res
    assert 0.0 <= res["risk_score"] <= 100.0
    assert res["risk_level"] in ["low", "medium", "high"]
    assert res["model_version"] == "v1.0"
    assert "top_factors" in res
    assert len(res["top_factors"]) > 0

def test_normal_vitals_low_risk():
    vitals = VitalsInput(
        patient_id="PAT-1002",
        heart_rate=72.0,
        spo2_pct=99.0,
        temperature=98.6,
        systolic_bp=118.0,
        diastolic_bp=78.0,
        respiratory_rate=15.0,
        age=28.0,
        gender="Female"
    )

    res = compute_patient_prediction(vitals)
    assert res["patient_id"] == "PAT-1002"
    assert res["risk_level"] == "low"
