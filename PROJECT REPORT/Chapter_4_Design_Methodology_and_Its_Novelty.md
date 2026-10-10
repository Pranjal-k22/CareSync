# CHAPTER 4 — DESIGN METHODOLOGY AND ITS NOVELTY

## 4.1 Overall System Architecture

HealConnect is engineered as a decoupled, multi-layered enterprise micro-architecture. The system separates high-frequency hardware telemetry ingestion from analytical machine learning inference, real-time client streaming, and database storage.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. EDGE TELEMETRY LAYER (ESP8266 Hardware / C++ Firmware)              │
│    Sensors: MAX30102 (SpO2/HR), DHT22 (Room), DS18B20 (Body Temp)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (MQTT QoS 1 / Wi-Fi)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. MQTT MESSAGE BROKER LAYER (Eclipse Mosquitto - Port 1883/8883)       │
│    Topics: healconnect/{hospital_id}/{device_id}/vitals & /status     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (paho-mqtt Ingestion Subscriber)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. INGESTION & BACKEND GATEWAY LAYER (FastAPI - Port 8000)             │
│    - MQTT Ingestion Service (Schema validation, 60s Dedup, Thresholds) │
│    - PBKDF2 / JWT Security & HIPAA Audit Trail Logger                  │
│    - Model Registry Manager & SSE Telemetry Broadcaster (/stream)     │
└───────────────┬───────────────────┬───────────────────┬────────────────┘
                │                   │                   │
                ▼                   ▼                   ▼
┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────────┐
│ 4. DATABASE LAYER     │ │ 5. ML & XAI LAYER │ │ 6. FEDERATED NETWORK   │
│ Supabase PostgreSQL   │ │ - 12h Deteriorat. │ │ Flower NumPyClient     │
│ (vitals, patients,    │ │ - Flu Screening   │ │ 3 Hospital Nodes       │
│ predictions, audits)  │ │ - SHAP Explainer  │ │ (334k Total Samples)   │
└───────────────────────┘ └───────────────────┘ └────────────────────────┘
                │                   │
                └───────────────────┼───────────────────┐
                                    ▼                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 7. REACTIVE CLINICAL FRONTEND LAYER (Next.js 16 - Port 3000)            │
│    Admin Bed Control, Doctor Live Telemetry Dashboard, Patient Portal  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4.2 Architecture Diagram Textual Flow Description

1. **Edge-to-Broker Flow**: The ESP8266 NodeMCU reads physiological data from MAX30102 (SpO2/HR via I2C), DHT22 (room temp/humidity), and DS18B20 (body temp via OneWire). Every 2000ms, non-blocking `millis()` routines format a JSON telemetry packet (`version`, `device_id`, `seq`, `vitals`) and publish it over Wi-Fi to Mosquitto MQTT broker (`healconnect/{hosp}/{dev}/vitals`, QoS 1).
2. **Broker-to-Ingestion Flow**: The Eclipse Mosquitto broker evaluates client authentication (`allow_anonymous false`) and ACL rules (`mosquitto/config/acl`). `MQTTIngestionService` (`paho-mqtt` background thread) receives the packet, parses topic segments, validates JSON schemas and numerical bounds, checks a 60-second sliding cache window (`device_id`, `seq`) to drop duplicates, saves valid vitals to Supabase PostgreSQL via `DatabaseService`, and pushes the record to `_telemetry_broadcaster`.
3. **Ingestion-to-Streaming Flow**: The FastAPI SSE streaming channel (`/telemetry/stream`) listens to `_telemetry_broadcaster`. Active client browser connections matching `patient_id` or `hospital_id` filters receive real-time JSON events over persistent `text/event-stream` channels.
4. **Ingestion-to-ML & XAI Flow**: When inbound vitals breach critical bounds ($\text{SpO}_2 < 92\%$), `mqtt_ingestion_service` automatically invokes `predict_patient_health_risk()`. The 12-hour acute deterioration model evaluates physiological feature vectors, SHAP `TreeExplainer` computes attributions, an alert is persisted to Supabase, and notification flags are broadcast.
5. **Federated Learning Flow**: On demand, the System Admin triggers `run_federated_training_round()`. The central Flower server coordinates with edge client nodes at Hospital A, Apollo, and Fortis. Each node trains scikit-learn models on local data and returns model parameters ($\mathbf{W}, B$). The server executes weighted `FedAvg` parameter aggregation and updates the global production model.

