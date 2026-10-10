#include "secrets.h"

#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <Wire.h>

#include "MAX30105.h"
#include "spo2_algorithm.h"

#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#include "Network.h"

// Configuration Flags for Transitional Coexistence
#define MQTT_ENABLED 1
#define LEGACY_BLYNK_ENABLED 1
#define LEGACY_FIREBASE_ENABLED 1

char ssid[] = WIFI_SSID;
char pass[] = WIFI_PASSWORD;

Network networkManager;

BlynkTimer timer;
MAX30105 particleSensor;

// MAX30102 Buffers
#define BUFFER_SIZE 100

uint32_t irBuffer[BUFFER_SIZE];
uint32_t redBuffer[BUFFER_SIZE];

int32_t spo2;
int8_t validSPO2;

int32_t heartRate;
int8_t validHeartRate;

float BPM = 0;
float SpO2 = 0;
bool fingerDetected = false;

// DHT22
#define DHTPIN D5
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

float roomTemp = 0.0;
float humidity = 0.0;

// DS18B20
#define ONE_WIRE_BUS D6

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

float bodyTemp = 0.0;

// Non-blocking Timer Scheduling
unsigned long lastPublishTime = 0;
const unsigned long PUBLISH_INTERVAL = 2000; // 2 seconds

// Send data to Blynk
void sendToBlynk() {
#if LEGACY_BLYNK_ENABLED
  Blynk.virtualWrite(V0, BPM);
  Blynk.virtualWrite(V1, SpO2);
  Blynk.virtualWrite(V2, bodyTemp);
  Blynk.virtualWrite(V3, roomTemp);
  Blynk.virtualWrite(V4, humidity);
#endif
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n[HealConnect] ESP8266 NodeMCU Telemetry Unit Booting...");

  Wire.begin(D2, D1);

  // Initialize Non-blocking Network Manager
  networkManager.initWiFi();
#if MQTT_ENABLED
  networkManager.initMQTT();
#endif

  // Start Blynk if enabled
#if LEGACY_BLYNK_ENABLED
  Blynk.config(BLYNK_AUTH_TOKEN);
#endif

  // MAX30102 setup
  if (!particleSensor.begin(Wire)) {
    Serial.println("[ERROR] MAX30102 Pulse Oximeter not found!");
  } else {
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
    Serial.println("[MAX30102] Pulse Oximeter Initialized");
  }

  // DHT22 start
  dht.begin();
  Serial.println("[DHT22] Room Temp/Humidity Sensor Initialized");

  // DS18B20 start
  sensors.begin();
  Serial.println("[DS18B20] Body Temperature Sensor Initialized");

  // Legacy Blynk timer
#if LEGACY_BLYNK_ENABLED
  timer.setInterval(2000L, sendToBlynk);
#endif

  Serial.println("[HealConnect] Setup Completed cleanly.");
}

void loop() {
  // Maintain non-blocking network stack loops
  networkManager.maintainWiFi();
#if MQTT_ENABLED
  networkManager.maintainMQTT();
#endif

#if LEGACY_BLYNK_ENABLED
  if (WiFi.status() == WL_CONNECTED) {
    Blynk.run();
    timer.run();
  }
#endif

  // Non-blocking 2-second sensor acquisition & telemetry publish
  unsigned long currentMillis = millis();
  if (currentMillis - lastPublishTime >= PUBLISH_INTERVAL) {
    lastPublishTime = currentMillis;

    // Read DHT22
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t)) roomTemp = t;
    if (!isnan(h)) humidity = h;

    // Read DS18B20
    sensors.requestTemperatures();
    float bTemp = sensors.getTempCByIndex(0);
    if (bTemp > -55.0 && bTemp < 85.0) bodyTemp = bTemp;

    // Read MAX30102 Buffer
    for (byte i = 0; i < BUFFER_SIZE; i++) {
      if (particleSensor.available()) {
        redBuffer[i] = particleSensor.getRed();
        irBuffer[i] = particleSensor.getIR();
        particleSensor.nextSample();
      }
    }

    // Finger detection logic (IR > 50000)
    fingerDetected = (irBuffer[0] > 50000);

    // Calculate Maxim SpO2 and Heart Rate
    maxim_heart_rate_and_oxygen_saturation(
        irBuffer,
        BUFFER_SIZE,
        redBuffer,
        &spo2,
        &validSPO2,
        &heartRate,
        &validHeartRate);

    if (validHeartRate && heartRate > 30 && heartRate < 220) {
      BPM = (float)heartRate;
    }
    if (validSPO2 && spo2 >= 70 && spo2 <= 100) {
      SpO2 = (float)spo2;
    }

    // Print Serial Telemetry Log
    Serial.printf("[SENSOR] BPM:%.1f SpO2:%.1f%% BodyTemp:%.1fC RoomTemp:%.1fC Humid:%.1f%% Finger:%s\n",
                  BPM, SpO2, bodyTemp, roomTemp, humidity, fingerDetected ? "YES" : "NO");

    // Publish to MQTT Broker
#if MQTT_ENABLED
    networkManager.publishVitals(BPM, SpO2, bodyTemp, roomTemp, humidity, fingerDetected);
#endif

    // Optional Legacy Firebase Update
#if LEGACY_FIREBASE_ENABLED
    networkManager.firestoreDataUpdate(BPM, (int)BPM, (int)SpO2, bodyTemp, fingerDetected);
#endif
  }
}
