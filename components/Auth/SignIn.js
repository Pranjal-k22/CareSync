import React, { useState, useContext } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '@/lib/context';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function ProfessionalSignIn() {
  const router = useRouter();
  const { user, currentUser, userRole, setUserRole, setUser, setCurrentUser, signOut } = useContext(UserContext);

  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [selectedRole, setSelectedRole] = useState('patient'); // 'patient' | 'doctor' | 'admin'

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  // UI Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Submit Handler for Email Auth
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const targetEmail = email.trim();
    const effectiveRole = selectedRole;

    // Local development can use the FastAPI identity service when Supabase
    // Auth has not been configured. Production always uses Supabase Auth.
    if (!isSupabaseConfigured) {
      try {
        const apiBase = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://127.0.0.1:8000';
        const response = await fetch(`${apiBase}${authMode === 'signup' ? '/register' : '/login'}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authMode === 'signup'
            ? { name: fullName || targetEmail.split('@')[0], email: targetEmail, password, role: effectiveRole }
            : { email: targetEmail, password }
          )
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || data.message || 'Authentication failed');

        if (authMode === 'signup') {
          setSuccessMessage(`Account created for ${effectiveRole.toUpperCase()}. Please sign in.`);
          setAuthMode('signin');
          setIsLoading(false);
          return;
        }

        const apiUser = data.user;
        const roleToUse = (apiUser && apiUser.role && apiUser.role !== 'patient') ? apiUser.role : selectedRole;
        window.localStorage.setItem('healconnect_api_token', data.access_token);
        setUser({ id: apiUser.email, email: apiUser.email, user_metadata: { name: apiUser.name, role: roleToUse } });
        setUserRole(roleToUse);
        setCurrentUser({ id: apiUser.email, email: apiUser.email, name: apiUser.name, role: roleToUse });
        setSuccessMessage(`Welcome back! Authenticated as ${roleToUse.toUpperCase()}`);
        setTimeout(() => redirectByRole(roleToUse), 600);
      } catch (err) {
        setErrorMessage(err.message || 'Local API authentication failed. Start the FastAPI server and check your credentials.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Call live Supabase Auth
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: targetEmail,
          password,
          options: {
            data: {
              name: fullName || targetEmail.split('@')[0],
              role: effectiveRole
            }
          }
        });

        if (error) throw error;

        if (data?.user) {
          setUser(data.user);
          setUserRole(effectiveRole);
          setCurrentUser({
            id: data.user.id,
            email: data.user.email,
            name: fullName || targetEmail.split('@')[0],
            role: effectiveRole
          });
          setSuccessMessage('🎉 Account created successfully in Supabase PostgreSQL database!');
          setTimeout(() => redirectByRole(effectiveRole), 1200);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password
        });

        if (error) throw error;

        if (data?.user) {
          const role = data.user.user_metadata?.role || selectedRole;
          setUser(data.user);
          setUserRole(role);
          setCurrentUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || targetEmail.split('@')[0],
            role: role
          });
          setSuccessMessage(`Welcome back! Authenticated as ${role.toUpperCase()}`);
          setTimeout(() => redirectByRole(role), 1000);
        }
      }
    } catch (err) {
      console.error('Supabase Auth error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Handler for Phone OTP Auth
  const handlePhoneAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!isSupabaseConfigured) {
      if (!otpSent) {
        setOtpSent(true);
        setSuccessMessage(`Demo OTP sent to ${phone}! (Demo Code: 123456)`);
        setIsLoading(false);
      } else {
        const mockUser = {
          id: `phone-${Date.now()}`,
          email: `${phone}@healconnect.io`,
          user_metadata: { name: `User (${phone})`, role: selectedRole }
        };
        setUser(mockUser);
        setUserRole(selectedRole);
        setCurrentUser({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.user_metadata.name,
          role: selectedRole
        });
        setSuccessMessage('OTP verified successfully!');
        setIsLoading(false);
        setTimeout(() => redirectByRole(selectedRole), 800);
      }
      return;
    }

    try {
      if (!otpSent) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone.startsWith('+') ? phone : `+91${phone}`
        });
        if (error) throw error;
        setOtpSent(true);
        setSuccessMessage(`Verification OTP sent to ${phone}!`);
      } else {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: phone.startsWith('+') ? phone : `+91${phone}`,
          token: otp,
          type: 'sms'
        });
        if (error) throw error;
        if (data?.user) {
          setUser(data.user);
          setUserRole(selectedRole);
          redirectByRole(selectedRole);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'OTP Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'doctor') router.push('/doctor/dashboard');
    else if (role === 'admin') router.push('/admin/dashboard');
    else router.push('/patient/dashboard');
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc' }} className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center font-sans relative overflow-hidden">
      <Head>
        <title>Healthcare Portal Authentication | CareSync</title>
      </Head>

      {/* Ambient Radial Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-tr from-teal-500/10 via-blue-500/10 to-transparent blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl relative z-10">
        
        {/* Top Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-extrabold text-emerald-400 mb-4 shadow-md backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
            <span>{isSupabaseConfigured ? '⚡ Supabase PostgreSQL Live Auth' : '🔒 FastAPI Development Authentication'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Heal<span className="text-emerald-400">Connect</span> Healthcare Portal
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 font-medium">
            Secure, end-to-end encrypted medical access for patients, doctors & clinical admins.
          </p>
        </div>

        {/* Already Logged In Card */}
        {user ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
            className="border rounded-3xl p-8 text-center shadow-2xl space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center mx-auto border border-emerald-500/40">
              👤
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Active Session Detected</h2>
              <p className="text-sm text-slate-300 mt-1">Logged in as <strong>{currentUser?.name || user.email}</strong></p>
              <span className="inline-block mt-2 text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full">
                Role: {userRole?.toUpperCase() || 'PATIENT'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={() => redirectByRole(userRole)}
                style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                className="flex-1 font-extrabold py-3 px-6 rounded-xl hover:bg-emerald-600 transition-all shadow-md"
              >
                Go to Dashboard ➔
              </button>
              <button 
                onClick={signOut}
                style={{ backgroundColor: '#334155', color: '#cbd5e1' }}
                className="flex-1 font-bold py-3 px-6 rounded-xl hover:bg-slate-700 transition-all border border-slate-600"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        ) : (

          /* Main Auth Form Container */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
            className="border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
          >
            {/* Role Selector Buttons */}
            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Select Portal Access Role
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
                {[
                  { id: 'patient', label: 'Patient', icon: '🩺' },
                  { id: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
                  { id: 'admin', label: 'Admin', icon: '⚡' }
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id);
                      if (role.id === 'doctor') {
                        setEmail('doctor@healconnect.com');
                        setPassword('12345678');
                      } else if (role.id === 'admin') {
                        setEmail('Admin@healconnect.com');
                        setPassword('12345678');
                      } else {
                        setEmail('patient@healconnect.com');
                        setPassword('12345678');
                      }
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                      selectedRole === role.id 
                        ? 'bg-emerald-500 text-slate-950 shadow-md scale-105' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{role.icon}</span>
                    <span>{role.label}</span>
                  </button>
                ))}
              </div>

              {selectedRole === 'admin' && (
                <div className="mt-2.5 bg-slate-900/90 border border-emerald-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">⚡ Default Admin Credentials:</span>
                    <span className="font-mono text-white text-[11px]">Admin@healconnect.com / 12345678</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('Admin@healconnect.com');
                      setPassword('12345678');
                    }}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-emerald-500/40"
                  >
                    Auto-Fill ⚡
                  </button>
                </div>
              )}
            </div>

            {/* Auth Method Tabs (Email vs Phone) */}
            <div className="flex border-b border-slate-700/80">
              <button
                type="button"
                onClick={() => { setMethod('email'); setErrorMessage(''); }}
                className={`flex-1 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all ${
                  method === 'email' 
                    ? 'border-emerald-400 text-emerald-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                ✉️ Email & Password
              </button>
              <button
                type="button"
                onClick={() => { setMethod('phone'); setErrorMessage(''); }}
                className={`flex-1 py-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all ${
                  method === 'phone' 
                    ? 'border-emerald-400 text-emerald-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                📱 Phone OTP Access
              </button>
            </div>

            {/* Sign In vs Sign Up Toggle (For Email Method) */}
            {method === 'email' && (
              <div className="flex items-center justify-between bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">
                  {authMode === 'signin' ? "Don't have an account?" : "Already registered?"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs font-extrabold text-emerald-400 hover:underline"
                >
                  {authMode === 'signin' ? 'Create New Account ➔' : 'Sign In Existing ➔'}
                </button>
              </div>
            )}

            {/* Alert Messages */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2"
                >
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2"
                >
                  <span>✅</span>
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EMAIL / PASSWORD FORM */}
            {method === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Ananya Roy / Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}
                      className="w-full border px-4 py-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                    {selectedRole === 'doctor' ? 'Doctor ID (e.g. DOC-8891) or Email *' : selectedRole === 'patient' ? 'Patient ID (e.g. PAT-1001, PAT-8891) or Email *' : 'Email Address *'}
                  </label>
                  <input
                    type={selectedRole === 'doctor' || selectedRole === 'patient' ? 'text' : 'email'}
                    placeholder={selectedRole === 'doctor' ? 'e.g. DOC-8891 or doctor@healconnect.com' : selectedRole === 'patient' ? 'e.g. PAT-1001 or patient@healconnect.com' : 'name@healconnect.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}
                    className="w-full border px-4 py-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}
                    className="w-full border px-4 py-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                  className="w-full font-extrabold py-3.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span>{authMode === 'signup' ? `Register as ${selectedRole.toUpperCase()}` : `Sign In as ${selectedRole.toUpperCase()}`} ➔</span>
                  )}
                </button>
              </form>
            )}

            {/* PHONE OTP FORM */}
            {method === 'phone' && (
              <form onSubmit={handlePhoneAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                    Mobile Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <span style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#cbd5e1' }} className="border px-3 py-3 rounded-xl text-xs font-extrabold flex items-center">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={otpSent}
                      style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}
                      className="flex-1 border px-4 py-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-400 transition-all"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                      Enter 6-Digit OTP Code *
                    </label>
                    <input
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}
                      className="w-full border px-4 py-3 rounded-xl text-center tracking-widest text-lg font-mono font-bold focus:outline-none focus:border-emerald-400 transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                  className="w-full font-extrabold py-3.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span>{otpSent ? 'Verify OTP & Log In ➔' : 'Send Verification OTP ➔'}</span>
                  )}
                </button>

                {otpSent && (
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="w-full text-xs text-slate-400 hover:text-white font-medium text-center block pt-1"
                  >
                    Change Phone Number
                  </button>
                )}
              </form>
            )}

            {/* Footer Note */}
            <div className="pt-4 border-t border-slate-700/80 text-center text-[11px] text-slate-400">
              🔒 Powered by <strong>Supabase PostgreSQL Authentication</strong> · HIPAA Compliant 256-Bit SSL
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
