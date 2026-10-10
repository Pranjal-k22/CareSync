// howitworks.js
import Head from "next/head";
import { motion } from "framer-motion";
import Footer from "./footer";
import { FaHeartbeat, FaServer, FaShieldAlt, FaMobileAlt, FaChartLine, FaCloud } from "react-icons/fa";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] }
  }
};

export default function HowItWorks() {
  const steps = [
    {
      icon: FaHeartbeat,
      title: "1. Data Collection",
      desc: "Health sensors, wearables, and clinical devices continuously stream biometric data to CareSync's secure gateway."
    },
    {
      icon: FaServer,
      title: "2. Secure Processing",
      desc: "Our Quantum Engine performs real-time preprocessing, anomaly detection, and structured packaging of patient data."
    },
    {
      icon: FaShieldAlt,
      title: "3. HIPAA-Compliant Encryption",
      desc: "Every packet is encrypted with industry-grade cryptography before leaving the device, ensuring end-to-end protection."
    },
    {
      icon: FaCloud,
      title: "4. Cloud Sync",
      desc: "Encrypted data is uploaded to the CareSync cloud layer for persistence, auditing, and multi-device accessibility."
    },
    {
      icon: FaChartLine,
      title: "5. Intelligent Insights",
      desc: "AI-driven models detect patterns in vitals, diagnose health conditions, and trigger early alert systems."
    },
    {
      icon: FaMobileAlt,
      title: "6. Patient & Doctor Dashboard",
      desc: "Users get instant access to live metrics, historical records, and personalized care recommendations."
    }
  ];

  return (
    <>
      <Head>
        <title>How It Works | CareSync</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-6 py-20">
          
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="px-6 py-2 bg-blue-600/20 border border-blue-500/40 rounded-full text-blue-300 text-sm tracking-wide">
              HOW CARESYNC WORKS
            </span>
            <h1 className="text-5xl font-bold mt-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Simple. Secure. Smart.
            </h1>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto text-lg">
              A complete pipeline for real-time healthcare monitoring — built with modern technology and open-source principles.
            </p>
          </motion.div>

          {/* Steps Section */}
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: index * 0.15 }}
                className="bg-gray-800/60 p-8 rounded-2xl border border-gray-700 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-full mb-6">
                  <step.icon className="text-3xl text-blue-400" />
                </div>

                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mt-20"
          >
            <h2 className="text-4xl font-bold mb-4">Built for reliability</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
              Every component of CareSync is designed to improve patient outcomes while keeping data safe.
            </p>
            <a
              href="/opensource"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold"
            >
              Explore Open Source
            </a>
          </motion.div>

        </div>

        <Footer />
      </main>
    </>
  );
}
