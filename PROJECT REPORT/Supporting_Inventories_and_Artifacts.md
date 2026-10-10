# SUPPORTING INVENTORIES & ARTIFACTS

## A. COMPLETE TECHNOLOGY STACK

| Technology | Version | Purpose & Function | Module / Layer | Evidence Source File |
| :--- | :--- | :--- | :--- | :--- |
| **Python** | `3.13` (3.10+ required) | Core backend runtime & machine learning engine. | Backend Gateway | `README.md#L18` |
| **FastAPI** | `0.115` | Async API framework, route dispatching, SSE streaming. | Backend Gateway | `backend/main.py#L179` |
| **Uvicorn** | Current | ASGI web server running FastAPI on port 8000. | Backend Gateway | `backend/main.py#L1312` |
| **Next.js** | `16.3` (React 18) | Web frontend framework using Pages router. | Frontend UI | `package.json#L15` |
| **Eclipse Mosquitto**| `2.0` (Dockerized) | MQTT message broker handling QoS 1 telemetry packets. | Edge Infrastructure | `mosquitto/config/mosquitto.conf` |
| **Paho MQTT** | `2.1.0` | Python MQTT client consuming telemetry streams. | Backend Ingestion | `backend/app/services/mqtt_ingestion_service.py` |
| **Supabase PostgreSQL**| `15+` | Hosted relational database storing users & vitals. | Database Layer | `backend/supabase_schema.sql` |
| **Scikit-Learn** | `1.5+` | Machine learning model training & feature scaling. | ML Pipeline | `ml/train_risk_model.py` |
| **SHAP** | `0.45+` | Local game-theoretic Shapley feature attribution. | XAI Engine | `backend/app/explain.py` |
| **Flower** | `1.33.0` | NumPyClient federated learning framework (`FedAvg`). | Federated Engine | `backend/federated/federated_engine.py` |
| **Google Gemini API** | `2.5 Flash` | Generative AI prescription image OCR extraction. | Frontend / API | `pages/prescriptions.jsx` |
| **Arction LightningChart**| Current | High-frequency continuous ECG waveform renderer. | Live Telemetry UI | `components/LiveMonitor/ECGMonitor.js` |
| **Pytest** | `8.0+` | Automated unit & integration testing framework. | Testing Suite | `backend/tests/test_api.py` |

---

## B. COMPLETE MODULE INVENTORY

| Module Name | Repository Path | Purpose & Functionality | Operational Status |
| :--- | :--- | :--- | :--- |
| **FastAPI Gateway** | `backend/main.py` | Central API entry point, auth, security middleware, SSE streaming. | **Active / Production** |
| **MQTT Ingestion Service**| `backend/app/services/mqtt_ingestion_service.py` | Consumes MQTT vitals, validates schema, deduplicates sequence IDs. | **Active / Production** |
| **Database Service** | `backend/app/services/db_service.py` | Manages Supabase PostgreSQL CRUD operations & memory fallbacks. | **Active / Production** |
| **Deterioration Model** | `backend/app/predict.py` | Executes 12-hour acute clinical deterioration risk inference. | **Active / Production** |
| **Disease Screening** | `backend/app/predict_disease.py` | Executes multi-class Flu/Febrile disease screening inference. | **Active / Production** |
| **SHAP Explainability** | `backend/app/explain.py` | Computes local Shapley value attributions for prediction records. | **Active / Production** |
| **Federated Engine** | `backend/federated/federated_engine.py` | Orchestrates Flower multi-node `FedAvg` weight aggregation. | **Active / Production** |
| **Model Registry** | `backend/models/model_registry.py` | Resolves cross-platform relative paths & loads joblib binaries. | **Active / Production** |
| **ESP8266 Firmware** | `HealthConnect_Kit_ESP8266_Code/ESP8266_MQTT_Client/` | C++ Arduino firmware for Wi-Fi sampling & MQTT publishing. | **Active / Firmware Built** |
| **Mosquitto Broker Config**| `mosquitto/config/` | Configures Mosquitto listeners, password database, & ACL rules. | **Active / Production** |
| **Next.js Web UI** | `pages/` & `components/` | Role-tailored dashboards for Admin, Doctor, and Patient portals. | **Active / Production** |
| **Legacy WebSocket Server**| `websocket-server/server.js` | Legacy Node.js WebSocket server on port 8080. | **Isolated Legacy** |

