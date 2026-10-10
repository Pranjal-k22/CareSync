import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_save_prediction_history():
    payload = {
        "patient_id": "TEST-SAVE-001",
        "heartRate": 105,
        "spo2": 95,
        "temperature_c": 38.5
    }
    res = client.post("/predict-unified", json=payload)
    assert res.status_code == 200

def test_retrieve_prediction_history():
    res = client.get("/predictions/history?page=1&limit=5")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "records" in data

def test_pagination_and_sorting():
    res = client.get("/predictions/history?page=1&limit=2&sort=desc")
    assert res.status_code == 200
    data = res.json()
    assert data["limit"] == 2
    assert len(data["records"]) <= 2
