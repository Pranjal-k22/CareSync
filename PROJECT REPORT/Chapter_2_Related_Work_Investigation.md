# CHAPTER 2 — RELATED WORK INVESTIGATION

## 2.1 Domain Background & Technical Context

Remote Patient Monitoring (RPM) and real-time clinical telemetry have evolved rapidly over the past decade. Early IoT healthcare solutions relied heavily on HTTP polling or third-party consumer IoT clouds (such as Blynk, Thingspeak, or Adafruit IO). While accessible, these early frameworks lacked enterprise security controls, custom binary communication contracts, multi-tenant hospital isolation, and server-side artificial intelligence integration.

In modern hospital infrastructure, real-time patient telemetry demands low-latency packet delivery, minimal bandwidth consumption, high transport reliability, and robust data isolation. This chapter examines existing architectural approaches in healthcare IoT—including WebSocket broadcasting, Server-Sent Events (SSE), MQTT pub/sub, cloud-native telemetry, and wearable biometric monitoring—evaluating their strengths and limitations against HealConnect.

---

## 2.2 Investigation of Existing Architectural Approaches

### 1. Classical HTTP/REST Polling Platforms
- **Existing Approach**: The clinical frontend periodically issues `GET /vitals` HTTP requests to the backend server (e.g., every 5 to 10 seconds) to fetch updated patient vital signs.
- **Technology Used**: REST APIs over HTTP/1.1 or HTTP/2, JSON payloads.
- **Advantages**: Simple to implement, stateless, firewall-friendly.
- **Limitations**: High network overhead due to repeated HTTP header exchanges, server resource exhaustion under high client concurrency, and inherent latency (up to the polling interval duration).
- **Relevance to HealConnect**: Rejected as the primary live telemetry transport due to latency and resource inefficiency. Retained strictly for static query endpoints (e.g., fetching historical prediction logs).

### 2. Standalone WebSocket Telemetry Servers
- **Existing Approach**: Microcontrollers or edge gateways establish bi-directional full-duplex TCP WebSocket sockets (`ws://` or `wss://`) directly to a dedicated broadcasting server.
- **Technology Used**: Node.js `ws` library, Socket.io, or Python WebSockets.
- **Advantages**: Full-duplex bi-directional communication, extremely low frame header overhead (2 to 10 bytes), sub-100ms latency.
- **Limitations**: Manually managing connection lifecycles, heartbeats, and client subscription state is complex. Furthermore, allowing browser JS bundles to establish unauthenticated raw WebSocket sockets directly to edge servers exposes internal infrastructure and bypasses application API security layers.
- **Relevance to HealConnect**: HealConnect originally included a legacy Node.js WebSocket server (`websocket-server/server.js`, port 8080). Architectural audit (ADR-006) revealed that browser-side WebSockets bypassed backend authorization. The WebSocket server was isolated, and live browser streaming was migrated to FastAPI SSE.

### 3. Native MQTT Broker Architecture (Edge Ingestion)
- **Existing Approach**: Microcontrollers publish lightweight binary/JSON telemetry payloads over TCP to a dedicated MQTT message broker. Applications subscribe to topic hierarchies to consume data.
- **Technology Used**: Eclipse Mosquitto, EMQX, HiveMQ, MQTT v3.1.1/v5.0.
- **Advantages**: Publish/Subscribe decoupling, minimal packet header overhead (2 bytes), built-in Quality of Service levels (QoS 0, 1, 2), retained messages, Last Will and Testament (LWT) automated offline detection, and Access Control List (ACL) topic isolation.
- **Limitations**: Standard MQTT operates over raw TCP/IP sockets, which native browser JavaScript cannot access directly without WebSockets-over-MQTT proxies (which expose broker credentials to browser bundles if unmanaged).
- **Relevance to HealConnect**: Adopted as the authoritative edge-to-backend telemetry transport (ADR-006). ESP8266 microcontrollers publish QoS 1 vitals to `healconnect/{hospital_id}/{device_id}/vitals` and retained LWT status to `healconnect/{hospital_id}/{device_id}/status`. The backend `MQTTIngestionService` consumes and validates payloads securely on the server side.

