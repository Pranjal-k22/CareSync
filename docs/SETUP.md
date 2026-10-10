# ⚙️ HealConnect — Setup & Installation Guide

This guide provides step-by-step instructions for installing, configuring, testing, and running the complete HealConnect platform from scratch.

---

## 1. Prerequisites & Environment Setup

Ensure the following software packages are installed on your system:

| Component | Minimum Version Required | Recommended Version |
| :--- | :--- | :--- |
| **Python** | `3.10.0` or higher | `Python 3.13` |
| **Node.js** | `18.0.0` or higher | `Node.js 20 LTS` |
| **npm** | `9.0.0` or higher | `npm 10.x` |
| **Git** | `2.30.0` or higher | `Git 2.40+` |

---

## 2. Repository Cloning & Dependency Installation

```bash
# 1. Clone the repository
git clone https://github.com/OmRaj6666/HealConnect.git
cd HealConnect

# 2. Install Python backend dependencies
python -m pip install -r backend/requirements.txt

# 3. Install Node.js frontend dependencies
npm install

# 4. Install WebSocket server dependencies
cd websocket-server
npm install
cd ..
```

---

## 3. Environment Variable Configuration

Create `.env.local` in the root directory of the repository:

```env
# Application Environment
ENVIRONMENT=development
ALLOW_INSECURE_DEMO_ADMIN=true

# Database & Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_KEY=your-supabase-anon-key

# JWT Authorization Secret
JWT_SECRET_KEY=your-jwt-secret-key-here

# Google Gemini API Key (Optional for OCR Prescription Processing)
GEMINI_API_KEY=your-gemini-api-key
```

---

## 4. Machine Learning Model Artifact Generation

To ensure binary `.joblib` model pipelines match your local Python and scikit-learn environment:

```bash
# Retrain Deterioration Risk Model
python ml/train_risk_model.py

# Retrain Multi-Class Disease Screening Model
python ml/train_disease_model.py

# Retrain Final Tuned Flu Pipeline
python ml/train_final_flu_model.py

# Copy retrained artifacts into backend model registry
python -c "import shutil; shutil.copy('ml/artifacts/risk_model_v1.joblib', 'backend/models/risk_model.joblib'); shutil.copy('ml/artifacts/risk_model_v1.joblib', 'backend/models/registry/deterioration/v1/model.joblib'); shutil.copy('ml/artifacts/disease_model_v1.joblib', 'backend/models/disease_model.joblib'); shutil.copy('ml/artifacts/flu_model_v1.joblib', 'backend/models/flu_model_v1.joblib'); shutil.copy('ml/artifacts/flu_model_v1.joblib', 'backend/models/registry/disease/flu_v1/model.joblib')"
```

---

## 5. Automated Verification & Testing

Run the full Pytest test suite to verify backend routing, database mocks, model loading, explainability calculations, and federated learning modules:

```bash
# Execute 27/27 Passing Pytest Tests
python -m pytest backend/tests/
```

---

## 6. Running Development Servers

Launch all development servers in separate terminal sessions:

### 📡 Terminal 1: Mosquitto MQTT Message Broker (Port 1883)
```bash
# Docker Compose start Mosquitto broker
docker-compose up -d mosquitto
```
> **Broker Verification**: Run `mosquitto_sub -h 127.0.0.1 -p 1883 -u ingest_service_dev -P ingest_password_789! -t "healconnect/#" -v`

### 🐍 Terminal 2: FastAPI Backend Gateway & MQTT Ingestion Service (Port 8000)
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
> **Backend Interactive Docs**: Open [http://localhost:8000/docs](http://localhost:8000/docs)  
> **Realtime Telemetry SSE Stream**: `http://localhost:8000/telemetry/stream`

### 🌐 Terminal 3: Next.js Interactive Dashboard (Port 3000)
```bash
npm run dev
```
> **Web App URL**: Open [http://localhost:3000](http://localhost:3000)

---

## 7. Portal Credentials Reference

| Portal Role | Login Identifier | Default Password | Features Available |
| :--- | :--- | :--- | :--- |
| **🛡️ System Admin** | `admin@healconnect.com` | `12345678` | Roster management, ICU ward bed control, security audit logs. |
| **👨‍⚕️ Doctor** | `DOC-8891` or `doctor@healconnect.com` | `12345678` | Live telemetry station, AI risk analysis, SHAP XAI breakdown. |
| **🩺 Patient** | `PAT-1001` or `rahul.sharma@healconnect.com` | `12345678` | Tele-consultations, digital E-prescriptions, lab report PDF viewer. |
