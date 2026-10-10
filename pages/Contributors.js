// contributer.js
import Head from "next/head";
import Footer from "./footer";
import { motion } from "framer-motion";
import { FaGithub, FaGitAlt, FaCode, FaUsers, FaBug, FaStar } from "react-icons/fa";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] }
  }
};

export default function Contributer() {
  const guidelines = [
    {
      icon: FaGitAlt,
      title: "Fork & Branch",
      desc: "Fork the repository, create a new branch, and start hacking safely without affecting main."
    },
    {
      icon: FaCode,
      title: "Write Clean Code",
      desc: "Follow our coding conventions, use meaningful names, and include comments where needed."
    },
    {
      icon: FaBug,
      title: "Fix Bugs & Improve",
      desc: "Track issues from the GitHub board and help improve performance, security, or documentation."
    }
  ];

  const contributors = [
    {
      name: "Om Raj",
      role: "Lead Engineer",
      github: "https://github.com/Pranjal-k22/CareSync",
      highlight: true
    },
    {
      name: "CareSync Dev Team",
      role: "Core Maintainers",
      github: "https://github.com/Pranjal-k22/CareSync"
    }
  ];

  return (
    <>
      <Head>
        <title>Contributors | CareSync</title>
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
            <span className="px-6 py-2 bg-purple-600/20 border border-purple-500/40 rounded-full text-purple-300 text-sm tracking-wide">
              CONTRIBUTORS
            </span>

            <h1 className="text-5xl font-bold mt-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CareSync Contributors
            </h1>

            <p className="mt-4 text-gray-300 max-w-2xl mx-auto text-lg">
              Meet the developers and community members building the future of connected healthcare.
            </p>
          </motion.div>

          {/* Contribution Guidelines */}
          <div className="grid md:grid-cols-3 gap-10 mb-20">
            {guidelines.map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: index * 0.15 }}
                className="bg-gray-800/60 p-8 rounded-2xl border border-gray-700 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-full mb-6">
                  <item.icon className="text-3xl text-blue-400" />
                </div>

                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Contributors List */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold mb-6 text-center">Top Contributors</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            {contributors.map((person, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: index * 0.2 }}
                className={`p-8 rounded-xl border ${
                  person.highlight
                    ? "border-purple-500/40 bg-purple-800/10"
                    : "border-gray-700 bg-gray-800/50"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold">{person.name}</h3>
                  {person.highlight && (
                    <FaStar className="text-yellow-400 text-xl" />
                  )}
                </div>
                <p className="text-gray-300 mb-4">{person.role}</p>

                <a
                  href={person.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-white transition"
                >
                  <FaGithub /> View GitHub Profile
                </a>
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
            <h2 className="text-4xl font-bold mb-4">
              Want to Join the Contributors?
            </h2>

            <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
              CareSync is fully open source — you can help improve healthcare tech for everyone.
            </p>

            <a
              href="https://github.com/Pranjal-k22/CareSync"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold flex items-center gap-2 w-fit mx-auto"
            >
              <FaGithub /> Contribute on GitHub
            </a>
          </motion.div>

        </div>

        <Footer />
      </main>
    </>
  );
}
