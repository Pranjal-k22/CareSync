# 🛠️ HealConnect — Configuration & Environment Reference

This document describes all environment variables and configuration settings used across HealConnect backend, frontend, and supporting microservices.

---

## 🔑 Environment Variables Reference

| Variable Name | Purpose | Required | Example / Default | Where Used |
| :--- | :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Defines deployment environment mode (`development`, `production`, `test`) | Yes | `development` | `backend/app/config.py` |
| `DEBUG` | Enables verbose debug logging | No | `False` | `backend/app/config.py` |
| `ALLOW_INSECURE_DEMO_ADMIN` | Enables instant guest/demo login bypass for development | No | `true` | `backend/main.py` |
| `JWT_SECRET_KEY` | Secret key used to sign and verify PyJWT authorization tokens | Yes | `<your-long-random-secret>` | `backend/main.py`, `backend/app/config.py` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS HTTP origins | Yes | `http://localhost:3000,http://127.0.0.1:3000` | `backend/main.py` |
| `DATABASE_URL` | PostgreSQL connection URL string | Optional | `postgresql://postgres:postgres@localhost:5432/healconnect` | `backend/app/config.py` |
| `SUPABASE_URL` | Supabase project API gateway endpoint URL | Yes | `https://your-project.supabase.co` | `.env.local`, `backend/app/config.py` |
| `SUPABASE_KEY` | Supabase anonymous client API key | Yes | `<your-supabase-anon-key>` | `lib/supabaseClient.js` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin service role key for RLS bypass | Yes | `<your-supabase-service-role-key>` | `.env.local`, `backend/app/config.py` |
| `MQTT_BROKER_HOST` | Mosquitto MQTT Broker hostname/IP address | Optional | `127.0.0.1` | `backend/app/services/mqtt_ingestion_service.py` |
| `MQTT_BROKER_PORT` | Mosquitto MQTT Broker TCP port (1883 dev / 8883 TLS) | Optional | `1883` | `backend/app/services/mqtt_ingestion_service.py` |
| `MQTT_USERNAME` | Backend MQTT Ingestion service username | Optional | `ingest_service_dev` | `backend/app/services/mqtt_ingestion_service.py` |
| `MQTT_PASSWORD` | Backend MQTT Ingestion service password | Optional | `ingest_password_789!` | `backend/app/services/mqtt_ingestion_service.py` |
| `MQTT_CLIENT_ID` | Backend MQTT Ingestion service client identifier | Optional | `healconnect-backend-ingest` | `backend/app/services/mqtt_ingestion_service.py` |
| `MODEL_PATH` | Path to active deterioration `.joblib` model pipeline | Optional | `backend/models/risk_model.joblib` | `backend/app/config.py`, `predict.py` |
| `DETERIORATION_MODEL_PATH` | Path to registry deterioration model pipeline | Optional | `backend/models/registry/deterioration/v1/model.joblib` | `backend/app/config.py` |
| `DISEASE_MODEL_PATH` | Path to active disease/flu `.joblib` model pipeline | Optional | `backend/models/disease_model.joblib` | `backend/app/config.py`, `predict_disease.py` |
| `GEMINI_API_KEY` | Google Gemini 2.5 Flash API key for OCR digital prescription extraction | Optional | `<your-gemini-api-key>` | `.env.local`, `pages/prescriptions.jsx` |

---

## 📁 Model Registry Configuration (`backend/models/registry/registry_config.json`)

```json
{
  "registry_version": "v1.0-PRODUCTION",
  "registered_models": {
    "deterioration": {
      "active_version": "v1",
      "metadata_file": "backend/models/registry/deterioration/v1/metadata.json"
    },
    "disease": {
      "active_version": "flu_v1",
      "metadata_file": "backend/models/registry/disease/flu_v1/metadata.json"
    }
  }
}
```

> **Note**: Metadata paths in `registry_config.json` and `metadata.json` use relative paths relative to repository root (`ROOT.parent`), allowing the codebase to run seamlessly across Windows, Linux, and macOS without hardcoded user directory issues.
