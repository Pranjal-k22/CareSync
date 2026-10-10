import Head from "next/head";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";

export default function Monitoring3D() {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [heartRate, setHeartRate] = useState(72);
  const [spo2, setSpo2] = useState(98);
  const [temp, setTemp] = useState(98.6);
  const [humidity, setHumidity] = useState(48);

  const hardwarePhotos = [
    {
      title: "ESP8266 NodeMCU Microcontroller",
      subtitle: "ESP-12E Wi-Fi Edge Controller with Micro-USB Power Interface & Breadboard Wiring",
      src: "/hw_photo_1.jpg",
      badge: "ESP8266 EDGE GATEWAY"
    },
    {
      title: "MAX30102 Active Red LED Sensor",
      subtitle: "Optical Pulse Oximetry Circuit with Glowing Red Infrared Telemetry LED",
      src: "/hw_photo_2.jpg",
      badge: "ACTIVE RED LED PULSE"
    },
    {
      title: "DS18B20 Metallic Temp Probe",
      subtitle: "Stainless Steel Submersible Waterproof Thermal Body Sensor Probe Array",
      src: "/hw_photo_3.jpg",
      badge: "PRECISION TEMP PROBE"
    },
    {
      title: "DHT22 Environmental Bio-Sensor",
      subtitle: "Ambient Temperature & Relative Humidity Sensor Breadboard Wire Mapping",
      src: "/hw_photo_4.jpg",
      badge: "ENVIRONMENT ARRAY"
    },
    {
      title: "PRO Studio HUD Telemetry Composite",
      subtitle: "High-Tech Studio Composite with HUD Telemetry Overlay Callout Lines",
      src: "/real_hardware_kit.jpg",
      badge: "PRO STUDIO COMPOSITE"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(Math.floor(70 + Math.random() * 5));
      setSpo2(Math.min(100, Math.floor(97 + Math.random() * 3)));
      setTemp((98.4 + Math.random() * 0.4).toFixed(1));
      setHumidity(Math.floor(46 + Math.random() * 4));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#020617', color: '#ffffff' }} className="min-h-screen font-sans relative overflow-x-hidden pb-16">
      <Head>
        <title>Real-World ESP8266 Hardware Studio — CareSync</title>
        <meta name="description" content="Top-Notch Pro Developer Real-World ESP8266 Hardware Prototype Studio." />
        <link rel="icon" type="image/svg+xml" href="/Logo.svg" />
      </Head>

      {/* Ambient Lighting Orbs */}
      <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Main Container */}
      <main className="container mx-auto px-6 py-8 relative z-10">
        
        {/* Top Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></span>
            <span style={{ color: '#34d399' }} className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              ESP8266 Hardware Telemetry Studio (100Hz Synced)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open('/', '_self')}
              style={{ background: 'linear-gradient(to right, #2563eb, #0d9488)', color: '#ffffff' }}
              className="font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg hover:brightness-110"
            >
              ← Return to CareSync Home
            </button>
          </div>
        </div>

        {/* Title Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span style={{ backgroundColor: '#0f172a', color: '#2dd4bf', borderColor: 'rgba(45, 212, 191, 0.4)' }} className="text-xs font-extrabold uppercase tracking-widest border px-5 py-2 rounded-full shadow-xl mb-4 inline-block">
            ⚡ PHYSICAL ESP8266 PROTOTYPE INSPECTOR
          </span>
          <h1 style={{ color: '#ffffff' }} className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3 mb-4">
            Real-World Hardware Telemetry Kit
          </h1>
          <p style={{ color: '#cbd5e1' }} className="text-sm sm:text-base leading-relaxed font-medium">
            Inspect actual physical ESP8266 breadboard photos, MAX30102 pulse sensor red LED telemetry, DS18B20 metallic thermal probe, and GPIO wire mappings.
          </p>
        </div>

        {/* Studio Gallery Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Main Photo Card */}
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#1e293b' }} className="lg:col-span-8 border rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
            
            {/* macOS Window Controls */}
            <div style={{ borderColor: '#1e293b' }} className="flex items-center justify-between pb-4 mb-4 border-b">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block shadow-sm"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block shadow-sm"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
                <span style={{ color: '#94a3b8' }} className="text-xs font-mono ml-2 font-bold">
                  esp8266_realworld_photo_0{selectedPhoto + 1}.jpg
                </span>
              </div>

              <span style={{ backgroundColor: '#020617', color: '#2dd4bf', borderColor: 'rgba(45, 212, 191, 0.4)' }} className="text-xs font-extrabold border px-3 py-1 rounded-full shadow-md">
                {hardwarePhotos[selectedPhoto].badge}
              </span>
            </div>

            {/* Photo Frame Container */}
            <div style={{ backgroundColor: '#020617', borderColor: '#1e293b' }} className="relative rounded-2xl overflow-hidden border shadow-2xl min-h-[380px] flex items-center justify-center group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedPhoto}
                  src={hardwarePhotos[selectedPhoto].src}
                  alt={hardwarePhotos[selectedPhoto].title}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="w-full h-auto max-h-[480px] object-cover rounded-2xl"
                />
              </AnimatePresence>

              {/* HUD Telemetry Overlay Callout Badges */}
              <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.92)', borderColor: 'rgba(52, 211, 153, 0.5)' }} className="absolute top-4 left-4 border px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-md">
                <span style={{ color: '#94a3b8' }} className="text-[10px] uppercase font-bold block">Heart Rate</span>
                <span style={{ color: '#34d399' }} className="text-sm font-extrabold flex items-center gap-1">
                  ❤️ {heartRate} BPM
                </span>
              </div>

              <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.92)', borderColor: 'rgba(56, 189, 248, 0.5)' }} className="absolute top-4 right-4 border px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-md">
                <span style={{ color: '#94a3b8' }} className="text-[10px] uppercase font-bold block">Oxygen SpO2</span>
                <span style={{ color: '#38bdf8' }} className="text-sm font-extrabold flex items-center gap-1">
                  🫁 {spo2}%
                </span>
              </div>

              <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.92)', borderColor: 'rgba(96, 165, 250, 0.5)' }} className="absolute bottom-4 left-4 border px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-md">
                <span style={{ color: '#94a3b8' }} className="text-[10px] uppercase font-bold block">Body Temp</span>
                <span style={{ color: '#60a5fa' }} className="text-sm font-extrabold flex items-center gap-1">
                  🌡️ {temp}°F
                </span>
              </div>

              <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.92)', borderColor: 'rgba(251, 191, 36, 0.5)' }} className="absolute bottom-4 right-4 border px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-md">
                <span style={{ color: '#94a3b8' }} className="text-[10px] uppercase font-bold block">Environment</span>
                <span style={{ color: '#fbbf24' }} className="text-sm font-extrabold flex items-center gap-1">
                  💧 {humidity}% RH
                </span>
              </div>
            </div>

            {/* Photo Metadata */}
            <div className="mt-5 text-left">
              <h3 style={{ color: '#ffffff' }} className="text-xl font-extrabold mb-1">
                {hardwarePhotos[selectedPhoto].title}
              </h3>
              <p style={{ color: '#cbd5e1' }} className="text-xs leading-relaxed font-medium">
                {hardwarePhotos[selectedPhoto].subtitle}
              </p>
            </div>
          </div>

          {/* Right Selector Thumbnails & Pinout Specs */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Gallery Thumbnail Selector */}
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#1e293b' }} className="border rounded-3xl p-5 shadow-2xl backdrop-blur-2xl">
              <h4 style={{ color: '#94a3b8', borderColor: '#1e293b' }} className="text-xs font-extrabold uppercase tracking-widest mb-4 pb-2 border-b flex items-center justify-between">
                <span>Select Hardware View</span>
                <span style={{ color: '#2dd4bf' }} className="font-mono text-[11px] font-bold">{selectedPhoto + 1} / {hardwarePhotos.length}</span>
              </h4>
              
              <div className="grid grid-cols-2 gap-2.5">
                {hardwarePhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhoto(idx)}
                    style={{
                      backgroundColor: selectedPhoto === idx ? '#020617' : 'rgba(2, 6, 23, 0.6)',
                      borderColor: selectedPhoto === idx ? '#2dd4bf' : '#1e293b'
                    }}
                    className={`p-2 rounded-2xl border transition-all text-left overflow-hidden ${
                      selectedPhoto === idx
                        ? 'ring-2 ring-teal-400/40 shadow-xl opacity-100'
                        : 'hover:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.src} alt={photo.title} className="w-full h-16 object-cover rounded-xl mb-1.5" />
                    <span style={{ color: '#ffffff' }} className="text-[11px] font-extrabold block truncate">{photo.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware Pinout Specs Card */}
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#1e293b' }} className="border rounded-3xl p-5 shadow-2xl backdrop-blur-2xl text-xs space-y-3">
              <h4 style={{ color: '#34d399', borderColor: '#1e293b' }} className="text-xs font-extrabold uppercase tracking-widest pb-2 border-b flex items-center gap-2">
                <span>⚙️ ESP8266 Pinout Configuration</span>
              </h4>

              <div className="space-y-2">
                <div style={{ backgroundColor: '#020617', borderColor: '#1e293b' }} className="flex justify-between p-2.5 rounded-xl border">
                  <span style={{ color: '#ffffff' }} className="font-extrabold">MAX30102 I2C</span>
                  <span style={{ color: '#2dd4bf' }} className="font-mono font-bold">Pin D1 (SCL) / D2 (SDA)</span>
                </div>
                <div style={{ backgroundColor: '#020617', borderColor: '#1e293b' }} className="flex justify-between p-2.5 rounded-xl border">
                  <span style={{ color: '#ffffff' }} className="font-extrabold">DS18B20 Temp Probe</span>
                  <span style={{ color: '#60a5fa' }} className="font-mono font-bold">Pin D4 (GPIO2)</span>
                </div>
                <div style={{ backgroundColor: '#020617', borderColor: '#1e293b' }} className="flex justify-between p-2.5 rounded-xl border">
                  <span style={{ color: '#ffffff' }} className="font-extrabold">DHT22 Data Pin</span>
                  <span style={{ color: '#fbbf24' }} className="font-mono font-bold">Pin D3 (GPIO0)</span>
                </div>
                <div style={{ backgroundColor: '#020617', borderColor: '#1e293b' }} className="flex justify-between p-2.5 rounded-xl border">
                  <span style={{ color: '#ffffff' }} className="font-extrabold">Power Supply</span>
                  <span style={{ color: '#34d399' }} className="font-mono font-bold">3.3V Regulated / GND</span>
                </div>
              </div>
            </div>

          </div>
        </div>



        {/* Bottom CTA Action Buttons */}
        <div className="text-center flex flex-wrap justify-center gap-4">
          <button
            onClick={() => window.open('/', '_self')}
            style={{ background: 'linear-gradient(to right, #2563eb, #0d9488)', color: '#ffffff' }}
            className="font-extrabold py-3.5 px-8 rounded-2xl shadow-xl transition-all hover:brightness-110 border border-white/10"
          >
            ← Return to CareSync Home
          </button>
          

        </div>

      </main>
      <Footer />
    </div>
  );
}