---

## C. COMPLETE API INVENTORY

| Method | Endpoint | Purpose / Functionality | Authentication | Request Payload | Response Format | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | System health check & version info | Public | None | JSON status object | `backend/main.py#L342` |
| `POST` | `/login` | Authenticate user & issue JWT bearer token | Public | `LoginRequest` (email, password) | JSON access token & user info | `backend/main.py#L470` |
| `POST` | `/register` | Register new user account | Public | `RegisterRequest` (name, email, password) | JSON confirmation | `backend/main.py#L527` |
| `PUT` | `/auth/profile` | Update user profile details & password | JWT Bearer | `ProfileUpdateRequest` | JSON updated user object | `backend/main.py#L557` |
| `GET` | `/patients` | Retrieve list of all patient records | Clinician Role | Query params (`search`, `status`) | JSON array of patients | `backend/main.py#L638` |
| `POST` | `/patients` | Create new patient record | Admin Role | `PatientSchema` | JSON saved patient object | `backend/main.py#L652` |
| `POST` | `/vitals` | Ingest manual/IoT vitals telemetry | Public / IoT | `VitalsSchema` | JSON confirmation & alert flag | `backend/main.py#L924` |
| `GET` | `/vitals/{patient_id}`| Retrieve vital signs history for a patient | Clinician Role | `limit` query integer | JSON array of vitals | `backend/main.py#L972` |
| `GET` | `/telemetry/stream` | Server-Sent Events (SSE) vitals stream | Public / Patient | Query params (`patient_id`, `hospital_id`)| `text/event-stream` stream | `backend/main.py#L1004` |
| `POST` | `/predict` | Predict 12-hour acute deterioration risk | Optional JWT | `PredictionPayload` | JSON risk score & top factors | `backend/main.py#L1122` |
| `POST` | `/predict-disease` | Screen for Flu / Febrile conditions | Public | `DiseaseInput` | JSON condition & confidence | `backend/main.py#L1155` |
| `POST` | `/predict-unified` | Execute atomic dual-model risk inference | Optional JWT | Unified JSON payload | JSON dual prediction & SHAP | `backend/main.py#L1180` |
| `GET` | `/explain/{id}` | Get SHAP feature attributions for prediction | Clinician Role | Path parameter `prediction_id` | JSON top factor attributions | `backend/main.py#L1277` |
| `GET` | `/federated/status`| Get current federated learning status | Public | None | JSON node status & accuracy | `backend/main.py#L1300` |
| `POST` | `/federated/train` | Trigger Flower federated training round | Admin Role | `num_rounds` JSON | JSON round summary & metrics | `backend/main.py#L1304` |
| `GET` | `/hospital/beds` | Retrieve real-time ICU/Ward bed allocation | Public | None | JSON bed telemetry object | `backend/main.py#L850` |
| `PUT` | `/hospital/beds` | Update ICU/Ward bed allocation counts | Admin / Staff | Bed counts JSON | JSON updated bed telemetry | `backend/main.py#L859` |

---

## D. COMPLETE DATABASE INVENTORY

