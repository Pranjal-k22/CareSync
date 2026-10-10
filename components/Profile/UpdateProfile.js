import React, { useContext, useState } from 'react';
import { UserContext } from '@/lib/context';
import toast from "react-hot-toast";
import { FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function UpdateProfile() {
  const router = useRouter();
  const { currentUser, user, setCurrentUser } = useContext(UserContext);
  const [name, setName] = useState(currentUser?.name || '');
  const [speciality, setSpeciality] = useState(currentUser?.specialty || '');
  const [address, setAddress] = useState(currentUser?.hospital || '');
  const [number, setNumber] = useState(currentUser?.phone || '');
  const [err, setErrer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveProfile() {
    if (!name.trim()) {
      setErrer('Name is required!');
      toast.error('Name is required!');
      return;
    }

    setIsSaving(true);
    setErrer(null);

    try {
      if (isSupabaseConfigured && user?.id) {
        const { error: updateErr } = await supabase.from('profiles').upsert({
          id: user.id,
          name: name.trim(),
          specialty: speciality.trim(),
          hospital: address.trim(),
          phone: number.trim(),
          updated_at: new Date().toISOString()
        });

        if (updateErr) throw updateErr;
      }

      setCurrentUser((prev) => ({
        ...prev,
        name: name.trim(),
        specialty: speciality.trim(),
        hospital: address.trim(),
        phone: number.trim()
      }));

      toast.success('Profile updated successfully in Supabase PostgreSQL!');
      setTimeout(() => router.back(), 1000);
    } catch (error) {
      console.error('UpdateProfile Error:', error);
      setErrer(error.message || 'Failed to update profile.');
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-white">
        <h2 className="text-2xl font-extrabold text-white mb-2">Update Profile & Security Settings</h2>
        <p className="text-xs text-slate-400 mb-6">Manage your account information, clinical specialty, and contact telemetry.</p>

        {err && (
          <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-semibold p-3 rounded-xl">
            {err}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Ananya Roy / Rahul Sharma"
              style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}
              className="w-full border px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="+91 9876543210"
              style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}
              className="w-full border px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1">
              Clinical Specialty / Role Details
            </label>
            <input
              type="text"
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
              placeholder="e.g. Cardiology / Internal Medicine"
              style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}
              className="w-full border px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1">
              Hospital / Clinic Location
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. CareSync Central Tower"
              style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}
              className="w-full border px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-700">
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            style={{ backgroundColor: '#10b981', color: '#ffffff' }}
            className="flex-1 font-extrabold py-3.5 px-6 rounded-xl hover:bg-emerald-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <FaSpinner className="animate-spin text-white" size={20} /> : <span>Save PostgreSQL Settings ➔</span>}
          </button>
          <button
            onClick={() => router.back()}
            style={{ backgroundColor: '#334155', color: '#cbd5e1' }}
            className="px-6 py-3.5 rounded-xl font-bold hover:bg-slate-700 transition-all border border-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
