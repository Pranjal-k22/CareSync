# 🎯 HealConnect — Product Roadmap

This document outlines completed milestones, active engineering tasks, and future planned capabilities for HealConnect.

---

## 🟢 Completed Milestones

- [x] **12-Hour Acute Clinical Deterioration Model**: Trained `RandomForestClassifier` ensemble model achieving `0.8822` ROC-AUC and `93.25%` accuracy.
- [x] **Multi-Class Flu & Fever Screening Engine**: Trained `GradientBoostingClassifier` model achieving `0.9970` ROC-AUC and `96.58%` accuracy.
- [x] **SHAP TreeExplainer Explainability Engine**: Integrated local feature attribution calculation outputting directional indicators (`increases_risk` / `reduces_risk`) and Shapley magnitudes.
- [x] **Flower Federated Learning Network**: Constructed privacy-preserving `NumPyClient` multi-node network (334k samples across Hospital A, Apollo, and Fortis nodes) with weighted `FedAvg` parameter aggregation.
- [x] **FastAPI & Supabase Security Infrastructure**: Implemented PBKDF2-SHA256 password hashing, JWT bearer token guards, and immutable `audit_logs` security logging.
- [x] **Automated Pytest Test Suite**: Built comprehensive test suite with 27 out of 27 tests passing (100% success rate).
- [x] **Cross-Platform Relative Path Standardization**: Eliminated machine-specific absolute paths (`/Users/omraj/...`) across ML scripts and backend registries.
- [x] **Single Source-of-Truth Knowledge Base**: Created `docs/` repository knowledge base containing standardized engineering documentation files.
- [x] **Enterprise IoT Telemetry Architecture (Stages 0–11)**: Migrated edge transport to Eclipse Mosquitto MQTT Broker (port 1883 dev / 8883 TLS blueprint), server-side `MQTTIngestionService`, and FastAPI SSE streaming `/telemetry/stream`. Achieved 100% test pass rate across all software integration, reliability, security, and stream test suites. Software classified as `SOFTWARE RELEASE CANDIDATE`.

---

## 🟡 In Progress

- [ ] **Real-Time Alert Push Notifications**: Integration of WebPush browser notifications for critical hypoxemia ($\text{SpO}_2 < 90\%$) and tachycardia ($\text{HR} > 130\text{ BPM}$) alerts.
- [ ] **Dynamic Bed Allocation Drag-and-Drop**: Interactive UI enhancement for drag-and-drop ICU telemetry bed assignment.

---

## 🔵 Planned Capabilities

- [ ] **FHIR R4 Standard Serialization**: Export telemetry vital streams and AI prediction records as compliant HL7 FHIR R4 Observation & RiskAssessment JSON bundles.
- [ ] **Differential Privacy in Federated Aggregation**: Add Laplace / Gaussian noise differential privacy mechanisms to Flower weight aggregation rounds.
- [ ] **Native Mobile App (React Native)**: iOS and Android clinician client application for remote telemetry monitoring.

---

## 🔮 Future Ideas

- [ ] **Multi-Modal Image Analysis**: Integration of chest X-ray / CT scan classification models into the unified AI diagnostic portal.
- [ ] **ECG Arrhythmia Deep Learning Engine**: 1D-CNN / LSTM deep learning classifier for real-time 12-lead ECG arrhythmia detection.