---

## 4.3 IoT Architecture & MQTT Communication Contract

### ESP8266 Firmware Execution Loop
The firmware ([`ESP8266_MQTT_Client.ino`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/HealthConnect_Kit_ESP8266_Code/ESP8266_MQTT_Client/ESP8266_MQTT_Client.ino)) operates on a non-blocking architecture:
- **`setup()`**: Configures Serial at 115200 baud, initializes I2C bus `Wire.begin(D2, D1)` for MAX30102 (SDA=D2, SCL=D1), initializes DHT22 on D5 and DS18B20 on D6, sets Mosquitto broker server host/port, and allocates a 512-byte PubSubClient MQTT buffer.
- **`loop()`**: Executes `maintainWiFi()` and `maintainMQTT()` on every cycle. Timer checking `if (currentMillis - lastPublishTime >= 2000)` triggers sensor sampling, MAX30102 100-sample FIFO reading (`maxim_heart_rate_and_oxygen_saturation`), finger contact detection (`maxIR > 50000`), JSON payload construction (`snprintf`), and MQTT QoS 1 publishing.

### Canonical MQTT Topic Hierarchy & Contract

| Topic Structure | Direction | QoS | Retained | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| `healconnect/{hospital_id}/{device_id}/vitals` | ESP8266 $\rightarrow$ Ingestion | 1 | `false` | Primary vital signs telemetry streaming packet. |
| `healconnect/{hospital_id}/{device_id}/status` | ESP8266 $\rightarrow$ Ingestion | 1 | `true` | Retained Last Will & Testament (LWT) online/offline device state. |
| `healconnect/{hospital_id}/{device_id}/alerts` | Ingestion $\rightarrow$ Dispatch | 1 | `false` | Critical threshold alert notification packet. |

### JSON Telemetry Payload Schema Example
```json
{
  "version": "1.0",
  "device_id": "node-9901",
  "patient_id": "PAT-1001",
  "timestamp": "2026-09-27T10:00:00Z",
  "seq": 1001,
  "source": "esp8266_hardware",
  "heart_rate": 74.0,
  "spo2": 98.0,
  "temperature": 36.8,
  "vitals": {
    "heart_rate": 74.0,
    "spo2": 98.0,
    "body_temp": 36.8,
    "room_temp": 24.5,
    "humidity": 50.0,
    "finger_detected": true
  },
  "units": {
    "heart_rate": "bpm",
    "spo2": "%",
    "body_temp": "celsius",
    "room_temp": "celsius",
    "humidity": "%"
  }
}
```

---

## 4.4 MQTT Architecture & Broker Configuration

- **Broker Engine**: Eclipse Mosquitto v2.0 running via Docker container (`docker-compose.yml`).
- **Authentication**: Direct username/password authentication enabled via `password_file` (`mosquitto/config/password_file`); anonymous access strictly disabled (`allow_anonymous false`).
- **Access Control Lists (ACL)**: Configured in `mosquitto/config/acl`. Device client IDs are restricted exclusively to their own hospital/device topic namespace (`healconnect/{hospital_id}/{device_id}/#`), preventing cross-device topic hijacking or unauthorized eavesdropping.
- **Reconnection & Resilience**: Client microcontrollers implement exponential retry backoff (doubling from 1000ms to 30000ms max) on Wi-Fi and MQTT connection loss. Server-side `paho-mqtt` ingestion client uses `reconnect_delay_set(1, 120)` to maintain connection resilience.

---

## 4.5 Backend Architecture (FastAPI Gateway)

