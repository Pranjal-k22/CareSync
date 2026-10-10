# 10 — Real-Time Server-Sent Events (SSE) Architecture

> **Path:** `architecture-project/10-realtime-sse-architecture.md`  
> **Status:** Implemented & Verified (FastAPI SSE `/telemetry/stream`)  

```mermaid
sequenceDiagram
    autonumber
    actor Client as Next.js Web Client
    participant SSE as FastAPI SSE (/telemetry/stream)
    participant Ingest as MQTT Ingestion Service
    participant Broker as Mosquitto Broker
    participant Edge as ESP8266 Device

    Client->>SSE: HTTP GET /telemetry/stream (Accept: text/event-stream)
    Note over Client,SSE: Persistent HTTP Connection Established
    Edge->>Broker: Publish JSON Vitals Payload (QoS 1)
    Broker->>Ingest: Deliver MQTT Message
    Ingest->>SSE: Dispatch Telemetry Event to Broadcast Queue
    SSE-->>Client: event: vitals\ndata: {"patient_id": "P101", "hr": 84, "spo2": 98}\n\n
    Note over Client: Recharts UI Graph Rendered Automatically
```

## Technical Justification for SSE over WebSockets
* **Unidirectional Requirement:** Client only requires receiving server-pushed telemetry updates.
* **Low Overhead:** Native HTTP transport bypasses WebSocket handshake framing complexity.
* **Auto-Reconnection:** Browser `EventSource` handles reconnection automatically upon network interruption.
