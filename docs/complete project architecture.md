# CareSync — Complete Project Architecture Master Specification

> **File Path:** `architecture-project/complete project architecture.md`  
> **Target:** Master Single-File Reference Specification for CareSync Architecture  
> **Repository Root:** `C:\Users\pc\Desktop\capstone\Heal_connectmain2.0`  
> **Status:** Code-Grounded, Fully Verified & Classified  

---

## Executive Summary & System Overview

**CareSync** is a cloud-native, IoT-enabled Remote Patient Monitoring (RPM) and Clinical Decision Support (CDS) platform. It provides real-time vital signs telemetry ingestion via MQTT, automated patient deterioration risk scoring (`RandomForestClassifier`, **94.59% accuracy**), Explainable AI (SHAP `TreeExplainer`), low-latency streaming via Server-Sent Events (SSE), and privacy-preserving multi-hospital Federated Learning (Flower).

---

## 1. Overall System Architecture

```mermaid
flowchart TD
    subgraph IoT_Edge["1. IoT Edge Layer [Hardware Unverified]"]
        ESP["ESP8266 Microcontroller (C++)"]
        MAX["MAX30102 Sensor (HR/SpO2)"]
        DHT["DHT22 Sensor (Temperature)"]
        ECG["Simulated ECG Stream [SIMULATED]"]
        MAX & DHT & ECG --> ESP
    end

    subgraph MQTT_Broker["2. MQTT Messaging Broker"]
        Mosquitto["Eclipse Mosquitto Broker (Port 1883/8883)"]
        ESP -->|Pub: healconnect/+/+/vitals| Mosquitto
    end

    subgraph Ingestion_Layer["3. Ingestion & Backend Core"]
        Ingest["MQTT Ingestion Worker (paho-mqtt)"]
        Mosquitto -->|Sub: healconnect/+/+/vitals| Ingest
        DB[("Database (SQLite / Supabase Postgres)")]
        ML["RandomForest Risk ML Model (risk_model.joblib)"]
        SHAP["SHAP TreeExplainer Service"]
        
        Ingest -->|1. Raw Vitals| DB
        Ingest -->|2. Score Deterioration| ML
        ML -->|3. Feature Attribution| SHAP
        SHAP -->|4. Risk Record & SHAP| DB
    end

    subgraph Streaming_Layer["4. Real-Time SSE Layer"]
        SSE["FastAPI SSE Endpoint (/telemetry/stream)"]
        Ingest -->|5. Telemetry Event| SSE
    end

    subgraph Client_Layer["5. Frontend Visual Analytics"]
        NextJS["Next.js 16 Web App (React 19)"]
        SSE -->|HTTP EventSource| NextJS
        NextJS -->|Render Recharts| Dashboard["Clinical Dashboard UI"]
    end
```

---

## 2. Frontend Architecture

```mermaid
flowchart TD
    subgraph Client_App["Next.js 16 Client App (Pages Router)"]
        IndexPage["pages/index.js (Landing / Login)"]
        DashPage["pages/dashboard.jsx (Clinical Overview)"]
        LivePage["pages/live-monitoring.jsx (Real-time Telemetry)"]
        ApptPage["pages/appointments.jsx (Scheduling)"]
        RxPage["pages/prescriptions.jsx (Medications)"]
    end

    subgraph UI_Components["UI Components (components/)"]
        LiveMon["LiveMonitor/ (WebSocketMonitor.js / LiveVitals)"]
        Visuals["Visualizations/ (Recharts Charts & Gauges)"]
        DashComp["Dashboard/ (Patient Risk Cards)"]
    end

    subgraph External_Comm["Communication Layer"]
        FetchAPI["HTTP REST Client (fetch/axios)"]
        EventSrc["EventSource (SSE /telemetry/stream)"]
    end

    LivePage --> LiveMon
    LivePage --> Visuals
    DashPage --> DashComp
    
    LiveMon --> EventSrc
    IndexPage & DashPage & ApptPage --> FetchAPI
```

---

## 3. Backend Architecture