- **Asynchronous Execution**: Built on FastAPI and ASGI Uvicorn server, supporting non-blocking async routes and background event dispatching.
- **Pydantic Type Validation**: All request payloads are strictly validated against Pydantic schemas (`VitalsInput`, `DiseaseInput`, `PredictionPayload`) with physiological range constraints ($\text{SpO}_2: 50–100\%$, $\text{HR}: 30–250\text{ BPM}$, $\text{Temp}: 90–110^\circ\text{F}$).
- **Custom Exception Sanitization**: Global exception handlers intercept `RequestValidationError` to return sanitized HTTP 422 JSON responses, completely preventing internal Python stack traces from leaking to client responses.
- **Middleware Chain**: Includes Security Headers Middleware (`X-Content-Type-Options`, `X-Frame-Options`, `CSP`), Structured JSON Logging Middleware (calculating request execution time `X-Response-Time-MS`), and CORS Middleware.

---

## 4.6 Real-Time Communication Architecture (SSE)

- **Rationale for SSE Choice**: Server-Sent Events (SSE) via `/telemetry/stream` was selected over client-side WebSockets or direct browser MQTT because:
  1. It requires **zero client-side broker credentials** (`MQTT_PASSWORD`), eliminating secret exposure in browser JS bundles.
  2. Native browser `EventSource` handles **automatic reconnection** with retry backoff.
  3. Server-side FastAPI routes enforce **tenant & patient access control** before streaming data.
- **Connection Lifecycle**:
  1. Client browser initializes `new EventSource('/telemetry/stream?patient_id=PAT-1001')`.
  2. Server returns `200 OK` with headers `Content-Type: text/event-stream`, `Cache-Control: no-cache`.
  3. Server emits connection acknowledgement JSON event, followed by recent vital records.
  4. As `MQTTIngestionService` receives new vitals, events are pushed to the client queue. Periodic heartbeat pings (`event: heartbeat`) prevent intermediate proxy timeouts.
- **Documented Multi-Worker Scaling Limitation**: SSE subscriber queue set operates in-memory per FastAPI worker process. For multi-worker Uvicorn setups, a shared pub/sub engine (Redis / Supabase Realtime) must be attached to `_telemetry_broadcaster`.

---

## 4.7 Frontend Architecture (Next.js 16)

- **Framework & Routing**: Next.js 16 Pages router (`pages/index.jsx`, `monitoring.jsx`, `ai-dashboard.jsx`, `prescriptions.jsx`, `admin/federated.jsx`).
- **Styling & Micro-Animations**: Modular CSS/SCSS (`Appointments.module.css`, `Prescriptions.module.css`), TailwindCSS utility classes, Framer Motion transitions.
- **Data Visualization**: ApexCharts gauges for deterioration risk scores, Chart.js multi-line charts for vital sign history, Arction LightningChart JS for high-frequency ECG waveform rendering.
- **Telemetry Consumption**: `WebSocketMonitor.js` subscriber component consumes live SSE stream (`/telemetry/stream`), updating reactive React 18 state hooks without full page re-renders.

---

## 4.8 Database Design (Supabase PostgreSQL Schema)

```sql
-- 1. Users & Accounts Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'patient', 'staff')),
  full_name TEXT NOT NULL,
  doctor_id TEXT UNIQUE,
  patient_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. De-Identified Patients Table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  admission_type TEXT CHECK (admission_type IN ('Emergency', 'Elective', 'Urgent')),
  comorbidity_index NUMERIC DEFAULT 0.0,
  assigned_doctor_id TEXT REFERENCES users(doctor_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Telemetry Sensor Vitals Table
CREATE TABLE vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT REFERENCES patients(patient_id),
  device_id TEXT NOT NULL,
  hospital_id TEXT NOT NULL,
  heart_rate NUMERIC NOT NULL,
  spo2_pct NUMERIC NOT NULL,
  temperature_c NUMERIC NOT NULL,
  room_temp NUMERIC,
  humidity NUMERIC,
  finger_detected BOOLEAN DEFAULT true,
  seq INTEGER DEFAULT 0,
  source TEXT DEFAULT 'mqtt_ingestion',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Prediction History Audit Table
CREATE TABLE prediction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id TEXT UNIQUE NOT NULL,
  patient_id TEXT REFERENCES patients(patient_id),
  prediction_type TEXT CHECK (prediction_type IN ('Deterioration', 'Disease/Flu', 'Unified')),
  risk_score NUMERIC NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  model_version TEXT NOT NULL,
  top_factors JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Immutable HIPAA Audit Logs Table (INSERT ONLY RLS)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insert-only audit trail" ON audit_logs FOR INSERT WITH CHECK (true);
```

