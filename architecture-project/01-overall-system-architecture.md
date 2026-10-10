# 01 — Overall System Architecture

> **Path:** `architecture-project/01-overall-system-architecture.md`  
> **Status:** Code-Grounded Reference Architecture  

```mermaid
flowchart TD
    subgraph IoT_Edge["1. IoT Edge Layer [Hardware Unverified]"]
        ESP["ESP8266 Microcontroller (C++)"]
        MAX["MAX30102 Sensor (HR/SpO2)"]
        DHT["DHT22 Sensor (Temperature)"]
        ECG["Simulated ECG Stream [SIMULATED]"]
        MAX & DHT & ECG --> ESP
    end

    subgraph MQTT_Broker["2. MQTT Messaging Broker"]
        Mosquitto["Eclipse Mosquitto Broker (Port 1883/8883)"]
        ESP -->|Pub: healconnect/+/+/vitals| Mosquitto
    end

    subgraph Ingestion_Layer["3. Ingestion & Backend Core"]
        Ingest["MQTT Ingestion Worker (paho-mqtt)"]
        Mosquitto -->|Sub: healconnect/+/+/vitals| Ingest
        DB[("Database (SQLite / Supabase Postgres)")]
        ML["RandomForest Risk ML Model (risk_model.joblib)"]
        SHAP["SHAP TreeExplainer Service"]
        
        Ingest -->|1. Raw Vitals| DB
        Ingest -->|2. Score Deterioration| ML
        ML -->|3. Feature Attribution| SHAP
        SHAP -->|4. Risk Record & SHAP| DB
    end

    subgraph Streaming_Layer["4. Real-Time SSE Layer"]
        SSE["FastAPI SSE Endpoint (/telemetry/stream)"]
        Ingest -->|5. Telemetry Event| SSE
    end

    subgraph Client_Layer["5. Frontend Visual Analytics"]
        NextJS["Next.js 16 Web App (React 19)"]
        SSE -->|HTTP EventSource| NextJS
        NextJS -->|Render Recharts| Dashboard["Clinical Dashboard UI"]
    end
```

## Component Responsibilities & Connections

1. **IoT Edge Layer:** Reads physiological signals from MAX30102 and DHT22 via I2C and single-bus interfaces. Formats JSON telemetry payloads published over MQTT.
2. **MQTT Broker:** Eclipse Mosquitto handles publish/subscribe topic routing (`healconnect/{hospital}/{device}/vitals`) with QoS 1 delivery guarantees.
3. **MQTT Ingestion Worker:** Python `paho-mqtt` background service subscribing to broker topics, storing raw vitals into PostgreSQL/SQLite database, and triggering ML inference.
4. **Machine Learning & SHAP:** Executes `risk_model.joblib` (Random Forest, 94.59% accuracy) and `explain.py` for feature attribution scores.
5. **FastAPI SSE Broadcaster:** Maintains persistent `/telemetry/stream` connections to stream JSON events without polling.
6. **Next.js Frontend Client:** Consumes SSE stream via `EventSource`, updating Recharts graphs in real-time.
