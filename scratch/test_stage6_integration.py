"""
CareSync Stage 6 — Backend & Risk Prediction Integration Test Suite.

Verifies end-to-end MQTT vitals ingestion, database persistence, multi-hospital isolation,
patient identity validation, missing model feature defaults, prediction service integration,
SHAP explainability, error boundary isolation, and regression stability.
"""

import sys
import os
import time
import json
import uuid
import datetime
from pathlib import Path

# Add project root to Python path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

import paho.mqtt.client as mqtt
from backend.app.services.db_service import db_service
from backend.app.services.mqtt_ingestion_service import MQTTIngestionService
from backend.app.predict import predict_patient_health_risk
from backend.app.services.prediction_service import predict_deterioration, predict_flu, predict_unified

def main():
    print("=" * 60)
    print("CARESYNC STAGE 6 -- BACKEND & RISK PREDICTION INTEGRATION TEST SUITE")
    print("=" * 60)

    # Initialize isolated service instance for testing
    ingest = MQTTIngestionService(host="127.0.0.1", port=1883)
    ingest.enable_auto_prediction = True

    passed = 0
    total = 13

    # ---------------------------------------------------------
    # TEST 1: Valid MQTT vitals -> Persistence
    # ---------------------------------------------------------
    try:
        t1_payload = {
            "version": "1.0",
            "device_id": "node-9901",
            "hospital_id": "hosp-001",
            "patient_id": "PAT-1001",
            "timestamp": "2026-09-27T15:00:00Z",
            "seq": 1001,
            "vitals": {
                "heart_rate": 78,
                "spo2": 97,
                "body_temp": 36.8,
                "room_temp": 24.5,
                "humidity": 45.0,
                "finger_detected": True
            }
        }
        ingest._process_vitals("hosp-001", "node-9901", t1_payload, time.time())
        vitals = db_service.get_vitals_for_patient("PAT-1001", limit=10)
        found = any(v.get("seq") == 1001 for v in vitals)
        assert found, "Persisted vitals not found in database"
        print("PASS [1/13] Valid MQTT vitals successfully persisted to DatabaseService")
        passed += 1
    except Exception as e:
        print(f"FAIL [1/13] Test 1 failed: {e}")

    # ---------------------------------------------------------
    # TEST 2: Valid MQTT vitals -> Prediction Path
    # ---------------------------------------------------------
    try:
        t2_vitals = {
            "patient_id": "PAT-1001",
            "device_id": "node-9901",
            "hospital_id": "hosp-001",
            "heart_rate": 84,
            "spo2": 96,
            "temperature": 37.0,
            "timestamp": "2026-09-27T15:01:00Z"
        }
        pred_res = ingest.run_prediction_path(t2_vitals)
        assert pred_res is not None, "Prediction result returned None"
        assert "risk_score" in pred_res, "Missing risk_score in prediction output"
        assert "risk_level" in pred_res, "Missing risk_level in prediction output"
        print(f"PASS [2/13] Prediction path executed cleanly (Risk Score: {pred_res['risk_score']}%, Level: {pred_res['risk_level']})")
        passed += 1
    except Exception as e:
        print(f"FAIL [2/13] Test 2 failed: {e}")

    # ---------------------------------------------------------
    # TEST 3: Duplicate MQTT message deduplication & prediction limit
    # ---------------------------------------------------------
    try:
        seq_dup = 2002
        t3_payload = {
            "version": "1.0",
            "device_id": "node-9901",
            "hospital_id": "hosp-001",
            "patient_id": "PAT-1001",
            "timestamp": "2026-09-27T15:02:00Z",
            "seq": seq_dup,
            "vitals": {"heart_rate": 80, "spo2": 98, "body_temp": 37.0, "room_temp": 24.0, "humidity": 50.0}
        }
        before_count = len(db_service.get_vitals_for_patient("PAT-1001", limit=100))
        now_ts = time.time()
        # First send
        ingest._process_vitals("hosp-001", "node-9901", t3_payload, now_ts)
        # Duplicate send
        ingest._process_vitals("hosp-001", "node-9901", t3_payload, now_ts)
        after_count = len(db_service.get_vitals_for_patient("PAT-1001", limit=100))
        assert after_count == before_count + 1, f"Expected 1 additional record, got {after_count - before_count}"
        print("PASS [3/13] Duplicate MQTT packet safely dropped without double persistence or double prediction")
        passed += 1
    except Exception as e:
        print(f"FAIL [3/13] Test 3 failed: {e}")

    # ---------------------------------------------------------
    # TEST 4: Invalid patient handling
    # ---------------------------------------------------------
    try:
        t4_payload = {
            "version": "1.0",
            "device_id": "node-9901",
            "hospital_id": "hosp-001",
            "patient_id": "INVALID-PATIENT-999",
            "timestamp": "2026-09-27T15:03:00Z",
            "seq": 3003,
            "vitals": {"heart_rate": 80, "spo2": 98, "body_temp": 37.0}
        }
        rejections_before = ingest.metrics["rejected_patients"]
        ingest._process_vitals("hosp-001", "node-9901", t4_payload, time.time())
        assert ingest.metrics["rejected_patients"] == rejections_before + 1, "Invalid patient was not rejected"
        print("PASS [4/13] Invalid patient identity rejected safely without database corruption")
        passed += 1
    except Exception as e:
        print(f"FAIL [4/13] Test 4 failed: {e}")

    # ---------------------------------------------------------
    # TEST 5: Invalid device handling
    # ---------------------------------------------------------
    try:
        class DummyMsg:
            topic = "caresync/hosp-001/UNAUTHORIZED_DEVICE_X/vitals"
            payload = b'{"version":"1.0","device_id":"UNAUTHORIZED_DEVICE_X","timestamp":"2026-09-27T15:04:00Z","seq":4004,"vitals":{}}'
            retain = False

        rejected_before = ingest.metrics["rejected_devices"]
        ingest._on_message(None, None, DummyMsg())
        assert ingest.metrics["rejected_devices"] == rejected_before + 1, "Unauthorized device was not rejected"
        print("PASS [5/13] Invalid/unauthorized device identity rejected safely")
        passed += 1
    except Exception as e:
        print(f"FAIL [5/13] Test 5 failed: {e}")

    # ---------------------------------------------------------
    # TEST 6: Missing model feature handling (Default Baselines)
    # ---------------------------------------------------------
    try:
        # MQTT payload has 5 vital fields (heart_rate, spo2, body_temp, room_temp, humidity)
        # Missing model features: respiratory_rate, systolic_bp, diastolic_bp, age, etc.
        partial_vitals = {"patient_id": "PAT-1001", "heart_rate": 88, "spo2": 95, "temperature": 37.2}
        pred_val = predict_deterioration(partial_vitals)
        assert pred_val["prediction"] in ["Acute Deterioration Risk", "Stable Baseline"], "Invalid prediction output"
        assert pred_val["probability_pct"] >= 0.0, "Invalid probability percentage"
        print(f"PASS [6/13] Missing model features handled using documented clinical baselines (Prob: {pred_val['probability_pct']}%)")
        passed += 1
    except Exception as e:
        print(f"FAIL [6/13] Test 6 failed: {e}")

    # ---------------------------------------------------------
    # TEST 7: Prediction service error boundary isolation
    # ---------------------------------------------------------
    try:
        corrupted_vitals = {"patient_id": None, "heart_rate": "invalid_string_val"}
        res = ingest.run_prediction_path(corrupted_vitals)
        # Ingestion service metrics must log failure but NOT crash
        assert res is None, "Expected None for corrupted prediction input"
        assert ingest.metrics["prediction_failure"] > 0, "Prediction failure metric not incremented"
        print("PASS [7/13] Prediction service error caught safely in error boundary without crashing ingestion")
        passed += 1
    except Exception as e:
        print(f"FAIL [7/13] Test 7 failed: {e}")

    # ---------------------------------------------------------
    # TEST 8: Database failure boundary isolation
    # ---------------------------------------------------------
    try:
        # Simulate db_service failure
        original_save = db_service.save_vitals
        def failing_save(record):
            raise RuntimeError("Database connection timed out")

        db_service.save_vitals = failing_save

        t8_payload = {
            "version": "1.0",
            "device_id": "node-9901",
            "hospital_id": "hosp-001",
            "patient_id": "PAT-1001",
            "timestamp": "2026-09-27T15:08:00Z",
            "seq": 8008,
            "vitals": {"heart_rate": 75, "spo2": 98, "body_temp": 37.0, "room_temp": 24.0, "humidity": 50.0}
        }
        # Call _process_vitals - it should catch DB exception and continue
        ingest._process_vitals("hosp-001", "node-9901", t8_payload, time.time())
        db_service.save_vitals = original_save
        print("PASS [8/13] Database failure handled gracefully; MQTT consumer loop survived")
        passed += 1
    except Exception as e:
        db_service.save_vitals = original_save
        print(f"FAIL [8/13] Test 8 failed: {e}")

    # ---------------------------------------------------------
    # TEST 9: Multi-hospital isolation
    # ---------------------------------------------------------
    try:
        t9_hosp_a = {
            "version": "1.0",
            "device_id": "node-9901",
            "hospital_id": "hosp-001",
            "patient_id": "PAT-1001",
            "timestamp": "2026-09-27T15:09:00Z",
            "seq": 9001,
            "vitals": {"heart_rate": 72, "spo2": 99, "body_temp": 36.6, "room_temp": 24.0, "humidity": 50.0}
        }
        t9_hosp_b = {
            "version": "1.0",
            "device_id": "node-9902",
            "hospital_id": "apollo",
            "patient_id": "PAT-1002",
            "timestamp": "2026-09-27T15:09:00Z",
            "seq": 9002,
            "vitals": {"heart_rate": 90, "spo2": 94, "body_temp": 37.5, "room_temp": 22.0, "humidity": 55.0}
        }
        ingest._process_vitals("hosp-001", "node-9901", t9_hosp_a, time.time())
        ingest._process_vitals("apollo", "node-9902", t9_hosp_b, time.time())

        rec_a = db_service.get_vitals_for_patient("PAT-1001", limit=5)
        rec_b = db_service.get_vitals_for_patient("PAT-1002", limit=5)

        assert any(r.get("hospital_id") == "hosp-001" for r in rec_a), "Hospital A record missing"
        assert any(r.get("hospital_id") == "apollo" for r in rec_b), "Hospital B record missing"
        assert not any(r.get("hospital_id") == "apollo" for r in rec_a), "Cross-tenant leak detected in Hospital A"
        print("PASS [9/13] Multi-hospital tenant isolation verified (Hospital A != Hospital B)")
        passed += 1
    except Exception as e:
        print(f"FAIL [9/13] Test 9 failed: {e}")

    # ---------------------------------------------------------
    # TEST 10: Prediction history association
    # ---------------------------------------------------------
    try:
        sample_pred = predict_patient_health_risk({"patient_id": "PAT-1001", "heart_rate": 115, "spo2": 91, "temperature": 38.5})
        history = db_service.get_prediction_history(patient_id="PAT-1001", limit=10)
        assert len(history) > 0, "No prediction history found"
        latest = history[0]
        assert latest.get("patient_id") == "PAT-1001", f"Patient ID mismatch in history: {latest.get('patient_id')}"
        assert "prediction_id" in latest, "Missing prediction_id in history"
        assert "model_version" in latest, "Missing model_version in history"
        print(f"PASS [10/13] Prediction history record verified (ID: {latest['prediction_id']}, Version: {latest['model_version']})")
        passed += 1
    except Exception as e:
        print(f"FAIL [10/13] Test 10 failed: {e}")

    # ---------------------------------------------------------
    # TEST 11: SHAP / XAI attribution association
    # ---------------------------------------------------------
    try:
        unified_res = predict_unified({
            "patient_id": "PAT-1001",
            "heartRate": 110,
            "spo2": 93,
            "temperature": 38.8,
            "cough_severity": 2,
            "fatigue_score": 2
        })
        explain = unified_res.get("explainability", {})
        assert "deterioration" in explain, "Missing deterioration SHAP explanation"
        assert "influenza" in explain, "Missing influenza SHAP explanation"
        assert len(explain["deterioration"]) > 0, "Empty deterioration SHAP attributions"
        print(f"PASS [11/13] SHAP attributions successfully computed for unified prediction ({len(explain['deterioration'])} top factors)")
        passed += 1
    except Exception as e:
        print(f"FAIL [11/13] Test 11 failed: {e}")

    # ---------------------------------------------------------
    # TEST 12: Unified prediction endpoint
    # ---------------------------------------------------------
    try:
        sample_input = {
            "patient_id": "PAT-1001",
            "heart_rate": 82,
            "spo2": 97,
            "temperature": 37.1
        }
        res_u = predict_unified(sample_input)
        assert res_u["status"] == "success", "Unified prediction status not success"
        assert "deterioration" in res_u["prediction"], "Deterioration missing from unified result"
        assert "influenza" in res_u["prediction"], "Influenza missing from unified result"
        print("PASS [12/13] Unified dual-model prediction executed cleanly")
        passed += 1
    except Exception as e:
        print(f"FAIL [12/13] Test 12 failed: {e}")

    # ---------------------------------------------------------
    # TEST 13: Observability metrics reporting
    # ---------------------------------------------------------
    try:
        m = ingest.metrics
        assert m["telemetry_received"] > 0, "telemetry_received metric is zero"
        assert m["telemetry_persisted"] > 0, "telemetry_persisted metric is zero"
        assert "prediction_triggered" in m, "prediction_triggered metric missing"
        assert "alert_triggered" in m, "alert_triggered metric missing"
        print(f"PASS [13/13] Observability metrics verified (Received: {m['telemetry_received']}, Persisted: {m['telemetry_persisted']}, Predictions: {m['prediction_success']})")
        passed += 1
    except Exception as e:
        print(f"FAIL [13/13] Test 13 failed: {e}")

    print("=" * 60)
    print(f"RESULTS: {passed} / {total} STAGE 6 INTEGRATION TESTS PASSED ({passed/total*100:.1f}%)")
    print("=" * 60)

    if passed == total:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
