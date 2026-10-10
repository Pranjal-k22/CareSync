# 🔍 CareSync — Troubleshooting Log & Solved Issues

This document records significant technical issues encountered during development, including empirical root cause analysis, exact resolutions, changed files, and prevention guidelines.

---

## Issue 001 — `ModuleNotFoundError: No module named '_loss'` on Model Unpickling

### Problem
When executing `pytest backend/tests/`, 9 tests failed with `ModuleNotFoundError: No module named '_loss'` inside `joblib.load(MODEL_PATH)`.

### Symptoms
FastAPI endpoints `/predict-disease` and `/predict-unified` returned 500 server errors when trying to load binary `.joblib` model artifacts.

### Root Cause
The legacy `.joblib` model files (`disease_model.joblib`, `risk_model.joblib`) were originally pickled using an older scikit-learn version (e.g. 1.7.2). When unpickled in Python 3.13 / scikit-learn 1.9.0, internal package module references to Cython loss functions (`_loss`) failed due to scikit-learn internal module restructuring.

### Solution
1. Retrained `train_risk_model.py`, `train_disease_model.py`, and `train_final_flu_model.py` in the current Python environment.
2. Saved updated `.joblib` binary artifacts to `ml/artifacts/`.
3. Overwrote stale model files in `backend/models/` and versioned registry folders (`backend/models/registry/deterioration/v1/model.joblib` & `backend/models/registry/disease/flu_v1/model.joblib`).

### Files Changed
- `ml/artifacts/risk_model_v1.joblib`
- `ml/artifacts/disease_model_v1.joblib`
- `ml/artifacts/flu_model_v1.joblib`
- `backend/models/risk_model.joblib`
- `backend/models/disease_model.joblib`

### Verification
Pytest model deserialization tests (`test_models.py`, `test_api.py`) passed cleanly without `ModuleNotFoundError`.

---

## Issue 002 — Hardcoded Machine Absolute Paths (`/Users/omraj/...`)

### Problem
Tests failed with `FileNotFoundError: [Errno 2] No such file or directory: '\Users\omraj\Downloads\Heal_connectmain\backend\models...'`.

### Symptoms
Model registry configuration lookups failed on any developer machine other than the original author's local macOS path.

### Root Cause
`backend/models/registry/registry_config.json`, `metadata.json`, and training scripts (`train_disease_model.py`, `train_final_flu_model.py`) contained hardcoded absolute directory strings starting with `/Users/omraj/Downloads/...`.

### Solution
1. Replaced hardcoded path variables in training scripts with dynamic relative parent directory resolution:
   ```python
   ROOT = Path(__file__).resolve().parent.parent
   ```
2. Updated `registry_config.json` and `metadata.json` to use clean relative paths (`backend/models/registry/...`).
3. Updated `backend/app/model_registry.py` to resolve relative paths against `ROOT.parent`.

### Files Changed
- `ml/train_disease_model.py`
- `ml/train_final_flu_model.py`
- `backend/models/registry/registry_config.json`
- `backend/models/registry/deterioration/v1/metadata.json`
- `backend/models/registry/disease/flu_v1/metadata.json`
- `backend/app/model_registry.py`

### Verification
Registry lookups resolved correctly across environments.

---

## Issue 003 — Missing Feature Columns in SHAP Explainability Engine

### Problem
`explain_deterioration` in `explainability_service.py` failed with `Input feature value error: columns are missing: {'oxygen_flow', 'mobility_score', ...}` and returned `422 Unprocessable Entity` or `status: "error"`.

### Symptoms
SHAP TreeExplainer endpoint `/explain/{prediction_id}` failed when partial payload vitals (e.g. only `heart_rate`, `spo2`, `temperature`) were submitted.

### Root Cause
The trained deterioration pipeline expects 14 explicit input feature columns. When incomplete vital dictionaries were passed without default values, `preprocessor.transform(...)` rejected the input dataframe.

### Solution
Updated `explain_vitals_record` in `backend/app/explain.py` and `explain_deterioration` in `backend/app/services/explainability_service.py` to populate default clinical fallback values for missing features (`oxygen_flow: 0.0`, `mobility_score: 3.0`, `nurse_alert: 0`, `comorbidity_index: 0.0`, `oxygen_device: "room_air"`, `gender: "Male"`, `admission_type: "Elective"`).

### Files Changed
- `backend/app/explain.py`
- `backend/app/services/explainability_service.py`

### Verification
Pytest test `test_shap_explanation_deterioration` and `/explain/PRED-1001` endpoint passed with HTTP `200 OK`.

---

## Issue 004 — ESP8266 MQTT PubSubClient `state=-2` Connection Failure (Laptop IP Mismatch)

### Problem
ESP8266 Serial Monitor prints `[MQTT] Connecting to broker 10.142.32.140:1883... [MQTT] Connection failed, state=-2`. No telemetry packets reach the backend or Next.js dashboard.

### Symptoms
- Website displays `● LIVE SSE` badge active, but vitals are static or blank.
- Serial Monitor reports `state=-2` (`MQTT_CONNECT_FAILED` / socket connection refused/timeout).

### Root Cause
The laptop's IPv4 address changed (e.g. laptop reconnected from mobile hotspot `realme` to campus Wi-Fi `VITBPL`, changing IP from `10.142.32.140` to `172.25.223.209`). The ESP8266 firmware had `MQTT_BROKER_HOST` hardcoded to the old IP (`10.142.32.140`).

