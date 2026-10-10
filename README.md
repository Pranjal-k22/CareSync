# CareSync — Enterprise Clinical AI & Edge IoT Telemetry Platform

> **CareSync** is an enterprise-grade, multi-hospital AI healthcare telemetry platform that unifies real-time edge IoT sensor streams, dual-model machine learning risk prediction (Hospital Deterioration & Influenza Diagnosis), SHAP explainable AI attribution, and privacy-preserving federated learning into an interactive Next.js clinical workspace.

---

## 🏥 Problem Statement & Overview

Modern hospital inpatient wards and remote ICU settings struggle with fragmented telemetry monitoring and delayed clinical intervention. Vital sign changes (such as sudden drops in $\text{SpO}_2$, temperature spikes, or heart rate fluctuations) are often detected after patient deterioration has already progressed.

**CareSync** solves this challenge by providing:
* **Continuous Edge Telemetry**: Low-cost ESP8266 hardware nodes stream physiological vital signs over MQTT.
* **Dual ML Predictive Analytics**: Real-time risk scoring for early patient deterioration (Random Forest / XGBoost) and multi-class disease diagnosis.
* **Clinical XAI Explainability**: Feature-level SHAP attributions explaining *why* a patient is flagged as high-risk.
* **Privacy-Preserving Federated Learning**: Multi-hospital collaborative model training (FedAvg) using Flower without sharing raw patient records.

---

## ✨ Key Features

* **Real-Time 3D Telemetry Dashboard**: Interactive clinical dashboard built with Next.js, React, and Three.js for real-time vitals monitoring.
* **Dual Machine Learning Engine**:
  * **Patient Deterioration Risk Model**: Predicts early clinical deterioration risk using hourly patient vital trends.
  * **Influenza & Disease Diagnosis Model**: Multi-class diagnostic classification with high accuracy ($96.58\%$).
* **Explainable AI (SHAP & LIME)**: Transparent feature contribution breakdowns for clinical decision support.
* **Federated Learning Infrastructure**: Flower-based FL framework enabling hospital nodes to aggregate local model updates into a global model.
* **Server-Sent Events (SSE) Streaming**: Low-latency, real-time push streaming from FastAPI backend to Next.js UI.
* **Role-Based Clinical Workspaces**: Dedicated interfaces for Doctors, Patients, and Hospital Administrators.

---

## 📐 Architecture Overview

```mermaid
flowchart TD
    subgraph Edge ["1. Edge IoT Hardware"]
        ESP["ESP8266 Microcontroller<br/>(MAX30102, DHT22, DS18B20)"]
        SimECG["Simulated ECG Waveform Engine"]
    end

    subgraph Broker ["2. MQTT Messaging Hub"]
        Mosquitto["Mosquitto MQTT Broker<br/>(Ports 1883 / 9001 WS)"]
    end

    subgraph Backend ["3. Core Backend & AI Engine"]
        Ingest["Python Ingestion Worker"]
        FastAPI["FastAPI App Service<br/>(REST API + SSE Stream)"]
        ML["ML Prediction Registry<br/>(Deterioration & Disease Models)"]
        SHAP["SHAP Explainability Engine"]
    end

    subgraph Storage ["4. Database & Storage"]
        Supabase[("Supabase PostgreSQL DB")]
    end

    subgraph Frontend ["5. Clinical Frontend Workspace"]
        NextJS["Next.js React Dashboard<br/>(Three.js 3D Telemetry & SSE)"]
    end

    ESP -->|Pub: healconnect/+/+/vitals (QoS 1)| Mosquitto
    SimECG -.->|Simulated Waveform| NextJS
    Mosquitto -->|Sub: healconnect/+/+/vitals| Ingest
    Ingest -->|Insert Vitals| Supabase
    FastAPI -->|Query Vitals| Supabase
    FastAPI <-->|Infer & Explain| ML
    ML <--> SHAP
    FastAPI -->|Push SSE Stream| NextJS
```

> ⚠️ **Note on Hardware & ECG Telemetry**:  
> As documented in [`docs/iotconnect.md`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/docs/iotconnect.md), the **ECG waveform displayed in the UI is currently simulated** for demonstration purposes. Physical ESP8266 hardware validation and end-to-end hardware testing remain open items pending physical kit assembly.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Edge Hardware / IoT** | ESP8266 Microcontroller, C++, MAX30102 Pulse Oximeter, DS18B20 Temp Probe, DHT22 Sensor |
| **Messaging Broker** | Eclipse Mosquitto MQTT Broker (QoS 1 Telemetry Ingestion, TLS Ready) |
| **Backend Framework** | FastAPI (Python 3.10+ / 3.13), Uvicorn, Pydantic, Server-Sent Events (SSE) |
| **Machine Learning** | PyTorch, Scikit-Learn, XGBoost, Joblib, SHAP (Explainable AI), Flower (Federated Learning) |
| **Database** | PostgreSQL, Supabase Client & RLS Policies |
| **Frontend Framework** | Next.js 14, React, TailwindCSS, Three.js / React Three Fiber, Lucide Icons |

