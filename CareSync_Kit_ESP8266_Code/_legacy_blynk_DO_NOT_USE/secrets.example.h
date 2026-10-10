// Copy this file to secrets.h and replace every placeholder locally.
// Do not commit secrets.h. Rotate any values that were previously committed.
#ifndef SECRETS_H_
#define SECRETS_H_

#define BLYNK_TEMPLATE_ID "replace-with-template-id"
#define BLYNK_TEMPLATE_NAME "replace-with-template-name"
#define BLYNK_AUTH_TOKEN "replace-with-blynk-token"

#define WIFI_SSID "replace-with-wifi-name"
#define WIFI_PASSWORD "replace-with-wifi-password"

// Legacy Firebase Configuration (Stage 9B/9C Fallback)
#define FIREBASE_API_KEY "replace-with-firebase-api-key"
#define FIREBASE_PROJECT_ID "replace-with-firebase-project-id"
#define FIREBASE_USER_EMAIL "replace-with-firebase-user-email"
#define FIREBASE_USER_PASSWORD "replace-with-firebase-user-password"

// MQTT IoTConnect Configuration (Stage 4)
#define MQTT_BROKER_HOST "127.0.0.1"
#define MQTT_BROKER_PORT 1883
#define MQTT_USERNAME "replace-with-mqtt-username"
#define MQTT_PASSWORD "replace-with-mqtt-password"
#define MQTT_HOSPITAL_ID "hosp-001"
#define MQTT_DEVICE_ID "node-9901"
#define MQTT_PATIENT_ID "PAT-1001"

#endif
