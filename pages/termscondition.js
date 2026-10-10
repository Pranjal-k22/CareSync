// termendcondition.js
import Head from "next/head";
import Footer from "./footer";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
  }
};

export default function TermEndCondition() {
  const lastUpdated = "December 2025";

  return (
    <>
      <Head>
        <title>Terms & Conditions | CareSync</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-6 py-16 md:py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <span className="px-4 py-1 bg-purple-600/20 border border-purple-500/40 rounded-full text-purple-300 text-xs tracking-wide">
              TERMS & CONDITIONS
            </span>

            <h1 className="mt-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              CareSync Terms &amp; Conditions
            </h1>

            <p className="mt-3 text-gray-400 text-sm">
              Last updated: {lastUpdated}
            </p>

            <p className="mt-6 text-gray-300 text-sm md:text-base">
              These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use
              of CareSync&apos;s applications, platforms, APIs, and related services
              (collectively, the &quot;Services&quot;). By accessing or using the Services,
              you agree to be bound by these Terms.
            </p>

            <div className="mt-10 space-y-8 text-sm md:text-base text-gray-200 leading-relaxed">
              <section id="eligibility">
                <h2 className="text-2xl font-semibold mb-3">1. Eligibility &amp; Accounts</h2>
                <p>
                  You may use the Services only if you have the legal capacity to form a
                  binding contract under applicable law. Where accounts are created on
                  behalf of a healthcare organization, you confirm that you are authorized
                  to act for that entity.
                </p>
              </section>

              <section id="use-of-services">
                <h2 className="text-2xl font-semibold mb-3">2. Use of Services</h2>
                <p className="mb-2">
                  You agree to use the Services only for lawful purposes and in accordance
                  with these Terms. You must not:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Reverse engineer, decompile, or attempt to access source code.</li>
                  <li>
                    Bypass or interfere with security features, rate limits, or access
                    controls.
                  </li>
                  <li>
                    Use the Services to transmit malicious code, spam, or unauthorized
                    content.
                  </li>
                  <li>
                    Misrepresent clinical data, impersonate another person, or misuse
                    patient information.
                  </li>
                </ul>
              </section>

              <section id="clinical-disclaimer">
                <h2 className="text-2xl font-semibold mb-3">3. Clinical Disclaimer</h2>
                <p>
                  CareSync does not replace professional medical judgment. Any
                  visualizations, alerts, or insights are decision-support tools and must
                  be interpreted by qualified healthcare professionals. Always consult a
                  licensed clinician for diagnosis or treatment.
                </p>
              </section>

              <section id="intellectual-property">
                <h2 className="text-2xl font-semibold mb-3">4. Intellectual Property</h2>
                <p>
                  Unless otherwise indicated, all content, UI elements, logos, and code
                  associated with the CareSync platform are owned by CareSync or its
                  licensors and are protected by intellectual property laws. Open-source
                  components are licensed under their respective licenses.
                </p>
              </section>

              <section id="open-source">
                <h2 className="text-2xl font-semibold mb-3">5. Open Source Components</h2>
                <p>
                  Some parts of the Services may be made available as open source. Your
                  use of such components is governed by the terms of the applicable
                  open-source licenses in addition to these Terms. Where there is a
                  conflict, the open-source license will prevail for that component.
                </p>
              </section>

              <section id="privacy">
                <h2 className="text-2xl font-semibold mb-3">6. Privacy</h2>
                <p>
                  Your use of the Services is also subject to our Privacy Policy, which
                  describes how we collect, use, and protect personal and health
                  information. By using the Services, you consent to such processing.
                </p>
              </section>

              <section id="availability">
                <h2 className="text-2xl font-semibold mb-3">7. Service Availability</h2>
                <p>
                  We aim to maintain high availability but do not guarantee uninterrupted
                  access. We may suspend or modify the Services for maintenance, security
                  reasons, or other legitimate purposes without prior notice.
                </p>
              </section>

              <section id="limitation-of-liability">
                <h2 className="text-2xl font-semibold mb-3">8. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, CareSync and its affiliates
                  are not liable for any indirect, incidental, consequential, or special
                  damages arising out of or related to your use of the Services, including
                  loss of data, loss of profits, or business interruption.
                </p>
              </section>

              <section id="indemnity">
                <h2 className="text-2xl font-semibold mb-3">9. Indemnity</h2>
                <p>
                  You agree to indemnify and hold harmless CareSync, its officers,
                  employees, and partners from any claims, damages, or expenses arising
                  from your misuse of the Services or violation of these Terms.
                </p>
              </section>

              <section id="changes">
                <h2 className="text-2xl font-semibold mb-3">10. Changes to Terms</h2>
                <p>
                  We may update these Terms from time to time. When we do, we will revise
                  the &quot;Last updated&quot; date above. Continued use of the Services
                  after changes become effective constitutes acceptance of the updated
                  Terms.
                </p>
              </section>

              <section id="governing-law">
                <h2 className="text-2xl font-semibold mb-3">11. Governing Law</h2>
                <p>
                  These Terms are governed by and interpreted in accordance with the laws
                  of the applicable jurisdiction in which CareSync is operated, without
                  regard to conflict-of-law principles.
                </p>
              </section>

              <section id="contact">
                <h2 className="text-2xl font-semibold mb-3">12. Contact</h2>
                <p>
                  For questions regarding these Terms, you may contact us at:
                </p>
                <p className="mt-2 text-gray-300">
                  <span className="font-medium">Email:</span> legal@caresync.example
                  <br />
                  <span className="font-medium">Subject:</span> &quot;Terms &amp; Conditions&quot;
                </p>
              </section>

              <section className="border border-yellow-500/40 bg-yellow-500/10 rounded-lg p-4 text-xs text-yellow-200 mt-6">
                <strong>Note:</strong> This Terms &amp; Conditions page is a generic
                template for development and testing. For real deployments, adapt and
                validate this text with licensed legal professionals and align it with your
                country&apos;s healthcare and data protection regulations.
              </section>
            </div>
          </motion.div>
        </div>

        <Footer />
      </main>
    </>
  );
}
