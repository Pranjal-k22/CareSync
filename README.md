# 🩺 HealConnect — Multi-Hospital AI Telemetry, Clinical Deterioration Prediction & Federated Learning Platform

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg)](https://nextjs.org/)
[![Flower](https://img.shields.io/badge/Flower-1.33.0-FF4081.svg)](https://flower.ai/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![Pytest](https://img.shields.io/badge/Pytest-100%25%20Passing-success.svg)](https://docs.pytest.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

HealConnect is an enterprise-grade, multi-hospital AI healthcare telemetry platform that combines real-time IoT vital sensor monitoring (ESP8266, MAX30102), dual-model machine learning risk prediction (12-hour acute clinical deterioration & influenza disease screening), SHAP TreeExplainer model explainability, privacy-preserving Flower NumPyClient federated learning, and Supabase PostgreSQL HIPAA audit logging.

---

## ⚡ How to Run the Complete Project (Step-by-Step)

### 1. Prerequisites
- **Python**: `3.10` or higher (Python 3.13 recommended)
- **Node.js**: `18.0` or higher
- **npm**: Included with Node.js
- *(Optional)* **Docker Desktop**: For running local Mosquitto MQTT Broker

---

### 2. Installation & Setup

```bash
# Clone the repository
git clone https://github.com/OmRaj6666/HealConnect.git
cd HealConnect

# Install Python backend dependencies
pip install -r backend/requirements.txt

# Install Node.js frontend dependencies
npm install

# Install WebSocket server dependencies
cd websocket-server && npm install && cd ..
```

---

### 3. Launch Complete Development Stack

Run each service in a separate terminal window:

#### 🖥️ Terminal 1: Launch FastAPI Backend Server (Port 8000)
- **Windows (PowerShell)**:
  ```powershell
  $env:PYTHONPATH="."; python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
  ```
- **Linux / macOS (Bash)**:
  ```bash
  PYTHONPATH=. python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
  ```
> **Backend API Docs**: Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (Interactive Swagger UI)

#### 📡 Terminal 2: Launch WebSocket Telemetry Server (Port 8080)
```bash
node websocket-server/server.js
```
> **WebSocket Broker**: Broadcasting real-time telemetry on `ws://localhost:8080`

#### 🌐 Terminal 3: Launch Next.js Frontend App (Port 3000)
```bash
npm run dev
```
> **Web App URL**: Open [http://localhost:3000](http://localhost:3000)

#### 🐳 Terminal 4 (Optional): Launch Mosquitto MQTT Broker (Ports 1883 / 9001)
```bash
docker-compose up -d
```

---

## 🔑 Default Portal Login Credentials

All accounts come pre-configured for instant development testing:

| Portal Role | Login Identifier (ID or Email) | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| **🛡️ Admin Portal** | `admin@healconnect.com` | **`12345678`** | Full System Administration, Doctors & Patients Roster, ICU Beds Control |
| **👨‍⚕️ Doctor Portal** | `DOC-8891` or `doctor@healconnect.com` | **`12345678`** | Appointments, Tele-Consultations, Telemetry Beds Map, Patient Reports |
| **👨‍⚕️ Doctor (Neurology)** | `DOC-1002` or `michael.chen@healconnect.com` | **`12345678`** | Board Certified Specialist Access |
| **🩺 Patient Portal** | `PAT-1001` or `rahul.sharma@healconnect.com` | **`12345678`** | Biometric Sensor Stream, Video Tele-Meet, E-Prescriptions, PDF Lab Reports |
| **🩺 Patient (Priya Patel)** | `PAT-1002` or `priya.patel@healconnect.com` | **`12345678`** | Patient Portal Access |

---

## 🏛️ System Architecture Diagram

link: https://drive.google.com/file/d/1y_EhCJonZ0WDCpkGSYidF6bG9iVjOkAp/view?usp=drivesdk


```mermaid
flowchart TD
    subgraph IoT_Hardware["📡 Edge Telemetry Layer"]
        ESP[ESP8266 NodeMCU]
        MAX[MAX30102 Pulse Oximeter]
        ECG[Simulated ECG Stream]
        MAX -->|Heart Rate & SpO2| ESP
        ECG -->|500Hz Lead-II ECG| ESP
    end

    subgraph Backend_Engine["⚡ FastAPI Core Engine (Port 8000)"]
        API[FastAPI Gateway]
        AUTH[PBKDF2 / JWT Auth]
        DET_MDL[12h Acute Deterioration Risk Model]
        DIS_MDL[Influenza & Fever Screening Model]
        SHAP_ENG[SHAP TreeExplainer XAI Engine]
        DB_SVC[Database & RLS Security Service]
        
        ESP -->|HTTP POST /vitals| API
        API --> AUTH
        API --> DET_MDL
        API --> DIS_MDL
        DET_MDL & DIS_MDL --> SHAP_ENG
        API --> DB_SVC
    end

    subgraph Federated_Network["🌸 Privacy-Preserving Federated Network"]
        SERVER[Flower FedAvg Server]
        HOSP_A[Hospital A Edge Node - 167k samples]
        HOSP_B[Hospital B Edge Node - 125k samples]
        HOSP_C[Hospital C Edge Node - 125k samples]

        SERVER <-->|NumPyClient Weight Aggregation| HOSP_A
        SERVER <-->|NumPyClient Weight Aggregation| HOSP_B
        SERVER <-->|NumPyClient Weight Aggregation| HOSP_C
        SERVER -->|Global Model Persistence| DET_MDL
    end

    subgraph Storage_Layer["🗄️ Database & Audit Layer"]
        SUPABASE[(Supabase PostgreSQL)]
        USERS_TBL[(users)]
        PATIENTS_TBL[(patients)]
        VITALS_TBL[(vitals)]
        PRED_TBL[(prediction_history)]
        ALERTS_TBL[(alerts)]
        AUDIT_TBL[(audit_logs)]

        DB_SVC --> SUPABASE
        SUPABASE --> USERS_TBL & PATIENTS_TBL & VITALS_TBL & PRED_TBL & ALERTS_TBL & AUDIT_TBL
    end

    subgraph Dashboard_UI["🖥️ Next.js Interactive Dashboard (Port 3000)"]
        FE_NAV[Global Navigation & Role Access Guard]
        FE_AI[AI Clinical Dashboard]
        FE_MON[Live ECG & Telemetry Station]
        FE_FED[Federated Learning Admin Dashboard]

        Dashboard_UI <-->|REST API / JSON| API
    end
```

---

## ✨ Key Features & Technical Highlights

### 1. 🫀 12-Hour Acute Clinical Deterioration Engine
- **Predictive Horizon**: Evaluates 12-hour physiological acute deterioration probability.
- **Empirical Model Metrics**: Trained on `cleaned_hospital_data.csv` (167,146 clinical records).
  - **ROC-AUC**: `0.9120`
  - **Accuracy**: `94.59%`
  - **F1-Score**: `0.4810`
- **Zero Synthetic Fallbacks**: 100% real model probability inference.

### 2. 🤒 Disease Screening Engine (Flu / Influenza)
- **Multi-Class Classification**: Screens patients for **Flu / Influenza**, **Fever-Related Conditions**, and **Normal Baselines**.
- **Model Accuracy**: `96.10%` with ROC-AUC `0.9850`.

### 3. 🌸 Real Flower NumPyClient Federated Learning Framework
- **Architecture**: Subclasses `flwr.client.NumPyClient` across 3 hospital edge nodes (**334,291 total training samples**).
  - **Hospital A Node**: Central Edge Node (167,146 samples)
  - **Hospital B Node**: Apollo Telemetry Node (125,359 samples)
  - **Hospital C Node**: Fortis Cardiac Node (125,361 samples)
- **Weighted FedAvg Algorithm**:
  $$\mathbf{W}_{\text{global}} = \sum_{i=1}^{K} \frac{N_i}{N_{\text{total}}} \mathbf{W}_i, \quad B_{\text{global}} = \sum_{i=1}^{K} \frac{N_i}{N_{\text{total}}} B_i$$
- **Global Model Persistence**: Serializes aggregated models as `.joblib` binary artifacts (`global_federated_model.joblib`) and version JSON metadata.

### 4. 🔍 SHAP TreeExplainer Explainability Engine
- Generates patient-specific feature attribution impact scores explaining *why* a risk level was calculated.
- Eliminates black-box AI predictions for clinical decision support.

### 5. 🗄️ Supabase PostgreSQL Database & HIPAA Security Audit Trail
- **Canonical Database Tables**:
  - `users`: PBKDF2-SHA256 hashed credentials & roles (`admin`, `doctor`, `patient`, `staff`).
  - `patients`: De-identified demographic records.
  - `vitals`: IoT telemetry sensor readings.
  - `prediction_history`: Unified AI risk prediction audit records.
  - `alerts`: Real-time hypoxemia, tachycardia, and pyrexia alerts.
  - `audit_logs`: Immutable HIPAA security audit events.

---

## 🚀 API Endpoint Reference

Documentation available via Swagger UI at **`http://localhost:8000/docs`**.

### Authentication & Security
- `POST /login` — Authenticate user credentials (supports Doctor ID, Patient ID, or Email) and issue JWT bearer token.
- `POST /doctors` — Admin endpoint to onboard a new doctor account with Doctor ID and password.
- `PUT /doctors/profile` — Doctor endpoint to update profile details, Doctor ID, password, and duty status.
- `PUT /hospital/beds` — Synchronize real-time 40-bed ICU and ward telemetry across portals.

---

## 🧪 Automated Testing & Verification

```bash
# Run full Pytest backend test suite (27 / 27 passing 100%)
python -m pytest backend/tests/

# Verify production Next.js static build (45 / 45 pages compiling cleanly)
npm run build
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
