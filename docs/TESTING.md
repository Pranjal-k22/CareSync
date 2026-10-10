# 🧪 CareSync — Automated Testing & Verification Guide

## 1. Test Architecture Overview

CareSync includes a comprehensive automated backend test suite using **Pytest** and FastAPI `TestClient`.

The test suite covers:
1. **REST API Endpoints** ([`backend/tests/test_api.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/tests/test_api.py)): Authentication, disease screening (`/predict-disease`), unified prediction (`/predict-unified`), SHAP explainability (`/explain/{id}`), federated training (`/federated/train`), and model registry (`/models`).
2. **Database Service** ([`backend/tests/test_database.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/tests/test_database.py)): Supabase prediction history saving, audit event logging, user credential verification.
3. **SHAP Explainability Engine** ([`backend/tests/test_explainability.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/tests/test_explainability.py)): TreeExplainer attributions for deterioration and flu screening.
4. **Federated Learning Framework** ([`backend/tests/test_federated.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/tests/test_federated.py)): Flower `NumPyClient` node weight serialization and `FedAvg` aggregation routines.
5. **Model Pipeline Loading** ([`backend/tests/test_models.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/tests/test_models.py)): Joblib binary artifact deserialization and metadata verification.
6. **Vitals Input Validation** ([`backend/tests/test_predict.py`](file:///c:/Users/pc/Desktop/capstone/Heal_connectmain2.0/backend/tests/test_predict.py)): Numerical range validation and default parameter fill-in.
7. **MQTT Ingestion Suite** (`scratch/test_mqtt_ingestion.py`): 17 tests verifying Mosquitto broker setup, QoS 1 vitals schema validation, sequence deduplication, and database persistence.
8. **Stage 6 Integration Suite** (`scratch/test_stage6_integration.py`): 13 tests verifying backend ML auto-prediction, SHAP explainability, and error boundary isolation.
9. **Stage 7 Frontend Stream Suite** (`scratch/test_stage7_frontend.py`): 18 tests verifying FastAPI SSE `/telemetry/stream` broadcasting, stale device threshold (>10s), unmount cleanup, and tenant isolation.
10. **Stage 8 Reliability & Security Suite** (`scratch/test_stage8_reliability.py`): 9 tests verifying DB outages, prediction failures, malformed JSON rejection, multi-tenant boundaries, and repository secret security audit.

---

## 2. Test Execution Commands

Run backend pytest and Stage verification suites from repository root:

```bash
# Execute Pytest test suite (27 tests)
python -m pytest backend/tests/

# Execute Stage 5 MQTT Ingestion Suite (17 tests)
python scratch/test_mqtt_ingestion.py

# Execute Stage 6 Integration Suite (13 tests)
python scratch/test_stage6_integration.py

# Execute Stage 7 Frontend SSE Suite (18 tests)
python scratch/test_stage7_frontend.py

# Execute Stage 8 Reliability Suite (9 tests)
python scratch/test_stage8_reliability.py
```

---

## 3. Current Verified Test Status

```text
1. Pytest Backend Suite:      27 / 27 PASS (python -m pytest backend/tests/)
2. Stage 5 MQTT Ingestion:    17 / 17 PASS (python scratch/test_mqtt_ingestion.py)
3. Stage 6 Integration Suite: 13 / 13 PASS (python scratch/test_stage6_integration.py)
4. Stage 7 Frontend SSE:      18 / 18 PASS (python scratch/test_stage7_frontend.py)
5. Stage 8 Reliability Suite:  9 /  9 PASS (python scratch/test_stage8_reliability.py)
```

> **Overall Test Status**: `84 / 84 PASSING (100% SUCCESS RATE)`

---

## 4. Frontend Production Build Verification

To verify Next.js static page compilation and routing using the Webpack compiler engine:

```bash
npx next build --webpack
```

Expected output: `✓ Compiled successfully (45 / 45 pages)`

