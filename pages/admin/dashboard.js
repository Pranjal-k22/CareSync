import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import AuthCheck from "@components/Auth/AuthCheck";
import { FaUsers, FaUserMd, FaUserNurse, FaBed, FaShieldAlt, FaCalendarCheck, FaCog, FaCheckCircle, FaPlus, FaSpinner, FaTrash, FaHeartbeat, FaTimes, FaBroom, FaUserCheck, FaNotesMedical, FaSearch, FaFilter } from 'react-icons/fa';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import Link from 'next/link';
import FederatedDashboard from "@components/Federated/FederatedDashboard";

// Helper to generate Flight-Seat Map style bed layout (40 Hospital Beds across 3 Wings)
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
  { id: 'GEN-B1', wing: 'General Ward', status: 'occupied', patientName: 'Ramesh Gupta', doctor: 'Dr. Robert Sterling, MD', vitals: 'SpO2 99% | BP 120/80', ventilator: false },
  { id: 'GEN-B2', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-B3', wing: 'General Ward', status: 'occupied', patientName: 'Pooja Iyer', doctor: 'Dr. Ananya Roy, MD', vitals: 'SpO2 98% | Temp 98.6F', ventilator: false },
  { id: 'GEN-B4', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-B5', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-B6', wing: 'General Ward', status: 'sanitizing', patientName: null, doctor: null, vitals: 'Sanitation in progress', ventilator: false },
  { id: 'GEN-B7', wing: 'General Ward', status: 'occupied', patientName: 'Siddharth Rao', doctor: 'Dr. David Kim, MD', vitals: 'SpO2 97% | BP 118/75', ventilator: false },
  { id: 'GEN-B8', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-B9', wing: 'General Ward', status: 'reserved', patientName: 'Pre-op Surgery Patient', doctor: 'Dr. James Wilson, MD', vitals: 'Scheduled 2 PM', ventilator: false },
  { id: 'GEN-B10', wing: 'General Ward', status: 'occupied', patientName: 'Anita Nair', doctor: 'Dr. Meera Nambiar, MD', vitals: 'SpO2 99% | Stable', ventilator: false },

  // GENERAL WARD - AISLE C (C1 - C10)
  { id: 'GEN-C1', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-C2', wing: 'General Ward', status: 'occupied', patientName: 'Gaurav Joshi', doctor: 'Dr. Robert Sterling, MD', vitals: 'SpO2 98% | BP 122/82', ventilator: false },
  { id: 'GEN-C3', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-C4', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-C5', wing: 'General Ward', status: 'occupied', patientName: 'Fatima Sheikh', doctor: 'Dr. Sophia Martinez, MD', vitals: 'SpO2 99% | Recovering', ventilator: false },
  { id: 'GEN-C6', wing: 'General Ward', status: 'occupied', patientName: 'Tariq Hassan', doctor: 'Dr. Jonathan Blake, MD', vitals: 'SpO2 97% | BP 125/85', ventilator: false },
  { id: 'GEN-C7', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-C8', wing: 'General Ward', status: 'sanitizing', patientName: null, doctor: null, vitals: 'Sanitation in progress', ventilator: false },
  { id: 'GEN-C9', wing: 'General Ward', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: false },
  { id: 'GEN-C10', wing: 'General Ward', status: 'occupied', patientName: 'Deepak Chopra', doctor: 'Dr. Benjamin Carter, MD', vitals: 'SpO2 98% | BP 115/78', ventilator: false },

  // VIP ISOLATION SUITES (S1 - S10)
  { id: 'VIP-S1', wing: 'VIP Suite', status: 'occupied', patientName: 'Rajesh Singhania', doctor: 'Dr. Sarah Johnson, MD', vitals: 'SpO2 99% | VIP Suite 101', ventilator: true },
  { id: 'VIP-S2', wing: 'VIP Suite', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'VIP-S3', wing: 'VIP Suite', status: 'reserved', patientName: 'Executive Checkup Patient', doctor: 'Dr. Ananya Roy, MD', vitals: 'Arrival 4:00 PM', ventilator: true },
  { id: 'VIP-S4', wing: 'VIP Suite', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'VIP-S5', wing: 'VIP Suite', status: 'occupied', patientName: 'Evelyn Taylor', doctor: 'Dr. Daniel Foster, MD', vitals: 'SpO2 98% | Stable', ventilator: true },
  { id: 'VIP-S6', wing: 'VIP Suite', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'VIP-S7', wing: 'VIP Suite', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'VIP-S8', wing: 'VIP Suite', status: 'sanitizing', patientName: null, doctor: null, vitals: 'Sanitation in progress', ventilator: true },
  { id: 'VIP-S9', wing: 'VIP Suite', status: 'available', patientName: null, doctor: null, vitals: 'N/A', ventilator: true },
  { id: 'VIP-S10', wing: 'VIP Suite', status: 'occupied', patientName: 'Karan Johar', doctor: 'Dr. Omar Al-Mansoor, MD', vitals: 'SpO2 99% | Post-op Care', ventilator: true }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    patientsCount: 42,
    doctorsCount: 20,
    staffCount: 18,
    appointmentsCount: 28
  });

  const [bedsGrid, setBedsGrid] = useState(initialBedsGridData);
  const [selectedWingFilter, setSelectedWingFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Modal for bed inspection
  const [activeBed, setActiveBed] = useState(null);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);

  // Form for changing bed status
  const [bedFormState, setBedFormState] = useState({
    status: 'available',
    patientName: '',
    doctor: 'Dr. Sarah Johnson, MD',
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

  useEffect(() => {
    let isSubscribed = true;

    const fetchCounts = async () => {
      if (!isSupabaseConfigured) return;

      try {
        const { count: patCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient');
        const { count: docCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor');
        const { count: stfCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'staff');
        const { count: appCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true });

        if (isSubscribed) {
          setStats({
            patientsCount: patCount || 42,
            doctorsCount: (docCount && docCount > 0) ? docCount : 20,
            staffCount: (stfCount && stfCount > 0) ? stfCount : 18,
            appointmentsCount: appCount || 28
          });
        }
      } catch (err) {
        console.warn('Admin counts fetch error:', err);
      }
    };

    fetchCounts();

    const fetchHospitalBeds = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/hospital/beds");
        if (res.ok) {
          const data = await res.json();
          if (data.beds && isSubscribed) {
            console.log('Admin portal synced bed telemetry with backend:', data.beds);
          }
        }
      } catch (err) {
        console.warn('Backend bed fetch notice:', err);
      }
    };

    fetchHospitalBeds();
    return () => { isSubscribed = false; };
  }, []);

  // Open Bed Details Modal
  const handleOpenBedModal = (bed) => {
    setActiveBed(bed);
    setBedFormState({
      status: bed.status,
      patientName: bed.patientName || '',
      doctor: bed.doctor || 'Dr. Sarah Johnson, MD',
      vitals: bed.vitals !== 'N/A' ? bed.vitals : 'SpO2 98% | BP 120/80',
      ventilator: bed.ventilator
    });
  };

  // Save Bed Telemetry Updates
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

  // Filtered Bed Grid
  const filteredBeds = useMemo(() => {
    return bedsGrid.filter((b) => {
      const matchesWing = selectedWingFilter === 'All' || b.wing === selectedWingFilter;
      const matchesStatus = selectedStatusFilter === 'All' || b.status === selectedStatusFilter;
      return matchesWing && matchesStatus;
    });
  }, [bedsGrid, selectedWingFilter, selectedStatusFilter]);

  return (
    <AuthCheck requiredRole="admin">
      <AdminSidebar>
        <Head>
          <title>Admin Telemetry & Bed Seat Booking Control | HealConnect</title>
        </Head>

        <div className="p-4 sm:p-6 space-y-8 font-sans">
          {/* Top Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase mb-2">
                <FaShieldAlt />
                <span>Superuser Hospital Operations & Live Telemetry</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Command & Bed Telemetry</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Real-time aircraft-style seat mapping grid for hospital beds, ICU units, and VIP suites.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowTelemetryModal(!showTelemetryModal)}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 text-xs sm:text-sm"
              >
                <FaBed size={18} />
                <span>Hospital Bed Telemetry System</span>
              </button>

              <Link
                href="/admin/doctors"
                className="bg-slate-700 hover:bg-slate-600 text-white font-extrabold px-4 py-3 rounded-xl transition-all border border-slate-600 flex items-center gap-2 text-xs sm:text-sm"
              >
                <FaUserMd />
                <span>Doctors ({stats.doctorsCount})</span>
              </Link>

              <Link
                href="/admin/staff"
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-4 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 text-xs sm:text-sm"
              >
                <FaUserNurse />
                <span>Staff ({stats.staffCount})</span>
              </Link>
            </div>
          </div>

          {/* Metrics Overview Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Hospital Beds</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">{bedCounts.total} <span className="text-xs text-slate-400 font-normal">Beds</span></span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 text-2xl flex items-center justify-center border border-blue-500/30">
                <FaBed />
              </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Occupied Beds</span>
                <span className="text-3xl font-extrabold text-rose-400 mt-1 block">{bedCounts.occupied} <span className="text-xs text-rose-300/80 font-normal">Admitted</span></span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 text-2xl flex items-center justify-center border border-rose-500/30">
                <FaHeartbeat />
              </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Available Vacant Beds</span>
                <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{bedCounts.available} <span className="text-xs text-emerald-300/80 font-normal">Ready</span></span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 text-2xl flex items-center justify-center border border-emerald-500/30">
                <FaCheckCircle />
              </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">ICU Occupancy Rate</span>
                <span className="text-3xl font-extrabold text-purple-400 mt-1 block">{bedCounts.icuOccupied}/{bedCounts.icuTotal} <span className="text-xs text-purple-300/80 font-normal">Critical</span></span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 text-2xl flex items-center justify-center border border-purple-500/30">
                <FaNotesMedical />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FEDERATED LEARNING CONTROL DASHBOARD */}
          <FederatedDashboard />

          {/* ========================================================================= */}
          {/* HOSPITAL BED TELEMETRY SYSTEM GRID INTERFACE */}
          {/* ========================================================================= */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header Controls & Status Legend */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-700 pb-6">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <FaBed className="text-emerald-400" />
                  <span>Hospital Bed Telemetry System</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Interactive real-time floor plan pod map. Click any bed seat to inspect vitals, admit patients, or send sanitation crews.</p>
              </div>

              {/* Status Color Legend (Like Flight Seat Classes) */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-700 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-sm"></span>
                  <span>Available ({bedCounts.available})</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-rose-400">
                  <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shadow-sm"></span>
                  <span>Occupied ({bedCounts.occupied})</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-blue-400">
                  <span className="w-3.5 h-3.5 rounded-md bg-blue-500 shadow-sm"></span>
                  <span>Sanitizing ({bedCounts.sanitizing})</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <span className="w-3.5 h-3.5 rounded-md bg-amber-500 shadow-sm"></span>
                  <span>Reserved ({bedCounts.reserved})</span>
                </div>
              </div>
            </div>

            {/* Wing & Status Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/80">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <FaFilter className="text-emerald-400" /> Wing Filter:
                </span>
                {['All', 'ICU', 'General Ward', 'VIP Suite'].map((wing) => (
                  <button
                    key={wing}
                    onClick={() => setSelectedWingFilter(wing)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                      selectedWingFilter === wing
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {wing}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                {['All', 'available', 'occupied', 'sanitizing', 'reserved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all whitespace-nowrap ${
                      selectedStatusFilter === st
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* AIRCRAFT CABIN-STYLE BED GRID LAYOUT */}
            <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-700 space-y-8">
              {/* Cockpit / Nurse Station Front Cockpit Banner */}
              <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 p-3 rounded-2xl border border-slate-600 text-center text-xs font-extrabold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2 shadow-inner">
                <span>🏥 HOSPITAL WARD & ICU TELEMETRY CONTROL MATRIX · CENTRAL NURSING STATION 🏥</span>
              </div>

              {/* BEDS MATRIX DISPLAY BY WING SECTIONS */}
              {['ICU', 'General Ward', 'VIP Suite'].map((wingName) => {
                const wingBeds = filteredBeds.filter((b) => b.wing === wingName);
                if (wingBeds.length === 0) return null;

                return (
                  <div key={wingName} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h3 className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <span>{wingName === 'ICU' ? '🚨 ICU CRITICAL CARE COMPLEX' : wingName === 'VIP Suite' ? '👑 VIP ISOLATION EXECUTIVE SUITES' : '🏥 GENERAL MEDICAL WARDS'}</span>
                        <span className="text-xs font-bold text-slate-400">({wingBeds.length} Beds)</span>
                      </h3>

                      <span className="text-[11px] font-bold text-slate-400">Aisle Walkway Available</span>
                    </div>

                    {/* Flight Seat-Style Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
                      {wingBeds.map((bed) => {
                        let statusBg = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/30';
                        let badgeBg = 'bg-emerald-500 text-slate-950';

                        if (bed.status === 'occupied') {
                          statusBg = 'bg-rose-500/20 border-rose-500/60 text-rose-300 hover:bg-rose-500/30';
                          badgeBg = 'bg-rose-500 text-white';
                        } else if (bed.status === 'sanitizing') {
                          statusBg = 'bg-blue-500/20 border-blue-500/60 text-blue-300 hover:bg-blue-500/30';
                          badgeBg = 'bg-blue-500 text-white';
                        } else if (bed.status === 'reserved') {
                          statusBg = 'bg-amber-500/20 border-amber-500/60 text-amber-300 hover:bg-amber-500/30';
                          badgeBg = 'bg-amber-500 text-slate-950';
                        }

                        return (
                          <div
                            key={bed.id}
                            onClick={() => handleOpenBedModal(bed)}
                            className={`p-3 rounded-2xl border-2 ${statusBg} transition-all cursor-pointer shadow-lg hover:scale-105 flex flex-col items-center justify-between text-center min-h-[90px] relative group`}
                          >
                            {/* Seat Number Header */}
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${badgeBg} shadow-sm uppercase`}>
                              {bed.id}
                            </span>

                            {/* Bed Pod Icon */}
                            <div className="my-1.5 text-2xl">
                              <FaBed />
                            </div>

                            {/* Patient Name / Status Label */}
                            <span className="text-[11px] font-extrabold truncate w-full">
                              {bed.status === 'occupied' ? bed.patientName : bed.status === 'sanitizing' ? 'Sanitizing' : bed.status === 'reserved' ? 'Reserved' : 'Vacant'}
                            </span>

                            {/* Hover Tooltip Preview */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-30 bg-slate-950 text-white text-[11px] p-2.5 rounded-xl border border-slate-700 shadow-2xl w-44 text-left pointer-events-none">
                              <p className="font-extrabold text-emerald-400">{bed.id} · {bed.wing}</p>
                              <p className="text-slate-300 font-semibold mt-0.5">{bed.patientName || 'No Patient Admitted'}</p>
                              <p className="text-slate-400 text-[10px] mt-0.5">{bed.vitals}</p>
                              {bed.ventilator && <span className="inline-block mt-1 bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded font-extrabold">Ventilator Connected</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BED INSPECTOR & CONTROL MODAL */}
          {/* ========================================================================= */}
          {activeBed && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <div>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                      BED POD {activeBed.id} · {activeBed.wing}
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-1">Bed Telemetry Inspector</h2>
                  </div>
                  <button onClick={() => setActiveBed(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                <form onSubmit={handleSaveBedState} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block font-extrabold text-slate-300 uppercase mb-1">Bed Status *</label>
                    <select
                      value={bedFormState.status}
                      onChange={(e) => setBedFormState({ ...bedFormState, status: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl font-extrabold focus:outline-none focus:border-emerald-400"
                    >
                      <option value="available">🟢 Available (Vacant / Sanitized)</option>
                      <option value="occupied">🔴 Occupied (Patient Admitted)</option>
                      <option value="sanitizing">🔵 Sanitizing (Cleaning Crew Assigned)</option>
                      <option value="reserved">🟡 Reserved (Pending ER Admission)</option>
                    </select>
                  </div>

                  {(bedFormState.status === 'occupied' || bedFormState.status === 'reserved') && (
                    <>
                      <div>
                        <label className="block font-extrabold text-slate-300 uppercase mb-1">Admitted Patient Name *</label>
                        <input
                          type="text"
                          value={bedFormState.patientName}
                          onChange={(e) => setBedFormState({ ...bedFormState, patientName: e.target.value })}
                          placeholder="e.g. Rajesh Verma"
                          className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl font-medium focus:outline-none focus:border-emerald-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-300 uppercase mb-1">Assigned Attending Doctor</label>
                        <input
                          type="text"
                          value={bedFormState.doctor}
                          onChange={(e) => setBedFormState({ ...bedFormState, doctor: e.target.value })}
                          placeholder="Dr. Sarah Johnson, MD"
                          className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl font-medium focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-300 uppercase mb-1">Live Vitals Telemetry</label>
                        <input
                          type="text"
                          value={bedFormState.vitals}
                          onChange={(e) => setBedFormState({ ...bedFormState, vitals: e.target.value })}
                          placeholder="SpO2 98% | BP 120/80"
                          className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl font-medium focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="ventilator"
                      checked={bedFormState.ventilator}
                      onChange={(e) => setBedFormState({ ...bedFormState, ventilator: e.target.checked })}
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <label htmlFor="ventilator" className="font-extrabold text-white cursor-pointer select-none">
                      Ventilator & Oxygen Monitor Line Connected
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-700">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                    >
                      <span>Save Bed Telemetry ➔</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBed(null)}
                      className="px-6 py-3.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl border border-slate-600 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AdminSidebar>
    </AuthCheck>
  );
}
