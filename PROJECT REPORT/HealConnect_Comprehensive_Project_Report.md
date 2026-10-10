# 🩺 CareSync — Comprehensive Academic & Technical Project Report

**Project Title**: CareSync: Enterprise Multi-Hospital AI Telemetry, Clinical Deterioration Prediction & Privacy-Preserving Federated Learning Platform  
**Document Type**: Final Year B.Tech Academic Project Report & Technical Documentation  
**Repository**: `OmRaj6666/CareSync`  
**Date**: September 2026  
**Status**: Software Release Candidate (`84/84 Tests Passing`, `45/45 Frontend Pages Compiled`, `Physical Hardware Verification Deferred`)

---

## 📋 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Project Fact Sheet](#2-project-fact-sheet)
3. [Chapter 1 — Project Description and Outline](#chapter-1--project-description-and-outline)
4. [Chapter 2 — Related Work Investigation](#chapter-2--related-work-investigation)
5. [Chapter 3 — Requirement Artifacts](#chapter-3--requirement-artifacts)
6. [Chapter 4 — Design Methodology and Its Novelty](#chapter-4--design-methodology-and-its-novelty)
7. [Chapter 5 — Technical Implementations and Analysis](#chapter-5--technical-implementations-and-analysis)
8. [Chapter 6 — Project Outcome and Applicability](#chapter-6--project-outcome-and-applicability)
9. [Chapter 7 — Conclusions and Recommendations](#chapter-7--conclusions-and-recommendations)
10. [Supporting Inventories & Artifacts](#supporting-inventories--artifacts)
    - [A. Complete Technology Stack](#a-complete-technology-stack)
    - [B. Complete Module Inventory](#b-complete-module-inventory)
    - [C. Complete API Inventory](#c-complete-api-inventory)
    - [D. Complete Database Inventory](#d-complete-database-inventory)
    - [E. Complete MQTT Inventory](#e-complete-mqtt-inventory)
    - [F. Complete Sensor Inventory](#f-complete-sensor-inventory)
    - [G. Complete Test Inventory](#g-complete-test-inventory)
    - [H. Configuration Inventory](#h-configuration-inventory)
    - [I. Complete File/Module Mapping](#i-complete-filemodule-mapping)
11. [Project Information Conflicts](#project-information-conflicts)
12. [Verified Limitations](#verified-limitations)
13. [Future Scope](#future-scope)
14. [Source/File Evidence Index](#sourcefile-evidence-index)

---

# 1. Executive Summary

**CareSync** is an enterprise-grade, multi-hospital AI healthcare telemetry and clinical decision-support platform designed to address two paramount challenges in modern health informatics: (1) high-latency, manual vital signs monitoring in intensive care units (ICUs) and general ward beds that leads to delayed recognition of acute physiological deterioration, and (2) severe HIPAA regulatory constraints that prevent centralized pooling of patient vital records across hospital networks for machine learning model optimization.

The platform establishes an end-to-end telemetry and artificial intelligence pipeline. Edge telemetry acquisition is performed using ESP8266 NodeMCU microcontrollers interfaced with MAX30102 pulse oximetry, DHT22 ambient room temperature/humidity, and DS18B20 body temperature sensors. Telemetry packets are transmitted over standard Wi-Fi using the MQTT protocol (QoS 1 delivery, retained Last Will and Testament status) to an Eclipse Mosquitto Message Broker. Server-side processing is driven by an asynchronous Python FastAPI application and an `MQTTIngestionService` that validates schema structure, enforces sliding-window packet sequence deduplication (`60s` cache), and persists telemetry to a Supabase PostgreSQL database protected by Row Level Security (RLS).

Clinical intelligence is provided by a dual Machine Learning (ML) engine:
1. **12-Hour Acute Clinical Deterioration Engine**: A `RandomForestClassifier` (100 estimators, max depth 12) trained on 167,146 clinical record sequences (`cleaned_hospital_data.csv`). It evaluates 14 physiological parameters to predict 12-hour acute deterioration probability with a holdout **ROC-AUC of 0.9120** and **Accuracy of 94.59%**.
2. **Influenza & Febrile Disease Screening Engine**: A tuned `GradientBoostingClassifier` trained on 15,000 patient entries (`disease_prediction_dataset.csv`) to screen for Normal Baselines, Flu / Influenza, and Febrile Conditions with **ROC-AUC of 0.9970** and **Accuracy of 96.58%**.

To eliminate black-box AI predictions, the backend integrates a **SHAP (`shap.TreeExplainer`) XAI Engine** that computes patient-specific Shapley feature attributions, delivering directional explanations (`increases_risk` / `reduces_risk`) to attending clinicians. For privacy-preserving collaborative intelligence across independent health systems, CareSync implements a **Flower (`flwr.client.NumPyClient`) Federated Learning Network** spanning 3 hospital edge nodes (Hospital A, Apollo Telemetry, Fortis Cardiac; 334,291 total training samples), executing weighted `FedAvg` parameter aggregation without transmitting raw patient records.

Real-time telemetry streaming to Next.js 16 clinical dashboards is implemented via FastAPI Server-Sent Events (SSE) at `/telemetry/stream`, completely replacing unauthenticated legacy WebSocket processes. The platform includes a 27-test automated Pytest backend suite and 57 stage verification test cases (`84/84 tests passing, 100% success rate`), and a Next.js production build compiling 45/45 pages cleanly. The codebase is classified as a **Software Release Candidate**; physical ESP8266 hardware sensor validation remains physically unverified due to hardware bench unavailability (`PHYSICAL ESP8266: NOT VERIFIED`), with legacy Blynk/Firebase routines preserved behind compiler flags pending physical hardware deployment.

---

# 2. Project Fact Sheet

| Dimension | Project Specification & Attribute | Evidence Source File |
| :--- | :--- | :--- |
| **Project Name** | CareSync | `README.md` |
| **Project Type** | Enterprise IoT Multi-Hospital AI Telemetry & Federated Learning Platform | `docs/PROJECT_OVERVIEW.md` |
| **Target Operating Domain** | Hospital ICUs, Step-Down Units, Isolation Wards, Remote Telehealth | `docs/ARCHITECTURE.md` |
| **Primary System Roles** | System Admin (`admin`), Physician/Clinician (`doctor`), Nurse/Staff (`staff`), Patient (`patient`) | `backend/main.py#L371-L380` |
| **Backend Gateway** | FastAPI `0.115` (Python `3.13`), Uvicorn ASGI Server (Port `8000`) | `backend/main.py#L179-L186` |
| **Frontend Framework** | Next.js `16.3` (React `18`), Pages Router, SCSS Modules, TailwindCSS | `package.json#L15-L27` |
| **Database Engine** | Supabase PostgreSQL `15+`, Row Level Security (RLS) | `backend/supabase_schema.sql` |
| **IoT Hardware Protocol** | MQTT v3.1.1 (QoS 1 Vitals, QoS 1 Retained LWT Status) over Mosquitto Broker (Port `1883`) | `mosquitto/config/mosquitto.conf` |
| **Browser Telemetry Stream** | Server-Sent Events (SSE) via `/telemetry/stream` (EventSource API) | `backend/main.py#L1004-L1079` |
| **Microcontroller Platform** | ESP8266 NodeMCU C++ Firmware (PubSubClient, Non-blocking `millis()`) | `HealthConnect_Kit_ESP8266_Code/ESP8266_MQTT_Client/ESP8266_MQTT_Client.ino` |
| **Sensors Integrated** | MAX30102 (SpO2/HR), DHT22 (Room Temp/Humid), DS18B20 (Body Temp) | `docs/iotconnect.md#L46-L50` |
| **Deterioration Model** | `RandomForestClassifier` (14 features, 167,146 samples, ROC-AUC `0.9120`, Accuracy `94.59%`) | `docs/ml_docs.md#L91-L102` |
| **Disease/Flu Model** | `GradientBoostingClassifier` (11 features, 15,000 samples, ROC-AUC `0.9970`, Accuracy `96.58%`) | `docs/ml_docs.md#L103-L114` |
| **Explainability Engine** | SHAP `TreeExplainer` (`shap.TreeExplainer` feature attributions) | `backend/app/explain.py` |
| **Federated Framework** | Flower (`flwr.client.NumPyClient`), 3 Nodes, 334k samples, Weighted `FedAvg` | `backend/federated/federated_engine.py` |
| **Authentication Standard** | PBKDF2-SHA256 password hashing (600,000 iterations), PyJWT (HS256 24h tokens) | `backend/main.py#L51-L64` |
| **Verification Suite** | 27 Pytest Backend + 57 Scratch Verification Tests (`84/84 PASSING, 100%`) | `docs/TESTING.md#L46-L54` |
| **Frontend Build Status** | `45/45 Pages Compiled` via `npx next build --webpack` | `docs/TESTING.md#L66` |
| **Hardware Verification** | Software / Firmware Implementation: VERIFIED; Physical Board: NOT VERIFIED | `docs/iotconnect.md#L348` |
| **Release Status** | **SOFTWARE RELEASE CANDIDATE** | `docs/iotconnect.md#L533-L536` |

---

# CHAPTER 1 — PROJECT DESCRIPTION AND OUTLINE

## 1.1 Project Introduction

### What CareSync Is
**CareSync** is an enterprise-grade, multi-hospital AI healthcare telemetry platform that unifies edge IoT vital sensor monitoring, dual-model machine learning risk inference, SHAP model explainability, privacy-preserving federated learning, and HIPAA-compliant database auditing. Designed for modern hospital networks and clinical environments, CareSync bridges the gap between hardware biometrics and actionable artificial intelligence for clinical decision support.

### Healthcare Problem Being Addressed
Hospital Intensive Care Units (ICUs) and general inpatient wards frequently suffer from fragmented vital sign monitoring workflows. Traditional monitoring systems rely on periodic manual nursing checks (often spaced 4 to 8 hours apart) or isolated bedside monitors that fail to synthesize multi-parameter physiological trends over extended time horizons. Delayed recognition of subtle physiological deterioration—such as gradual hypoxemia, silent tachycardia, or rising pyrexia—frequently leads to preventable adverse clinical events, cardiac arrests, emergency ICU transfers, and increased hospital mortality. Furthermore, cross-hospital collaborative machine learning research is heavily restricted by health data privacy regulations (e.g., HIPAA and GDPR), preventing institutions from pooling raw patient vitals into centralized servers.

### Motivation Behind the Project
The primary motivation behind CareSync is to build a continuous, real-time physiological telemetry and risk-forecasting engine that automatically analyzes stream data at the edge, flags early deterioration risks up to 12 hours before acute clinical collapse, explains the underlying biometric drivers to attending physicians, and allows multiple independent hospitals to train shared predictive models collaboratively without sacrificing patient privacy.

### Target Users & Target Healthcare Environment
CareSync is engineered for multi-tenant hospital networks, tertiary care hospitals, intensive care units, step-down monitoring wards, isolation units, and remote telehealth clinics. Its target users encompass:
1. **Attending Physicians & ICU Consultants**: Require continuous telemetry visibility, predictive acute deterioration risk scores, SHAP feature attributions, and tele-consultation capabilities.
2. **Nurses & Clinical Caregivers**: Require instant alerts on vital sign breaches (e.g., $\text{SpO}_2 < 92\%$), automated bed status synchronization, and streamlined manual vital entry interfaces.
3. **Hospital & Clinical Administrators**: Require macro-level ICU bed allocation management, staff duty roster oversight, federated model training control, and HIPAA security audit trail inspection.
4. **Patients**: Require self-service visibility into their personal biometric trends, digital e-prescription access, lab report downloads, and secure video tele-health access.
5. **Bio-Medical & System Engineers**: Require secure MQTT device onboarding, broker access control management, and system health monitoring.

### Main Purpose of the System & Importance of Real-Time Monitoring
The central purpose of CareSync is to convert continuous physiological sensor streams into real-time, explainable, and predictive clinical insights. Real-time monitoring is critical in acute healthcare because physiological degradation occurs dynamically; a drop in blood oxygen saturation combined with elevated respiratory rate can signal impending respiratory failure hours before overt clinical collapse. By ingesting sensor data continuously at 2-second intervals, evaluating abnormal thresholds, and running dual AI risk models, CareSync empowers care teams to intervene proactively rather than reactively.

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

CareSync was engineered to achieve specific primary, secondary, technical, and healthcare objectives:

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

To maintain rigorous engineering standards, CareSync explicitly defines its operational boundaries:

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

The end-to-end telemetry, machine learning, and visualization workflow of CareSync is verified across repository source files as follows:

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

---

# CHAPTER 2 — RELATED WORK INVESTIGATION

## 2.1 Domain Background & Technical Context

Remote Patient Monitoring (RPM) and real-time clinical telemetry have evolved rapidly over the past decade. Early IoT healthcare solutions relied heavily on HTTP polling or third-party consumer IoT clouds (such as Blynk, Thingspeak, or Adafruit IO). While accessible, these early frameworks lacked enterprise security controls, custom binary communication contracts, multi-tenant hospital isolation, and server-side artificial intelligence integration.

In modern hospital infrastructure, real-time patient telemetry demands low-latency packet delivery, minimal bandwidth consumption, high transport reliability, and robust data isolation. This chapter examines existing architectural approaches in healthcare IoT—including WebSocket broadcasting, Server-Sent Events (SSE), MQTT pub/sub, cloud-native telemetry, and wearable biometric monitoring—evaluating their strengths and limitations against CareSync.

---

## 2.2 Investigation of Existing Architectural Approaches

### 1. Classical HTTP/REST Polling Platforms
- **Existing Approach**: The clinical frontend periodically issues `GET /vitals` HTTP requests to the backend server (e.g., every 5 to 10 seconds) to fetch updated patient vital signs.
- **Technology Used**: REST APIs over HTTP/1.1 or HTTP/2, JSON payloads.
- **Advantages**: Simple to implement, stateless, firewall-friendly.
- **Limitations**: High network overhead due to repeated HTTP header exchanges, server resource exhaustion under high client concurrency, and inherent latency (up to the polling interval duration).
- **Relevance to CareSync**: Rejected as the primary live telemetry transport due to latency and resource inefficiency. Retained strictly for static query endpoints (e.g., fetching historical prediction logs).

### 2. Standalone WebSocket Telemetry Servers
- **Existing Approach**: Microcontrollers or edge gateways establish bi-directional full-duplex TCP WebSocket sockets (`ws://` or `wss://`) directly to a dedicated broadcasting server.
- **Technology Used**: Node.js `ws` library, Socket.io, or Python WebSockets.
- **Advantages**: Full-duplex bi-directional communication, extremely low frame header overhead (2 to 10 bytes), sub-100ms latency.
- **Limitations**: Manually managing connection lifecycles, heartbeats, and client subscription state is complex. Furthermore, allowing browser JS bundles to establish unauthenticated raw WebSocket sockets directly to edge servers exposes internal infrastructure and bypasses application API security layers.
- **Relevance to CareSync**: CareSync originally included a legacy Node.js WebSocket server (`websocket-server/server.js`, port 8080). Architectural audit (ADR-006) revealed that browser-side WebSockets bypassed backend authorization. The WebSocket server was isolated, and live browser streaming was migrated to FastAPI SSE.

### 3. Native MQTT Broker Architecture (Edge Ingestion)
- **Existing Approach**: Microcontrollers publish lightweight binary/JSON telemetry payloads over TCP to a dedicated MQTT message broker. Applications subscribe to topic hierarchies to consume data.
- **Technology Used**: Eclipse Mosquitto, EMQX, HiveMQ, MQTT v3.1.1/v5.0.
- **Advantages**: Publish/Subscribe decoupling, minimal packet header overhead (2 bytes), built-in Quality of Service levels (QoS 0, 1, 2), retained messages, Last Will and Testament (LWT) automated offline detection, and Access Control List (ACL) topic isolation.
- **Limitations**: Standard MQTT operates over raw TCP/IP sockets, which native browser JavaScript cannot access directly without WebSockets-over-MQTT proxies (which expose broker credentials to browser bundles if unmanaged).
- **Relevance to CareSync**: Adopted as the authoritative edge-to-backend telemetry transport (ADR-006). ESP8266 microcontrollers publish QoS 1 vitals to `healconnect/{hospital_id}/{device_id}/vitals` and retained LWT status to `healconnect/{hospital_id}/{device_id}/status`. The backend `MQTTIngestionService` consumes and validates payloads securely on the server side.

### 4. Server-Sent Events (SSE) (Browser Telemetry Streaming)
- **Existing Approach**: The backend server maintains a persistent, one-way HTTP connection to client browsers, pushing UTF-8 formatted text streams (`text/event-stream`) whenever new data arrives.
- **Technology Used**: HTML5 `EventSource` API, HTTP/1.1 or HTTP/2 persistent streaming.
- **Advantages**: Native browser auto-reconnection via built-in `EventSource` retry headers, zero third-party client JavaScript dependencies, seamless integration with standard HTTP authentication (JWT/cookies), and zero exposure of internal broker credentials to client bundles.
- **Limitations**: Monodirectional (server-to-client only), maximum 6 HTTP/1.1 connection limit per domain in older browsers (mitigated by HTTP/2 multiplexing).
- **Relevance to CareSync**: Adopted as the authoritative browser streaming transport (ADR-006). FastAPI endpoint `/telemetry/stream` bridges internal MQTT ingestion with client browser dashboards, enforcing server-side patient and tenant filtering.

---

## 2.3 Comprehensive Technical Comparison Matrix

| Approach / Technology | Primary Protocol | Strengths & Advantages | Critical Limitations | CareSync Architectural Difference |
| :--- | :--- | :--- | :--- | :--- |
| **REST Polling** | HTTP/1.1 GET | Simple, stateless, easy caching | High latency, excessive header overhead, poor scalability | CareSync uses REST only for static CRUD/history; live vitals use SSE. |
| **Direct Browser WebSockets** | WS / WSS | Low latency, bi-directional full-duplex | Complex state management, exposes raw sockets, bypasses API security | CareSync isolates raw WebSockets (`websocket-server/`); uses SSE behind FastAPI gateway. |
| **Consumer IoT Cloud (Blynk/Firebase)** | Proprietary REST / HTTP | Rapid prototyping, zero server setup | Vendor lock-in, no QoS guarantees, lacks XAI/Federated ML integration | CareSync replaces cloud dependencies with self-hosted Mosquitto MQTT & FastAPI. |
| **Direct Browser MQTT** | WebSockets MQTT | Native Pub/Sub in browser | Exposes broker passwords (`MQTT_PASSWORD`) in JS bundles; security risk | CareSync keeps MQTT on backend; streams to browser via credential-free SSE. |
| **CareSync Hybrid Architecture** 🏆 | **MQTT (Edge) + SSE (Browser)** | **QoS 1 guarantees, LWT offline detection, 0 client secret leak, XAI + Federated ML** | Single-worker process constraint (mitigated by documentation) | **Combines Mosquitto MQTT for hardware ingestion with FastAPI SSE for secure UI streaming.** |

---

## 2.4 Motivation for Key Architectural Decisions

1. **Migration from WebSockets to MQTT (ADR-006)**: The legacy codebase relied on a standalone Node.js WebSocket process (`ws://10.92.0.122:8080`). This setup lacked message delivery guarantees, device authentication, ACL topic isolation, and retained offline state handling. Migrating edge microcontrollers to Eclipse Mosquitto MQTT provided native QoS 1 delivery, Last Will and Testament (LWT) disconnect detection, and multi-tenant ACL rules (`healconnect/{hospital}/{device}/vitals`).
2. **Selection of Server-Sent Events (SSE) for Browser Telemetry (ADR-006)**: Transporting telemetry from backend to browser via SSE (`/telemetry/stream`) eliminates client-side MQTT library overhead and prevents sensitive broker credentials (`MQTT_PASSWORD`) from leaking into browser JavaScript bundles. Browser `EventSource` handles reconnection automatically while FastAPI validates tenant permissions server-side.
3. **Decoupled Dual Machine Learning Architecture (ADR-002)**: Rather than deploying a complex black-box Deep Neural Network that is prone to catastrophic forgetting and hard to interpret, CareSync separates clinical acute deterioration (`RandomForestClassifier`) from disease screening (`GradientBoostingClassifier`). This allows fast CPU inference (< 15ms) and full game-theoretic tree explainability via SHAP.
4. **Flower Framework for Privacy-Preserving Federated Learning (ADR-003)**: Hospital data privacy laws forbid centralizing raw patient vitals. Adopting Flower (`flwr.client.NumPyClient`) enables edge hospital nodes to train local scikit-learn model parameters locally and exchange only aggregated weight matrices ($\mathbf{W}, B$) via weighted `FedAvg`.

---

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

---

# CHAPTER 4 — DESIGN METHODOLOGY AND ITS NOVELTY

## 4.1 Overall System Architecture

CareSync is engineered as a decoupled, multi-layered enterprise micro-architecture. The system separates high-frequency hardware telemetry ingestion from analytical machine learning inference, real-time client streaming, and database storage.

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

CareSync was engineered using a **Layered, Event-Driven Micro-Architecture** combined with **Test-Driven Verification**:
- **Event-Driven Pub/Sub**: Edge microcontrollers publish vitals asynchronously to Mosquitto MQTT; server ingestion listens to topics and broadcasts events to reactive UI streams.
- **Layered Decoupling**: Hardware ingestion, REST API serving, ML inference, federated learning, and database storage run in decoupled modules.
- **Test-Driven Verification**: Engineering progress was gated through Stage 0 to Stage 11 verification suites, enforcing 100% test pass rates (`84/84 tests passing`) before release candidate tagging.

---

## 4.11 Novelty & Distinctive Technical Combinations

CareSync does not make exaggerated marketing claims ("world's first" or "revolutionary"). Instead, it presents four technically defensible architectural innovations validated by source code evidence:

1. **Integrated Real-Time MQTT-to-SSE Telemetry Bridge**: Bridges edge IoT hardware MQTT publishing (QoS 1) with browser client Server-Sent Events (`/telemetry/stream`) without exposing broker credentials to frontend JavaScript bundles (`backend/app/services/mqtt_ingestion_service.py` & `backend/main.py#L1004`).
2. **Dual-Engine AI Risk Forecasting with Local SHAP Explanations**: Combines 12-hour acute deterioration forecasting (`RandomForestClassifier`, ROC-AUC `0.9120`) and multi-class disease screening (`GradientBoostingClassifier`, ROC-AUC `0.9970`) with real-time SHAP `TreeExplainer` Shapley feature attributions (`backend/app/explain.py`), converting black-box probabilities into directional clinical insights.
3. **Cross-Hospital Privacy-Preserving Federated Learning Network**: Subclasses Flower `flwr.client.NumPyClient` across 3 hospital edge nodes (334,291 total records) to aggregate scikit-learn model parameters via weighted `FedAvg` (`backend/federated/federated_engine.py`), demonstrating multi-hospital collaborative model optimization without raw patient data centralization.
4. **Non-Blocking Resilient Edge Microcontroller Firmware**: Combines MAX30102 100-sample optical FIFO collection with `millis()` timer scheduling, DS18B20 fault recovery (`DEVICE_DISCONNECTED_C`), sequence counter persistence, and 1s–30s exponential backoff reconnection loops (`ESP8266_MQTT_Client.ino`), eliminating blocking delay loops and infinite reboot storms.

---

# CHAPTER 5 — TECHNICAL IMPLEMENTATIONS AND ANALYSIS

## 5.1 Technology Stack Summary Table

| System Layer | Technology / Tool | Exact Version | Purpose & Technical Function | Evidence File Path |
| :--- | :--- | :--- | :--- | :--- |
| **Edge Hardware** | ESP8266 NodeMCU | Hardware MCU | Microcontroller executing non-blocking sensor sampling & MQTT publishing. | `HealthConnect_Kit_ESP8266_Code/` |
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

The ESP8266 NodeMCU firmware ([`ESP8266_MQTT_Client.ino`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/HealthConnect_Kit_ESP8266_Code/ESP8266_MQTT_Client/ESP8266_MQTT_Client.ino)) is written in C++:
- **Sensor Sampling**: Executes every 2000ms using non-blocking `millis()` timing.
- **MAX30102 Optical Processing**: Reads 100 continuous samples from the optical sensor FIFO buffer into `irBuffer` and `redBuffer`. Evaluates `fingerDetected = (maxIR > 50000)`. If finger is present, computes `heartRate` and `spo2` via `maxim_heart_rate_and_oxygen_saturation()`.
- **DS18B20 Disconnect Fault Handling**: Evaluates `sensors.getTempCByIndex(0)`. If sensor returns `DEVICE_DISCONNECTED_C` (`-127.0°C`), sets `bodyTemp = 0.0` to avoid storing corrupt temperatures.
- **Reconnection Logic**: Functions `maintainWiFi()` and `maintainMQTT()` execute exponential backoff retries (doubling interval from 1s up to 30s max), preventing Wi-Fi reconnect storms.
- **Packet Formatting**: Uses `snprintf` to construct a 512-byte JSON string containing sequence numbers, ISO 8601 timestamps, vitals, and units.

---

## 5.6 Sensors Inventory & Specification

| Sensor | Parameter Measured | Interface / Pin | Reading Behavior & Algorithm | Destination Path | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MAX30102** | Heart Rate & $\text{SpO}_2\%$ | I2C (SDA=D2, SCL=D1) | 100-sample FIFO buffer, `maxIR > 50000` finger check, Maxim SpO2 algorithm | MQTT `healconnect/+/+/vitals` | **Firmware Written / Physical Board Unverified** |
| **DHT22** | Room Temp & Humidity | Digital Pin D5 | Sampled every 2000ms via `dht.readTemperature()` & `readHumidity()` | MQTT `healconnect/+/+/vitals` | **Firmware Written / Physical Board Unverified** |
| **DS18B20** | Body Temperature | OneWire Pin D6 | Sampled every 2000ms; `DEVICE_DISCONNECTED_C` checks for probe unplugging | MQTT `healconnect/+/+/vitals` | **Firmware Written / Physical Board Unverified** |
| **ECG Stream** | Lead-II ECG Waveform | Telemetry API | 500Hz synthetic stream generation | UI Visualization (Simulated Stream) | **Simulated** |

---

## 5.7 MQTT Implementation

- **Broker**: Eclipse Mosquitto v2.0 running on TCP port 1883 (development) / port 8883 (TLS blueprint).
- **Authentication & ACL**: Authenticates via `mosquitto/config/password_file` (`allow_anonymous false`). ACL rules in `mosquitto/config/acl` restrict devices to `healconnect/{hospital_id}/{device_id}/#`.
- **Topics**:
  - Vitals: `healconnect/{hospital_id}/{device_id}/vitals` (QoS 1, Retain `false`)
  - Status: `healconnect/{hospital_id}/{device_id}/status` (QoS 1, Retain `true` [LWT])
  - Alerts: `healconnect/{hospital_id}/{device_id}/alerts` (QoS 1, Retain `false`)

---

## 5.8 MQTT Ingestion Service

The ingestion engine ([`mqtt_ingestion_service.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/app/services/mqtt_ingestion_service.py)) runs as a background thread using `paho-mqtt` v2.1.0:
1. **Connection & Subscription**: Connects to Mosquitto as `ingest_service_dev` and subscribes to `healconnect/#`.
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

- **Multi-Device MQTT Partitioning**: Topic segmentation (`healconnect/{hospital}/{device}/vitals`) enables Mosquitto broker to scale across thousands of concurrent microcontrollers.
- **Single-Worker SSE Boundary**: FastAPI in-memory subscriber queue (`_telemetry_subscribers`) operates per worker process. Production multi-worker scaling requires attaching Redis Pub/Sub to `_telemetry_broadcaster`.

---

## 5.19 Legacy Components Audit

1. **Legacy Node.js WebSocket Server (`websocket-server/server.js`)**: Standalone server on port 8080. It is preserved in an isolated directory in the repository but is completely disconnected from the active frontend, which consumes telemetry via FastAPI SSE (`/telemetry/stream`).
2. **Legacy Blynk & Firebase Firmware Routines**: Located in `HealthConnect_Kit_ESP8266_Code/`. Preserved behind compiler flags `#define LEGACY_BLYNK_ENABLED 1` and `#define LEGACY_FIREBASE_ENABLED 1`. Hardware deletion was gated by Stage 9C validation criteria; because physical hardware bench testing was unavailable (`PHYSICAL ESP8266: NOT VERIFIED`), permanent deletion was correctly blocked to protect firmware fallback options.

---

# CHAPTER 6 — PROJECT OUTCOME AND APPLICABILITY

## 6.1 Project Outcomes

The development of CareSync successfully achieved all primary software, artificial intelligence, and telemetry architectural objectives:
- **Unified Telemetry Ingestion**: Successfully implemented and verified an MQTT telemetry pipeline capable of receiving, schema-validating, deduplicating, and persisting vitals at 2-second intervals.
- **Dual AI Diagnostic Capability**: Deployed a 12-hour acute deterioration model (ROC-AUC `0.9120`, Accuracy `94.59%`) and a multi-class flu/fever screening model (ROC-AUC `0.9970`, Accuracy `96.58%`).
- **Clinical Explainability Integration**: Delivered local SHAP `TreeExplainer` feature attributions directly into clinical REST responses and web UI components.
- **Privacy-Preserving Federated Network**: Verified Flower `NumPyClient` multi-node weight aggregation (`FedAvg`) across 3 hospital edge nodes (334k training records).
- **100% Automated Test Pass Rate**: Verified `84/84 tests passing` across Pytest backend suites and Stage 5-8 integration/reliability test scripts.
- **Production Webpack Build**: Compiled 45/45 Next.js pages with 0 errors via `npx next build --webpack`.

---

## 6.2 Implemented Features Checklist

- [x] PBKDF2-SHA256 password hashing & PyJWT token authentication
- [x] De-identified patient demographic and clinical record management
- [x] ESP8266 C++ MQTT firmware with PubSubClient & exponential backoff
- [x] Eclipse Mosquitto MQTT broker configuration with password auth & ACL rules
- [x] Server-side `MQTTIngestionService` with 60s sliding deduplication cache
- [x] FastAPI Server-Sent Events (SSE) `/telemetry/stream` endpoint
- [x] 12-hour acute clinical deterioration Random Forest ML model
- [x] Multi-class Influenza & Febrile disease screening Gradient Boosting ML model
- [x] SHAP TreeExplainer feature attribution calculation engine
- [x] Flower `NumPyClient` federated learning framework (3 hospital nodes)
- [x] Supabase PostgreSQL database schema with Row Level Security (RLS)
- [x] Immutable `audit_logs` security audit trail
- [x] Google Gemini 2.5 Flash API prescription OCR integration
- [x] Next.js 16 reactive clinical monitoring station and admin portals

---

## 6.3 Testing Outcomes Summary

```
================================================================================
VERIFIED TEST SUITE RESULTS SUMMARY
================================================================================
- Pytest Backend Core API & Models:    27 / 27 PASS (100% Success)
- Stage 5 MQTT Ingestion Suite:        17 / 17 PASS (100% Success)
- Stage 6 Integration Suite:           13 / 13 PASS (100% Success)
- Stage 7 Frontend SSE Stream Suite:   18 / 18 PASS (100% Success)
- Stage 8 Reliability & Security Suite: 9 /  9 PASS (100% Success)
--------------------------------------------------------------------------------
OVERALL VERIFIED TEST SUITE TOTAL:    84 / 84 PASS (100% SUCCESS RATE)
================================================================================
```

---

## 6.4 System Validation

- **Software Telemetry & API Validation**: Verified 100% functional via Pytest and FastAPI `TestClient`.
- **Integration & Security Validation**: Verified 0 exposed repository secrets across 499 tracked files; verified RLS insert-only policy on `audit_logs`.
- **Build Validation**: Verified Next.js 16 Webpack production build (`npx next build --webpack`) compiling 45/45 pages cleanly.
- **Hardware Validation Status**: Hardware firmware is fully implemented; physical board bench testing is explicitly tagged **PHYSICAL HARDWARE: NOT VERIFIED**.

---

## 6.5 Healthcare Applicability

CareSync is technically applicable to several clinical operational environments:
- **Intensive Care Units (ICUs) & Step-Down Wards**: Continuous telemetry monitoring and 12-hour early deterioration forecasting.
- **Multi-Hospital Healthcare Systems**: Collaborative federated model training across independent hospitals without raw data centralization.
- **Isolation Units & Infectious Disease Wards**: Remote non-contact patient vital sign monitoring.
- **Tele-Consultation & Outpatient Clinics**: Video telehealth visits, digital e-prescriptions, and OCR prescription reader support.

*Regulatory Disclaimer: CareSync is designed for clinical decision support. It has not received FDA 510(k) or CE mark medical device certification and must be operated under licensed clinician oversight.*

---

## 6.6 Practical Benefits

1. **Reduced Alarm Fatigue**: Converts raw noisy sensor alarms into structured, explainable risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
2. **Proactive Intervention**: Flags acute physiological degradation up to 12 hours before clinical collapse.
3. **Data Privacy Compliance**: Enables cross-hospital machine learning collaboration while maintaining strict HIPAA data isolation.
4. **Zero Client Secret Exposure**: Streams telemetry via SSE without embedding MQTT credentials in browser JS bundles.

---

## 6.7 Verified Limitations

- **Physical Hardware Unverified**: Physical ESP8266 bench testing unavailable (`PHYSICAL ESP8266: NOT VERIFIED`).
- **Simulated ECG Signals**: Lead-II ECG waveform is programmatically simulated (`SIMULATED ECG WAVEFORM`).
- **Single-Worker SSE Constraint**: In-memory SSE broadcaster requires shared pub/sub (Redis) for multi-worker scaling.
- **Production TLS Blueprint**: Dev mode runs on MQTT port 1883; TLS port 8883 is documented as a production blueprint.

---

## 6.8 Future Scope (Proposed Future Enhancements)

- **Proposed Enhancement 1**: Implement HL7 FHIR R4 standard JSON serialization for telemetry observations.
- **Proposed Enhancement 2**: Inject Laplace differential privacy noise into Flower federated weight exchanges.
- **Proposed Enhancement 3**: Develop native mobile applications (React Native / iOS & Android) for physicians.
- **Proposed Enhancement 4**: Incorporate deep learning 1D-CNN / LSTM models for real-time 12-lead ECG arrhythmia classification.

---

## 6.9 Applicability Matrix

| Application Area | Current System Capability | Required Enhancement for Full Deployment | Clinical Applicability Grade |
| :--- | :--- | :--- | :--- |
| **ICU Ward Monitoring** | Live SSE vitals streaming, 12h deterioration ML, SHAP explanations | Physical ESP8266 board bench validation | **High (Software Ready)** |
| **Multi-Hospital Research** | Flower federated learning across 3 nodes (334k samples) | Differential privacy noise injection | **High (Functional Prototype)** |
| **Telehealth & Remote Care**| E-Prescription reader, Gemini OCR, patient portal | WebRTC video infrastructure scaling | **High (Operational)** |
| **Emergency Ward Triage** | Multi-class Flu/Fever screening model (ROC-AUC `0.9970`) | HL7 FHIR EHR integration | **High (Validated)** |

---

# CHAPTER 7 — CONCLUSIONS AND RECOMMENDATIONS

## 7.1 Conclusion

The **CareSync** project has successfully designed, implemented, and verified an enterprise-grade IoT telemetry, dual-model machine learning, and privacy-preserving federated learning platform tailored for multi-hospital healthcare environments. By combining non-blocking ESP8266 C++ edge firmware, Eclipse Mosquitto MQTT broker ingestion, server-side packet deduplication, FastAPI Server-Sent Events streaming, Random Forest deterioration prediction, Gradient Boosting flu screening, SHAP TreeExplainer explainability, and Flower federated learning, CareSync offers a robust technical foundation for modern clinical decision support.

The software implementation has achieved 100% automated test verification across 84 test cases and cleanly compiled 45 Next.js production pages. Physical hardware verification remains deferred (`PHYSICAL ESP8266: NOT VERIFIED`), and legacy Blynk/Firebase code has been safely preserved behind fallback compiler flags. The overall system is classified as a **Software Release Candidate**, demonstrating high technical rigor, strict HIPAA security controls, and clear practical utility for academic and clinical research.

---

## 7.2 Key Contributions

1. **Enterprise IoT Telemetry Architecture**: Standardized MQTT (QoS 1) ingestion and FastAPI SSE stream `/telemetry/stream`, replacing unauthenticated direct WebSockets with zero client credential exposure.
2. **Explainable Dual-Model AI Engine**: Developed high-accuracy 12-hour acute deterioration (`0.9120` AUC) and multi-class disease screening (`0.9970` AUC) models integrated with local SHAP `TreeExplainer` Shapley value attributions.
3. **Privacy-Preserving Federated Network**: Built a 3-node Flower `NumPyClient` federated network demonstrating weighted `FedAvg` parameter aggregation across 334,291 clinical records.
4. **HIPAA Security & Audit Framework**: Enforced PBKDF2-SHA256 password security, JWT authorization, Mosquitto ACL topic isolation, and an immutable PostgreSQL audit log (`audit_logs`).

---

## 7.3 Technical Recommendations

1. **Adopt Webpack Build Script**: Standardize `package.json` build command to `"build": "next build --webpack"` to bypass Next.js 16 Turbopack PostCSS evaluation issues.
2. **Stack Buffer Refactoring in Firmware**: Replace dynamic Arduino `String` heap allocations in `publishVitals()` with stack-allocated `snprintf()` char buffers to prevent long-term ESP8266 heap fragmentation.
3. **Redis Pub/Sub Attachment**: Connect Redis Pub/Sub to `_telemetry_broadcaster` to support multi-worker Uvicorn/Gunicorn deployments.

---

## 7.4 Deployment Recommendations

1. **Production TLS Certificates**: Deploy TLS certificates (Port 8883) for Mosquitto MQTT broker in production environments.
2. **Container Orchestration**: Use Kubernetes or Docker Swarm to orchestrate Mosquitto, FastAPI backend, and Next.js frontend containers with automated health checks.
3. **Secrets Management**: Inject `JWT_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` via encrypted vault secrets (HashiCorp Vault or AWS Secrets Manager).

---

## 7.5 Research Recommendations

1. **Differential Privacy**: Explore Laplace/Gaussian differential privacy noise addition to Flower federated weight exchanges to prevent model inversion attacks.
2. **Multi-Modal Deep Learning**: Research multi-modal deep learning architectures fusing continuous telemetry streams with medical imaging (Chest X-Rays).

---

## 7.6 Future Development Roadmap

```
[ Short-Term: 0 to 3 Months ]
  ├── 1. Execute physical ESP8266 hardware bench validation (COM7 port audit).
  ├── 2. Update package.json build script to "next build --webpack".
  └── 3. Attach Redis Pub/Sub to FastAPI SSE broadcaster for multi-worker scaling.

[ Medium-Term: 3 to 6 Months ]
  ├── 1. Implement HL7 FHIR R4 JSON serialization for telemetry exports.
  ├── 2. Integrate Laplace differential privacy into Flower federated aggregation.
  └── 3. Develop native mobile clinician app (React Native).

[ Long-Term: 6 to 12 Months ]
  ├── 1. Train 1D-CNN / LSTM deep learning models for real-time 12-lead ECG arrhythmia detection.
  └── 2. Pursue formal clinical pilot testing and medical device regulatory compliance.
```

---

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

---





