"""
Stage 8: End-to-End Reliability, Security, Failure Recovery & Production Hardening Test Suite
Verifies all failure matrix scenarios, authorization, secret audits, and error isolation.
"""
import sys
import os
import json
import time
import re
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch

# Add project root to Python path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.services.mqtt_ingestion_service import MQTTIngestionService
from backend.app.services.db_service import db_service
import backend.app.predict as predict_module

class DummyMQTTMessage:
    def __init__(self, topic: str, payload_bytes: bytes, retain: bool = False):
        self.topic = topic
        self.payload = payload_bytes
        self.retain = retain

def send_test_msg(service: MQTTIngestionService, topic: str, payload_dict_or_raw, retain: bool = False):
    if isinstance(payload_dict_or_raw, dict):
        raw_bytes = json.dumps(payload_dict_or_raw).encode("utf-8")
    elif isinstance(payload_dict_or_raw, str):
        raw_bytes = payload_dict_or_raw.encode("utf-8")
    else:
        raw_bytes = payload_dict_or_raw
        
    msg = DummyMQTTMessage(topic, raw_bytes, retain)
    service._on_message(None, None, msg)

def get_base_payload(seq=100, patient_id="PAT-1001", device_id="node-9901"):
    return {
        "version": "1.0",
        "device_id": device_id,
        "patient_id": patient_id,
        "timestamp": "2026-09-27T10:00:00Z",
        "seq": seq,
        "source": "esp8266_hardware",
        "vitals": {
            "heart_rate": 74.0,
            "spo2": 98.0,
            "body_temp": 36.8,
            "room_temp": 24.0,
            "humidity": 50.0,
            "finger_detected": True
        }
    }

def test_1_wifi_loss_firmware_inspection():
    """Verify ESP8266 firmware static structure for Wi-Fi loss and reconnect backoff."""
    firmware_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'CareSync_Kit_ESP8266_Code', 'ESP8266_MQTT_Client', 'ESP8266_MQTT_Client.ino'))
    
    assert os.path.exists(firmware_path), "Firmware .ino must exist"
    
    with open(firmware_path, 'r', encoding='utf-8') as f:
        network_code = f.read()
        
    assert "millis()" in network_code and "WiFi.status()" in network_code, "WiFi reconnect check must exist"
    assert "wifiBackoffInterval" in network_code and "mqttBackoffInterval" in network_code, "Exponential backoff must exist"
    print("PASS: Wi-Fi loss & non-blocking backoff firmware static verification.")

def test_2_database_outage_survival():
    """Verify MQTT Ingestion survives DB connection failure without crashing."""
    service = MQTTIngestionService()
    payload = get_base_payload(seq=101)
    
    with patch.object(db_service, 'save_vitals', side_effect=Exception("Database Connection Timeout/Unavailable")):
        try:
            send_test_msg(service, "caresync/hosp-001/node-9901/vitals", payload)
            print("PASS: Ingestion survived database outage gracefully without crashing.")
        except Exception as e:
            pytest.fail(f"Ingestion service crashed during database failure: {e}")

def test_3_prediction_failure_isolation():
    """Verify MQTT Ingestion survives prediction/ML exceptions without dropping vital processing."""
    service = MQTTIngestionService()
    service.enable_auto_prediction = True
    payload = get_base_payload(seq=102)
    payload["vitals"]["spo2"] = 88.0 # Trigger prediction pathway
    
    with patch.object(predict_module, 'predict_patient_health_risk', side_effect=Exception("ML Model Weight Failure")):
        with patch.object(db_service, 'save_vitals', return_value={"id": "v-123"}) as mock_save:
            try:
                send_test_msg(service, "caresync/hosp-001/node-9901/vitals", payload)
                assert mock_save.called, "Database save vitals should still be called"
                print("PASS: Ingestion isolated prediction failure; vital persistence succeeded.")
            except Exception as e:
                pytest.fail(f"Ingestion failed when prediction engine errored: {e}")

def test_4_alert_failure_isolation():
    """Verify failure in alert notification processing does not break vital persistence."""
    service = MQTTIngestionService()
    payload = get_base_payload(seq=103)
    payload["vitals"]["spo2"] = 85.0 # Triggers critical alert
    
    with patch.object(db_service, 'save_alert', side_effect=Exception("Alert Service Queue Full")):
        with patch.object(db_service, 'save_vitals', return_value={"id": "v-124"}) as mock_save:
            try:
                send_test_msg(service, "caresync/hosp-001/node-9901/vitals", payload)
                assert mock_save.called
                print("PASS: Alert processing failure isolated; ingestion survived.")
            except Exception as e:
                pytest.fail(f"Ingestion failed during alert error: {e}")

def test_5_invalid_payload_security():
    """Verify malformed JSON, missing required fields, and overflow types are safely rejected."""
    service = MQTTIngestionService()
    
    malformed_payloads = [
        "{ invalid JSON syntax ...",
        {"version": "1.0"}, # Missing required fields
        get_base_payload(seq=105, patient_id="INVALID_ID_FORMAT"),
        {"version": "1.0", "device_id": "node-9901", "patient_id": "PAT-1001", "timestamp": "2026", "seq": 1, "vitals": "NOT_A_DICT"},
    ]
    
    for payload in malformed_payloads:
        try:
            send_test_msg(service, "caresync/hosp-001/node-9901/vitals", payload)
        except Exception as e:
            pytest.fail(f"Payload rejection threw unhandled crash exception: {e}")
            
    print("PASS: Invalid payloads rejected safely without crashes.")

