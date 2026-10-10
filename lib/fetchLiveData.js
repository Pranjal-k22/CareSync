import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export default function FetchLiveData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liveData, setData] = useState([{ Pulse: 72, Temprature: 98.6 }]);

  useEffect(() => {
    // Simulated dynamic telemetry updates
    const interval = setInterval(() => {
      const pulse = 70 + Math.floor(Math.random() * 8);
      const temp = Number((98.2 + Math.random() * 0.8).toFixed(1));
      setData([{ Pulse: pulse, Temprature: temp }]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return { liveData, loading, error };
}
