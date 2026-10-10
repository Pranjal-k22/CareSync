#include "secrets.h"

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <time.h>

#include "MAX30105.h"
#include "spo2_algorithm.h"
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Sensor Pin Definitions
#define DHTPIN D5
#define DHTTYPE DHT22
#define ONE_WIRE_BUS D6
#define BUFFER_SIZE 100

// Objects & Handles
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
MAX30105 particleSensor;
DHT dht(DHTPIN, DHTTYPE);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// MAX30102 Raw Samples & Calculated Vitals
uint32_t irBuffer[BUFFER_SIZE];
uint32_t redBuffer[BUFFER_SIZE];
int32_t spo2;
int8_t validSPO2;
int32_t heartRate;
int8_t validHeartRate;

float BPM = 0;
float SpO2 = 0;
float bodyTemp = 0.0;
float roomTemp = 0.0;
float humidity = 0.0;
bool fingerDetected = false;
bool max30102Available = false;

// Non-blocking Timer Scheduling & Backoff
unsigned long lastPublishTime = 0;
const unsigned long PUBLISH_INTERVAL = 2000; // 2-second publishing interval
uint32_t sequenceNumber = 1001;

unsigned long lastWiFiRetry = 0;
unsigned long wifiBackoffInterval = 1000;
unsigned long lastMQTTRetry = 0;
unsigned long mqttBackoffInterval = 1000;

void setupNTP() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.println("[NTP] Time sync requested from pool.ntp.org");
}

String getISOTimestamp() {
  time_t now = time(nullptr);
  struct tm timeinfo;
  if (gmtime_r(&now, &timeinfo) && now > 100000) {
    char buf[32];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    return String(buf);
  }
  return String("2026-09-27T21:00:00Z");
}

void initWiFi() {
  WiFi.disconnect();
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[WiFi] Connecting to ");
  Serial.println(WIFI_SSID);
}

void maintainWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    if (wifiBackoffInterval != 1000) {
      wifiBackoffInterval = 1000;
      Serial.print("[WiFi] Connected! IP: ");
      Serial.println(WiFi.localIP());
      setupNTP();
    }
    return;
  }

  unsigned long now = millis();
  if (now - lastWiFiRetry >= wifiBackoffInterval) {
    lastWiFiRetry = now;
    Serial.println("[WiFi] Reconnecting...");
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    wifiBackoffInterval = min(wifiBackoffInterval * 2, 30000UL);
  }
}

void maintainMQTT() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (mqttClient.connected()) {
    mqttClient.loop();
    return;
  }

  unsigned long now = millis();
  if (now - lastMQTTRetry < mqttBackoffInterval) return;

  lastMQTTRetry = now;
  Serial.printf("[MQTT] Connecting to broker %s:%d...\n", MQTT_BROKER_HOST, MQTT_BROKER_PORT);

  String statusTopic = String("caresync/") + MQTT_HOSPITAL_ID + "/" + MQTT_DEVICE_ID + "/status";

  String lwtPayload = "{";
  lwtPayload += "\"version\":\"1.0\",";
  lwtPayload += "\"device_id\":\"" + String(MQTT_DEVICE_ID) + "\",";
  lwtPayload += "\"status\":\"offline\",";
  lwtPayload += "\"reason\":\"unexpected_disconnect\",";
  lwtPayload += "\"timestamp\":\"" + getISOTimestamp() + "\"";
  lwtPayload += "}";

  if (mqttClient.connect(MQTT_DEVICE_ID, MQTT_USERNAME, MQTT_PASSWORD, statusTopic.c_str(), 1, true, lwtPayload.c_str())) {
    Serial.println("[MQTT] Connected successfully!");
    mqttBackoffInterval = 1000;

    // Publish Retained Online Status
    String onlinePayload = "{";
    onlinePayload += "\"version\":\"1.0\",";
    onlinePayload += "\"device_id\":\"" + String(MQTT_DEVICE_ID) + "\",";
    onlinePayload += "\"status\":\"online\",";
    onlinePayload += "\"timestamp\":\"" + getISOTimestamp() + "\"";
    onlinePayload += "}";
    mqttClient.publish(statusTopic.c_str(), onlinePayload.c_str(), true);
  } else {
    Serial.printf("[MQTT] Connection failed, state=%d\n", mqttClient.state());
    mqttBackoffInterval = min(mqttBackoffInterval * 2, 30000UL);
  }
}

