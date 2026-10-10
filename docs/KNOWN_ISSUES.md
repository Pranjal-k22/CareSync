# ⚠️ CareSync — Known Technical Issues & Workarounds

This document tracks known technical limitations, edge cases, and temporary workarounds in the current CareSync codebase.

---

## Active Tracked Issues

### 1. Gemini OCR API Key Dependency
- **Issue**: Google Gemini 2.5 Flash API calls in `prescriptions.jsx` for automated OCR prescription extraction fail if `GEMINI_API_KEY` is blank in `.env.local`.
- **Impact**: Automatic digital extraction from uploaded prescription image files is unavailable; manual form entry remains functional.
- **Affected Components**: `pages/prescriptions.jsx`, `@google/generative-ai`.
- **Current Workaround**: Manual prescription entry form can be filled directly without triggering OCR.
- **Possible Solution**: Add client-side validation check displaying a friendly UI notice if `GEMINI_API_KEY` is not set.
- **Priority**: Low
- **Status**: Tracked

---

### 2. ESP8266 WiFi Reconnection Latency
- **Issue**: If the ESP8266 NodeMCU hardware loses WiFi connection to the local network router, sensor sampling pauses for up to 5 seconds during reconnection retries.
- **Impact**: Brief 5-second gap in live WebSocket telemetry waveform stream.
- **Affected Components**: `HealthConnect_Kit_ESP8266_Code/`, WebSocket Telemetry Station.
- **Current Workaround**: Frontend `TelemetryStation.jsx` uses local rolling buffer interpolation to preserve smooth ECG waveform rendering during temporary transport gaps.
- **Priority**: Low
- **Status**: Tracked

---

### 3. Pytest Deprecation Warnings for Pydantic & Supabase
- **Issue**: Running `pytest backend/tests/` outputs 14 non-fatal `DeprecationWarning` logs related to Pydantic V2 migration and Supabase HTTP client configuration.
- **Impact**: None (all 27 tests pass 100%).
- **Affected Components**: `backend/main.py`, `backend/app/predict.py`.
- **Possible Solution**: Update remaining legacy `Field(..., example=...)` usages to `json_schema_extra` in next maintenance release.
- **Priority**: Low
- **Status**: Tracked

---

### 4. `npm run build` Next.js 16 Turbopack PostCSS Loader Failure
- **Issue**: Standard `npm run build` (`next build`) in Next.js 16 defaults to Turbopack engine, which fails during CSS module evaluation (`Appointments.module.css`) with `TypeError: __turbopack_context__.a is not a function`.
- **Impact**: Production build fails under default Turbopack compiler.
- **Affected Components**: `package.json`, Next.js 16 build pipeline.
- **Current Workaround**: Run `npx next build --webpack` (or update `package.json` build script to `"build": "next build --webpack"`). Compiles 45/45 pages with 0 errors.
- **Priority**: Medium
- **Status**: Tracked

---

### 5. Single-Worker FastAPI SSE Broadcaster Scaling Constraint
- **Issue**: FastAPI Server-Sent Events (SSE) subscriber set (`_telemetry_subscribers` in `backend/main.py`) operates as an in-memory process-local set.
- **Impact**: In multi-worker Uvicorn/Gunicorn deployments (`--workers 4`), SSE connections attached to Worker B will not receive telemetry packets ingested by Worker A.
- **Affected Components**: `backend/main.py`, `/telemetry/stream`.
- **Current Workaround**: Run single FastAPI worker process (`--workers 1`) per container instance.
- **Possible Solution**: Attach Redis Pub/Sub or Supabase Realtime to `_telemetry_broadcaster` for cross-worker event distribution.
- **Priority**: Medium
- **Status**: Tracked

