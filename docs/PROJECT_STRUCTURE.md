# 📁 CareSync — Project Structure Documentation

## Directory Layout Overview

```text
CareSync/
├── .env.example                       # Example environment variables template
├── .env.local                         # Local environment configuration file
├── AGENTS.md                          # Agent execution directives
├── README.md                          # Repository root README
├── backend/                           # FastAPI Backend application root
│   ├── app/                           # Core backend python modules
│   │   ├── config.py                  # App configuration & environment loader
│   │   ├── explain.py                 # SHAP explainability calculations
│   │   ├── model_registry.py          # Dynamic ML model registry manager
│   │   ├── predict.py                 # Deterioration prediction service
│   │   ├── predict_disease.py         # Disease screening prediction service
│   │   ├── database/                  # Supabase database interaction service
│   │   └── services/                  # Business logic & telemetry services
│   │       ├── db_service.py          # Database persistence service
│   │       ├── mqtt_ingestion_service.py # Enterprise MQTT telemetry consumer
│   │       └── prediction_service.py  # Clinical deterioration prediction service
│   ├── federated/                     # Flower federated learning engine & clients
│   │   ├── federated_engine.py        # Central FedAvg orchestrator
│   │   ├── hospital_a_node.py         # Hospital A edge node client
│   │   ├── hospital_b_node.py         # Hospital B edge node client
│   │   └── hospital_c_node.py         # Hospital C edge node client
│   ├── main.py                        # FastAPI entry point, API routes & SSE stream
│   ├── models/                        # Serialized .joblib models & registry metadata
│   │   ├── disease_model.joblib       # Active disease classification model
│   │   ├── risk_model.joblib          # Active deterioration risk model
│   │   └── registry/                  # Versioned model registry configs & metadata
│   ├── requirements.txt               # Python backend dependencies
│   ├── supabase_schema.sql            # PostgreSQL canonical database schema
│   └── tests/                         # Pytest automated test suite (27 tests)
├── components/                        # React UI component library
│   ├── AIInsightCard.jsx              # SHAP attribution visualizer component
│   ├── Navbar.jsx                     # Global role-aware header navigation
│   └── LiveMonitor/                   # Live clinical telemetry monitoring components
├── datasets/                          # Cleaned clinical datasets
├── docs/                              # Project documentation knowledge base
├── HealthConnect_Kit_ESP8266_Code/    # ESP8266 C++ / Arduino firmware code
├── lib/                               # Client-side utility functions & Supabase JS client
├── ml/                                # Machine learning training & evaluation pipelines
│   ├── artifacts/                     # Generated model binaries & JSON metrics
│   ├── data/                          # Cleaned disease & deterioration datasets
│   ├── train_disease_model.py         # Disease model training script
│   ├── train_final_flu_model.py       # Final tuned flu model training script
│   └── train_risk_model.py            # Deterioration model training script
├── mosquitto/                         # Eclipse Mosquitto MQTT Broker configuration
│   └── config/                        # mosquitto.conf, password_file, and acl.conf
├── next.config.js                     # Next.js build & routing configuration
├── package.json                       # Node.js frontend dependencies & scripts
├── pages/                             # Next.js page routes
│   ├── _app.js                        # App wrapper & global styles
│   ├── admin.jsx                      # System Admin portal
│   ├── appointments.jsx               # Doctor appointment roster
│   ├── index.jsx                      # Main landing page & portal login
│   ├── monitoring.jsx                 # Live clinical telemetry stream dashboard
│   ├── patient.jsx                    # Patient portal dashboard
│   ├── prescriptions.jsx              # E-Prescriptions & Gemini OCR reader
│   └── tele-consultation.jsx          # Video tele-health consultation page
├── public/                            # Static assets, logos & favicon
├── scratch/                           # Verification & Stage test suites
│   ├── test_mqtt_ingestion.py         # Stage 5 MQTT ingestion test suite
│   ├── test_stage6_integration.py     # Stage 6 backend & ML integration suite
│   ├── test_stage7_frontend.py        # Stage 7 frontend SSE stream suite
│   └── test_stage8_reliability.py     # Stage 8 reliability & security suite
├── styles/                            # SCSS and global CSS stylesheets
└── websocket-server/                  # Legacy Node.js WebSocket telemetry server (isolated)
    ├── package.json                   # WebSocket server dependencies
    └── server.js                      # Legacy WebSocket broadcasting server (port 8080)
```

---

## Key Files & Development Guidelines

### 1. `backend/main.py`
- **Purpose**: Primary FastAPI application entry point, route definitions, authentication endpoints, and security middleware.
- **Responsibilities**: API routing, JWT parsing, exception handling, and HIPAA audit dispatching.
- **Dependencies**: `backend/app/`, `fastapi`, `pydantic`, `pyjwt`, `passlib`.
- **Edit Rule**: Safely add new endpoints. Do not modify global exception handling or CORS middleware without checking authentication flows.

### 2. `backend/app/model_registry.py`
- **Purpose**: Dynamic registry that loads, caches, and metadata-tracks active ML model pipelines.
- **Responsibilities**: Resolving model paths relative to repository root (`ROOT.parent`), parsing `registry_config.json`, and serving unpickled pipelines.
- **Edit Rule**: Path resolution must always support cross-platform relative paths.

### 3. `backend/app/predict.py` & `predict_disease.py`
- **Purpose**: Input schema validation and inference execution for deterioration and flu screening models.
- **Responsibilities**: Feature dictionary mapping, default fallback filling for missing features, probability thresholding, and risk score calculation.
- **Edit Rule**: Always maintain default fallbacks for optional clinical parameters to prevent 422 payload errors.

### 4. `backend/federated/federated_engine.py`
- **Purpose**: Orchestrates multi-node Flower federated learning training rounds.
- **Responsibilities**: Triggering edge client nodes, executing weighted FedAvg parameter aggregation, and persisting aggregated global models.
- **Edit Rule**: Ensure weight matrices and bias shapes align across all subclassed `NumPyClient` nodes.

### 5. `pages/index.jsx` & `pages/_app.js`
- **Purpose**: Main Next.js web application entry point and user login gatekeeper.
- **Responsibilities**: Role-based redirection (`admin`, `doctor`, `patient`), session persistence, and global theme wrapper.
- **Edit Rule**: Check login state propagation before altering navigation guards.
