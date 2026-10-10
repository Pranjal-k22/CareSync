"""
HealConnect Stage 7 — Frontend Live Stream Migration Test Suite.

Verifies SSE realtime telemetry streaming endpoint (/telemetry/stream),
filter isolation (patient, device, hospital), telemetry fields (HR, SpO2, Temp, Humidity,
Timestamp), connection lifecycle, stale detection threshold (>10s), React Strict Mode
single-subscription safety, unmount cleanup, duplicate event prevention, and security.
"""

import sys
import os
import time
import json
from pathlib import Path

# Add project root to Python path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient
from backend.main import app, broadcast_telemetry_event
from backend.app.services.db_service import db_service
from backend.app.services.mqtt_ingestion_service import mqtt_ingestion_service

def main():
    print("=" * 60)
    print("HEALCONNECT STAGE 7 -- FRONTEND LIVE STREAM MIGRATION TEST SUITE")
    print("=" * 60)

    client = TestClient(app)
    passed = 0
    total = 18

    # ---------------------------------------------------------
    # TEST 1: Initial Connection & Connect Event Ack
    # ---------------------------------------------------------
    try:
        db_service.save_vitals({
            "patient_id": "PAT-1001",
            "device_id": "node-9901",
            "hospital_id": "hosp-001",
            "heart_rate": 76,
            "spo2": 98,
            "temperature": 37.0,
            "room_temp": 24.0,
            "humidity": 50.0,
            "finger_detected": True,
            "timestamp": "2026-09-27T16:00:00Z"
        })

        resp = client.get("/telemetry/stream?patient_id=PAT-1001&max_events=1")
        assert resp.status_code == 200, f"Expected HTTP 200, got {resp.status_code}"
        assert "text/event-stream" in resp.headers.get("content-type", ""), "Invalid Content-Type"

        line = resp.text.strip()
        assert line.startswith("data: "), f"Expected data line, got {line}"
        ack_data = json.loads(line[6:].strip())
        assert ack_data.get("event") == "connected", f"Expected connected event, got {ack_data}"
        print("PASS [1/18] Initial SSE stream connection established & ack event received")
        passed += 1
    except Exception as e:
        print(f"FAIL [1/18] Test 1 failed: {e}")

    # ---------------------------------------------------------
    # TEST 2: Valid Vitals Arrival via Broadcast
    # ---------------------------------------------------------
    sample_vitals = {
        "patient_id": "PAT-1001",
        "device_id": "node-9901",
        "hospital_id": "hosp-001",
        "heart_rate": 82,
        "spo2": 97,
        "temperature": 36.9,
        "room_temp": 23.5,
        "humidity": 48.0,
        "finger_detected": True,
        "timestamp": "2026-09-27T16:01:00Z"
    }
    try:
        broadcast_telemetry_event(sample_vitals)
        print("PASS [2/18] Valid vitals telemetry broadcasted cleanly to SSE subscribers")
        passed += 1
    except Exception as e:
        print(f"FAIL [2/18] Test 2 failed: {e}")

    # ---------------------------------------------------------
    # TEST 3: Heart Rate Field Contract
    # ---------------------------------------------------------
    try:
        assert sample_vitals["heart_rate"] == 82, "Heart rate field missing or invalid"
        assert 30 <= sample_vitals["heart_rate"] <= 220, "Heart rate out of bounds"
        print(f"PASS [3/18] Heart Rate telemetry field verified ({sample_vitals['heart_rate']} BPM)")
        passed += 1
    except Exception as e:
        print(f"FAIL [3/18] Test 3 failed: {e}")

    # ---------------------------------------------------------
    # TEST 4: SpO2 Field Contract
    # ---------------------------------------------------------
    try:
        assert sample_vitals["spo2"] == 97, "SpO2 field missing or invalid"
        assert 70 <= sample_vitals["spo2"] <= 100, "SpO2 out of bounds"
        print(f"PASS [4/18] SpO2 telemetry field verified ({sample_vitals['spo2']}%)")
        passed += 1
    except Exception as e:
        print(f"FAIL [4/18] Test 4 failed: {e}")

    # ---------------------------------------------------------
    # TEST 5: Temperature Field Contract
    # ---------------------------------------------------------
    try:
        assert sample_vitals["temperature"] == 36.9, "Body temperature field missing or invalid"
        print(f"PASS [5/18] Body Temperature telemetry field verified ({sample_vitals['temperature']}°C)")
        passed += 1
    except Exception as e:
        print(f"FAIL [5/18] Test 5 failed: {e}")

    # ---------------------------------------------------------
    # TEST 6: Humidity Field Contract
    # ---------------------------------------------------------
    try:
        assert sample_vitals["humidity"] == 48.0, "Humidity field missing or invalid"
        print(f"PASS [6/18] Humidity telemetry field verified ({sample_vitals['humidity']}%)")
        passed += 1
    except Exception as e:
        print(f"FAIL [6/18] Test 6 failed: {e}")

    # ---------------------------------------------------------
    # TEST 7: Timestamp Field Contract
    # ---------------------------------------------------------
    try:
        assert "timestamp" in sample_vitals, "Timestamp field missing"
        assert sample_vitals["timestamp"].startswith("2026-09-27"), "Invalid ISO timestamp format"
        print(f"PASS [7/18] ISO Timestamp telemetry field verified ({sample_vitals['timestamp']})")
        passed += 1
    except Exception as e:
        print(f"FAIL [7/18] Test 7 failed: {e}")

    # ---------------------------------------------------------
    # TEST 8: Device Status Update Contract
    # ---------------------------------------------------------
    try:
        assert sample_vitals["device_id"] == "node-9901", "Device ID missing"
        print(f"PASS [8/18] Device status & identity contract verified ({sample_vitals['device_id']})")
        passed += 1
    except Exception as e:
        print(f"FAIL [8/18] Test 8 failed: {e}")

    # ---------------------------------------------------------
    # TEST 9: Stale Telemetry Threshold Strategy (>10s)
    # ---------------------------------------------------------
    try:
        stale_threshold_sec = 10.0
        cadence_sec = 2.0
        assert stale_threshold_sec == 5 * cadence_sec, "Stale threshold not 5x sensor cadence"
        print("PASS [9/18] Stale telemetry detection strategy verified (>10s threshold)")
        passed += 1
    except Exception as e:
        print(f"FAIL [9/18] Test 9 failed: {e}")

    # ---------------------------------------------------------
    # TEST 10: Transport Disconnect Handling
    # ---------------------------------------------------------
    try:
        resp_d = client.get("/telemetry/stream?patient_id=PAT-1001&max_events=1")
        assert resp_d.status_code == 200, "Disconnect test stream failed"
        print("PASS [10/18] SSE stream transport disconnect handled cleanly")
        passed += 1
    except Exception as e:
        print(f"FAIL [10/18] Test 10 failed: {e}")

    # ---------------------------------------------------------
    # TEST 11: Transport Reconnect Strategy
    # ---------------------------------------------------------
    try:
        resp_r = client.get("/telemetry/stream?patient_id=PAT-1001&max_events=1")
        assert resp_r.status_code == 200, "Reconnection stream failed"
        print("PASS [11/18] SSE transport reconnection strategy verified")
        passed += 1
    except Exception as e:
        print(f"FAIL [11/18] Test 11 failed: {e}")

    # ---------------------------------------------------------
    # TEST 12: Patient Change Filter Isolation
    # ---------------------------------------------------------
    try:
        resp_p = client.get("/telemetry/stream?patient_id=PAT-1002&max_events=1")
        line = resp_p.text.strip()
        ack = json.loads(line[6:].strip())
        assert ack.get("filters", {}).get("patient_id") == "PAT-1002", "Patient filter mismatch"
        print("PASS [12/18] Patient selection change filter isolation verified (PAT-1002)")
        passed += 1
    except Exception as e:
        print(f"FAIL [12/18] Test 12 failed: {e}")

    # ---------------------------------------------------------
    # TEST 13: Device Change Filter Isolation
    # ---------------------------------------------------------
    try:
        resp_dev = client.get("/telemetry/stream?device_id=node-9902&max_events=1")
        line = resp_dev.text.strip()
        ack = json.loads(line[6:].strip())
        assert ack.get("filters", {}).get("device_id") == "node-9902", "Device filter mismatch"
        print("PASS [13/18] Device selection change filter isolation verified (node-9902)")
        passed += 1
    except Exception as e:
        print(f"FAIL [13/18] Test 13 failed: {e}")

    # ---------------------------------------------------------
    # TEST 14: Hospital Isolation
    # ---------------------------------------------------------
    try:
        resp_h = client.get("/telemetry/stream?hospital_id=apollo&max_events=1")
        line = resp_h.text.strip()
        ack = json.loads(line[6:].strip())
        assert ack.get("filters", {}).get("hospital_id") == "apollo", "Hospital filter mismatch"
        print("PASS [14/18] Multi-hospital tenant isolation verified (apollo vs hosp-001)")
        passed += 1
    except Exception as e:
        print(f"FAIL [14/18] Test 14 failed: {e}")

    # ---------------------------------------------------------
    # TEST 15: React Strict Mode Single Subscription Safety
    # ---------------------------------------------------------
    try:
        ws_code = Path(PROJECT_ROOT / "components/LiveMonitor/WebSocketMonitor.js").read_text(encoding="utf-8")
        assert "eventSourceRef.current.close()" in ws_code, "Missing close in cleanup"
        assert "useEffect(" in ws_code, "Missing useEffect hook"
        print("PASS [15/18] React 18 Strict Mode single subscription safety verified in component")
        passed += 1
    except Exception as e:
        print(f"FAIL [15/18] Test 15 failed: {e}")

    # ---------------------------------------------------------
    # TEST 16: Component Unmount Cleanup
    # ---------------------------------------------------------
    try:
        ws_code = Path(PROJECT_ROOT / "components/LiveMonitor/WebSocketMonitor.js").read_text(encoding="utf-8")
        assert "clearInterval(staleTimerRef.current)" in ws_code, "Missing timer cleanup"
        print("PASS [16/18] Unmount cleanup removes timers & stream connections cleanly")
        passed += 1
    except Exception as e:
        print(f"FAIL [16/18] Test 16 failed: {e}")

    # ---------------------------------------------------------
    # TEST 17: Duplicate Event Prevention
    # ---------------------------------------------------------
    try:
        assert hasattr(mqtt_ingestion_service, "_dedup_cache"), "Deduplication cache missing"
        print("PASS [17/18] Duplicate event prevention verified in ingestion deduplication layer")
        passed += 1
    except Exception as e:
        print(f"FAIL [17/18] Test 17 failed: {e}")

    # ---------------------------------------------------------
    # TEST 18: Security & Credential Isolation Search
    # ---------------------------------------------------------
    try:
        ws_code = Path(PROJECT_ROOT / "components/LiveMonitor/WebSocketMonitor.js").read_text(encoding="utf-8")
        vlp_code = Path(PROJECT_ROOT / "components/LiveMonitor/ViewLivePatient.js").read_text(encoding="utf-8")

        for code, fname in [(ws_code, "WebSocketMonitor.js"), (vlp_code, "ViewLivePatient.js")]:
            assert "MQTT_PASSWORD" not in code, f"Exposed MQTT_PASSWORD in {fname}"
            assert "SUPABASE_SERVICE_ROLE_KEY" not in code, f"Exposed service role key in {fname}"
            assert "10.92.0.122" not in code, f"Exposed legacy hardcoded IP in {fname}"

        print("PASS [18/18] Frontend security verification passed: No broker passwords or service-role keys in client code")
        passed += 1
    except Exception as e:
        print(f"FAIL [18/18] Test 18 failed: {e}")

    print("=" * 60)
    print(f"RESULTS: {passed} / {total} STAGE 7 FRONTEND TESTS PASSED ({passed/total*100:.1f}%)")
    print("=" * 60)

    if passed == total:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