```mermaid
flowchart TD
    Client["Client Request (REST / SSE)"] --> Router["FastAPI Main Router (backend/app/main.py)"]
    
    subgraph API_Routes["API Route Controllers (backend/app/api/)"]
        AuthRoute["auth.py (Login/Register)"]
        PatientRoute["patients.py (Patient CRUD)"]
        TelemRoute["telemetry.py (Vitals & SSE Stream)"]
        MLRoute["ml.py (Risk Scoring & SHAP)"]
    end

    subgraph Middleware_Core["Core & Middleware (backend/app/core/)"]
        JWTAuth["security.py (OAuth2 Bearer / Bcrypt)"]
        Config["config.py (Settings & Env)"]
        DBEngine["db.py (SQLAlchemy Sessionmaker)"]
    end

    subgraph Services_Layer["Services Layer (backend/app/services/)"]
        DBService["db_service.py (Query Helper)"]
        MQTTService["mqtt_service.py (paho-mqtt Worker)"]
        SHAPService["backend/app/explain.py (TreeExplainer)"]
    end

    subgraph Models_Store["Data Models & ML Artifacts"]
        DBModels["models/ (User, Patient, Vitals SQL Models)"]
        MLArtifacts["backend/models/risk_model.joblib"]
    end

    Router --> AuthRoute & PatientRoute & TelemRoute & MLRoute
    AuthRoute & PatientRoute & TelemRoute & MLRoute --> JWTAuth & DBEngine
    TelemRoute & MLRoute --> DBService & SHAPService
    DBService --> DBModels
    SHAPService --> MLArtifacts
```

---

## 4. Database Schema Architecture

```mermaid
erDiagram
    users {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string role
        timestamp created_at
    }

    hospitals {
        uuid id PK
        string name
        string location
        timestamp created_at
    }

    patients {
        uuid id PK
        uuid hospital_id FK
        string patient_code UK
        string full_name
        int age
        string gender
        string room_number
        timestamp created_at
    }

    devices {
        uuid id PK
        uuid patient_id FK
        string mac_address UK
        string device_status
        timestamp registered_at
    }

    vitals {
        uuid id PK
        uuid patient_id FK
        uuid device_id FK
        float heart_rate
        float spo2
        float temperature
        timestamp recorded_at
    }

    risk_scores {
        uuid id PK
        uuid patient_id FK
        float risk_score
        string risk_level
        json shap_values
        timestamp calculated_at
    }

    alerts {
        uuid id PK
        uuid patient_id FK
        string alert_type
        string message
        boolean resolved
        timestamp triggered_at
    }

    hospitals ||--o{ patients : "hosts"
    patients ||--o{ devices : "assigned"
    patients ||--o{ vitals : "logs"
    patients ||--o{ risk_scores : "evaluates"
    patients ||--o{ alerts : "triggers"
    devices ||--o{ vitals : "transmits"
```

---

## 5. Machine Learning Architecture

```mermaid
flowchart TD
    subgraph Offline_Training["Offline ML Pipeline (ml/)"]
        DS1["cleaned_hospital_data.csv (167,146 samples)"] --> Pre1["preprocess.py (StandardScaler, Median Imputer)"]
        Pre1 --> Train1["train.py (RandomForestClassifier, n_estimators=100)"]
        Train1 --> Eval1["evaluate.py (ROC-AUC: 0.9120, Acc: 94.59%)"]
        Eval1 --> Joblib1["backend/models/risk_model.joblib"]

        DS2["disease_prediction_dataset.csv (15,000 samples)"] --> Train2["train_disease_model.py (GradientBoosting)"]
        Train2 --> Eval2["evaluate_disease_model.py (ROC-AUC: 0.9970, Acc: 96.58%)"]
        Eval2 --> Joblib2["backend/models/flu_model_v1.joblib"]
    end

    subgraph Online_Inference["Online Inference & XAI Pipeline"]
        InputData["14 Feature Vector (HR, SpO2, Temp, BP, Demographics)"] --> Scaler["risk_model_scaler.joblib"]
        Scaler --> Estimator["risk_model.joblib (predict_proba)"]
        Estimator --> RiskOutput["Risk Category (LOW, MODERATE, HIGH)"]
        Estimator --> SHAPService["backend/app/explain.py (shap.TreeExplainer)"]
        SHAPService --> SHAPVector["SHAP Feature Contributions JSON"]
    end

    subgraph Federated_Lab["Federated Learning & Privacy Sandbox (ml/ & exp_project/)"]
        FLClient["federated_client.py (Flower NumPyClient)"]
        FLServer["federated_server.py (FedAvg Aggregator)"]
        DPNoise["federated_differential_privacy.py (Laplace Noise Injection)"]
        FLClient --> FLServer
        DPNoise --> FLClient
    end
```

---

## 6. IoT Edge & MQTT Architecture

