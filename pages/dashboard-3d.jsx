import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function ProfessionalDashboard() {
  const [activeTab, setActiveTab] = useState("patient");
  const [patientMethod, setPatientMethod] = useState("phone");
  const [doctorId, setDoctorId] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);

  // Initialize reCAPTCHA
  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  }, []);

  // Particle animation for background
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 5
        });
      }
      setParticles(newParticles);
    };
    
    generateParticles();
  }, []);

  const sendOTP = async () => {
    if (!phoneNumber) {
      showNotification('Please enter a valid phone number', 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      const formattedPhone = `+${phoneNumber.replace(/\D/g, '')}`;
      const appVerifier = window.recaptchaVerifier;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmation(confirmationResult);
      showNotification('OTP sent successfully!', 'success');
    } catch (error) {
      showNotification('Error sending OTP: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      showNotification('Please enter the OTP', 'error');
      return;
    }
    try {
      setIsLoading(true);
      await confirmation.confirm(otp);
      showNotification('Authentication successful!', 'success');
      // Redirect or update state here
    } catch (error) {
      showNotification('Error verifying OTP: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      showNotification('Google authentication successful!', 'success');
    } catch (error) {
      showNotification('Error with Google authentication: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGmailLogin = async () => {
    try {
      setIsLoading(true);
      // For Gmail, we can use OAuth2 with custom provider
      const provider = new OAuthProvider('microsoft.com');
      const result = await signInWithPopup(auth, provider);
      showNotification('Gmail authentication successful!', 'success');
    } catch (error) {
      showNotification('Error with Gmail authentication: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorLogin = (e) => {
    e.preventDefault();
    if (!doctorId || !doctorPassword) {
      showNotification('Please enter both Doctor ID and Password', 'error');
      return;
    }
    // Implement doctor authentication logic
    showNotification('Doctor authentication successful!', 'success');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (!adminId || !adminPassword) {
      showNotification('Please enter both Admin ID and Password', 'error');
      return;
    }
    // Implement admin authentication logic
    showNotification('Admin authentication successful!', 'success');
  };

  const showNotification = (message, type) => {
    // In a real app, you'd use a proper notification system
    alert(`${type.toUpperCase()}: ${message}`);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif",
      color: "#fff",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated Background Particles */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0
      }}>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            style={{
              position: "absolute",
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: "rgba(255,255,255,0.3)",
              borderRadius: "50%"
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay
            }}
          />
        ))}
      </div>

      <Head>
        <title>HealConnect | Secure Authentication Portal</title>
        <meta name="description" content="Secure authentication portal for HealConnect healthcare platform" />
      </Head>

      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          borderRadius: "32px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
          padding: "48px 32px",
          maxWidth: "1000px",
          width: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 1
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: 700, 
            marginBottom: "8px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            HealConnect
          </h1>
          <p style={{ 
            fontSize: "1rem", 
            opacity: 0.8, 
            marginBottom: "40px",
            fontWeight: 300
          }}>
            Secure Healthcare Authentication Portal
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginBottom: "40px",
          flexWrap: "wrap"
        }}>
          {["patient", "doctor", "admin"].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : 
                  "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "12px 24px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.9rem",
                textTransform: "capitalize",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease"
              }}
            >
              {tab} Login
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Patient Login */}
          {activeTab === "patient" && (
            <motion.div
              key="patient"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                background: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "32px",
                maxWidth: "400px",
                margin: "0 auto"
              }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "24px" }}>Patient Access</h2>
              
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "24px" }}>
                {["phone", "gmail", "google"].map((method) => (
                  <button 
                    key={method}
                    onClick={() => setPatientMethod(method)}
                    style={{ 
                      background: patientMethod === method ? 
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : 
                        "rgba(255,255,255,0.1)",
                      color: "#fff", 
                      border: "none", 
                      borderRadius: "8px", 
                      padding: "8px 16px", 
                      fontWeight: 500, 
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      textTransform: "capitalize"
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {patientMethod === "phone" && (
                <div>
                  <div style={{ position: "relative", marginBottom: "16px" }}>
                    <input 
                      type="text" 
                      placeholder="Enter phone number with country code" 
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      style={{ 
                        width: "100%", 
                        padding: "14px 16px", 
                        borderRadius: "12px", 
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#fff",
                        fontSize: "0.9rem"
                      }} 
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={sendOTP}
                    disabled={isLoading}
                    style={{ 
                      width: "100%", 
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                      color: "#fff", 
                      fontWeight: 600, 
                      padding: "14px", 
                      borderRadius: "12px", 
                      border: "none", 
                      cursor: "pointer",
                      marginBottom: "16px",
                      opacity: isLoading ? 0.7 : 1
                    }}
                  >
                    {isLoading ? "Sending..." : "Send OTP"}
                  </motion.button>
                  
                  <div style={{ position: "relative", marginBottom: "16px" }}>
                    <input 
                      type="text" 
                      placeholder="Enter OTP" 
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      style={{ 
                        width: "100%", 
                        padding: "14px 16px", 
                        borderRadius: "12px", 
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#fff",
                        fontSize: "0.9rem"
                      }} 
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={verifyOTP}
                    disabled={isLoading}
                    style={{ 
                      width: "100%", 
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                      color: "#fff", 
                      fontWeight: 600, 
                      padding: "14px", 
                      borderRadius: "12px", 
                      border: "none", 
                      cursor: "pointer",
                      opacity: isLoading ? 0.7 : 1
                    }}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </motion.button>
                </div>
              )}

              {patientMethod === "gmail" && (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGmailLogin}
                  disabled={isLoading}
                  style={{ 
                    width: "100%", 
                    background: "linear-gradient(135deg, #ea4335 0%, #d14836 100%)", 
                    color: "#fff", 
                    fontWeight: 600, 
                    padding: "14px", 
                    borderRadius: "12px", 
                    border: "none", 
                    cursor: "pointer",
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? "Connecting..." : "Continue with Gmail"}
                </motion.button>
              )}

              {patientMethod === "google" && (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  style={{ 
                    width: "100%", 
                    background: "linear-gradient(135deg, #4285f4 0%, #34a853 100%)", 
                    color: "#fff", 
                    fontWeight: 600, 
                    padding: "14px", 
                    borderRadius: "12px", 
                    border: "none", 
                    cursor: "pointer",
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? "Connecting..." : "Continue with Google"}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Doctor Login */}
          {activeTab === "doctor" && (
            <motion.div
              key="doctor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                background: "linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,154,107,0.1) 100%)",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "32px",
                maxWidth: "400px",
                margin: "0 auto"
              }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "24px" }}>Medical Professional Access</h2>
              <form onSubmit={handleDoctorLogin}>
                <div style={{ position: "relative", marginBottom: "16px" }}>
                  <input 
                    type="text" 
                    placeholder="Doctor ID" 
                    value={doctorId} 
                    onChange={e => setDoctorId(e.target.value)} 
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: "12px", 
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      fontSize: "0.9rem"
                    }} 
                  />
                </div>
                <div style={{ position: "relative", marginBottom: "24px" }}>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={doctorPassword} 
                    onChange={e => setDoctorPassword(e.target.value)} 
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: "12px", 
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      fontSize: "0.9rem"
                    }} 
                  />
                </div>
                <motion.button 
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  style={{ 
                    width: "100%", 
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ff9a6b 100%)", 
                    color: "#fff", 
                    fontWeight: 600, 
                    padding: "14px", 
                    borderRadius: "12px", 
                    border: "none", 
                    cursor: "pointer",
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? "Authenticating..." : "Access Medical Portal"}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Admin Login */}
          {activeTab === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                background: "linear-gradient(135deg, rgba(106,213,216,0.1) 0%, rgba(106,148,216,0.1) 100%)",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "32px",
                maxWidth: "400px",
                margin: "0 auto"
              }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "24px" }}>Administrator Access</h2>
              <form onSubmit={handleAdminLogin}>
                <div style={{ position: "relative", marginBottom: "16px" }}>
                  <input 
                    type="text" 
                    placeholder="Admin ID" 
                    value={adminId} 
                    onChange={e => setAdminId(e.target.value)} 
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: "12px", 
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      fontSize: "0.9rem"
                    }} 
                  />
                </div>
                <div style={{ position: "relative", marginBottom: "24px" }}>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={adminPassword} 
                    onChange={e => setAdminPassword(e.target.value)} 
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: "12px", 
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      fontSize: "0.9rem"
                    }} 
                  />
                </div>
                <motion.button 
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  style={{ 
                    width: "100%", 
                    background: "linear-gradient(135deg, #6ad5d8 0%, #6a94d8 100%)", 
                    color: "#fff", 
                    fontWeight: 600, 
                    padding: "14px", 
                    borderRadius: "12px", 
                    border: "none", 
                    cursor: "pointer",
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? "Authenticating..." : "Access Admin Panel"}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* reCAPTCHA Container */}
        <div id="recaptcha-container" style={{ marginTop: "20px" }}></div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            marginTop: "32px",
            padding: "16px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "0.8rem",
            opacity: 0.7
          }}
        >
          🔒 End-to-end encrypted • HIPAA compliant • ISO 27001 certified
        </motion.div>
      </motion.div>
      <Footer />
    </div>
  );
}