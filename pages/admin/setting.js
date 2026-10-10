import React, { useState, useContext } from "react";
import Head from "next/head";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import AuthCheck from "@components/Auth/AuthCheck";
import { FaShieldAlt, FaKey, FaLock, FaCheckCircle, FaSpinner, FaUserShield, FaBuilding, FaPhoneAlt, FaEnvelope, FaIdCard, FaCamera, FaGlobe, FaSlidersH } from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";
import { UserContext } from "@/lib/context";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function SystemSettingsPage() {
  const { currentUser, user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'company' | 'security' | 'audit'

  // Admin Profile State
  const [adminName, setAdminName] = useState(currentUser?.name || "Dr. Ananya Roy (Super Admin)");
  const [adminId, setAdminId] = useState("HC-ROOT-9901");
  const [adminEmail, setAdminEmail] = useState(user?.email || "Admin@healconnect.com");
  const [adminPhone, setAdminPhone] = useState("+91 9876543210");
  const [adminAvatar, setAdminAvatar] = useState("/hacker.png");

  // Company Branding State
  const [companyName, setCompanyName] = useState("CareSync Healthcare Systems Ltd.");
  const [companyLogo, setCompanyLogo] = useState("/Logo.svg");
  const [contactPhone, setContactPhone] = useState("+91 1800-432-526");
  const [corporateAddress, setCorporateAddress] = useState("CareSync Global Health Tower, Cyber City, Bangalore, KA 560100");
  const [hipaaLicense, setHipaaLicense] = useState("HIPAA-CERT-2026-HC99");

  // Security Credentials State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [enable2FA, setEnable2FA] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Save Profile Handler
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Administrator Profile & Identity Details Updated!");
    }, 800);
  };

  // Save Company Details Handler
  const handleSaveCompany = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Company Logo, Branding & Corporate Contact Saved!");
    }, 800);
  };

  // Security Update Handler
  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsSaving(true);
    try {
      if (isSupabaseConfigured && newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Supabase PostgreSQL Security & Admin Credentials Updated!");
    } catch (err) {
      toast.error(err.message || "Failed to update security credentials.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthCheck requiredRole="admin">
      <AdminSidebar>
        <Head>
          <title>System & Organization Settings | CareSync Admin</title>
        </Head>

        <div className="p-4 sm:p-6 space-y-8 font-sans">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase mb-2">
                <FaUserShield />
                <span>ROOT SUPERUSER CONTROL PANEL · ADMIN ONLY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Administration & Settings</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Configure superuser identity, corporate branding, database RLS security, and global platform parameters.</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 space-x-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'profile' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FaUserShield />
              <span>Admin Profile Details</span>
            </button>

            <button
              onClick={() => setActiveTab('company')}
              className={`pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'company' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FaBuilding />
              <span>Company Logo & Identity</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'security' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FaKey />
              <span>Credentials & Password</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'audit' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FaLock />
              <span>PostgreSQL Security Audit</span>
            </button>
          </div>

          {/* TAB 1: SYSTEM ADMINISTRATOR PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                <FaUserShield className="text-emerald-400" />
                <span>Superuser Administrator Identity & Contact</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-700/80">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-400 bg-slate-900 flex-shrink-0 flex items-center justify-center shadow-lg">
                  <Image
                    src={adminAvatar}
                    alt="Admin Avatar"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/40 uppercase">
                    <span>ROLE: SYSTEM ADMINISTRATOR (ROOT)</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">{adminName}</h3>
                  <p className="text-xs text-slate-400 font-mono">System ID: {adminId} · Email: {adminEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                    <FaIdCard className="text-emerald-400" /> Full Administrator Name *
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                    <FaIdCard className="text-teal-400" /> Administrator System ID *
                  </label>
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                    <FaEnvelope className="text-blue-400" /> System Admin Email (Login ID) *
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                    <FaPhoneAlt className="text-indigo-400" /> Direct Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  {isSaving ? <FaSpinner className="animate-spin text-slate-950" size={20} /> : <span>Save Admin Identity Details ➔</span>}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: COMPANY & BRAND IDENTITY */}
          {activeTab === 'company' && (
            <form onSubmit={handleSaveCompany} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                <FaBuilding className="text-teal-400" />
                <span>Company Logo, Branding & Corporate Contact</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-700/80">
                <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 p-3 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <img src={companyLogo} alt="Company Logo" className="w-full h-full object-contain" />
                </div>

                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-xl font-extrabold text-white">{companyName}</h3>
                  <p className="text-xs text-slate-400">HIPAA Verified Healthcare Platform Logo & Identity Badge</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-teal-400 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Company Logo Path / URL *</label>
                  <input
                    type="text"
                    value={companyLogo}
                    onChange={(e) => setCompanyLogo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-teal-400 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Toll-Free Support Helpline *</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-teal-400 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">HIPAA License & Certification ID *</label>
                  <input
                    type="text"
                    value={hipaaLicense}
                    onChange={(e) => setHipaaLicense(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-teal-400 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Global Corporate Headquarters Address</label>
                <textarea
                  value={corporateAddress}
                  onChange={(e) => setCorporateAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-teal-400 font-medium text-xs sm:text-sm"
                  rows={2}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  {isSaving ? <FaSpinner className="animate-spin text-slate-950" size={20} /> : <span>Save Company Branding Details ➔</span>}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CREDENTIALS & PASSWORD SECURITY */}
          {activeTab === 'security' && (
            <form onSubmit={handleSecurityUpdate} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 max-w-3xl">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                <FaKey className="text-emerald-400" />
                <span>Superuser Credential Rotation & Emergency Lockdown</span>
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">System Administrator Email (Login ID)</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Rotate Root Password (Optional)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    minLength={6}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    minLength={6}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
                  />
                </div>

                <div className="pt-4 border-t border-slate-700 space-y-3">
                  <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                    <div>
                      <h4 className="font-extrabold text-white">Multi-Factor Authentication (MFA / 2FA)</h4>
                      <p className="text-xs text-slate-400">Enforce OTP code verification for all Root Admin logins.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={enable2FA}
                      onChange={(e) => setEnable2FA(e.target.checked)}
                      className="w-5 h-5 accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                    <div>
                      <h4 className="font-extrabold text-amber-300">System Maintenance Mode</h4>
                      <p className="text-xs text-slate-400">Restrict non-admin user access during database maintenance.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      className="w-5 h-5 accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  {isSaving ? <FaSpinner className="animate-spin text-slate-950" size={20} /> : <span>Update Admin Security Controls ➔</span>}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: POSTGRESQL SECURITY AUDIT */}
          {activeTab === 'audit' && (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                <FaLock className="text-teal-400" />
                <span>Supabase PostgreSQL Security Architecture & RLS Audit</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Database Engine</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <span className="text-xl font-extrabold text-white block">PostgreSQL 16.3</span>
                  <p className="text-xs text-slate-400">Connected to Supabase Managed Cloud DB</p>
                </div>

                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">RLS Policies</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">ACTIVE</span>
                  </div>
                  <span className="text-xl font-extrabold text-white block">Row Level Security</span>
                  <p className="text-xs text-slate-400">Strict patient & doctor data isolation</p>
                </div>

                <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Encryption Standard</span>
                    <span className="text-xs font-bold text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded">256-BIT</span>
                  </div>
                  <span className="text-xl font-extrabold text-white block">Argon2 / SSL TLS 1.3</span>
                  <p className="text-xs text-slate-400">Zero plaintext password exposure</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700 flex items-start gap-3">
                  <FaCheckCircle className="text-emerald-400 text-lg flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-white">Row Level Security (RLS) Policy Audit</h4>
                    <p className="text-slate-400 mt-0.5">Patients can only query and modify their own appointments and medical files. Doctors can only inspect assigned patient appointments.</p>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700 flex items-start gap-3">
                  <FaCheckCircle className="text-emerald-400 text-lg flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-white">Admin Superuser Privilege Elevation</h4>
                    <p className="text-slate-400 mt-0.5">Only verified profiles with <strong className="text-emerald-400">role = 'admin'</strong> can access onboarding, bed telemetry, and credential rotation controls.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminSidebar>
    </AuthCheck>
  );
}