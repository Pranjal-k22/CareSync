import { useRouter } from "next/router";
import Link from 'next/link';
import { useContext } from "react";
import { UserContext } from "@/lib/context";

export default function IndexAuthCheck() {
  const { userRole, signOut } = useContext(UserContext);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans px-4">
      <div className="text-center p-8 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 text-3xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
          ⚠️
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Role Access Restricted</h1>
        <p className="text-slate-300 text-sm mb-6 font-medium">
          Your account is registered as <strong>{userRole?.toUpperCase() || 'PATIENT'}</strong>. You cannot access pages reserved for other roles.
        </p>

        <div className="space-y-3">
          {userRole === 'admin' && (
            <Link href="/admin/dashboard" className="block w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3 px-6 rounded-xl transition-all shadow-md">
              Go to Admin Dashboard ➔
            </Link>
          )}

          {userRole === 'doctor' && (
            <Link href="/doctor/dashboard" className="block w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3 px-6 rounded-xl transition-all shadow-md">
              Go to Doctor Dashboard ➔
            </Link>
          )}

          {(userRole === 'patient' || !userRole) && (
            <Link href="/patient/dashboard" className="block w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3 px-6 rounded-xl transition-all shadow-md">
              Go to Patient Dashboard ➔
            </Link>
          )}

          <button 
            onClick={handleSignOut}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-6 rounded-xl transition-all border border-slate-600"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}