---

## 4.9 Security Architecture

1. **Authentication & Authorization**: Password hashing using PBKDF2-SHA256 with random 16-byte salt and 600,000 key derivation iterations (`hash_password()`). Authorization via signed 24-hour JWT tokens (`HS256`).
2. **MQTT Broker Access Control**: Mosquitto username/password authentication (`allow_anonymous false`) paired with strict ACL topic policies (`mosquitto/config/acl`).
3. **Zero Browser Credential Leakage**: Web browsers consume telemetry exclusively over FastAPI SSE (`/telemetry/stream`). Zero broker passwords or database service-role keys are exported to client JavaScript bundles.
4. **Immutable HIPAA Audit Trail**: All authentication events, patient record updates, bed allocation changes, and AI inference executions dispatch immutable records to `audit_logs` protected by PostgreSQL RLS.

---

## 4.10 Design Methodology

HealConnect was engineered using a **Layered, Event-Driven Micro-Architecture** combined with **Test-Driven Verification**:
- **Event-Driven Pub/Sub**: Edge microcontrollers publish vitals asynchronously to Mosquitto MQTT; server ingestion listens to topics and broadcasts events to reactive UI streams.
- **Layered Decoupling**: Hardware ingestion, REST API serving, ML inference, federated learning, and database storage run in decoupled modules.
- **Test-Driven Verification**: Engineering progress was gated through Stage 0 to Stage 11 verification suites, enforcing 100% test pass rates (`84/84 tests passing`) before release candidate tagging.

---

## 4.11 Novelty & Distinctive Technical Combinations

HealConnect does not make exaggerated marketing claims ("world's first" or "revolutionary"). Instead, it presents four technically defensible architectural innovations validated by source code evidence:

1. **Integrated Real-Time MQTT-to-SSE Telemetry Bridge**: Bridges edge IoT hardware MQTT publishing (QoS 1) with browser client Server-Sent Events (`/telemetry/stream`) without exposing broker credentials to frontend JavaScript bundles (`backend/app/services/mqtt_ingestion_service.py` & `backend/main.py#L1004`).
2. **Dual-Engine AI Risk Forecasting with Local SHAP Explanations**: Combines 12-hour acute deterioration forecasting (`RandomForestClassifier`, ROC-AUC `0.9120`) and multi-class disease screening (`GradientBoostingClassifier`, ROC-AUC `0.9970`) with real-time SHAP `TreeExplainer` Shapley feature attributions (`backend/app/explain.py`), converting black-box probabilities into directional clinical insights.
3. **Cross-Hospital Privacy-Preserving Federated Learning Network**: Subclasses Flower `flwr.client.NumPyClient` across 3 hospital edge nodes (334,291 total records) to aggregate scikit-learn model parameters via weighted `FedAvg` (`backend/federated/federated_engine.py`), demonstrating multi-hospital collaborative model optimization without raw patient data centralization.
4. **Non-Blocking Resilient Edge Microcontroller Firmware**: Combines MAX30102 100-sample optical FIFO collection with `millis()` timer scheduling, DS18B20 fault recovery (`DEVICE_DISCONNECTED_C`), sequence counter persistence, and 1s–30s exponential backoff reconnection loops (`ESP8266_MQTT_Client.ino`), eliminating blocking delay loops and infinite reboot storms.