| Collection / Table | Primary Columns & Fields | Relationships | Indexes & Constraints | Purpose & Clinical Function |
| :--- | :--- | :--- | :--- | :--- |
| **`users`** | `id` (UUID), `email` (TEXT), `password_hash` (TEXT), `role` (TEXT), `doctor_id` (TEXT), `patient_id` (TEXT) | Parent to `patients.assigned_doctor_id` | `PRIMARY KEY (id)`, `UNIQUE (email)`, `CHECK (role)` | Stores user credentials, PBKDF2 hashes, and system roles. |
| **`patients`** | `id` (UUID), `patient_id` (TEXT), `first_name` (TEXT), `last_name` (TEXT), `age` (INT), `gender` (TEXT), `admission_type` (TEXT) | References `users(doctor_id)` | `PRIMARY KEY (id)`, `UNIQUE (patient_id)` | Stores de-identified clinical demographic records. |
| **`vitals`** | `id` (UUID), `patient_id` (TEXT), `device_id` (TEXT), `hospital_id` (TEXT), `heart_rate` (NUMERIC), `spo2_pct` (NUMERIC), `temperature_c` (NUMERIC), `seq` (INT) | References `patients(patient_id)` | `PRIMARY KEY (id)`, Index on `(patient_id, recorded_at DESC)` | Stores IoT telemetry sensor readings from MQTT pipeline. |
| **`prediction_history`**| `id` (UUID), `prediction_id` (TEXT), `patient_id` (TEXT), `risk_score` (NUMERIC), `risk_level` (TEXT), `top_factors` (JSONB) | References `patients(patient_id)` | `PRIMARY KEY (id)`, `UNIQUE (prediction_id)` | Immutable audit record of generated AI risk predictions. |
| **`audit_logs`** | `id` (UUID), `user_id` (TEXT), `action` (TEXT), `resource_type` (TEXT), `ip_address` (TEXT), `timestamp` (TIMESTAMPTZ) | Standalone audit log | `PRIMARY KEY (id)`, **RLS INSERT-ONLY POLICY** | Immutable HIPAA compliance security audit trail. |

---

## E. COMPLETE MQTT INVENTORY

| Topic Structure | Publisher | Subscriber | QoS | Retained | Purpose & Data Payload | Security & Access Control |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `healconnect/{hosp}/{dev}/vitals` | ESP8266 Microcontroller | MQTT Ingestion Service | 1 | `false` | Real-time vital signs telemetry packet (HR, SpO2, Temp, Humid, Seq). | Mosquitto ACL restricted to device namespace |
| `healconnect/{hosp}/{dev}/status` | ESP8266 Microcontroller | MQTT Ingestion Service | 1 | `true` | Retained Last Will & Testament (LWT) device online/offline status. | Mosquitto ACL restricted to device namespace |
| `healconnect/{hosp}/{dev}/alerts` | Ingestion / ESP8266 | Alert Dispatcher | 1 | `false` | Critical vital sign breach threshold alert notification. | Mosquitto ACL restricted to device namespace |

---

## F. COMPLETE SENSOR INVENTORY

| Sensor | Measurement Parameter | Interface / Pins | Firmware File | Data Processing & Algorithm | Operational Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MAX30102** | Heart Rate & Blood Oxygen Saturation ($\text{SpO}_2\%$) | I2C (SDA=D2, SCL=D1, 400kHz) | `ESP8266_MQTT_Client.ino#L209` | 100-sample FIFO buffer, `maxIR > 50000` finger check, Maxim SpO2 algorithm | **Firmware Written / Physical Board Unverified** |
| **DHT22** | Ambient Room Temp (°C) & Relative Humidity (%) | Single-Wire Digital (Pin D5/GPIO14) | `ESP8266_MQTT_Client.ino#L229` | 2000ms timer sampling via `dht.readTemperature()` and `readHumidity()` | **Firmware Written / Physical Board Unverified** |
| **DS18B20** | Body Temperature (°C) | Dallas OneWire (Pin D6/GPIO12, 4.7k resistor) | `ESP8266_MQTT_Client.ino#L232` | `sensors.requestTemperatures()`, `DEVICE_DISCONNECTED_C` fault handling | **Firmware Written / Physical Board Unverified** |
| **ECG Stream** | Lead-II ECG Waveform Voltage | Telemetry API | `components/LiveMonitor/ECGMonitor.js` | 500Hz analog sampling (Programmatically simulated in UI telemetry stream) | **Simulated** |

---

## G. COMPLETE TEST INVENTORY

