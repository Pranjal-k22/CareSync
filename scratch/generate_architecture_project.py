import os
from pathlib import Path

def create_architecture_project_files():
    target_dir = Path(r"c:\Users\pc\Desktop\capstone\Heal_connectmain2.0\architecture-project")
    target_dir.mkdir(parents=True, exist_ok=True)
    print(f"Directory ensured: {target_dir}")

    files_content = {}

    # File 01
    files_content["01-overall-system-architecture.md"] = """# 01 — Overall System Architecture

> **Path:** `architecture-project/01-overall-system-architecture.md`  
> **Status:** Code-Grounded Reference Architecture  

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
        ESP -->|Pub: caresync/+/+/vitals| Mosquitto
    end

    subgraph Ingestion_Layer["3. Ingestion & Backend Core"]
        Ingest["MQTT Ingestion Worker (paho-mqtt)"]
        Mosquitto -->|Sub: caresync/+/+/vitals| Ingest
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

## Component Responsibilities & Connections

1. **IoT Edge Layer:** Reads physiological signals from MAX30102 and DHT22 via I2C and single-bus interfaces. Formats JSON telemetry payloads published over MQTT.
2. **MQTT Broker:** Eclipse Mosquitto handles publish/subscribe topic routing (`caresync/{hospital}/{device}/vitals`) with QoS 1 delivery guarantees.
3. **MQTT Ingestion Worker:** Python `paho-mqtt` background service subscribing to broker topics, storing raw vitals into PostgreSQL/SQLite database, and triggering ML inference.
4. **Machine Learning & SHAP:** Executes `risk_model.joblib` (Random Forest, 94.59% accuracy) and `explain.py` for feature attribution scores.
5. **FastAPI SSE Broadcaster:** Maintains persistent `/telemetry/stream` connections to stream JSON events without polling.
6. **Next.js Frontend Client:** Consumes SSE stream via `EventSource`, updating Recharts graphs in real-time.
"""

    # File 02
    files_content["02-frontend-architecture.md"] = """# 02 — Frontend Architecture

> **Path:** `architecture-project/02-frontend-architecture.md`  
> **Status:** Implemented & Compiled (Next.js 16.0.0 / React 19.0.0)  

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

## Component Breakdown
* **`pages/live-monitoring.jsx`:** Sub-second telemetry portal utilizing standard browser `EventSource` listening to `http://localhost:8000/telemetry/stream`.
* **`components/LiveMonitor/`:** Reusable React components rendering digital gauge readouts, vital status badges, and animated wave visualizers.
* **`components/Visualizations/`:** Recharts timeseries graphs (`^2.15.1`) displaying multi-parameter vitals history.
* **State Management:** Component-level React `useState` and `useEffect` hooks for dynamic UI reactivity.
"""

    # File 03
    files_content["03-backend-architecture.md"] = """# 03 — Backend Architecture

> **Path:** `architecture-project/03-backend-architecture.md`  
> **Status:** Implemented & Verified (FastAPI 0.115.8 / 27 Pytest PASS)  

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

## Request Lifecycle
`Client Request` $\rightarrow$ `FastAPI Router` $\rightarrow$ `OAuth2 JWT Middleware` $\rightarrow$ `Route Controller` $\rightarrow$ `Service Layer` $\rightarrow$ `SQLAlchemy ORM / ML Model` $\rightarrow$ `JSON / SSE Response`.
"""

    # File 04
    files_content["04-database-architecture.md"] = """# 04 — Database Architecture

> **Path:** `architecture-project/04-database-architecture.md`  
> **Status:** Implemented & Verified (SQLAlchemy ORM / SQLite / Supabase PostgreSQL)  

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

## Schema & Tables Description
* **`users`:** Clinician accounts with bcrypt salted password hashes and role-based permissions (`doctor`, `nurse`, `admin`).
* **`patients`:** Clinical demographic records connected to hospital org nodes.
* **`vitals`:** High-frequency time-series log for telemetry measurements.
* **`risk_scores`:** Persisted outputs from `risk_model.joblib` and SHAP JSON feature attribution vectors.
"""

    # File 05
    files_content["05-ml-architecture.md"] = """# 05 — Machine Learning Architecture

> **Path:** `architecture-project/05-ml-architecture.md`  
> **Status:** Implemented & Verified (RandomForest: 94.59% Acc, 0.9120 ROC-AUC / GradientBoosting: 96.58% Acc)  

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

## ML Feature Inventory (14 Features)
`age`, `gender`, `heart_rate`, `spo2`, `temperature`, `sys_bp`, `dia_bp`, `respiratory_rate`, `gcs`, `wbcc`, `creatinine`, `lactate`, `heart_disease_history`, `diabetes_history`.
"""

    # File 06
    files_content["06-iot-architecture.md"] = """# 06 — IoT Edge Architecture

> **Path:** `architecture-project/06-iot-architecture.md`  
> **Status:** Firmware Implemented / PHYSICAL HARDWARE: NOT VERIFIED  

```mermaid
flowchart LR
    subgraph Physical_Sensors["Physiological Sensors"]
        MAX["MAX30102 Pulse Oximeter (I2C SDA/SCL)"]
        DHT["DHT22 Temperature Sensor (Digital Pin D2)"]
        AD["Simulated ECG Waveform Stream [SIMULATED]"]
    end

    subgraph Edge_Microcontroller["ESP8266 NodeMCU v1.0 / ESP-12E"]
        Firmware["CareSync_Kit_ESP8266_Code.ino"]
        WiFi["ESP8266WiFi.h (802.11 b/g/n)"]
        MQTTClient["PubSubClient.h (MQTT Client)"]
        
        Firmware --> WiFi
        Firmware --> MQTTClient
    end

    subgraph Broker_Destination["Network Transport"]
        Broker["Mosquitto MQTT Broker (Port 1883)"]
    end

    MAX & DHT & AD --> Firmware
    MQTTClient -->|Publish: JSON Payload| Broker
```

## Sensor Hardware Inventory

| Sensor Name | Parameter | Hardware Interface | GPIO Pin | Status |
| :--- | :--- | :--- | :--- | :--- |
| **MAX30102** | Heart Rate & SpO2 | I2C (`Wire.h`) | SDA (D2), SCL (D1) | Firmware Implemented (`Hardware Unverified`) |
| **DHT22 / DS18B20** | Body Temperature | Digital Single-Bus | GPIO 4 (D2) | Firmware Implemented (`Hardware Unverified`) |
| **ECG Stream** | Single-Lead ECG | Telemetry API | N/A | **SIMULATED** |
"""

    # File 07
    files_content["07-mqtt-architecture.md"] = """# 07 — MQTT Architecture

> **Path:** `architecture-project/07-mqtt-architecture.md`  
> **Status:** Implemented & Configured (Mosquitto Broker v2.x)  

```mermaid
flowchart TD
    subgraph Publisher_Nodes["MQTT Publishers"]
        ESP["ESP8266 Edge Device"]
        SimECG["ECG Simulator Script [SIMULATED]"]
    end

    subgraph Mosquitto_Broker["Eclipse Mosquitto MQTT Broker (Port 1883 / 8883 TLS)"]
        Config["mosquitto/config/mosquitto.conf"]
        PasswordFile["mosquitto/config/password_file"]
        ACLFile["mosquitto/config/acl_file"]
    end

    subgraph Subscriber_Nodes["MQTT Subscribers"]
        Ingest["Python MQTT Ingestion Worker (paho-mqtt)"]
    end

    ESP -->|Pub: caresync/+/+/vitals (QoS 1)| Mosquitto_Broker
    SimECG -->|Pub: caresync/+/+/ecg (QoS 0)| Mosquitto_Broker
    ESP -.->|Pub: caresync/+/+/status (LWT QoS 1)| Mosquitto_Broker
    
    Mosquitto_Broker -->|Sub: caresync/+/+/vitals| Ingest
    Mosquitto_Broker -->|Sub: caresync/+/+/ecg| Ingest
```

## Topic Specifications

| MQTT Topic Pattern | Publisher | Subscriber | Purpose | QoS Level | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `caresync/{hospital}/{device}/vitals` | ESP8266 | Ingestion Service | Vital signs telemetry payload | QoS 1 | `CareSync_Kit_ESP8266_Code.ino` |
| `caresync/{hospital}/{device}/ecg` | Simulator | Ingestion Service | Streaming ECG samples | QoS 0 | `CareSync_Kit_ESP8266_Code.ino` |
| `caresync/{hospital}/{device}/status` | ESP8266 | Ingestion Service | Last Will & Testament status | QoS 1 | `CareSync_Kit_ESP8266_Code.ino` |
"""

    # File 08
    files_content["08-mqtt-topic-hierarchy.md"] = """# 08 — MQTT Topic Hierarchy Architecture

> **Path:** `architecture-project/08-mqtt-topic-hierarchy.md`  
> **Status:** Implemented Topic Taxonomy  

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

## Topic Wildcard Resolution Examples
* **Single-level Wildcard Subscription (`caresync/HOSP_01/+/vitals`):** Subscribes to vital sign updates from *all* devices assigned to `HOSP_01`.
* **Multi-level Wildcard Subscription (`caresync/#`):** Subscribes to all telemetry, ECG, and status topics across all hospital nodes.
"""

    # File 09
    files_content["09-mqtt-ingestion-architecture.md"] = """# 09 — MQTT Ingestion Architecture

> **Path:** `architecture-project/09-mqtt-ingestion-architecture.md`  
> **Status:** Implemented & Verified (Python `paho-mqtt` Client Worker)  

```mermaid
flowchart TD
    Mosquitto["Mosquitto MQTT Broker"] -->|on_message Callback| Worker["paho-mqtt Client Worker"]
    
    subgraph Ingestion_Pipeline["Ingestion Pipeline Execution"]
        Worker --> TopicParser["Topic Parser (extract hospital_id, device_id)"]
        TopicParser --> JSONParser["JSON Payload Validator"]
        JSONParser --> DBWriter["SQLAlchemy DB Service (Insert raw vitals)"]
        JSONParser --> MLPredictor["ML Service (risk_model.joblib execution)"]
        MLPredictor --> DBScoreWriter["SQLAlchemy DB Service (Insert risk_score)"]
        JSONParser --> SSEQueue["FastAPI SSE Broadcaster Queue"]
    end

    DBWriter --> Database[("PostgreSQL / SQLite Database")]
    DBScoreWriter --> Database
    SSEQueue --> SSEBroadcaster["FastAPI SSE Endpoint (/telemetry/stream)"]
```

## Processing Flow Steps
1. **Message Reception:** `on_message` callback receives raw payload from topic `caresync/{hospital}/{device}/vitals`.
2. **Parsing & Validation:** Extracts device ID, verifies valid numeric ranges (`HR: 30-220`, `SpO2: 50-100%`).
3. **Storage & Analytics:** Saves raw telemetry, invokes `risk_model.joblib`, and pushes updated payload to SSE stream queue.
"""

    # File 10
    files_content["10-realtime-sse-architecture.md"] = """# 10 — Real-Time Server-Sent Events (SSE) Architecture

> **Path:** `architecture-project/10-realtime-sse-architecture.md`  
> **Status:** Implemented & Verified (FastAPI SSE `/telemetry/stream`)  

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

## Technical Justification for SSE over WebSockets
* **Unidirectional Requirement:** Client only requires receiving server-pushed telemetry updates.
* **Low Overhead:** Native HTTP transport bypasses WebSocket handshake framing complexity.
* **Auto-Reconnection:** Browser `EventSource` handles reconnection automatically upon network interruption.
"""

    # File 11
    files_content["11-authentication-architecture.md"] = """# 11 — Authentication Architecture

> **Path:** `architecture-project/11-authentication-architecture.md`  
> **Status:** Implemented & Verified (OAuth2 Password Bearer + Bcrypt + JWT)  

```mermaid
sequenceDiagram
    autonumber
    actor Clinician as Clinician / User
    participant Frontend as Next.js Frontend
    participant AuthAPI as FastAPI /auth/login
    participant DB as User Database

    Clinician->>Frontend: Submit Email & Password
    Frontend->>AuthAPI: POST /auth/login (form-urlencoded)
    AuthAPI->>DB: Query User by Email
    DB-->>AuthAPI: User Record (bcrypt password_hash)
    AuthAPI->>AuthAPI: Verify Password via passlib bcrypt
    AuthAPI->>AuthAPI: Generate HS256 Signed JWT Access Token
    AuthAPI-->>Frontend: HTTP 200 OK {"access_token": "ey...", "token_type": "bearer"}
    
    Note over Frontend,AuthAPI: Subsequent Protected API Requests
    Frontend->>AuthAPI: GET /patients/ (Header: Authorization: Bearer ey...)
    AuthAPI->>AuthAPI: Decode JWT & Validate Expiry
    AuthAPI-->>Frontend: HTTP 200 OK [Patient Records Array]
```
"""

    # File 12
    files_content["12-security-architecture.md"] = """# 12 — Security Architecture

> **Path:** `architecture-project/12-security-architecture.md`  
> **Status:** Implemented Security Controls  

```mermaid
flowchart TD
    subgraph Auth_Security["Application & API Security"]
        JWT["JWT Access Tokens (HS256 Signature)"]
        Bcrypt["Bcrypt Password Salt Hashing"]
        OAuth2["OAuth2 Bearer Token Middleware"]
        CORS["CORS Middleware Restrictions"]
    end

    subgraph MQTT_Security["Broker & Messaging Security"]
        MQTTPass["Mosquitto Password File Authentication"]
        MQTTACL["Mosquitto Access Control Lists (ACL)"]
        TLS["TLS Encryption (Port 8883)"]
    end

    subgraph Secrets_Security["Secrets Management"]
        EnvFile[".env.local Environment Variables"]
        Redacted["Credentials Redacted as [REDACTED] in Logs"]
    end

    Client["Client / Hardware Request"] --> OAuth2 & MQTTPass
```
"""

    # File 13
    files_content["13-data-flow-architecture.md"] = """# 13 — Complete System Data-Flow Architecture

> **Path:** `architecture-project/13-data-flow-architecture.md`  
> **Status:** Full End-to-End System Workflow  

```mermaid
flowchart TD
    Sensors["1. MAX30102 / DHT22 Sensors"] -->|Raw Analog/Digital Readings| ESP["2. ESP8266 Microcontroller"]
    ESP -->|3. JSON over MQTT Port 1883| Mosquitto["4. Mosquitto Broker"]
    Mosquitto -->|5. Topic: caresync/+/+/vitals| Ingest["6. Python Ingestion Service"]
    
    Ingest -->|7a. Write Raw Vitals| DB[("7. Database (SQLite / Supabase)")]
    Ingest -->|7b. Execute 14-Feature ML| ML["8. RandomForest ML Model"]
    ML -->|8a. Generate SHAP Explanation| SHAP["9. SHAP TreeExplainer"]
    SHAP -->|9a. Store Risk & SHAP| DB
    
    Ingest -->|10. Push Event| SSE["11. FastAPI SSE Endpoint (/telemetry/stream)"]
    SSE -->|12. HTTP EventSource Stream| NextJS["13. Next.js 16 Client UI"]
    NextJS -->|14. Render UI| Recharts["15. Real-Time Recharts Visual Graphs"]
```
"""

    # File 14
    files_content["14-patient-monitoring-flow.md"] = """# 14 — Patient Monitoring Workflow Architecture

> **Path:** `architecture-project/14-patient-monitoring-flow.md`  
> **Status:** Implemented Clinical Workflow  

```mermaid
flowchart TD
    Patient["Bedside Patient (Room / Ward)"] --> Device["ESP8266 Telemetry Kit"]
    Device --> Telemetry["Real-Time Vitals Stream"]
    Telemetry --> ML_Assessment["ML Deterioration Risk Scoring"]
    
    ML_Assessment -->|Risk < 30%| LowRisk["LOW RISK: Normal Green Status"]
    ML_Assessment -->|30% <= Risk < 70%| ModRisk["MODERATE RISK: Yellow Caution Status"]
    ML_Assessment -->|Risk >= 70%| HighRisk["HIGH RISK: Red Alert Status & Urgent Nurse Notification"]

    LowRisk & ModRisk & HighRisk --> Dashboard["Next.js Patient Summary Grid"]
    HighRisk --> AlertLog["Alert Database Log"]
```
"""

    # File 15
    files_content["15-ecg-data-flow.md"] = """# 15 — ECG Data-Flow Architecture

> **Path:** `architecture-project/15-ecg-data-flow.md`  
> **Status:** SIMULATED ECG Workflow  

```mermaid
flowchart LR
    ECG_Source["ECG Waveform Generator [SIMULATED]"] -->|Waveform Samples| ESP["Telemetry Simulator Script"]
    ESP -->|Pub: caresync/+/+/ecg (QoS 0)| Mosquitto["Mosquitto MQTT Broker"]
    Mosquitto -->|Sub: caresync/+/+/ecg| Ingest["MQTT Ingestion Worker"]
    Ingest -->|Dispatch Event| SSE["FastAPI SSE Endpoint (/telemetry/stream)"]
    SSE -->|EventSource| NextJS["Next.js Live Monitoring Page"]
    NextJS -->|Render Waveform| Canvas["Live ECG Waveform Visualizer Component"]
```
"""

    # File 16
    files_content["16-vitals-data-flow.md"] = """# 16 — Vital-Signs Data-Flow Architecture

> **Path:** `architecture-project/16-vitals-data-flow.md`  
> **Status:** Implemented Telemetry Pipeline  

```mermaid
flowchart TD
    subgraph Edge_Sensors["Edge Telemetry Sensors"]
        MAX_HR["MAX30102 Pulse Oximeter (Heart Rate: bpm)"]
        MAX_SpO2["MAX30102 Pulse Oximeter (SpO2: %)"]
        DHT_Temp["DHT22 Temperature Sensor (Body Temp: °C)"]
    end

    Edge_Sensors --> ESP["ESP8266 JSON Payload Constructor"]
    ESP -->|MQTT Pub| Mosquitto["Mosquitto MQTT Broker"]
    Mosquitto -->|MQTT Sub| Ingestion["Python MQTT Ingestion Engine"]
    Ingestion --> DB[("Database Vitals Table")]
    Ingestion --> SSE["FastAPI SSE Stream (/telemetry/stream)"]
    SSE --> UI["Next.js Vitals Gauge & Recharts Visualizer"]
```
"""

    # File 17
    files_content["17-deployment-architecture.md"] = """# 17 — Deployment Architecture

> **Path:** `architecture-project/17-deployment-architecture.md`  
> **Status:** Implemented & Verified Containerized Environment  

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
            DBVol["caresync_db Volume"]
        end
    end

    NextContainer -->|HTTP Proxy| APIContainer
    APIContainer --> MLService
    APIContainer --> DBVol
    MosquittoContainer --> MosquittoVol
```
"""

    # File 18
    files_content["18-project-module-map.md"] = """# 18 — Complete Project Module Map

> **Path:** `architecture-project/18-project-module-map.md`  
> **Status:** Verified Source File Mapping  

```mermaid
mindmap
  root((HealConnect Project))
    Frontend Layer
      pages/index.js
      pages/dashboard.jsx
      pages/live-monitoring.jsx
      components/LiveMonitor/
      components/Visualizations/
    Backend Core
      backend/app/main.py
      backend/app/api/
      backend/app/core/
      backend/app/services/
    Machine Learning
      ml/train.py
      ml/evaluate.py
      ml/datasets/
      backend/models/risk_model.joblib
    IoT Edge Firmware
      CareSync_Kit_ESP8266_Code.ino
    Messaging Broker
      mosquitto/config/mosquitto.conf
    Experimental Sandbox
      exp_project/ecg_arrhythmia_prototype.py
      exp_project/fhir_r4_serializer.py
      exp_project/federated_differential_privacy.py
```
"""

    # File 19
    files_content["19-legacy-architecture.md"] = """# 19 — Legacy Architecture & Deprecated Components

> **Path:** `architecture-project/19-legacy-architecture.md`  
> **Status:** LEGACY / Fallback Components Classified  

```mermaid
flowchart LR
    subgraph Legacy_v1["Legacy v1.0 Architecture (DEPRECATED)"]
        WebSocket_Server["websocket-server/ (Custom Node.js WS)"]
        Blynk["Blynk Cloud Integration [#define LEGACY_BLYNK_ENABLED]"]
        Firebase["Firebase Realtime Database (Deprecated)"]
    end

    subgraph Migration["Migration Transition"]
        Migrate["Migrated to MQTT + FastAPI SSE in v2.0"]
    end

    subgraph Current_v2["Current v2.0 Architecture"]
        Mosquitto["Eclipse Mosquitto Broker"]
        SSE["FastAPI Server-Sent Events"]
    end

    Legacy_v1 --> Migrate --> Current_v2
```
"""

    # File 20
    files_content["20-architecture-evolution.md"] = """# 20 — Architecture Evolution Analysis

> **Path:** `architecture-project/20-architecture-evolution.md`  
> **Status:** Historical Migration Justification  

```mermaid
flowchart TD
    subgraph V1_Problems["v1.0 Architectural Bottlenecks"]
        WS_Framing["WebSocket Framing Overhead on Microcontroller"]
        No_QoS["No Built-in Delivery Guarantees (QoS)"]
        Node_Single["Node.js Single-Threaded Processing Bottleneck"]
    end

    subgraph V2_Solutions["v2.0 Architectural Enhancements"]
        MQTT_2Byte["MQTT 2-Byte Fixed Header Protocol"]
        QoS1_Guarantee["QoS 1 At-Least-Once Delivery Guarantee"]
        FastAPI_SSE["FastAPI Asynchronous SSE Telemetry Streaming"]
    end

    V1_Problems -->|Migration & Refactoring| V2_Solutions
```

## Protocol Trade-off Summary

| Protocol | Header Size | Overhead on ESP8266 | QoS Guarantee | Client Subscriptions |
| :--- | :--- | :--- | :--- | :--- |
| **WebSockets (v1.0)** | 2 – 14 bytes + Frame Mask | High Memory Footprint | None (Custom Retry Required) | Bi-directional |
| **MQTT (v2.0)** | 2 bytes | Minimal Memory Footprint | **QoS 1 Native Support** | Pub/Sub via Broker |
| **HTTP SSE (v2.0)** | Standard HTTP | Zero Client Framing | Auto Reconnect | Unidirectional Server Push |
"""

    # File 21
    files_content["21-exp-project-architecture.md"] = """# 21 — Experimental Laboratory (`exp_project`) Architecture

> **Path:** `architecture-project/21-exp-project-architecture.md`  
> **Status:** Experimental Research Sandbox Prototypes  

```mermaid
flowchart TD
    subgraph Exp_Lab["exp_project/ Isolated Research Sandbox"]
        CNN_Proto["ecg_arrhythmia_prototype.py (1D-CNN / Isolation Forest)"]
        FHIR_Proto["fhir_r4_serializer.py (HL7 FHIR R4 JSON Exporter)"]
        DP_Proto["federated_differential_privacy.py (Laplace NoisePerturbation)"]
    end

    subgraph Main_System["HealConnect Core System"]
        BackendAPI["FastAPI Core Backend"]
        FL_System["Flower Federated Learning Engine"]
    end

    CNN_Proto -.->|Future Integration| BackendAPI
    FHIR_Proto -.->|Future Integration| BackendAPI
    DP_Proto -.->|Integration| FL_System
```

## Prototype Descriptions
1. **`ecg_arrhythmia_prototype.py`:** Unsupervised anomaly detection on Lead-II waveforms via Isolation Forest.
2. **`fhir_r4_serializer.py`:** Converts internal schemas to standard HL7 FHIR R4 `Patient` and `Observation` JSON resources.
3. **`federated_differential_privacy.py`:** Implements Laplace noise parameter perturbation for $(\epsilon, \delta)$-differential privacy.
"""

    for filename, content in files_content.items():
        file_path = target_dir / filename
        file_path.write_text(content, encoding="utf-8")
        print(f"Created file: {file_path}")

if __name__ == "__main__":
    create_architecture_project_files()
