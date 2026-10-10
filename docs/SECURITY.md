# 🔒 HealConnect — Security, Privacy & HIPAA Compliance

## 1. Authentication & Key Management

### Password Hashing
- User passwords are never stored in plaintext.
- Password hashing is enforced using **PBKDF2-SHA256** (`passlib.context.CryptContext`).

### JSON Web Token (JWT) Authorization
- Upon successful authentication (`POST /login`), the backend issues an HTTP Bearer JWT token signed with `HS256`.
- Claims contain user ID (`sub`), email, name, and system authorization `role`.
- Expiration is set to 24 hours. Token signatures are validated on protected endpoints via `HTTPBearer(auto_error=False)`.

---

## 2. Role-Based Access Control (RBAC)

The system enforces strict role-based authorization via FastAPI dependencies (`Depends`):

| System Role | Granted Permissions & Scope |
| :--- | :--- |
| **`admin`** | Full System Administration, User & Roster Management, ICU Ward Bed Allocation, Security Audit Log Inspection, Federated Learning Model Aggregation. |
| **`doctor`** | Telemetry Station Access, Patient Appointments Roster, AI Risk Prediction Inference, SHAP Explainability Inspection, Tele-Consultation. |
| **`staff`** | Nurse Telemetry Data Entry, Ward Bed Status Update. |
| **`patient`** | Self-Service Patient Portal, Personal Telemetry Waveform View, Digital E-Prescription Reader, Lab Report PDF Export. |

---

## 3. HIPAA Audit Trail Logging (`audit_logs`)

All access to protected patient endpoints, AI model predictions, credential updates, and hospital bed controls dispatch an immutable audit record to the `audit_logs` database table via `log_audit_event`:

```python
def log_audit_event(user_id: str, action: str, resource_type: str, ip: str, details: Dict[str, Any] = None):
    entry = {
        "user_id": user_id,
        "action": action,
        "resource_type": resource_type,
        "entity_id": str((details or {}).get("patient_id", "N/A")),
        "details": details or {},
        "ip_address": ip,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    db_service.save_audit_event(entry)
```

The database row-level security policy enforces **INSERT-ONLY** access for `audit_logs`, preventing record deletion or retroactive modification.

---

## 4. API & Network Security

- **CORS Filtering**: Strict origin matching via `CORSMiddleware` reading `ALLOWED_ORIGINS` (defaulting to `http://localhost:3000`).
- **Security Response Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`.
- **Payload Validation**: Input schemas are strictly validated via Pydantic (`VitalsInput`, `DiseaseInput`) with numerical range bounds (`temperature_c`: 35.0 - 43.0°C, `spo2_pct`: 50.0 - 100.0%, `heart_rate`: 30 - 250 BPM) to prevent code injection and parameter poisoning.
- **Sanitized Exception Handler**: Intercepts `RequestValidationError` to return clean error messages without exposing internal Python stack traces.

---

## 5. Privacy-Preserving Federated Learning Security

- **Zero Raw Data Exchange**: Hospital edge nodes (**Hospital A**, **Apollo**, **Fortis**) train local scikit-learn models locally on 334k total hospital records.
- **NumPyClient Weight Serialization**: Only model weight matrices and bias vectors ($\mathbf{W}, B$) are transmitted to the Flower server during `FedAvg` rounds. Raw patient health records never leave the local edge node environment.

---

## 6. MQTT Message Broker Security & Client Isolation

- **Authentication & Anonymous Access**: Mosquitto broker enforces `allow_anonymous false` with password file authentication (`mosquitto/config/password_file`).
- **ACL Topic Authorization**: Enforced via `mosquitto/config/acl.conf`. Devices are strictly restricted to publishing/subscribing to their own hospital/device topic namespace (`healconnect/{hospital_id}/{device_id}/vitals` and `status`).
- **Client-Side Bundle Security**: Web browsers consume telemetry exclusively via FastAPI SSE (`/telemetry/stream`). No MQTT broker usernames or passwords are published or embedded in Next.js client-side JavaScript bundles.
- **TLS Configuration Blueprint**: Development broker runs on port 1883 without TLS. Production port 8883 TLS configuration is documented as a blueprint in `mosquitto/config/mosquitto.conf`.