### Solution
1. Identify current laptop Wi-Fi IPv4 address using `ipconfig` or `netsh wlan show interfaces`.
2. Update `MQTT_BROKER_HOST` in `secrets.h`:
   ```cpp
   #define MQTT_BROKER_HOST "172.25.223.209" // or current laptop IP
   ```
3. Re-compile and re-flash firmware to ESP8266 using `arduino-cli`:
   ```powershell
   arduino-cli compile --fqbn esp8266:esp8266:generic CareSync_Kit_ESP8266_Code/ESP8266_MQTT_Client
   arduino-cli upload -p COM7 --fqbn esp8266:esp8266:generic CareSync_Kit_ESP8266_Code/ESP8266_MQTT_Client
   ```

### Files Changed
- `CareSync_Kit_ESP8266_Code/ESP8266_MQTT_Client/secrets.h`
- `CareSync_Kit_ESP8266_Code/secrets.h`

### Verification
ESP8266 Serial Monitor prints `[MQTT] Connected successfully!`, and telemetry packets flow into backend ingestion and Next.js frontend.

---

## Issue 005 — DS18B20 Temperature Sensor Reusing Stale Values on Disconnect (`-127.0°C`)

### Problem
When the DS18B20 body temperature probe was disconnected or faulty, the dashboard and hardware output kept displaying stale temperature readings (e.g. `32.4°C` or `30.1°C`) continuously instead of reporting sensor error.

### Symptoms
`BodyTemp` value on Serial Monitor never changed even when probe wire was unplugged or tested.

### Root Cause
The firmware rejected values `<= -55.0` or `>= 85.0` by skipping variable assignment: `if (bTemp > -55.0 && bTemp < 85.0) bodyTemp = bTemp;`. When DS18B20 returned `DEVICE_DISCONNECTED_C` (`-127.0°C`), `bodyTemp` retained its previous value indefinitely.

### Solution
Updated `ESP8266_MQTT_Client.ino` to add device discovery check (`sensors.getDeviceCount()`) and explicit `DEVICE_DISCONNECTED_C` error handling:
```cpp
if (bTemp == DEVICE_DISCONNECTED_C || bTemp <= -55.0) {
  Serial.println("[DS18B20] ERROR: Sensor disconnected / read failed");
  bodyTemp = 0.0;
} else {
  bodyTemp = bTemp;
}
```

### Files Changed
- `CareSync_Kit_ESP8266_Code/ESP8266_MQTT_Client/ESP8266_MQTT_Client.ino`

### Verification
When probe is disconnected, hardware prints `[DS18B20] ERROR` and outputs `BodyTemp: 0.0°C`, cleanly resetting state.

---

## Issue 006 — MAX30102 Optical Sensor Reading `-- NOT DETECTED` on Monitoring Dashboard

### Problem
User placed finger on sensor or opened dashboard and saw `HEART RATE: -- NOT DETECTED` and `BLOOD OXYGEN: -- % Saturation`.

### Symptoms
Frontend monitoring page showed `-- NOT DETECTED` for heart rate and SpO2.

### Root Cause
1. **Finger Absence**: When no finger rests on the MAX30102 optical lens, `finger_detected` is `false`. To ensure strict medical data validity, the UI explicitly renders `-- NOT DETECTED` instead of fake mock numbers (`86 BPM`, `99%`).
2. **Buffer Sampling**: Firmware originally performed 1-sample read which did not satisfy the 100-sample window required by `maxim_heart_rate_and_oxygen_saturation`.

### Solution
1. Upgraded ESP8266 firmware to collect 100 continuous FIFO samples per 2-second publishing cycle, checking IR Min/Max/Avg diagnostics (`maxIR > 50000`).
2. Instructed users on optical sensor placement: finger must cover the red/IR LED window for 5–10 seconds continuously to compute valid pulse waveforms.

### Files Changed
- `CareSync_Kit_ESP8266_Code/ESP8266_MQTT_Client/ESP8266_MQTT_Client.ino`
- `pages/monitoring.jsx`
- `components/LiveMonitor/WebSocketMonitor.js`

### Verification
Placing finger on MAX30102 updates `Optical Finger Contact` to `DETECTED` and streams live BPM and SpO2 values.

---

## Issue 007 — Telemetry Ingestion Dropping Ambient Packets & Backend API Sorting Fix

### Problem
When finger was not placed on MAX30102 (`heart_rate: 0.0`, `spo2: 0.0`), telemetry service rejected packets, preventing ambient room temperature and humidity from persisting. Additionally, `/vitals/{patient_id}` returned old records out of order.

### Symptoms
Database vitals table stopped updating when finger was idle, and API endpoint returned stale historical rows instead of latest packet.

### Root Cause
1. `MQTTIngestionService` dropped packets where `heart_rate == 0.0`.
2. `db_service.get_vitals_for_patient()` sorted vitals without explicit timestamp descending (`reverse=True`) order.

### Solution
1. Updated `MQTTIngestionService` (`backend/app/services/mqtt_ingestion_service.py`) to accept ambient packets when `finger_detected: false`.
2. Updated `db_service.py` `get_vitals_for_patient()` to enforce timestamp descending sort (`reverse=True`).

### Files Changed
- `backend/app/services/mqtt_ingestion_service.py`
- `backend/app/services/db_service.py`

### Verification
All 27 Pytest tests and 40 integration/reliability tests passed. Ambient packets persist continuously, and backend API deterministically returns latest hardware sequence.

