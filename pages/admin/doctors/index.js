import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AuthCheck from "@components/Auth/AuthCheck";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import { FaUserMd, FaPlus, FaTrash, FaEdit, FaCheckCircle, FaTimesCircle, FaClock, FaKey, FaHospital, FaPhone, FaEnvelope, FaSpinner, FaSearch, FaCamera } from 'react-icons/fa';
import { useRouter } from "next/router";
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import FetchDoctors, { initialDoctorsList } from '@/lib/fetchDoctors';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function AdminDoctorsPage() {
  const { doctors, loading, setDoctors } = FetchDoctors();
  const router = useRouter();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    specialty: 'Cardiology',
    email: '',
    password: '',
    phone: '',
    hospital: 'HealConnect Central Tower',
    avatar_url: '',
    schedule_hours: '09:00 AM - 05:00 PM',
    is_available_today: true,
    fee: '₹500'
  });

  const specialtiesList = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General Medicine', 'Dermatology', 'Oncology'];

  // Clear form
  const resetForm = () => {
    setFormData({
      name: '',
      specialty: 'Cardiology',
      email: '',
      password: '',
      phone: '',
      hospital: 'HealConnect Central Tower',
      avatar_url: '',
      schedule_hours: '09:00 AM - 05:00 PM',
      is_available_today: true,
      fee: '₹500'
    });
    setEditingDoctor(null);
  };

  // Open Edit Modal
  const handleOpenEdit = (doc) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name || '',
      specialty: doc.specialty || doc.speciality || 'General Medicine',
      email: doc.email || '',
      password: doc.doctor_password_hint || 'doc12345',
      phone: doc.phone || '',
      hospital: doc.hospital || 'HealConnect Central',
      avatar_url: doc.avatar_url || doc.img || '',
      schedule_hours: doc.schedule_hours || '09:00 AM - 05:00 PM',
      is_available_today: doc.is_available_today !== undefined ? doc.is_available_today : true,
      fee: doc.fee || '₹500'
    });
    setShowAddModal(true);
  };

  // Toggle Doctor Availability
  const handleToggleAvailability = async (docId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update({ is_available_today: newStatus, updated_at: new Date().toISOString() })
          .eq('id', docId);

        if (error) throw error;
      }

      setDoctors((prev) =>
        prev.map((d) => (d.id === docId || d.uid === docId ? { ...d, is_available_today: newStatus } : d))
      );
      toast.success(`Doctor availability updated to ${newStatus ? 'AVAILABLE TODAY' : 'OFF DUTY'}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update availability');
    }
  };

  // Delete Doctor
  const handleDeleteDoctor = async (docId, docName) => {
    if (!confirm(`Are you sure you want to delete ${docName}? This will revoke their doctor login credentials.`)) return;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('profiles').delete().eq('id', docId);
        if (error) throw error;
      }

      setDoctors((prev) => prev.filter((d) => d.id !== docId && d.uid !== docId));
      toast.success(`Doctor ${docName} deleted from database!`);
    } catch (err) {
      toast.error(err.message || 'Failed to delete doctor');
    }
  };

  // Handle Add or Edit Form Submit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Doctor Name and Login Email are required!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDoctor) {
        // EDIT EXISTING DOCTOR
        const docId = editingDoctor.id || editingDoctor.uid;
        if (isSupabaseConfigured) {
          const { error } = await supabase
            .from('profiles')
            .update({
              name: formData.name,
              specialty: formData.specialty,
              email: formData.email,
              phone: formData.phone,
              hospital: formData.hospital,
              avatar_url: formData.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
              schedule_hours: formData.schedule_hours,
              is_available_today: formData.is_available_today,
              doctor_password_hint: formData.password || 'doc12345',
              fee: formData.fee,
              updated_at: new Date().toISOString()
            })
            .eq('id', docId);

          if (error) throw error;
        }

        setDoctors((prev) =>
          prev.map((d) =>
            d.id === docId || d.uid === docId
              ? {
                  ...d,
                  name: formData.name,
                  specialty: formData.specialty,
                  speciality: formData.specialty,
                  email: formData.email,
                  phone: formData.phone,
                  hospital: formData.hospital,
                  avatar_url: formData.avatar_url,
                  img: formData.avatar_url,
                  schedule_hours: formData.schedule_hours,
                  is_available_today: formData.is_available_today,
                  doctor_password_hint: formData.password,
                  fee: formData.fee
                }
              : d
          )
        );
        toast.success(`Doctor ${formData.name} profile updated!`);
      } else {
        // ADD NEW DOCTOR
        let newId = `doc-${Date.now()}`;
        if (isSupabaseConfigured) {
          // Register Doctor Auth Account
          const { data: authData, error: signUpErr } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password || 'doc12345',
            options: {
              data: {
                name: formData.name,
                role: 'doctor',
                specialty: formData.specialty,
                phone: formData.phone
              }
            }
          });

          if (signUpErr && !signUpErr.message.includes('already registered')) throw signUpErr;

          newId = authData?.user?.id || newId;

          // Insert Profile Record
          await supabase.from('profiles').upsert({
            id: newId,
            name: formData.name,
            email: formData.email,
            role: 'doctor',
            specialty: formData.specialty,
            phone: formData.phone,
            hospital: formData.hospital,
            avatar_url: formData.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
            is_available_today: formData.is_available_today,
            schedule_hours: formData.schedule_hours,
            doctor_password_hint: formData.password || 'doc12345',
            fee: formData.fee
          });
        }

        const newDocObj = {
          id: newId,
          uid: newId,
          name: formData.name,
          specialty: formData.specialty,
          speciality: formData.specialty,
          email: formData.email,
          phone: formData.phone,
          hospital: formData.hospital,
          avatar_url: formData.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
          img: formData.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
          is_available_today: formData.is_available_today,
          schedule_hours: formData.schedule_hours,
          doctor_password_hint: formData.password || 'doc12345',
          fee: formData.fee,
          role: 'doctor'
        };

        setDoctors((prev) => [newDocObj, ...prev]);
        toast.success(`Doctor ${formData.name} onboarded! Login ID: ${formData.email}`);
      }

      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Submit doctor error:', err);
      toast.error(err.message || 'Failed to save doctor details');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.specialty || doc.speciality)?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'All' || (doc.specialty || doc.speciality) === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  return (
    <AuthCheck requiredRole="admin">
      <AdminSidebar>
        <Head>
          <title>Doctor & Schedule Command Center | HealConnect Admin</title>
        </Head>

        <div className="p-4 sm:p-6 space-y-8 font-sans">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase mb-2">
                <FaUserMd />
                <span>Clinical Staff Credentials & RLS Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Doctors Directory & Credentials</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage doctor accounts, login IDs, temporary passwords, working schedules & live availability.</p>
            </div>

            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <FaPlus />
              <span>Onboard New Doctor</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search by doctor name, specialty, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department:</span>
              {specialtiesList.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    selectedSpecialty === spec
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* DOCTOR LIST GRID / TABLE */}
          {loading ? (
            <div className="text-center py-20 bg-slate-800 rounded-3xl border border-slate-700">
              <FaSpinner className="animate-spin text-emerald-400 text-3xl mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-bold">Querying Supabase PostgreSQL Doctor Directory...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredDoctors.map((doc) => {
                const docId = doc.id || doc.uid;
                const isAvailable = doc.is_available_today !== undefined ? doc.is_available_today : true;

                return (
                  <div key={docId} className="bg-slate-800 border border-slate-700/90 rounded-3xl p-6 shadow-xl hover:border-emerald-500/50 transition-all space-y-5">
                    {/* Doctor Card Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-400/80 bg-slate-900 flex-shrink-0 shadow-md">
                          <Image
                            src={doc.avatar_url || doc.img || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80'}
                            alt={doc.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>

                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-extrabold uppercase border border-emerald-500/30">
                            <span>{doc.specialty || doc.speciality || 'General Medicine'}</span>
                          </div>
                          <h3 className="text-lg font-extrabold text-white mt-1">{doc.name}</h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <FaHospital className="text-slate-500" />
                            <span>{doc.hospital || 'HealConnect Medical Center'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Availability Toggle Pill */}
                      <button
                        onClick={() => handleToggleAvailability(docId, isAvailable)}
                        className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all flex items-center gap-1.5 shadow-sm ${
                          isAvailable
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                        }`}
                        title="Click to toggle doctor's daily availability status"
                      >
                        {isAvailable ? <FaCheckCircle className="text-emerald-400" /> : <FaTimesCircle className="text-red-400" />}
                        <span>{isAvailable ? 'AVAILABLE TODAY' : 'OFF DUTY'}</span>
                      </button>
                    </div>

                    {/* Doctor Login Credentials & Schedule Box */}
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-extrabold uppercase flex items-center gap-1.5">
                          <FaEnvelope className="text-teal-400" /> Doctor Login Email / ID:
                        </span>
                        <span className="font-mono text-emerald-300 font-bold">{doc.email || 'N/A'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-extrabold uppercase flex items-center gap-1.5">
                          <FaKey className="text-amber-400" /> Login Password Hint:
                        </span>
                        <span className="font-mono text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-bold">
                          {doc.doctor_password_hint || 'doc12345'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400 font-extrabold uppercase flex items-center gap-1.5">
                          <FaClock className="text-blue-400" /> Schedule Hours:
                        </span>
                        <span className="text-slate-300 font-semibold">{doc.schedule_hours || '09:00 AM - 05:00 PM'}</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <FaPhone className="text-slate-500" />
                        <span>{doc.phone || '+91 9876543210'}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl border border-slate-600 transition-all flex items-center gap-1.5"
                        >
                          <FaEdit />
                          <span>Edit Doctor</span>
                        </button>

                        <button
                          onClick={() => handleDeleteDoctor(docId, doc.name)}
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

          {/* ADD / EDIT DOCTOR MODAL */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <FaUserMd className="text-emerald-400" />
                    <span>{editingDoctor ? 'Edit Doctor Profile & Credentials' : 'Onboard New Clinical Specialist'}</span>
                  </h2>
                  <button
                    onClick={() => { setShowAddModal(false); resetForm(); }}
                    className="text-slate-400 hover:text-white font-bold text-lg"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Doctor Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Dr. Sarah Johnson, MD"
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Specialty / Department *</label>
                      <select
                        value={formData.specialty}
                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
                      >
                        {specialtiesList.filter(s => s !== 'All').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Doctor Login Email (Login ID) *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="doctor@healconnect.com"
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Doctor Login Password *</label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="e.g. doc12345"
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Hospital / Location</label>
                      <input
                        type="text"
                        value={formData.hospital}
                        onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                        placeholder="HealConnect Central Tower"
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
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
                      className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block font-extrabold text-slate-300 uppercase mb-1">Schedule Working Hours</label>
                      <input
                        type="text"
                        value={formData.schedule_hours}
                        onChange={(e) => setFormData({ ...formData, schedule_hours: e.target.value })}
                        placeholder="09:00 AM - 05:00 PM"
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="is_available_today"
                        checked={formData.is_available_today}
                        onChange={(e) => setFormData({ ...formData, is_available_today: e.target.checked })}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                      <label htmlFor="is_available_today" className="font-extrabold text-white cursor-pointer select-none">
                        Available Today (On Duty)
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-700">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? <FaSpinner className="animate-spin text-slate-950" size={20} /> : <span>{editingDoctor ? 'Save Doctor Changes ➔' : 'Onboard Doctor ➔'}</span>}
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
