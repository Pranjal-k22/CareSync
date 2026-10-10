// components/Auth/AuthCheck.js
import { useContext } from 'react';
import { UserContext } from '@/lib/context';
import Link from 'next/link';

function YouMustSignIn() {
  return (
    <main className="h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
      <div className="text-center p-8 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 text-3xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
          🔒
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Access Restricted</h1>
        <p className="text-slate-300 text-sm mb-6 font-medium">You need to sign in to access this portal page.</p>
        <Link href="/login" className="inline-block w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3 px-6 rounded-xl transition-all shadow-lg">
          Go to Sign In ➔
        </Link>
      </div>
    </main>
  );
}

function AccessDenied({ requiredRole, userRole }) {
  return (
    <main className="h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
      <div className="text-center p-8 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 text-3xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
          ⚠️
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Unauthorized Access</h1>
        <p className="text-slate-300 text-sm mb-4 font-medium">
          This section requires <strong>{requiredRole.toUpperCase()}</strong> authorization. Your current role is <strong>{userRole?.toUpperCase() || 'PATIENT'}</strong>.
        </p>
        <Link href="/login" className="inline-block w-full bg-slate-700 hover:bg-slate-600 text-white font-extrabold py-3 px-6 rounded-xl transition-all border border-slate-600">
          Switch Account Role ➔
        </Link>
      </div>
    </main>
  );
}

export default function AuthCheck({ children, fallback, requiredRole }) {
  const { user, userRole } = useContext(UserContext);

  if (!user) {
    return fallback || <YouMustSignIn />;
  }

  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    return <AccessDenied requiredRole={requiredRole} userRole={userRole} />;
  }

  return children;
}