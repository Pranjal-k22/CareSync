# 🏗️ CareSync — System Architecture Documentation

## 1. High-Level Architecture Overview

CareSync is designed as a decoupled enterprise IoT & ML micro-architecture consisting of edge IoT hardware, Eclipse Mosquitto MQTT message broker, server-side MQTT telemetry ingestion service, FastAPI REST & Server-Sent Events (SSE) gateway, a dual Machine Learning pipeline with SHAP explainability, a Flower federated learning aggregation network, a PostgreSQL database (Supabase), and a Next.js interactive web frontend.

```mermaid
flowchart TD
    subgraph Edge_Hardware["📡 Edge Telemetry Layer (ESP8266 Hardware)"]
        ESP[ESP8266 NodeMCU]
        MAX[MAX30102 Pulse Oximeter]
        DHT[DHT22 Room Temp/Humidity]
        DS18[DS18B20 Body Temp]
        MAX -->|SpO2 & Heart Rate| ESP
        DHT -->|Room Temp & Humidity| ESP
        DS18 -->|Body Temperature| ESP
        
        LEG_B[Legacy Blynk Cloud - Fallback]
        LEG_F[Legacy Firebase Firestore - Fallback]
        ESP -.->|#define LEGACY_BLYNK_ENABLED| LEG_B
        ESP -.->|#define LEGACY_FIREBASE_ENABLED| LEG_F
    end

    subgraph Broker_Layer["⚡ MQTT Message Broker Layer"]
        MOSQ[Eclipse Mosquitto MQTT Broker - Port 1883 / TLS 8883]
        ESP -->|MQTT QoS 1 Vitals & Retained LWT Status| MOSQ
    end

    subgraph Ingestion_Gateway_Layer["🐍 Backend Core & Ingestion Service - Port 8000"]
        INGEST[MQTT Ingestion Service - app/services/mqtt_ingestion_service.py]
        API[FastAPI Gateway - main.py]
        AUTH[PBKDF2 & JWT Security Guard]
        REG[Model Registry - app/model_registry.py]
        AUDIT[HIPAA Audit Log Manager]
        SSE_PUB[FastAPI SSE Broadcaster - /telemetry/stream]
        
        MOSQ -->|Subscribe caresync/#| INGEST
        INGEST --> API
        API --> AUTH
        API --> REG
        API --> AUDIT
        INGEST -->|Broadcast Telemetry Events| SSE_PUB
    end

    subgraph ML_XAI_Layer["🧠 Machine Learning & SHAP XAI Engine"]
        DET[12h Acute Deterioration Model]
        FLU[Multi-Class Influenza Model]
        SHAP[SHAP TreeExplainer Engine]
        
        REG --> DET
        REG --> FLU
        DET & FLU --> SHAP
        INGEST -.->|Auto-Prediction Pathway| DET
    end

    subgraph Federated_Network["🌸 Privacy-Preserving Federated Network"]
        FED_SVR[Flower FedAvg Aggregator]
        NODE_A[Hospital A Edge Node]
        NODE_B[Apollo Telemetry Node]
        NODE_C[Fortis Cardiac Node]
        
        FED_SVR <-->|NumPyClient Weight Aggregation| NODE_A & NODE_B & NODE_C
        FED_SVR -->|Persist Aggregated Weights| REG
    end

    subgraph Database_Layer["🗄️ Database & Storage Layer"]
        SUPABASE[(Supabase PostgreSQL)]
        USERS[(users)]
        PATIENTS[(patients)]
        VITALS[(vitals)]
        PRED_HIST[(prediction_history)]
        AUDIT_TBL[(audit_logs)]
        
        INGEST & API --> SUPABASE
        SUPABASE --> USERS & PATIENTS & VITALS & PRED_HIST & AUDIT_TBL
    end

    subgraph Frontend_App["🖥️ Next.js Web Application - Port 3000"]
        FE_NAV[Navigation & Role Guard]
        DASH[AI Clinical Dashboard]
        STATION[Live Clinical Monitoring Station]
        FED_UI[Federated Learning Admin]
        
        Frontend_App <-->|REST / JSON| API
        SSE_PUB -->|Server-Sent Events /telemetry/stream| Frontend_App
    end
```

---

## 2. Component Architecture Details

