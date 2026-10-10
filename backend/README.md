# HealConnect AI Healthcare Backend API

Privacy-Preserving AI-Based Healthcare Risk Assessment System Using Explainable AI (SHAP), Federated Learning, and IoT Telemetry.

## System Architecture

```text
IoT Telemetry (ESP8266 / Sensors)
       ↓
Next.js Frontend Dashboard (React + Chart.js)
       ↓
FastAPI AI Backend (Python 3.13)
       ↓
[Random Forest Risk Model v1.0] ← SHAP Explainability Engine
       ↓
[Flower Federated Learning Engine] (Hospital A, Hospital B, Hospital C)
       ↓
Supabase PostgreSQL Database
```

## Quick Start Guide

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Run Data Preparation & Model Training
```bash
python backend/app/prepare_data.py
python backend/app/train.py
```

### 3. Start FastAPI Server
- **Windows (PowerShell)**:
  ```powershell
  $env:PYTHONPATH="."; python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
  ```
- **Linux / macOS (Bash)**:
  ```bash
  PYTHONPATH=. python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
  ```

FastAPI Server active on: `http://127.0.0.1:8000`  
OpenAPI Swagger Docs: `http://127.0.0.1:8000/docs`

### 4. Run Unit Tests
```bash
python -m pytest backend/tests/
```

## Disclaimer
Academic decision-support project, not for real clinical diagnosis.
