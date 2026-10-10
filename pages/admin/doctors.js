import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminSidebar from '@components/Sidebar/AdminSidebar';
import AuthCheck from '@components/Auth/AuthCheck';
import { FaUserMd, FaStethoscope, FaClock, FaCheckCircle, FaSpinner, FaHospital, FaPhone, FaKey, FaShieldAlt, FaPlus, FaTimes, FaLock, FaIdCard, FaUserPlus, FaEye, FaEyeSlash, FaMapMarkerAlt, FaEnvelope, FaGraduationCap, FaBriefcase, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function DoctorAccountsPage() {
  const [doctorsList, setDoctorsList] = useState([
    { id: 'DOC-8891', name: 'Dr. Ananya Roy, MD', email: 'doctor@caresync.com', specialty: 'Cardiology', sub_specialty: 'Interventional Cardiology', qualification: 'MBBS, MD (Cardiology), FACC', experience_years: '14 Years', license_no: 'MCI-2018-884219', phone: '+91 9876543299', attendance_status: 'On Duty', hospital: 'CareSync Central Tower', address: 'Suite 402, CareSync Complex, Mumbai', fee: '₹500', default_password: '12345678', avatar_url: '👨‍⚕️' },
    { id: 'DOC-1001', name: 'Dr. Sarah Johnson, MD', email: 'sarah.johnson@caresync.com', specialty: 'Cardiology', sub_specialty: 'Pediatric Cardiology', qualification: 'MBBS, MD', experience_years: '12 Years', license_no: 'MCI-2016-77312', phone: '+91 9876543210', attendance_status: 'On Duty', hospital: 'Stanford Health Care', address: 'Stanford Medical Plaza, Palo Alto', fee: '₹500', default_password: '12345678', avatar_url: '👩‍⚕️' },
    { id: 'DOC-1002', name: 'Dr. Michael Chen, MD', email: 'michael.chen@caresync.com', specialty: 'Neurology', sub_specialty: 'Neuro-Oncology & Epilepsy', qualification: 'MBBS, DM (Neurology)', experience_years: '15 Years', license_no: 'MCI-2017-99241', phone: '+91 9876543211', attendance_status: 'On Duty', hospital: 'Johns Hopkins Hospital', address: 'Johns Hopkins Pavilion, Baltimore', fee: '₹600', default_password: '12345678', avatar_url: '👨‍⚕️' },
    { id: 'DOC-1003', name: 'Dr. Emily Rodriguez, MD', email: 'emily.rodriguez@caresync.com', specialty: 'Pediatrics', sub_specialty: 'Neonatal Critical Care', qualification: 'MBBS, DCH, MD', experience_years: '10 Years', license_no: 'MCI-2019-33812', phone: '+91 9876543212', attendance_status: 'Off Duty', hospital: "Boston Children's Hospital", address: 'Boston Children Wings, Boston', fee: '₹450', default_password: '12345678', avatar_url: '👩‍⚕️' },
    { id: 'DOC-1004', name: 'Dr. James Wilson, MD', email: 'james.wilson@caresync.com', specialty: 'Orthopedics', sub_specialty: 'Joint Replacement & Spine', qualification: 'MBBS, MS (Ortho)', experience_years: '16 Years', license_no: 'MCI-2015-11928', phone: '+91 9876543213', attendance_status: 'In Emergency Surgery', hospital: 'Mayo Clinic Network', address: 'Mayo Clinic Plaza, Rochester', fee: '₹700', default_password: '12345678', avatar_url: '👨‍⚕️' }
  ]);

  const [loading, setLoading] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});

  // New Doctor Onboarding Form State
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: '',
    email: '',
    doctor_id: `DOC-${Math.floor(1005 + Math.random() * 8900)}`,
    password: '12345678',
    specialty: 'Cardiology',
    sub_specialty: 'General Practice',
    qualification: 'MBBS, MD',
    experience_years: '10 Years',
    license_no: `MCI-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    hospital: 'CareSync Central Hospital',
    address: 'Central Medical Tower, City Wing',
    fee: '₹500'
  });

  useEffect(() => {
    let isSubscribed = true;
    const fetchDoctors = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/doctors");
        if (res.ok) {
          const data = await res.json();
          if (data.doctors && data.doctors.length > 0 && isSubscribed) {
            setDoctorsList((prev) => {
              const combined = [...data.doctors];
              prev.forEach((d) => {
                if (!combined.some((c) => c.email === d.email)) {
                  combined.push(d);
                }
              });
              return combined;
            });
          }
        }
      } catch (err) {
        console.warn('Doctors fetch notice:', err);
      }
    };

    fetchDoctors();
    return () => { isSubscribed = false; };
  }, []);

  const togglePasswordVisibility = (docId) => {
    setShowPasswords((prev) => ({ ...prev, [docId]: !prev[docId] }));
  };

  const handleToggleAttendance = async (docId, currentStatus) => {
    const nextStatus = currentStatus === 'On Duty' ? 'Off Duty' : currentStatus === 'Off Duty' ? 'In Emergency Surgery' : 'On Duty';
    setDoctorsList((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, attendance_status: nextStatus } : d))
    );

    try {
      await fetch(`http://127.0.0.1:8000/doctors/${docId}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance_status: nextStatus })
      });
    } catch (err) {
      console.warn('Attendance backend update notice:', err);
    }

    toast.success(`Updated Doctor ${docId} Duty Status to: ${nextStatus}`);
  };

  const handleOnboardDoctor = async (e) => {
    e.preventDefault();
    if (!newDoctorForm.name.trim() || !newDoctorForm.email.trim()) {
      toast.error('Please enter Doctor name and email!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDoctorForm.name,
          email: newDoctorForm.email,
          doctor_id: newDoctorForm.doctor_id,
          password: newDoctorForm.password,
          specialty: newDoctorForm.specialty,
          sub_specialty: newDoctorForm.sub_specialty,
          qualification: newDoctorForm.qualification,
          experience_years: newDoctorForm.experience_years,
          license_no: newDoctorForm.license_no,
          hospital: newDoctorForm.hospital,
          address: newDoctorForm.address,
          fee: newDoctorForm.fee
        })
      });

      const data = await res.json();
      const createdDoctor = data.doctor || {
        id: newDoctorForm.doctor_id,
        name: newDoctorForm.name,
        email: newDoctorForm.email,
        specialty: newDoctorForm.specialty,
        sub_specialty: newDoctorForm.sub_specialty,
        qualification: newDoctorForm.qualification,
        experience_years: newDoctorForm.experience_years,
        license_no: newDoctorForm.license_no,
        hospital: newDoctorForm.hospital,
        address: newDoctorForm.address,
        fee: newDoctorForm.fee,
        attendance_status: 'On Duty',
        default_password: newDoctorForm.password,
        avatar_url: '👨‍⚕️'
      };

      setDoctorsList((prev) => [createdDoctor, ...prev]);
      toast.success(`🎉 Doctor ${newDoctorForm.name} Onboarded Successfully! Assigned ID: ${createdDoctor.id}`);
      setShowAddDoctorModal(false);
      setNewDoctorForm({
        name: '',
        email: '',
        doctor_id: `DOC-${Math.floor(1005 + Math.random() * 8900)}`,
        password: '12345678',
        specialty: 'Cardiology',
        sub_specialty: 'General Practice',
        qualification: 'MBBS, MD',
        experience_years: '10 Years',
        license_no: `MCI-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        hospital: 'CareSync Central Hospital',
        address: 'Central Medical Tower, City Wing',
        fee: '₹500'
      });
    } catch (err) {
      toast.error('Failed to onboard doctor account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCheck requiredRole="admin">
      <AdminSidebar>
        <Head><title>Doctor Accounts & Onboarding Registry | CareSync Admin</title></Head>
        <main className="p-6 space-y-8 font-sans">
          
          {/* Header Banner */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase mb-2 border border-emerald-500/40">
                <FaUserMd />
                <span>Board-Certified Medical Staff Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Doctor Accounts, Credentials & Duty Attendance</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Manage doctor unique IDs, personal details, contact info, clinic addresses, passwords, and duty attendance.
              </p>
            </div>
            
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm transition-all"
            >
              <FaUserPlus /> Onboard New Doctor +
            </button>
          </div>

          {/* DOCTOR CREDENTIALS & PERSONAL DETAILS DIRECTORY */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <FaLock className="text-emerald-400" />
                  <span>Doctor Details, Credentials & Login Directory</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Synced directly with the Doctor Portal Settings tab. Account deletion is restricted to Admin.
                </p>
              </div>

              <span className="bg-slate-900 border border-slate-700 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-extrabold">
                {doctorsList.length} Active Accounts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctorsList.map((doc) => (
                <div key={doc.id} className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 space-y-3 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{doc.avatar_url || '👨‍⚕️'}</span>
                        <div>
                          <span className="font-mono text-xs font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/30">
                            ID: {doc.id}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        doc.attendance_status === 'On Duty' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        doc.attendance_status === 'In Emergency Surgery' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {doc.attendance_status === 'On Duty' ? '🟢 ON DUTY' : doc.attendance_status === 'In Emergency Surgery' ? '🚑 SURGERY' : '🔴 OFF DUTY'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white">{doc.name}</h3>
                    <p className="text-xs text-emerald-400 font-bold">{doc.specialty} • {doc.sub_specialty || 'Critical Care'}</p>
                    <p className="text-[11px] text-slate-400">{doc.qualification || 'MBBS, MD'} ({doc.experience_years || '10+ Yrs Exp'})</p>

                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/80 space-y-2 text-xs mt-3">
                      <div className="flex items-center gap-2 text-slate-300">
                        <FaEnvelope className="text-emerald-400 text-xs" />
                        <span className="font-mono text-[11px] text-white truncate">{doc.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <FaPhone className="text-sky-400 text-xs" />
                        <span>{doc.phone || '+91 9876543299'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <FaHospital className="text-purple-400 text-xs" />
                        <span className="truncate">{doc.hospital || 'CareSync Center'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <FaMapMarkerAlt className="text-amber-400 text-xs" />
                        <span className="truncate">{doc.address || 'Central Medical Complex'}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-xs">
                        <span className="text-slate-400">Password Hint:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-emerald-400 font-mono text-[11px]">
                            {showPasswords[doc.id] ? (doc.default_password || '12345678') : '••••••••'}
                          </strong>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(doc.id)}
                            className="text-slate-400 hover:text-white text-xs"
                          >
                            {showPasswords[doc.id] ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleToggleAttendance(doc.id, doc.attendance_status)}
                      className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2 rounded-xl text-xs font-bold transition-all text-center"
                    >
                      Toggle Attendance Duty Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctors Directory Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <FaStethoscope className="text-emerald-400" />
              <span>Active Doctor Roster & Contact Table</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-extrabold uppercase text-xs">
                  <tr>
                    <th className="p-3">Doctor ID</th>
                    <th className="p-3">Doctor Name</th>
                    <th className="p-3">Specialty</th>
                    <th className="p-3">License No</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Duty Availability</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/80">
                  {doctorsList.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-700/30 transition-all">
                      <td className="p-3 font-mono font-bold text-sky-400">{doc.id}</td>
                      <td className="p-3 font-extrabold text-white">{doc.name}</td>
                      <td className="p-3 text-emerald-400 font-bold">{doc.specialty}</td>
                      <td className="p-3 font-mono text-slate-400">{doc.license_no || 'MCI-2018-88421'}</td>
                      <td className="p-3 text-slate-300">{doc.phone || '+91 9876543299'}</td>
                      <td className="p-3 text-slate-300 truncate max-w-xs">{doc.address || 'Central Complex'}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          doc.attendance_status === 'On Duty' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          doc.attendance_status === 'In Emergency Surgery' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}>
                          {doc.attendance_status === 'On Duty' ? '🟢 ON DUTY' : doc.attendance_status === 'In Emergency Surgery' ? '🚑 SURGERY' : '🔴 OFF DUTY'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleAttendance(doc.id, doc.attendance_status)}
                          className="bg-slate-900 border border-slate-700 hover:border-emerald-400 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        >
                          Toggle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>

        {/* ONBOARD NEW DOCTOR MODAL */}
        <AnimatePresence>
          {showAddDoctorModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-lg font-bold">
                      <FaUserPlus />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-white">Onboard New Doctor Account</h2>
                      <p className="text-xs text-slate-400">Assign Doctor ID, Specialty, and Login Password.</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAddDoctorModal(false)} className="text-slate-400 hover:text-white text-xl">
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleOnboardDoctor} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Doctor Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajiv Kapoor, MD"
                      value={newDoctorForm.name}
                      onChange={(e) => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-medium focus:border-emerald-400 outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Assigned Doctor ID</label>
                      <input
                        type="text"
                        value={newDoctorForm.doctor_id}
                        onChange={(e) => setNewDoctorForm({ ...newDoctorForm, doctor_id: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sky-400 font-mono font-bold focus:border-emerald-400 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Clinical Specialty</label>
                      <select
                        value={newDoctorForm.specialty}
                        onChange={(e) => setNewDoctorForm({ ...newDoctorForm, specialty: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-medium focus:border-emerald-400 outline-none"
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="General Medicine">General Medicine</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Doctor Email</label>
                      <input
                        type="email"
                        placeholder="doctor@caresync.com"
                        value={newDoctorForm.email}
                        onChange={(e) => setNewDoctorForm({ ...newDoctorForm, email: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-medium focus:border-emerald-400 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Initial Login Password</label>
                      <input
                        type="text"
                        value={newDoctorForm.password}
                        onChange={(e) => setNewDoctorForm({ ...newDoctorForm, password: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-emerald-400 font-mono font-bold focus:border-emerald-400 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                    <button
                      type="button"
                      onClick={() => setShowAddDoctorModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold shadow-lg transition-all flex items-center gap-2"
                    >
                      {loading ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
                      <span>Confirm & Register Doctor</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </AdminSidebar>
    </AuthCheck>
  );
}
