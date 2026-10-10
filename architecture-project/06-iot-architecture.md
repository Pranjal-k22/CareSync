# 06 — IoT Edge Architecture

> **Path:** `architecture-project/06-iot-architecture.md`  
> **Status:** Firmware Implemented / PHYSICAL HARDWARE: NOT VERIFIED  

```mermaid
flowchart LR
    subgraph Physical_Sensors["Physiological Sensors"]
        MAX["MAX30102 Pulse Oximeter (I2C SDA/SCL)"]
        DHT["DHT22 Temperature Sensor (Digital Pin D2)"]
        AD["Simulated ECG Waveform Stream [SIMULATED]"]
    end

    subgraph Edge_Microcontroller["ESP8266 NodeMCU v1.0 / ESP-12E"]
        Firmware["CareSync_Kit_ESP8266_Code.ino"]
        WiFi["ESP8266WiFi.h (802.11 b/g/n)"]
        MQTTClient["PubSubClient.h (MQTT Client)"]
        
        Firmware --> WiFi
        Firmware --> MQTTClient
    end

    subgraph Broker_Destination["Network Transport"]
        Broker["Mosquitto MQTT Broker (Port 1883)"]
    end

    MAX & DHT & AD --> Firmware
    MQTTClient -->|Publish: JSON Payload| Broker
```

## Sensor Hardware Inventory

| Sensor Name | Parameter | Hardware Interface | GPIO Pin | Status |
| :--- | :--- | :--- | :--- | :--- |
| **MAX30102** | Heart Rate & SpO2 | I2C (`Wire.h`) | SDA (D2), SCL (D1) | Firmware Implemented (`Hardware Unverified`) |
| **DHT22 / DS18B20** | Body Temperature | Digital Single-Bus | GPIO 4 (D2) | Firmware Implemented (`Hardware Unverified`) |
| **ECG Stream** | Single-Lead ECG | Telemetry API | N/A | **SIMULATED** |
