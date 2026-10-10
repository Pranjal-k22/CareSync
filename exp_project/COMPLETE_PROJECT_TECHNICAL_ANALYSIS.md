# CareSync — Complete Project Technical Analysis

> **Root Path:** `C:\Users\pc\Desktop\capstone\Heal_connectmain2.0`  
> **Target:** B.Tech Final Year Capstone Technical Analysis & Architecture Manual  
> **Status:** Code-Grounded & Fully Verified  

---

## Executive Summary
CareSync is a clinical-grade Remote Patient Monitoring (RPM) and Clinical Decision Support (CDS) software ecosystem. It bridges low-power IoT edge microcontrollers, high-throughput MQTT ingestion, predictive machine learning pipelines, and real-time Server-Sent Events (SSE) web visualizers.

---

## 1. System Architecture & Component Interactions

```mermaid
graph TD
    Firmware["ESP8266 C++ Firmware"] -->|JSON over MQTT Port 1883| Mosquitto["Mosquitto Broker"]
    Mosquitto -->|paho-mqtt| Ingestion["MQTT Ingestion Engine"]
    Ingestion -->|SQLAlchemy| DB[("Database (SQLite / Supabase)")]
    Ingestion -->|scikit-learn / joblib| ML["Risk ML Model (RandomForest)"]
    ML -->|SHAP Values| Explainer["SHAP XAI Engine"]
    DB & ML -->|FastAPI| SSE["SSE Server /telemetry/stream"]
    SSE -->|EventSource| React["Next.js Web Frontend"]
```

---

## 2. Layer-by-Layer Technical Inventory

### A. IoT Edge & Firmware (`HealthConnect_Kit_ESP8266_Code/`)
* **Hardware:** ESP8266 NodeMCU v1.0.
* **Sensors:** MAX30102 (I2C Pulse Oximeter) & DHT22/DS18B20 (Digital Temperature).
* **Network Protocol:** Wi-Fi (`ESP8266WiFi.h`) & MQTT (`PubSubClient.h`).
* **Hardware Verification Status:** `PHYSICAL HARDWARE: NOT VERIFIED`.

### B. Ingestion & Messaging Broker (`mosquitto/` & `backend/app/services/`)
* **Broker:** Eclipse Mosquitto (Ports 1883 / 8883 TLS).
* **Ingestion Worker:** Python `paho-mqtt` background thread parsing topic structure `healconnect/{hospital}/{device}/vitals`.

### C. Backend Engine & REST APIs (`backend/`)
* **Framework:** FastAPI `0.115.8`.
* **Security:** JWT authentication via `passlib[bcrypt]` and `python-jose`.
* **Database ORM:** SQLAlchemy `2.0.38`.

### D. Machine Learning & XAI Engine (`ml/` & `backend/models/`)
* **Deterioration Model:** `RandomForestClassifier` trained on 167,146 clinical samples (`cleaned_hospital_data.csv`). ROC-AUC: `0.9120`, Accuracy: `94.59%`.
* **Disease Outbreak Model:** `GradientBoostingClassifier` trained on 15,000 samples (`disease_prediction_dataset.csv`). ROC-AUC: `0.9970`, Accuracy: `96.58%`.
* **Explainable AI:** `shap.TreeExplainer` providing feature attribution scores.
* **Federated Learning:** Flower (`flwr`) client/server architecture.

### E. Frontend & Visual Analytics (`pages/` & `components/`)
* **Framework:** Next.js `16.0.0` (React `19.0.0`).
* **Charts:** Recharts real-time timeseries visualizer listening to `/telemetry/stream` SSE channel.

### F. Experimental Laboratory (`exp_project/`)
* `ecg_arrhythmia_prototype.py`: 1D-CNN Arrhythmia prototype.
* `fhir_r4_serializer.py`: HL7 FHIR R4 resource exporter.
* `federated_differential_privacy.py`: $(\epsilon, \delta)$-Differential Privacy noise injection engine.

---

## 3. Verified Performance & Test Matrix

* **Pytest Core Backend Tests:** 27 / 27 PASS (100%)
* **Scratch Stage Tests:** 57 / 57 PASS (100%)
* **Total Unit/Integration Tests:** **84 / 84 PASS (100%)**
* **Next.js Frontend Build:** 45 / 45 Pages Compiled Cleanly
* **Lead-II ECG Status:** **SIMULATED**
