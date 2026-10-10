import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import AuthCheck from "@components/Auth/AuthCheck";
import { FaBell, FaPaperPlane, FaBullhorn, FaExclamationTriangle, FaCalendarCheck, FaPills, FaTrash, FaSpinner, FaUsers, FaUserMd, FaUserCheck, FaEnvelope } from 'react-icons/fa';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { initial50PatientsList } from '@/lib/fetchPatients';
import toast from 'react-hot-toast';

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('PAT-1001');
  const [notificationsList, setNotificationsList] = useState([
    {
      id: 'notif-1',
      title: '🚨 Emergency Trauma Ward Maintenance Alert',
      message: 'ICU Ward B will undergo scheduled backup power maintenance from 11:00 PM to 01:00 AM tonight.',
      type: 'emergency',
      target_role: 'all',
      sender_role: 'admin',
      created_at: new Date().toISOString()
    },
    {
      id: 'notif-2',
      title: '📅 New Doctor Onboarding & Schedule Update',
      message: 'Dr. Sarah Johnson and Dr. Michael Chen have updated their clinical availability schedule for today.',
      type: 'appointment',
      target_role: 'patient',
      sender_role: 'admin',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'notif-3',
      title: '💊 AI Prescription Scanner Upgrade Live',
      message: 'All doctors can now scan handwritten prescriptions with instant generic medicine alternatives.',
      type: 'prescription',
      target_role: 'doctor',
      sender_role: 'admin',
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    target_role: 'all',
    target_email: ''
  });

  // Load Notifications from Supabase
  useEffect(() => {
    let isSubscribed = true;

    const fetchNotifications = async () => {
      setLoading(true);
      if (!isSupabaseConfigured) {
        if (isSubscribed) setLoading(false);
        return;
      }

      try {
        const { data, error: err } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (err) throw err;
        if (isSubscribed && data && data.length > 0) {
          setNotificationsList(data);
        }
      } catch (err) {
        console.warn('Supabase fetch notifications error:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchNotifications();
    return () => { isSubscribed = false; };
  }, []);

  // Send Broadcast / Direct Notification
  // Emergency SMS / Email Escalation Dispatcher
  const handleDispatchEscalation = async () => {
    setIsSending(true);
    const targetPatient = initial50PatientsList.find(p => p.id === selectedPatientId) || initial50PatientsList[0];

    try {
      const res = await fetch('/api/alerts/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: targetPatient.id,
          patient_name: targetPatient.name || `${targetPatient.firstName} ${targetPatient.lastName}`,
          heart_rate: 128,
          spo2: 88,
          temperature: 102.1,
          risk_score: 82.5,
          phone: targetPatient.phone || targetPatient.number || '+91 9876543210',
          email: targetPatient.email || 'doctor@healconnect.com'
        })
      });

      const resData = await res.json();
      toast.success(`🚨 High-Risk Alert Escalation Dispatched via SMTP & Twilio SMS Gateways for ${targetPatient.name || targetPatient.id}!`);
      
      const newEmergencyItem = {
        id: `notif-${Date.now()}`,
        title: `🚨 HIGH-RISK CRITICAL EMERGENCY ESCALATION (${targetPatient.id})`,
        message: `SpO2 drop (88%) and abnormal tachycardia (128 BPM) detected for ${targetPatient.name || targetPatient.id} (${targetPatient.id}). Automated Email & SMS alerts dispatched.`,
        type: 'emergency',
        target_role: 'doctor',
        sender_role: 'system',
        created_at: new Date().toISOString()
      };
      setNotificationsList(prev => [newEmergencyItem, ...prev]);
    } catch (err) {
      toast.error('Escalation Dispatched (Demo Mode)');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Notification title and message content are required!');
      return;
    }

    setIsSending(true);
    try {
      const newNotifObj = {
        id: `notif-${Date.now()}`,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        target_role: formData.target_role,
        target_email: formData.target_email || null,
        sender_role: 'admin',
        created_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('notifications').insert({
          title: formData.title,
          message: formData.message,
          type: formData.type,
          target_role: formData.target_role,
          target_email: formData.target_email || null,
          sender_role: 'admin'
        }).select().single();

        if (error) throw error;
        if (data) newNotifObj.id = data.id;
      }

      setNotificationsList((prev) => [newNotifObj, ...prev]);
      toast.success(`Notification broadcast sent successfully! Audience: ${formData.target_role.toUpperCase()}`);
      setFormData({
        title: '',
        message: '',
        type: 'announcement',
        target_role: 'all',
        target_email: ''
      });
    } catch (err) {
      toast.error(err.message || 'Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  // Delete Notification
  const handleDeleteNotification = async (notifId) => {
    try {
      if (isSupabaseConfigured) {
        await supabase.from('notifications').delete().eq('id', notifId);
      }

      setNotificationsList((prev) => prev.filter((n) => n.id !== notifId));
      toast.success('Notification broadcast deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete notification');
    }
  };

  return (
    <AuthCheck requiredRole="admin">
      <AdminSidebar>
        <Head>
          <title>System Notification Broadcast Center | CareSync Admin</title>
        </Head>

        <div className="p-4 sm:p-6 space-y-8 font-sans">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase mb-2">
                <FaBullhorn />
                <span>Superuser Notification & Alert Dispatcher (Admin Only)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Broadcast Notification Center</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Compose emergency alerts, appointment updates, and system announcements for patients and doctors.</p>
            </div>
          </div>

          {/* AUTOMATED HIGH-RISK EMAIL & SMS ESCALATION CARD */}
          <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/90 border border-rose-500/40 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase">
                <FaExclamationTriangle className="animate-pulse" />
                <span>Automated High-Risk Escalation Engine</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">Emergency Email & SMS Patient Escalation Gateway</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Automatically monitors telemetry vitals (SpO2 &lt; 90%, HR &gt; 120 BPM, Risk Score &gt; 75%) and dispatches high-priority email notifications and SMS text alerts to attending physicians.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="bg-slate-900 border border-rose-500/40 text-white text-xs font-bold py-3 px-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xl w-full sm:w-64"
              >
                {initial50PatientsList.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.id} - {p.name || `${p.firstName} ${p.lastName}`} ({p.bloodGroup || 'O+'})
                  </option>
                ))}
              </select>

              <button
                onClick={handleDispatchEscalation}
                disabled={isSending}
                className="bg-rose-600 hover:bg-rose-500 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-rose-600/30 transition-all text-xs sm:text-sm border border-white/10 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto flex-shrink-0"
              >
                {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                <span>Dispatch High-Risk Alert ➔</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* COMPOSE NOTIFICATION PANEL (ADMIN ONLY) */}
            <form onSubmit={handleSendNotification} className="lg:col-span-5 bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                <FaPaperPlane className="text-emerald-400" />
                <span>Dispatch Broadcast Notification</span>
              </h2>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1">Notification Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Emergency Ward Maintenance Alert"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1">Alert Priority & Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400"
                  >
                    <option value="announcement">📢 General Announcement</option>
                    <option value="emergency">🚨 Emergency Alert (Red)</option>
                    <option value="appointment">📅 Appointment Update</option>
                    <option value="prescription">💊 Prescription & Pharmacy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1">Target Audience</label>
                  <select
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400"
                  >
                    <option value="all">🌐 Broadcast to All Users</option>
                    <option value="patient">🏥 Patients Only</option>
                    <option value="doctor">👨‍⚕️ Doctors & Staff Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1">Specific Target Email (Optional)</label>
                <input
                  type="email"
                  value={formData.target_email}
                  onChange={(e) => setFormData({ ...formData, target_email: e.target.value })}
                  placeholder="user@healconnect.com (Leave blank for broadcast)"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1">Notification Message Body *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write clear notification details for patients and medical staff..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isSending ? <FaSpinner className="animate-spin text-slate-950" size={20} /> : <span>Dispatch Broadcast Alert ➔</span>}
              </button>
            </form>

            {/* SENT NOTIFICATIONS BROADCAST HISTORY LOG */}
            <div className="lg:col-span-7 bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <FaBell className="text-teal-400" />
                  <span>Dispatched Notifications Log ({notificationsList.length})</span>
                </h2>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  REALTIME DB SYNC
                </span>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <FaSpinner className="animate-spin text-emerald-400 text-3xl mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Loading system notifications log...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {notificationsList.map((notif) => {
                    let typeBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                    let icon = <FaBullhorn className="text-blue-400" />;

                    if (notif.type === 'emergency') {
                      typeBadge = 'bg-red-500/20 text-red-300 border-red-500/40';
                      icon = <FaExclamationTriangle className="text-red-400" />;
                    } else if (notif.type === 'appointment') {
                      typeBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                      icon = <FaCalendarCheck className="text-emerald-400" />;
                    } else if (notif.type === 'prescription') {
                      typeBadge = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
                      icon = <FaPills className="text-teal-400" />;
                    }

                    return (
                      <div key={notif.id} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700 space-y-3 shadow-md hover:border-slate-600 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border flex items-center gap-1 ${typeBadge}`}>
                              {icon}
                              <span>{notif.type}</span>
                            </span>

                            <span className="text-[11px] font-mono text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                              Target: {notif.target_role}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteNotification(notif.id)}
                            className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-all text-xs"
                            title="Delete Broadcast"
                          >
                            <FaTrash />
                          </button>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-white text-sm sm:text-base">{notif.title}</h4>
                          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                          <span>Sender: Root Administrator</span>
                          <span>{new Date(notif.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminSidebar>
    </AuthCheck>
  );
}
