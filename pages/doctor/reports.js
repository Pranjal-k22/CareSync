import React, { useState } from "react";
import Head from 'next/head';
import AuthCheck from "@components/Auth/AuthCheck";
import DoctorSidebar from "@components/Sidebar/DoctorSidebar";
import { FaFileMedical, FaSearch, FaDownload, FaVial, FaHeartbeat, FaFilePdf, FaFilter, FaUserMd } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function DoctorReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const [clinicalReports] = useState([
    { id: 'REP-901', patient_name: 'Rahul Sharma', patient_id: 'PAT-1001', test_name: 'Post-CABG 12-Lead ECG & Holter Telemetry', date: '2026-08-08', specialty: 'Cardiology', status: 'NORMAL', summary: 'Sinus rhythm 76 bpm. PR interval 160ms. QRS 90ms. Baseline recovery intact.', doctor: 'Dr. Sarah Johnson, MD' },
    { id: 'REP-902', patient_name: 'Priya Patel', patient_id: 'PAT-1002', test_name: 'High-Sensitivity Troponin I & Lipid Profile', date: '2026-08-07', specialty: 'Cardiology', status: 'NORMAL', summary: 'Troponin I < 0.01 ng/mL (Normal). Total Cholesterol: 185 mg/dL. Triglycerides: 140 mg/dL.', doctor: 'Dr. Ananya Roy, MD' },
    { id: 'REP-903', patient_name: 'Amitav Roy', patient_id: 'PAT-1003', test_name: 'Brain MRI & EEG Telemetry Scan', date: '2026-08-06', specialty: 'Neurology', status: 'ATTENTION', summary: 'Slight focal slow waves in left temporal region. No acute hemorrhage or mass effect.', doctor: 'Dr. Michael Chen, MD' },
    { id: 'REP-904', patient_name: 'Sneha Reddy', patient_id: 'PAT-1004', test_name: 'Joint X-Ray & Bone Density DEXA Scan', date: '2026-08-04', specialty: 'Orthopedics', status: 'NORMAL', summary: 'T-score -0.8 (Normal bone mass). Joint alignment satisfactory post-rehab.', doctor: 'Dr. James Wilson, MD' }
  ]);

  const handleDownloadPdf = (rep) => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      toast.error('Please allow popups to download report.');
      return;
    }

    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Doctor Clinical Report - ${rep.patient_name} (${rep.patient_id})</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; color: #0f172a; line-height: 1.6; }
            .header { border-bottom: 3px solid #059669; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; }
            .title { font-size: 22px; font-weight: 800; color: #059669; margin: 0; }
            .badge { background: #dcfce7; color: #166534; font-weight: 800; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
            .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">HEALCONNECT CLINICAL TELEMETRY REPORT</h1>
              <p style="margin: 0; color: #64748b; font-size: 13px;">Specialty Department: ${rep.specialty}</p>
            </div>
            <span class="badge">OFFICIAL DOCTOR REPORT</span>
          </div>

          <div class="section">
            <h3>Patient & Attending Doctor</h3>
            <p><strong>Patient Name:</strong> ${rep.patient_name} (${rep.patient_id})</p>
            <p><strong>Attending Physician:</strong> ${rep.doctor}</p>
            <p><strong>Report Date:</strong> ${rep.date}</p>
          </div>

          <div class="section">
            <h3>Diagnostic Findings</h3>
            <p><strong>Test Name:</strong> ${rep.test_name}</p>
            <p><strong>Clinical Impression:</strong> ${rep.summary}</p>
            <p><strong>Diagnostic Status:</strong> <strong style="color: #059669;">${rep.status}</strong></p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    reportWindow.document.close();
    toast.success(`📥 Generated Clinical PDF Report for ${rep.patient_name}`);
  };

  const filteredReports = clinicalReports.filter((r) => {
    const matchesSearch =
      r.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.test_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = selectedSpecialty === 'All' || r.specialty === selectedSpecialty;
    return matchesSearch && matchesSpec;
  });

  return (
    <AuthCheck requiredRole="doctor">
      <DoctorSidebar>
        <Head>
          <title>Doctor Clinical Telemetry Reports | HealConnect</title>
        </Head>

        <div className="p-4 sm:p-6 space-y-8 font-sans">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-xl flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase mb-2">
                <FaFileMedical />
                <span>Clinical Telemetry Vault</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Patient Clinical Reports & Diagnostic Records</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Review, generate, and download verified ECG, laboratory, and telemetry diagnostic files.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search patient, ID, or test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FaFilter className="text-emerald-400" /> Specialty:
            </span>
            {['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'].map((sp) => (
              <button
                key={sp}
                onClick={() => setSelectedSpecialty(sp)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  selectedSpecialty === sp
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>

          {/* Reports List */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <FaFilePdf className="text-emerald-400" />
              <span>Diagnostic Clinical Records ({filteredReports.length} Files)</span>
            </h2>

            <div className="space-y-4">
              {filteredReports.map((rep) => (
                <div key={rep.id} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl space-y-3 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400 bg-sky-400/10 px-2.5 py-0.5 rounded border border-sky-400/30">
                        {rep.patient_id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        rep.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {rep.status}
                      </span>
                      <span className="text-xs text-slate-400">{rep.date}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-white">{rep.patient_name} — {rep.test_name}</h3>
                    <p className="text-xs text-slate-300"><strong>Findings:</strong> {rep.summary}</p>
                    <span className="text-[11px] text-emerald-400 font-bold block">Attending: {rep.doctor} ({rep.specialty})</span>
                  </div>

                  <button
                    onClick={() => handleDownloadPdf(rep)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                  >
                    <FaDownload /> Download PDF Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DoctorSidebar>
    </AuthCheck>
  );
}