# 🩺 HealConnect — Executive Summary & Project Fact Sheet

## Executive Summary

**HealConnect** is an enterprise-grade, multi-hospital AI healthcare telemetry platform that combines continuous edge IoT sensor monitoring, dual-model machine learning risk prediction, SHAP model explainability, privacy-preserving Flower federated learning, and HIPAA-compliant database auditing. Designed for modern hospital networks, ICUs, and telehealth environments, HealConnect bridges the gap between hardware biometrics and actionable artificial intelligence for clinical decision support.

The platform establishes an end-to-end telemetry and artificial intelligence pipeline. Edge telemetry acquisition is performed using ESP8266 NodeMCU microcontrollers interfaced with MAX30102 pulse oximetry, DHT22 ambient room temperature/humidity, and DS18B20 body temperature sensors. Telemetry packets are transmitted over standard Wi-Fi using the MQTT protocol (QoS 1 delivery, retained Last Will and Testament status) to an Eclipse Mosquitto Message Broker. Server-side processing is driven by an asynchronous Python FastAPI application and an `MQTTIngestionService` that validates schema structure, enforces sliding-window packet sequence deduplication (`60s` cache), and persists telemetry to a Supabase PostgreSQL database protected by Row Level Security (RLS).

Clinical intelligence is provided by a dual Machine Learning (ML) engine:
1. **12-Hour Acute Clinical Deterioration Engine**: A `RandomForestClassifier` (100 estimators, max depth 12) trained on 167,146 clinical record sequences (`cleaned_hospital_data.csv`). It evaluates 14 physiological parameters to predict 12-hour acute deterioration probability with a holdout **ROC-AUC of 0.9120** and **Accuracy of 94.59%**.
2. **Influenza & Febrile Disease Screening Engine**: A tuned `GradientBoostingClassifier` trained on 15,000 patient entries (`disease_prediction_dataset.csv`) to screen for Normal Baselines, Flu / Influenza, and Febrile Conditions with **ROC-AUC of 0.9970** and **Accuracy of 96.58%**.

To eliminate black-box AI predictions, the backend integrates a **SHAP (`shap.TreeExplainer`) XAI Engine** that computes patient-specific Shapley feature attributions, delivering directional explanations (`increases_risk` / `reduces_risk`) to attending clinicians. For privacy-preserving collaborative intelligence across independent health systems, HealConnect implements a **Flower (`flwr.client.NumPyClient`) Federated Learning Network** spanning 3 hospital edge nodes (Hospital A, Apollo Telemetry, Fortis Cardiac; 334,291 total training samples), executing weighted `FedAvg` parameter aggregation without transmitting raw patient records.

Real-time telemetry streaming to Next.js 16 clinical dashboards is implemented via FastAPI Server-Sent Events (SSE) at `/telemetry/stream`, completely replacing unauthenticated legacy WebSocket processes. The platform includes a 27-test automated Pytest backend suite and 57 stage verification test cases (`84/84 tests passing, 100% success rate`), and a Next.js production build compiling 45/45 pages cleanly. The codebase is classified as a **Software Release Candidate**; physical ESP8266 hardware sensor validation remains physically unverified due to hardware bench unavailability (`PHYSICAL ESP8266: NOT VERIFIED`), with legacy Blynk/Firebase routines preserved behind compiler flags pending physical hardware deployment.

---

## Project Fact Sheet

| Dimension | Project Specification & Attribute | Evidence Source File |
| :--- | :--- | :--- |
| **Project Name** | HealConnect | `README.md` |
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
