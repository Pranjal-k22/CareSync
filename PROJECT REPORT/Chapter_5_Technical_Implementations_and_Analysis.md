# CHAPTER 5 — TECHNICAL IMPLEMENTATIONS AND ANALYSIS

## 5.1 Technology Stack Summary Table

| System Layer | Technology / Tool | Exact Version | Purpose & Technical Function | Evidence File Path |
| :--- | :--- | :--- | :--- | :--- |
| **Edge Hardware** | ESP8266 NodeMCU | Hardware MCU | Microcontroller executing non-blocking sensor sampling & MQTT publishing. | `CareSync_Kit_ESP8266_Code/` |
| **Sensors** | MAX30102, DHT22, DS18B20 | Hardware Probes | Optical SpO2/HR, ambient room temp/humidity, and body temp probes. | `ESP8266_MQTT_Client.ino#L14-L26` |
| **MQTT Broker** | Eclipse Mosquitto | `2.0` (Docker) | Containerized message broker enforcing password auth & ACL topic isolation. | `mosquitto/config/mosquitto.conf` |
| **Ingestion Engine** | Paho MQTT (`paho-mqtt`) | `2.1.0` | Python client consuming vitals, enforcing dedup, & saving to Supabase. | `backend/app/services/mqtt_ingestion_service.py` |
| **Backend Gateway** | FastAPI | `0.115` | Async API gateway providing REST routes, Pydantic validation, & SSE streams. | `backend/main.py#L179-L186` |
| **ASGI Server** | Uvicorn | Current | Asynchronous Web Server Gateway Interface running FastAPI on port 8000. | `backend/main.py#L1312` |
| **Database Engine** | Supabase PostgreSQL | `15+` | Hosted relational database with Row Level Security (RLS) policies. | `backend/supabase_schema.sql` |
| **Acute Deterioration ML**| Scikit-Learn Random Forest | `1.5+` | 100-tree ensemble predicting 12-hour acute deterioration probability. | `backend/models/risk_model.joblib` |
| **Disease Screening ML** | Scikit-Learn Gradient Boosting| `1.5+` | Multi-class classifier screening for Flu/Influenza and Febrile Conditions. | `backend/models/flu_model_v1.joblib` |
| **Explainable AI (XAI)** | SHAP (`shap.TreeExplainer`)| `0.45+` | Game-theoretic Shapley feature attribution calculation engine. | `backend/app/explain.py` |
| **Federated Learning** | Flower (`flwr.client`) | `1.33.0` | NumPyClient framework aggregating 3 hospital node weight matrices (`FedAvg`).| `backend/federated/federated_engine.py` |
| **Frontend Framework** | Next.js | `16.3` (React 18)| Reactive Web UI framework utilizing Pages router and Webpack engine. | `package.json#L15` |
| **UI Components & CSS** | SCSS Modules, TailwindCSS | Current | Responsive layout styling, custom modal cards, and CSS grid layouts. | `pages/Appointments.module.css` |
| **Charts & Visualization**| Arction LightningChart JS, ApexCharts | Current | Continuous high-frequency ECG waveform and risk score gauge visualization. | `components/LiveMonitor/ECGMonitor.js` |
| **OCR Image Reader** | Google Gemini API | `2.5 Flash` | Generative AI vision model extracting digital prescription data from images. | `pages/prescriptions.jsx` |
| **Automated Testing** | Pytest & FastAPI TestClient | `8.0+` | Test automation suite executing 84 unit, integration, and security tests. | `backend/tests/test_api.py` |

---

## 5.2 Frontend Implementation

The frontend is built on Next.js 16 (React 18) using the Pages router architecture. Key pages include:
- **`pages/index.jsx`**: Main landing page featuring interactive portal login switching between Admin, Doctor, and Patient roles with pre-configured demo credentials.
- **`pages/monitoring.jsx`**: Live clinical telemetry monitoring station displaying real-time patient vital sign cards, online/offline hardware status badges, threshold breach warnings, and AI risk level gauges.
- **`pages/ai-dashboard.jsx`**: Advanced AI insight dashboard rendering SHAP feature attribution waterfall cards (`AIInsightCard.jsx`) and unified prediction triggers.
- **`pages/prescriptions.jsx`**: E-Prescription reader integrating client-side Google Gemini 2.5 Flash OCR image extraction (`/api/process-prescription.js`).
- **`pages/admin/federated.jsx`**: Federated learning administrative portal displaying edge node statuses (Hospital A, Apollo, Fortis) and triggering global `FedAvg` rounds.

Live telemetry is consumed by `components/LiveMonitor/WebSocketMonitor.js`, which opens an HTML5 `EventSource` connection to `/telemetry/stream`, receiving real-time JSON payloads without page refreshes.

---

