# 04 — Database Architecture

> **Path:** `architecture-project/04-database-architecture.md`  
> **Status:** Implemented & Verified (SQLAlchemy ORM / SQLite / Supabase PostgreSQL)  

```mermaid
erDiagram
    users {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string role
        timestamp created_at
    }

    hospitals {
        uuid id PK
        string name
        string location
        timestamp created_at
    }

    patients {
        uuid id PK
        uuid hospital_id FK
        string patient_code UK
        string full_name
        int age
        string gender
        string room_number
        timestamp created_at
    }

    devices {
        uuid id PK
        uuid patient_id FK
        string mac_address UK
        string device_status
        timestamp registered_at
    }

    vitals {
        uuid id PK
        uuid patient_id FK
        uuid device_id FK
        float heart_rate
        float spo2
        float temperature
        timestamp recorded_at
    }

    risk_scores {
        uuid id PK
        uuid patient_id FK
        float risk_score
        string risk_level
        json shap_values
        timestamp calculated_at
    }

    alerts {
        uuid id PK
        uuid patient_id FK
        string alert_type
        string message
        boolean resolved
        timestamp triggered_at
    }

    hospitals ||--o{ patients : "hosts"
    patients ||--o{ devices : "assigned"
    patients ||--o{ vitals : "logs"
    patients ||--o{ risk_scores : "evaluates"
    patients ||--o{ alerts : "triggers"
    devices ||--o{ vitals : "transmits"
```

## Schema & Tables Description
* **`users`:** Clinician accounts with bcrypt salted password hashes and role-based permissions (`doctor`, `nurse`, `admin`).
* **`patients`:** Clinical demographic records connected to hospital org nodes.
* **`vitals`:** High-frequency time-series log for telemetry measurements.
* **`risk_scores`:** Persisted outputs from `risk_model.joblib` and SHAP JSON feature attribution vectors.