```mermaid
flowchart TD
    subgraph Edge_Devices["IoT Edge Layer [Hardware Unverified]"]
        ESP["ESP8266 Microcontroller (C++)"]
        MAX["MAX30102 Sensor (Pulse Rate / SpO2)"]
        DHT["DHT22 Sensor (Body Temperature)"]
        AD["Simulated ECG Stream [SIMULATED]"]
        MAX & DHT & AD --> ESP
    end

    subgraph Broker_Transport["Mosquitto MQTT Broker (Ports 1883/8883)"]
        Mosquitto["Eclipse Mosquitto Broker"]
        ACL["ACL & Password Authentication"]
        ESP -->|Pub: healconnect/+/+/vitals (QoS 1)| Mosquitto
    end

    subgraph Server_Ingestion["Backend Ingestion Engine"]
        Ingest["Python MQTT Ingestion Worker (paho-mqtt)"]
        Mosquitto -->|Sub: healconnect/+/+/vitals| Ingest
    end

    subgraph Streaming_Output["Real-Time User Interface"]
        SSE["FastAPI SSE Endpoint (/telemetry/stream)"]
        UI["Next.js Recharts Live Monitoring UI"]
        Ingest --> SSE --> UI
    end
```

---

## 7. MQTT Topic Hierarchy Architecture

```mermaid
flowchart TD
    Root["healconnect (Root Namespace)"]
    
    Hospital["{hospital_id} (Hospital Node Identifier)"]
    Root --> Hospital

    Device["{device_id} (IoT Hardware Identifier)"]
    Hospital --> Device

    VitalsTopic["vitals (Heart Rate, SpO2, Temperature JSON Payload)"]
    ECGTopic["ecg (Lead-II ECG Waveform Signal Array Payload)"]
    StatusTopic["status (Online / Offline LWT Device State)"]

    Device --> VitalsTopic
    Device --> ECGTopic
    Device --> StatusTopic
```

---

## 8. Real-Time Server-Sent Events (SSE) Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Client as Next.js Web Client
    participant SSE as FastAPI SSE (/telemetry/stream)
    participant Ingest as MQTT Ingestion Service
    participant Broker as Mosquitto Broker
    participant Edge as ESP8266 Device

    Client->>SSE: HTTP GET /telemetry/stream (Accept: text/event-stream)
    Note over Client,SSE: Persistent HTTP Connection Established
    Edge->>Broker: Publish JSON Vitals Payload (QoS 1)
    Broker->>Ingest: Deliver MQTT Message
    Ingest->>SSE: Dispatch Telemetry Event to Broadcast Queue
    SSE-->>Client: event: vitals\\ndata: {"patient_id": "P101", "hr": 84, "spo2": 98}\\n\\n
    Note over Client: Recharts UI Graph Rendered Automatically
```

---

## 9. Deployment Architecture

```mermaid
flowchart TD
    subgraph Docker_Host["Docker Host Architecture (docker-compose.yml)"]
        subgraph Net_Frontend["Frontend Network (Bridge)"]
            NextContainer["Frontend Container (Next.js 16 - Port 3000)"]
        end

        subgraph Net_Backend["Backend Network (Bridge)"]
            APIContainer["FastAPI Backend Container (Python 3.10 - Port 8000)"]
            MLService["ML Inference Engine (risk_model.joblib)"]
        end

        subgraph Net_IoT["IoT Broker Network (Bridge)"]
            MosquittoContainer["Mosquitto MQTT Container (Ports 1883 / 8883)"]
        end

        subgraph Storage_Volumes["Persistent Storage Volumes"]
            MosquittoVol["mosquitto_data Volume"]
            DBVol["healconnect_db Volume"]
        end
    end

    NextContainer -->|HTTP Proxy| APIContainer
    APIContainer --> MLService
    APIContainer --> DBVol
    MosquittoContainer --> MosquittoVol
```

---

## 10. Summary of Architectural Classifications

1. **Implemented & Verified:** FastAPI backend, Pytest suite (84/84 PASS), Next.js web client (45 pages), Mosquitto MQTT broker, `paho-mqtt` ingestion worker, `risk_model.joblib` (94.59% accuracy), and SHAP explainability.
2. **Hardware Unverified:** ESP8266 NodeMCU firmware compiled cleanly; physical microcontroller board hardware unattached during automated test passes.
3. **Simulated:** Single-lead ECG rhythm signals are software-simulated.
4. **Legacy / Deprecated:** Legacy WebSockets (`websocket-server/`) and Blynk cloud bindings retained as fallback infrastructure.
