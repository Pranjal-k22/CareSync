# CHAPTER 3 — REQUIREMENT ARTIFACTS

## 3.1 Functional Requirements

Every functional requirement listed below is extracted directly from authoritative codebase logic and verified against repository source files:

| Requirement ID | Functional Requirement | Detailed Description | Primary Actor | Priority | Implementation Status | Evidence Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | User Authentication & JWT Issuance | Authenticates user login via Doctor ID, Patient ID, or Email; issues 24-hour signed JWT bearer token (`HS256`). | All Users | **High** | **Implemented & Verified** | `backend/main.py#L470-L525` |
| **FR-02** | User Profile Management | Enables users to update profile details, contact info, specialty, and change passwords cleanly. | All Users | **Medium** | **Implemented & Verified** | `backend/main.py#L556-L636` |
| **FR-03** | Patient Record Management | Provides full CRUD operations for de-identified patient demographic and clinical records. | Admin / Doctor | **High** | **Implemented & Verified** | `backend/main.py#L638-L675` |
| **FR-04** | MQTT Telemetry Ingestion | Ingests MQTT QoS 1 vitals packets from `healconnect/+/+/vitals`, validates JSON schema, and deduplicates sequence numbers. | System / IoT | **High** | **Implemented & Verified** | `backend/app/services/mqtt_ingestion_service.py#L120-L240` |
| **FR-05** | Real-Time SSE Telemetry Stream | Streams normalized live vitals to client browsers via `/telemetry/stream` using HTML5 `EventSource`. | Doctor / Patient | **High** | **Implemented & Verified** | `backend/main.py#L1004-L1079` |
| **FR-06** | 12h Deterioration Prediction | Evaluates 12-hour acute clinical deterioration risk score (0-100%) using Random Forest ensemble model. | Doctor | **High** | **Implemented & Verified** | `backend/app/predict.py#L50-L120` |
| **FR-07** | Flu & Disease Screening | Multi-class screening for Flu/Influenza, Febrile Conditions, and Normal Baselines using Gradient Boosting. | Doctor | **High** | **Implemented & Verified** | `backend/app/predict_disease.py#L40-L95` |
| **FR-08** | Atomic Unified AI Prediction | Executes both deterioration and disease models in a single atomic request (`POST /predict-unified`). | Doctor | **High** | **Implemented & Verified** | `backend/app/services/prediction_service.py#L25-L80` |
| **FR-09** | SHAP XAI Attribution | Calculates Shapley feature attributions detailing feature impact magnitude and direction (`increases_risk` / `reduces_risk`). | Doctor | **High** | **Implemented & Verified** | `backend/app/explain.py#L30-L90` |
| **FR-10** | Flower Federated Training | Triggers multi-node Flower `NumPyClient` federated training round across 3 hospital nodes using `FedAvg`. | Admin | **High** | **Implemented & Verified** | `backend/federated/federated_engine.py#L45-L110` |
| **FR-11** | Clinical Threshold Alerts | Generates and persists clinical alerts when vitals breach abnormal bounds ($\text{SpO}_2 < 92\%$, $\text{HR} > 120$). | System / Doctor | **High** | **Implemented & Verified** | `backend/app/services/db_service.py#L180-L210` |
| **FR-12** | HIPAA Security Audit Logging | Dispatches immutable security audit logs (`user_id`, `action`, `resource_type`, `ip_address`, `timestamp`) into RLS-protected table. | Admin | **High** | **Implemented & Verified** | `backend/supabase_schema.sql#L114-L117` |
| **FR-13** | Google Gemini Prescription OCR | Extracts structured digital prescription details from uploaded physical prescription image files via Gemini 2.5 Flash API. | Patient / Doctor | **Medium** | **Implemented & Verified** | `pages/prescriptions.jsx` |
| **FR-14** | ICU Bed Telemetry Allocation | Manages real-time 40-bed ICU and ward telemetry synchronization across Admin and Doctor portals. | Admin / Staff | **Medium** | **Implemented & Verified** | `backend/main.py#L840-L871` |
| **FR-15** | Live ECG Waveform Display | Renders high-frequency visual ECG waveforms on clinical dashboards using Arction LightningChart JS and ApexCharts. | Doctor | **Medium** | **Simulated / Deferred** | `components/LiveMonitor/ECGMonitor.js` |

