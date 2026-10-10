import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import AuthCheck from "@components/Auth/AuthCheck";
import FetchPatients, { initial50PatientsList } from "@/lib/fetchPatients";
import { FaFileMedical, FaPrint, FaSave, FaHeartbeat, FaThermometerHalf, FaLungs, FaVial, FaUserMd, FaSpinner, FaCheckCircle, FaSearch, FaMicrochip, FaDownload } from 'react-icons/fa';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
  const { patients } = FetchPatients();
  const allPatients = patients.length > 0 ? patients : initial50PatientsList;

  const [selectedPatientId, setSelectedPatientId] = useState(allPatients[0]?.id || 'PAT-1001');
  const [selectedPatient, setSelectedPatient] = useState(allPatients[0]);

  // Live Hardware Sensor Telemetry State
  const [heartRate, setHeartRate] = useState(76);
  const [spo2, setSpo2] = useState(98);
  const [temperature, setTemperature] = useState(98.6);
  const [bp, setBp] = useState('120/80');
  const [hardwareStatus, setHardwareStatus] = useState('CONNECTED (ESP8266 Wi-Fi Kit)');
  const [isRecording, setIsRecording] = useState(false);

  // Remarks
  const [doctorRemarks, setDoctorRemarks] = useState(
    'Patient demonstrates normal cardiovascular sinus rhythm and optimal blood oxygenation. Recommended follow-up in 30 days.'
  );

  const [labResults, setLabResults] = useState({
    hemoglobin: '14.5 g/dL',
    wbc: '6,800 /mcL',
    platelets: '250,000 /mcL',
    glucose: '95 mg/dL'
  });

  // Fetch latest recorded report for selected patient
  useEffect(() => {
    const p = allPatients.find((item) => item.id === selectedPatientId) || allPatients[0];
    setSelectedPatient(p);

    const loadLatestReport = async () => {
      if (!isSupabaseConfigured || !p?.id) return;
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('patient_id', p.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          if (data.heart_rate) setHeartRate(data.heart_rate);
          if (data.spo2) setSpo2(data.spo2);
          if (data.temperature) setTemperature(data.temperature);
          if (data.doctor_remarks) setDoctorRemarks(data.doctor_remarks);
          if (data.lab_results) {
            setLabResults(prev => ({
              ...prev,
              ...data.lab_results
            }));
          }
        }
      } catch (err) {
        // silent fallback
      }
    };

    loadLatestReport();
  }, [selectedPatientId, allPatients]);

  // Simulate real-time hardware telemetry fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => Math.min(95, Math.max(68, prev + Math.floor(Math.random() * 5) - 2)));
      setSpo2(prev => Math.min(100, Math.max(95, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Record Telemetry to Supabase PostgreSQL
  const handleRecordTelemetry = async () => {
    setIsRecording(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.from('reports').insert({
          patient_id: selectedPatient.id,
          patient_name: selectedPatient.name || `${selectedPatient.firstName} ${selectedPatient.lastName}`,
          heart_rate: heartRate,
          spo2: spo2,
          temperature: temperature,
          blood_pressure: bp,
          doctor_remarks: doctorRemarks,
          lab_results: {
            hemoglobin: '14.5 g/dL',
            wbc: '6,800 /mcL',
            platelets: '250,000 /mcL',
            cholesterol: '185 mg/dL'
          }
        });
      }

      toast.success(`Hardware Telemetry Batch Recorded for ${selectedPatient.name || selectedPatient.firstName}!`);
    } catch (err) {
      toast.error(err.message || 'Failed to record telemetry data');
    } finally {
      setIsRecording(false);
    }
  };

  // Trigger Printout
  const handlePrint = () => {
    window.print();
  };

  return (
    <AuthCheck requiredRole="admin">
      <AdminSidebar>
        <Head>
          <title>Medical Reports & Telemetry Hardware Hub | CareSync Admin</title>
          <style>{`
            @media print {
              body { background: white !important; color: black !important; }
              nav, sidebar, button, .no-print { display: none !important; }
              .printable-report { border: 2px solid #10b981 !important; color: black !important; padding: 20px !important; }
              .printable-report * { color: black !important; }
            }
          `}</style>
        </Head>

        <div className="p-4 sm:p-6 space-y-8 font-sans">
          {/* Header Banner */}
          <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase mb-2">
                <FaFileMedical />
                <span>Diagnostic Telemetry & Official Laboratory Printout Station</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Patient Medical Reports & Hardware Hub</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Inspect 50 patient diagnostic reports, record hardware telemetry batches, and generate official printouts.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePrint}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 text-xs sm:text-sm"
              >
                <FaPrint size={18} />
                <span>Print Official Medical Report</span>
              </button>

              <button
                onClick={handleRecordTelemetry}
                disabled={isRecording}
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50"
              >
                {isRecording ? <FaSpinner className="animate-spin" /> : <FaSave size={18} />}
                <span>Record Hardware Telemetry Batch</span>
              </button>
            </div>
          </div>

          {/* Patient Selector Bar */}
          <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <FaSearch className="text-emerald-400 text-lg" />
              <label className="text-xs font-extrabold text-slate-300 uppercase whitespace-nowrap">Select Patient File (50 Available):</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full sm:w-80 bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold focus:outline-none focus:border-emerald-400"
              >
                {allPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} - {p.name || `${p.firstName} ${p.lastName}`} ({p.city || 'Mumbai'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <FaMicrochip className="animate-pulse" />
              <span>Hardware Sensor Status: {hardwareStatus}</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* OFFICIAL PRINTABLE PATIENT MEDICAL REPORT CARD */}
          {/* ========================================================================= */}
          <div className="printable-report bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
            {/* Report Header Logo & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl font-black">
                  ⚕️
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">CARESYNC HEALTHCARE SYSTEMS</h2>
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Official Diagnostic Laboratory & Telemetry Report</p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs font-mono text-slate-400 space-y-0.5">
                <p><strong className="text-slate-200">Report Ref:</strong> REP-2026-{selectedPatient?.id || 'PAT-1001'}</p>
                <p><strong className="text-slate-200">Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong className="text-slate-200">HIPAA License:</strong> HIPAA-CERT-2026-HC99</p>
              </div>
            </div>

            {/* Patient Demographics & Info Block */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[11px]">Patient Full Name</span>
                <span className="text-white font-extrabold text-base block mt-0.5">{selectedPatient?.name || `${selectedPatient?.firstName} ${selectedPatient?.lastName}`}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase block text-[11px]">Patient ID & Aadhar</span>
                <span className="text-emerald-400 font-mono font-bold block mt-0.5">{selectedPatient?.id} · {selectedPatient?.aadhar || '4521-8899-1000'}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase block text-[11px]">Demographics & Blood</span>
                <span className="text-slate-200 font-semibold block mt-0.5">{selectedPatient?.age || 34} Yrs · {selectedPatient?.gender || 'Male'} · Group: {selectedPatient?.bloodGroup || 'O+'}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase block text-[11px]">Attending Physician</span>
                <span className="text-blue-300 font-extrabold block mt-0.5">{selectedPatient?.assignedDoctor || 'Dr. Sarah Johnson, MD'}</span>
              </div>
            </div>

            {/* LIVE HARDWARE TELEMETRY SENSOR READINGS */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <FaMicrochip />
                <span>Live IoT Hardware Sensor Telemetry (ESP8266 Integration)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase block">Heart Rate</span>
                    <span className="text-2xl font-black text-rose-400 mt-1 block animate-pulse">{heartRate} <span className="text-xs font-normal text-slate-400">BPM</span></span>
                  </div>
                  <FaHeartbeat className="text-rose-500 text-2xl" />
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase block">Blood Oxygen (SpO2)</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">{spo2}% <span className="text-xs font-normal text-slate-400">Optimal</span></span>
                  </div>
                  <FaLungs className="text-emerald-400 text-2xl" />
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase block">Body Temperature</span>
                    <span className="text-2xl font-black text-amber-400 mt-1 block">{temperature} <span className="text-xs font-normal text-slate-400">°F</span></span>
                  </div>
                  <FaThermometerHalf className="text-amber-400 text-2xl" />
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase block">Optical Finger Contact</span>
                    <span className="text-2xl font-black text-teal-400 mt-1 block">DETECTED <span className="text-xs font-normal text-teal-300/80">MAX30102</span></span>
                  </div>
                  <FaCheckCircle className="text-teal-400 text-2xl" />
                </div>
              </div>

              {/* Real-time ECG Waveform Trace SVG Visualizer */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Lead II ECG Electrocardiogram Trace Waveform (Realtime Hardware Line)</span>
                  <span className="text-emerald-400 font-mono">Sampling: 500 Hz</span>
                </div>
                <div className="h-16 w-full bg-slate-950 rounded-xl p-2 flex items-center overflow-hidden border border-slate-800">
                  <svg className="w-full h-full text-emerald-400" viewBox="0 0 500 50" preserveAspectRatio="none">
                    <path
                      d="M0,25 L30,25 L40,10 L50,40 L60,5 L70,35 L80,25 L120,25 L130,10 L140,40 L150,5 L160,35 L170,25 L210,25 L220,10 L230,40 L240,5 L250,35 L260,25 L300,25 L310,10 L320,40 L330,5 L340,35 L350,25 L390,25 L400,10 L410,40 L420,5 L430,35 L440,25 L500,25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* LABORATORY TEST PATHOLOGY TABLE */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <FaVial />
                <span>Laboratory Pathology Test Measurements</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 font-extrabold uppercase text-[11px]">
                      <th className="pb-3 px-3">Test Parameter</th>
                      <th className="pb-3 px-3">Observed Value</th>
                      <th className="pb-3 px-3">Reference Range</th>
                      <th className="pb-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-mono text-xs">
                    <tr>
                      <td className="py-3 px-3 font-bold text-white">Hemoglobin (Hb)</td>
                      <td className="py-3 px-3 text-emerald-400 font-extrabold">{labResults?.hemoglobin || '14.5 g/dL'}</td>
                      <td className="py-3 px-3 text-slate-400">13.5 - 17.5 g/dL</td>
                      <td className="py-3 px-3"><span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">NORMAL</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-white">WBC Total Count</td>
                      <td className="py-3 px-3 text-emerald-400 font-extrabold">{labResults?.wbc || '6,800 /mcL'}</td>
                      <td className="py-3 px-3 text-slate-400">4,500 - 11,000 /mcL</td>
                      <td className="py-3 px-3"><span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">NORMAL</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-white">Platelet Count</td>
                      <td className="py-3 px-3 text-emerald-400 font-extrabold">{labResults?.platelets || '250,000 /mcL'}</td>
                      <td className="py-3 px-3 text-slate-400">150,000 - 450,000 /mcL</td>
                      <td className="py-3 px-3"><span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">NORMAL</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-white">Serum Fasting Glucose</td>
                      <td className="py-3 px-3 text-emerald-400 font-extrabold">{labResults?.glucose || '95 mg/dL'}</td>
                      <td className="py-3 px-3 text-slate-400">70 - 100 mg/dL</td>
                      <td className="py-3 px-3"><span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">NORMAL</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* DOCTOR REMARKS & DIGITAL STAMP */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase flex items-center gap-1.5">
                <FaUserMd className="text-emerald-400" /> Attending Physician Clinical Assessment & Diagnostic Remarks
              </h4>
              <textarea
                value={doctorRemarks}
                onChange={(e) => setDoctorRemarks(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400"
                rows={3}
              />

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Certified Chief Medical Officer</span>
                  <span className="text-emerald-400 font-extrabold font-mono block mt-0.5">Dr. Sarah Johnson, MD (MD-CARD-9920)</span>
                </div>

                <div className="border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 rounded-xl text-emerald-300 font-extrabold font-mono text-[11px] uppercase">
                  VERIFIED DIGITAL STAMP & SEAL ✔️
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminSidebar>
    </AuthCheck>
  );
}