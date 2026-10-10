-- HealConnect Enterprise Database Schema (Supabase PostgreSQL)
-- Multi-Tenant Hospital & AI Health Telemetry System

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 120),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(10),
    hospital_id VARCHAR(50) NOT NULL DEFAULT 'Hospital A',
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Discharged', 'Critical')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Real-Time Vitals Telemetry Logs
CREATE TABLE IF NOT EXISTS public.vitals_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id VARCHAR(50) REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    temperature_c NUMERIC(4, 2) NOT NULL CHECK (temperature_c >= 30.0 AND temperature_c <= 45.0),
    heart_rate INT NOT NULL CHECK (heart_rate >= 30 AND heart_rate <= 250),
    spo2_pct NUMERIC(4, 1) NOT NULL CHECK (spo2_pct >= 40.0 AND spo2_pct <= 100.0),
    respiratory_rate INT CHECK (respiratory_rate >= 5 AND respiratory_rate <= 60),
    systolic_bp INT CHECK (systolic_bp >= 50 AND systolic_bp <= 250),
    diastolic_bp INT CHECK (diastolic_bp >= 30 AND diastolic_bp <= 150),
    cough_severity INT DEFAULT 0 CHECK (cough_severity BETWEEN 0 AND 3),
    fatigue_score INT DEFAULT 0 CHECK (fatigue_score BETWEEN 0 AND 3),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI Disease Diagnosis & Prediction Logs
CREATE TABLE IF NOT EXISTS public.disease_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id VARCHAR(100) UNIQUE NOT NULL,
    patient_id VARCHAR(50) REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    predicted_condition VARCHAR(100) NOT NULL,
    is_influenza BOOLEAN NOT NULL DEFAULT FALSE,
    influenza_probability_pct NUMERIC(5, 2) NOT NULL,
    model_confidence_pct NUMERIC(5, 2) NOT NULL,
    model_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    input_payload JSONB NOT NULL,
    shap_explanation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Acute Patient Deterioration Risk Alerts
CREATE TABLE IF NOT EXISTS public.deterioration_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id VARCHAR(100) UNIQUE NOT NULL,
    patient_id VARCHAR(50) REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    risk_score NUMERIC(5, 4) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    confidence NUMERIC(5, 2) NOT NULL,
    model_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    top_shap_factors JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for Performant Querying
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient_timestamp ON public.vitals_logs(patient_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_patient_created ON public.disease_predictions(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_patient_timestamp ON public.deterioration_alerts(patient_id, timestamp DESC);

-- 5. Unified Prediction History (De-Identified Audit Storage)
CREATE TABLE IF NOT EXISTS public.prediction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id VARCHAR(100) UNIQUE NOT NULL,
    anonymous_patient_hash VARCHAR(64),
    prediction_type VARCHAR(50) NOT NULL CHECK (prediction_type IN ('Deterioration', 'Disease/Flu', 'Unified')),
    model_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    risk_score NUMERIC(6, 4) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN')),
    prediction_result VARCHAR(100) NOT NULL,
    explanation_summary JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pred_hist_created_type ON public.prediction_history(created_at DESC, prediction_type);
CREATE INDEX IF NOT EXISTS idx_pred_hist_level ON public.prediction_history(risk_level);
