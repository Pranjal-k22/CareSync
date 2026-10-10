import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FaDotCircle, FaSpinner, FaUserPlus, FaRulerVertical, FaWeight, FaNotesMedical, FaDna, FaSyringe, FaExclamationTriangle } from 'react-icons/fa';
import dynamic from "next/dynamic";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { addPatientRecord } from "@/lib/fetchPatients";

const AuthCheck = dynamic(() => import("@components/Auth/AuthCheck"), { ssr: false });
const DoctorSidebar = dynamic(() => import("@components/Sidebar/DoctorSidebar"), { ssr: false });

export default function DoctorAddPatientPage() {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [age, setAge] = useState('22');
  const [gender, setGender] = useState('Male');
  const [blood, setBlood] = useState('A+');
  const [height, setHeight] = useState('175 cm');
  const [weight, setWeight] = useState('72 kg');
  const [address, setAddress] = useState('Mumbai');
  const [number, setNumber] = useState('');
  
  // Additional Medical & Family History
  const [familyGeneticRisk, setFamilyGeneticRisk] = useState('LOW RISK');
  const [allergiesRecorded, setAllergiesRecorded] = useState('NONE REPORTED');
  const [immunizationStatus, setImmunizationStatus] = useState('UP TO DATE (VERIFIED)');

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addPatient = async (e) => {
    e.preventDefault();

    if (!first || !number) {
      toast.error('First Name and Mobile Phone are required!');
      return;
    }

    setLoading(true);
    const newPatId = `PAT-${Math.floor(1051 + Math.random() * 900)}`;
    const fullName = `${first.trim()} ${last.trim()}`.trim();

    const newPatientObj = {
      id: newPatId,
      uid: newPatId,
      firstName: first.trim(),
      middleName: 'K.',
      lastName: last.trim() || 'Patient',
      name: fullName,
      email: `${number.trim()}@patient.healconnect.io`,
      phone: `+91 ${number.trim()}`,
      number: `+91 ${number.trim()}`,
      city: address.trim() || 'Mumbai',
      address: address.trim() || 'Mumbai',
      age: Number(age) || 22,
      gender: gender,
      bloodGroup: blood,
      height: height.trim() || '175 cm',
      weight: weight.trim() || '72 kg',
      familyGeneticRisk: familyGeneticRisk,
      allergiesRecorded: allergiesRecorded.trim() || 'NONE REPORTED',
      immunizationStatus: immunizationStatus,
      status: 'Outpatient',
      role: 'patient',
      created_at: new Date().toISOString().split('T')[0]
    };

    try {
      addPatientRecord(newPatientObj);

      if (isSupabaseConfigured) {
        await supabase.from('profiles').upsert({
          id: newPatId,
          name: fullName,
          email: `${number.trim()}@patient.healconnect.io`,
          role: 'patient',
          phone: `+91 ${number.trim()}`,
          hospital: address.trim() || 'Mumbai',
          age: Number(age) || 22,
          gender: gender,
          bloodGroup: blood,
          height: height.trim() || '175 cm',
          weight: weight.trim() || '72 kg',
          familyGeneticRisk: familyGeneticRisk,
          allergiesRecorded: allergiesRecorded.trim() || 'NONE REPORTED',
          immunizationStatus: immunizationStatus
        });
      }

      toast.success(`✅ Patient ${fullName} Onboarded Successfully!`);
      router.push('/doctor/patients');
    } catch (err) {
      toast.error(err.message || 'Error registering patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCheck requiredRole="doctor">
      <DoctorSidebar>
        <div className="p-4 sm:p-6 space-y-6 font-sans">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FaUserPlus className="text-emerald-400" />
            <span>Doctor Portal: Add New Patient File</span>
          </h1>

          <form onSubmit={addPatient} className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-xl space-y-6 max-w-3xl">
            {/* Master Demographics */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider border-b border-slate-700 pb-2">
                1. Patient Master Demographics
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                    placeholder="e.g. Rahul"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                    placeholder="e.g. Sharma"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="9871012345"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="22"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <FaRulerVertical className="text-blue-400" /> Height (e.g. 175 cm)
                  </label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175 cm"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <FaWeight className="text-indigo-400" /> Weight (e.g. 72 kg)
                  </label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="72 kg"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Additional Medical & Family History */}
            <div className="space-y-4 pt-2 border-t border-slate-700">
              <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-1.5">
                <FaNotesMedical /> 2. Additional Medical & Family History
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <FaDna className="text-indigo-400" /> Family Genetic Risk Factor
                  </label>
                  <select
                    value={familyGeneticRisk}
                    onChange={(e) => setFamilyGeneticRisk(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold"
                  >
                    <option value="LOW RISK">LOW RISK</option>
                    <option value="MODERATE RISK">MODERATE RISK</option>
                    <option value="HIGH RISK">HIGH RISK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <FaExclamationTriangle className="text-amber-400" /> Allergies Recorded
                  </label>
                  <input
                    type="text"
                    value={allergiesRecorded}
                    onChange={(e) => setAllergiesRecorded(e.target.value)}
                    placeholder="NONE REPORTED"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <FaSyringe className="text-teal-400" /> Immunization Status
                  </label>
                  <select
                    value={immunizationStatus}
                    onChange={(e) => setImmunizationStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold"
                  >
                    <option value="UP TO DATE (VERIFIED)">UP TO DATE (VERIFIED)</option>
                    <option value="PENDING VACCINATION">PENDING VACCINATION</option>
                    <option value="PARTIALLY IMMUNIZED">PARTIALLY IMMUNIZED</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
              <span>Onboard Patient Record</span>
            </button>
          </form>
        </div>
      </DoctorSidebar>
    </AuthCheck>
  );
}