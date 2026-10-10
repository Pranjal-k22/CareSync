# HealConnect — Viva Technical Questions & Answers

> **Purpose:** Final Year Capstone Project Oral Examination & Viva Preparation  
> **Repository:** `C:\Users\pc\Desktop\capstone\Heal_connectmain2.0`  

---

## Core Viva Questions & Code-Grounded Answers

### Q1: What is HealConnect and what problem does it solve?
**Answer:** HealConnect is a real-time IoT, Machine Learning, and Cloud Remote Patient Monitoring (RPM) platform. It eliminates the 4–8 hour manual vital recording lag in hospital wards by streaming sub-second telemetry over MQTT/SSE and evaluating real-time patient deterioration risk using an ensemble ML model (`RandomForestClassifier`).

### Q2: Why was MQTT chosen over WebSockets for IoT ingestion?
**Answer:** MQTT is an ISO-standard lightweight publish/subscribe protocol with a 2-byte header, ideal for battery-constrained ESP8266 microcontrollers. It provides native Quality of Service (QoS 1) delivery guarantees over unreliable Wi-Fi networks, whereas WebSockets require higher connection overhead and custom framing.

### Q3: How is real-time telemetry delivered from the backend to the frontend UI?
**Answer:** Telemetry is ingested from Mosquitto by a Python `paho-mqtt` worker, saved to SQLite/PostgreSQL, and pushed to a FastAPI Server-Sent Events (SSE) generator at `/telemetry/stream`. The Next.js frontend connects via the browser's native `EventSource` API, updating Recharts graphs without polling.

### Q4: Explain the Machine Learning models used in HealConnect.
**Answer:** HealConnect uses two main models:
1. **Deterioration Model (`risk_model.joblib`):** A `RandomForestClassifier` trained on 167,146 clinical samples using 14 vital features. It achieves **94.59% accuracy** and an **ROC-AUC of 0.9120**.
2. **Outbreak Model (`flu_model_v1.joblib`):** A `GradientBoostingClassifier` trained on 15,000 samples for disease classification (**96.58% accuracy**, **0.9970 ROC-AUC**).

### Q5: How do clinicians know WHY a patient is flagged at high risk?
**Answer:** HealConnect integrates Explainable AI (XAI) using `shap.TreeExplainer` in `backend/app/explain.py`. It computes feature contribution scores showing exactly how much each parameter (e.g., SpO2 = 88%) contributed to the high risk prediction.

### Q6: How does HealConnect address patient data privacy across multiple hospitals?
**Answer:** HealConnect implements Federated Learning (FL) using the **Flower (`flwr`)** framework (`ml/federated_client.py`). Hospital nodes train models locally on their own datasets and send only weight updates to the central server. `exp_project/federated_differential_privacy.py` adds Laplace noise for $(\epsilon, \delta)$-differential privacy.

### Q7: What are the primary disclaimers regarding hardware and medical testing?
**Answer:**
1. Physical ESP8266 board hardware testing was not performed in automated test passes (`PHYSICAL HARDWARE: NOT VERIFIED`).
2. Single-lead ECG signals are currently **SIMULATED**.
3. HealConnect is a prototype Clinical Decision Support tool and is **NOT** a certified medical diagnostic device.