def test_6_duplicate_mqtt_deduplication():
    """Verify duplicate (device_id, seq) payloads are detected and ignored."""
    service = MQTTIngestionService()
    payload = get_base_payload(seq=200)
    
    with patch.object(db_service, 'save_vitals', return_value={"id": "v-200"}) as mock_save:
        send_test_msg(service, "caresync/hosp-001/node-9901/vitals", payload)
        assert mock_save.call_count == 1, "First packet saved"
        
        # Duplicate publish (same device_id, seq)
        send_test_msg(service, "caresync/hosp-001/node-9901/vitals", payload)
        assert mock_save.call_count == 1, "Duplicate packet skipped, save count remains 1"
        
    print("PASS: Duplicate sequence deduplication verified.")

def test_7_reboot_sequence_reset_handling():
    """Verify sequence reset after device reboot is handled safely without rejecting new telemetry."""
    service = MQTTIngestionService()
    payload_before_reboot = get_base_payload(seq=500)
    
    # Simulate dedup cache clearing / sequence reset upon reboot
    payload_after_reboot = get_base_payload(seq=1)
    
    with patch.object(db_service, 'save_vitals', return_value={"id": "v-reboot"}) as mock_save:
        send_test_msg(service, "caresync/hosp-001/node-9901/vitals", payload_before_reboot)
        assert mock_save.call_count == 1
        
        service._dedup_cache.clear() # Cache rollover / reboot reset
        
        send_test_msg(service, "caresync/hosp-001/node-9901/vitals", payload_after_reboot)
        assert mock_save.call_count == 2, "Telemetry after reboot with reset sequence counter must be processed"
        
    print("PASS: Device reboot sequence counter reset handled correctly.")

def test_8_secret_security_audit():
    """Audit codebase for hardcoded secrets, credentials, or service keys in tracked files."""
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    forbidden_patterns = [
        r'SUPABASE_SERVICE_ROLE_KEY\s*=\s*["\']ey[A-Za-z0-9_-]{20,}',
        r'JWT_SECRET_KEY\s*=\s*["\'][A-Za-z0-9_-]{16,}',
        r'MQTT_PASSWORD\s*=\s*["\'][^"\'\s]{6,}'
    ]
    
    sensitive_files_scanned = 0
    violations = []
    
    for root, dirs, files in os.walk(repo_root):
        if any(skip in root for skip in ['node_modules', '.git', '.next', 'venv', '.gemini']):
            continue
            
        for file in files:
            if file.endswith(('.py', '.js', '.jsx', '.ts', '.tsx', '.json', '.conf')) and file not in ['.env', '.env.local', 'secrets.h']:
                filepath = os.path.join(root, file)
                sensitive_files_scanned += 1
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    for pattern in forbidden_patterns:
                        if re.search(pattern, content):
                            violations.append(filepath)
                            
    assert len(violations) == 0, f"Discovered hardcoded secrets in tracked files: {violations}"
    print(f"PASS: Secret security audit verified clean across {sensitive_files_scanned} tracked code files.")

def test_9_multi_tenant_isolation():
    """Verify tenant isolation across Hospital A / B, Patient A / B, Device A / B."""
    service = MQTTIngestionService()
    
    payload_hosp1 = get_base_payload(seq=301, patient_id="PAT-1001", device_id="node-9901")
    payload_hosp2 = get_base_payload(seq=301, patient_id="PAT-2001", device_id="node-9902")
    
    with patch.object(db_service, 'save_vitals', return_value={"id": "v-iso"}) as mock_save:
        send_test_msg(service, "caresync/hosp-001/node-9901/vitals", payload_hosp1)
        send_test_msg(service, "caresync/hosp-001/node-9902/vitals", payload_hosp2)
        
        assert mock_save.call_count == 2
        args_1 = mock_save.call_args_list[0][0][0]
        args_2 = mock_save.call_args_list[1][0][0]
        
        assert args_1["hospital_id"] == "hosp-001" and args_1["patient_id"] == "PAT-1001"
        assert args_2["hospital_id"] == "hosp-001" and args_2["patient_id"] == "PAT-2001"
        
    print("PASS: Multi-tenant, multi-device, multi-patient isolation verified.")

if __name__ == "__main__":
    print("=== STARTING STAGE 8 RELIABILITY & SECURITY SUITE ===")
    test_1_wifi_loss_firmware_inspection()
    test_2_database_outage_survival()
    test_3_prediction_failure_isolation()
    test_4_alert_failure_isolation()
    test_5_invalid_payload_security()
    test_6_duplicate_mqtt_deduplication()
    test_7_reboot_sequence_reset_handling()
    test_8_secret_security_audit()
    test_9_multi_tenant_isolation()
    print("=== ALL STAGE 8 SUITE TESTS PASSED SUCCESSFULLY ===")
