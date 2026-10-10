import Link from 'next/link';
import React from 'react';
import { FaGithubAlt, FaTwitter, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer 
      style={{ backgroundColor: '#060b19', color: '#cbd5e1' }}
      className="border-t border-slate-800/80 pt-16 pb-10 px-6 md:px-16 mt-20 relative overflow-hidden font-sans"
    >
      {/* Top Ambient Glow Canvas */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-40 bg-gradient-to-b from-blue-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Brand Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 pb-8 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            {/* Official Brand Logo Icon */}
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center p-1.5 shadow-lg">
              <img src="/Logo.svg" alt="CareSync Logo" className="w-full h-full object-contain" />
            </div>
            <h2 style={{ color: '#ffffff' }} className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Care<span style={{ color: '#34d399' }}>Sync</span>
            </h2>
          </div>

          {/* Active System Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
            <span style={{ color: '#ffffff' }}>Active System</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-slate-800/80 pb-12">
          
          {/* Mission Column */}
          <div className="space-y-4">
            <h3 style={{ color: '#ffffff' }} className="text-sm font-bold uppercase tracking-wider">Our Mission</h3>
            <p style={{ color: '#94a3b8' }} className="text-sm leading-relaxed max-w-sm">
              Bridging healthcare and technology to deliver smarter, faster, and secure patient solutions powered by AI, Federated Learning, and IoT telemetry.
            </p>
          </div>

          {/* Explore Links */}
          <div>
            <h3 style={{ color: '#ffffff' }} className="text-sm font-bold uppercase tracking-wider mb-5">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" style={{ color: '#cbd5e1' }} className="hover:text-emerald-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/howitworks" style={{ color: '#cbd5e1' }} className="hover:text-emerald-400 transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/opensource" style={{ color: '#cbd5e1' }} className="hover:text-emerald-400 transition-colors">
                  Open Source
                </Link>
              </li>
              <li>
                <Link href="/Contributors" style={{ color: '#cbd5e1' }} className="hover:text-emerald-400 transition-colors">
                  Contributors
                </Link>
              </li>
              <li>
                <Link href="/appointments" style={{ color: '#cbd5e1' }} className="hover:text-emerald-400 transition-colors">
                  Book Appointments
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 style={{ color: '#ffffff' }} className="text-sm font-bold uppercase tracking-wider mb-5">Support & Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacypolicy" style={{ color: '#cbd5e1' }} className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/termscondition" style={{ color: '#cbd5e1' }} className="hover:text-emerald-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a href="mailto:pranjalkaran2004@gmail.com" style={{ color: '#cbd5e1' }} className="hover:text-emerald-400 transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <span style={{ color: '#94a3b8' }} className="text-xs block pt-1">
                  🔒 HIPAA Compliant & 256-Bit SSL Encrypted
                </span>
              </li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div>
            <h3 style={{ color: '#ffffff' }} className="text-sm font-bold uppercase tracking-wider mb-5">Connect With Us</h3>
            <div className="flex items-center space-x-3 mb-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#cbd5e1' }}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-2.5 rounded-xl hover:text-emerald-400 transition-all shadow-md"
                aria-label="GitHub"
              >
                <FaGithubAlt size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#cbd5e1' }}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-2.5 rounded-xl hover:text-blue-400 transition-all shadow-md"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="mailto:pranjalkaran2004@gmail.com"
                style={{ color: '#cbd5e1' }}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-2.5 rounded-xl hover:text-indigo-400 transition-all shadow-md"
                aria-label="Email"
              >
                <FaEnvelope size={20} />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#cbd5e1' }}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-2.5 rounded-xl hover:text-emerald-400 transition-all shadow-md"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
            <p style={{ color: '#94a3b8' }} className="text-xs leading-relaxed">
              Have feedback, questions, or healthcare collaboration ideas? Reach out — we'd love to hear from you!
            </p>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div style={{ color: '#94a3b8' }} className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 text-xs">
          <div>
            © {new Date().getFullYear()} <strong style={{ color: '#ffffff' }} className="font-semibold">CareSync Inc.</strong> All rights reserved. Built with MNC enterprise standards.
          </div>
          <div className="flex items-center gap-4">
            <span style={{ color: '#cbd5e1' }} className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[11px]">
              🌐 Healthcare AI Platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}