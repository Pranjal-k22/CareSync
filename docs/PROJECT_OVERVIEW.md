# 📖 CareSync — Project Overview

## Project Name
**CareSync** — Enterprise Multi-Hospital AI Telemetry, Clinical Deterioration Prediction & Privacy-Preserving Federated Learning Platform.

---

## Project Purpose

### What problem the project solves
Hospital ICUs and ward units face critical challenges in monitoring physiological patient signals in real-time. Delayed detection of acute clinical deterioration leads to preventable adverse events, cardiac arrests, and unplanned ICU escalations. Furthermore, sharing sensitive patient vital data across multi-hospital networks for machine learning model training poses severe HIPAA compliance and privacy risks.

### Why it exists
CareSync bridges edge IoT hardware sensors with enterprise-grade dual machine learning engines (12-hour acute deterioration prediction and multi-class influenza/fever screening) paired with SHAP model explainability. It enables cross-hospital collaborative model optimization using Flower privacy-preserving federated learning without centralizing raw health data.

### Who uses it
1. **ICU Clinicians & Physicians**: Monitor live telemetry streams (ECG, SpO2, Heart Rate), review AI acute deterioration risk scores, analyze SHAP feature attributions, and conduct video tele-consultations.
2. **Hospital Administrators**: Manage ICU ward bed allocations, monitor staff rosters, inspect security audit logs, and oversee federated learning model aggregations across hospital nodes.
3. **Patients**: View personal vital streams, access digital E-prescriptions, review lab reports, and participate in tele-health visits.
4. **Bio-Medical & IoT Engineers**: Connect edge telemetry hardware (ESP8266 NodeMCU, MAX30102, DHT22, DS18B20; `PHYSICAL ESP8266: NOT VERIFIED`) into the live hospital network.

---

## Project Scope

### IN-SCOPE (Currently Implemented)
- **Edge Telemetry Processing**: SpO2, heart rate, room temp, humidity, and body temp telemetry processing via Eclipse Mosquitto MQTT Broker (port 1883) and FastAPI Server-Sent Events stream (`/telemetry/stream`).
- **12-Hour Acute Deterioration Model**: Scikit-Learn `RandomForestClassifier` trained on hospital vital trends to predict 12-hour acute deterioration probability (AUC `0.8822`, accuracy `93.25%`).
- **Influenza & Multi-Class Disease Screening**: `GradientBoostingClassifier` model screening for `Normal Baseline`, `Flu / Influenza`, and `Fever-Related Condition` (AUC `0.9970`, accuracy `96.58%`).
- **SHAP TreeExplainer Explainability (XAI)**: Local patient-specific feature attribution calculations explaining *why* a risk level was calculated.
- **Privacy-Preserving Federated Network**: Flower `flwr.client.NumPyClient` weighted `FedAvg` aggregation across 3 simulated hospital nodes (**334,291 total samples**).
- **Supabase PostgreSQL & Security**: Immutable HIPAA audit trail logging (`audit_logs`), PBKDF2-SHA256 password hashing, and JWT authorization guards.
- **Interactive Multi-Portal Frontend**: Built with Next.js 16, React 18, SCSS modules, TailwindCSS, Lucide React, and ApexCharts.

### OUT-OF-SCOPE (Intentionally Excluded)
- Direct billing or insurance claim processing.
- Direct HL7/FHIR EHR server writebacks (currently mock/demo payload compliant).
- Direct hardware control or drug delivery device actuation.

### CURRENT CAPABILITIES
- 100% real model inference (zero synthetic fallbacks).
- 27 / 27 passing automated backend Pytest test suite.
- Pre-configured instant development accounts (`admin@healconnect.com`, `doctor@healconnect.com`, `patient@healconnect.com`).
- Live dual model inference endpoints (`/predict`, `/predict-disease`, `/predict-unified`).
- Integrated OCR prescription processing via Google Gemini 2.5 Flash API.

### PLANNED CAPABILITIES
- Full FHIR R4 standard bundle serialization for telemetry exports.
- Native mobile client application (React Native / iOS & Android).
- Differential privacy noise addition during federated weight exchange.

### NON-GOALS
- Replacing licensed medical practitioners or serving as a standalone diagnostic device without clinician oversight.
- Hosting centralized raw patient data from external hospitals.
