import React, { useState } from 'react';
import Head from 'next/head';
import PatientSidebar from "@components/Sidebar/PatientSidebar";
import AuthCheck from "@components/Auth/AuthCheck";
import { FaFileMedical, FaVial, FaDownload, FaSearch, FaFilter, FaCheckCircle, FaFilePdf } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function PatientReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [labReports] = useState([
    { id: 'LAB-101', test_name: '12-Lead Electrocardiogram (ECG)', date: '2026-08-05', lab_name: 'HealConnect Central Diagnostic Lab', status: 'NORMAL', result_summary: 'Normal Sinus Rhythm. HR: 74 bpm. No acute ST-T segment elevation.' },
    { id: 'LAB-102', test_name: 'High-Sensitivity Troponin I (hs-cTnI)', date: '2026-08-05', lab_name: 'HealConnect Central Diagnostic Lab', status: 'NORMAL', result_summary: '< 0.01 ng/mL (Reference < 0.04 ng/mL). Negative for acute myocardial injury.' },
    { id: 'LAB-103', test_name: 'Comprehensive Lipid Profile Panel', date: '2026-07-15', lab_name: 'Metropolis Health Lab', status: 'ATTENTION', result_summary: 'Total Cholesterol: 210 mg/dL (Borderline High). LDL: 135 mg/dL. HDL: 48 mg/dL.' },
    { id: 'LAB-104', test_name: 'Complete Blood Count (CBC) & HbA1c', date: '2026-06-28', lab_name: 'HealConnect Central Diagnostic Lab', status: 'NORMAL', result_summary: 'Hemoglobin: 14.2 g/dL, HbA1c: 5.6% (Normoglycemic), WBC: 6,800 /uL.' }
  ]);

  const handleDownloadPdf = (report) => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      toast.error('Please allow popups to download lab report.');
      return;
    }

    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Clinical Lab Report - ${report.test_name}</title>
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
              <h1 class="title">HEALCONNECT DIAGNOSTIC LAB REPORT</h1>
              <p style="margin: 0; color: #64748b; font-size: 13px;">${report.lab_name}</p>
            </div>
            <span class="badge">OFFICIAL LAB RECORD</span>
          </div>
          <div class="section">
            <h3>Test Details</h3>
            <p><strong>Test Name:</strong> ${report.test_name}</p>
            <p><strong>Date Performed:</strong> ${report.date}</p>
            <p><strong>Result Summary:</strong> ${report.result_summary}</p>
            <p><strong>Status:</strong> ${report.status}</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    reportWindow.document.close();
    toast.success(`📥 Generated PDF Report for ${report.test_name}`);
  };

  const filteredReports = labReports.filter(r =>
    r.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.result_summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthCheck requiredRole="patient">
      <PatientSidebar>
        <Head>
          <title>Clinical Reports & Diagnostic Files | HealConnect Patient Portal</title>
        </Head>

        <div className="p-4 sm:p-6 space-y-8 font-sans">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-xl flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase mb-2">
                <FaVial />
                <span>Diagnostic Vault</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Clinical Lab Reports & Diagnostic Vault</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Access and download verified laboratory reports and diagnostic imaging summaries.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search lab test reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <FaFilePdf className="text-purple-400" />
              <span>Verified Laboratory Reports ({filteredReports.length} Files)</span>
            </h2>

            <div className="space-y-4">
              {filteredReports.map((report) => (
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
                    onClick={() => handleDownloadPdf(report)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                  >
                    <FaDownload /> Download PDF Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PatientSidebar>
    </AuthCheck>
  );
}