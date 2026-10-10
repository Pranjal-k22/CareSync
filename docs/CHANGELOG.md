# 📦 HealConnect — Release Changelog

All notable changes to the HealConnect platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.7.0] — 2026-09-27 (Physical ESP8266 Hardware Sensor Validation & Dashboard Sync)

### Added
- **MAX30102 FIFO Optical Pulse Waveform Collector**: Implemented 100-sample continuous FIFO buffer polling in ESP8266 C++ firmware with IR Min/Max/Avg serial diagnostics and optical finger detection threshold (`maxIR > 50000`).
- **DS18B20 Boot Device Discovery & Fault Recovery**: Added `sensors.getDeviceCount()` discovery check and explicit handling for `DEVICE_DISCONNECTED_C` (`-127.0°C`), resetting `bodyTemp = 0.0` when sensor probe is unplugged.

### Changed
- **Backend Ambient Telemetry Persistence**: Updated `MQTTIngestionService` (`backend/app/services/mqtt_ingestion_service.py`) to persist ambient `0.0` HR/SpO2 telemetry packets when finger is idle, preserving continuous room temperature and humidity streaming.
- **Database Query Timestamp Ordering**: Updated `db_service.get_vitals_for_patient()` to enforce timestamp descending (`reverse=True`) ordering, ensuring `/vitals/{patient_id}` returns the latest hardware sequence.
- **Frontend Hardware Validity UI**: Updated Next.js clinical dashboard (`pages/monitoring.jsx`, `<WebSocketMonitor>`) to render `-- NOT DETECTED` when no finger is placed on the sensor, eliminating fake mock numbers (`86 BPM`, `99%`).

### Fixed
- **ESP8266 MQTT PubSubClient IP Change Handling**: Resolved `state=-2` socket connection failure caused by dynamic laptop Wi-Fi IP address changes; documented `secrets.h` host configuration and flashing workflow.

---

## [2.6.0-rc1] — 2026-09-27 (Software Release Candidate)

### Added
- **Eclipse Mosquitto MQTT Infrastructure**: Integrated Mosquitto MQTT Broker (port 1883 dev / port 8883 TLS blueprint) with username/password authentication (`allow_anonymous false`) and ACL topic isolation (`mosquitto/config/acl.conf`).
- **Server-Side MQTT Ingestion Service**: Added `MQTTIngestionService` (`backend/app/services/mqtt_ingestion_service.py`) with schema validation, numerical sanity checks, `(device_id, seq)` deduplication, automatic database persistence (`vitals` table), and auto-prediction triggers.
- **FastAPI SSE Telemetry Stream**: Added `/telemetry/stream` (and `/api/telemetry/stream`) Server-Sent Events endpoint for live real-time vital signs streaming to Next.js clinical dashboards.
- **Firmware PubSubClient Integration**: Updated ESP8266 C++ firmware (`HealthConnect_Kit_ESP8266_Code/`) with non-blocking Wi-Fi/MQTT reconnection loops (`maintainWiFi()`, `maintainMQTT()`), 1s-30s exponential backoff, retained LWT status events, and legacy fallback compiler guards (`#define LEGACY_BLYNK_ENABLED 1`, `#define LEGACY_FIREBASE_ENABLED 1`).
- **Comprehensive Stage 5-8 Verification Suites**: Created test suites `scratch/test_mqtt_ingestion.py` (17 tests), `scratch/test_stage6_integration.py` (13 tests), `scratch/test_stage7_frontend.py` (18 tests), `scratch/test_stage8_reliability.py` (9 tests).

### Changed
- **Next.js Live Telemetry Migration**: Migrated clinical frontend (`components/LiveMonitor/WebSocketMonitor.js`, `ViewLivePatient.js`, `ECGMonitor.js`) to consume FastAPI SSE stream (`/telemetry/stream`), eliminating browser dependency on legacy Node.js WebSocket process (`ws://10.92.0.122:8080`).

### Security
- **Broker ACL & Credential Isolation**: Enforced strict topic ACL access rules for devices and ingestion services; eliminated exposure of broker credentials in client-side Next.js JavaScript bundles.
- **Repository Secret Audit**: Scanned 499 tracked repository files and confirmed 0 exposed production service role keys, passwords, or tokens in tracked source files.

---

## [2.5.0] — 2026-09-27

### Added
- **Central Documentation System (`docs/`)**: Added 19 standardized engineering documentation files covering architecture, API specs, database schemas, security compliance, setup guides, and troubleshooting logs.
- **Unified Prediction API Endpoint**: `/predict/unified` and `/predict-unified` for atomic dual-model risk inference.
- **Automated Pytest Suite**: 27 unit, integration, and ML model tests covering API routes, database services, SHAP explainability, and Flower federated learning.

### Changed
- **Relative Path Resolution Standard**: Replaced all hardcoded absolute machine paths (`/Users/omraj/...`) with dynamic cross-platform relative path calculation (`Path(__file__).resolve().parent.parent`).
- **Model Deserialization Update**: Retrained deterioration and flu classification pipelines using current Python 3.13 / scikit-learn environment to fix joblib unpickling compatibility.
- **Pydantic V2 Migration**: Updated backend models to use `ConfigDict` and `model_dump()` methods.

### Fixed
- **SHAP Missing Feature Schema**: Added default baseline fallbacks for optional clinical parameters (`oxygen_flow`, `mobility_score`, `nurse_alert`, `comorbidity_index`, `oxygen_device`, `gender`, `admission_type`) during TreeExplainer evaluation.
- **`ModuleNotFoundError: No module named '_loss'`**: Resolved joblib Cython loss unpickling error by synchronizing binary model artifacts.

### Security
- **HIPAA Audit Trail Enforcement**: Enforced insert-only RLS policy for `audit_logs` table.
- **Sanitized Validation Error Responses**: Intercepted FastAPI `RequestValidationError` to hide internal Python tracebacks.

---

## [2.0.0] — 2026-08-15

### Added
- Flower federated learning framework across 3 simulated hospital edge nodes (334k samples).
- SHAP TreeExplainer local patient explainability visualizer component (`AIInsightCard.jsx`).
- Next.js 16 interactive clinical dashboard and live ECG telemetry station.
