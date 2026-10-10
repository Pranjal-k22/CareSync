import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_predict_endpoint():
    payload = {
        "patient_id": "PAT-1001",
        "heartRate": 110,
        "spo2": 90,
        "temperature": 101.2,
        "systolicBp": 135,
        "diastolicBp": 88,
        "respiratoryRate": 22,
        "age": 55,
        "gender": "Male"
    }

    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "risk_level" in data
    assert "top_factors" in data

def test_federated_status_endpoint():
    response = client.get("/federated/status")
    assert response.status_code == 200
    data = response.json()
    assert data["hospitals_connected"] == 3
    assert "global_accuracy" in data

def test_predict_disease_endpoint():
    payload = {
        "patient_id": "DIS-1001",
        "temperature_c": 38.6,
        "heart_rate": 98,
        "spo2_pct": 96.0,
        "cough_severity": 2,
        "chills": 1,
        "age": 35
    }
    response = client.post("/predict-disease", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_condition" in data
    assert "confidence" in data

def test_explain_prediction_endpoint():
    response = client.get("/explain/PRED-1001")
    assert response.status_code == 200
    data = response.json()
    assert "shap_explanation" in data or "prediction_id" in data

def test_federated_train_endpoint():
    response = client.post("/federated/train", json={"num_rounds": 1})
    assert response.status_code == 200
    data = response.json()
    assert "message" in data or "status" in data or "success" in data

def test_get_models_registry_endpoint():
    response = client.get("/models")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "deterioration" in data["registered_models"]
    assert "disease" in data["registered_models"]

def test_predict_unified_endpoint():
    payload = {
        "patient_id": "UNIFIED-TEST-100",
        "heartRate": 110,
        "spo2": 95,
        "temperature_c": 38.8,
        "cough_severity": 3,
        "fatigue_score": 3,
        "age": 42,
        "gender": "Male"
    }
    response = client.post("/predict-unified", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "prediction" in data
    assert "explainability" in data
    assert "models" in data
    assert "deterioration" in data["prediction"]
    assert "influenza" in data["prediction"]
    assert "risk_score" in data["prediction"]["deterioration"]
    assert "risk_percentage" in data["prediction"]["influenza"]

def test_predict_validation_error():
    # Out of bounds heart_rate (350 BPM > max 250 BPM)
    invalid_payload = {
        "patient_id": "PAT-1001",
        "heartRate": 350,
        "spo2": 90,
        "temperature": 101.2
    }
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422
    data = response.json()
    assert data["status"] == "error"
    assert "message" in data
    assert "Traceback" not in str(data)

def test_explain_disease_endpoint():
    payload = {
        "patient_id": "DIS-1001",
        "temperature_c": 38.9,
        "cough_severity": 3,
        "fatigue_score": 3
    }
    response = client.post("/explain-disease", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "top_contributing_features" in data
    assert "disclaimer" in data

def test_predictions_history_paginated_endpoint():
    response = client.get("/predictions/history?page=1&limit=5&sort=desc")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "records" in data
    assert data["limit"] == 5
    assert len(data["records"]) <= 5

def test_prediction_by_id_not_found():
    response = client.get("/predictions/NON-EXISTENT-ID-999")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "Traceback" not in str(data)
