import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ECGMonitor() {
  const [data, setData] = useState({
    status: true,
    pulse: 650,
    beatsPerMinute: 74,
    oxygen: 98,
    temp: 98.6,
    finger: true
  });
  const [ecgData, setECGData] = useState([{ x: Date.now(), y: 0 }]);

  const options = {
    chart: {
      id: 'realtime',
      height: 350,
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 800,
        },
      },
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#10b981'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    xaxis: {
      type: 'datetime',
      labels: { show: true, style: { colors: '#94a3b8' } }
    },
    yaxis: {
      max: 1000,
      min: -1600,
      labels: { style: { colors: '#94a3b8' } }
    },
    grid: { borderColor: '#334155' }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setECGData((prev) => {
        const nextPulse = 60 + Math.floor(Math.random() * 20);
        const updated = [...prev, { x: now, y: (Math.random() - 0.5) * 800 }];
        if (updated.length > 50) updated.shift();
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-extrabold text-white uppercase tracking-wider">IoT Telemetry Status</span>
        </div>
        <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
          SIMULATED ECG WAVEFORM
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>❤️ SIMULATED ECG Electrocardiogram Waveform</span>
          </h3>
          <ApexCharts options={options} series={[{ name: 'ECG Signal', data: ecgData }]} type="line" height={320} />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 text-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Heart Rate</span>
            <span className="text-4xl font-extrabold text-emerald-400 mt-1 block">{data.beatsPerMinute} <span className="text-sm text-slate-400">BPM</span></span>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 text-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Blood Oxygen</span>
            <span className="text-4xl font-extrabold text-teal-400 mt-1 block">{data.oxygen} <span className="text-sm text-slate-400">% SpO2</span></span>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 text-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Body Temperature</span>
            <span className="text-4xl font-extrabold text-blue-400 mt-1 block">{data.temp} <span className="text-sm text-slate-400">°F</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