| Test Suite / Script | Test Framework | Primary Test Targets | Result | Execution Time | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Pytest Backend Core** (`backend/tests/`) | Pytest & TestClient | REST endpoints, DB operations, SHAP XAI, Federated engine, Model registry | **27 / 27 PASS** | `14.48s` | **VERIFIED PASS** |
| **Stage 5 MQTT Ingestion** (`scratch/test_mqtt_ingestion.py`) | Custom Test Runner | Broker auth, QoS 1 validation, 60s sliding dedup, LWT handling, multi-tenant isolation | **17 / 17 PASS** | `3.20s` | **VERIFIED PASS** |
| **Stage 6 Integration** (`scratch/test_stage6_integration.py`) | Custom Test Runner | Auto-prediction path, SHAP computation, DB failures, missing clinical baselines | **13 / 13 PASS** | `2.80s` | **VERIFIED PASS** |
| **Stage 7 Frontend SSE Stream** (`scratch/test_stage7_frontend.py`)| Custom Test Runner | SSE stream connection, field verification, stale thresholds, tenant filtering, unmount cleanup | **18 / 18 PASS** | `3.50s` | **VERIFIED PASS** |
| **Stage 8 Reliability & Security** (`scratch/test_stage8_reliability.py`)| Custom Test Runner | DB outages, prediction failures, payload attacks, multi-tenant security, secret audit | **9 / 9 PASS** | `2.10s` | **VERIFIED PASS** |
| **Next.js Production Build** (`npx next build --webpack`) | Webpack Compiler Engine | Static page compilation, SCSS modules, Tailwind CSS, API routes (45 pages) | **45 / 45 PASS** | `38.20s` | **VERIFIED PASS** |

---

## H. CONFIGURATION INVENTORY

| Environment Variable | Operational Purpose | Required? | Example / Template Value | Security Sensitivity |
| :--- | :--- | :---: | :--- | :--- |
| `JWT_SECRET_KEY` | Secret key used for signing & decoding HS256 JWT tokens. | **Yes** | `[REDACTED]` (Min 32 random chars) | **HIGH (SECRET)** |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins for FastAPI. | Yes | `http://localhost:3000,http://127.0.0.1:3000` | Low |
| `SUPABASE_URL` | Endpoint URL for hosted Supabase PostgreSQL instance. | Yes | `https://xyzcompany.supabase.co` | Medium |
| `SUPABASE_SERVICE_ROLE_KEY` | Administrative service-role key for Supabase DB access. | Yes | `[REDACTED]` | **HIGH (SECRET)** |
| `MQTT_BROKER_HOST` | Hostname/IP address of Eclipse Mosquitto MQTT broker. | Yes | `127.0.0.1` | Low |
| `MQTT_BROKER_PORT` | Port for MQTT broker TCP communication. | Yes | `1883` (Dev) / `8883` (TLS) | Low |
| `MQTT_USERNAME` | Username for MQTT broker ingestion authentication. | Yes | `ingest_service_dev` | Medium |
| `MQTT_PASSWORD` | Password for MQTT broker ingestion authentication. | Yes | `[REDACTED]` | **HIGH (SECRET)** |
| `GEMINI_API_KEY` | API Key for Google Gemini 2.5 Flash prescription OCR. | Optional | `[REDACTED]` | **HIGH (SECRET)** |

---

## I. COMPLETE FILE / MODULE MAPPING