---

## 3.2 Non-Functional Requirements

- **Performance**: Backend REST API endpoints respond within $< 15\text{ms}$ for AI risk inference requests. SSE telemetry stream delivery latency is sub-$100\text{ms}$ from ingestion to browser UI rendering.
- **Reliability & Resilience**: Microcontroller firmware enforces 1s–30s exponential backoff reconnect logic to prevent network storming. The backend ingestion service uses strict try/except error boundaries so database or ML errors never crash the MQTT consumer loop.
- **Availability**: High availability design decoupling MQTT ingestion, FastAPI serving, and PostgreSQL storage.
- **Scalability**: MQTT topic hierarchy (`healconnect/{hospital}/{device}/vitals`) supports scaling across thousands of edge hardware nodes. In-memory sliding-window deduplication prevents database write saturation.
- **Security & Compliance**: Enforces PBKDF2-SHA256 password hashing (600,000 rounds), PyJWT token authorization (`HS256`), CORS origin restriction, Mosquitto ACL topic rules (`allow_anonymous false`), and immutable insert-only `audit_logs` table policies.
- **Maintainability & Portability**: 100% standard Python `Path(__file__).resolve()` dynamic relative path resolution across all ML model registries and backend scripts, eliminating cross-platform path failures.
- **Usability & Interoperability**: Modern responsive UI with SCSS modules and TailwindCSS; interactive OpenAPI Swagger documentation at `/docs`.

---

## 3.3 Hardware Requirements

| Hardware Component | Clinical & Technical Purpose | Data Generated | Communication Interface | Implementation Status | Physical Verification Status | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ESP8266 NodeMCU** | Edge microcontroller unit; samples sensors, formats JSON, manages Wi-Fi & MQTT connections. | Microcontroller status, sequence counter, timestamp | Wi-Fi 802.11 b/g/n, SPI/UART, MQTT QoS 1 | **Implemented (Firmware written)** | **PHYSICAL HARDWARE: NOT VERIFIED** | `HealthConnect_Kit_ESP8266_Code/ESP8266_MQTT_Client/ESP8266_MQTT_Client.ino` |
| **MAX30102** | Optical pulse oximeter and heart rate sensor probe; features 100-sample FIFO buffer. | Heart Rate (BPM), Blood Oxygen Saturation ($\text{SpO}_2\%$), IR/Red raw PPG | I2C (SDA=D2/GPIO4, SCL=D1/GPIO5, 400kHz) | **Implemented (Firmware written)** | **PHYSICAL HARDWARE: NOT VERIFIED** | `ESP8266_MQTT_Client.ino#L209-L227` |
| **DHT22** | Digital relative room temperature and humidity sensor. | Room Temp (°C), Relative Humidity (%) | Single-wire digital data pin (Pin D5/GPIO14) | **Implemented (Firmware written)** | **PHYSICAL HARDWARE: NOT VERIFIED** | `ESP8266_MQTT_Client.ino#L229-L230` |
| **DS18B20** | Water-proof digital probe body temperature sensor; includes disconnect fault checking. | Body Temperature (°C) | Dallas OneWire protocol (Pin D6/GPIO12, 4.7k pull-up) | **Implemented (Firmware written)** | **PHYSICAL HARDWARE: NOT VERIFIED** | `ESP8266_MQTT_Client.ino#L232-L240` |
| **ECG Stream** | Lead-II ECG synthetic generator for real-time telemetry visualizer. | 500Hz Lead-II ECG waveform signal | Synthetic Stream API | **Simulated** | **N/A (Software Stream)** | `components/LiveMonitor/ECGMonitor.js` |

---

## 3.4 Software Requirements

