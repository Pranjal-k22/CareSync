import React, { useState } from "react";
import { FaUser, FaPhone, FaMapMarkerAlt, FaHeartbeat, FaRulerVertical, FaWeight, FaHospital, FaNotesMedical, FaCheckCircle, FaExclamationCircle, FaEdit, FaTimes, FaSave, FaDna, FaSyringe, FaExclamationTriangle } from "react-icons/fa";
import toast from "react-hot-toast";

export function PatientDetails({ patient, onUpdatePatient }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: patient?.name || "Rahul K. Sharma",
    gender: patient?.gender || "Male",
    age: patient?.age || "22",
    maritalStatus: patient?.maritalStatus || "Single",
    bloodGroup: patient?.bloodGroup || "A+",
    height: patient?.height || "175 cm",
    weight: patient?.weight || "72 kg",
    phone: patient?.phone || patient?.number || "+91 9871012345",
    address: patient?.address || patient?.city || "Mumbai",
    previousHospitalization: patient?.previousHospitalization || "Deenanath Mangeshkar Hospital - Pune",
    hospitalizationDate: patient?.hospitalizationDate || "24 Jan 2023",
    avatar_url: patient?.avatar_url || "👤"
  });

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (onUpdatePatient) {
      onUpdatePatient(editForm);
    }
    setIsEditOpen(false);
    toast.success("Patient master demographics updated!");
  };

  const p = patient || {};
  const displayName = p.name || `${p.firstName || 'Rahul'} ${p.lastName || 'Sharma'}`;

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <FaUser className="text-emerald-400" />
          <span>Patient Master Demographics</span>
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditForm({
                name: displayName,
                gender: p.gender || "Male",
                age: p.age || "22",
                maritalStatus: p.maritalStatus || "Single",
                bloodGroup: p.bloodGroup || "A+",
                height: p.height || "175 cm",
                weight: p.weight || "72 kg",
                phone: p.phone || p.number || "+91 9871012345",
                address: p.address || p.city || "Mumbai",
                previousHospitalization: p.previousHospitalization || "Deenanath Mangeshkar Hospital - Pune",
                hospitalizationDate: p.hospitalizationDate || "24 Jan 2023",
                avatar_url: p.avatar_url || "👤"
              });
              setIsEditOpen(true);
            }}
            className="bg-slate-700 hover:bg-slate-600 text-amber-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-600 transition-colors"
          >
            <FaEdit /> <span>Edit Demographics</span>
          </button>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            ACTIVE PATIENT FILE
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Patient Avatar */}
        <div className="relative group flex-shrink-0">
          {p.avatar_url && (p.avatar_url.startsWith('data:') || p.avatar_url.startsWith('http')) ? (
            <img
              src={p.avatar_url}
              alt={displayName}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-emerald-400/80 shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400/80 shadow-xl flex items-center justify-center text-4xl font-black">
              {p.avatar_url || (displayName ? displayName.charAt(0).toUpperCase() : 'P')}
            </div>
          )}
        </div>

        {/* Core Attributes */}
        <div className="flex-1 space-y-4 w-full text-center md:text-left">
          <div>
            <h3 className="text-2xl font-black text-white">{displayName}</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center md:justify-start gap-2">
              <span className="bg-slate-900 text-emerald-400 px-2.5 py-1 rounded-lg font-mono font-bold border border-slate-700">
                {p.id || p.uid || 'PAT-1001'}
              </span>
              <span>• Registered Clinical Outpatient</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase block text-[10px]">Gender</span>
              <span className="text-white font-extrabold text-sm block mt-0.5">{p.gender || 'Male'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase block text-[10px]">Age</span>
              <span className="text-white font-extrabold text-sm block mt-0.5">{p.age || '22'} Years</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase block text-[10px]">Marital Status</span>
              <span className="text-white font-extrabold text-sm block mt-0.5">{p.maritalStatus || p.marital || 'Single'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase block text-[10px]">Blood Group</span>
              <span className="text-teal-400 font-black text-sm block mt-0.5 font-mono">{p.bloodGroup || p.blood || 'A+'}</span>
            </div>
          </div>

          {/* Height and Weight Cards */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-lg">
                <FaRulerVertical />
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Height</span>
                <span className="text-white font-extrabold text-base">{p.height || '175 cm'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-lg">
                <FaWeight />
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Weight</span>
                <span className="text-white font-extrabold text-base">{p.weight || '72 kg'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-700/80" />

      {/* Contact & Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
            <FaPhone className="text-emerald-400" /> Contact Phone
          </span>
          <p className="text-white font-extrabold font-mono text-sm">{p.phone || p.number || '+91 9871012345'}</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 space-y-1">
          <span className="text-slate-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-rose-400" /> Medical Ward / Address
          </span>
          <p className="text-slate-200 font-semibold">{p.address || p.city || 'Mumbai'}</p>
        </div>
      </div>

      {/* Previous Hospitalization History */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <FaHospital className="text-amber-400 text-2xl flex-shrink-0" />
          <div>
            <span className="text-slate-400 font-bold uppercase text-[11px] block">Previous Hospitalization Record</span>
            <span className="text-white font-extrabold">{p.previousHospitalization || 'Deenanath Mangeshkar Hospital - Pune'}</span>
          </div>
        </div>
        <span className="bg-amber-500/20 text-amber-300 font-mono text-xs px-3 py-1 rounded-xl border border-amber-500/40 font-bold whitespace-nowrap">
          {p.hospitalizationDate || '24 Jan 2023'}
        </span>
      </div>

      {/* MODAL FORM FOR EDITING MASTER DEMOGRAPHICS */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 text-white font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <FaEdit className="text-amber-400" /> Edit Patient Demographics
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white">
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Marital Status</label>
                  <select
                    value={editForm.maritalStatus}
                    onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Height (e.g. 175 cm)</label>
                  <input
                    type="text"
                    value={editForm.height}
                    onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Weight (e.g. 72 kg)</label>
                  <input
                    type="text"
                    value={editForm.weight}
                    onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Medical Ward / Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Previous Hospitalization Record</label>
                <input
                  type="text"
                  value={editForm.previousHospitalization}
                  onChange={(e) => setEditForm({ ...editForm, previousHospitalization: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5"
                >
                  <FaSave /> Save Demographics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function PatientMedicalHistory({ patient, onUpdateHistory }) {
  const p = patient || {};
  const historyItems = [
    { label: "Diabetes Status", value: p.diabetesStatus || "NO" },
    { label: "Cardiac History", value: p.cardiacHistory || "NO" },
    { label: "Surgical History", value: p.surgicalHistory || "NO" },
    { label: "Fall Incidence", value: p.fallIncidence || "NO" },
    { label: "Neurological History", value: p.neurologicalHistory || "NO" },
    { label: "Chronic Respiratory", value: p.chronicRespiratory || "NO" },
  ];

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
      <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
        <FaNotesMedical className="text-blue-400" />
        <span>Clinical Medical History</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {historyItems.map((item, idx) => (
          <div key={idx} className="bg-slate-900 p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between">
            <span className="text-slate-300 font-semibold">{item.label}</span>
            <span className={`px-2.5 py-0.5 rounded-full font-black text-[11px] border flex items-center gap-1 ${
              item.value === 'YES' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              <FaCheckCircle className={item.value === 'YES' ? 'text-rose-400' : 'text-emerald-400'} /> {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PatientOtherHistory({ patient }) {
  const p = patient || {};
  const familyRisk = p.familyGeneticRisk || "LOW RISK";
  const allergies = p.allergiesRecorded || "NONE REPORTED";
  const immunization = p.immunizationStatus || "UP TO DATE (VERIFIED)";

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
      <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
        <FaNotesMedical className="text-indigo-400" />
        <span>Additional Medical & Family History</span>
      </h3>

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700/80 text-xs space-y-3">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5"><FaDna className="text-indigo-400" /> Family Genetic Risk Factor:</span>
          <span className={`font-black px-2.5 py-0.5 rounded-full text-[11px] border ${
            familyRisk === 'HIGH RISK' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
            familyRisk === 'MODERATE RISK' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
            'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
          }`}>{familyRisk}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-2">
          <span className="flex items-center gap-1.5"><FaExclamationTriangle className="text-amber-400" /> Allergies Recorded:</span>
          <span className="text-slate-300 font-bold uppercase bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{allergies}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-2">
          <span className="flex items-center gap-1.5"><FaSyringe className="text-teal-400" /> Immunization Status:</span>
          <span className="text-teal-300 font-extrabold uppercase bg-teal-500/20 px-2.5 py-0.5 rounded-full border border-teal-500/40">{immunization}</span>
        </div>
      </div>
    </div>
  );
}