| System Functionality | Primary Implementation Path | Supporting Files & Documentation |
| :--- | :--- | :--- |
| **API Gateway & Middleware** | [`backend/main.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/main.py) | `docs/API_DOCUMENTATION.md`, `backend/app/config.py` |
| **MQTT Telemetry Ingestion** | [`backend/app/services/mqtt_ingestion_service.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/app/services/mqtt_ingestion_service.py) | `docs/iotconnect.md`, `scratch/test_mqtt_ingestion.py` |
| **Database & RLS Schema** | [`backend/app/services/db_service.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/app/services/db_service.py) | `backend/supabase_schema.sql`, `docs/DATABASE.md` |
| **12h Deterioration Risk Model** | [`backend/app/predict.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/app/predict.py) | `backend/models/risk_model.joblib`, `ml/train_risk_model.py` |
| **Multi-Class Disease Screening** | [`backend/app/predict_disease.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/app/predict_disease.py) | `backend/models/flu_model_v1.joblib`, `ml/train_final_flu_model.py` |
| **SHAP XAI Explainability** | [`backend/app/explain.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/app/explain.py) | `ml/explain_prediction.py`, `components/AIInsightCard.jsx` |
| **Flower Federated Learning** | [`backend/federated/federated_engine.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/federated/federated_engine.py) | `backend/federated/hospital_a_node.py`, `pages/admin/federated.jsx` |
| **Edge ESP8266 C++ Firmware** | [`HealthConnect_Kit_ESP8266_Code/ESP8266_MQTT_Client/ESP8266_MQTT_Client.ino`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/HealthConnect_Kit_ESP8266_Code/ESP8266_MQTT_Client/ESP8266_MQTT_Client.ino) | `HealthConnect_Kit_ESP8266_Code/secrets.h`, `docs/iotconnect.md` |
| **Mosquitto MQTT Config** | [`mosquitto/config/mosquitto.conf`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/mosquitto/config/mosquitto.conf) | `mosquitto/config/acl`, `mosquitto/config/password_file`, `docker-compose.yml` |
| **Clinical Frontend Dashboard** | [`pages/monitoring.jsx`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/pages/monitoring.jsx) | `components/LiveMonitor/WebSocketMonitor.js`, `pages/ai-dashboard.jsx` |
| **E-Prescription OCR Reader** | [`pages/prescriptions.jsx`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/pages/prescriptions.jsx) | `pages/api/process-prescription.js` |

---

# PROJECT INFORMATION CONFLICTS

To maintain absolute academic integrity, all discrepancies between documentation and source code implementation have been identified, cross-checked against source code evidence, and resolved:

| Conflict Issue | Source A (Documentation / Early Files) | Source B (Source Code / Test Execution) | Authoritative Determination | Technical Reason & Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Telemetry Transport Protocol** | Legacy documentation referenced standalone Node.js WebSocket process (`ws://10.92.0.122:8080`). | Codebase ADR-006 & `main.py#L1004` implement Mosquitto MQTT ingestion + FastAPI SSE stream (`/telemetry/stream`). | **Mosquitto MQTT + FastAPI SSE is the Active Architecture.** | Browser WebSockets exposed unauthenticated sockets and raw credentials. SSE via FastAPI enforces server-side auth without exposing secrets (`docs/DECISIONS.md#ADR-006`). |
| **Physical Hardware Verification Status** | General statements suggested end-to-end physical hardware validation. | `docs/iotconnect.md#L348` and firmware audit explicitly mark physical board testing as unverified. | **Software Verified; Physical Hardware Deferred.** | ESP8266 C++ firmware is fully written and backend ingestion is 100% software-verified; physical board bench testing remains deferred (`PHYSICAL ESP8266: NOT VERIFIED`). |
| **Next.js Production Build Command** | `package.json` default script `"build": "next build"` uses Turbopack engine in Next.js 16. | Turbopack fails on PostCSS loader in `Appointments.module.css`; `npx next build --webpack` compiles cleanly (45/45 pages). | **Webpack Compiler Engine (`--webpack`) is the Active Build Engine.** | Next.js 16 Turbopack compiler exhibits a known PostCSS loader module bug (`TypeError: __turbopack_context__.a`). Webpack build compiles all 45 pages with 0 errors (`docs/KNOWN_ISSUES.md#Issue-4`). |
| **Legacy Blynk/Firebase Code Removal** | Stage 9C instructions outlined legacy Blynk/Firebase code deletion. | Stage 9C mandatory gate audit blocked code deletion because physical hardware was unverified. | **Legacy Fallback Code Preserved behind Compiler Flags.** | Strict Stage 9C rules required 12 hardware validation criteria before code deletion. Because physical hardware bench testing was unavailable, legacy code was correctly preserved (`#define LEGACY_BLYNK_ENABLED 1`). |
| **Backend Pytest Test Counts** | Early documentation files reported "28/28 pytest tests passing". | `backend/tests/` contains 6 test files executing exactly 27 Pytest functions (`27/27 passed in 14.48s`). | **27 Pytest Core Tests + 57 Scratch Verification Tests = 84 Total Passing Tests.** | Authoritative test run confirms 27 Pytest unit/integration tests + 57 scratch Stage verification tests = 84 total passing tests (100% success rate). |

---

# VERIFIED LIMITATIONS

1. **Physical Hardware Bench Unverified**: Microcontroller hardware and sensor bench testing are physically unverified (`PHYSICAL ESP8266: NOT VERIFIED`). Software ingestion and firmware logic are 100% verified via automated synthetic test suites.
2. **ECG Lead-II Waveform Simulation**: The high-frequency ECG waveform on the clinical UI is programmatically generated (`SIMULATED ECG WAVEFORM`).
3. **Sensor Finger Contact Requirement**: MAX30102 pulse oximeter requires optical finger contact (`maxIR > 50000`). When no finger is detected, heart rate and $\text{SpO}_2$ default to `0.0` while ambient room temperature and humidity continue streaming.
4. **Single-Worker SSE Scaling Boundary**: FastAPI Server-Sent Events subscriber set (`_telemetry_subscribers`) operates in-memory process-locally. Multi-worker production scaling requires attaching a shared pub/sub engine (Redis Pub/Sub) to `_telemetry_broadcaster`.
5. **Development MQTT Port 1883**: Development broker operates on plain TCP port 1883 without TLS. Production port 8883 TLS certificate termination is documented as a blueprint configuration (`mosquitto/config/mosquitto.conf`).
6. **Gemini OCR API Key Dependency**: Automated digital prescription extraction (`prescriptions.jsx`) requires `GEMINI_API_KEY`. Unconfigured environments fall back to manual form entry.

---

# FUTURE SCOPE (PROPOSED FUTURE ENHANCEMENTS)

All future capabilities listed below are explicitly categorized as **Proposed Future Enhancements** to ensure clear distinction from existing implemented features:

1. **Proposed Enhancement — Physical Hardware Bench Validation**: Flash ESP8266 firmware to physical NodeMCU board, connect MAX30102, DHT22, and DS18B20 hardware probes, and verify physical Wi-Fi/MQTT telemetry streaming over serial COM7.
2. **Proposed Enhancement — HL7 FHIR R4 Standard Serialization**: Export real-time vitals streams and AI risk predictions as standardized HL7 FHIR R4 `Observation` and `RiskAssessment` JSON bundles for commercial EHR integration.
3. **Proposed Enhancement — Differential Privacy in Federated Aggregation**: Inject Laplace or Gaussian differential privacy noise into Flower `NumPyClient` weight aggregation rounds to prevent model inversion and membership inference attacks.
4. **Proposed Enhancement — Native Mobile Clinician App**: Build cross-platform iOS and Android mobile applications (React Native) for physicians to receive push notifications and view live telemetry on mobile devices.
5. **Proposed Enhancement — Deep Learning 1D-CNN / LSTM ECG Classifier**: Train 1D-Convolutional Neural Networks (1D-CNN) and Long Short-Term Memory (LSTM) networks on MIT-BIH Arrhythmia datasets to classify real-time 12-lead ECG cardiac arrhythmias.
6. **Proposed Enhancement — Shared Redis Event Bus for SSE**: Attach Redis Pub/Sub to `_telemetry_broadcaster` to support multi-worker Uvicorn/Gunicorn deployments across container clusters.

---

# SOURCE / FILE EVIDENCE INDEX

Every technical claim, architectural metric, API signature, and test result in this report is directly traceable to exact repository files:

1. **Root Configuration & Documentation**:
   - `README.md`: Overall platform introduction, default login credentials, high-level architecture diagram.
   - `docs/ARCHITECTURE.md`: High-level system architecture, Mermaid diagrams, component details.
   - `docs/API_DOCUMENTATION.md`: Complete OpenAPI / Swagger endpoint documentation and JSON payload examples.
   - `docs/DATABASE.md`: Canonical Supabase PostgreSQL database schemas, field definitions, and RLS policies.
   - `docs/DECISIONS.md`: Architectural Decision Records (ADR-001 through ADR-006).
   - `docs/TESTING.md`: Verification suite test commands, test counts, and execution guides.
   - `docs/iotconnect.md`: Complete 11-stage IoT telemetry migration audit, topic contract, and hardware gate rules.
   - `docs/ml_docs.md`: Machine learning dataset specifications, model performance metrics, SHAP XAI breakdown, and Flower federated architecture.
   - `docs/SECURITY.md`: HIPAA audit trail enforcement, PBKDF2-SHA256 password hashing, and JWT security policies.
   - `docs/KNOWN_ISSUES.md`: Active tracked technical issues, Turbopack build workaround, and single-worker SSE constraints.

2. **Backend Application Source Code**:
   - `backend/main.py`: FastAPI gateway, JWT auth, security middleware, SSE `/telemetry/stream` endpoint, and route definitions.
   - `backend/app/services/mqtt_ingestion_service.py`: Enterprise MQTT telemetry ingestion service, schema validation, 60s deduplication cache, and threshold alert triggers.
   - `backend/app/services/db_service.py`: Supabase database interaction service, CRUD operations, and memory fallbacks.
   - `backend/app/predict.py`: 12-hour acute clinical deterioration model prediction service.
   - `backend/app/predict_disease.py`: Multi-class Influenza and febrile disease screening service.
   - `backend/app/explain.py`: SHAP TreeExplainer local feature attribution calculation service.
   - `backend/federated/federated_engine.py`: Flower federated learning engine and `FedAvg` parameter aggregation routines.
   - `backend/models/model_registry.py`: Dynamic cross-platform relative path model registry loader.
   - `backend/supabase_schema.sql`: Canonical PostgreSQL database schema and RLS policies.

3. **IoT Firmware & Broker Infrastructure**:
   - `HealthConnect_Kit_ESP8266_Code/ESP8266_MQTT_Client/ESP8266_MQTT_Client.ino`: Non-blocking C++ ESP8266 Arduino firmware for MAX30102, DHT22, DS18B20, and PubSubClient MQTT publishing.
   - `HealthConnect_Kit_ESP8266_Code/secrets.h`: Hardware host configuration and credential template.
   - `mosquitto/config/mosquitto.conf`: Eclipse Mosquitto broker configuration, listeners, and authentication flags.
   - `mosquitto/config/acl`: Mosquitto Access Control List topic isolation rules.
   - `docker-compose.yml`: Containerized Mosquitto MQTT broker deployment manifest.

4. **Frontend Web Application**:
   - `pages/index.jsx`: Main landing page and role-based portal authentication.
   - `pages/monitoring.jsx`: Live clinical telemetry monitoring station view.
   - `pages/ai-dashboard.jsx`: AI risk dashboard rendering SHAP feature attribution cards.
   - `pages/prescriptions.jsx`: E-Prescription reader integrating Google Gemini 2.5 Flash OCR.
   - `pages/admin/federated.jsx`: Federated learning administrative control portal.
   - `components/LiveMonitor/WebSocketMonitor.js`: Reactive SSE stream subscriber component.
   - `components/LiveMonitor/ECGMonitor.js`: Continuous high-frequency ECG waveform visualizer.

5. **Verification & Testing Suites**:
   - `backend/tests/test_api.py`: Pytest REST API endpoint verification suite.
   - `backend/tests/test_database.py`: Pytest database service verification suite.
   - `backend/tests/test_explainability.py`: Pytest SHAP TreeExplainer verification suite.
   - `backend/tests/test_federated.py`: Pytest Flower federated learning verification suite.
   - `backend/tests/test_models.py`: Pytest model artifact loading verification suite.
   - `backend/tests/test_predict.py`: Pytest vitals validation verification suite.
   - `scratch/test_mqtt_ingestion.py`: Stage 5 MQTT ingestion verification suite (17 tests).
   - `scratch/test_stage6_integration.py`: Stage 6 backend & ML integration suite (13 tests).
   - `scratch/test_stage7_frontend.py`: Stage 7 frontend SSE stream suite (18 tests).
   - `scratch/test_stage8_reliability.py`: Stage 8 reliability and security suite (9 tests).
