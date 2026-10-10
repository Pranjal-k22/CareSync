import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaGithub, FaCodeBranch, FaShieldAlt, FaLayerGroup, FaBookOpen } from 'react-icons/fa';
import Footer from '../components/Footer';

export default function OpenSourcePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Head>
        <title>Open Source & Ecosystem | CareSync Quantum</title>
        <meta name="description" content="CareSync Open Source Initiative - Building secure, intelligent, and interoperable healthcare tools in the open." />
      </Head>

      {/* Hero Header */}
      <div className="relative pt-24 pb-16 px-6 md:px-16 overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-64 bg-gradient-to-b from-teal-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
            <FaCodeBranch className="text-sm" />
            <span>Community Driven Healthcare Innovation</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            Building Connected Care <span className="text-emerald-400">In The Open</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            CareSync is committed to open source healthcare technology. We build transparent, secure, and privacy-first tools for patients, clinical doctors, and IoT hardware developers worldwide.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <FaGithub className="text-lg" />
              <span>Explore GitHub Repositories</span>
            </a>
            <Link
              href="/Contributors"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl border border-slate-700 transition-all"
            >
              <span>View Top Contributors</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl mb-4">
              <FaShieldAlt />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">HIPAA & Data Privacy</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Zero-knowledge architecture and transparent data governance protocols ensuring complete patient confidentiality.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 relative overflow-hidden group hover:border-teal-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 text-xl mb-4">
              <FaLayerGroup />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">IoT Edge Firmware</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Open C++/Arduino source code for ESP8266 & MAX30102 pulse oximetry sensors with real-time WebSocket telemetry.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl mb-4">
              <FaBookOpen />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI OCR Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Multimodal prescription scanning and parsing algorithms utilizing Google Gemini Vision AI model integrations.
            </p>
          </div>

        </div>
      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}
