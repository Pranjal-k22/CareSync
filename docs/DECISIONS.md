# 🏛️ CareSync — Architectural Decision Records (ADRs)

This document records key technical decisions, context, trade-offs, and consequences in CareSync.

---

## ADR-001 — Selection of FastAPI for Core Backend Gateway

### Date
2026-08-01

### Context
CareSync required a high-performance, asynchronous, type-safe Python API gateway to handle high-frequency IoT telemetry payloads, execute ML model inference, interface with Supabase, and generate automated OpenAPI documentation.

### Decision
Use **FastAPI** running on Uvicorn ASGI server.

### Alternatives Considered
- **Flask**: Lacks native async concurrency, automatic OpenAPI generation, and Pydantic data validation out of the box.
- **Django REST Framework (DRF)**: Too heavy for microservice ML inference gateway.

### Reason
FastAPI provides native `asyncio` support, Pydantic type validation, built-in Swagger/ReDoc interactive documentation at `/docs`, and high throughput performance comparable to Node.js / Go.

### Status
`Accepted`

---

## ADR-002 — Dual Machine Learning Model Architecture

### Date
2026-08-05

### Context
Hospital clinicians require two distinct predictive capabilities: (1) early warning for acute physiological deterioration in ICU/ward patients over a 12-hour horizon, and (2) screening for infectious respiratory diseases (flu/fever).

### Decision
Implement two independent model pipelines:
1. **12-Hour Acute Deterioration Engine**: `RandomForestClassifier` trained on hospital vital trends.
2. **Multi-Class Disease Screening Engine**: `GradientBoostingClassifier` trained on respiratory symptom datasets.

### Alternatives Considered
- **Single Multi-Task Deep Neural Network**: Harder to interpret via SHAP, requires large GPU infrastructure, prone to catastrophic forgetting.

### Reason
Decoupled tree-based ensemble models allow granular hyperparameter tuning, faster CPU inference (< 15ms per patient), and full transparency via `shap.TreeExplainer`.

### Status
`Accepted`

---

## ADR-003 — Flower Framework for Privacy-Preserving Federated Learning

### Date
2026-08-10

### Context
Training clinical deterioration models across multiple independent hospital systems is restricted by HIPAA regulations against centralizing raw patient data.

### Decision
Adopt the **Flower (`flwr.client.NumPyClient`)** federated learning framework with weighted `FedAvg` parameter aggregation across hospital nodes.

### Alternatives Considered
- **Centralized Data Lake**: Violates cross-hospital HIPAA compliance.
- **PySyft**: Complex setup, heavier runtime dependencies compared to Flower.

### Reason
Flower enables subclassing `NumPyClient` to easily extract, transmit, and aggregate scikit-learn model weight matrices and bias vectors while leaving raw hospital datasets at the edge.

### Status
`Accepted`

---

## ADR-004 — SHAP TreeExplainer for Clinical Explainability (XAI)

### Date
2026-08-15

### Context
Clinicians cannot rely on black-box AI scores for high-stakes clinical decisions. They require explicit justification detailing which vital signs increased or decreased a patient's risk level.

### Decision
Integrate **SHAP (`shap.TreeExplainer`)** feature attribution calculations into model prediction APIs.

### Alternatives Considered
- **LIME**: Slower sampling, non-deterministic explanations.
- **Feature Importance Arrays**: Global metrics that do not explain individual patient predictions.

### Reason
SHAP TreeExplainer delivers exact mathematical game-theoretic Shapley values per patient in real-time, outputting directional indicators (`increases_risk` / `reduces_risk`) for UI rendering.

### Status
`Accepted`

---

## ADR-005 — Standardized Relative Path Resolution Pattern

### Date
2026-09-27

### Context
Hardcoded machine absolute paths (e.g. `/Users/omraj/...`) broke model registry loading and test execution across different developer machines and operating systems.

### Decision
Enforce dynamic relative path resolution across all Python modules (`Path(__file__).resolve().parent.parent`) and relative JSON configuration paths (`backend/models/registry/...`).

### Status
`Accepted`

---

## ADR-006 — Eclipse Mosquitto MQTT & FastAPI SSE Telemetry Architecture

### Date
2026-09-27

### Context
The legacy telemetry setup relied on custom Node.js WebSocket broadcasting and REST document patching. An enterprise-grade, standardized IoT transport was required to support secure multi-hospital device isolation, non-blocking hardware retry backoff, QOS 1 delivery, retained state management, and clean browser streaming without exposing broker credentials to client bundles.

### Decision
Adopt **Eclipse Mosquitto MQTT Broker** (port 1883 dev / port 8883 TLS blueprint) for edge hardware telemetry ingestion and **FastAPI Server-Sent Events (SSE)** `/telemetry/stream` for live browser streaming.

### Alternatives Considered
- **Raw Browser MQTT (Port 1883/9001)**: Rejected because client-side MQTT exposes broker passwords to browser JS bundles and bypasses server-side tenant authorization.
- **Custom Node.js WebSocket Daemon**: Rejected to eliminate unauthenticated standalone daemon dependencies.

### Reason
Mosquitto provides native QoS 1 message guarantees, retained Last Will & Testament (LWT) device offline state handling, and ACL topic isolation (`caresync/{hospital}/{device}/vitals`). FastAPI SSE delivers native browser reconnection via `EventSource` with zero broker credential exposure.

### Status
`Accepted`

