import React, { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import AuthCheck from "@components/Auth/AuthCheck";
import DoctorSidebar from "@components/Sidebar/DoctorSidebar";
import { FaBell, FaExclamationTriangle, FaCalendarCheck, FaPills, FaBullhorn, FaCheckCircle, FaSpinner, FaFilter, FaLock } from 'react-icons/fa';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { UserContext } from '@/lib/context';

export default function DoctorNotificationsPage() {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [readIds, setReadIds] = useState(new Set());

  const [notifications, setNotifications] = useState([
    {
      id: 'doc-notif-1',
      title: '🚨 Emergency ICU Telemetry & Ventilator Alert',
      message: 'ICU Ward Bed A-02 ventilator line telemetry requires attending physician review.',
      type: 'emergency',
      target_role: 'doctor',
      created_at: new Date().toISOString()
    },
    {
      id: 'doc-notif-2',
      title: '📅 New Patient Appointment Booked',
      message: 'Patient Rajesh Verma has confirmed a 10:15 AM Cardiology consultation.',
      type: 'appointment',
      target_role: 'doctor',
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'doc-notif-3',
      title: '📢 System Security & RLS Policy Update',
      message: 'Supabase PostgreSQL Row Level Security policies updated by Root Administrator.',
      type: 'announcement',
      target_role: 'all',
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ]);

  useEffect(() => {
    let isSubscribed = true;

    const fetchDoctorNotifications = async () => {
      setLoading(true);
      if (!isSupabaseConfigured) {
        if (isSubscribed) setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .or(`target_role.eq.all,target_role.eq.doctor,target_role.eq.staff${user?.email ? `,target_email.eq.${user.email}` : ''}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isSubscribed && data && data.length > 0) {
          setNotifications(data);
        }
      } catch (err) {
        console.warn('Doctor fetch notifications error:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchDoctorNotifications();
    return () => { isSubscribed = false; };
  }, [user]);

  const toggleRead = (id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (selectedFilter === 'All') return true;
    return n.type === selectedFilter.toLowerCase();
  });

  return (
    <AuthCheck requiredRole="doctor">
      <DoctorSidebar>
        <Head>
          <title>Clinical Notifications Inbox | CareSync Doctor</title>
        </Head>

        <div className="p-4 sm:p-6 space-y-8 font-sans">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase mb-2">
                <FaLock />
                <span>VERIFIED CLINICAL READ-ONLY INBOX · ADMIN BROADCASTS ONLY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Doctor Clinical Alerts & Notifications</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Inspect hospital emergency alerts, patient appointments, and official announcements.</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FaFilter className="text-blue-400" /> Filter Alerts:
            </span>
            {['All', 'Emergency', 'Appointment', 'Announcement'].map((flt) => (
              <button
                key={flt}
                onClick={() => setSelectedFilter(flt)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  selectedFilter === flt
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {flt}
              </button>
            ))}
          </div>

          {/* NOTIFICATIONS LIST */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            {loading ? (
              <div className="text-center py-16">
                <FaSpinner className="animate-spin text-blue-400 text-3xl mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">Querying Clinical Alerts Database...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-bold">No notifications found.</div>
            ) : (
              filteredNotifications.map((notif) => {
                const isRead = readIds.has(notif.id);
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
                  <div
                    key={notif.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 shadow-md ${
                      isRead ? 'bg-slate-900/60 border-slate-800 opacity-75' : 'bg-slate-900 border-slate-700 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border flex items-center gap-1 ${typeBadge}`}>
                          {icon}
                          <span>{notif.type}</span>
                        </span>
                      </div>

                      <button
                        onClick={() => toggleRead(notif.id)}
                        className={`text-xs font-extrabold px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${
                          isRead
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        }`}
                      >
                        <FaCheckCircle />
                        <span>{isRead ? 'Read' : 'Mark as Read'}</span>
                      </button>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-white text-base">{notif.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      <span>Sender: System Administrator</span>
                      <span>{new Date(notif.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DoctorSidebar>
    </AuthCheck>
  );
}
