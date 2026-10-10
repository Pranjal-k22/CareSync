import React, { useState } from 'react';
import Head from 'next/head';
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import AuthCheck from "@components/Auth/AuthCheck";
import FetchPatients, { initial50PatientsList } from "@/lib/fetchPatients";
import { useRouter } from "next/router";
import { FaUsers, FaSearch, FaSpinner, FaPlus, FaFilter, FaIdCard, FaMapMarkerAlt, FaUserMd, FaHeartbeat, FaPhone, FaEnvelope, FaTrash, FaEye, FaLock, FaEyeSlash, FaKey, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PatientsPage() {
  const router = useRouter();
  const { patients, loading, setPatients } = FetchPatients();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showPasswords, setShowPasswords] = useState({});

  const togglePasswordVisibility = (patId) => {
    setShowPasswords((prev) => ({ ...prev, [patId]: !prev[patId] }));
  };

  // Delete Patient Handler
  const handleDeletePatient = (patId, patName) => {
    if (!confirm(`Are you sure you want to remove patient ${patName}?`)) return;
    setPatients((prev) => prev.filter((p) => p.id !== patId));
    toast.success(`Patient ${patName} removed from records`);
  };

  // Filter Patients List
  const filteredPatients = (patients || initial50PatientsList).filter((pat) => {
    const name = pat.name || `${pat.firstName || ''} ${pat.lastName || ''}`;
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.aadhar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.assignedDoctor?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || pat.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <AuthCheck requiredRole="admin">
      <AdminSidebar>
        <Head>
          <title>Patients Command Directory & Credentials | HealConnect Admin</title>
        </Head>

        <div className="p-4 sm:p-6 space-y-8 font-sans">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase mb-2">
                <FaUsers />
                <span>Clinical Patient Records & Auth Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Patient Records & Login Credentials</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Manage patient medical profiles and view default login credentials assigned for Patient Portal access.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-xl text-emerald-400 font-extrabold text-xs sm:text-sm">
                {(patients || initial50PatientsList).length} Active Patients
              </span>
              <Link
                href="/admin/add"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 text-xs sm:text-sm"
              >
                <FaPlus />
                <span>Add New Patient</span>
              </Link>
            </div>
          </div>

          {/* PATIENT PORTAL LOGIN CREDENTIALS DIRECTORY */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <FaLock className="text-blue-400" />
                  <span>Patient Portal Login Credentials Directory (ID & Passwords)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Patients can log into the Patient Portal using either their <strong className="text-sky-400">Patient ID</strong> (e.g. PAT-1001, PAT-1002, PAT-8891) or <strong className="text-emerald-400">Email</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'PAT-1001', name: 'Rahul Sharma', email: 'rahul.sharma@healconnect.com', bg: 'O+', status: 'Outpatient' },
                { id: 'PAT-1002', name: 'Priya Patel', email: 'priya.patel@healconnect.com', bg: 'A+', status: 'Outpatient' },
                { id: 'PAT-1003', name: 'Amitav Roy', email: 'amitav.roy@healconnect.com', bg: 'B+', status: 'Admitted' },
                { id: 'PAT-1004', name: 'Sneha Reddy', email: 'sneha.reddy@healconnect.com', bg: 'AB+', status: 'Scheduled' },
                { id: 'PAT-8891', name: 'Vikram Mehta', email: 'vikram.mehta@healconnect.com', bg: 'O+', status: 'Admitted' }
              ].map((pat) => (
                <div key={pat.id} className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 space-y-2 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-sky-400 bg-sky-400/10 px-2.5 py-0.5 rounded-lg border border-sky-400/30">
                      ID: {pat.id}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      {pat.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-white">{pat.name}</h3>
                  <p className="text-xs text-teal-400 font-bold">Blood Group: {pat.bg}</p>

                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Login ID / Email:</span>
                      <strong className="text-white font-mono text-[11px] truncate max-w-[120px]">{pat.email}</strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Password:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-emerald-400 font-mono text-[11px]">
                          {showPasswords[pat.id] ? '12345678' : '••••••••'}
                        </strong>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(pat.id)}
                          className="text-slate-400 hover:text-white text-xs"
                        >
                          {showPasswords[pat.id] ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search by patient name, ID, city, Aadhar, or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <FaFilter className="text-blue-400" /> Status Filter:
              </span>
              {['All', 'Admitted', 'Outpatient', 'Scheduled Consultation', 'Discharged'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    selectedStatus === st
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* PATIENTS TABLE DIRECTORY */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <FaUsers className="text-blue-400" />
                <span>Patient Master Roster ({filteredPatients.length} Records)</span>
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <FaSpinner className="animate-spin text-blue-400 text-3xl mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-bold">Querying 50 Patient Medical Files...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 font-extrabold uppercase text-[11px] tracking-wider">
                      <th className="pb-3 px-3">Patient Profile</th>
                      <th className="pb-3 px-3">Patient ID & Login</th>
                      <th className="pb-3 px-3">Demographics & Blood</th>
                      <th className="pb-3 px-3">Location & Contact</th>
                      <th className="pb-3 px-3">Attending Doctor & Condition</th>
                      <th className="pb-3 px-3">Admission Status</th>
                      <th className="pb-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredPatients.map((pat) => {
                      const fullName = pat.name || `${pat.firstName || ''} ${pat.lastName || ''}`;
                      let statusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                      if (pat.status === 'Admitted') {
                        statusBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                      } else if (pat.status === 'Scheduled Consultation') {
                        statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                      } else if (pat.status === 'Discharged') {
                        statusBadge = 'bg-slate-700 text-slate-300 border-slate-600';
                      }

                      return (
                        <tr key={pat.id} className="hover:bg-slate-700/40 transition-all">
                          {/* Patient Name */}
                          <td className="py-4 px-3 font-bold text-white">
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-black border border-blue-500/30 text-xs">
                                {fullName.charAt(0)}
                              </span>
                              <div>
                                <span className="font-extrabold text-white block text-sm">{fullName}</span>
                                <span className="text-[11px] text-slate-400 font-mono">{pat.email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@healconnect.com`}</span>
                              </div>
                            </div>
                          </td>

                          {/* ID & Password */}
                          <td className="py-4 px-3 font-mono text-slate-300">
                            <span className="text-sky-400 font-bold block">{pat.id}</span>
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-bold">
                              <span>Pass: 12345678</span>
                            </span>
                          </td>

                          {/* Demographics */}
                          <td className="py-4 px-3 text-slate-300">
                            <span className="font-semibold block">{pat.age} Yrs · {pat.gender}</span>
                            <span className="text-[11px] font-extrabold text-teal-400 inline-block bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30 mt-0.5">
                              Blood Group: {pat.bloodGroup || 'O+'}
                            </span>
                          </td>

                          {/* Location & Contact */}
                          <td className="py-4 px-3 text-slate-300">
                            <span className="flex items-center gap-1 font-semibold text-slate-200">
                              <FaMapMarkerAlt className="text-rose-400" />
                              <span>{pat.city || 'Mumbai'}</span>
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <FaPhone className="text-slate-500" />
                              <span>{pat.phone || pat.number || '+91 9876543210'}</span>
                            </span>
                          </td>

                          {/* Doctor & Condition */}
                          <td className="py-4 px-3">
                            <span className="text-xs font-extrabold text-blue-300 flex items-center gap-1">
                              <FaUserMd className="text-blue-400" />
                              <span>{pat.assignedDoctor || 'Dr. Sarah Johnson, MD'}</span>
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                              {pat.condition || 'Cardiology Follow-up'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase border ${statusBadge}`}>
                              {pat.status || 'Outpatient'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => router.push(`/admin/patients/${pat.id}`)}
                                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                                title="View Patient Details"
                              >
                                <FaEye size={14} />
                              </button>

                              <button
                                onClick={() => handleDeletePatient(pat.id, fullName)}
                                className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/40 transition-all"
                                title="Delete Patient Record"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminSidebar>
    </AuthCheck>
  );
}
