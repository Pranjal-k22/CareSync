# 15 — ECG Data-Flow Architecture

> **Path:** `architecture-project/15-ecg-data-flow.md`  
> **Status:** SIMULATED ECG Workflow  

```mermaid
flowchart LR
    ECG_Source["ECG Waveform Generator [SIMULATED]"] -->|Waveform Samples| ESP["Telemetry Simulator Script"]
    ESP -->|Pub: caresync/+/+/ecg (QoS 0)| Mosquitto["Mosquitto MQTT Broker"]
    Mosquitto -->|Sub: caresync/+/+/ecg| Ingest["MQTT Ingestion Worker"]
    Ingest -->|Dispatch Event| SSE["FastAPI SSE Endpoint (/telemetry/stream)"]
    SSE -->|EventSource| NextJS["Next.js Live Monitoring Page"]
    NextJS -->|Render Waveform| Canvas["Live ECG Waveform Visualizer Component"]
```
