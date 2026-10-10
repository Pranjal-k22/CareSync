# CHAPTER 1 — PROJECT DESCRIPTION AND OUTLINE

## 1.1 Project Introduction

### What HealConnect Is
**HealConnect** is an enterprise-grade, multi-hospital AI healthcare telemetry platform that unifies edge IoT vital sensor monitoring, dual-model machine learning risk inference, SHAP model explainability, privacy-preserving federated learning, and HIPAA-compliant database auditing. Designed for modern hospital networks and clinical environments, HealConnect bridges the gap between hardware biometrics and actionable artificial intelligence for clinical decision support.

### Healthcare Problem Being Addressed
Hospital Intensive Care Units (ICUs) and general inpatient wards frequently suffer from fragmented vital sign monitoring workflows. Traditional monitoring systems rely on periodic manual nursing checks (often spaced 4 to 8 hours apart) or isolated bedside monitors that fail to synthesize multi-parameter physiological trends over extended time horizons. Delayed recognition of subtle physiological deterioration—such as gradual hypoxemia, silent tachycardia, or rising pyrexia—frequently leads to preventable adverse clinical events, cardiac arrests, emergency ICU transfers, and increased hospital mortality. Furthermore, cross-hospital collaborative machine learning research is heavily restricted by health data privacy regulations (e.g., HIPAA and GDPR), preventing institutions from pooling raw patient vitals into centralized servers.

### Motivation Behind the Project
The primary motivation behind HealConnect is to build a continuous, real-time physiological telemetry and risk-forecasting engine that automatically analyzes stream data at the edge, flags early deterioration risks up to 12 hours before acute clinical collapse, explains the underlying biometric drivers to attending physicians, and allows multiple independent hospitals to train shared predictive models collaboratively without sacrificing patient privacy.

### Target Users & Target Healthcare Environment
HealConnect is engineered for multi-tenant hospital networks, tertiary care hospitals, intensive care units, step-down monitoring wards, isolation units, and remote telehealth clinics. Its target users encompass:
1. **Attending Physicians & ICU Consultants**: Require continuous telemetry visibility, predictive acute deterioration risk scores, SHAP feature attributions, and tele-consultation capabilities.
2. **Nurses & Clinical Caregivers**: Require instant alerts on vital sign breaches (e.g., $\text{SpO}_2 < 92\%$), automated bed status synchronization, and streamlined manual vital entry interfaces.
3. **Hospital & Clinical Administrators**: Require macro-level ICU bed allocation management, staff duty roster oversight, federated model training control, and HIPAA security audit trail inspection.
4. **Patients**: Require self-service visibility into their personal biometric trends, digital e-prescription access, lab report downloads, and secure video tele-health access.
5. **Bio-Medical & System Engineers**: Require secure MQTT device onboarding, broker access control management, and system health monitoring.

### Main Purpose of the System & Importance of Real-Time Monitoring
The central purpose of HealConnect is to convert continuous physiological sensor streams into real-time, explainable, and predictive clinical insights. Real-time monitoring is critical in acute healthcare because physiological degradation occurs dynamically; a drop in blood oxygen saturation combined with elevated respiratory rate can signal impending respiratory failure hours before overt clinical collapse. By ingesting sensor data continuously at 2-second intervals, evaluating abnormal thresholds, and running dual AI risk models, HealConnect empowers care teams to intervene proactively rather than reactively.

---

## 1.2 Problem Statement

Despite technological advancements in medical equipment, modern healthcare facilities face several systemic technical and operational barriers:

