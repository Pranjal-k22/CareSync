# 08 — MQTT Topic Hierarchy Architecture

> **Path:** `architecture-project/08-mqtt-topic-hierarchy.md`  
> **Status:** Implemented Topic Taxonomy  

```mermaid
flowchart TD
    Root["healconnect (Root Namespace)"]
    
    Hospital["{hospital_id} (Hospital Node Identifier)"]
    Root --> Hospital

    Device["{device_id} (IoT Hardware Identifier)"]
    Hospital --> Device

    VitalsTopic["vitals (Heart Rate, SpO2, Temperature JSON Payload)"]
    ECGTopic["ecg (Lead-II ECG Waveform Signal Array Payload)"]
    StatusTopic["status (Online / Offline LWT Device State)"]

    Device --> VitalsTopic
    Device --> ECGTopic
    Device --> StatusTopic
```

## Topic Wildcard Resolution Examples
* **Single-level Wildcard Subscription (`caresync/HOSP_01/+/vitals`):** Subscribes to vital sign updates from *all* devices assigned to `HOSP_01`.
* **Multi-level Wildcard Subscription (`caresync/#`):** Subscribes to all telemetry, ECG, and status topics across all hospital nodes.
