-- ====================================================================
-- HEALCONNECT SUPABASE POSTGRESQL SCHEMA & CYBERSECURITY MIGRATION
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE: Authenticated User Accounts with PBKDF2 Hashed Passwords & Roles
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'doctor', 'patient', 'staff')) NOT NULL DEFAULT 'patient',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENTS TABLE: De-identified Clinical Patient Demographic Records
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 120),
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')) NOT NULL,
    blood_group TEXT DEFAULT 'O+',
    phone TEXT DEFAULT '+91 9876543210',
    city TEXT DEFAULT 'Mumbai',
    assigned_doctor TEXT DEFAULT 'Dr. Sarah Johnson, MD',
    status TEXT CHECK (status IN ('Outpatient', 'Admitted', 'Scheduled Consultation', 'Discharged')) DEFAULT 'Outpatient',
    avatar_url TEXT DEFAULT '👤',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VITALS TABLE: Timestamped IoT Telemetry Sensor Readings Linked to Patients
CREATE TABLE IF NOT EXISTS public.vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,
    heart_rate NUMERIC(5,2),
    spo2 NUMERIC(5,2),
    temperature NUMERIC(5,2),
    systolic_bp NUMERIC(5,2),
    diastolic_bp NUMERIC(5,2),
    respiratory_rate NUMERIC(5,2),
    ecg JSONB DEFAULT '[]'::jsonb,
    finger_contact BOOLEAN DEFAULT TRUE,
    device_id TEXT DEFAULT 'ESP8266-NODEMCU-01',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PREDICTION_HISTORY TABLE: Canonical AI Risk Predictions Audit Log
CREATE TABLE IF NOT EXISTS public.prediction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id TEXT UNIQUE NOT NULL,
    anonymous_patient_hash TEXT NOT NULL,
    patient_id TEXT,
    prediction_type TEXT NOT NULL DEFAULT 'Unified',
    model_version TEXT NOT NULL DEFAULT 'v1.0',
    risk_score NUMERIC(5,2) NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) NOT NULL,
    prediction_result TEXT NOT NULL DEFAULT 'Stable Baseline',
    explanation_summary JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backward compatibility view for predictions queries
CREATE OR REPLACE VIEW public.predictions AS 
SELECT 
    id,
    prediction_id,
    COALESCE(patient_id, anonymous_patient_hash) AS patient_id,
    anonymous_patient_hash,
    risk_score,
    risk_level,
    model_version,
    explanation_summary AS top_factors,
    created_at
FROM public.prediction_history;

-- 5. ALERTS TABLE: Real-Time Clinical Deterioration & Vitals Triggered Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MODEL_VERSIONS TABLE: Model Performance & Active Production Registry Status
CREATE TABLE IF NOT EXISTS public.model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT UNIQUE NOT NULL,
    algorithm TEXT NOT NULL,
    accuracy NUMERIC(5,4) NOT NULL,
    precision NUMERIC(5,4) NOT NULL,
    recall NUMERIC(5,4) NOT NULL,
    f1_score NUMERIC(5,4) NOT NULL,
    roc_auc NUMERIC(5,4) NOT NULL,
    dataset_name TEXT DEFAULT 'cleaned_hospital_data.csv',
    trained_date TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Seed production model versions
INSERT INTO public.model_versions (version, algorithm, accuracy, precision, recall, f1_score, roc_auc, is_active)
VALUES 
('v1.0', 'RandomForestClassifier', 0.9320, 0.4054, 0.5090, 0.4513, 0.8831, FALSE),
('flu_v1', 'RandomForestClassifier (Disease)', 0.9610, 0.9520, 0.9680, 0.9600, 0.9850, TRUE),
('global_model_v2', 'Flower NumPyClient FedAvg', 0.9459, 0.4320, 0.5410, 0.4810, 0.9150, TRUE)
ON CONFLICT (version) DO NOTHING;

-- 7. AUDIT_LOGS TABLE: HIPAA Security Audit Events Log
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    ip_address TEXT DEFAULT '127.0.0.1',
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FEDERATED_ROUNDS TABLE: Flower FedAvg Multi-Hospital Training Rounds History
CREATE TABLE IF NOT EXISTS public.federated_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_number INT NOT NULL,
    participating_hospitals JSONB NOT NULL,
    global_accuracy NUMERIC(5,4) NOT NULL,
    global_loss NUMERIC(5,4) NOT NULL,
    model_version TEXT NOT NULL DEFAULT 'global_model_v2',
    completed_time TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.federated_rounds ENABLE ROW LEVEL SECURITY;

-- Clinical data is accessed only through the FastAPI service using the
-- SUPABASE_SERVICE_ROLE_KEY. Browser anon/authenticated roles receive no
-- broad table access; this avoids exposing PHI through a misconfigured UI.
DROP POLICY IF EXISTS "Allow public read users" ON public.users;
DROP POLICY IF EXISTS "Allow service insert users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated read patients" ON public.patients;
DROP POLICY IF EXISTS "Allow admin write patients" ON public.patients;
DROP POLICY IF EXISTS "Allow read vitals" ON public.vitals;
DROP POLICY IF EXISTS "Allow write vitals" ON public.vitals;
DROP POLICY IF EXISTS "Allow read prediction_history" ON public.prediction_history;
DROP POLICY IF EXISTS "Allow write prediction_history" ON public.prediction_history;
DROP POLICY IF EXISTS "Allow read alerts" ON public.alerts;
DROP POLICY IF EXISTS "Allow write alerts" ON public.alerts;
DROP POLICY IF EXISTS "Allow read model_versions" ON public.model_versions;
DROP POLICY IF EXISTS "Allow read federated_rounds" ON public.federated_rounds;
DROP POLICY IF EXISTS "Allow read audit_logs" ON public.audit_logs;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

CREATE INDEX IF NOT EXISTS vitals_patient_timestamp_idx ON public.vitals (patient_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS prediction_history_patient_created_idx ON public.prediction_history (patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS alerts_patient_timestamp_idx ON public.alerts (patient_id, timestamp DESC);