- **Programming Languages**: Python `3.13`, JavaScript (Node.js `18+` / ES6+), C++ (Arduino IDE / ESP8266 Toolchain), SQL (PostgreSQL 15 dialect).
- **Backend Frameworks**: FastAPI `0.115`, Pydantic V2, PyJWT, Passlib, Uvicorn ASGI Server.
- **Frontend Technologies**: Next.js `16.3`, React `18`, SCSS Modules, TailwindCSS, Framer Motion, ApexCharts, Chart.js, Arction LightningChart JS, Lucide React icons.
- **Machine Learning & Data Science**: Scikit-Learn `1.5+`, NumPy, Pandas, Joblib, SHAP `0.45+` (`shap.TreeExplainer`), Flower `1.33.0` (`flwr.client.NumPyClient`).
- **Database & Storage**: Supabase PostgreSQL 15+, Supabase JS Client (`@supabase/supabase-js`), Supabase Python Client.
- **MQTT Message Broker**: Eclipse Mosquitto MQTT Broker v2.0 (Dockerized container, TCP Port 1883 dev / 8883 TLS blueprint, password auth, ACL rules).
- **Testing & Quality Assurance**: Pytest `8.0+`, FastAPI `TestClient`, custom scratch Stage 5-8 verification suites (100% pass rate across 84 tests).
- **Build & Package Management**: Node.js `npm`, Python `pip`, Webpack build engine (`npx next build --webpack`).

---

## 3.5 User Requirements

- **System Administrator**: Requires centralized system dashboard to onboard doctors/staff, configure ICU ward beds, trigger global federated learning rounds, and audit immutable security logs.
- **Physician / Doctor**: Requires real-time multi-patient telemetry monitoring, predictive deterioration risk alerts, SHAP explanation breakdowns for clinical decisions, patient history lookup, and tele-consultation video rooms.
- **Nurse / Staff Caregiver**: Requires intuitive interface to update ward bed statuses, record manual vital sign observations, and acknowledge urgent vital threshold alerts.
- **Patient**: Requires accessible portal to review personal vital trends, access digitized e-prescriptions, download lab reports, and join video telehealth calls with assigned physicians.

---

## 3.6 System Requirements

- **Edge Hardware Node**: ESP8266 NodeMCU microcontrollers powered by 5V DC micro-USB, connected to local 2.4GHz Wi-Fi (WPA2-PSK), publishing to Mosquitto broker port 1883.
- **Backend Application Server**: Multi-core CPU (x86_64 or ARM64), minimum 4GB RAM, running Linux/Windows OS with Python 3.10+, Uvicorn server bound to port 8000.
- **Database Server**: Supabase PostgreSQL instance with Row Level Security enabled and SSL connection support.
- **Client Web Browser**: Modern Evergreen Browser (Google Chrome 100+, Mozilla Firefox 100+, Apple Safari 15+, Microsoft Edge) supporting HTML5 `EventSource` (SSE) and ES6 JavaScript.

---

## 3.7 Use Cases

