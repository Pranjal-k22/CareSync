#ifndef Network_H_
#define Network_H_

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <time.h>
#include <Firebase_ESP_Client.h>

#include "secrets.h"

typedef enum {
  NET_STATE_WIFI_CONNECTED,
  NET_STATE_WIFI_DISCONNECTED,
  NET_STATE_FIREBASE_CONNECTED,
  NET_STATE_FIREBASE_DISCONNECTED,
  NET_STATE_MQTT_CONNECTED,
  NET_STATE_MQTT_DISCONNECTED
} Network_State_t;

class Network {
private:
  WiFiClient wifiClient;
  PubSubClient mqttClient;

  // Legacy Firebase handles
  FirebaseData fbdo;
  FirebaseAuth auth;
  FirebaseConfig config;

  typedef void (*FuncPtrInt)(Network_State_t);

  unsigned long lastWiFiRetry;
  unsigned long wifiBackoffInterval;

  unsigned long lastMQTTRetry;
  unsigned long mqttBackoffInterval;

  uint32_t sequenceNumber;

  void firebaseInit();
  void setupNTP();

public:
  FuncPtrInt callBackEvent;

  Network();
  Network(FuncPtrInt f);

  void initWiFi();
  void initMQTT();
  void maintainWiFi();
  void maintainMQTT();

  String getISOTimestamp();
  uint32_t getNextSequence();

  bool publishVitals(float bpm, float spo2, float bodyTemp, float roomTemp, float humidity, bool finger);
  bool publishStatus(const char* statusStr, const char* reason = NULL);
  bool publishAlert(const char* alertType, const char* severity, const char* param, float triggerVal, float thresholdVal, const char* msg);

  void firestoreDataUpdate(float beatsPerMinute, int beatAvg, int oxygen, float temp, bool finger);
};

#endif
