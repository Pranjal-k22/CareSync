# 07 — MQTT Architecture

> **Path:** `architecture-project/07-mqtt-architecture.md`  
> **Status:** Implemented & Configured (Mosquitto Broker v2.x)  

```mermaid
flowchart TD
    subgraph Publisher_Nodes["MQTT Publishers"]
        ESP["ESP8266 Edge Device"]
        SimECG["ECG Simulator Script [SIMULATED]"]
    end

    subgraph Mosquitto_Broker["Eclipse Mosquitto MQTT Broker (Port 1883 / 8883 TLS)"]
        Config["mosquitto/config/mosquitto.conf"]
        PasswordFile["mosquitto/config/password_file"]
        ACLFile["mosquitto/config/acl_file"]
    end

    subgraph Subscriber_Nodes["MQTT Subscribers"]
        Ingest["Python MQTT Ingestion Worker (paho-mqtt)"]
    end

    ESP -->|Pub: healconnect/+/+/vitals (QoS 1)| Mosquitto_Broker
    SimECG -->|Pub: healconnect/+/+/ecg (QoS 0)| Mosquitto_Broker
    ESP -.->|Pub: healconnect/+/+/status (LWT QoS 1)| Mosquitto_Broker
    
    Mosquitto_Broker -->|Sub: healconnect/+/+/vitals| Ingest
    Mosquitto_Broker -->|Sub: healconnect/+/+/ecg| Ingest
```

## Topic Specifications

| MQTT Topic Pattern | Publisher | Subscriber | Purpose | QoS Level | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `healconnect/{hospital}/{device}/vitals` | ESP8266 | Ingestion Service | Vital signs telemetry payload | QoS 1 | `HealthConnect_Kit_ESP8266_Code.ino` |
| `healconnect/{hospital}/{device}/ecg` | Simulator | Ingestion Service | Streaming ECG samples | QoS 0 | `HealthConnect_Kit_ESP8266_Code.ino` |
| `healconnect/{hospital}/{device}/status` | ESP8266 | Ingestion Service | Last Will & Testament status | QoS 1 | `HealthConnect_Kit_ESP8266_Code.ino` |
