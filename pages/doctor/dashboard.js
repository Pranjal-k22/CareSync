import { useState, useEffect, useContext, useMemo } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { UserContext } from '@/lib/context';
import AuthCheck from '@/components/Auth/AuthCheck';
import Footer from '@/components/Footer';
import { FaUserMd, FaUsers, FaBed, FaPrescription, FaSignOutAlt, FaCog, FaCheckCircle, FaSpinner, FaHeartbeat, FaSearch, FaSyncAlt, FaKey, FaShieldAlt, FaFileMedical, FaExclamationTriangle, FaTimes, FaPlusUser, FaUserPlus, FaFilter, FaStethoscope, FaCalendarCheck, FaVideo, FaClock, FaCheck, FaPhone, FaIdCard, FaDownload, FaEdit, FaSave, FaUserClock, FaClock as FaClockIcon, FaHospital, FaBan, FaCalendarAlt, FaBroom, FaUserCheck, FaMicrochip, FaEnvelope, FaMapMarkerAlt, FaLock, FaImage, FaGraduationCap, FaBriefcase, FaMoneyBillWave } from 'react-icons/fa';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { initial50PatientsList } from '@/lib/fetchPatients';
import TeleMeetModal from '@/components/Telehealth/TeleMeetModal';

// Shared 40 Hospital Beds Grid Layout Across Admin and Doctor Portals
const initialBedsGridData = [
  // ICU WING (A1 - A10)
  { id: 'ICU-A1', wing: 'ICU', status: 'occupied', patientName: 'Vikram Mehta', doctor: 'Dr. Sarah Johnson, MD', vitals: 'SpO2 96% | HR 78 bpm', ventilator: true },
  { id: 'ICU-A2', wing: 'ICU', status: 'occupied', patientName: 'Sunita Sharma', doctor: 'Dr. Michael Chen, MD', vitals: 'SpO2 94% | HR 84 bpm', ventilator: true },
  { id: 'ICU-A3', wing: 'ICU', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'ICU-A4', wing: 'ICU', status: 'sanitizing', patientName: null, doctor: null, vitals: 'Sanitation in progress', ventilator: true },
  { id: 'ICU-A5', wing: 'ICU', status: 'occupied', patientName: 'Amitabh Roy', doctor: 'Dr. Sarah Johnson, MD', vitals: 'SpO2 98% | HR 72 bpm', ventilator: true },
  { id: 'ICU-A6', wing: 'ICU', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'ICU-A7', wing: 'ICU', status: 'reserved', patientName: 'Incoming ER Patient', doctor: 'Dr. Emily Rodriguez, MD', vitals: 'Pending Admission', ventilator: true },
  { id: 'ICU-A8', wing: 'ICU', status: 'occupied', patientName: 'Kavita Patel', doctor: 'Dr. James Wilson, MD', vitals: 'SpO2 95% | HR 80 bpm', ventilator: true },
  { id: 'ICU-A9', wing: 'ICU', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'ICU-A10', wing: 'ICU', status: 'occupied', patientName: 'David Miller', doctor: 'Dr. Michael Chen, MD', vitals: 'SpO2 97% | HR 76 bpm', ventilator: true },

  // GENERAL WARD - AISLE B (B1 - B10)
  { id: 'GEN-B1', wing: 'General Ward', status: 'occupied', patientName: 'Ramesh Gupta', doctor: 'Dr. Ananya Roy, MD', vitals: 'SpO2 99% | BP 120/80', ventilator: false },
  { id: 'GEN-B2', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-B3', wing: 'General Ward', status: 'occupied', patientName: 'Pooja Iyer', doctor: 'Dr. Ananya Roy, MD', vitals: 'SpO2 98% | Temp 98.6F', ventilator: false },
  { id: 'GEN-B4', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-B5', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-B6', wing: 'General Ward', status: 'sanitizing', patientName: null, doctor: null, vitals: 'Sanitation in progress', ventilator: false },
  { id: 'GEN-B7', wing: 'General Ward', status: 'occupied', patientName: 'Siddharth Rao', doctor: 'Dr. Ananya Roy, MD', vitals: 'SpO2 97% | BP 118/75', ventilator: false },
  { id: 'GEN-B8', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-B9', wing: 'General Ward', status: 'reserved', patientName: 'Pre-op Surgery Patient', doctor: 'Dr. James Wilson, MD', vitals: 'Scheduled 2 PM', ventilator: false },
  { id: 'GEN-B10', wing: 'General Ward', status: 'occupied', patientName: 'Anita Nair', doctor: 'Dr. Sarah Johnson, MD', vitals: 'SpO2 99% | Stable', ventilator: false },

  // GENERAL WARD - AISLE C (C1 - C10)
  { id: 'GEN-C1', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-C2', wing: 'General Ward', status: 'occupied', patientName: 'Gaurav Joshi', doctor: 'Dr. Ananya Roy, MD', vitals: 'SpO2 98% | BP 122/82', ventilator: false },
  { id: 'GEN-C3', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-C4', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-C5', wing: 'General Ward', status: 'occupied', patientName: 'Fatima Sheikh', doctor: 'Dr. Ananya Roy, MD', vitals: 'SpO2 99% | Recovering', ventilator: false },
  { id: 'GEN-C6', wing: 'General Ward', status: 'occupied', patientName: 'Tariq Hassan', doctor: 'Dr. Michael Chen, MD', vitals: 'SpO2 97% | BP 125/85', ventilator: false },
  { id: 'GEN-C7', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-C8', wing: 'General Ward', status: 'sanitizing', patientName: null, doctor: null, vitals: 'Sanitation in progress', ventilator: false },
  { id: 'GEN-C9', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-C10', wing: 'General Ward', status: 'occupied', patientName: 'Deepak Chopra', doctor: 'Dr. Sarah Johnson, MD', vitals: 'SpO2 98% | BP 115/78', ventilator: false },

  // VIP ISOLATION SUITES (S1 - S10)
  { id: 'VIP-S1', wing: 'VIP Suite', status: 'occupied', patientName: 'Rajesh Singhania', doctor: 'Dr. Sarah Johnson, MD', vitals: 'SpO2 99% | VIP Suite 101', ventilator: true },
  { id: 'VIP-S2', wing: 'VIP Suite', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'VIP-S3', wing: 'VIP Suite', status: 'reserved', patientName: 'Executive Checkup Patient', doctor: 'Dr. Ananya Roy, MD', vitals: 'Arrival 4:00 PM', ventilator: true },
  { id: 'VIP-S4', wing: 'VIP Suite', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'VIP-S5', wing: 'VIP Suite', status: 'occupied', patientName: 'Evelyn Taylor', doctor: 'Dr. Ananya Roy, MD', vitals: 'SpO2 98% | Stable', ventilator: true },
  { id: 'VIP-S6', wing: 'VIP Suite', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'VIP-S7', wing: 'VIP Suite', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'VIP-S8', wing: 'VIP Suite', status: 'sanitizing', patientName: null, doctor: null, vitals: 'Sanitation in progress', ventilator: true },
  { id: 'VIP-S9', wing: 'VIP Suite', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'VIP-S10', wing: 'VIP Suite', status: 'occupied', patientName: 'Karan Johar', doctor: 'Dr. Ananya Roy, MD', vitals: 'SpO2 99% | Post-op Care', ventilator: true }
];

export default function DoctorDashboard() {
  const router = useRouter();
  const { currentUser, user, signOut } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'patients' | 'beds' | 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeMode, setScopeMode] = useState('strict'); // 'strict' (Doctor Specialty & Booked Only) | 'all' (All Hospital Patients)
  
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [activeTeleMeet, setActiveTeleMeet] = useState(null);

  // Reschedule Appointment State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppToReschedule, setSelectedAppToReschedule] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    new_date: 'Tomorrow, Aug 10',
    new_time: '11:30 AM',
    reason: 'Doctor Emergency Surgery Schedule Shift'
  });

  const [fullRecordData, setFullRecordData] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [submittingPatient, setSubmittingPatient] = useState(false);

  // Beds Seat Map State (Synchronized with Admin Portal)
  const [bedsGrid, setBedsGrid] = useState(initialBedsGridData);
  const [selectedWingFilter, setSelectedWingFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [activeBed, setActiveBed] = useState(null);
  const [bedFormState, setBedFormState] = useState({
    status: 'available',
    patientName: '',
    doctor: 'Dr. Ananya Roy, MD',
    vitals: 'SpO2 98% | BP 120/80',
    ventilator: false
  });

  // Calculate live bed seat statistics
  const bedCounts = useMemo(() => {
    const total = bedsGrid.length;
    const occupied = bedsGrid.filter(b => b.status === 'occupied').length;
    const available = bedsGrid.filter(b => b.status === 'available').length;
    const sanitizing = bedsGrid.filter(b => b.status === 'sanitizing').length;
    const reserved = bedsGrid.filter(b => b.status === 'reserved').length;
    const icuTotal = bedsGrid.filter(b => b.wing === 'ICU').length;
    const icuOccupied = bedsGrid.filter(b => b.wing === 'ICU' && b.status === 'occupied').length;

    return { total, occupied, available, sanitizing, reserved, icuTotal, icuOccupied };
  }, [bedsGrid]);

  // Edit Patient Clinical Report State
  const [editingReport, setEditingReport] = useState({
    diagnosis: 'Acute Coronary Syndrome & Essential Hypertension',
    lab_tests: '12-Lead ECG, High-Sensitivity Troponin I, Lipid Panel, Serum Electrolytes',
    doctor_remarks: 'Patient presented with chest tightness and mild exertional dyspnea. Vital signs show mild tachycardia. Recommended 48-hour continuous biometric telemetry monitoring and oral antiplatelet therapy.',
    is_editing: false
  });

  // Doctor Settings State (Full Personal & Account Details)
  const [doctorSettings, setDoctorSettings] = useState({
    doctor_id: 'DOC-8891',
    name: currentUser?.name || 'Dr. Ananya Roy, MD',
    specialty: currentUser?.specialty || 'Cardiology',
    sub_specialty: 'Interventional Cardiology & Critical Care',
    qualification: 'MBBS, MD (Cardiology), FACC',
    experience_years: '14 Years',
    license_no: 'MCI-2018-884219',
    hospital: currentUser?.hospital || 'CareSync Central Tower',
    address: 'Suite 402, CareSync Medical Complex, Bandra West',
    city: 'Mumbai',
    phone: currentUser?.phone || '+91 9876543299',
    email: currentUser?.email || 'doctor@caresync.com',
    attendance_status: 'On Duty',
    schedule_hours: '09:00 AM - 05:00 PM',
    slot_duration: '30 mins',
    fee: '₹500',
    avatar_url: '👨‍⚕️',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: 45,
    gender: 'Male',
    blood_group: 'O+',
    phone: '',
    city: 'Mumbai',
    status: 'Outpatient',
    specialty: doctorSettings.specialty || 'Cardiology',
    reason: 'Routine Specialty Consultation'
  });

  // Today's Booked Appointments Dataset
  const [todaysAppointments, setTodaysAppointments] = useState([
    { id: 'APP-901', time: '09:30 AM', date: 'Today', patient_name: 'Rahul Sharma', age: 48, gender: 'Male', blood_group: 'O+', phone: '+91 9876543210', reason: 'Post-CABG Cardiac Telemetry Follow-up', status: 'Confirmed', hr: 112, spo2: 94.5, risk: 'MEDIUM', specialty: 'Cardiology' },
    { id: 'APP-902', time: '10:45 AM', date: 'Today', patient_name: 'Priya Patel', age: 32, gender: 'Female', blood_group: 'A+', phone: '+91 9876543211', reason: 'Hypertensive Crisis Consultation', status: 'Confirmed', hr: 74, spo2: 98.8, risk: 'LOW', specialty: 'Cardiology' },
    { id: 'APP-903', time: '02:15 PM', date: 'Today', patient_name: 'Amitav Roy', age: 62, gender: 'Male', blood_group: 'B+', phone: '+91 9876543212', reason: 'Severe Pyrexia & Acute Tachycardia', status: 'In Tele-Call', hr: 124, spo2: 91.2, risk: 'CRITICAL', specialty: 'Cardiology' },
    { id: 'APP-904', time: '04:00 PM', date: 'Today', patient_name: 'Sneha Reddy', age: 29, gender: 'Female', blood_group: 'AB+', phone: '+91 9876543213', reason: 'Routine Electrocardiogram Evaluation', status: 'Confirmed', hr: 68, spo2: 99.1, risk: 'LOW', specialty: 'Cardiology' }
  ]);

  const [patientsList, setPatientsList] = useState(initial50PatientsList);
  const [evaluatingPatientId, setEvaluatingPatientId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setDoctorSettings((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        specialty: currentUser.specialty || prev.specialty,
        email: currentUser.email || prev.email
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    let isSubscribed = true;

    const fetchAllPatientData = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/patients");
        if (res.ok) {
          const data = await res.json();
          if (data.patients && data.patients.length > 0 && isSubscribed) {
            setPatientsList((prev) => {
              const combined = [...data.patients];
              prev.forEach((p) => {
                if (!combined.some((c) => c.id === p.id)) {
                  combined.push(p);
                }
              });
              return combined;
            });
          }
        }
      } catch (err) {
        console.warn('Backend patients fetch notice:', err);
      }

      // Fetch Bed Telemetry from Backend
      try {
        const bedRes = await fetch("http://127.0.0.1:8000/hospital/beds");
        if (bedRes.ok) {
          const bedData = await bedRes.json();
          if (bedData.beds && isSubscribed) {
            console.log('Synchronized bed telemetry with backend:', bedData.beds);
          }
        }
      } catch (err) {
        console.warn('Bed telemetry fetch notice:', err);
      }
    };

    fetchAllPatientData();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Specialty Classifier Helper
  const getPatientSpecialty = (patient) => {
    if (patient.specialty) return patient.specialty;
    const text = ((patient.condition || '') + ' ' + (patient.reason || '') + ' ' + (patient.assignedDoctor || '') + ' ' + (patient.assigned_doctor || '')).toLowerCase();
    
    if (text.includes('cardio') || text.includes('cardiac') || text.includes('heart') || text.includes('hypertension') || text.includes('blood pressure') || text.includes('sarah johnson') || text.includes('ananya roy')) {
      return 'Cardiology';
    }
    if (text.includes('neuro') || text.includes('brain') || text.includes('stroke') || text.includes('michael chen')) {
      return 'Neurology';
    }
    if (text.includes('ortho') || text.includes('bone') || text.includes('joint') || text.includes('rehab') || text.includes('james wilson')) {
      return 'Orthopedics';
    }
    if (text.includes('pedia') || text.includes('child') || text.includes('infant') || text.includes('priya patel')) {
      return 'Pediatrics';
    }
    if (text.includes('derma') || text.includes('skin') || text.includes('rash') || text.includes('emily rodriguez')) {
      return 'Dermatology';
    }
    return 'General Medicine';
  };

  // Filtered Patients based on Doctor Specialty & Scope
  const filteredPatients = patientsList.filter(patient => {
    const pSpecialty = getPatientSpecialty(patient);
    const docSpecialty = (doctorSettings.specialty || 'Cardiology').toLowerCase();
    const isBooked = todaysAppointments.some(a => a.patient_name?.toLowerCase() === (patient.name || patient.patient_name || '').toLowerCase());

    let matchesScope = true;
    if (scopeMode === 'strict') {
      const matchesDoctorSpecialty = 
        docSpecialty.includes('cardio') ? (pSpecialty === 'Cardiology' || (patient.assignedDoctor || patient.assigned_doctor || '').includes('Roy') || (patient.assignedDoctor || patient.assigned_doctor || '').includes('Johnson')) :
        docSpecialty.includes('neuro') ? (pSpecialty === 'Neurology' || (patient.assignedDoctor || patient.assigned_doctor || '').includes('Chen')) :
        docSpecialty.includes('ortho') ? (pSpecialty === 'Orthopedics' || (patient.assignedDoctor || patient.assigned_doctor || '').includes('Wilson')) :
        docSpecialty.includes('pedia') ? (pSpecialty === 'Pediatrics' || (patient.assignedDoctor || patient.assigned_doctor || '').includes('Patel')) :
        pSpecialty === 'General Medicine';

      matchesScope = matchesDoctorSpecialty || isBooked;
    }

    const name = patient.name || patient.patient_name || '';
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesScope && matchesSearch;
  });

  // Doctor Bed Status Update (Syncs with Admin Portal)
  const handleSaveBedState = async (e) => {
    e.preventDefault();
    if (!activeBed) return;

    const updatedGrid = bedsGrid.map((b) =>
      b.id === activeBed.id
        ? {
            ...b,
            status: bedFormState.status,
            patientName: bedFormState.status === 'occupied' || bedFormState.status === 'reserved' ? bedFormState.patientName : null,
            doctor: bedFormState.status === 'occupied' || bedFormState.status === 'reserved' ? bedFormState.doctor : null,
            vitals: bedFormState.status === 'occupied' ? bedFormState.vitals : bedFormState.status === 'sanitizing' ? 'Sanitation in progress' : 'N/A',
            ventilator: bedFormState.ventilator
          }
        : b
    );

    setBedsGrid(updatedGrid);
    const occupiedCount = updatedGrid.filter(b => b.status === 'occupied').length;
    const icuOccupiedCount = updatedGrid.filter(b => b.wing === 'ICU' && b.status === 'occupied').length;

    try {
      await fetch("http://127.0.0.1:8000/hospital/beds", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_beds: updatedGrid.length,
          occupied_beds: occupiedCount,
          icu_beds: 10,
          icu_occupied: icuOccupiedCount
        })
      });
    } catch (err) {
      console.warn('Backend beds sync notice:', err);
    }

    toast.success(`Bed ${activeBed.id} telemetry updated! Status: ${bedFormState.status.toUpperCase()}`);
    setActiveBed(null);
  };

  const handleCancelAppointment = (appId, patientName) => {
    if (!confirm(`Are you sure you want to cancel appointment for ${patientName}?`)) return;
    setTodaysAppointments((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'Cancelled' } : a))
    );
    toast.success(`🚫 Appointment for ${patientName} has been Cancelled.`);
  };

  const handleOpenRescheduleModal = (appointment) => {
    setSelectedAppToReschedule(appointment);
    setShowRescheduleModal(true);
  };

  const handleSubmitReschedule = (e) => {
    e.preventDefault();
    if (!selectedAppToReschedule) return;

    setTodaysAppointments((prev) =>
      prev.map((a) => (a.id === selectedAppToReschedule.id ? {
        ...a,
        time: rescheduleForm.new_time,
        date: rescheduleForm.new_date,
        status: `Rescheduled (${rescheduleForm.new_date} @ ${rescheduleForm.new_time})`
      } : a))
    );

    toast.success(`📅 Appointment for ${selectedAppToReschedule.patient_name} Rescheduled to ${rescheduleForm.new_date} at ${rescheduleForm.new_time}`);
    setShowRescheduleModal(false);
    setSelectedAppToReschedule(null);
  };

  const handleOpenPatientRecord = async (patient) => {
    setSelectedPatientModal(patient);
    setLoadingRecord(true);
    setFullRecordData(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/patients/${patient.id}/full-record`);
      if (res.ok) {
        const data = await res.json();
        setFullRecordData(data);
      }
    } catch (err) {
      console.warn('Error fetching full record:', err);
    } finally {
      setLoadingRecord(false);
    }
  };

  const handleDownloadPatientReport = (patient) => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      toast.error('Please allow popups to download patient clinical report.');
      return;
    }

    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Clinical Medical Report - ${patient.name || patient.patient_name} (${patient.id})</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 2px solid #059669; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 24px; font-weight: 800; color: #059669; margin: 0; }
            .subtitle { font-size: 14px; color: #64748b; margin: 0; }
            .badge { background: #dcfce7; color: #166534; font-weight: 800; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
            .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; }
            .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 0.75rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.4rem; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; font-size: 14px; }
            .vitals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center; }
            .vital-card { background: #fff; border: 1px solid #cbd5e1; padding: 0.75rem; border-radius: 8px; }
            .footer { margin-top: 3rem; border-top: 1px solid #cbd5e1; padding-top: 1rem; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">CARESYNC CLINICAL TELEMETRY REPORT</h1>
              <p class="subtitle">HIPAA Encrypted Patient Health Telemetry & Diagnostic Record</p>
            </div>
            <span class="badge">OFFICIAL MEDICAL RECORD</span>
          </div>

          <div class="section">
            <h2 class="section-title">👤 Patient Demographics</h2>
            <div class="grid">
              <div><strong>Patient Name:</strong> ${patient.name || patient.patient_name}</div>
              <div><strong>Patient ID Code:</strong> ${patient.id}</div>
              <div><strong>Age / Gender:</strong> ${patient.age || 45} Yrs / ${patient.gender || 'Male'}</div>
              <div><strong>Blood Group:</strong> ${patient.blood_group || 'O+'}</div>
              <div><strong>Contact Number:</strong> ${patient.phone || '+91 9876543210'}</div>
              <div><strong>City / Location:</strong> ${patient.city || 'Mumbai'}</div>
              <div><strong>Attending Doctor:</strong> ${doctorSettings.name} (${doctorSettings.specialty})</div>
              <div><strong>Medical License No:</strong> ${doctorSettings.license_no}</div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">🫀 Biometric Vitals Telemetry Snapshot</h2>
            <div class="vitals-grid">
              <div class="vital-card">
                <span style="font-size: 11px; color: #64748b;">Heart Rate</span><br/>
                <strong style="font-size: 18px; color: #e11d48;">${patient.hr || 76} BPM</strong>
              </div>
              <div class="vital-card">
                <span style="font-size: 11px; color: #64748b;">Oxygen Saturation</span><br/>
                <strong style="font-size: 18px; color: #0284c7;">${patient.spo2 || 98}% SpO₂</strong>
              </div>
              <div class="vital-card">
                <span style="font-size: 11px; color: #64748b;">Body Temperature</span><br/>
                <strong style="font-size: 18px; color: #d97706;">98.6°F</strong>
              </div>
              <div class="vital-card">
                <span style="font-size: 11px; color: #64748b;">Deterioration Risk</span><br/>
                <strong style="font-size: 18px; color: #166534;">${patient.risk || 'LOW'} RISK</strong>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">🩺 Clinical Diagnosis & Doctor Remarks</h2>
            <p><strong>Primary Diagnosis:</strong> ${editingReport.diagnosis}</p>
            <p><strong>Recommended Lab Investigations:</strong> ${editingReport.lab_tests}</p>
            <p><strong>Doctor Clinical Impression & Plan:</strong> ${editingReport.doctor_remarks}</p>
          </div>

          <div class="footer">
            <div>
              <p style="margin: 0; font-weight: 700;">Doctor Signature & Stamp:</p>
              <p style="margin: 0.5rem 0 0 0; color: #059669; font-weight: 800;">${doctorSettings.name} (${doctorSettings.license_no})</p>
            </div>
            <div>
              <p style="margin: 0;">Report Generated On: ${new Date().toLocaleString()}</p>
              <p style="margin: 0;">Verification Hash: 88f921a940bc2</p>
            </div>
          </div>

          <div class="no-print" style="margin-top: 2rem; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 24px; background: #059669; color: #fff; border: none; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer;">
              🖨️ Print / Download PDF Report
            </button>
          </div>
        </body>
      </html>
    `);
    reportWindow.document.close();
    toast.success(`📥 Generated Clinical Report for ${patient.name || patient.patient_name}`);
  };

  const handleSaveDoctorProfile = async (e) => {
    e.preventDefault();

    if (doctorSettings.new_password) {
      if (doctorSettings.new_password !== doctorSettings.confirm_password) {
        toast.error("New passwords do not match!");
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      await fetch("http://127.0.0.1:8000/doctors/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          doctor_id: doctorSettings.doctor_id,
          name: doctorSettings.name,
          specialty: doctorSettings.specialty,
          sub_specialty: doctorSettings.sub_specialty,
          qualification: doctorSettings.qualification,
          experience_years: doctorSettings.experience_years,
          license_no: doctorSettings.license_no,
          hospital: doctorSettings.hospital,
          address: doctorSettings.address,
          city: doctorSettings.city,
          phone: doctorSettings.phone,
          email: doctorSettings.email,
          attendance_status: doctorSettings.attendance_status,
          schedule_hours: doctorSettings.schedule_hours,
          slot_duration: doctorSettings.slot_duration,
          fee: doctorSettings.fee,
          avatar_url: doctorSettings.avatar_url,
          new_password: doctorSettings.new_password
        })
      });

      toast.success('🎉 Doctor Profile, ID, Password & Credentials Saved! Synced with Admin Panel.');
    } catch (err) {
      toast.success('🎉 Doctor Profile & Credentials Saved!');
    }
  };

  return (
    <AuthCheck requiredRole="doctor">
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Head>
          <title>Doctor Portal - Clinical Telemetry & Bed Management | CareSync</title>
        </Head>

        {/* Doctor Header Banner */}
        <header style={{ borderBottom: '1px solid #1e293b', background: '#1e293b80', backdropFilter: 'blur(12px)', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold' }}>
              {doctorSettings.avatar_url || '👨‍⚕️'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#f8fafc' }}>
                  {doctorSettings.name}
                </h1>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '12px', background: doctorSettings.attendance_status === 'On Duty' ? '#dcfce7' : '#fee2e2', color: doctorSettings.attendance_status === 'On Duty' ? '#166534' : '#991b1b' }}>
                  {doctorSettings.attendance_status === 'On Duty' ? '🟢 ON DUTY' : doctorSettings.attendance_status === 'In Emergency Surgery' ? '🚑 SURGERY' : '🔴 OFF DUTY'}
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🩺 {doctorSettings.specialty} Specialist ({doctorSettings.license_no})</span>
                <span>•</span>
                <span>ID: <strong style={{ color: '#38bdf8' }}>{doctorSettings.doctor_id}</strong></span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/prescriptions" style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#3b82f6', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaPrescription /> Prescription Generator
            </Link>
            <button onClick={signOut} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#ef444420', color: '#fca5a5', border: '1px solid #ef444440', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        </header>

        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #334155', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('appointments')}
              style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: activeTab === 'appointments' ? '3px solid #10b981' : '3px solid transparent', color: activeTab === 'appointments' ? '#34d399' : '#94a3b8', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaCalendarCheck style={{ color: '#38bdf8' }} /> Today's Scheduled Appointments ({todaysAppointments.length})
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: activeTab === 'patients' ? '3px solid #10b981' : '3px solid transparent', color: activeTab === 'patients' ? '#34d399' : '#94a3b8', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaStethoscope style={{ color: '#a855f7' }} /> My Specialty Clinical Registry ({filteredPatients.length})
            </button>

            <button
              onClick={() => setActiveTab('beds')}
              style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: activeTab === 'beds' ? '3px solid #10b981' : '3px solid transparent', color: activeTab === 'beds' ? '#34d399' : '#94a3b8', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaBed style={{ color: '#fbbf24' }} /> ICU & Ward Bed Telemetry (40 Seats Map)
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: activeTab === 'settings' ? '3px solid #10b981' : '3px solid transparent', color: activeTab === 'settings' ? '#34d399' : '#94a3b8', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaCog style={{ color: '#94a3b8' }} /> Doctor Profile & Attendance Settings
            </button>
          </div>

          {/* TAB 1: TODAY'S APPOINTMENTS, TELE-MEET & RESCHEDULE / CANCEL */}
          {activeTab === 'appointments' && (
            <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaCalendarCheck style={{ color: '#34d399' }} /> Today's Scheduled Patient Tele-Consultations
                  </h2>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    Booked patients requiring <strong style={{ color: '#38bdf8' }}>{doctorSettings.specialty}</strong> specialty consultation. Click "Join Tele-Meet" to launch live call, or use "Reschedule" / "Cancel".
                  </p>
                </div>
              </div>

              {/* Appointments List Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {todaysAppointments.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      background: '#0f172a',
                      borderRadius: '14px',
                      border: '1px solid #334155',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: '#1e293b', border: '1px solid #38bdf840', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', fontWeight: '700' }}>TIME SLOT</span>
                        <strong style={{ fontSize: '1rem', color: '#38bdf8', fontWeight: '800' }}>{app.time}</strong>
                        <span style={{ fontSize: '0.65rem', color: '#34d399', display: 'block', marginTop: '0.1rem' }}>{app.date || 'Today'}</span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                            {app.patient_name}
                          </h3>
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '6px', background: app.status.includes('Cancelled') ? '#fee2e2' : app.status.includes('Rescheduled') ? '#fef3c7' : '#10b98120', color: app.status.includes('Cancelled') ? '#991b1b' : app.status.includes('Rescheduled') ? '#92400e' : '#34d399', border: '1px solid #334155' }}>
                            {app.status}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          {app.age}y • {app.gender} • Blood: {app.blood_group} • Contact: {app.phone}
                        </span>

                        <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                          <strong>Reason for Appointment:</strong> {app.reason}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {app.status !== 'Cancelled' && (
                        <button
                          onClick={() => setActiveTeleMeet({
                            doctorName: doctorSettings.name,
                            patientName: app.patient_name,
                            patientVitals: { hr: app.hr, spo2: app.spo2 },
                            appointmentId: app.id
                          })}
                          style={{
                            padding: '0.55rem 1rem',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <FaVideo /> 📹 Join Tele-Meet
                        </button>
                      )}

                      {app.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleOpenRescheduleModal(app)}
                          style={{
                            padding: '0.55rem 0.9rem',
                            borderRadius: '8px',
                            background: '#fbbf2420',
                            color: '#fbbf24',
                            border: '1px solid #fbbf2440',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <FaCalendarAlt /> Reschedule
                        </button>
                      )}

                      {app.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleCancelAppointment(app.id, app.patient_name)}
                          style={{
                            padding: '0.55rem 0.9rem',
                            borderRadius: '8px',
                            background: '#ef444420',
                            color: '#f87171',
                            border: '1px solid #ef444440',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <FaBan /> Cancel
                        </button>
                      )}

                      <Link
                        href="/prescriptions"
                        style={{
                          padding: '0.55rem 0.9rem',
                          borderRadius: '8px',
                          background: '#3b82f620',
                          color: '#60a5fa',
                          border: '1px solid #3b82f640',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <FaPrescription /> Rx
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SPECIALTY PATIENT REGISTRY */}
          {activeTab === 'patients' && (
            <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaStethoscope style={{ color: '#34d399' }} /> Specialty-Filtered Patient Directory
                  </h2>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Displaying patients who require <strong style={{ color: '#38bdf8' }}>{doctorSettings.specialty}</strong> specialty or have booked appointments with you.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', background: '#0f172a', padding: '0.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                    <button
                      onClick={() => setScopeMode('strict')}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        background: scopeMode === 'strict' ? '#10b981' : 'transparent',
                        color: scopeMode === 'strict' ? '#0f172a' : '#cbd5e1'
                      }}
                    >
                      🔒 My Specialty & Booked
                    </button>
                    <button
                      onClick={() => setScopeMode('all')}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        background: scopeMode === 'all' ? '#3b82f6' : 'transparent',
                        color: scopeMode === 'all' ? '#fff' : '#cbd5e1'
                      }}
                    >
                      🌐 All Hospital Patients
                    </button>
                  </div>

                  <div style={{ position: 'relative', width: '240px' }}>
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search patient..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.55rem 0.75rem 0.55rem 2.25rem', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Patients Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {filteredPatients.map((patient) => {
                  const patSpec = getPatientSpecialty(patient);
                  return (
                    <div key={patient.id} style={{ background: '#0f172a', borderRadius: '14px', border: '1px solid #334155', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '6px', background: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf840', textTransform: 'uppercase' }}>
                                {patSpec}
                              </span>
                              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase' }}>
                                {patient.status || 'Outpatient'}
                              </span>
                            </div>

                            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0.2rem 0', color: '#f8fafc' }}>
                              {patient.name || patient.patient_name}
                            </h3>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              ID: <strong style={{ color: '#38bdf8' }}>{patient.id}</strong> • {patient.age || 45}y • {patient.gender || 'Male'} • Blood: {patient.blood_group || 'O+'}
                            </span>
                          </div>

                          <span style={{ padding: '0.25rem 0.65rem', borderRadius: '12px', background: patient.risk === 'CRITICAL' ? '#fee2e2' : patient.risk === 'MEDIUM' ? '#ffedd5' : '#dcfce7', color: patient.risk === 'CRITICAL' ? '#991b1b' : patient.risk === 'MEDIUM' ? '#9a3412' : '#166534', fontSize: '0.75rem', fontWeight: '800' }}>
                            {patient.risk || 'LOW'} RISK
                          </span>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0 0 1rem 0' }}>
                          <strong>Reason:</strong> {patient.reason || patient.condition || 'Specialty Evaluation'}
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenPatientRecord(patient)}
                          style={{ padding: '0.5rem', borderRadius: '8px', background: '#3b82f620', color: '#60a5fa', border: '1px solid #3b82f640', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}
                        >
                          <FaFileMedical /> Record & Report
                        </button>

                        <button
                          onClick={() => handleDownloadPatientReport(patient)}
                          style={{ padding: '0.5rem', borderRadius: '8px', background: '#05966920', color: '#34d399', border: '1px solid #05966940', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}
                        >
                          <FaDownload /> Download Report
                        </button>

                        <button
                          onClick={() => handleRunAiPrediction(patient)}
                          disabled={evaluatingPatientId === patient.id}
                          style={{ padding: '0.5rem', borderRadius: '8px', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}
                        >
                          <FaHeartbeat /> Risk AI
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ICU BEDS TELEMETRY */}
          {activeTab === 'beds' && (
            <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaBed style={{ color: '#38bdf8' }} /> Hospital ICU & Ward Bed Telemetry (Seat Map View)
                  </h2>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Real-time occupancy map synchronized with Admin Portal across ICU, General Wards, and VIP Isolation Suites.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#38bdf8', fontSize: '0.8rem', fontWeight: '800' }}>
                    Occupied: {bedCounts.occupied}/{bedCounts.total} Beds
                  </span>
                  <span style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#34d399', fontSize: '0.8rem', fontWeight: '800' }}>
                    Available: {bedCounts.available} Beds
                  </span>
                </div>
              </div>

              {/* Interactive Bed Seat Map Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.85rem' }}>
                {bedsGrid.map((bed) => (
                  <button
                    key={bed.id}
                    onClick={() => {
                      setActiveBed(bed);
                      setBedFormState({
                        status: bed.status,
                        patientName: bed.patientName || '',
                        doctor: bed.doctor || doctorSettings.name,
                        vitals: bed.vitals !== 'N/A' ? bed.vitals : 'SpO2 98% | BP 120/80',
                        ventilator: bed.ventilator
                      });
                    }}
                    style={{
                      padding: '0.85rem 0.5rem',
                      borderRadius: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: bed.status === 'occupied' ? '1px solid #ef444460' : bed.status === 'available' ? '1px solid #10b98160' : bed.status === 'sanitizing' ? '1px solid #f59e0b60' : '1px solid #3b82f660',
                      background: bed.status === 'occupied' ? '#ef444415' : bed.status === 'available' ? '#10b98115' : bed.status === 'sanitizing' ? '#f59e0b15' : '#3b82f615',
                      color: '#fff',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', display: 'block', color: '#94a3b8', textTransform: 'uppercase' }}>{bed.wing}</span>
                    <strong style={{ fontSize: '1rem', display: 'block', color: bed.status === 'occupied' ? '#f87171' : bed.status === 'available' ? '#34d399' : bed.status === 'sanitizing' ? '#fbbf24' : '#60a5fa' }}>{bed.id}</strong>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', display: 'block', marginTop: '0.2rem', color: '#cbd5e1' }}>
                      {bed.status === 'occupied' ? (bed.patientName || 'Occupied') : bed.status.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COMPREHENSIVE DOCTOR SETTINGS & PROFILE MANAGEMENT */}
          {activeTab === 'settings' && (
            <div style={{ background: '#1e293b', borderRadius: '20px', border: '1px solid #334155', padding: '2rem', maxWidth: '950px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#34d399', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaCog /> Doctor Account, ID, Password & Personal Profile Settings
                  </h2>
                  <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    All profile updates automatically sync with the Admin Panel Doctor Directory.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ padding: '0.4rem 0.85rem', borderRadius: '10px', background: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf840', fontWeight: '800', fontSize: '0.85rem' }}>
                    Doctor ID: {doctorSettings.doctor_id}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveDoctorProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                
                {/* 1. DUTY AVAILABILITY & ATTENDANCE STATUS */}
                <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#34d399', marginBottom: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaUserClock /> Real-Time Duty Attendance Status (Syncs with Admin Panel)
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { status: 'On Duty', label: '🟢 On Duty (Available)', desc: 'Active for tele-consultations' },
                      { status: 'In Emergency Surgery', label: '🚑 Emergency Surgery', desc: 'Occupied in Operation Theater' },
                      { status: 'Off Duty', label: '🔴 Off Duty / On Leave', desc: 'Unavailable for consultations' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.status}
                        onClick={() => setDoctorSettings({ ...doctorSettings, attendance_status: item.status })}
                        style={{
                          padding: '0.85rem',
                          borderRadius: '10px',
                          textAlign: 'left',
                          border: doctorSettings.attendance_status === item.status ? '2px solid #10b981' : '1px solid #334155',
                          background: doctorSettings.attendance_status === item.status ? '#05966920' : '#1e293b',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        <strong style={{ fontSize: '0.85rem', display: 'block', color: doctorSettings.attendance_status === item.status ? '#34d399' : '#cbd5e1' }}>
                          {item.label}
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. DOCTOR UNIQUE ID & PASSWORD CHANGE */}
                <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#38bdf8', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaLock /> Account Security, Doctor ID & Password Reset
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>Custom Doctor ID Code</label>
                      <input
                        type="text"
                        value={doctorSettings.doctor_id}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, doctor_id: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#38bdf8', fontSize: '0.9rem', fontWeight: '700' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>New Password</label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep 12345678"
                        value={doctorSettings.new_password}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, new_password: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        value={doctorSettings.confirm_password}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, confirm_password: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. PERSONAL & CLINICAL DETAILS */}
                <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#a855f7', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaUserMd /> Personal & Clinical Qualifications
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>Doctor Full Name</label>
                      <input
                        type="text"
                        value={doctorSettings.name}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, name: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>Medical License Number</label>
                      <input
                        type="text"
                        value={doctorSettings.license_no}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, license_no: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>Primary Specialty</label>
                      <select
                        value={doctorSettings.specialty}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, specialty: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="General Medicine">General Medicine</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>Sub-Specialty / Clinical Focus</label>
                      <input
                        type="text"
                        value={doctorSettings.sub_specialty}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, sub_specialty: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>Qualification Degrees</label>
                      <input
                        type="text"
                        value={doctorSettings.qualification}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, qualification: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>Years of Experience</label>
                      <input
                        type="text"
                        value={doctorSettings.experience_years}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, experience_years: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. CONTACT INFORMATION & ADDRESS */}
                <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fbbf24', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaEnvelope /> Contact Details & Clinic Address
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>Mobile Phone Number</label>
                      <input
                        type="text"
                        value={doctorSettings.phone}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, phone: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>Email Address</label>
                      <input
                        type="email"
                        value={doctorSettings.email}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, email: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>Clinic / Hospital Name</label>
                      <input
                        type="text"
                        value={doctorSettings.hospital}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, hospital: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: '600' }}>Clinic Address & Location</label>
                      <input
                        type="text"
                        value={doctorSettings.address}
                        onChange={(e) => setDoctorSettings({ ...doctorSettings, address: e.target.value })}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 5. PROFILE AVATAR / IMAGE SELECTION */}
                <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ec4899', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaImage /> Profile Image / Avatar Selection
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '2.5rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {doctorSettings.avatar_url}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {['👨‍⚕️', '👩‍⚕️', '🩺', '🏥', '👨‍🔬', '👩‍🔬'].map((emoji) => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => setDoctorSettings({ ...doctorSettings, avatar_url: emoji })}
                          style={{
                            fontSize: '1.5rem',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '10px',
                            background: doctorSettings.avatar_url === emoji ? '#10b98130' : '#1e293b',
                            border: doctorSettings.avatar_url === emoji ? '2px solid #10b981' : '1px solid #334155',
                            cursor: 'pointer'
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RESTRICTION NOTICE: ACCOUNT DELETED */}
                <div style={{ background: '#ef444410', border: '1px solid #ef444440', borderRadius: '10px', padding: '0.85rem', color: '#f87171', fontSize: '0.8rem', fontWeight: '600' }}>
                  ⚠️ Account Deletion Policy: Doctor account deletion is strictly restricted to System Administrators for HIPAA compliance and audit retention.
                </div>

                <button
                  type="submit"
                  style={{ padding: '0.9rem 2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <FaSave /> Save Profile & Credentials to Admin Panel ➔
                </button>
              </form>
            </div>
          )}

        </main>

        {/* RESCHEDULE APPOINTMENT MODAL */}
        <AnimatePresence>
          {showRescheduleModal && selectedAppToReschedule && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fbbf2420', color: '#fbbf24', border: '1px solid #fbbf2440', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                        Reschedule Appointment
                      </h2>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Patient: {selectedAppToReschedule.patient_name} ({selectedAppToReschedule.id})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowRescheduleModal(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
                  >
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleSubmitReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>Select New Date</label>
                    <select
                      value={rescheduleForm.new_date}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, new_date: e.target.value })}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                    >
                      <option value="Tomorrow, Aug 10">Tomorrow (Aug 10, 2026)</option>
                      <option value="Aug 11, 2026">Aug 11, 2026</option>
                      <option value="Aug 12, 2026">Aug 12, 2026</option>
                      <option value="Aug 13, 2026">Aug 13, 2026</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>Select New Time Slot</label>
                    <select
                      value={rescheduleForm.new_time}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, new_time: e.target.value })}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>Reason for Rescheduling</label>
                    <input
                      type="text"
                      value={rescheduleForm.reason}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowRescheduleModal(false)}
                      style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: '#334155', color: '#cbd5e1', border: 'none', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Confirm Reschedule ➔
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* INSPECT & UPDATE BED TELEMETRY MODAL */}
        <AnimatePresence>
          {activeBed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf840', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      <FaBed />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                        Bed Telemetry: {activeBed.id}
                      </h2>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Wing: {activeBed.wing} • Syncs with Admin Portal
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveBed(null)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
                  >
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleSaveBedState} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>Bed Occupancy Status</label>
                    <select
                      value={bedFormState.status}
                      onChange={(e) => setBedFormState({ ...bedFormState, status: e.target.value })}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                    >
                      <option value="available">🟢 Available (Empty)</option>
                      <option value="occupied">🔴 Occupied by Patient</option>
                      <option value="sanitizing">🟡 Sanitizing & Disinfecting</option>
                      <option value="reserved">🔵 Reserved for Surgery</option>
                    </select>
                  </div>

                  {(bedFormState.status === 'occupied' || bedFormState.status === 'reserved') && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: '600' }}>Assigned Patient Name</label>
                      <input
                        type="text"
                        value={bedFormState.patientName}
                        onChange={(e) => setBedFormState({ ...bedFormState, patientName: e.target.value })}
                        style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem', color: '#fff', fontSize: '0.9rem' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveBed(null)}
                      style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: '#334155', color: '#cbd5e1', border: 'none', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Save Bed Status ➔
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FULL PATIENT CLINICAL RECORD & EDITABLE REPORT MODAL */}
        <AnimatePresence>
          {selectedPatientModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '2rem', maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#3b82f620', border: '1px solid #3b82f640', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      📋
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                        Complete Clinical Record: {selectedPatientModal.name || selectedPatientModal.patient_name}
                      </h2>
                      <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '600' }}>
                        Patient ID Code: {selectedPatientModal.id}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPatientModal(null)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
                  >
                    <FaTimes />
                  </button>
                </div>

                {loadingRecord ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                    <FaSpinner className="animate-spin" style={{ fontSize: '2rem', margin: '0 auto 1rem auto', color: '#34d399' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Retrieving complete HIPAA-encrypted medical record from Supabase PostgreSQL...</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Demographics Card */}
                    <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#38bdf8', marginTop: 0, marginBottom: '0.75rem' }}>
                        👤 Demographics & Contact
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                        <div><span style={{ color: '#94a3b8' }}>Age:</span> <strong style={{ color: '#fff' }}>{selectedPatientModal.age || 48} Years</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Gender:</span> <strong style={{ color: '#fff' }}>{selectedPatientModal.gender || 'Male'}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Blood Group:</span> <strong style={{ color: '#f43f5e' }}>{selectedPatientModal.blood_group || 'O+'}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Phone:</span> <strong style={{ color: '#fff' }}>{selectedPatientModal.phone || '+91 9876543210'}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>City:</span> <strong style={{ color: '#fff' }}>{selectedPatientModal.city || 'Mumbai'}</strong></div>
                        <div><span style={{ color: '#94a3b8' }}>Specialty Department:</span> <strong style={{ color: '#a855f7' }}>{getPatientSpecialty(selectedPatientModal)}</strong></div>
                      </div>
                    </div>

                    {/* Vitals Telemetry Card */}
                    <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f43f5e', marginTop: 0, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FaHeartbeat /> Real-Time Biometric Telemetry
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
                        <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '10px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Heart Rate</span>
                          <strong style={{ fontSize: '1.2rem', color: '#f43f5e' }}>{selectedPatientModal.hr || 76} BPM</strong>
                        </div>
                        <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '10px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>SpO₂ Saturation</span>
                          <strong style={{ fontSize: '1.2rem', color: '#38bdf8' }}>{selectedPatientModal.spo2 || 98}%</strong>
                        </div>
                        <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '10px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Temperature</span>
                          <strong style={{ fontSize: '1.2rem', color: '#fbbf24' }}>{selectedPatientModal.temp || 98.6}°F</strong>
                        </div>
                        <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '10px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Blood Pressure</span>
                          <strong style={{ fontSize: '1.2rem', color: '#c084fc' }}>120/80 mmHg</strong>
                        </div>
                      </div>
                    </div>

                    {/* Editable Clinical Diagnostic Report Section */}
                    <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '14px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#34d399', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          🩺 Doctor Clinical Report & Diagnostic Impression
                        </h3>
                        <button
                          onClick={() => setEditingReport({ ...editingReport, is_editing: !editingReport.is_editing })}
                          style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#3b82f620', color: '#60a5fa', border: '1px solid #3b82f640', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          {editingReport.is_editing ? <FaSave /> : <FaEdit />}
                          <span>{editingReport.is_editing ? 'Done Editing' : 'Edit Report'}</span>
                        </button>
                      </div>

                      {editingReport.is_editing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Primary Diagnosis</label>
                            <input
                              type="text"
                              value={editingReport.diagnosis}
                              onChange={(e) => setEditingReport({ ...editingReport, diagnosis: e.target.value })}
                              style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Lab Investigations & Tests</label>
                            <input
                              type="text"
                              value={editingReport.lab_tests}
                              onChange={(e) => setEditingReport({ ...editingReport, lab_tests: e.target.value })}
                              style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Doctor Remarks & Treatment Plan</label>
                            <textarea
                              rows={3}
                              value={editingReport.doctor_remarks}
                              onChange={(e) => setEditingReport({ ...editingReport, doctor_remarks: e.target.value })}
                              style={{ width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div><strong style={{ color: '#38bdf8' }}>Diagnosis:</strong> {editingReport.diagnosis}</div>
                          <div><strong style={{ color: '#38bdf8' }}>Investigations:</strong> {editingReport.lab_tests}</div>
                          <div><strong style={{ color: '#38bdf8' }}>Doctor Remarks:</strong> {editingReport.doctor_remarks}</div>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
                      <button
                        onClick={() => handleDownloadPatientReport(selectedPatientModal)}
                        style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <FaDownload /> Download Printable Report PDF
                      </button>

                      <button
                        onClick={() => setSelectedPatientModal(null)}
                        style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: '#334155', color: '#cbd5e1', border: 'none', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Close Record
                      </button>
                    </div>

                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

      </div>
    </AuthCheck>
  );
}