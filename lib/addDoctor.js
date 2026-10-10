import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner } from 'react-icons/fa';
import Note from "@components/Note";

export default function AddDoctor() {
  const [name, setName] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErrer] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  function clearValues() {
    setName('');
    setSpeciality('');
    setAddress('');
    setNumber('');
    setEmail('');
    setPassword('');
    setErrer(null);
  }

  async function addHandler() {
    if (!email || !password || !name || !speciality) {
      setErrer('All input fields are required!');
      toast.error('All input fields are required!');
      return;
    }

    setIsAdding(true);
    setErrer(null);

    try {
      const token = window.localStorage.getItem('healconnect_api_token');
      if (!token) throw new Error('Admin session expired. Please sign in again.');
      const apiBase = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiBase}/admin/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, temporary_password: password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || result.message || 'Failed to onboard doctor');

      toast.success(`Doctor ${name} onboarded successfully. Share the temporary password securely.`);
      clearValues();
    } catch (error) {
      console.error('AddDoctor Error:', error);
      setErrer(error.message || 'Failed to onboard doctor.');
      toast.error(error.message || 'Failed to onboard doctor.');
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-4 gap-4 w-full overflow-hidden rounded-lg shadow-xs bg-white dark:bg-gray-800">
      <Note note='Admin: Register new Doctors into Supabase PostgreSQL. Details can be updated by the Doctor.' />

      <div className="flex flex-col items-center justify-between p-3 font-medium group space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Doctor Name"
          className="input-field w-full"
        />
        <input
          value={speciality}
          onChange={(e) => setSpeciality(e.target.value)}
          type="text"
          placeholder="Doctor Speciality"
          className="input-field w-full"
        />
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Hospital / Address"
          className="input-field w-full"
        ></textarea>
      </div>

      <div className="flex flex-col items-center justify-between p-3 font-medium group space-y-3">
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          type="tel"
          placeholder="Phone Number"
          className="input-field w-full"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Doctor Email"
          className="input-field w-full"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Temporary Password (12+ characters)"
          className="input-field w-full"
        />
      </div>

      <div className="flex flex-col items-center justify-center p-3 font-medium group">
        {err && (
          <div className="text-xs w-full border-red-500 border text-center border-solid text-red-500 py-2 rounded-lg mb-2">
            {err}
          </div>
        )}
        <button
          onClick={addHandler}
          disabled={isAdding}
          className="px-6 w-full h-11 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
        >
          {isAdding ? (
            <FaSpinner className="animate-spin text-white" size={20} />
          ) : (
            <span>Onboard Doctor ➔</span>
          )}
        </button>
      </div>
    </div>
  );
}
