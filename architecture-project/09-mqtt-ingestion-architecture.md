# 09 — MQTT Ingestion Architecture

> **Path:** `architecture-project/09-mqtt-ingestion-architecture.md`  
> **Status:** Implemented & Verified (Python `paho-mqtt` Client Worker)  

```mermaid
flowchart TD
    Mosquitto["Mosquitto MQTT Broker"] -->|on_message Callback| Worker["paho-mqtt Client Worker"]
    
    subgraph Ingestion_Pipeline["Ingestion Pipeline Execution"]
        Worker --> TopicParser["Topic Parser (extract hospital_id, device_id)"]
        TopicParser --> JSONParser["JSON Payload Validator"]
        JSONParser --> DBWriter["SQLAlchemy DB Service (Insert raw vitals)"]
        JSONParser --> MLPredictor["ML Service (risk_model.joblib execution)"]
        MLPredictor --> DBScoreWriter["SQLAlchemy DB Service (Insert risk_score)"]
        JSONParser --> SSEQueue["FastAPI SSE Broadcaster Queue"]
    end

    DBWriter --> Database[("PostgreSQL / SQLite Database")]
    DBScoreWriter --> Database
    SSEQueue --> SSEBroadcaster["FastAPI SSE Endpoint (/telemetry/stream)"]
```

## Processing Flow Steps
1. **Message Reception:** `on_message` callback receives raw payload from topic `healconnect/{hospital}/{device}/vitals`.
2. **Parsing & Validation:** Extracts device ID, verifies valid numeric ranges (`HR: 30-220`, `SpO2: 50-100%`).
3. **Storage & Analytics:** Saves raw telemetry, invokes `risk_model.joblib`, and pushes updated payload to SSE stream queue.
