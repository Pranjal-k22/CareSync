import { useState, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { UserContext } from '@/lib/context';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function PatientLoginPage() {
  const router = useRouter();
  const { setUser, setUserRole, setCurrentUser } = useContext(UserContext);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const signInWithPhone = async (e) => {
    e.preventDefault();
    setError(null);

    if (/^\d{10}$/.test(phoneNumber.trim())) {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { error: otpErr } = await supabase.auth.signInWithOtp({
            phone: `+91${phoneNumber.trim()}`
          });
          if (otpErr) throw otpErr;
        }

        toast.success('Verification OTP sent successfully!');
        setShowOtpInput(true);
      } catch (err) {
        toast.error(err.message || 'Error sending OTP');
        setError(err.message || 'Error sending OTP');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please enter a valid 10-digit mobile number');
      setError('Please enter a valid 10-digit mobile number');
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(code.trim())) {
      toast.error('Please enter a valid 6-digit OTP');
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error: verifyErr } = await supabase.auth.verifyOtp({
          phone: `+91${phoneNumber.trim()}`,
          token: code.trim(),
          type: 'sms'
        });
        if (verifyErr) throw verifyErr;
        if (data?.user) {
          setUser(data.user);
          setUserRole('patient');
          setCurrentUser({
            id: data.user.id,
            email: data.user.email,
            name: `Patient (+91 ${phoneNumber})`,
            role: 'patient'
          });
        }
      } else {
        // Demo Mode login fallback
        const mockUser = {
          id: `patient-${phoneNumber}`,
          email: `patient_${phoneNumber}@healconnect.io`,
          user_metadata: { name: `Patient (+91 ${phoneNumber})`, role: 'patient' }
        };
        setUser(mockUser);
        setUserRole('patient');
        setCurrentUser({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.user_metadata.name,
          role: 'patient'
        });
      }

      toast.success('Patient login successful!');
      router.push('/patient/dashboard');
    } catch (err) {
      toast.error(err.message || 'OTP verification failed');
      setError(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex w-full pt-4 px-4 pb-6 flex-col justify-between space-y-4">
      <h1 className="text-center font-extrabold text-slate-800 dark:text-white text-2xl sm:text-3xl">
        Patient Portal Sign In
      </h1>
      <p className="text-xs text-slate-500 text-center font-medium">
        Enter your registered 10-digit mobile number to receive a secure OTP token.
      </p>

      {error && (
        <div className="text-xs w-full bg-red-50 border-red-400 border text-center text-red-600 py-2.5 rounded-xl font-semibold">
          {error}
        </div>
      )}

      <div className={`transition-opacity ${showOtpInput ? 'opacity-50' : ''}`}>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Registered Mobile Number *
        </label>
        <div className="flex gap-2">
          <span className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3.5 py-3 rounded-xl text-xs font-extrabold flex items-center">
            🇮🇳 +91
          </span>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="9876543210"
            disabled={showOtpInput}
            className="w-full border border-slate-300 dark:border-slate-600 px-4 py-3 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {showOtpInput && (
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            6-Digit Verification Code *
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            className="w-full border border-slate-300 dark:border-slate-600 px-4 py-3 rounded-xl text-center text-lg font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {showOtpInput ? (
        <button
          type="submit"
          onClick={verify}
          disabled={isLoading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
        >
          {isLoading ? <FaSpinner className="animate-spin text-white" size={20} /> : <span>Verify OTP & Access Portal ➔</span>}
        </button>
      ) : (
        <button
          type="submit"
          onClick={signInWithPhone}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
        >
          {isLoading ? <FaSpinner className="animate-spin text-white" size={20} /> : <span>Request Verification OTP ➔</span>}
        </button>
      )}
    </form>
  );
}
