#include "Network.h"
#include "addons/TokenHelper.h"

#ifndef FIREBASE_API_KEY
#define FIREBASE_API_KEY "replace-with-firebase-api-key"
#endif
#ifndef FIREBASE_PROJECT_ID
#define FIREBASE_PROJECT_ID "replace-with-firebase-project-id"
#endif
#ifndef FIREBASE_USER_EMAIL
#define FIREBASE_USER_EMAIL "replace-with-firebase-user-email"
#endif
#ifndef FIREBASE_USER_PASSWORD
#define FIREBASE_USER_PASSWORD "replace-with-firebase-user-password"
#endif

static Network *instance = NULL;

Network::Network() : mqttClient(wifiClient) {
  lastWiFiRetry = 0;
  wifiBackoffInterval = 1000;
  lastMQTTRetry = 0;
  mqttBackoffInterval = 1000;
  sequenceNumber = 0;
  callBackEvent = NULL;
}

Network::Network(FuncPtrInt f) : mqttClient(wifiClient) {
  instance = this;
  callBackEvent = f;
  lastWiFiRetry = 0;
  wifiBackoffInterval = 1000;
  lastMQTTRetry = 0;
  mqttBackoffInterval = 1000;
  sequenceNumber = 0;
}

void Network::initWiFi() {
  WiFi.disconnect();
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[WiFi] Connecting to ");
  Serial.println(WIFI_SSID);
}

void Network::maintainWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    if (wifiBackoffInterval != 1000) {
      wifiBackoffInterval = 1000; // Reset backoff
      Serial.print("[WiFi] Connected! IP: ");
      Serial.println(WiFi.localIP());
      setupNTP();
      if (callBackEvent) callBackEvent(NET_STATE_WIFI_CONNECTED);
    }
    return;
  }

  unsigned long now = millis();
  if (now - lastWiFiRetry >= wifiBackoffInterval) {
    lastWiFiRetry = now;
    Serial.println("[WiFi] Reconnecting...");
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    wifiBackoffInterval = min(wifiBackoffInterval * 2, 30000UL); // Exponential backoff max 30s
    if (callBackEvent) callBackEvent(NET_STATE_WIFI_DISCONNECTED);
  }
}

void Network::setupNTP() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.println("[NTP] Time sync requested from pool.ntp.org");
}

String Network::getISOTimestamp() {
  time_t now = time(nullptr);
  struct tm timeinfo;
  if (gmtime_r(&now, &timeinfo) && now > 100000) {
    char buf[32];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    return String(buf);
  }
  return String(""); // Return empty string if NTP uninitialized
}

uint32_t Network::getNextSequence() {
  return sequenceNumber++;
}

void Network::initMQTT() {
  mqttClient.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
  mqttClient.setBufferSize(512); // Stage 3 buffer requirement
  mqttClient.setKeepAlive(60);
  Serial.printf("[MQTT] Initialized target %s:%d\n", MQTT_BROKER_HOST, MQTT_BROKER_PORT);
}

void Network::maintainMQTT() {
  if (WiFi.status() != WL_CONNECTED) return;

  if (mqttClient.connected()) {
    mqttClient.loop();
    return;
  }

  unsigned long now = millis();
  if (now - lastMQTTRetry < mqttBackoffInterval) return;

  lastMQTTRetry = now;
  Serial.printf("[MQTT] Connecting broker %s:%d...\n", MQTT_BROKER_HOST, MQTT_BROKER_PORT);

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
    mqttBackoffInterval = 1000; // Reset backoff
    if (callBackEvent) callBackEvent(NET_STATE_MQTT_CONNECTED);

    // Publish Online Status with Retain = true
    publishStatus("online", NULL);
  } else {
    Serial.printf("[MQTT] Connect failed, state=%d\n", mqttClient.state());
    mqttBackoffInterval = min(mqttBackoffInterval * 2, 30000UL); // Exponential backoff max 30s
    if (callBackEvent) callBackEvent(NET_STATE_MQTT_DISCONNECTED);
  }
}

