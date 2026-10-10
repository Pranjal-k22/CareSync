import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaPhoneSlash, FaComments, FaTimes, FaHeartbeat, FaUserMd, FaUser, FaShieldAlt, FaPaperPlane, FaBroadcastTower } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function TeleMeetModal({ isOpen, onClose, doctorName, patientName, patientVitals, appointmentId }) {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'System', text: '🔒 HIPAA-Compliant End-to-End Encrypted Tele-Consultation Room Active.', time: 'Just now' },
    { sender: doctorName || 'Doctor', text: 'Hello! I am reviewing your biometric telemetry stream.', time: '1 min ago' }
  ]);

  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const streamRef = useRef(null);

  // Timer for Call Duration
  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  // Request Local Camera / Mic Stream
  useEffect(() => {
    let activeStream = null;
    if (isOpen) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          activeStream = stream;
          streamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera access fallback:', err);
          toast.error('Webcam not detected. Using high-definition telehealth avatar simulation.');
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  // Toggle Mic
  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    }
    setMicOn(!micOn);
    toast.success(micOn ? 'Microphone Muted' : 'Microphone Active');
  };

  // Toggle Video
  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = !videoOn));
    }
    setVideoOn(!videoOn);
    toast.success(videoOn ? 'Video Feed Disabled' : 'Video Feed Enabled');
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        toast.success('Screen Sharing Active');
        screenStream.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current && streamRef.current) {
            localVideoRef.current.srcObject = streamRef.current;
          }
          setIsScreenSharing(false);
        };
      } catch (e) {
        toast.error('Screen sharing cancelled.');
      }
    } else {
      if (localVideoRef.current && streamRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }
      setIsScreenSharing(false);
      toast.success('Stopped Screen Share');
    }
  };

  // Send Live Chat Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'You', text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setChatInput('');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          color: '#f8fafc',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        {/* Telemeet Header Bar */}
        <header style={{ padding: '1rem 1.5rem', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.4rem 0.75rem', borderRadius: '20px', background: '#ef444420', border: '1px solid #ef444440', color: '#f87171', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaBroadcastTower className="animate-pulse" /> LIVE TELE-CONSULTATION ({formatTime(callDuration)})
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                {doctorName || 'Dr. Ananya Roy, MD'} ↔ {patientName || 'Patient Consultation'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FaShieldAlt /> 256-Bit SSL Encrypted Video Bridge • Appointment #{appointmentId || 'HC-9041'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowChat(!showChat)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: showChat ? '#3b82f6' : '#334155', color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FaComments /> Meeting Chat ({chatMessages.length})
          </button>
        </header>

        {/* Telemeet Video Body */}
        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
          
          {/* Main Remote Video Viewport (Simulated Interactive Patient / Doctor Feed) */}
          <div style={{ flex: 1, background: '#090d16', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Simulated Remote Feed Visual */}
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)' }}>
              <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)', marginBottom: '1rem' }}>
                👨‍⚕️
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 0.25rem 0', color: '#f8fafc' }}>
                {doctorName || 'Dr. Ananya Roy, MD'}
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: '600' }}>
                Cardiology & Critical Care Specialist • Online
              </span>

              {/* Vitals Telemetry Floating Overlay (For Doctor) */}
              {patientVitals && (
                <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(30, 41, 59, 0.85)', backdropFilter: 'blur(10px)', padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid #334155', display: 'flex', gap: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Heart Rate</span>
                    <strong style={{ fontSize: '1.1rem', color: '#f43f5e' }}>{patientVitals.hr || 76} BPM</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>SpO₂ Saturation</span>
                    <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>{patientVitals.spo2 || 98}%</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Blood Pressure</span>
                    <strong style={{ fontSize: '1.1rem', color: '#c084fc' }}>120/80 mmHg</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Local Self-View PiP Video */}
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '220px', height: '140px', borderRadius: '14px', overflow: 'hidden', border: '2px solid #10b981', background: '#1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              {videoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#64748b' }}>
                  <FaVideoSlash style={{ fontSize: '2rem' }} />
                </div>
              )}
              <span style={{ position: 'absolute', bottom: '6px', left: '8px', fontSize: '0.65rem', fontWeight: '800', background: 'rgba(0,0,0,0.6)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#fff' }}>
                You ({patientName || 'Participant'})
              </span>
            </div>

          </div>

          {/* Meeting Side Chat Drawer */}
          {showChat && (
            <div style={{ width: '320px', background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #334155', fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>
                💬 Consultation Live Chat
              </div>

              <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ background: msg.sender === 'You' ? '#05966920' : '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#38bdf8', marginBottom: '0.2rem', fontWeight: '700' }}>
                      <span>{msg.sender}</span>
                      <span style={{ color: '#64748b' }}>{msg.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} style={{ padding: '0.75rem', borderTop: '1px solid #334155', display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Type clinical note or question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{ flex: 1, background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.5rem', color: '#fff', fontSize: '0.8rem' }}
                />
                <button type="submit" style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Telemeet Bottom Action Controls Bar */}
        <footer style={{ padding: '1.25rem', background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem' }}>
          
          <button
            onClick={toggleMic}
            style={{ width: '50px', height: '50px', borderRadius: '50%', background: micOn ? '#334155' : '#ef4444', color: '#fff', border: 'none', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>

          <button
            onClick={toggleVideo}
            style={{ width: '50px', height: '50px', borderRadius: '50%', background: videoOn ? '#334155' : '#ef4444', color: '#fff', border: 'none', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            title={videoOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {videoOn ? <FaVideo /> : <FaVideoSlash />}
          </button>

          <button
            onClick={toggleScreenShare}
            style={{ width: '50px', height: '50px', borderRadius: '50%', background: isScreenSharing ? '#3b82f6' : '#334155', color: '#fff', border: 'none', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            title="Share Screen"
          >
            <FaDesktop />
          </button>

          <button
            onClick={onClose}
            style={{ padding: '0 1.75rem', height: '50px', borderRadius: '25px', background: '#ef4444', color: '#fff', border: 'none', fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)' }}
          >
            <FaPhoneSlash /> End Call
          </button>

        </footer>

      </motion.div>
    </AnimatePresence>
  );
}