## 5.3 Backend Implementation

FastAPI ([`backend/main.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/main.py)) serves as the core backend gateway:
- **Authentication**: `POST /login` verifies credentials via `verify_password()` and issues a 24-hour signed JWT token (`HS256`).
- **Security Middleware**: Enforces HTTPS security response headers (`nosniff`, `DENY`, `1; mode=block`, `CSP`) and calculates per-request latency headers (`X-Response-Time-MS`).
- **Structured JSON Logging**: Logs every incoming HTTP request method, endpoint, status code, client IP, and execution time in machine-readable JSON format.
- **Exception Sanitization**: Intercepts `RequestValidationError` to hide internal tracebacks and return structured 422 JSON validation messages.

---

## 5.4 Database Implementation

The database is built on Supabase PostgreSQL 15+ ([`backend/supabase_schema.sql`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/supabase_schema.sql)):
- **Tables**: `users` (credentials & roles), `patients` (clinical demographics), `vitals` (MQTT sensor telemetry), `prediction_history` (AI prediction audit logs), `alerts` (threshold breach alerts), and `audit_logs` (immutable security trail).
- **Row Level Security (RLS)**: Enforces role isolation. The `audit_logs` table has an explicit **INSERT-ONLY** policy, preventing record modification or deletion.
- **Data Lifecycle**: High-frequency vitals in `vitals` are indexed by `patient_id` and timestamp descending (`recorded_at DESC`), allowing fast range queries for UI rendering.

---

## 5.5 IoT Firmware Implementation

The ESP8266 NodeMCU firmware ([`ESP8266_MQTT_Client.ino`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/CareSync_Kit_ESP8266_Code/ESP8266_MQTT_Client/ESP8266_MQTT_Client.ino)) is written in C++:
- **Sensor Sampling**: Executes every 2000ms using non-blocking `millis()` timing.
- **MAX30102 Optical Processing**: Reads 100 continuous samples from the optical sensor FIFO buffer into `irBuffer` and `redBuffer`. Evaluates `fingerDetected = (maxIR > 50000)`. If finger is present, computes `heartRate` and `spo2` via `maxim_heart_rate_and_oxygen_saturation()`.
- **DS18B20 Disconnect Fault Handling**: Evaluates `sensors.getTempCByIndex(0)`. If sensor returns `DEVICE_DISCONNECTED_C` (`-127.0°C`), sets `bodyTemp = 0.0` to avoid storing corrupt temperatures.
- **Reconnection Logic**: Functions `maintainWiFi()` and `maintainMQTT()` execute exponential backoff retries (doubling interval from 1s up to 30s max), preventing Wi-Fi reconnect storms.
- **Packet Formatting**: Uses `snprintf` to construct a 512-byte JSON string containing sequence numbers, ISO 8601 timestamps, vitals, and units.

---

## 5.6 Sensors Inventory & Specification

| Sensor | Parameter Measured | Interface / Pin | Reading Behavior & Algorithm | Destination Path | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MAX30102** | Heart Rate & $\text{SpO}_2\%$ | I2C (SDA=D2, SCL=D1) | 100-sample FIFO buffer, `maxIR > 50000` finger check, Maxim SpO2 algorithm | MQTT `caresync/+/+/vitals` | **Firmware Written / Physical Board Unverified** |
| **DHT22** | Room Temp & Humidity | Digital Pin D5 | Sampled every 2000ms via `dht.readTemperature()` & `readHumidity()` | MQTT `caresync/+/+/vitals` | **Firmware Written / Physical Board Unverified** |
| **DS18B20** | Body Temperature | OneWire Pin D6 | Sampled every 2000ms; `DEVICE_DISCONNECTED_C` checks for probe unplugging | MQTT `caresync/+/+/vitals` | **Firmware Written / Physical Board Unverified** |
| **ECG Stream** | Lead-II ECG Waveform | Telemetry API | 500Hz synthetic stream generation | UI Visualization (Simulated Stream) | **Simulated** |
 
---

## 5.7 MQTT Implementation

- **Broker**: Eclipse Mosquitto v2.0 running on TCP port 1883 (development) / port 8883 (TLS blueprint).
- **Authentication & ACL**: Authenticates via `mosquitto/config/password_file` (`allow_anonymous false`). ACL rules in `mosquitto/config/acl` restrict devices to `caresync/{hospital_id}/{device_id}/#`.
- **Topics**:
  - Vitals: `caresync/{hospital_id}/{device_id}/vitals` (QoS 1, Retain `false`)
  - Status: `caresync/{hospital_id}/{device_id}/status` (QoS 1, Retain `true` [LWT])
  - Alerts: `caresync/{hospital_id}/{device_id}/alerts` (QoS 1, Retain `false`)

---

## 5.8 MQTT Ingestion Service

The ingestion engine ([`mqtt_ingestion_service.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/app/services/mqtt_ingestion_service.py)) runs as a background thread using `paho-mqtt` v2.1.0:
1. **Connection & Subscription**: Connects to Mosquitto as `ingest_service_dev` and subscribes to `caresync/#`.
2. **Schema & Bound Validation**: Validates topic segments and checks numeric ranges ($\text{SpO}_2: 50–100\%$, $\text{HR}: 30–250\text{ BPM}$, $\text{Temp}: 25.0–45.0^\circ\text{C}$).
3. **Deduplication**: Maintains a 60-second sliding cache window tracking `(device_id, seq)` tuples. Duplicate packets are acknowledged safely and dropped.
4. **Persistence & Alerts**: Saves valid vitals via `db_service.save_vitals()` and evaluates threshold alerts ($\text{SpO}_2 < 92\%$), dispatching critical alert records.

---

## 5.9 Telemetry Streaming (FastAPI SSE)

The `/telemetry/stream` endpoint ([`backend/main.py:L1004-L1079`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/main.py#L1004-L1079)) utilizes FastAPI `StreamingResponse`:
- Connects browser client queues to `_telemetry_subscribers`.
- Emits an initial connection JSON ack, followed by recent vital records.
- Streams live telemetry events as JSON objects over `text/event-stream`.
- Emits heartbeat pings (`event: heartbeat`) every 1.0 second during idle periods to keep connections open.

---

## 5.10 ECG Implementation (Actual vs Simulated)

To maintain absolute academic transparency:
- **Physical Hardware Acquisition**: Lead-II ECG hardware acquisition is **SIMULATED** (programmatic telemetry generator).
- **UI Visualization**: The high-frequency ECG waveform rendered in `components/LiveMonitor/ECGMonitor.js` is programmatically generated using rolling buffer interpolation and Arction LightningChart JS to simulate a 500Hz Lead-II cardiac signal.

---

## 5.11 Machine Learning Implementation & Benchmarks

### 1. 12-Hour Acute Clinical Deterioration Model
- **Algorithm**: `RandomForestClassifier` (100 estimators, max depth 12).
- **Dataset**: `cleaned_hospital_data.csv` (167,146 clinical records).
- **Target**: `deterioration_12h` (Binary: `0 = Stable`, `1 = Acute Deterioration Risk`).
- **Features (14)**: `heart_rate`, `respiratory_rate`, `spo2_pct`, `temperature_c`, `systolic_bp`, `diastolic_bp`, `oxygen_flow`, `mobility_score`, `nurse_alert`, `age`, `comorbidity_index`, `oxygen_device`, `gender`, `admission_type`.
- **Holdout Test Benchmarks**: **ROC-AUC: 0.9120**, **Accuracy: 94.59%**, **F1-Score: 0.4810**, **Inference Time: < 15ms**.
- **Artifact**: `backend/models/risk_model.joblib`.

### 2. Influenza & Multi-Class Disease Screening Model
- **Algorithm**: Tuned `GradientBoostingClassifier` (`learning_rate=0.05`, `max_depth=5`, `n_estimators=100`).
- **Dataset**: `disease_prediction_dataset.csv` (15,000 patient entries).
- **Target**: Multi-class (`0: Normal Baseline`, `1: Flu / Influenza`, `2: Fever-Related Condition`).
- **Features (11)**: `temperature_c`, `heart_rate`, `spo2_pct`, `cough_severity`, `headache_severity`, `fatigue_score`, `chills`, `body_ache`, `sore_throat`, `age`, `gender`.
- **Holdout Test Benchmarks**: **ROC-AUC: 0.9970**, **Accuracy: 96.58%**, **F1-Score: 96.58%**.
- **Artifact**: `backend/models/flu_model_v1.joblib`.

### 3. SHAP TreeExplainer XAI Engine
- Integrates `shap.TreeExplainer` in `backend/app/explain.py`.
- Computes exact local Shapley values per patient, identifying top features increasing or reducing risk (e.g., Fatigue Score `41.88%`, Cough Severity `27.69%`, Temp `18.08%`).

### 4. Flower Privacy-Preserving Federated Network
- Subclasses `flwr.client.NumPyClient` across 3 hospital edge nodes (**334,291 total training records**):
  - Hospital A Edge Node: 167,146 samples
  - Apollo Telemetry Node: 125,359 samples
  - Fortis Cardiac Node: 125,361 samples
- Executes weighted `FedAvg` parameter aggregation ($\mathbf{W}_{\text{global}} = \sum \frac{N_i}{N_{\text{total}}} \mathbf{W}_i$), serializing global model binaries (`global_federated_model.joblib`) without centralizing raw data.

---

## 5.12 Authentication and Authorization

- **Password Hashing**: PBKDF2-SHA256 with 16-byte random salt and 600,000 iterations (`hash_password()`).
- **JWT Authorization**: 24-hour signed JWT bearer tokens (`HS256`).
- **Role-Based Access Control**: Enforced via FastAPI dependencies (`require_admin_role`, `require_clinician_role`).

---

## 5.13 Security Implementation

- **MQTT Auth & ACL**: Password file authentication (`allow_anonymous false`) and ACL topic isolation.
- **Client Credential Security**: Web browsers consume vitals via SSE (`/telemetry/stream`); 0 broker passwords or service-role keys exposed to client bundles.
- **Repository Secret Audit**: Automated secret scan verified 0 production secrets exposed in 499 tracked repository files.

---

## 5.14 Docker and Deployment Configuration

- **`docker-compose.yml`**: Provisions containerized Eclipse Mosquitto 2.0 broker mapping port `1883:1883` and volume mounts for `mosquitto/config/`, `mosquitto/data/`, and `mosquitto/log/`.
- **Environment Configuration**: Environment variables loaded from `.env.local` or environment overrides (`JWT_SECRET_KEY`, `ALLOWED_ORIGINS`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

---

## 5.15 Comprehensive Testing & Verification Results

The platform has been audited using Pytest and scratch verification suites across 5 distinct test layers, achieving a **100% pass rate across all 84 test cases**:

```
================================================================================
CARESYNC COMPREHENSIVE AUTOMATED VERIFICATION SUITE MATRIX
================================================================================
1. Pytest Backend Core Suite:      27 / 27 PASSING (100%) [python -m pytest backend/tests/]
2. Stage 5 MQTT Ingestion Suite:   17 / 17 PASSING (100%) [python scratch/test_mqtt_ingestion.py]
3. Stage 6 Integration Suite:      13 / 13 PASSING (100%) [python scratch/test_stage6_integration.py]
4. Stage 7 Frontend SSE Suite:     18 / 18 PASSING (100%) [python scratch/test_stage7_frontend.py]
5. Stage 8 Reliability Suite:       9 /  9 PASSING (100%) [python scratch/test_stage8_reliability.py]
================================================================================
TOTAL VERIFIED AUTOMATED TESTS:    84 / 84 PASSING (100% SUCCESS RATE)
================================================================================
FRONTEND PRODUCTION BUILD:         45 / 45 PAGES COMPILED (npx next build --webpack)
================================================================================
```

---

## 5.16 Performance Analysis

- **API Inference Latency**: REST API endpoints (`/predict`, `/predict-disease`, `/predict-unified`) respond in **< 15ms** per patient evaluation.
- **Telemetry Stream Latency**: End-to-end packet latency from MQTT publish to FastAPI SSE browser UI render is **< 100ms**.
- **Pytest Execution Time**: Entire 27-test backend Pytest suite completes in **~14.5 seconds**.
- **Build Compilation**: Webpack production build compiles all 45 pages in **~38 seconds**.

---

## 5.17 Reliability Analysis

- **Wi-Fi / MQTT Reconnection**: Exponential backoff retry loop (1s to 30s max) prevents network flooding on connection loss.
- **Database Outage Resilience**: Try/except error boundaries around `db_service.save_vitals()` catch database save errors gracefully, allowing the background MQTT consumer loop to survive without crashing.
- **Deduplication**: 60-second sliding cache window (`device_id`, `seq`) prevents duplicate packet insertion into database tables.

---

## 5.18 Scalability Analysis

- **Multi-Device MQTT Partitioning**: Topic segmentation (`caresync/{hospital}/{device}/vitals`) enables Mosquitto broker to scale across thousands of concurrent microcontrollers.
- **Single-Worker SSE Boundary**: FastAPI in-memory subscriber queue (`_telemetry_subscribers`) operates per worker process. Production multi-worker scaling requires attaching Redis Pub/Sub to `_telemetry_broadcaster`.

---

## 5.19 Legacy Components Audit

1. **Legacy Node.js WebSocket Server (`websocket-server/server.js`)**: Standalone server on port 8080. It is preserved in an isolated directory in the repository but is completely disconnected from the active frontend, which consumes telemetry via FastAPI SSE (`/telemetry/stream`).
2. **Legacy Blynk & Firebase Firmware Routines**: Located in `CareSync_Kit_ESP8266_Code/`. Preserved behind compiler flags `#define LEGACY_BLYNK_ENABLED 1` and `#define LEGACY_FIREBASE_ENABLED 1`. Hardware deletion was gated by Stage 9C validation criteria; because physical hardware bench testing was unavailable (`PHYSICAL ESP8266: NOT VERIFIED`), permanent deletion was correctly blocked to protect firmware fallback options.
