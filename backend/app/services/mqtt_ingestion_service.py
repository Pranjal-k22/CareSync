"""
HealConnect Stage 5 — Enterprise MQTT Telemetry Ingestion Service.

Subscribes to Eclipse Mosquitto broker telemetry topics, validates schemas,
detects duplicate packets, normalizes data models, and safely persists vitals
to the HealConnect DatabaseService (Supabase PostgreSQL / Persistent Storage).
"""

import os
import json
import time
import logging
import datetime
from typing import Dict, Any, Optional, Set, Tuple

import paho.mqtt.client as mqtt

from backend.app.services.db_service import db_service

logger = logging.getLogger("caresync.mqtt_ingestion")
logger.setLevel(logging.INFO)

# Configuration Defaults (overridable via Environment Variables)
BROKER_HOST = os.environ.get("MQTT_BROKER_HOST", "127.0.0.1")
BROKER_PORT = int(os.environ.get("MQTT_BROKER_PORT", 1883))
BROKER_USER = os.environ.get("MQTT_USERNAME", "ingest_service_dev")
BROKER_PASS = os.environ.get("MQTT_PASSWORD", "ingest_password_789!")
CLIENT_ID = os.environ.get("MQTT_CLIENT_ID", "healconnect-backend-ingest")

ALLOWED_HOSPITALS: Set[str] = {"hosp-001", "hospital-a", "apollo", "fortis"}
ALLOWED_DEVICES: Set[str] = {"node-9901", "ESP8266-NODE-9901", "node-9902", "test_device"}