### 4. Server-Sent Events (SSE) (Browser Telemetry Streaming)
- **Existing Approach**: The backend server maintains a persistent, one-way HTTP connection to client browsers, pushing UTF-8 formatted text streams (`text/event-stream`) whenever new data arrives.
- **Technology Used**: HTML5 `EventSource` API, HTTP/1.1 or HTTP/2 persistent streaming.
- **Advantages**: Native browser auto-reconnection via built-in `EventSource` retry headers, zero third-party client JavaScript dependencies, seamless integration with standard HTTP authentication (JWT/cookies), and zero exposure of internal broker credentials to client bundles.
- **Limitations**: Monodirectional (server-to-client only), maximum 6 HTTP/1.1 connection limit per domain in older browsers (mitigated by HTTP/2 multiplexing).
- **Relevance to HealConnect**: Adopted as the authoritative browser streaming transport (ADR-006). FastAPI endpoint `/telemetry/stream` bridges internal MQTT ingestion with client browser dashboards, enforcing server-side patient and tenant filtering.

---

## 2.3 Comprehensive Technical Comparison Matrix

| Approach / Technology | Primary Protocol | Strengths & Advantages | Critical Limitations | HealConnect Architectural Difference |
| :--- | :--- | :--- | :--- | :--- |
| **REST Polling** | HTTP/1.1 GET | Simple, stateless, easy caching | High latency, excessive header overhead, poor scalability | HealConnect uses REST only for static CRUD/history; live vitals use SSE. |
| **Direct Browser WebSockets** | WS / WSS | Low latency, bi-directional full-duplex | Complex state management, exposes raw sockets, bypasses API security | HealConnect isolates raw WebSockets (`websocket-server/`); uses SSE behind FastAPI gateway. |
| **Consumer IoT Cloud (Blynk/Firebase)** | Proprietary REST / HTTP | Rapid prototyping, zero server setup | Vendor lock-in, no QoS guarantees, lacks XAI/Federated ML integration | HealConnect replaces cloud dependencies with self-hosted Mosquitto MQTT & FastAPI. |
| **Direct Browser MQTT** | WebSockets MQTT | Native Pub/Sub in browser | Exposes broker passwords (`MQTT_PASSWORD`) in JS bundles; security risk | HealConnect keeps MQTT on backend; streams to browser via credential-free SSE. |
| **HealConnect Hybrid Architecture** 🏆 | **MQTT (Edge) + SSE (Browser)** | **QoS 1 guarantees, LWT offline detection, 0 client secret leak, XAI + Federated ML** | Single-worker process constraint (mitigated by documentation) | **Combines Mosquitto MQTT for hardware ingestion with FastAPI SSE for secure UI streaming.** |

---

## 2.4 Motivation for Key Architectural Decisions

1. **Migration from WebSockets to MQTT (ADR-006)**: The legacy codebase relied on a standalone Node.js WebSocket process (`ws://10.92.0.122:8080`). This setup lacked message delivery guarantees, device authentication, ACL topic isolation, and retained offline state handling. Migrating edge microcontrollers to Eclipse Mosquitto MQTT provided native QoS 1 delivery, Last Will and Testament (LWT) disconnect detection, and multi-tenant ACL rules (`healconnect/{hospital}/{device}/vitals`).
2. **Selection of Server-Sent Events (SSE) for Browser Telemetry (ADR-006)**: Transporting telemetry from backend to browser via SSE (`/telemetry/stream`) eliminates client-side MQTT library overhead and prevents sensitive broker credentials (`MQTT_PASSWORD`) from leaking into browser JavaScript bundles. Browser `EventSource` handles reconnection automatically while FastAPI validates tenant permissions server-side.
3. **Decoupled Dual Machine Learning Architecture (ADR-002)**: Rather than deploying a complex black-box Deep Neural Network that is prone to catastrophic forgetting and hard to interpret, HealConnect separates clinical acute deterioration (`RandomForestClassifier`) from disease screening (`GradientBoostingClassifier`). This allows fast CPU inference (< 15ms) and full game-theoretic tree explainability via SHAP.
4. **Flower Framework for Privacy-Preserving Federated Learning (ADR-003)**: Hospital data privacy laws forbid centralizing raw patient vitals. Adopting Flower (`flwr.client.NumPyClient`) enables edge hospital nodes to train local scikit-learn model parameters locally and exchange only aggregated weight matrices ($\mathbf{W}, B$) via weighted `FedAvg`.
