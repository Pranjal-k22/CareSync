import Head from "next/head";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import Footer from "../components/Footer";
import ChatBot from "./ChatBot";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "@/lib/context";

export default function Home() {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const [showVideo, setShowVideo] = useState(false);
  const [showArchModal, setShowArchModal] = useState(false);
  const [activeTab, setActiveTab] = useState('iot'); // 'iot' | 'ai' | 'xai' | 'federated'
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);

  // Live Sensor Telemetry simulation state
  const [heartRate, setHeartRate] = useState(72);
  const [spo2, setSpo2] = useState(98);
  const [bp, setBp] = useState({ sys: 120, dia: 80 });
  const [ecgPoints, setEcgPoints] = useState([50, 50, 45, 55, 50, 50, 15, 85, 35, 50, 50, 50]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => Math.floor(70 + Math.random() * 6));
      setSpo2(prev => Math.min(100, Math.floor(97 + Math.random() * 3)));
      setBp({
        sys: Math.floor(118 + Math.random() * 6),
        dia: Math.floor(78 + Math.random() * 4)
      });
      // Slightly shift ECG waveform for live pulse feel
      setEcgPoints(prev => [...prev.slice(1), Math.floor(40 + Math.random() * 20)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="overflow-x-hidden font-sans selection:bg-teal-500 selection:text-white">
      <Head>
        <title>HealConnect — Privacy-Preserving AI Healthcare System</title>
        <meta
          name="description"
          content="Privacy-Preserving AI-Based Healthcare Risk Assessment System Using Explainable AI (SHAP), Federated Learning, and IoT Telemetry."
        />
        <link rel="icon" type="image/svg+xml" href="/Logo.svg" />
        <link rel="icon" type="image/png" href="/Logo.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>

      <main
        className="bg-slate-950 transition-colors duration-300 relative text-white"
        style={{
          backgroundImage: "url('/home.png')",
          backgroundSize: "cover",
          WebkitBackgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "100vw",
          backgroundAttachment: "fixed"
        }}
      >
        {/* Apple macOS Multi-Layer Frosted Glass Backdrop Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/85 to-slate-950/90 backdrop-blur-[6px] z-0 pointer-events-none"></div>

        <div className="relative z-10">
          <ChatBot />

          {/* Hero Section with Vibrant Ambient Orbs & Animations */}
          <section className="relative pt-28 pb-20 overflow-hidden">
            {/* Background Ambient Glow Orbs */}
            <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-teal-500/20 rounded-full filter blur-[140px] pointer-events-none animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-[550px] h-[550px] bg-blue-600/20 rounded-full filter blur-[150px] pointer-events-none animate-pulse animation-delay-2000"></div>

            <div className="container mx-auto px-6 relative z-10">
              <div className={`flex flex-col ${isHeroCollapsed ? 'items-center justify-center' : 'lg:flex-row items-center justify-between'} gap-12 transition-all duration-500`}>
                
                {/* Left Hero Text Column */}
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`${isHeroCollapsed ? 'w-full max-w-3xl mx-auto text-center flex flex-col items-center justify-center' : 'lg:w-1/2 text-center lg:text-left'}`}
                >


                  {/* System Security Pill */}
                  <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-emerald-400 mb-6 shadow-2xl backdrop-blur-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Privacy-Preserving AI · Explainable AI (SHAP) & Federated Learning</span>
                  </div>

                  {/* Brand Title with Logo */}
                  <div className={`flex items-center gap-3.5 mb-6 ${isHeroCollapsed ? 'justify-center' : 'justify-center lg:justify-start'}`}>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 border border-slate-700/80 p-2 shadow-2xl flex items-center justify-center flex-shrink-0">
                      <img src="/Logo.svg" alt="HealConnect Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                      Heal<span className="text-emerald-400">Connect</span>{" "}
                      <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                        AI Health System
                      </span>
                    </h1>
                  </div>

                  <p className="text-base sm:text-xl text-slate-200 mb-8 leading-relaxed font-normal max-w-2xl">
                    Next-generation <span className="text-amber-400 font-bold">privacy-preserving healthcare</span> platform. Monitors patient vitals via IoT telemetry, predicts disease risk with <span className="text-teal-300 font-bold">Explainable AI (SHAP)</span>, and aggregates models with <span className="text-indigo-300 font-bold">Federated Learning</span>.
                  </p>

                  {/* Action Buttons */}
                  <div className={`flex flex-wrap items-center gap-4 mb-10 ${isHeroCollapsed ? 'justify-center' : 'justify-center lg:justify-start'}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/login')}
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold py-3.5 px-8 rounded-2xl shadow-xl shadow-blue-500/25 transition-all border border-white/10"
                    >
                      Get Started ➔
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.open('/videos/videoplayback.mp4', '_blank')}
                      className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold py-3.5 px-7 rounded-2xl transition-all backdrop-blur-xl flex items-center gap-2 shadow-lg"
                    >
                      <span>📹 Watch Video Demo</span>
                    </motion.button>

                    <button
                      onClick={() => {
                        scrollToSection('architecture');
                        setShowArchModal(true);
                      }}
                      className="bg-slate-900/80 hover:bg-slate-800 text-teal-300 font-semibold py-3.5 px-6 rounded-2xl border border-teal-500/40 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <span>📐 View System Architecture</span> ➔
                    </button>
                  </div>

                  {/* Live Telemetry Ticker Bar */}
                  <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-4 rounded-2xl shadow-2xl">
                    <div className="text-center p-2">
                      <div className="text-xl font-bold text-emerald-400">12,400+</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">IoT Streams</div>
                    </div>
                    <div className="text-center p-2 border-l border-slate-800">
                      <div className="text-xl font-bold text-blue-400">99.4%</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">AI Accuracy</div>
                    </div>
                    <div className="text-center p-2 border-l border-slate-800">
                      <div className="text-xl font-bold text-teal-400">&lt; 15ms</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Telemetry Latency</div>
                    </div>
                    <div className="text-center p-2 border-l border-slate-800">
                      <div className="text-xl font-bold text-indigo-400">100%</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Privacy (ε=0.5)</div>
                    </div>
                  </div>
                </motion.div>

            {/* Right Apple macOS Window Frame Card holding 3D Graphic */}
            <AnimatePresence>
              {!isHeroCollapsed && (
                <motion.div 
                  key="heroCard"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, width: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="lg:w-1/2 flex justify-center"
                >
                  <div className="w-full max-w-lg bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl relative hover:border-slate-600 transition-colors">
                    {/* Apple macOS Window Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 gap-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span 
                          className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block shadow-md cursor-pointer hover:scale-125 transition-transform"
                          onClick={() => setIsHeroCollapsed(!isHeroCollapsed)}
                          title={isHeroCollapsed ? "Click to restore left column" : "Click to minimize left column & center 3D card"}
                        ></span>
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block shadow-md cursor-pointer hover:scale-125 transition-transform"></span>
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block shadow-md cursor-pointer hover:scale-125 transition-transform"></span>
                      </div>

                      {/* Center Brand */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-700 p-0.5 flex items-center justify-center shadow-md">
                          <img src="/Logo.svg" alt="HealConnect Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-sm font-extrabold text-white tracking-tight">
                          Heal<span className="text-emerald-400">Connect</span>
                        </span>
                      </div>

                      {/* Live Stream Status */}
                      <div className="inline-flex items-center gap-1.5 bg-slate-950 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-400 flex-shrink-0 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
                        <span>Live Telemetry</span>
                      </div>
                    </div>

                    {/* 3D Dashboard Canvas Circle with HUD Vital Callout Badges */}
                    <div className="relative flex items-center justify-center p-6 sm:p-10 bg-slate-950/90 rounded-2xl border border-slate-800/90 overflow-hidden min-h-[340px]">
                      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-teal-500/15 to-cyan-500/10 blur-xl"></div>

                      {/* Central Glowing 3D Doctor Circle */}
                      <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full border-4 border-teal-500/30 flex items-center justify-center overflow-hidden bg-slate-900/90 shadow-2xl relative z-10">
                        <img
                          src="dashboard.svg"
                          alt="Health Monitoring Dashboard 3D"
                          className="animate-zoom w-4/5 h-4/5 object-contain"
                        />
                      </div>

                      {/* Floating HUD Vital Badges */}
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="absolute top-4 left-4 bg-slate-900/95 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-xl z-20 backdrop-blur-md"
                      >
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Heart Rate</div>
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          ❤️ 72 BPM
                        </div>
                      </motion.div>

                      <motion.div 
                        animate={{ y: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                        className="absolute top-4 right-4 bg-slate-900/95 border border-cyan-500/40 px-3 py-1.5 rounded-xl shadow-xl z-20 backdrop-blur-md"
                      >
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">SpO2 Oxygen</div>
                        <div className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                          🫁 98%
                        </div>
                      </motion.div>

                      <motion.div 
                        animate={{ y: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
                        className="absolute bottom-4 left-4 bg-slate-900/95 border border-blue-500/40 px-3 py-1.5 rounded-xl shadow-xl z-20 backdrop-blur-md"
                      >
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Body Temp</div>
                        <div className="text-xs font-bold text-blue-300 flex items-center gap-1">
                          🌡️ 98.6°F
                        </div>
                      </motion.div>

                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
                        className="absolute bottom-4 right-4 bg-slate-900/95 border border-teal-500/40 px-3 py-1.5 rounded-xl shadow-xl z-20 backdrop-blur-md"
                      >
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Lead II ECG</div>
                        <div className="text-xs font-bold text-teal-300 flex items-center gap-1">
                          ⚡ Normal Sinus
                        </div>
                      </motion.div>
                    </div>

                    {/* Bottom Quick Control Action */}
                    <div className="mt-4 text-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (user) {
                            router.push('/monitoring');
                          } else {
                            router.push('/login');
                          }
                        }}
                        className="w-full bg-slate-950 hover:bg-slate-800 text-teal-300 border border-teal-500/40 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <span>Launch Interactive Telemetry Dashboard</span> ➔
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

              </div>
            </div>
          </section>

          {/* Problem & Challenge Section */}
          <section id="problem" className="py-20 bg-slate-950/85 backdrop-blur-2xl border-t border-slate-800/80 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto text-center"
              >
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300 bg-slate-950/95 border border-emerald-400/60 px-5 py-2 rounded-full shadow-2xl mb-6 inline-block backdrop-blur-2xl">
                  Clinical Challenge
                </span>
                
                <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-left">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shadow-lg flex-shrink-0">
                      ⚡
                    </div>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight">The Healthcare Remote Monitoring Problem</h3>
                  </div>

                  <p className="text-base sm:text-lg text-slate-200 mb-6 leading-relaxed">
                    Obtaining real-time health <span className="text-amber-400 font-bold">parameters & bio-sensor telemetry</span> at zero latency is critical for emergency cardiac and respiratory care.
                  </p>
                  <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                    Traditional centralized platforms compromise <span className="text-cyan-300 font-extrabold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">patient HIPAA privacy</span> when sharing medical records for AI model training.
                  </p>

                  <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        scrollToSection('architecture');
                        setShowArchModal(true);
                      }}
                      className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-extrabold px-6 py-3 rounded-2xl shadow-xl transition-all flex items-center gap-2 border border-white/20"
                    >
                      <span>Discover the HealConnect Solution</span> ➔
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Solution & System Architecture Section */}
          <section id="architecture" className="py-20 bg-slate-900/90 backdrop-blur-2xl border-t border-slate-800 relative overflow-hidden">
            <div className="absolute top-1/3 right-1/4 w-[650px] h-[650px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 rounded-full blur-[160px] pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-300 bg-slate-950/95 border border-blue-400/60 px-5 py-2 rounded-full shadow-2xl mb-4 inline-block backdrop-blur-2xl">
                  ⚡ Platform Architecture
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
                  4 Core System Pillars
                </h2>
                <p className="text-slate-300 text-sm sm:text-base">
                  Explore how HealConnect unifies bio-sensors, explainable AI risk scoring, and privacy-focused federated learning.
                </p>

                <div className="mt-4">
                  <button
                    onClick={() => setShowArchModal(true)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 bg-slate-950 border border-teal-500/40 px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
                  >
                    <span>🔍 Open Interactive End-to-End System Flow Diagram</span> ➔
                  </button>
                </div>

                {/* macOS Tab Pills */}
                <div className="flex flex-wrap justify-center gap-2 mt-8 bg-slate-950/90 p-2 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-xl">
                  <button
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === 'iot' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => setActiveTab('iot')}
                  >
                    📡 1. Real-Time IoT
                  </button>
                  <button
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === 'ai' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => setActiveTab('ai')}
                  >
                    🧠 2. AI Risk Score
                  </button>
                  <button
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === 'xai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => setActiveTab('xai')}
                  >
                    🔬 3. Explainable AI (SHAP)
                  </button>
                  <button
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === 'federated' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => setActiveTab('federated')}
                  >
                    🌐 4. Federated Network
                  </button>
                </div>
              </div>

              {/* macOS Container Panel */}
              <div className="max-w-5xl mx-auto bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
                <AnimatePresence mode="wait">
                  {activeTab === 'iot' && (
                    <motion.div key="iot" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                        <div>
                          <h4 className="text-lg font-bold text-white">Live Patient Bio-Sensor Stream</h4>
                          <p className="text-xs text-slate-400">WebSocket 100Hz Encrypted Telemetry</p>
                        </div>
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                          ● Live Sensors Online
                        </span>
                      </div>



                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <motion.div whileHover={{ y: -3 }} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
                          <div className="text-xs text-slate-400 mb-1">Heart Rate</div>
                          <div className="text-3xl font-extrabold text-emerald-400">{heartRate} <span className="text-xs text-slate-400 font-normal">BPM</span></div>
                          <div className="text-[11px] text-emerald-400 mt-2 font-semibold">✓ Normal Sinus Rhythm</div>
                        </motion.div>

                        <motion.div whileHover={{ y: -3 }} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
                          <div className="text-xs text-slate-400 mb-1">Blood Oxygen (SpO2)</div>
                          <div className="text-3xl font-extrabold text-blue-400">{spo2}%</div>
                          <div className="text-[11px] text-blue-400 mt-2 font-semibold">✓ Optimal Saturation</div>
                        </motion.div>

                        <motion.div whileHover={{ y: -3 }} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
                          <div className="text-xs text-slate-400 mb-1">Blood Pressure</div>
                          <div className="text-3xl font-extrabold text-purple-400">{bp.sys}/{bp.dia} <span className="text-xs text-slate-400 font-normal">mmHg</span></div>
                          <div className="text-[11px] text-purple-400 mt-2 font-semibold">✓ Normotensive</div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'ai' && (
                    <motion.div key="ai" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                        <div>
                          <h4 className="text-lg font-bold text-white">Automated AI Risk Prediction</h4>
                          <p className="text-xs text-slate-400">Deep Clinical Ensemble Model</p>
                        </div>
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                          Low Risk (Score: 18/100)
                        </span>
                      </div>

                      <p className="text-sm text-slate-200 mb-4 leading-relaxed">
                        Evaluates 72-hour acute disease onset probability based on multi-center clinical vitals telemetry.
                      </p>
                      
                      <div className="space-y-4 mb-6">
                        <div>
                          <div className="flex justify-between text-xs text-slate-300 mb-1">
                            <span>Cardiac Arrhythmia Onset</span>
                            <span className="text-emerald-400 font-bold">8.2% Probability</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[8.2%]"></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-300 mb-1">
                            <span>Hypertensive Crisis</span>
                            <span className="text-emerald-400 font-bold">14.5% Probability</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 w-[14.5%]"></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-300 mb-1">
                            <span>Acute Hypoxia</span>
                            <span className="text-emerald-400 font-bold">4.1% Probability</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-400 w-[4.1%]"></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'xai' && (
                    <motion.div key="xai" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                        <div>
                          <h4 className="text-lg font-bold text-white">Explainable AI (SHAP) Feature Contribution</h4>
                          <p className="text-xs text-slate-400">Transparent Clinical Interpretability</p>
                        </div>
                        <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-semibold">
                          KernelSHAP Evaluated
                        </span>
                      </div>

                      <p className="text-sm text-slate-300 mb-4">Top biometric parameters influencing clinical AI decision tree:</p>

                      <div className="space-y-3 text-xs mb-4">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <div className="flex justify-between text-slate-200 mb-1">
                            <span>1. ST-Segment Waveform Morphology</span>
                            <span className="text-emerald-400 font-bold">+0.32 SHAP (Low Risk Factor)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 w-[68%]"></div>
                          </div>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <div className="flex justify-between text-slate-200 mb-1">
                            <span>2. Serum Troponin I Level</span>
                            <span className="text-blue-400 font-bold">+0.18 SHAP (Normal Range)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 w-[45%]"></div>
                          </div>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <div className="flex justify-between text-slate-200 mb-1">
                            <span>3. Systolic Blood Pressure Trend</span>
                            <span className="text-indigo-400 font-bold">+0.12 SHAP (Optimal Range)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 w-[30%]"></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'federated' && (
                    <motion.div key="federated" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                        <div>
                          <h4 className="text-lg font-bold text-white">Participating Clinical Nodes</h4>
                          <p className="text-xs text-slate-400">FedAvg Aggregation Round #42 Active</p>
                        </div>
                        <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full font-semibold">
                          Differential Privacy (ε=0.5) Active
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                        <motion.div whileHover={{ scale: 1.03 }} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
                          <span className="text-white font-bold block mb-1">Stanford Care</span>
                          <span className="text-emerald-400 font-semibold text-[11px]">✓ Model Synced</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
                          <span className="text-white font-bold block mb-1">Johns Hopkins</span>
                          <span className="text-emerald-400 font-semibold text-[11px]">✓ Model Synced</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
                          <span className="text-white font-bold block mb-1">Mayo Clinic</span>
                          <span className="text-emerald-400 font-semibold text-[11px]">✓ Model Synced</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
                          <span className="text-white font-bold block mb-1">UCSF Health</span>
                          <span className="text-emerald-400 font-semibold text-[11px]">✓ Model Synced</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Interactive System Architecture Diagram Modal */}
          <AnimatePresence>
            {showArchModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto"
                onClick={() => setShowArchModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700"
                    onClick={() => setShowArchModal(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>

                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📐</span>
                    <h3 className="text-2xl font-extrabold text-white">HealConnect End-to-End System Architecture</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-8">
                    Multi-tier IoT Hardware Ingestion, Edge Gateway Processing, FastAPI Microservices, PyTorch AI (SHAP & FedML), and Next.js Dashboard.
                  </p>

                  {/* Flow Diagram Nodes */}
                  <div className="space-y-4 text-xs font-sans">
                    
                    {/* Node 1: IoT Health Devices */}
                    <div className="bg-slate-950 border border-teal-500/40 p-5 rounded-2xl shadow-lg">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                        <span className="font-extrabold text-teal-400 text-sm">1. IoT Health Devices Suite</span>
                        <span className="bg-teal-500/10 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-mono">Sensors Layer</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-medium text-slate-200">
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">❤️ Heart Rate Sensor</div>
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">⚡ Lead II ECG Sensor</div>
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">🫁 SpO2 Pulse Sensor</div>
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">🌡️ Temperature Sensor</div>
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">🩺 BP Sensor</div>
                      </div>
                    </div>

                    {/* Protocol 1 Connector */}
                    <div className="text-center font-mono text-teal-400 text-[11px] flex items-center justify-center gap-2">
                      <span className="w-8 h-[1px] bg-teal-500/40"></span>
                      <span>⬇ Bluetooth Low Energy (BLE 5.2) / Wi-Fi 802.11ax</span>
                      <span className="w-8 h-[1px] bg-teal-500/40"></span>
                    </div>

                    {/* Node 2: Edge Gateway */}
                    <div className="bg-slate-950 border border-blue-500/40 p-5 rounded-2xl shadow-lg">
                      <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-2">
                        <span className="font-extrabold text-blue-400 text-sm">2. Edge Gateway (Hardware Processing)</span>
                        <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-mono">Microcontroller Layer</span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-200">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 w-full text-center">
                          <span className="font-bold text-white block">ESP8266 Microcontroller</span>
                          <span className="text-[11px] text-slate-400">Local signal filtering, FFT noise reduction & packet serialization</span>
                        </div>
                      </div>
                    </div>

                    {/* Protocol 2 Connector */}
                    <div className="text-center font-mono text-blue-400 text-[11px] flex items-center justify-center gap-2">
                      <span className="w-8 h-[1px] bg-blue-500/40"></span>
                      <span>⬇ REST API (TLS 1.3 Encrypted) / MQTT Protocol</span>
                      <span className="w-8 h-[1px] bg-blue-500/40"></span>
                    </div>

                    {/* Node 3: Backend Server */}
                    <div className="bg-slate-950 border border-indigo-500/40 p-5 rounded-2xl shadow-lg">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                        <span className="font-extrabold text-indigo-400 text-sm">3. Backend Core Microservices</span>
                        <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-mono">FastAPI / Django Framework</span>
                      </div>

                      {/* Split Database & AI Engine */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Storage */}
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                          <span className="font-bold text-white block mb-2">💾 Database Storage Tier</span>
                          <div className="space-y-1 text-slate-300">
                            <div>• <strong>PostgreSQL</strong> (Clinical Metadata & Auth)</div>
                            <div>• <strong>MongoDB</strong> (High-Frequency Sensor Logs)</div>
                          </div>
                        </div>

                        {/* AI Engine */}
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                          <span className="font-bold text-purple-400 block mb-2">🧠 PyTorch AI Risk Pipeline</span>
                          <div className="space-y-1 text-slate-300">
                            <div>• <strong>Explainable AI (SHAP / LIME)</strong>: Clinical feature attribution</div>
                            <div>• <strong>Federated Learning (Flower / FedML)</strong>: Hospital node sync (`ε = 0.5`)</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Protocol 3 Connector */}
                    <div className="text-center font-mono text-purple-400 text-[11px] flex items-center justify-center gap-2">
                      <span className="w-8 h-[1px] bg-purple-500/40"></span>
                      <span>⬇ Authenticated JWT REST APIs & WebSockets</span>
                      <span className="w-8 h-[1px] bg-purple-500/40"></span>
                    </div>

                    {/* Node 4: React Dashboard */}
                    <div className="bg-slate-950 border border-emerald-500/40 p-5 rounded-2xl shadow-lg">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                        <span className="font-extrabold text-emerald-400 text-sm">4. React & Next.js Frontend Portals</span>
                        <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-mono">User Experience Layer</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800"><span className="text-white font-bold block">👨‍⚕️ Doctor Portal</span><span className="text-emerald-400 text-[11px]">Real-time Vitals & SHAP Insights</span></div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800"><span className="text-white font-bold block">🛡️ Admin Dashboard</span><span className="text-blue-400 text-[11px]">Node Management & Analytics</span></div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800"><span className="text-white font-bold block">👤 Patient Portal</span><span className="text-teal-400 text-[11px]">Personal Telemetry & Bookings</span></div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hardware Kit Section */}
          <section id="kit" className="py-20 bg-slate-950/85 backdrop-blur-2xl border-t border-slate-800 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/10 via-pink-500/10 to-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-2xl"
              >
                <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300 bg-slate-950/95 border border-cyan-400/60 px-5 py-2 rounded-full shadow-2xl mb-6 inline-block backdrop-blur-2xl">
                  ⚡ Integrated Bio-Telemetry Hardware Kit
                </span>
                <h3 className="text-3xl font-extrabold text-white mb-4">
                  Multi-Sensor Health Monitoring Kit
                </h3>
                <p className="text-slate-200 max-w-2xl mx-auto text-sm sm:text-base mb-8 leading-relaxed">
                  Equipped to measure body temperature, electrocardiography (ECG), heart rate, and SpO2 in a single compact device.
                </p>

                <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-800 mb-8 shadow-2xl overflow-hidden relative group">
                  <img
                    src="/real_hardware_kit.jpg"
                    alt="Real-World ESP8266 Microcontroller Health Monitoring Setup"
                    className="mx-auto w-full max-w-2xl h-auto max-h-[420px] object-cover rounded-2xl border border-slate-800 shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.01]"
                  />

                  {/* Real Hardware Components Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 text-xs text-left">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 shadow-md">
                      <span className="text-teal-400 font-bold block mb-0.5">⚡ ESP8266 NodeMCU</span>
                      <span className="text-[11px] text-slate-400">Wi-Fi Edge Controller</span>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 shadow-md">
                      <span className="text-red-400 font-bold block mb-0.5">❤️ MAX30102 Sensor</span>
                      <span className="text-[11px] text-slate-400">Active Red LED Pulse</span>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 shadow-md">
                      <span className="text-blue-400 font-bold block mb-0.5">🌡️ DS18B20 Probe</span>
                      <span className="text-[11px] text-slate-400">Waterproof Thermal Probe</span>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 shadow-md">
                      <span className="text-amber-400 font-bold block mb-0.5">🫁 DHT22 Sensor</span>
                      <span className="text-[11px] text-slate-400">Ambient Temp & Humidity</span>
                    </div>
                  </div>
                </div>

                <div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.open('/monitoring-3d', '_blank', 'noopener,noreferrer')}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-bold py-3.5 px-8 rounded-2xl shadow-xl transition-all"
                  >
                    View Interactive 3D Hardware Model ➔
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* CTA & Video Demo Section */}
          <section className="py-20 bg-slate-900/90 backdrop-blur-2xl border-t border-slate-800 text-white relative overflow-hidden">
            {/* Ambient Palette Glows */}
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="container mx-auto px-6 text-center relative z-10">
              <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight">
                Ready to Experience{" "}
                <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Next-Gen Healthcare AI?
                </span>
              </h2>
              <p className="text-base sm:text-lg mb-10 max-w-2xl mx-auto text-slate-300 leading-relaxed font-normal">
                Join healthcare providers leveraging HealConnect for real-time IoT patient monitoring and privacy-preserving AI risk evaluation.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-xl shadow-teal-500/20"
                  onClick={() => window.open('/videos/videoplayback.mp4', '_blank')}
                >
                  Watch Demo Video 📹
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    window.location.href =
                    "mailto:connectheal84@gmail.com?subject=Sales Inquiry&body=Hello HealConnect team, I would like to learn more about your services."
                  }
                  className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold py-3.5 px-8 rounded-full transition-all backdrop-blur-md shadow-lg"
                >
                  Contact Sales & Demo
                </motion.button>
              </div>

              {/* Video Modal */}
              <AnimatePresence>
                {showVideo && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => setShowVideo(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-w-3xl w-full"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        className="absolute top-3 right-3 text-slate-400 hover:text-white text-2xl font-bold w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
                        onClick={() => setShowVideo(false)}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      <h3 className="text-lg font-bold text-white mb-4 text-left">HealConnect Demonstration Video</h3>
                      <video width="100%" height="auto" controls autoPlay className="rounded-xl overflow-hidden shadow-inner">
                        <source src="videos/videoplayback.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Reusable Enterprise Footer */}
          <Footer />
        </div>
      </main>

      <style jsx global>{`
        @keyframes zoomInOut {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-zoom {
          animation: zoomInOut 4s ease-in-out infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
