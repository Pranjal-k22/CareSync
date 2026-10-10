-- =========================================================
-- HEALCONNECT COMPLETE POSTGRESQL & SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Default Admin Account Credentials for Supabase Auth:
-- Email: Admin@healconnect.com
-- Password: 12345678
-- Role: admin

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'staff', 'admin')),
  specialty TEXT,
  hospital TEXT,
  avatar_url TEXT,
  is_available_today BOOLEAN DEFAULT true,
  schedule_hours TEXT DEFAULT '09:00 AM - 05:00 PM',
  fee TEXT DEFAULT '₹500',
  doctor_password_hint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Profiles read policy" ON public.profiles
  FOR SELECT USING (
    true -- Public read for doctor discovery & patient lookup
  );

CREATE POLICY "Profiles update policy" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Profiles delete policy" ON public.profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Profiles insert policy" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------
-- 2. APPOINTMENTS TABLE (Patient Bookings)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  hospital TEXT DEFAULT 'HealConnect Medical Center',
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  consult_type TEXT DEFAULT 'In-Clinic',
  reason TEXT,
  status TEXT DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Completed', 'Cancelled', 'In-Progress')),
  fee TEXT DEFAULT '$100',
  ref_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Appointments RLS Policies:
-- Patients can ONLY view their own appointments
CREATE POLICY "Patients view own appointments" ON public.appointments
  FOR SELECT USING (
    auth.uid() = patient_id OR
    auth.uid() = doctor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Patients can ONLY insert appointments for themselves
CREATE POLICY "Patients create own appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    auth.uid() = patient_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Patients can ONLY update/cancel their own appointments; Admins can update all
CREATE POLICY "Patients update own appointments" ON public.appointments
  FOR UPDATE USING (
    auth.uid() = patient_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor'))
  );

-- ---------------------------------------------------------
-- 3. HOSPITAL BEDS & TELEMETRY TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital_beds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hospital_name TEXT DEFAULT 'HealConnect Central Tower' UNIQUE NOT NULL,
  total_beds INT DEFAULT 120 NOT NULL,
  occupied_beds INT DEFAULT 84 NOT NULL,
  icu_beds INT DEFAULT 25 NOT NULL,
  icu_occupied INT DEFAULT 18 NOT NULL,
  available_beds INT GENERATED ALWAYS AS (total_beds - occupied_beds) STORED,
  staff_on_duty INT DEFAULT 45 NOT NULL,
  emergency_status TEXT DEFAULT 'NORMAL' CHECK (emergency_status IN ('NORMAL', 'HIGH_DEMAND', 'CRITICAL')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hospital_beds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hospital beds read policy" ON public.hospital_beds
  FOR SELECT USING (true);

CREATE POLICY "Hospital beds write policy" ON public.hospital_beds
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor'))
  );

-- Insert initial hospital bed record if empty
INSERT INTO public.hospital_beds (hospital_name, total_beds, occupied_beds, icu_beds, icu_occupied, staff_on_duty)
VALUES ('HealConnect Central Tower', 150, 92, 30, 21, 58)
ON CONFLICT (hospital_name) DO NOTHING;

-- ---------------------------------------------------------
-- 4. PRESCRIPTIONS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  prescriber TEXT NOT NULL,
  medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prescriptions read policy" ON public.prescriptions
  FOR SELECT USING (
    auth.uid() = patient_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor'))
  );

CREATE POLICY "Prescriptions insert policy" ON public.prescriptions
  FOR INSERT WITH CHECK (
    auth.uid() = patient_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor'))
  );

-- ---------------------------------------------------------
-- 4.7. PATIENT HARDWARE TELEMETRY & LAB REPORTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  heart_rate INTEGER DEFAULT 76,
  spo2 INTEGER DEFAULT 98,
  temperature NUMERIC(4,1) DEFAULT 98.6,
  blood_pressure TEXT DEFAULT '120/80',
  lab_results JSONB DEFAULT '{}'::jsonb,
  doctor_remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports read policy" ON public.reports
  FOR SELECT USING (true);

CREATE POLICY "Reports insert policy" ON public.reports
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor'))
  );

-- ---------------------------------------------------------
-- 4.5. NOTIFICATIONS TABLE & ADMIN-ONLY RLS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'announcement' CHECK (type IN ('emergency', 'appointment', 'prescription', 'announcement')),
  target_role TEXT DEFAULT 'all' CHECK (target_role IN ('all', 'patient', 'doctor', 'staff')),
  target_email TEXT,
  sender_role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Read Policy (Public/All target roles can read)
CREATE POLICY "Notifications read policy" ON public.notifications
  FOR SELECT USING (true);