1. **Existing Healthcare Monitoring Problems**: Traditional bedside monitors act as isolated islands of data. They emit audible local alarms that contribute to "alarm fatigue" among nursing staff without transmitting structured, actionable metrics to central clinical dashboards or predictive AI engines.
2. **Patient Monitoring Challenges**: Manual vitals capture is labor-intensive, prone to human transcription errors, and inherently episodic. Transient physiological anomalies occurring between manual rounds remain undetected.
3. **Real-Time Data Limitations**: Legacy healthcare architectures struggle with high-frequency telemetry transport over standard web infrastructure. HTTP polling introduces unacceptable latency, while unauthenticated WebSocket connections expose internal networks to security vulnerabilities.
4. **Communication & Transport Limitations**: Early IoT healthcare prototypes rely on consumer-grade third-party clouds (such as Blynk or raw Firebase REST endpoints) that lack Quality of Service (QoS) delivery guarantees, Last Will and Testament (LWT) disconnect notifications, and multi-tenant isolation.
5. **Sensor Integration & Processing Problems**: Interfacing low-cost biomedical sensors (such as MAX30102 pulse oximeters, DHT22 ambient sensors, and DS18B20 body temperature probes) with microcontrollers requires non-blocking sampling algorithms to prevent thread starvation, I2C bus lockups, or dynamic memory (heap) fragmentation.
6. **Data Management & Privacy Problems**: Aggregating patient vitals into centralized cloud repositories for AI model training violates HIPAA cross-institutional data sharing laws and increases the risk of large-scale data breaches.
7. **Scalability Limitations**: Monolithic backend servers cannot scale telemetry ingestion independently of frontend UI rendering or heavy machine learning inference workloads.
8. **Reliability & Network Fault Limitations**: Microcontrollers deployed in hospital Wi-Fi networks encounter frequent intermittent connection drops. Standard firmware lacking exponential retry backoff can enter infinite boot loops or drop critical telemetry packets during network restoration.
9. **Security & Compliance Requirements**: Healthcare platforms must enforce strict Row Level Security (RLS), role-based access control (RBAC), password hashing standards (PBKDF2-SHA256), token expiration (JWT), and immutable security audit trails for all data access events.

---

## 1.3 Project Objectives

HealConnect was engineered to achieve specific primary, secondary, technical, and healthcare objectives:

### Primary Objectives
- **Build an Enterprise IoT Telemetry Pipeline**: Implement an MQTT-based edge-to-cloud ingestion pipeline using Eclipse Mosquitto broker (QoS 1) and FastAPI Server-Sent Events (SSE) to stream live vitals to web dashboards.
- **Develop a Dual-Model AI Risk Engine**: Train and deploy a 12-hour acute clinical deterioration prediction model (ROC-AUC $\ge 0.90$) and a multi-class influenza/fever screening model (ROC-AUC $\ge 0.95$).
- **Implement Privacy-Preserving Collaborative AI**: Build a Flower federated learning framework enabling multi-hospital model weight aggregation (`FedAvg`) without sharing raw patient records.

### Secondary Objectives
- **Provide Explainable AI (XAI)**: Integrate SHAP TreeExplainer to deliver patient-specific feature attribution scores for clinicians.
- **Deploy HIPAA Security Audit Trail**: Enforce immutable, insert-only PostgreSQL audit logging (`audit_logs`) for all system access, authentication, and inference events.
- **Support Multi-Portal Workflows**: Deliver role-tailored Next.js portals for System Administrators, Doctors, and Patients.

### Technical Objectives
- Enforce non-blocking firmware execution on ESP8266 NodeMCU microcontrollers using `millis()` scheduling and 1s–30s exponential backoff reconnect logic.
- Achieve 60-second sliding-window packet deduplication (`device_id`, `seq`) in the server-side ingestion service (`mqtt_ingestion_service.py`).
- Maintain 100% automated test coverage across core API routes, database operations, SHAP calculations, and federated routines (`84/84 tests passing`).
- Ensure full cross-platform execution by replacing machine-specific absolute file paths with dynamic relative path calculations (`Path(__file__).resolve()`).

