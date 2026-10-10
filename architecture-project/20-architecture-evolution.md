# 20 — Architecture Evolution Analysis

> **Path:** `architecture-project/20-architecture-evolution.md`  
> **Status:** Historical Migration Justification  

```mermaid
flowchart TD
    subgraph V1_Problems["v1.0 Architectural Bottlenecks"]
        WS_Framing["WebSocket Framing Overhead on Microcontroller"]
        No_QoS["No Built-in Delivery Guarantees (QoS)"]
        Node_Single["Node.js Single-Threaded Processing Bottleneck"]
    end

    subgraph V2_Solutions["v2.0 Architectural Enhancements"]
        MQTT_2Byte["MQTT 2-Byte Fixed Header Protocol"]
        QoS1_Guarantee["QoS 1 At-Least-Once Delivery Guarantee"]
        FastAPI_SSE["FastAPI Asynchronous SSE Telemetry Streaming"]
    end

    V1_Problems -->|Migration & Refactoring| V2_Solutions
```

## Protocol Trade-off Summary

| Protocol | Header Size | Overhead on ESP8266 | QoS Guarantee | Client Subscriptions |
| :--- | :--- | :--- | :--- | :--- |
| **WebSockets (v1.0)** | 2 – 14 bytes + Frame Mask | High Memory Footprint | None (Custom Retry Required) | Bi-directional |
| **MQTT (v2.0)** | 2 bytes | Minimal Memory Footprint | **QoS 1 Native Support** | Pub/Sub via Broker |
| **HTTP SSE (v2.0)** | Standard HTTP | Zero Client Framing | Auto Reconnect | Unidirectional Server Push |
