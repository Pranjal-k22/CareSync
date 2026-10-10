import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { UserContext } from '@/lib/context';
import Footer from '@/components/Footer';
import UpdateProfile from './UpdateProfile';

export default function ProfileView() {
  const { userRole, currentUser, user, signOut } = useContext(UserContext);
  const [update, setUpdate] = useState(false);

  return (
    <main className="min-h-screen w-full bg-slate-900 text-white font-sans pt-20">
      {!update ? (
        <div className="max-w-4xl mx-auto p-6 sm:p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white">Your CareSync Profile</h1>
            <div className="mx-auto w-24 h-1 my-4 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"></div>
          </header>

          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-700">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center border border-emerald-500/40 font-bold">
                👤
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-extrabold text-white">
                  Welcome, <span className="text-emerald-400">{currentUser?.name || user?.email?.split('@')[0] || 'User'}</span>
                </h2>
                <p className="text-slate-400 text-sm">{user?.email || 'Email Not Specified'}</p>
                <span className="inline-block mt-2 text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full">
                  Role: {userRole?.toUpperCase() || 'PATIENT'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block font-bold uppercase">Account ID</span>
                <span className="font-mono text-slate-200 font-semibold">{user?.id || 'demo-user-id'}</span>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block font-bold uppercase">Clinical / Contact Info</span>
                <span className="text-slate-200 font-semibold">{currentUser?.phone || '+91 9876543210'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {userRole === 'admin' && (
                <Link href="/admin/dashboard" className="flex-1 text-center bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3 px-6 rounded-xl transition-all shadow-md">
                  Go to Admin Dashboard ➔
                </Link>
              )}

              {userRole === 'doctor' && (
                <Link href="/doctor/dashboard" className="flex-1 text-center bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3 px-6 rounded-xl transition-all shadow-md">
                  Go to Doctor Dashboard ➔
                </Link>
              )}

              {(userRole === 'patient' || !userRole) && (
                <Link href="/patient/dashboard" className="flex-1 text-center bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3 px-6 rounded-xl transition-all shadow-md">
                  Go to Patient Dashboard ➔
                </Link>
              )}

              <button
                onClick={() => setUpdate(true)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-all border border-slate-600"
              >
                ⚙️ Profile & Security Settings
              </button>

              <button
                onClick={signOut}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold py-3 px-6 rounded-xl transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <UpdateProfile />
      )}
      <Footer />
    </main>
  );
}
