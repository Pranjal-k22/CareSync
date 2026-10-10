import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AuthCheck from "@components/Auth/AuthCheck";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import { FaUserNurse, FaPlus, FaTrash, FaEdit, FaCheckCircle, FaTimesCircle, FaClock, FaKey, FaHospital, FaPhone, FaEnvelope, FaSpinner, FaSearch } from 'react-icons/fa';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function AdminStaffPage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial Mock Staff Dataset
  const [staffList, setStaffList] = useState([
    {
      id: 'stf-1',
      uid: 'stf-1',
      name: 'Nurse Anjali Deshmukh',
      department: 'ICU Nursing',
      email: 'anjali.d@healconnect.com',
      staff_password_hint: 'stf12345',
      phone: '+91 9876500001',
      hospital: 'HealConnect Central Tower',
      avatar_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
      shift_hours: 'Day Shift (08:00 AM - 04:00 PM)',
      is_on_duty: true,
      role: 'staff'
    },
    {
      id: 'stf-2',
      uid: 'stf-2',
      name: 'Tech Suresh Kumar',
      department: 'Radiology & Imaging',
      email: 'suresh.k@healconnect.com',
      staff_password_hint: 'stf12345',
      phone: '+91 9876500002',
      hospital: 'HealConnect Central Tower',
      avatar_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      shift_hours: 'Night Shift (08:00 PM - 04:00 AM)',
      is_on_duty: true,
      role: 'staff'
    },
    {
      id: 'stf-3',
      uid: 'stf-3',
      name: 'Pharm. Meenakshi Sundaram',
      department: 'Pharmacy & Dispensing',
      email: 'meenakshi.s@healconnect.com',
      staff_password_hint: 'stf12345',
      phone: '+91 9876500003',
      hospital: 'HealConnect Central Tower',
      avatar_url: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80',
      shift_hours: 'General Shift (09:00 AM - 05:00 PM)',
      is_on_duty: true,
      role: 'staff'
    },
    {
      id: 'stf-4',
      uid: 'stf-4',
      name: 'Nurse Robert Paul',
      department: 'Emergency Care Unit',
      email: 'robert.paul@healconnect.com',
      staff_password_hint: 'stf12345',
      phone: '+91 9876500004',
      hospital: 'HealConnect Trauma Pavilion',
      avatar_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
      shift_hours: 'Evening Shift (04:00 PM - 12:00 AM)',
      is_on_duty: false,
      role: 'staff'
    }
  ]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    department: 'ICU Nursing',
    email: '',
    password: '',
    phone: '',
    hospital: 'HealConnect Central Tower',
    avatar_url: '',
    shift_hours: 'Day Shift (08:00 AM - 04:00 PM)',
    is_on_duty: true
  });

  const departmentList = ['All', 'ICU Nursing', 'Radiology & Imaging', 'Pharmacy & Dispensing', 'Emergency Care Unit', 'Laboratory Diagnostics'];

  // Load Staff from Supabase
  useEffect(() => {
    let isSubscribed = true;

    const fetchStaff = async () => {
      setLoading(true);
      if (!isSupabaseConfigured) {
        if (isSubscribed) setLoading(false);
        return;
      }

      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'staff')
          .order('created_at', { ascending: false });

        if (err) throw err;
        if (isSubscribed && data && data.length > 0) {
          const formatted = data.map(s => ({
            ...s,
            uid: s.id,
            department: s.specialty || 'ICU Nursing',
            staff_password_hint: s.doctor_password_hint || 'stf12345',
            shift_hours: s.schedule_hours || 'Day Shift (08:00 AM - 04:00 PM)',
            is_on_duty: s.is_available_today !== undefined ? s.is_available_today : true
          }));

          const dbNames = new Set(formatted.map(s => s.name.toLowerCase()));
          const defaults = staffList.filter(s => !dbNames.has(s.name.toLowerCase()));
          setStaffList([...formatted, ...defaults]);
        }
      } catch (err) {
        console.warn('Supabase fetchStaff error:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchStaff();
    return () => {
      isSubscribed = false;
    };
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      department: 'ICU Nursing',
      email: '',
      password: '',
      phone: '',
      hospital: 'HealConnect Central Tower',
      avatar_url: '',
      shift_hours: 'Day Shift (08:00 AM - 04:00 PM)',
      is_on_duty: true
    });
    setEditingStaff(null);
  };

  const handleOpenEdit = (stf) => {
    setEditingStaff(stf);
    setFormData({
      name: stf.name || '',
      department: stf.department || 'ICU Nursing',
      email: stf.email || '',
      password: stf.staff_password_hint || 'stf12345',
      phone: stf.phone || '',
      hospital: stf.hospital || 'HealConnect Central Tower',
      avatar_url: stf.avatar_url || '',
      shift_hours: stf.shift_hours || 'Day Shift (08:00 AM - 04:00 PM)',
      is_on_duty: stf.is_on_duty !== undefined ? stf.is_on_duty : true
    });
    setShowAddModal(true);
  };

  const handleToggleDuty = async (stfId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('profiles')
          .update({ is_available_today: newStatus, updated_at: new Date().toISOString() })
          .eq('id', stfId);
      }

      setStaffList((prev) =>
        prev.map((s) => (s.id === stfId || s.uid === stfId ? { ...s, is_on_duty: newStatus } : s))
      );
      toast.success(`Staff duty status updated to ${newStatus ? 'ON DUTY' : 'OFF DUTY'}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update staff duty status');
    }
  };

  const handleDeleteStaff = async (stfId, stfName) => {
    if (!confirm(`Are you sure you want to delete staff member ${stfName}?`)) return;

    try {
      if (isSupabaseConfigured) {
        await supabase.from('profiles').delete().eq('id', stfId);
      }

      setStaffList((prev) => prev.filter((s) => s.id !== stfId && s.uid !== stfId));
      toast.success(`Staff member ${stfName} deleted!`);
    } catch (err) {
      toast.error(err.message || 'Failed to delete staff member');
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Staff Name and Login Email are required!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingStaff) {
        const stfId = editingStaff.id || editingStaff.uid;
        if (isSupabaseConfigured) {
          await supabase
            .from('profiles')
            .update({
              name: formData.name,
              specialty: formData.department,
              email: formData.email,
              phone: formData.phone,
              hospital: formData.hospital,
              avatar_url: formData.avatar_url,
              schedule_hours: formData.shift_hours,
              is_available_today: formData.is_on_duty,
              doctor_password_hint: formData.password || 'stf12345',
              updated_at: new Date().toISOString()
            })
            .eq('id', stfId);
        }

        setStaffList((prev) =>
          prev.map((s) =>
            s.id === stfId || s.uid === stfId
              ? {
                  ...s,
                  name: formData.name,
                  department: formData.department,
                  email: formData.email,
                  phone: formData.phone,
                  hospital: formData.hospital,
                  avatar_url: formData.avatar_url,
                  shift_hours: formData.shift_hours,
                  is_on_duty: formData.is_on_duty,
                  staff_password_hint: formData.password
                }
              : s
          )
        );
        toast.success(`Staff member ${formData.name} profile updated!`);
      } else {
        let newId = `stf-${Date.now()}`;
        if (isSupabaseConfigured) {
          const { data: authData, error: signUpErr } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password || 'stf12345',
            options: {
              data: {
                name: formData.name,
                role: 'staff',
                specialty: formData.department
              }
            }
          });

          if (signUpErr && !signUpErr.message.includes('already registered')) throw signUpErr;

          newId = authData?.user?.id || newId;

          await supabase.from('profiles').upsert({
            id: newId,
            name: formData.name,
            email: formData.email,
            role: 'staff',
            specialty: formData.department,
            phone: formData.phone,
            hospital: formData.hospital,
            avatar_url: formData.avatar_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
            is_available_today: formData.is_on_duty,
            schedule_hours: formData.shift_hours,
            doctor_password_hint: formData.password || 'stf12345'
          });
        }

        const newStaffObj = {
          id: newId,
          uid: newId,
          name: formData.name,
          department: formData.department,
          email: formData.email,
          phone: formData.phone,
          hospital: formData.hospital,
          avatar_url: formData.avatar_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
          shift_hours: formData.shift_hours,
          is_on_duty: formData.is_on_duty,
          staff_password_hint: formData.password || 'stf12345',
          role: 'staff'
        };

        setStaffList((prev) => [newStaffObj, ...prev]);
        toast.success(`Staff Member ${formData.name} onboarded! Login Email: ${formData.email}`);
      }

      setShowAddModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save staff details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((stf) => {
    const matchesSearch =
      stf.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stf.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stf.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDepartment === 'All' || stf.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <AuthCheck requiredRole="admin">
      <AdminSidebar>
        <Head>
          <title>Hospital Staff Onboarding & Directory | HealConnect Admin</title>
        </Head>

        <div className="p-4 sm:p-6 space-y-8 font-sans">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase mb-2">
                <FaUserNurse />
                <span>Clinical Staff Onboarding & Credentials Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Hospital Staff Onboarding & Roster</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage nursing, radiology, pharmacy, lab, and emergency staff credentials and duty shifts.</p>
            </div>

            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <FaPlus />
              <span>Onboard New Staff</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search staff name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department:</span>
              {departmentList.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    selectedDepartment === dept
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* STAFF GRID */}
          {loading ? (
            <div className="text-center py-20 bg-slate-800 rounded-3xl border border-slate-700">
              <FaSpinner className="animate-spin text-blue-400 text-3xl mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-bold">Querying Staff Roster Database...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredStaff.map((stf) => {
                const stfId = stf.id || stf.uid;
                const isOnDuty = stf.is_on_duty !== undefined ? stf.is_on_duty : true;

                return (
                  <div key={stfId} className="bg-slate-800 border border-slate-700/90 rounded-3xl p-6 shadow-xl hover:border-blue-500/50 transition-all space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-blue-400/80 bg-slate-900 flex-shrink-0 shadow-md">
                          <Image
                            src={stf.avatar_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80'}
                            alt={stf.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>

                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-[11px] font-extrabold uppercase border border-blue-500/30">
                            <span>{stf.department || 'ICU Nursing'}</span>
                          </div>
                          <h3 className="text-lg font-extrabold text-white mt-1">{stf.name}</h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <FaHospital className="text-slate-500" />
                            <span>{stf.hospital || 'HealConnect Central Tower'}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleDuty(stfId, isOnDuty)}
                        className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all flex items-center gap-1.5 shadow-sm ${
                          isOnDuty
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                        }`}
                        title="Toggle duty status"
                      >
                        {isOnDuty ? <FaCheckCircle className="text-emerald-400" /> : <FaTimesCircle className="text-red-400" />}
                        <span>{isOnDuty ? 'ON DUTY' : 'OFF DUTY'}</span>
                      </button>
                    </div>

                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-extrabold uppercase flex items-center gap-1.5">
                          <FaEnvelope className="text-teal-400" /> Staff Login Email ID:
                        </span>
                        <span className="font-mono text-blue-300 font-bold">{stf.email || 'N/A'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-extrabold uppercase flex items-center gap-1.5">
                          <FaKey className="text-amber-400" /> Login Password Hint:
                        </span>
                        <span className="font-mono text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-bold">
                          {stf.staff_password_hint || 'stf12345'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400 font-extrabold uppercase flex items-center gap-1.5">
                          <FaClock className="text-indigo-400" /> Shift Hours:
                        </span>
                        <span className="text-slate-300 font-semibold">{stf.shift_hours || 'Day Shift (08:00 AM - 04:00 PM)'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <FaPhone className="text-slate-500" />
                        <span>{stf.phone || '+91 9876500001'}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(stf)}
                          className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl border border-slate-600 transition-all flex items-center gap-1.5"
                        >
                          <FaEdit />
                          <span>Edit Staff</span>
                        </button>

                        <button
                          onClick={() => handleDeleteStaff(stfId, stf.name)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-extrabold px-3.5 py-2 rounded-xl border border-red-500/40 transition-all flex items-center gap-1.5"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ADD / EDIT STAFF MODAL */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <FaUserNurse className="text-blue-400" />
                    <span>{editingStaff ? 'Edit Staff Profile & Credentials' : 'Onboard New Hospital Staff Member'}</span>
                  </h2>
                  <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Staff Member Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Nurse Anjali Deshmukh"
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-400 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Department / Clinical Role *</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-400 font-medium"
                      >
                        {departmentList.filter(d => d !== 'All').map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Staff Login Email ID *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="staff@healconnect.com"
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-400 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Login Password *</label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="e.g. stf12345"
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-400 font-medium font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 9876500001"
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-400 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Hospital / Location</label>
                      <input
                        type="text"
                        value={formData.hospital}
                        onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                        placeholder="HealConnect Central Tower"
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-400 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-300 uppercase mb-1">Profile Avatar Image URL</label>
                    <input
                      type="url"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-400 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Shift Schedule Hours</label>
                      <input
                        type="text"
                        value={formData.shift_hours}
                        onChange={(e) => setFormData({ ...formData, shift_hours: e.target.value })}
                        placeholder="Day Shift (08:00 AM - 04:00 PM)"
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-400 font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="is_on_duty"
                        checked={formData.is_on_duty}
                        onChange={(e) => setFormData({ ...formData, is_on_duty: e.target.checked })}
                        className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
                      />
                      <label htmlFor="is_on_duty" className="font-extrabold text-white cursor-pointer select-none">
                        On Duty Currently
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-700">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? <FaSpinner className="animate-spin text-white" size={20} /> : <span>{editingStaff ? 'Save Staff Changes ➔' : 'Onboard Staff Member ➔'}</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddModal(false); resetForm(); }}
                      className="px-6 py-3.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl border border-slate-600"
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