bool Network::publishVitals(float bpm, float spo2, float bodyTemp, float roomTemp, float humidity, bool finger) {
  if (!mqttClient.connected()) return false;

  String isoTime = getISOTimestamp();
  uint32_t seq = getNextSequence();

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
    "\"spo2\":\"%\","
    "\"body_temp\":\"celsius\","
    "\"room_temp\":\"celsius\","
    "\"humidity\":\"%\""
    "}"
    "}",
    MQTT_DEVICE_ID,
    MQTT_PATIENT_ID,
    isoTime.c_str(),
    seq,
    bpm,
    spo2,
    bodyTemp,
    roomTemp,
    humidity,
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

bool Network::publishStatus(const char* statusStr, const char* reason) {
  if (!mqttClient.connected()) return false;

  String topic = String("caresync/") + MQTT_HOSPITAL_ID + "/" + MQTT_DEVICE_ID + "/status";

  String payload = "{";
  payload += "\"version\":\"1.0\",";
  payload += "\"device_id\":\"" + String(MQTT_DEVICE_ID) + "\",";
  payload += "\"status\":\"" + String(statusStr) + "\",";
  if (reason) {
    payload += "\"reason\":\"" + String(reason) + "\",";
  }
  payload += "\"ip_address\":\"" + WiFi.localIP().toString() + "\",";
  payload += "\"uptime_seconds\":" + String(millis() / 1000) + ",";
  payload += "\"free_heap\":" + String(ESP.getFreeHeap()) + ",";
  payload += "\"wifi_rssi\":" + String(WiFi.RSSI()) + ",";
  payload += "\"timestamp\":\"" + getISOTimestamp() + "\"";
  payload += "}";

  return mqttClient.publish(topic.c_str(), (const uint8_t*)payload.c_str(), payload.length(), true); // Retain = true
}

bool Network::publishAlert(const char* alertType, const char* severity, const char* param, float triggerVal, float thresholdVal, const char* msg) {
  if (!mqttClient.connected()) return false;

  String topic = String("caresync/") + MQTT_HOSPITAL_ID + "/" + MQTT_DEVICE_ID + "/alerts";

  String payload = "{";
  payload += "\"version\":\"1.0\",";
  payload += "\"device_id\":\"" + String(MQTT_DEVICE_ID) + "\",";
  payload += "\"patient_id\":\"" + String(MQTT_PATIENT_ID) + "\",";
  payload += "\"timestamp\":\"" + getISOTimestamp() + "\",";
  payload += "\"alert_type\":\"" + String(alertType) + "\",";
  payload += "\"severity\":\"" + String(severity) + "\",";
  payload += "\"trigger_param\":\"" + String(param) + "\",";
  payload += "\"trigger_value\":" + String(triggerVal, 1) + ",";
  payload += "\"threshold_value\":" + String(thresholdVal, 1) + ",";
  payload += "\"message\":\"" + String(msg) + "\"";
  payload += "}";

  return mqttClient.publish(topic.c_str(), (const uint8_t*)payload.c_str(), payload.length(), false);
}

void Network::firebaseInit() {
  config.api_key = FIREBASE_API_KEY;
  auth.user.email = FIREBASE_USER_EMAIL;
  auth.user.password = FIREBASE_USER_PASSWORD;
  Firebase.begin(&config, &auth);
}

void Network::firestoreDataUpdate(float beatsPerMinute, int beatAvg, int oxygen, float temp, bool finger) {
  if (WiFi.status() == WL_CONNECTED && Firebase.ready()) {
    String documentPath = "devices/0001";
    FirebaseJson content;
    content.set("fields/status/booleanValue", true);
    content.set("fields/beatsPerMinute/doubleValue", String(beatsPerMinute).c_str());
    content.set("fields/beatAvg/doubleValue", String(beatAvg).c_str());
    content.set("fields/oxygen/doubleValue", String(oxygen).c_str());
    content.set("fields/temp/doubleValue", String(temp).c_str());
    content.set("fields/finger/booleanValue", finger);

    Firebase.Firestore.patchDocument(&fbdo, FIREBASE_PROJECT_ID, "", documentPath.c_str(), content.raw(), "status,beatsPerMinute,beatAvg,oxygen,temp,finger");
  }
}