---

## 📁 Project Structure

```text
CareSync/
├── backend/                  # FastAPI App, ML Predictors & Federated Learning
│   ├── app/                  # Application Config, Predictors, SHAP Explainers
│   ├── federated/            # Flower FL Hospital Nodes & Aggregation Engine
│   ├── models/               # Model Registry & joblib Weight Artifacts
│   ├── tests/                # Pytest Suite (27 Unit & Integration Tests)
│   └── main.py               # FastAPI Core Server Entrypoint
├── components/               # Next.js UI Components (Dashboard, Vitals, Forms)
├── docs/                     # Comprehensive System Documentation Index
├── HealthConnect_Kit_ESP8266_Code/ # C++ ESP8266 Firmware Source Code
├── ml/                       # Machine Learning Pipelines, Training & Artifacts
│   ├── artifacts/            # Trained Joblib Models & Performance Metrics
│   ├── notebooks/            # Jupyter Notebooks for EDA & Model Evaluation
│   └── train_risk_model.py   # Training Pipelines
├── mosquitto/                # Mosquitto Broker Configuration & ACL Rules
├── pages/                    # Next.js Application Pages & Serverless API Routes
├── public/                   # Static Media, Video Assets, and Graphics
├── styles/                   # CSS Modular Stylesheets
├── docker-compose.yml        # Docker Multi-Service Orchestration
└── package.json              # Node.js Dependencies & Scripts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure the following tools are installed on your machine:
* **Python**: `3.10.0` or higher (`Python 3.13` supported)
* **Node.js**: `18.0.0` or higher (`Node.js 20 LTS` recommended)
* **Git**: `2.30.0` or higher

### 2. Repository Cloning & Dependency Setup
```bash
# 1. Clone the repository
git clone https://github.com/Pranjal-k22/CareSync.git
cd CareSync

# 2. Install Python backend dependencies
python -m pip install -r backend/requirements.txt

# 3. Install Node.js frontend dependencies
npm install

# 4. Install WebSocket server dependencies (Optional)
cd websocket-server
npm install
cd ..
```

### 3. Environment Variable Configuration
Copy `.env.example` to `.env.local` in the project root:
```bash
cp .env.example .env.local
```

### 4. Running the Platform
```bash
# Start FastAPI Backend Server (Port 8000)
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

# In a separate terminal, start Next.js Frontend Server (Port 3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to access the CareSync workspace.

---

## 🔑 Demo Accounts (Development Only)

For rapid evaluation in local development mode (`ALLOW_INSECURE_DEMO_ADMIN=true`):

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@healconnect.com` | `12345678` |
| **Doctor** | `doctor@healconnect.com` | `doc12345` |

---

## 🧪 Testing

Run the full automated backend test suite:
```bash
python -m pytest backend/tests/ -q
```
**Current Result**:
```text
27 passed, 21 warnings in 14.46s
```

---

## 📚 Documentation Index

Explore the detailed technical documentation in the [`docs/`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/docs/) directory:

| Document | Description |
| :--- | :--- |
| [SETUP.md](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/docs/SETUP.md) | Complete step-by-step installation & environment guide |
| [ARCHITECTURE.md](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/docs/ARCHITECTURE.md) | In-depth system architecture & data flow breakdown |
| [API_DOCUMENTATION.md](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/docs/API_DOCUMENTATION.md) | FastAPI REST endpoints & SSE streaming API reference |
| [DATABASE.md](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/docs/DATABASE.md) | Supabase PostgreSQL schema, tables, and RLS policies |
| [DEPLOYMENT.md](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/docs/DEPLOYMENT.md) | Docker & production deployment instructions |
| [DEVELOPMENT_GUIDE.md](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/docs/DEVELOPMENT_GUIDE.md) | Coding guidelines & developer workflows |
| [SECURITY.md](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/docs/SECURITY.md) | Security policies, JWT auth, and secret management |
| [TESTING.md](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/docs/TESTING.md) | Automated testing strategy & coverage reports |
| [ROADMAP.md](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/docs/ROADMAP.md) | Future development roadmap & pending milestones |
| [iotconnect.md](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/docs/iotconnect.md) | Hardware integration status & MQTT ingestion audit |

---

## 📌 Status & Roadmap

### Current Status
* ✅ **Completed**: Dual ML model training, SHAP explainability, FastAPI backend, SSE stream, Next.js 3D workspace, 27 automated tests passing, clean Git repository.

### Open Roadmap Items
* ⏳ **Physical Hardware Validation**: Complete end-to-end testing with physical ESP8266 microcontroller & sensors.
* ⏳ **TLS Encryption for MQTT**: Enable MQTTS on port 8883 for encrypted edge-to-broker transit.
* ⏳ **Redis SSE Pub/Sub**: Integrate Redis for horizontal multi-worker SSE scaling.

---

## 👥 Credits

TODO: list team members and any upstream project this was based on

---

## 📄 License

TODO: choose a license
