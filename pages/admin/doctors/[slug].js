import React, { useState, useEffect } from 'react';
import AdminSidebar from '@components/Sidebar/AdminSidebar';
import AuthCheck from '@components/Auth/AuthCheck';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaAngleRight } from 'react-icons/fa';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function DoctorEditPage() {
  return (
    <AuthCheck requiredRole="admin">
      <AdminSidebar>
        <EditDoctorContent />
      </AdminSidebar>
    </AuthCheck>
  );
}

function EditDoctorContent() {
  const router = useRouter();
  const { slug } = router.query;
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isSubscribed = true;

    if (!slug) return;

    const fetchDoctor = async () => {
      if (!isSupabaseConfigured) {
        setProfile({ name: `Dr. ${slug}`, specialty: 'Cardiology', hospital: 'CareSync Hospital' });
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', slug)
          .single();

        if (data && isSubscribed) {
          setProfile(data);
        } else if (isSubscribed) {
          setProfile({ name: `Doctor (${slug})`, specialty: 'General Physician', hospital: 'CareSync Central' });
        }
      } catch (e) {
        setProfile({ name: `Doctor (${slug})`, specialty: 'General Physician', hospital: 'CareSync Central' });
      }
    };

    fetchDoctor();
    return () => {
      isSubscribed = false;
    };
  }, [slug]);

  return (
    <div className="p-6 space-y-6 text-white font-sans">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
        <Link href="/admin/doctors" className="hover:text-emerald-400">Doctors</Link>
        <FaAngleRight />
        <span className="text-white">{profile?.name || 'Doctor Profile'}</span>
      </div>

      {profile && (
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-xl space-y-4 max-w-2xl">
          <h2 className="text-2xl font-extrabold text-white">{profile.name}</h2>
          <p className="text-sm text-slate-300">Specialty: <strong className="text-emerald-400">{profile.specialty || profile.speciality || 'General Medicine'}</strong></p>
          <p className="text-sm text-slate-300">Location: {profile.hospital || profile.address || 'CareSync Main Tower'}</p>
        </div>
      )}
    </div>
  );
}