# 🔌 CareSync — API Endpoint Documentation

Interactive OpenAPI / Swagger documentation is available at **`http://localhost:8000/docs`**.

---

## 1. System Health & Authentication Endpoints

### `GET /`
- **Method**: `GET`
- **Purpose**: Server health check and API version details.
- **Authentication**: None (Public)
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "service": "CARESYNC AI Health Telemetry Engine",
    "version": "2.5.0",
    "timestamp": "2026-09-27T08:42:19.956676+00:00"
  }
  ```

---

### `POST /login`
- **Method**: `POST`
- **Purpose**: Authenticates user credentials (Doctor ID, Patient ID, or Email) and issues a JWT bearer token.
- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "username": "admin@caresync.com",
    "password": "12345678"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": "USR-001",
      "email": "admin@caresync.com",
      "role": "admin",
      "name": "System Administrator"
    }
  }
  ```

---

## 2. Artificial Intelligence & Prediction Endpoints

### `POST /predict`
- **Method**: `POST`
- **Purpose**: Predicts 12-hour acute clinical deterioration risk score and level for a patient based on physiological vital input.
- **Authentication**: Optional Bearer Token / Clinician Role
- **Request Body**:
  ```json
  {
    "patient_id": "PAT-1001",
    "heart_rate": 115,
    "respiratory_rate": 24,
    "spo2": 92.0,
    "temperature": 98.9,
    "systolic_bp": 140,
    "diastolic_bp": 90,
    "age": 55
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "prediction_id": "PRED-1725801200",
    "patient_id": "PAT-1001",
    "risk_score": 78.45,
    "risk_level": "HIGH",
    "model_version": "v1.0",
    "top_factors": [
      {
        "feature": "spo2_pct",
        "input_value": 92.0,
        "shap_value": 0.2845,
        "direction": "increases_risk"
      }
    ],
    "timestamp": "2026-09-27T08:45:00.000Z"
  }
  ```

---

### `POST /predict/disease` (and alias `/predict-disease`)
- **Method**: `POST`
- **Purpose**: Screens patient for Influenza and fever-related medical conditions.
- **Authentication**: None (Public / Clinician)
- **Request Body**:
  ```json
  {
    "patient_id": "DIS-1001",
    "temperature_c": 38.6,
    "heart_rate": 98,
    "spo2_pct": 96.0,
    "cough_severity": 2,
    "headache_severity": 2,
    "fatigue_score": 2,
    "chills": 1,
    "body_ache": 1,
    "sore_throat": 1,
    "age": 35
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "prediction_id": "DIS-PRED-1725801200",
    "patient_id": "DIS-1001",
    "predicted_condition": "Flu / Influenza",
    "disease_class_id": 1,
    "confidence": 96.58,
    "model_version": "v1.0",
    "timestamp": "2026-09-27T08:45:00.000Z"
  }
  ```

---

### `POST /predict/unified` (and alias `/predict-unified`)
- **Method**: `POST`
- **Purpose**: Atomically executes both 12-Hour Deterioration and Flu Screening models in a single request.
- **Authentication**: Optional Bearer Token
- **Request Body**: Unified vital parameter JSON object.
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "patient_id": "PAT-1001",
    "prediction": {
      "deterioration": { "score": 78.45, "prediction": "HIGH" },
      "influenza": { "condition": "Flu / Influenza", "confidence": 96.58 }
    },
    "explainability": {
      "deterioration_factors": [...],
      "influenza_factors": [...]
    },
    "timestamp": "2026-09-27T08:45:00.000Z"
  }
  ```

---

## 3. Explainability (SHAP XAI) Endpoints

### `GET /explain/{prediction_id}`
- **Method**: `GET`
- **Purpose**: Returns SHAP feature attributions for a given prediction record ID.
- **Authentication**: Bearer Token (Clinician Role)
- **Response `200 OK`**:
  ```json
  {
    "prediction_id": "PRED-1001",
    "top_factors": [
      {
        "feature": "spo2_pct",
        "input_value": 92.0,
        "shap_value": 0.2845,
        "direction": "increases_risk",
        "magnitude": 0.2845
      }
    ]
  }
  ```

---

## 4. Federated Learning & Registry Endpoints

### `POST /federated/train`
- **Method**: `POST`
- **Purpose**: Triggers Flower `flwr.client.NumPyClient` federated training across Hospital A, Apollo, and Fortis nodes.
- **Authentication**: Bearer Token (Admin Role)
- **Request Body**: `{"num_rounds": 1}`
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "message": "Federated training round completed cleanly across 3 hospital nodes.",
    "aggregated_model_version": "v1.0-FEDERATED"
  }
  ```

---

### `GET /models`
- **Method**: `GET`
- **Purpose**: Lists registered active ML models, versions, algorithms, and targets.
- **Authentication**: None (Public)
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "registered_models": {
      "deterioration": {
        "name": "CareSync Patient Deterioration Risk Engine",
        "version": "v1.0",
        "algorithm": "RandomForestClassifier",
        "features_count": 14
      },
      "disease": {
        "name": "CareSync Flu & Disease Diagnosis Model",
        "version": "v1.0",
        "algorithm": "GradientBoostingClassifier (Tuned)",
        "features_count": 11
      }
    }
  }
  ```

---

## 5. Realtime Telemetry Stream Endpoints (SSE)

### `GET /telemetry/stream` (and alias `/api/telemetry/stream`)
- **Method**: `GET`
- **Purpose**: Server-Sent Events (SSE) stream endpoint for live vital signs telemetry broadcast from Mosquitto MQTT ingestion pipeline.
- **Authentication**: Public / Optional Session Auth
- **Query Parameters**:
  - `patient_id` (optional): Filter vitals stream by patient identity (e.g., `PAT-1001`)
  - `device_id` (optional): Filter stream by hardware device (e.g., `node-9901`)
  - `hospital_id` (optional): Filter stream by hospital tenant (e.g., `hosp-001`)
  - `max_events` (optional): Automatically close stream after emitting N events (used for test integration)
- **Response Format**: `text/event-stream`
- **Event Payload Example**:
  ```text
  event: vitals
  data: {"patient_id": "PAT-1001", "device_id": "node-9901", "hospital_id": "hosp-001", "vitals": {"heart_rate": 74.0, "spo2": 98.0, "temperature": 36.8, "room_temp": 24.0, "humidity": 50.0, "finger_detected": true}, "status": "LIVE", "timestamp": "2026-09-27T10:00:00Z"}
  ```