-- Notifications Insert Policy (STRICTLY ADMIN ONLY)
CREATE POLICY "Notifications insert policy" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Notifications Delete Policy (STRICTLY ADMIN ONLY)
CREATE POLICY "Notifications delete policy" ON public.notifications
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---------------------------------------------------------
-- ---------------------------------------------------------
-- 5. CAPSTONE ARCHITECTURE TABLES: PATIENTS, VITALS, PREDICTIONS, MODEL_VERSIONS, AUDIT_LOGS, FEDERATED_ROUNDS
-- ---------------------------------------------------------

-- 5.1. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL DEFAULT 32,
  gender TEXT DEFAULT 'Male',
  phone TEXT,
  email TEXT,
  blood_group TEXT DEFAULT 'O+',
  height TEXT DEFAULT '175 cm',
  weight TEXT DEFAULT '72 kg',
  city TEXT DEFAULT 'Mumbai',
  aadhar TEXT,
  assigned_doctor TEXT DEFAULT 'Dr. Sarah Johnson, MD',
  status TEXT DEFAULT 'Outpatient',
  avatar_url TEXT DEFAULT '👤',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients read policy" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Patients insert policy" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Patients update policy" ON public.patients FOR UPDATE USING (true);

-- 5.2. TIME-SERIES VITALS TABLE (ESP8266 IoT Telemetry Stream)
CREATE TABLE IF NOT EXISTS public.vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT NOT NULL,
  heart_rate INTEGER NOT NULL DEFAULT 76,
  spo2 INTEGER NOT NULL DEFAULT 98,
  temperature NUMERIC(4,1) NOT NULL DEFAULT 98.6,
  ecg_trace JSONB DEFAULT '[]'::jsonb,
  finger_contact BOOLEAN DEFAULT true,
  device_id TEXT DEFAULT 'ESP8266-NODE-9901',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vitals read policy" ON public.vitals FOR SELECT USING (true);
CREATE POLICY "Vitals insert policy" ON public.vitals FOR INSERT WITH CHECK (true);

-- 5.3. PREDICTIONS TABLE (AI Risk Assessment & SHAP Explainability)
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT NOT NULL,
  risk_score NUMERIC(5,2) NOT NULL DEFAULT 18.5,
  risk_level TEXT DEFAULT 'Low Risk' CHECK (risk_level IN ('Low Risk', 'Moderate Risk', 'Critical Risk')),
  disease_predicted TEXT DEFAULT 'Normal Cardiovascular Function',
  confidence NUMERIC(5,2) DEFAULT 98.4,
  shap_explanation JSONB DEFAULT '{"spo2_weight": 28, "heart_rate_weight": 22, "temperature_weight": 18, "age_weight": 14}'::jsonb,
  doctor_guidance TEXT DEFAULT 'Vitals within normal limits. Annual checkup recommended.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Predictions read policy" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Predictions insert policy" ON public.predictions FOR INSERT WITH CHECK (true);

-- 5.4. MODEL VERSIONS TABLE (AI Registry & Governance)
CREATE TABLE IF NOT EXISTS public.model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name TEXT NOT NULL DEFAULT 'HealConnect-Risk-Net',
  version_tag TEXT NOT NULL DEFAULT 'v2.4-SHAP-FedAvg',
  algorithm TEXT DEFAULT 'XGBoost + PyTorch Neural Network',
  accuracy NUMERIC(5,2) DEFAULT 99.4,
  f1_score NUMERIC(5,2) DEFAULT 98.8,
  status TEXT DEFAULT 'PRODUCTION',
  trained_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Model versions read policy" ON public.model_versions FOR SELECT USING (true);

-- 5.5. AUDIT LOGS TABLE (HIPAA Security & Integrity Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT DEFAULT '127.0.0.1',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit logs read policy" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Audit logs insert policy" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- 5.6. FEDERATED ROUNDS TABLE (Federated Learning Hospital Aggregation)
CREATE TABLE IF NOT EXISTS public.federated_rounds (
  round_number INTEGER PRIMARY KEY,
  connected_nodes INTEGER DEFAULT 3,
  hospitals_participant JSONB DEFAULT '["Hospital A - Central", "Hospital B - Apollo Node", "Hospital C - Fortis Node"]'::jsonb,
  global_accuracy NUMERIC(5,2) DEFAULT 99.4,
  privacy_budget_epsilon NUMERIC(3,1) DEFAULT 0.5,
  aggregation_status TEXT DEFAULT 'COMPLETED',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.federated_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Federated rounds read policy" ON public.federated_rounds FOR SELECT USING (true);

-- ---------------------------------------------------------
-- 6. AUTOMATIC TRIGGER FOR PROFILE CREATION ON SIGNUP
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, phone, specialty)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    NEW.phone,
    NEW.raw_user_meta_data->>'specialty'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