### Healthcare Objectives
- Reduce clinician alarm fatigue by substituting continuous raw alarms with intelligent risk score stratification (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- Enable proactive early clinical intervention for hypoxemic and febrile ward patients.
- Facilitate remote tele-consultations and digital prescription workflows.

---

## 1.4 Project Scope

To maintain rigorous engineering standards, HealConnect explicitly defines its operational boundaries:

### In-Scope (Implemented & Verified Capabilities)
- **Edge Telemetry Processing**: Real-time acquisition and ingestion of Heart Rate, $\text{SpO}_2$, Body Temperature, Room Temperature, and Humidity via MQTT (`healconnect/+/+/vitals`).
- **Real-Time Telemetry Streaming**: FastAPI SSE stream (`/telemetry/stream`) consuming MQTT vitals and broadcasting to Next.js reactive dashboards via `EventSource`.
- **12-Hour Acute Deterioration Model**: `RandomForestClassifier` trained on 167,146 clinical records (`cleaned_hospital_data.csv`), achieving ROC-AUC `0.9120` and Accuracy `94.59%`.
- **Multi-Class Disease Screening Model**: `GradientBoostingClassifier` trained on 15,000 febrile records (`disease_prediction_dataset.csv`), achieving ROC-AUC `0.9970` and Accuracy `96.58%`.
- **SHAP TreeExplainer Engine**: Real-time calculation of local Shapley attributions explaining risk factor impact (`increases_risk` / `reduces_risk`).
- **Flower Federated Learning**: Subclassed `flwr.client.NumPyClient` across 3 hospital nodes (334,291 total training records) using weighted `FedAvg` parameter aggregation.
- **Database & RLS Security**: Supabase PostgreSQL tables (`users`, `patients`, `vitals`, `prediction_history`, `alerts`, `audit_logs`) protected by RLS and PBKDF2-SHA256 password hashing.
- **Multi-Portal UI**: Next.js 16 frontend featuring Admin Bed Control, Doctor Telemetry Roster, and Patient E-Prescription/OCR reader portals.

### Out-of-Scope (Explicitly Excluded Capabilities)
- Direct EHR billing, health insurance claims processing, or financial transaction processing.
- Write-back synchronization to commercial EHR systems (Epic/Cerner) over proprietary protocols.
- Actuation of physical medical devices (such as automated drug infusion pumps or mechanical ventilator controls).

### Hardware-Dependent & Simulated Functionality
- **Simulated ECG Waveform**: Marked as **SIMULATED** in the UI (`SIMULATED ECG WAVEFORM`). The 500Hz Lead-II waveform is generated programmatically for real-time visualization.
- **Physical ESP8266 Hardware Testing**: Marked as **PHYSICAL HARDWARE: NOT VERIFIED**. ESP8266 MQTT firmware is fully written and statically audited (`HealthConnect_Kit_ESP8266_Code/`), and backend ingestion is 100% software-verified using synthetic MQTT publisher test suites. Physical bench testing with physical sensors remains deferred pending physical hardware arrival.

### Future Scope (Planned Enhancements)
- HL7 FHIR R4 JSON bundle serialization for telemetry exports.
- Differential privacy noise injection (Laplace/Gaussian) during federated weight exchange.
- Native mobile client applications (React Native / iOS & Android).

---

## 1.5 Target Users / Stakeholders

| Stakeholder Category | System Role Key | Supported Capabilities & Access Level | Evidence Source File |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | Full system governance, user onboarding, ICU bed allocation, security audit log inspection, federated learning orchestration. | `backend/main.py#L371-L375` |
| **Attending Physician / Doctor** | `doctor` | Live telemetry station monitoring, patient roster access, AI risk prediction execution, SHAP attribution analysis, tele-consultation. | `backend/main.py#L376-L379` |
| **Nurse / Clinical Caregiver** | `staff` | Ward bed status updates, manual vital signs entry, threshold alert acknowledgment. | `backend/main.py#L376-L379` |
| **Patient** | `patient` | Self-service biometric stream viewing, digital e-prescription reader, PDF lab report downloads, video tele-health visits. | `pages/patient/dashboard.js` |
| **Bio-Medical / IoT Operator** | `admin` / `staff` | Device provision tracking, MQTT topic ACL configuration, firmware status inspection. | `docs/iotconnect.md#L84-L92` |

---

## 1.6 Major Features

| Feature Name | Description | Target User | Implementation Status | Primary Source File |
| :--- | :--- | :--- | :--- | :--- |
| **MQTT Telemetry Ingestion** | Ingests MQTT vitals (QoS 1) over Mosquitto broker, validates JSON schemas, deduplicates sequence numbers, and persists vitals. | System / IoT | **Implemented & Verified** | `backend/app/services/mqtt_ingestion_service.py` |
| **FastAPI SSE Stream** | Delivers live real-time vitals to browser clients via `/telemetry/stream` using Server-Sent Events (`EventSource`). | Doctor / Patient | **Implemented & Verified** | `backend/main.py#L1004-L1079` |
| **12h Deterioration Prediction** | Evaluates 12-hour acute clinical deterioration probability (0-100%) using Random Forest ensemble (ROC-AUC `0.9120`). | Doctor | **Implemented & Verified** | `backend/app/predict.py` |
| **Flu & Disease Screening** | Screens for Flu/Influenza, Febrile Conditions, and Normal Baselines using Gradient Boosting (ROC-AUC `0.9970`). | Doctor | **Implemented & Verified** | `backend/app/predict_disease.py` |
| **SHAP XAI Feature Attribution** | Calculates local Shapley attributions explaining which vitals increased or reduced patient risk level. | Doctor | **Implemented & Verified** | `backend/app/explain.py` |
| **Flower Federated Learning** | Trains global model across 3 hospital edge nodes (334k samples) via weighted `FedAvg` without sharing raw vitals. | Admin | **Implemented & Verified** | `backend/federated/federated_engine.py` |
| **HIPAA Security Audit Trail** | Logs immutable security audit events (`user_id`, `action`, `ip_address`, `timestamp`) into insert-only PostgreSQL table. | Admin | **Implemented & Verified** | `backend/supabase_schema.sql#L114-L117` |
| **Google Gemini OCR Reader** | Digitizes uploaded physical prescription image files using Google Gemini 2.5 Flash API. | Patient / Doctor | **Implemented & Verified** | `pages/prescriptions.jsx` |
| **Live ECG Telemetry Station** | High-frequency continuous visual ECG waveform renderer built with Arction LightningChart JS and ApexCharts. | Doctor / Patient | **Simulated / Deferred** | `components/LiveMonitor/ECGMonitor.js` |
| **ICU Ward Bed Allocation** | Synchronizes real-time 40-bed ICU and ward telemetry across Admin and Doctor portals. | Admin / Staff | **Implemented & Verified** | `backend/main.py#L840-L871` |

---

## 1.7 Project Workflow

The end-to-end telemetry, machine learning, and visualization workflow of HealConnect is verified across repository source files as follows:

```
[ Edge Hardware Layer ]
  ESP8266 NodeMCU Microcontroller
  ├── MAX30102 (SpO2 & Heart Rate)
  ├── DHT22 (Room Temp & Humidity)
  └── DS18B20 (Body Temperature)
            │
            ▼  (Wi-Fi / MQTT QoS 1 JSON Payloads / 2000ms Interval)
[ Message Broker Layer ]
  Eclipse Mosquitto MQTT Broker (TCP Port 1883 dev / 8883 TLS blueprint)
  ├── Topic: healconnect/{hospital_id}/{device_id}/vitals
  └── Topic: healconnect/{hospital_id}/{device_id}/status (Retained LWT)
            │
            ▼  (paho-mqtt v2.1.0 Client Subscription)
[ Ingestion & Gateway Layer ]
  MQTT Ingestion Service (backend/app/services/mqtt_ingestion_service.py)
  ├── 1. Schema & Numeric Range Bounds Validation
  ├── 2. 60s Sliding Window Deduplication Cache (device_id + seq)
  ├── 3. Telemetry Normalization & Threshold Alert Evaluation (SpO2 < 92%)
  └── 4. Supabase PostgreSQL Persistence (vitals & alerts tables)
            │
            ├─────────────────────────────────────────┐
            ▼                                         ▼
[ Machine Learning Engine ]            [ Telemetry Broadcaster ]
  FastAPI Prediction Services            FastAPI SSE Gateway (/telemetry/stream)
  ├── Deterioration Model (predict.py)         │  (Server-Sent Events / EventSource)
  ├── Disease Screening (predict_disease.py)   │
  └── SHAP XAI Engine (explain.py)            │
            │                                         │
            └────────────────────┬────────────────────┘
                                 ▼
[ Clinical User Interface ]
  Next.js 16 Clinical Portals (pages/monitoring.jsx & pages/ai-dashboard.jsx)
  ├── Real-Time Vital Cards & Offline/Online Status Badges
  ├── AI Risk Level Gauges & SHAP Feature Attribution Cards
  └── Live ECG Waveform Display (Simulated Stream)
```

---

## 1.8 Project Modules

The codebase is organized into eight primary functional modules:

1. **`backend/main.py` (FastAPI API Gateway)**: Serves as the central application entry point. Handles HTTP routing, JWT bearer authentication, security response headers, Structured JSON logging middleware, exception handling, and SSE stream dispatching.
2. **`backend/app/services/mqtt_ingestion_service.py` (MQTT Ingestion Engine)**: Implements the background MQTT client subscribing to `healconnect/#`. Enforces topic segment validation, tenant access control, numeric range filtering, 60-second sliding-window packet deduplication, database persistence, and threshold alert triggers.
3. **`backend/app/services/db_service.py` (Database Abstraction Layer)**: Interfaces with Supabase PostgreSQL (and local in-memory fallbacks). Manages CRUD operations for `users`, `patients`, `vitals`, `prediction_history`, `alerts`, and `audit_logs`.
4. **`backend/app/predict.py` & `predict_disease.py` (Dual AI Risk Models)**: Deserializes joblib binary model artifacts (`risk_model.joblib` and `flu_model_v1.joblib`), executes data preprocessing pipelines (`ColumnTransformer`), fills missing features with clinical baselines, and returns predicted probabilities and categorical risk grades.
5. **`backend/app/explain.py` (SHAP Explainability Engine)**: Wraps `shap.TreeExplainer` to compute local feature attributions for inbound patient vitals, producing structured JSON outputs detailing feature impact magnitude and direction.
6. **`backend/federated/` (Flower Federated Learning Framework)**: Contains `federated_engine.py` and edge client node implementations (`hospital_a_node.py`, `hospital_b_node.py`, `hospital_c_node.py`). Orchestrates multi-node `FedAvg` weight aggregation rounds and serializes versioned global models.
7. **`HealthConnect_Kit_ESP8266_Code/` (Edge Firmware)**: Modular C++ Arduino code for ESP8266 NodeMCU. Implements non-blocking `millis()` timers, PubSubClient MQTT publishing, MAX30102 100-sample FIFO reading, DS18B20 disconnect handling, and exponential backoff reconnection loops.
8. **`pages/` & `components/` (Next.js Frontend)**: Contains Next.js page views (`index.jsx`, `monitoring.jsx`, `ai-dashboard.jsx`, `prescriptions.jsx`, `admin/federated.jsx`) and reusable UI components (`AIInsightCard.jsx`, `WebSocketMonitor.js`, `ECGMonitor.js`).

---

## 1.9 Project Limitations

To adhere to strict academic honesty, all physical, operational, and algorithmic limitations of the repository are explicitly documented:

1. **Hardware Verification Limitation**: Physical ESP8266 microcontrollers and physical sensors were bench-unavailable during final testing. While firmware files are fully written and software ingestion pipelines are 100% verified, physical board hardware verification is explicitly marked: **PHYSICAL HARDWARE: NOT VERIFIED**.
2. **ECG Signal Simulation**: The high-frequency ECG waveform rendered on the clinical frontend is programmatically simulated (`SIMULATED ECG WAVEFORM`).
3. **Sensor Sampling & FIFO Constraints**: The MAX30102 optical sensor requires finger contact (`maxIR > 50000`). If no finger is placed on the sensor, heart rate and $\text{SpO}_2$ default to `0.0` while ambient room parameters continue streaming.
4. **Network & Connection Drop Recovery**: Temporary Wi-Fi disconnection causes a 1s to 30s exponential backoff retry pause on the ESP8266, during which sensor publishing is temporarily buffered or paused.
5. **Single-Worker SSE Scaling Limitation**: FastAPI Server-Sent Events subscriber set (`_telemetry_subscribers`) operates in-memory process-locally. Multi-worker production deployments (e.g., Gunicorn with 4 workers) require attaching a shared pub/sub broker (such as Redis Pub/Sub) to `_telemetry_broadcaster`.
6. **Machine Learning Model Constraints**: ML predictions represent statistical probability estimates based on training distributions (`cleaned_hospital_data.csv` and `disease_prediction_dataset.csv`). They serve strictly for clinical decision support and do not replace professional diagnosis by a licensed physician.
7. **Production TLS Runtime Blueprint**: Local development operates on plain MQTT TCP port 1883. Production port 8883 TLS certificate termination is documented as a blueprint configuration (`mosquitto/config/mosquitto.conf`).
8. **OCR API Key Dependency**: Automated prescription OCR extraction (`prescriptions.jsx`) depends on `GEMINI_API_KEY`. If unconfigured, the system falls back to manual prescription entry.
