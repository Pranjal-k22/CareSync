# 💻 CareSync — Development Guide

## 1. Development Workflow

Follow this 10-step systematic engineering workflow whenever adding new features or resolving issues in CareSync:

```text
1. Understand the Requirement
   └─ Review user story, clinical scenario, or issue details.
2. Inspect Existing Implementation
   └─ Search codebase with grep_search/view_file to inspect exact signatures and models.
3. Identify Affected Components
   └─ Determine impact across Frontend UI, FastAPI Gateway, ML Registry, or Database.
4. Check Architecture & ADRs
   └─ Review docs/ARCHITECTURE.md and docs/DECISIONS.md to adhere to patterns.
5. Implement Smallest Safe Change
   └─ Apply changes with strict fallback mechanisms for optional parameters.
6. Run Unit & Component Tests
   └─ Execute Pytest suite (`python -m pytest backend/tests/`).
7. Run Integration Verification
   └─ Test REST API endpoints via Swagger (`/docs`) or TestClient.
8. Validate Build Integrity
   └─ Run Next.js production build (`npx next build --webpack`).
9. Update Documentation
   └─ Synchronize docs/ API specs, architecture, or setup guides if affected.
10. Update Development Log & Changelog
   └─ Record session entries in docs/DEVELOPMENT_LOG.md and docs/CHANGELOG.md.
```

---

## 2. Coding Standards & Technical Conventions

### A. Python Backend (FastAPI & ML)
- **Path Resolution**: Always use `Path(__file__).resolve().parent...` for dynamic path calculations. Never hardcode absolute machine paths (e.g., `/Users/username/...`).
- **Pydantic V2 Compatibility**:
  - Use `model_config = ConfigDict(extra="ignore")` instead of deprecated `class Config`.
  - Use `payload.model_dump()` instead of deprecated `payload.dict()`.
- **Datetime ISO Formatting**: Use timezone-aware UTC datetimes:
  ```python
  import datetime
  now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
  ```
- **Error Handling**: Use structured JSON error responses with proper HTTP status codes (`400`, `401`, `403`, `404`, `422`, `500`). Never let unhandled exceptions leak stack traces.

### B. Machine Learning & Model Registry
- **Feature Robustness**: Always fill default clinical baseline values for optional input parameters (`oxygen_flow: 0.0`, `mobility_score: 3.0`, `nurse_alert: 0`, `comorbidity_index: 0.0`, `oxygen_device: "room_air"`, `gender: "Male"`, `admission_type: "Elective"`).
- **SHAP Calculations**: Always set `check_additivity=False` when calling `explainer.shap_values(...)` to prevent floating-point precision mismatches during TreeExplainer evaluation.

### C. JavaScript & Frontend (Next.js 16 / React 18)
- **Component Isolation**: Keep components modular under `components/`. Use CSS modules (`*.module.css`) or predefined utility classes for styling.
- **SSE Stream Handling**: Use native `EventSource` connected to `/telemetry/stream` with automatic reconnect listeners (`onmessage`, `onerror`) and proper unmount cleanup (`eventSource.close()`).
- **API Fetching**: Use unified fetch utility helpers (`lib/api.js` or `lib/supabaseClient.js`) with Bearer token header propagation.

---

## 3. Retraining ML Models Standard Procedure

When retraining machine learning pipelines:
1. Modify or execute scripts in `ml/`:
   - `python ml/train_risk_model.py`
   - `python ml/train_disease_model.py`
   - `python ml/train_final_flu_model.py`
2. Verify metrics JSON generated in `ml/artifacts/`.
3. Copy new `.joblib` binary artifacts to `backend/models/` and versioned registry folders (`backend/models/registry/deterioration/v1/model.joblib` & `backend/models/registry/disease/flu_v1/model.joblib`).
4. Re-run Pytest test suite (`python -m pytest backend/tests/`).
