import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FaAngleLeft, FaAngleRight, FaWindowClose, FaHeartbeat, FaEdit, FaFileMedical, FaUser, FaSpinner } from "react-icons/fa";
import dynamic from "next/dynamic";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import AuthCheck from "@components/Auth/AuthCheck";

const ViewLivePatient = dynamic(() => import("@components/LiveMonitor/ViewLivePatient"), { ssr: false });
const ViewPatient = dynamic(() => import("@components/PatientComponents/ViewPatient"), { ssr: false });
const PatientStatus = dynamic(() => import("@components/PatientComponents/PatientStatus"), { ssr: false });

export default function PatientPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [showModal, setShowModal] = useState(false);
  const [showLivePatient, setShowLivePatient] = useState(true);

  const handleSwitchComponent = () => {
    setShowLivePatient(!showLivePatient);
  };

  return (
    <AuthCheck requiredRole="admin">
      <AdminSidebar>
        <Head>
          <title>Patient File Inspector ({slug || 'PAT-1001'}) | CareSync Admin</title>
        </Head>

        <div className="p-4 sm:p-6 space-y-6 font-sans">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin/patients"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-4 py-2.5 rounded-xl border border-slate-700 transition-all text-xs sm:text-sm shadow-md"
            >
              <FaAngleLeft size={16} />
              <span>Back to Patient Directory</span>
            </Link>

            <span className="bg-slate-800 text-emerald-400 border border-slate-700 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold">
              ID: {slug || 'PAT-1001'}
            </span>
          </div>

          {/* Action Command Bar (MNC High-End Gradient Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={handleSwitchComponent}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white p-4 sm:p-5 rounded-2xl shadow-xl flex items-center justify-between transition-all border border-white/10 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl font-black">
                  <FaHeartbeat className="text-emerald-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">Track Patient Health</h3>
                  <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block">Live ESP8266 Telemetry</span>
                </div>
              </div>
              <FaAngleRight size={20} className="text-slate-200" />
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white p-4 sm:p-5 rounded-2xl shadow-xl flex items-center justify-between transition-all border border-white/10 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl font-black">
                  <FaEdit className="text-amber-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">Update Patient Status</h3>
                  <span className="text-xs text-amber-200 font-bold uppercase tracking-wider block">Clinical Ward Admission</span>
                </div>
              </div>
              <FaAngleRight size={20} className="text-slate-200" />
            </button>

            <button
              onClick={() => router.push('/admin/reports')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-4 sm:p-5 rounded-2xl shadow-xl flex items-center justify-between transition-all border border-white/10 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl font-black">
                  <FaFileMedical className="text-purple-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">Generate Patient Report</h3>
                  <span className="text-xs text-purple-200 font-bold uppercase tracking-wider block">Printable PDF & Diagnostics</span>
                </div>
              </div>
              <FaAngleRight size={20} className="text-slate-200" />
            </button>
          </div>

          {/* UPDATE PATIENT STATUS MODAL */}
          {showModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold text-white">Update Admission Status</h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1">
                    <FaWindowClose size={20} />
                  </button>
                </div>
                <PatientStatus />
                <p className="text-xs text-slate-400 font-medium">Select admission status based on current clinical findings.</p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3 rounded-xl shadow-lg transition-all text-sm"
                  >
                    Confirm Status Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MAIN PATIENT VIEW */}
          {showLivePatient ? (
            <ViewPatient patientID={slug} />
          ) : (
            <ViewLivePatient pationtID={slug} />
          )}
        </div>
      </AdminSidebar>
    </AuthCheck>
  );
}
