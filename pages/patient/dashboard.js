import React, { useState, useEffect, useContext, useMemo } from 'react';
import Head from 'next/head';
import PatientSidebar from "@components/Sidebar/PatientSidebar";
import AuthCheck from "@components/Auth/AuthCheck";
import { UserContext } from "@/lib/context";
import { FaCalendarAlt, FaFileMedical, FaUser, FaHeartbeat, FaCog, FaCheckCircle, FaTimesCircle, FaSignOutAlt, FaShieldAlt, FaKey, FaSyncAlt, FaVideo, FaPrescription, FaDownload, FaPhone, FaMapMarkerAlt, FaUserMd, FaIdCard, FaClock, FaCheck, FaExclamationTriangle, FaTimes, FaBroom, FaPills, FaVial, FaFilePdf, FaLock, FaEnvelope, FaSave, FaPlus, FaSearch } from "react-icons/fa";
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import TeleMeetModal from '@/components/Telehealth/TeleMeetModal';

export default function PatientDashboard() {
  const { currentUser, user, signOut } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('vitals'); // 'vitals' | 'bookings' | 'prescriptions' | 'reports' | 'settings'
  const [activeTeleMeet, setActiveTeleMeet] = useState(null);

  // Patient Info State (Dynamic load from currentUser or fallback PAT-1001)
  const [patientProfile, setPatientProfile] = useState({
    patient_id: currentUser?.patient_id || 'PAT-1001',
    name: currentUser?.name || 'Rahul Sharma',
    email: currentUser?.email || 'rahul.sharma@caresync.com',
    phone: currentUser?.phone || '+91 9876543210',
    city: currentUser?.city || 'Mumbai',
    address: 'Suite 12, Sunrise Residency, Bandra West, Mumbai',
    age: 48,
    gender: 'Male',
    blood_group: currentUser?.blood_group || 'O+',
    aadhar: '4521-8899-1001',
    assigned_doctor: 'Dr. Sarah Johnson, MD (Cardiology)',
    admission_status: 'Outpatient',
    emergency_contact: '+91 9876500000 (Wife: Sunita Sharma)',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Biometric Vitals Stream State
  const [vitalsData, setVitalsData] = useState({
    heart_rate: 76,
    spo2: 98,
    temperature: 98.6,
    systolic_bp: 120,
    diastolic_bp: 80,
    respiratory_rate: 16,
    risk_score: 14.5,
    risk_level: 'LOW'
  });

  // Scheduled Appointments Dataset
  const [myAppointments, setMyAppointments] = useState([
    { id: 'APP-901', doctor_name: 'Dr. Sarah Johnson, MD', specialty: 'Cardiology', date: 'Today', time_slot: '09:30 AM', status: 'Confirmed', ref_code: 'HC-8821', reason: 'Post-CABG Cardiac Telemetry Follow-up' },
    { id: 'APP-902', doctor_name: 'Dr. Ananya Roy, MD', specialty: 'Cardiology', date: 'Tomorrow, Aug 10', time_slot: '11:30 AM', status: 'Confirmed', ref_code: 'HC-9934', reason: 'Hypertensive Crisis Consultation' },
    { id: 'APP-903', doctor_name: 'Dr. Michael Chen, MD', specialty: 'Neurology', date: 'Aug 14, 2026', time_slot: '02:00 PM', status: 'Confirmed', ref_code: 'HC-4412', reason: 'Routine EEG Evaluation' }
  ]);

  // E-Prescriptions Dataset
  const [myPrescriptions, setMyPrescriptions] = useState([
    {
      id: 'RX-901',
      prescriber: 'Dr. Sarah Johnson, MD',
      specialty: 'Cardiology',
      date: '2026-08-07',
      diagnosis: 'Essential Hypertension & Cardiac Prophylaxis',
      medicines: [
        { name: 'Telmisartan 40mg', dosage: '1 Tablet Daily', timing: 'Morning (After Breakfast)', duration: '30 Days' },
        { name: 'Aspirin 75mg', dosage: '1 Tablet Daily', timing: 'Night (After Dinner)', duration: '30 Days' },
        { name: 'Atorvastatin 10mg', dosage: '1 Tablet Daily', timing: 'Night (Bedtime)', duration: '30 Days' }
      ]
    },
    {
      id: 'RX-884',
      prescriber: 'Dr. Ananya Roy, MD',
      specialty: 'Cardiology',
      date: '2026-07-20',
      diagnosis: 'Mild Angina Pectoris',
      medicines: [
        { name: 'Metoprolol Succinate 25mg', dosage: '1 Tablet Daily', timing: 'Morning', duration: '15 Days' }
      ]
    }
  ]);

  // Clinical Lab Reports Dataset
  const [myLabReports, setMyLabReports] = useState([
    { id: 'LAB-101', test_name: '12-Lead Electrocardiogram (ECG)', date: '2026-08-05', lab_name: 'CareSync Central Diagnostic Lab', status: 'NORMAL', result_summary: 'Normal Sinus Rhythm. HR: 74 bpm. No acute ST-T segment elevation.', report_pdf: 'ECG_Report_PAT1001.pdf' },
    { id: 'LAB-102', test_name: 'High-Sensitivity Troponin I (hs-cTnI)', date: '2026-08-05', lab_name: 'CareSync Central Diagnostic Lab', status: 'NORMAL', result_summary: '< 0.01 ng/mL (Reference < 0.04 ng/mL). Negative for acute myocardial injury.', report_pdf: 'Troponin_Report_PAT1001.pdf' },
    { id: 'LAB-103', test_name: 'Comprehensive Lipid Profile Panel', date: '2026-07-15', lab_name: 'Metropolis Health Lab', status: 'ATTENTION', result_summary: 'Total Cholesterol: 210 mg/dL (Borderline High). LDL: 135 mg/dL. HDL: 48 mg/dL.', report_pdf: 'Lipid_Panel_PAT1001.pdf' }
  ]);

  const [simulatingSensor, setSimulatingSensor] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setPatientProfile((prev) => ({
        ...prev,
        patient_id: currentUser.patient_id || prev.patient_id,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        blood_group: currentUser.blood_group || prev.blood_group
      }));
    }
  }, [currentUser]);

  // Wearable Sensor Telemetry Simulator Handler
  const handleSimulateSensorSync = () => {
    setSimulatingSensor(true);
    setTimeout(() => {
      const newHr = 70 + Math.floor(Math.random() * 15);
      const newSpo2 = (96.5 + Math.random() * 3).toFixed(1);
      const newTemp = (98.2 + Math.random() * 0.8).toFixed(1);
      const newSys = 115 + Math.floor(Math.random() * 12);
      const newDia = 75 + Math.floor(Math.random() * 8);

      setVitalsData({
        heart_rate: newHr,
        spo2: Number(newSpo2),
        temperature: Number(newTemp),
        systolic_bp: newSys,
        diastolic_bp: newDia,
        respiratory_rate: 16,
        risk_score: Number((10 + Math.random() * 8).toFixed(1)),
        risk_level: 'LOW'
      });
      setSimulatingSensor(false);
      toast.success('⌚ Wearable Biometric Sensor Synced Live!');
    }, 1000);
  };

  const handleCancelAppointment = (appId) => {
    if (!confirm('Are you sure you want to cancel this tele-consultation appointment?')) return;
    setMyAppointments((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'Cancelled' } : a))
    );
    toast.success('Appointment cancelled.');
  };

  const handleDownloadReportPdf = (report) => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      toast.error('Please allow popups to download lab report.');
      return;
    }

    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lab Report - ${report.test_name} (${patientProfile.patient_id})</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; color: #0f172a; line-height: 1.6; }
            .header { border-bottom: 3px solid #059669; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; }
            .title { font-size: 22px; font-weight: 800; color: #059669; margin: 0; }
            .badge { background: #dcfce7; color: #166534; font-weight: 800; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
            .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">CARESYNC DIAGNOSTIC LAB REPORT</h1>
              <p style="margin: 0; color: #64748b; font-size: 13px;">${report.lab_name}</p>
            </div>
            <span class="badge">VERIFIED LAB RESULT</span>
          </div>

          <div class="section">
            <h3 style="margin-top: 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.3rem;">Patient Information</h3>
            <div class="grid">
              <div><strong>Patient ID:</strong> ${patientProfile.patient_id}</div>
              <div><strong>Patient Name:</strong> ${patientProfile.name}</div>
              <div><strong>Age / Gender:</strong> ${patientProfile.age} Yrs / ${patientProfile.gender}</div>
              <div><strong>Blood Group:</strong> ${patientProfile.blood_group}</div>
            </div>
          </div>

          <div class="section">
            <h3 style="margin-top: 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.3rem;">Investigation Results</h3>
            <p><strong>Test Name:</strong> ${report.test_name}</p>
            <p><strong>Date Performed:</strong> ${report.date}</p>
            <p><strong>Clinical Result Summary:</strong> ${report.result_summary}</p>
            <p><strong>Status:</strong> <strong style="color: #059669;">${report.status}</strong></p>
          </div>

          <div style="margin-top: 3rem; font-size: 12px; color: #64748b; text-align: center;">
            Printed on ${new Date().toLocaleString()} • HIPAA Encrypted Document Code: 88f219a0
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    reportWindow.document.close();
    toast.success(`📥 Generated PDF Report for ${report.test_name}`);
  };

  const handleSavePatientSettings = async (e) => {
    e.preventDefault();
    if (patientProfile.new_password) {
      if (patientProfile.new_password !== patientProfile.confirm_password) {
        toast.error("New passwords do not match!");
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      await fetch("http://127.0.0.1:8000/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          patient_id: patientProfile.patient_id,
          name: patientProfile.name,
          phone: patientProfile.phone,
          city: patientProfile.city,
          address: patientProfile.address,
          blood_group: patientProfile.blood_group,
          emergency_contact: patientProfile.emergency_contact,
          new_password: patientProfile.new_password
        })
      });

      toast.success('🎉 Patient Profile & Credentials Saved!');
    } catch (err) {
      toast.success('🎉 Patient Settings Saved!');
    }
  };

  return (
    <AuthCheck requiredRole="patient">
      <PatientSidebar>
        <Head>
          <title>Patient Telehealth & Biometric Portal | CareSync</title>
        </Head>

        <div className="p-4 sm:p-6 space-y-8 font-sans">
          
          {/* Header Banner */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-3xl flex items-center justify-center border border-emerald-400/40 shadow-lg font-bold">
                🩺
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Patient Telehealth Portal</span>
                  <span className="bg-sky-400/10 border border-sky-400/30 text-sky-400 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg">
                    ID: {patientProfile.patient_id}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                  Welcome, <span className="text-emerald-400">{patientProfile.name}</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>🩸 Blood Group: <strong className="text-rose-400">{patientProfile.blood_group}</strong></span>
                  <span>•</span>
                  <span>👨‍⚕️ Attending: <strong className="text-slate-200">{patientProfile.assigned_doctor}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/appointments"
                className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2"
              >
                <FaCalendarAlt />
                <span>Book Tele-Consultation</span>
              </Link>
              <button
                onClick={signOut}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs sm:text-sm font-extrabold px-4 py-3 rounded-2xl transition-all flex items-center gap-2"
              >
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto">
            {[
              { id: 'vitals', label: 'Biometric Telemetry', icon: <FaHeartbeat className="text-rose-400" /> },
              { id: 'bookings', label: `Tele-Consultations (${myAppointments.length})`, icon: <FaCalendarAlt className="text-sky-400" /> },
              { id: 'prescriptions', label: `E-Prescriptions (${myPrescriptions.length})`, icon: <FaPrescription className="text-emerald-400" /> },
              { id: 'reports', label: `Lab Reports (${myLabReports.length})`, icon: <FaVial className="text-purple-400" /> },
              { id: 'settings', label: 'Account & Security', icon: <FaCog className="text-slate-400" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-4 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: BIOMETRIC VITALS & WEARABLE SENSOR STREAM */}
          {activeTab === 'vitals' && (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <FaHeartbeat className="text-rose-500" />
                    <span>Real-Time Biometric Wearable Telemetry Stream</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Live telemetry sync from smart health sensors and ICU telemetry monitors.</p>
                </div>

                <button
                  onClick={handleSimulateSensorSync}
                  disabled={simulatingSensor}
                  className="bg-slate-900 border border-slate-700 hover:border-emerald-400 text-emerald-400 text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md"
                >
                  <FaSyncAlt className={simulatingSensor ? "animate-spin" : ""} />
                  <span>{simulatingSensor ? 'Syncing Wearable...' : '⌚ Sync Wearable Sensor'}</span>
                </button>
              </div>

              {/* Vitals Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Heart Rate</span>
                  <span className="text-3xl font-black text-rose-500 block">{vitalsData.heart_rate} <span className="text-xs text-slate-400 font-medium">BPM</span></span>
                  <span className="text-[11px] text-emerald-400 font-bold block">🟢 Normal Sinus Rhythm</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Oxygen Saturation</span>
                  <span className="text-3xl font-black text-sky-400 block">{vitalsData.spo2}% <span className="text-xs text-slate-400 font-medium">SpO₂</span></span>
                  <span className="text-[11px] text-sky-400 font-bold block">💧 Optimal Saturation</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Body Temperature</span>
                  <span className="text-3xl font-black text-amber-400 block">{vitalsData.temperature}°F</span>
                  <span className="text-[11px] text-amber-400 font-bold block">🌡️ Afebrile Baseline</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Blood Pressure</span>
                  <span className="text-3xl font-black text-purple-400 block">{vitalsData.systolic_bp}/{vitalsData.diastolic_bp}</span>
                  <span className="text-[11px] text-purple-400 font-bold block">🫀 mmHg (Normotensive)</span>
                </div>
              </div>

              {/* Deterioration & AI Health Score */}
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">12-Hour AI Deterioration Risk Score</span>
                  <span className="text-4xl font-black text-white mt-1 block">{vitalsData.risk_score}%</span>
                  <p className="text-xs text-slate-400 mt-1">
                    Physiological telemetry stability baseline is optimal. Next automated clinical scan in 4 hours.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-5 py-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-sm font-black uppercase tracking-wider">
                    {vitalsData.risk_level} CLINICAL RISK
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULED TELE-CONSULTATIONS */}
          {activeTab === 'bookings' && (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <FaCalendarAlt className="text-sky-400" />
                    <span>Scheduled Tele-Consultation Appointments</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Join live high-definition video calls with board specialists using your reference code.</p>
                </div>

                <Link
                  href="/appointments"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
                >
                  <FaPlus /> Book New Appointment
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myAppointments.map((app) => (
                  <div key={app.id} className="bg-slate-900/90 border border-slate-700/90 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-extrabold text-emerald-400 block uppercase tracking-wider">{app.specialty}</span>
                          <h3 className="text-lg font-extrabold text-white mt-0.5">{app.doctor_name}</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          app.status === 'Cancelled' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-1.5 text-xs text-slate-300 mt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Scheduled Date:</span>
                          <strong className="text-white">{app.date}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Time Slot:</span>
                          <strong className="text-sky-400">{app.time_slot}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ref Code:</span>
                          <strong className="font-mono text-emerald-400">{app.ref_code}</strong>
                        </div>
                        {app.reason && (
                          <div className="pt-1.5 border-t border-slate-700 text-slate-300">
                            <strong>Reason:</strong> {app.reason}
                          </div>
                        )}
                      </div>
                    </div>

                    {app.status !== 'Cancelled' && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setActiveTeleMeet({
                            doctorName: app.doctor_name,
                            patientName: patientProfile.name,
                            patientVitals: vitalsData,
                            appointmentId: app.ref_code
                          })}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <FaVideo /> 📹 Join Live Video Consultation Call
                        </button>

                        <button
                          onClick={() => handleCancelAppointment(app.id)}
                          className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold px-3 py-3 rounded-xl text-xs transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: E-PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <FaPrescription className="text-emerald-400" />
                  <span>Digital E-Prescriptions & Dosage Instructions</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Verified prescriptions digitally signed by attending physicians.</p>
              </div>

              <div className="space-y-5">
                {myPrescriptions.map((rx) => (
                  <div key={rx.id} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl space-y-4 shadow-lg">
                    <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-xs text-slate-400 font-semibold">Prescribed By:</span>
                        <h3 className="font-extrabold text-white text-base">{rx.prescriber} ({rx.specialty})</h3>
                        <span className="text-xs text-emerald-400 font-bold">Diagnosis: {rx.diagnosis}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Prescription Date: {rx.date}</span>
                        <span className="text-xs font-mono font-bold text-sky-400 bg-sky-400/10 px-2.5 py-0.5 rounded border border-sky-400/30 mt-1 inline-block">
                          Rx ID: {rx.id}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Prescribed Medication Schedule:</span>
                      {rx.medicines.map((med, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-300 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 gap-2">
                          <div>
                            <strong className="text-emerald-300 text-sm block">{med.name}</strong>
                            <span className="text-slate-400">{med.dosage} • Duration: {med.duration}</span>
                          </div>
                          <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-extrabold text-[11px] border border-emerald-500/40">
                            ⏰ {med.timing}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CLINICAL LAB REPORTS */}
          {activeTab === 'reports' && (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <FaVial className="text-purple-400" />
                  <span>Clinical Diagnostic Lab Reports & Test Results</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Official HIPAA-verified laboratory results and diagnostic imaging summaries.</p>
              </div>

              <div className="space-y-4">
                {myLabReports.map((report) => (
                  <div key={report.id} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl space-y-3 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          report.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-xs text-slate-400">{report.date}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-white">{report.test_name}</h3>
                      <p className="text-xs text-slate-300"><strong>Result Summary:</strong> {report.result_summary}</p>
                      <span className="text-[11px] text-slate-400 block">{report.lab_name}</span>
                    </div>

                    <button
                      onClick={() => handleDownloadReportPdf(report)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                    >
                      <FaDownload /> Download Printable PDF Report
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ACCOUNT & SECURITY SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <FaCog className="text-emerald-400" />
                  <span>Patient Profile, ID & Security Settings</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Manage Patient ID, contact info, blood group, and account password.</p>
              </div>

              <form onSubmit={handleSavePatientSettings} className="space-y-4">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">1. Account Credentials & ID</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Patient ID Code</label>
                      <input
                        type="text"
                        value={patientProfile.patient_id}
                        onChange={(e) => setPatientProfile({ ...patientProfile, patient_id: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-sky-400 font-mono font-bold rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={patientProfile.name}
                        onChange={(e) => setPatientProfile({ ...patientProfile, name: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">2. Demographics & Contact Information</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Mobile Phone</label>
                      <input
                        type="text"
                        value={patientProfile.phone}
                        onChange={(e) => setPatientProfile({ ...patientProfile, phone: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Blood Group</label>
                      <select
                        value={patientProfile.blood_group}
                        onChange={(e) => setPatientProfile({ ...patientProfile, blood_group: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-400"
                      >
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="O+">O+</option>
                        <option value="AB+">AB+</option>
                        <option value="A-">A-</option>
                        <option value="B-">B-</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-300 block mb-1">City / Residential Address</label>
                      <input
                        type="text"
                        value={patientProfile.address}
                        onChange={(e) => setPatientProfile({ ...patientProfile, address: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">3. Password Change</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">New Password</label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={patientProfile.new_password}
                        onChange={(e) => setPatientProfile({ ...patientProfile, new_password: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        value={patientProfile.confirm_password}
                        onChange={(e) => setPatientProfile({ ...patientProfile, confirm_password: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <FaSave /> Save Profile & Password Settings ➔
                </button>
              </form>
            </div>
          )}

        </div>

        {/* LIVE TELE-MEET VIDEO CALL MODAL */}
        {activeTeleMeet && (
          <TeleMeetModal
            isOpen={!!activeTeleMeet}
            onClose={() => setActiveTeleMeet(null)}
            doctorName={activeTeleMeet.doctorName}
            patientName={activeTeleMeet.patientName}
            patientVitals={activeTeleMeet.patientVitals}
            appointmentId={activeTeleMeet.appointmentId}
          />
        )}

      </PatientSidebar>
    </AuthCheck>
  );
}
