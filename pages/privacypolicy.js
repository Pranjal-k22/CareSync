// privacyandpolicy.js
import Head from "next/head";
import { motion } from "framer-motion";
import Footer from "./footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] },
  },
};

export default function PrivacyAndPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | CareSync</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-6 py-20 max-w-4xl">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-10 text-center"
          >
            <span className="px-5 py-2 rounded-full bg-blue-600/20 border border-blue-500/40 text-xs tracking-wide text-blue-300">
              PRIVACY & DATA PROTECTION
            </span>
            <h1 className="mt-6 text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CareSync Privacy Policy
            </h1>
            <p className="mt-4 text-gray-300">
              Last updated: {new Date().getFullYear()}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="space-y-8 text-gray-200 text-sm md:text-base leading-relaxed bg-gray-900/70 border border-gray-700 rounded-2xl p-6 md:p-8"
          >
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
              <p>
                CareSync (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) provides
                digital tools for healthcare monitoring and analytics. This
                Privacy Policy explains how we collect, use, store and protect
                your personal and health-related information when you use our
                applications, dashboards, APIs, and related services
                (&quot;Services&quot;).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-medium">Account Information:</span> name,
                  email, contact details, organisation details.
                </li>
                <li>
                  <span className="font-medium">Usage Data:</span> log data,
                  device identifiers, IP address, browser and app events.
                </li>
                <li>
                  <span className="font-medium">Health Data (where applicable):</span>{" "}
                  vital signs, measurements, observations, clinical notes and
                  metadata transmitted from connected devices or systems.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. How We Use Your Data</h2>
              <p className="mb-2">We process data in order to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide and maintain the CareSync platform.</li>
                <li>Monitor performance, reliability and security of the Services.</li>
                <li>Generate analytics and insights for authorised users.</li>
                <li>
                  Comply with legal, regulatory and contractual obligations, including
                  healthcare data standards where applicable.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Legal Basis & Consent</h2>
              <p>
                Where required by applicable law, we process personal and health
                data based on your explicit consent, performance of a contract,
                legitimate interests in operating a secure platform, or to meet
                legal obligations. Organisations integrating CareSync are
                responsible for ensuring they have the appropriate legal basis
                for sharing patient data with us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
              <p>
                We implement technical and organisational measures such as
                encryption in transit and at rest, access controls, auditing and
                monitoring. No system is 100% secure, but we continuously
                improve our security posture to protect sensitive health
                information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Data Retention</h2>
              <p>
                We retain personal and health data only for as long as necessary
                to provide the Services, meet legal requirements, resolve
                disputes, and enforce our agreements. Retention duration may be
                defined by your healthcare organisation&apos;s policies or local
                regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">7. Sharing of Information</h2>
              <p className="mb-2">We may share data with:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Authorised healthcare providers and organisations.</li>
                <li>Cloud infrastructure and service providers under strict contracts.</li>
                <li>
                  Regulatory or law-enforcement authorities where legally required.
                </li>
              </ul>
              <p className="mt-2">
                We do not sell your personal or health data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">8. Your Rights</h2>
              <p className="mb-2">
                Depending on your jurisdiction, you may have rights to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access, correct or delete your personal data.</li>
                <li>Restrict or object to certain processing activities.</li>
                <li>Withdraw consent where processing is based on consent.</li>
              </ul>
              <p className="mt-2">
                Requests related to patient records are usually handled via your
                healthcare provider that uses CareSync.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">9. International Transfers</h2>
              <p>
                If data is processed or stored outside your country, we use
                appropriate safeguards and contractual protections to ensure an
                adequate level of data protection consistent with applicable
                laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. Material changes
                will be communicated through the platform or other appropriate
                channels. Continued use of the Services after an update
                constitutes acceptance of the revised Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">11. Contact</h2>
              <p>
                For questions or privacy-related requests, contact the CareSync
                support team or your organisation&apos;s CareSync administrator.
              </p>
            </section>
          </motion.div>
        </div>

        <Footer />
      </main>
    </>
  );
}
