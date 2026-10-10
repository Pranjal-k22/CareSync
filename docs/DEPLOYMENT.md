# 🚢 CareSync — Production Deployment Guide

## 1. Production Architecture Overview

The production environment deploys CareSync as decoupled services:

```text
               +----------------------------------+
               |  Reverse Proxy / Load Balancer   |
               |       (Nginx / Cloudflare)       |
               +----------------+-----------------+
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
+---------------+       +---------------+       +---------------+
| Next.js App   |       | FastAPI App   |       | Mosquitto MQTT|
| Port 3000     |       | Port 8000     |       | Port 1883/8883|
| (Frontend UI) |       | (Backend API) |       | (MQTT Broker) |
+---------------+       +-------+-------+       +---------------+
                                |
                                v
                       +----------------+
                       | Supabase PG DB |
                       | (PostgreSQL)   |
                       +----------------+
```

---

## 2. Server Deployment Commands

### A. Mosquitto MQTT Message Broker
Deploy the Mosquitto MQTT Broker using Docker Compose or native daemon:

```bash
# Docker Compose start Mosquitto broker
docker-compose up -d mosquitto

# Verify MQTT listener port 1883
mosquitto_sub -h 127.0.0.1 -p 1883 -u ingest_service_dev -P ingest_password_789! -t "healconnect/#" -v
```

### B. FastAPI Backend & Ingestion Service
Deploy the ASGI FastAPI server and MQTT Ingestion Service:

> **Important Deployment Constraint**: Due to the process-local in-memory SSE broadcaster (`_telemetry_subscribers`), run a **single worker process** (`--workers 1`) per instance until a shared event bus (such as Redis Pub/Sub) is connected.

```bash
# Single worker ASGI server execution
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 1 --log-level info
```

### C. Next.js Frontend Server
Build and serve the production Next.js bundle:

```bash
# 1. Build production static bundle using Webpack engine
npx next build --webpack

# 2. Start Next.js production server
npm run start -- -p 3000
```

---

## 3. Production Health Monitoring & Verification

Automated health monitoring probes should poll `GET http://localhost:8000/`:

- **Interval**: 30 seconds
- **Timeout**: 5 seconds
- **Expected HTTP Code**: `200 OK`
- **Expected Payload Key**: `"status": "healthy"`

---

## 4. Rollback Procedure

If a deployment failure occurs:
1. Revert Git repository HEAD: `git reset --hard <last-stable-commit>`
2. Re-train or copy previous `.joblib` model artifacts from `ml/artifacts/`.
3. Re-run test verification: `python -m pytest backend/tests/` and `python scratch/test_stage8_reliability.py`.
4. Restart Mosquitto broker, ASGI backend server, and Next.js frontend app.