bool publishVitals(float bpm, float spo2_val, float bTemp, float rTemp, float hum, bool finger) {
  if (!mqttClient.connected()) return false;

  String isoTime = getISOTimestamp();
  uint32_t seq = sequenceNumber++;

  char topic[128];
  snprintf(topic, sizeof(topic), "caresync/%s/%s/vitals", MQTT_HOSPITAL_ID, MQTT_DEVICE_ID);

  char payload[512];
  int len = snprintf(payload, sizeof(payload),
    "{\"version\":\"1.0\","
    "\"device_id\":\"%s\","
    "\"patient_id\":\"%s\","
    "\"timestamp\":\"%s\","
    "\"seq\":%u,"
    "\"source\":\"esp8266_hardware\","
    "\"heart_rate\":%.1f,"
    "\"spo2\":%.1f,"
    "\"temperature\":%.1f,"
    "\"vitals\":{"
    "\"heart_rate\":%.1f,"
    "\"spo2\":%.1f,"
    "\"body_temp\":%.1f,"
    "\"room_temp\":%.1f,"
    "\"humidity\":%.1f,"
    "\"finger_detected\":%s"
    "},"
    "\"units\":{"
    "\"heart_rate\":\"bpm\","
    "\"spo2\":\"%%\","
    "\"body_temp\":\"celsius\","
    "\"room_temp\":\"celsius\","
    "\"humidity\":\"%%\""
    "}"
    "}",
    MQTT_DEVICE_ID,
    MQTT_PATIENT_ID,
    isoTime.c_str(),
    seq,
    bpm,
    spo2_val,
    bTemp,
    bpm,
    spo2_val,
    bTemp,
    rTemp,
    hum,
    finger ? "true" : "false"
  );

  if (len < 0 || len >= (int)sizeof(payload)) {
    Serial.println("[MQTT] Payload buffer overflow!");
    return false;
  }

  bool success = mqttClient.publish(topic, (const uint8_t*)payload, len, false);
  if (success) {
    Serial.printf("[MQTT] Vitals Published (seq=%u, len=%d)\n", seq, len);
  } else {
    Serial.println("[MQTT] Vitals Publish Failed!");
  }
  return success;
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n[HealConnect] ESP8266 MQTT Client Unit Booting...");

  Wire.begin(D2, D1);

  initWiFi();
  mqttClient.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
  mqttClient.setBufferSize(512);
  mqttClient.setKeepAlive(60);

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("[MAX30102] ERROR: Pulse Oximeter not found");
    max30102Available = false;
  } else {
    // Configure MAX30102 with recommended settings: 0x1F (6.4mA) LED power, 4x sample avg, Red+IR, 200Hz rate
    particleSensor.setup(0x1F, 4, 2, 200, 411, 4096);
    particleSensor.setPulseAmplitudeRed(0x1F);
    particleSensor.setPulseAmplitudeIR(0x1F);
    particleSensor.setPulseAmplitudeGreen(0);
    max30102Available = true;
    Serial.println("[MAX30102] Pulse Oximeter Initialized");
  }

  dht.begin();
  Serial.println("[DHT22] Room Temp/Humidity Sensor Initialized");

  sensors.begin();
  int dsDeviceCount = sensors.getDeviceCount();
  Serial.printf("[DS18B20] Devices found: %d\n", dsDeviceCount);
  if (dsDeviceCount == 0) {
    Serial.println("[DS18B20] ERROR: No sensor detected on D6");
  } else {
    Serial.println("[DS18B20] Body Temperature Sensor Initialized");
  }

  Serial.println("[HealConnect] Setup Completed.");
}

void loop() {
  maintainWiFi();
  maintainMQTT();

  unsigned long currentMillis = millis();
  if (currentMillis - lastPublishTime >= PUBLISH_INTERVAL) {
    lastPublishTime = currentMillis;

    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t)) roomTemp = t;
    if (!isnan(h)) humidity = h;

    sensors.requestTemperatures();
    float bTemp = sensors.getTempCByIndex(0);
    Serial.printf("[DS18B20] Raw Temperature: %.1f C\n", bTemp);

    if (bTemp == DEVICE_DISCONNECTED_C || bTemp <= -55.0) {
      Serial.println("[DS18B20] ERROR: Sensor disconnected / read failed");
      bodyTemp = 0.0;
    } else {
      bodyTemp = bTemp;
    }

    uint32_t minIR = 0xFFFFFFFF;
    uint32_t maxIR = 0;
    uint64_t sumIR = 0;

    if (max30102Available) {
      // Collect 100 continuous samples from MAX30102 FIFO
      for (byte i = 0; i < BUFFER_SIZE; i++) {
        unsigned long sampleTimeout = millis();
        while (particleSensor.available() == false) {
          particleSensor.check();
          if (millis() - sampleTimeout > 50) break;
        }
        redBuffer[i] = particleSensor.getRed();
        irBuffer[i] = particleSensor.getIR();
        particleSensor.nextSample();

        if (irBuffer[i] < minIR) minIR = irBuffer[i];
        if (irBuffer[i] > maxIR) maxIR = irBuffer[i];
        sumIR += irBuffer[i];
      }
    } else {
      minIR = 0;
      maxIR = 0;
      sumIR = 0;
      for (byte i = 0; i < BUFFER_SIZE; i++) {
        redBuffer[i] = 0;
        irBuffer[i] = 0;
      }
    }

    if (minIR == 0xFFFFFFFF) minIR = 0;
    uint32_t avgIR = max30102Available ? (uint32_t)(sumIR / BUFFER_SIZE) : 0;

    fingerDetected = max30102Available && (maxIR > 50000);

    Serial.printf("[MAX30102] IR Min: %u\n", minIR);
    Serial.printf("[MAX30102] IR Max: %u\n", maxIR);
    Serial.printf("[MAX30102] IR Avg: %u\n", avgIR);
    Serial.printf("[MAX30102] Finger: %s\n", fingerDetected ? "YES" : "NO");

    if (max30102Available && fingerDetected) {
      maxim_heart_rate_and_oxygen_saturation(
          irBuffer,
          BUFFER_SIZE,
          redBuffer,
          &spo2,
          &validSPO2,
          &heartRate,
          &validHeartRate);

      if (validHeartRate && heartRate >= 40 && heartRate <= 200) {
        BPM = (float)heartRate;
      } else {
        BPM = 0.0;
      }

      if (validSPO2 && spo2 >= 70 && spo2 <= 100) {
        SpO2 = (float)spo2;
      } else {
        SpO2 = 0.0;
      }
    } else {
      BPM = 0.0;
      SpO2 = 0.0;
      fingerDetected = false;
    }

    Serial.printf("[SENSOR] BPM:%.1f SpO2:%.1f%% BodyTemp:%.1fC RoomTemp:%.1fC Humid:%.1f%% Finger:%s\n",
                  BPM, SpO2, bodyTemp, roomTemp, humidity, fingerDetected ? "YES" : "NO");

    publishVitals(BPM, SpO2, bodyTemp, roomTemp, humidity, fingerDetected);
  }
}
