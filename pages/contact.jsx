import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from "framer-motion";
import Footer from '../components/Footer';

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTopic, setActiveTopic] = useState("General Enquiry");
  const [openFaq, setOpenFaq] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    // Initialize EmailJS with public key
    emailjs.init("YhQMOhBn8kK0DBDHy");
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const fullMessage = `[Topic: ${activeTopic}]\n\n${form.message}`;

    // Send email using EmailJS - Send to both user and admin
    const sendToUser = emailjs.send(
      'service_gz36vne',
      'template_pofnexn',
      {
        from_name: form.name,
        from_email: form.email,
        to_name: 'CareSync',
        to_email: form.email,
        message: fullMessage,
        user_email: form.email,
      }
    );

    const sendToAdmin = emailjs.send(
      'service_gz36vne',
      'template_admin_notificat',
      {
        from_name: form.name,
        from_email: form.email,
        to_name: 'CareSync Admin',
        to_email: 'connectheal84@gmail.com',
        message: fullMessage,
        user_email: form.email,
        subject: `New message from ${form.name} (${form.email})`
      }
    );

    Promise.all([sendToUser, sendToAdmin])
      .then((responses) => {
        console.log('Emails sent successfully!', responses);
        setSubmitted(true);
        setIsLoading(false);
        setForm({ name: "", email: "", message: "" });
        
        setTimeout(() => setSubmitted(false), 4000);
      })
      .catch((err) => {
        console.error('Error sending email:', err);
        setError("Failed to send message. Please try again later.");
        setIsLoading(false);
      });
  };

  const faqs = [
    {
      q: "How fast will I receive a response from CareSync?",
      a: "Our clinical and technical teams respond to all patient and doctor inquiries within 15 minutes during peak hours and guaranteed within 1 hour 24/7."
    },
    {
      q: "How does the AI Prescription OCR Scanner work?",
      a: "Upload any clear prescription photo or PDF on our Prescriptions page. Our Neural Vision OCR extracts medicine names, dosages, frequencies, and matches them with TrueMeds best pricing."
    },
    {
      q: "Can I get technical support for my ESP8266 Telemetry Hardware?",
      a: "Yes! Our hardware engineers provide remote telemetry calibration and live 3D diagnostic assistance for all ESP8266 and ECG sensor setups."
    },
    {
      q: "Are online doctor consultations secure and confidential?",
      a: "100%. All consultations and telemetry data transfers are encrypted with end-to-end medical grade encryption following HIPAA standards."
    }
  ];

  return (
    <div style={{ backgroundColor: '#f0f4f8', color: '#1a365d' }} className="min-h-screen font-sans relative overflow-x-hidden pb-16">
      <Head>
        <title>Contact & Help Center — CareSync</title>
        <meta name="description" content="Get 24/7 patient support, hardware telemetry help, and doctor inquiry assistance from CareSync." />
        <link rel="icon" type="image/svg+xml" href="/Logo.svg" />
      </Head>

      <main className="container mx-auto px-4 sm:px-6 py-10 relative z-10 max-w-7xl">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            <span style={{ backgroundColor: '#e6f0fa', color: '#0077b6', borderColor: '#bae6fd' }} className="text-xs font-extrabold uppercase tracking-wider border px-4 py-1.5 rounded-full shadow-xs mb-3 inline-block">
              ✨ 24/7 PATIENT & TELEHEALTH SUPPORT
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ color: '#1a365d' }} 
            className="text-4xl sm:text-6xl font-extrabold tracking-tight mt-2 mb-4"
          >
            We're Here to Help You
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ color: '#4a5568' }} 
            className="text-base sm:text-lg leading-relaxed font-medium"
          >
            Have questions about AI prescriptions, hardware telemetry monitors, or online doctor consultations? Our clinical & support team is online 24/7.
          </motion.p>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          
          {/* Left Column: Contact Cards & Info (5 Cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Quick Contact Links Box */}
            <div style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }} className="border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h2 style={{ color: '#1a365d' }} className="text-xl font-extrabold mb-4 flex items-center gap-2">
                <span>📞 Contact Channels</span>
              </h2>

              <ContactChannelCard 
                icon="📧" 
                iconBg="#ebf8ff"
                iconColor="#0077b6"
                label="Direct Email" 
                value="connectheal84@gmail.com" 
                link="mailto:connectheal84@gmail.com" 
                badge="Fastest"
              />

              <ContactChannelCard 
                icon="📞" 
                iconBg="#e6fffa"
                iconColor="#00a896"
                label="Direct Phone Line" 
                value="+91 12345 67890" 
                link="tel:+911234567890" 
                badge="24/7"
              />

              <ContactChannelCard 
                icon={<WhatsAppSvgIcon />} 
                iconBg="#f0fff4"
                iconColor="#25d366"
                label="WhatsApp Assistance" 
                value="+91 98765 43210" 
                link="https://wa.me/919876543210" 
                badge="Instant"
              />

              <ContactChannelCard 
                icon="🆘" 
                iconBg="#fffaf0"
                iconColor="#dd6b20"
                label="Toll-Free Helpline" 
                value="1800-200-3000" 
                link="tel:18002003000" 
                badge="Free"
              />
            </div>

            {/* HQ & Hours Card */}
            <div style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }} className="border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-2xl pointer-events-none"></div>

              <h2 style={{ color: '#1a365d' }} className="text-xl font-extrabold mb-3 flex items-center gap-2 relative z-10">
                <span>📍 Telehealth HQ & Campus Operations</span>
              </h2>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 relative z-10">
                <div className="flex items-start gap-3">
                  <span className="text-base">🏢</span>
                  <div>
                    <strong className="block text-slate-800 font-extrabold text-base">VIT BHOPAL UNIVERSITY</strong>
                    <span className="font-semibold text-slate-600">Kothri Kalan, Sehore, Madhya Pradesh 466114</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <span className="text-base">⏰</span>
                  <div>
                    <strong className="block text-slate-800 font-bold">Support Hours</strong>
                    <span>Monday – Sunday: 24/7 Continuous Clinical Coverage</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <span className="text-base">⚡</span>
                  <div>
                    <strong className="block text-slate-800 font-bold">Response Guarantee</strong>
                    <span className="text-teal-600 font-extrabold">Under 15 Minutes SLA</span>
                  </div>
                </div>
              </div>

              {/* Embedded Google Map of VIT BHOPAL UNIVERSITY */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 block mb-2">🗺️ Live Campus Location:</span>
                <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative">
                  <iframe 
                    title="VIT Bhopal University Location Map"
                    src="https://maps.google.com/maps?q=VIT%20Bhopal%20University%2C%20Kothri%20Kalan%2C%20Sehore%2C%20Madhya%20Pradesh%20466114&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Emergency Hotline Alert Box - Click to Call Emergency 102 / Hospital Helpline */}
            <a 
              href="tel:102"
              style={{ backgroundColor: '#fff5f5', borderColor: '#feb2b2' }} 
              className="border-2 border-dashed rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4 hover:bg-red-100/80 hover:border-red-400 transition-all cursor-pointer group block text-left text-decoration-none"
              title="Click to call Emergency Medical Services (102)"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white text-2xl flex items-center justify-center flex-shrink-0 animate-pulse shadow-md">
                  🚨
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-red-700 flex items-center gap-1.5 group-hover:text-red-900 transition-colors">
                    <span>Need Immediate Emergency Assistance?</span>
                  </h4>
                  <p className="text-xs text-red-600 mt-0.5 font-medium">
                    Click anywhere to immediately call <strong>102 Emergency Medical Hotline & Ambulance</strong>.
                  </p>
                </div>
              </div>

              <span className="hidden sm:flex items-center gap-1 text-xs font-extrabold bg-red-600 text-white px-3.5 py-2 rounded-xl shadow-xs group-hover:bg-red-700 transition-all flex-shrink-0">
                <span>📞 Call 102 Now</span>
              </span>
            </a>
          </motion.div>

          {/* Right Column: Pro Interactive Form (7 Cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }} className="border rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div>
                  <h2 style={{ color: '#1a365d' }} className="text-2xl font-extrabold">Send Us a Message</h2>
                  <p style={{ color: '#718096' }} className="text-xs mt-0.5 font-medium">Fill out the form below and our medical team will respond instantly.</p>
                </div>
                <span style={{ backgroundColor: '#e6fffa', color: '#00a896', borderColor: '#b2f5ea' }} className="text-xs font-extrabold border px-3 py-1 rounded-full uppercase">
                  ● Live Connected
                </span>
              </div>

              {/* Topic Selector Pills */}
              <div className="mb-6">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Select Inquiry Category:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['General Enquiry', 'Prescription OCR', 'Hardware Telemetry', 'Doctor Consultation'].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setActiveTopic(topic)}
                      style={{
                        backgroundColor: activeTopic === topic ? '#0077b6' : '#f7fafc',
                        color: activeTopic === topic ? '#ffffff' : '#4a5568',
                        borderColor: activeTopic === topic ? '#0077b6' : '#cbd5e1'
                      }}
                      className="text-xs font-extrabold border px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Contact Form */}
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                
                {/* Full Name Input */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 text-sm">👤</span>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      style={{ backgroundColor: '#f8fafc', color: '#1a365d', borderColor: '#cbd5e1' }}
                      className="w-full border pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 text-sm">✉️</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. rahul@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      style={{ backgroundColor: '#f8fafc', color: '#1a365d', borderColor: '#cbd5e1' }}
                      className="w-full border pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Message Textarea */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Message / Detailed Query *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 text-sm">✍️</span>
                    <textarea
                      name="message"
                      placeholder="Describe your inquiry, medicine query, or telemetry setup question..."
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      disabled={isLoading}
                      style={{ backgroundColor: '#f8fafc', color: '#1a365d', borderColor: '#cbd5e1' }}
                      className="w-full border pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-xs resize-y min-h-[130px]"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2"
                  >
                    <span>⚠️ {error}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: isLoading 
                      ? '#cbd5e1' 
                      : submitted 
                        ? '#38a169' 
                        : 'linear-gradient(135deg, #0077b6 0%, #00a896 100%)',
                    color: '#ffffff'
                  }}
                  className="w-full font-extrabold py-4 px-6 rounded-2xl text-sm transition-all shadow-md hover:brightness-105 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      <span>Sending Message...</span>
                    </>
                  ) : submitted ? (
                    <>
                      <span className="text-base">✓</span>
                      <span>Message Delivered Successfully!</span>
                    </>
                  ) : (
                    <span>🚀 Send Message Now</span>
                  )}
                </button>
              </form>

              {/* Subtitle Guarantee */}
              <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <span>🔒 Your messages are encrypted and sent directly to our support team at <strong className="text-slate-700">connectheal84@gmail.com</strong>.</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 style={{ color: '#1a365d' }} className="text-2xl sm:text-3xl font-extrabold">Frequently Asked Questions</h2>
            <p style={{ color: '#718096' }} className="text-xs sm:text-sm font-medium mt-1">Quick answers to common questions about CareSync healthcare services.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}
                className="border rounded-2xl overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left font-extrabold text-sm sm:text-base flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span style={{ color: '#1a365d' }}>{faq.q}</span>
                  <span className="text-lg text-teal-600 font-bold ml-2">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>

                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}

function ContactChannelCard({ icon, iconBg, iconColor, label, value, link, badge }) {
  return (
    <a
      href={link}
      target={link.startsWith('http') ? '_blank' : undefined}
      rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
      style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
      className="border rounded-2xl p-4 flex items-center justify-between hover:bg-slate-100 hover:border-teal-400 transition-all shadow-xs group"
    >
      <div className="flex items-center gap-3.5">
        <div 
          style={{ backgroundColor: iconBg, color: iconColor }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 font-bold shadow-xs"
        >
          {icon}
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
          <span style={{ color: '#1a365d' }} className="text-xs sm:text-sm font-extrabold group-hover:text-teal-600 transition-colors">{value}</span>
        </div>
      </div>

      <span style={{ backgroundColor: iconBg, color: iconColor }} className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-slate-200">
        {badge}
      </span>
    </a>
  );
}

function WhatsAppSvgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.040 1.016-1.040 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.200 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.360.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335 .157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
    </svg>
  );
}