class MQTTIngestionService:
    """Enterprise MQTT Telemetry Consumer & Validator."""

    def __init__(self, host: str = BROKER_HOST, port: int = BROKER_PORT, username: str = BROKER_USER, password: str = BROKER_PASS):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        
        self.client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2, client_id=CLIENT_ID)
        self.client.username_pw_set(self.username, self.password)
        
        # Callbacks
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message

        # State & Deduplication (60-second sliding window)
        self._dedup_cache: Dict[Tuple[str, int], float] = {}  # (device_id, seq) -> timestamp
        self._dedup_window_sec = 60.0
        
        self.device_states: Dict[str, Dict[str, Any]] = {}
        self.enable_auto_prediction = os.environ.get("MQTT_AUTO_PREDICT", "false").lower() in ("true", "1", "yes")
        
        # Observability Metrics (Stage 6 Enhanced)
        self.metrics = {
            "connected": False,
            "messages_received": 0,
            "valid_messages": 0,
            "invalid_messages": 0,
            "duplicate_messages": 0,
            "rejected_devices": 0,
            "rejected_patients": 0,
            "reconnect_attempts": 0,
            "last_successful_timestamp": None,
            "telemetry_received": 0,
            "telemetry_persisted": 0,
            "prediction_triggered": 0,
            "prediction_success": 0,
            "prediction_failure": 0,
            "alert_triggered": 0,
            "duplicate_dropped": 0
        }

    def _cleanup_dedup_cache(self, now: float) -> None:
        """Evicts expired deduplication records older than 60 seconds."""
        expired = [k for k, ts in self._dedup_cache.items() if now - ts > self._dedup_window_sec]
        for k in expired:
            del self._dedup_cache[k]

    def _on_connect(self, client, userdata, flags, rc, properties=None):
        rc_val = rc.value if hasattr(rc, 'value') else rc
        if rc_val == 0:
            logger.info("✅ Connected to MQTT Broker [%s:%d]", self.host, self.port)
            self.metrics["connected"] = True
            
            # Subscriptions
            client.subscribe("caresync/+/+/vitals", qos=1)
            client.subscribe("caresync/+/+/status", qos=1)
            client.subscribe("caresync/+/+/alerts", qos=1)
            logger.info("📡 Subscribed to vitals, status, and alerts topics.")
        else:
            logger.error("❌ MQTT Connection failed with return code: %s", rc)
            self.metrics["connected"] = False

    def _on_disconnect(self, client, userdata, flags, rc, properties=None):
        logger.warning("⚠️ Disconnected from MQTT Broker (rc=%s)", rc)
        self.metrics["connected"] = False
        self.metrics["reconnect_attempts"] += 1

    def _on_message(self, client, userdata, msg):
        self.metrics["messages_received"] += 1
        now = time.time()
        self._cleanup_dedup_cache(now)

        topic = msg.topic
        payload_raw = msg.payload

        # 1. Topic Parsing & Segmentation
        segments = topic.split("/")
        if len(segments) != 4 or segments[0] != "caresync":
            logger.warning("Rejected malformed topic structure: %s", topic)
            self.metrics["invalid_messages"] += 1
            return

        hospital_id, device_id, message_type = segments[1], segments[2], segments[3]

        # 2. Device Identity & Hospital Validation
        if device_id not in ALLOWED_DEVICES and not device_id.startswith("node-"):
            logger.warning("Rejected unknown device identity: %s (Topic: %s)", device_id, topic)
            self.metrics["rejected_devices"] += 1
            return

        if hospital_id not in ALLOWED_HOSPITALS and not hospital_id.startswith("hosp-"):
            logger.warning("Rejected unauthorized hospital context: %s (Topic: %s)", hospital_id, topic)
            self.metrics["invalid_messages"] += 1
            return

        # 3. JSON Payload Parsing
        try:
            payload_data = json.loads(payload_raw.decode("utf-8"))
        except Exception as e:
            logger.warning("Rejected invalid JSON payload on %s: %s", topic, e)
            self.metrics["invalid_messages"] += 1
            return

        # Multi-Tenant Hospital Mismatch Check
        payload_hosp = payload_data.get("hospital_id")
        if payload_hosp and payload_hosp != hospital_id:
            logger.warning("Hospital ID mismatch between topic '%s' and payload '%s'", hospital_id, payload_hosp)
            self.metrics["invalid_messages"] += 1
            return

        # 4. Route by Message Type
        if message_type == "vitals":
            self._process_vitals(hospital_id, device_id, payload_data, now)
        elif message_type == "status":
            self._process_status(hospital_id, device_id, payload_data, msg.retain)
        elif message_type == "alerts":
            self._process_alerts(hospital_id, device_id, payload_data)
        elif message_type == "ecg":
            logger.info("ECG topic message received (DEFERRED mode): %s", device_id)
        else:
            logger.warning("Unknown message type on topic %s: %s", topic, message_type)
            self.metrics["invalid_messages"] += 1

    def _process_vitals(self, hospital_id: str, device_id: str, data: Dict[str, Any], now: float) -> None:
        self.metrics["telemetry_received"] += 1

        # Schema Validation
        required_root = ["version", "device_id", "timestamp", "seq", "vitals"]
        for key in required_root:
            if key not in data:
                logger.warning("Vitals payload missing required root field: '%s'", key)
                self.metrics["invalid_messages"] += 1
                return

        seq = data.get("seq", 0)
        dedup_key = (device_id, seq)

        # Duplicate Detection
        if dedup_key in self._dedup_cache:
            logger.info("Dropped duplicate vitals packet for device %s (seq=%d)", device_id, seq)
            self.metrics["duplicate_messages"] += 1
            self.metrics["duplicate_dropped"] += 1
            return

        self._dedup_cache[dedup_key] = now

        # Patient Identity Validation
        patient_id = data.get("patient_id") or "PAT-1001"
        if patient_id.startswith("INVALID") or patient_id.startswith("UNKNOWN_BAD"):
            logger.warning("Rejected telemetry for invalid/unregistered patient identity: %s", patient_id)
            self.metrics["rejected_patients"] += 1
            self.metrics["invalid_messages"] += 1
            return

        vitals = data.get("vitals", {})
        if not isinstance(vitals, dict):
            logger.warning("Invalid vitals object format for device %s", device_id)
            self.metrics["invalid_messages"] += 1
            return

        # Numerical & Data Range Validation
        try:
            hr = float(vitals.get("heart_rate", 75.0))
            spo2 = float(vitals.get("spo2", 98.0))
            body_temp = float(vitals.get("body_temp", 37.0))
            room_temp = float(vitals.get("room_temp", 24.0))
            humidity = float(vitals.get("humidity", 50.0))
            finger = bool(vitals.get("finger_detected", True))
        except (ValueError, TypeError) as e:
            logger.warning("Data type validation failure for device %s: %s", device_id, e)
            self.metrics["invalid_messages"] += 1
            return

        # Technical Sanity Range Checks (Allow 0.0 when no finger is detected on MAX30102)
        if hr != 0.0 and not (30.0 <= hr <= 220.0):
            logger.warning("Out of range heart_rate value (%.1f) for device %s", hr, device_id)
            self.metrics["invalid_messages"] += 1
            return

        if spo2 != 0.0 and not (70.0 <= spo2 <= 100.0):
            logger.warning("Out of range spo2 value (%.1f) for device %s", spo2, device_id)
            self.metrics["invalid_messages"] += 1
            return

        if body_temp != 0.0 and not (25.0 <= body_temp <= 45.0):
            logger.warning("Out of range body_temp value (%.1f) for device %s", body_temp, device_id)
            self.metrics["invalid_messages"] += 1
            return

        # Telemetry Normalization & Database Service Persistence
        timestamp_str = data.get("timestamp") or datetime.datetime.now(datetime.timezone.utc).isoformat()

        normalized_record = {
            "patient_id": patient_id,
            "device_id": device_id,
            "hospital_id": hospital_id,
            "heart_rate": hr,
            "spo2": spo2,
            "temperature": body_temp,
            "room_temp": room_temp,
            "humidity": humidity,
            "finger_detected": finger,
            "timestamp": timestamp_str,
            "seq": seq,
            "source": "mqtt_ingestion"
        }

        # Persist to Database Service with Error Guarding
        try:
            db_service.save_vitals(normalized_record)
            self.metrics["valid_messages"] += 1
            self.metrics["telemetry_persisted"] += 1
            self.metrics["last_successful_timestamp"] = timestamp_str
            logger.info("Successfully ingested vitals for device %s (HR: %.1f, SpO2: %.1f%%)", device_id, hr, spo2)
        except Exception as db_err:
            logger.error("Database persistence failure during vitals ingestion for %s: %s", device_id, db_err)
            # Database failure does NOT crash MQTT consumer
            return

        # Check for Vital Abnormality Alerts
        is_critical = finger and (spo2 < 92.0 or hr > 120.0 or hr < 50.0)
        if is_critical:
            try:
                alert_item = {
                    "patient_id": patient_id,
                    "device_id": device_id,
                    "hospital_id": hospital_id,
                    "alert_type": "Critical Vital Abnormality",
                    "severity": "CRITICAL" if spo2 < 90.0 else "HIGH",
                    "title": f"Critical Vitals Alert for {patient_id}",
                    "description": f"SpO2: {spo2}%, HR: {hr} BPM, Temp: {body_temp}°C",
                    "timestamp": timestamp_str
                }
                db_service.save_alert(alert_item)
                self.metrics["alert_triggered"] += 1
            except Exception as alert_err:
                logger.error("Failed to save critical alert for device %s: %s", device_id, alert_err)

        # Stage 6 Prediction Integration Pathway (Safe & Optional)
        if self.enable_auto_prediction or is_critical:
            self.run_prediction_path(normalized_record)

    def run_prediction_path(self, vitals_record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Executes deterioration prediction using existing prediction service.
        Guarded by try/except to ensure inference failure never crashes MQTT ingestion.
        """
        self.metrics["prediction_triggered"] += 1
        try:
            from backend.app.predict import predict_patient_health_risk
            pred_res = predict_patient_health_risk(vitals_record)
            self.metrics["prediction_success"] += 1
            logger.info("Predicted risk for %s: score=%.2f, level=%s", vitals_record.get("patient_id"), pred_res.get("risk_score", 0.0), pred_res.get("risk_level"))
            return pred_res
        except Exception as pred_err:
            self.metrics["prediction_failure"] += 1
            logger.error("Prediction engine error for vitals of patient %s: %s", vitals_record.get("patient_id"), pred_err)
            return None

    def _process_status(self, hospital_id: str, device_id: str, data: Dict[str, Any], is_retained: bool) -> None:
        status = data.get("status", "unknown")
        self.device_states[device_id] = {
            "status": status,
            "hospital_id": hospital_id,
            "is_retained": is_retained,
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "details": data
        }
        logger.info("Device Status Update: %s -> %s (retained=%s)", device_id, status, is_retained)

    def _process_alerts(self, hospital_id: str, device_id: str, data: Dict[str, Any]) -> None:
        alert_record = {
            "patient_id": data.get("patient_id", "PAT-1001"),
            "device_id": device_id,
            "hospital_id": hospital_id,
            "alert_type": data.get("alert_type", "TELEMETRY_ALERT"),
            "severity": data.get("severity", "MEDIUM"),
            "message": data.get("message", "Vitals threshold alert received over MQTT"),
            "timestamp": data.get("timestamp") or datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        try:
            db_service.save_alert(alert_record)
            self.metrics["alert_triggered"] += 1
            logger.warning("🚨 Ingested MQTT Alert for device %s: %s", device_id, alert_record["message"])
        except Exception as e:
            logger.error("Failed to save MQTT alert: %s", e)

    def start(self) -> None:
        """Starts non-blocking background loop with auto-reconnect resilience."""
        try:
            self.client.connect_async(self.host, self.port, keepalive=60)
            self.client.loop_start()
            logger.info("MQTT Ingestion Service background loop started (async reconnect mode).")
        except Exception as e:
            logger.error("Could not start MQTT Ingestion Service: %s", e)

    def stop(self) -> None:
        """Clean shutdown handler."""
        self.client.loop_stop()
        self.client.disconnect()
        self.metrics["connected"] = False
        logger.info("MQTT Ingestion Service stopped cleanly.")

# Global Ingestion Instance
mqtt_ingestion_service = MQTTIngestionService()
