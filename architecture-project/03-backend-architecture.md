# 03 — Backend Architecture

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
`Client Request` $ightarrow$ `FastAPI Router` $ightarrow$ `OAuth2 JWT Middleware` $ightarrow$ `Route Controller` $ightarrow$ `Service Layer` $ightarrow$ `SQLAlchemy ORM / ML Model` $ightarrow$ `JSON / SSE Response`.