### A. Frontend Architecture (Next.js 16)
- **Framework**: Next.js 16 (React 18, Pages router).
- **Styling**: Vanilla CSS, SCSS modules (`Appointments.module.css`, `Prescriptions.module.css`), TailwindCSS, Framer Motion for micro-animations.
- **Data Visualization**: ApexCharts, Chart.js, and Arction LightningChart JS for high-frequency ECG waveform rendering (`SIMULATED ECG WAVEFORM`).
- **Telemetry Transport**: Consumes live MQTT telemetry from backend via Server-Sent Events (`/telemetry/stream`).
- **State & Storage**: Client-side state management with local storage session caching and role guards.

### B. Backend Gateway Architecture (FastAPI)
- **Framework**: FastAPI (Python 3.13) running on Uvicorn ASGI server (`port 8000`).
- **Security**: PBKDF2-SHA256 password hashing, PyJWT bearer authorization, CORS middleware, and custom request validation exception handlers.
- **Realtime Streaming**: Server-Sent Events (SSE) broadcaster `/telemetry/stream` delivering filtered real-time vitals to browser clients.
- **Middleware**: Structured JSON request logging, latency measurement (`X-Process-Time`), and security response headers.

### C. Machine Learning Architecture
1. **12-Hour Acute Deterioration Model**:
   - Algorithm: `RandomForestClassifier` (100 estimators, max depth 12).
   - Input Features: 14 parameters (`heart_rate`, `respiratory_rate`, `spo2_pct`, `temperature_c`, `systolic_bp`, `diastolic_bp`, `oxygen_flow`, `mobility_score`, `nurse_alert`, `age`, `comorbidity_index`, `oxygen_device`, `gender`, `admission_type`).
2. **Influenza & Multi-Class Disease Screening Model**:
   - Algorithm: `GradientBoostingClassifier` (tuned pipeline with median imputation and standard scaling).
   - Target Classes: `0: Normal Baseline`, `1: Flu / Influenza`, `2: Fever-Related Condition`.
3. **SHAP TreeExplainer Engine**:
   - Computes local SHAP attributions via `shap.TreeExplainer` on model pipelines to produce direction (`increases_risk` / `reduces_risk`) and exact attribution magnitudes.

### D. Federated Learning Architecture
- **Framework**: Flower (`flwr.client.NumPyClient`).
- **Nodes**: 3 Edge Hospital Nodes (**Hospital A**: 167,146 samples, **Hospital B**: 125,359 samples, **Hospital C**: 125,361 samples).
- **Weight Aggregation**:
  $$\mathbf{W}_{\text{global}} = \sum_{i=1}^{K} \frac{N_i}{N_{\text{total}}} \mathbf{W}_i, \quad B_{\text{global}} = \sum_{i=1}^{K} \frac{N_i}{N_{\text{total}}} B_i$$
- **Artifact Output**: Aggregated global weights serialized as `.joblib` binary artifacts and version metadata JSON.

### E. Database Architecture (Supabase PostgreSQL)
- **Tables**: `users`, `patients`, `vitals`, `prediction_history`, `alerts`, `audit_logs`.
- **Row Level Security (RLS)**: Enforces role-based isolation between clinical staff, patients, and system administrators.

### F. Real-Time Telemetry & Hardware Layer
- **Edge Hardware**: ESP8266 NodeMCU microcontroller connected to MAX30102 pulse oximeter, DHT22 room temperature/humidity sensor, and DS18B20 body temperature sensor (`PHYSICAL ESP8266: NOT VERIFIED`).
- **Primary Telemetry Transport**: Eclipse Mosquitto MQTT Broker (`port 1883`) publishing QoS 1 JSON payloads to `caresync/{hospital_id}/{device_id}/vitals` and retained LWT status events to `caresync/{hospital_id}/{device_id}/status`.
- **Server-Side Ingestion**: `MQTTIngestionService` (`backend/app/services/mqtt_ingestion_service.py`) subscribes to broker, validates JSON schema, deduplicates packets via `(device_id, seq)`, persists vitals to `DatabaseService`, and triggers auto-prediction/alert evaluation.
- **Legacy Fallback Transports**: Legacy Blynk Cloud (`sendToBlynk()`) and Firebase Firestore REST (`devices/0001` patch) are preserved behind `#define LEGACY_BLYNK_ENABLED 1` and `#define LEGACY_FIREBASE_ENABLED 1` compiler flags pending physical hardware validation.
- **Legacy WebSocket Server**: Standalone Node.js server (`websocket-server/`) preserved in isolated state; inactive in primary clinical telemetry path.