### Use Case UC-01: Authenticate User & Issue JWT Token
- **Actors**: All System Users (`admin`, `doctor`, `patient`)
- **Precondition**: User possesses registered account credentials.
- **Main Flow**: User submits Doctor ID / Email and password via `POST /login`. Backend hashes input password using PBKDF2-SHA256 and compares with stored hash. Upon match, backend generates a 24-hour signed JWT token containing user identity and role claim.
- **Alternative Flow**: Invalid credentials cause `401 Unauthorized` response and trigger an audit event in `audit_logs`.
- **Postcondition**: User receives JWT token and is redirected to their role-specific portal.
- **Status**: Implemented & Verified ([`backend/main.py:L470-L526`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/main.py#L470-L526)).

### Use Case UC-02: Real-Time MQTT Telemetry Ingestion & SSE Broadcast
- **Actors**: ESP8266 Edge Device, Ingestion Service, Frontend Dashboard
- **Precondition**: Mosquitto MQTT broker is active; ESP8266 is connected to Wi-Fi.
- **Main Flow**: ESP8266 samples MAX30102/DHT22/DS18B20 sensors every 2000ms and publishes QoS 1 JSON vitals payload to `healconnect/{hospital_id}/{device_id}/vitals`. `MQTTIngestionService` receives message, validates schema and numeric ranges, checks 60-second sliding-window deduplication cache, persists vitals to Supabase, and broadcasts event to `_telemetry_broadcaster`. Client browser connected to `/telemetry/stream` receives live event via SSE and updates dashboard charts.
- **Alternative Flow**: Malformed JSON or out-of-range vitals trigger a warning log without interrupting the MQTT consumer loop.
- **Status**: Implemented & Verified ([`mqtt_ingestion_service.py:L120-L240`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/app/services/mqtt_ingestion_service.py#L120-L240)).

### Use Case UC-03: Execute Dual-Model AI Risk Prediction & SHAP Explanation
- **Actors**: Attending Physician / Doctor
- **Precondition**: Patient vitals are recorded or provided via API.
- **Main Flow**: Doctor clicks "Analyze Risk" or backend triggers auto-prediction. Backend calls `predict_unified()`, which passes vitals to `RandomForestClassifier` (12h deterioration) and `GradientBoostingClassifier` (disease screening). SHAP `TreeExplainer` computes feature attributions. Unified response returning risk scores, levels (`HIGH`/`CRITICAL`), and SHAP top factors is returned and logged to `prediction_history`.
- **Status**: Implemented & Verified ([`predict.py:L50-L120`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/app/predict.py#L50-L120)).

### Use Case UC-04: Trigger Privacy-Preserving Federated Learning Round
- **Actors**: System Administrator
- **Precondition**: At least 3 hospital edge client nodes are connected.
- **Main Flow**: Admin clicks "Run Federated Training Round" on Admin Portal (`admin/federated.jsx`). Backend executes `run_federated_training_round()`, invoking Flower `NumPyClient` across Hospital A, Apollo, and Fortis nodes (334k samples). Nodes compute local scikit-learn weight matrices and send weights to FedAvg server. Server computes weighted parameter average and serializes updated global model to `.joblib` binary.
- **Status**: Implemented & Verified ([`federated_engine.py:L45-L110`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/federated/federated_engine.py#L45-L110)).

---

## 3.8 Requirement Traceability Matrix

| Requirement ID | Module / Component | Implementation Source File | Automated Test Verification File | Status |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01 (JWT Auth)** | Backend Auth Gateway | `backend/main.py#L470-L525` | `backend/tests/test_api.py#L7-L12` | **VERIFIED PASS** |
| **FR-04 (MQTT Ingestion)** | Ingestion Service | `backend/app/services/mqtt_ingestion_service.py` | `scratch/test_mqtt_ingestion.py` (17 tests) | **VERIFIED PASS** |
| **FR-05 (SSE Stream)** | FastAPI Telemetry Gateway | `backend/main.py#L1004-L1079` | `scratch/test_stage7_frontend.py` (18 tests) | **VERIFIED PASS** |
| **FR-06 (Deterioration ML)** | Prediction Engine | `backend/app/predict.py` | `backend/tests/test_predict.py` | **VERIFIED PASS** |
| **FR-07 (Disease ML)** | Disease Screening Engine | `backend/app/predict_disease.py` | `backend/tests/test_api.py#L40-L55` | **VERIFIED PASS** |
| **FR-08 (Unified AI)** | Prediction Service | `backend/app/services/prediction_service.py` | `backend/tests/test_api.py#L76-L98` | **VERIFIED PASS** |
| **FR-09 (SHAP XAI)** | Explainability Service | `backend/app/explain.py` | `backend/tests/test_explainability.py` | **VERIFIED PASS** |
| **FR-10 (Federated ML)** | Flower Federated Engine | `backend/federated/federated_engine.py` | `backend/tests/test_federated.py` | **VERIFIED PASS** |
| **FR-11 (Vitals Alerts)** | Database Service | `backend/app/services/db_service.py` | `scratch/test_stage6_integration.py` | **VERIFIED PASS** |
| **FR-12 (HIPAA Audit)** | PostgreSQL / Supabase | `backend/supabase_schema.sql` | `backend/tests/test_database.py` | **VERIFIED PASS** |
