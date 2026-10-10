import pytest
from backend.app.services.explainability_service import explain_deterioration, explain_disease

def test_shap_explanation_deterioration():
    sample = {
        "heartRate": 115,
        "spo2": 92,
        "temperature_c": 38.9,
        "systolicBp": 140,
        "diastolicBp": 90,
        "respiratoryRate": 24,
        "age": 55
    }
    res = explain_deterioration(sample)
    assert res["status"] == "success"
    assert "top_contributing_features" in res
    assert "disclaimer" in res

def test_shap_explanation_disease():
    sample = {
        "temperature_c": 38.9,
        "cough_severity": 3,
        "fatigue_score": 3
    }
    res = explain_disease(sample)
    assert res["status"] == "success"
    assert "top_contributing_features" in res
    assert "disclaimer" in res

def test_missing_explanation_fallback():
    # Empty payload handling
    res = explain_deterioration({})
    assert "status" in res
