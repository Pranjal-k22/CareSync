import React, { useState, useEffect } from "react";
import { PatientDetails, PatientMedicalHistory, PatientOtherHistory } from "@components/PatientComponents/PatientDetails";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { initial50PatientsList, updatePatientRecord } from "@/lib/fetchPatients";

export default function ViewPatient({ patientID }) {
  const [profile, setProfile] = useState({
    id: patientID || "PAT-1001",
    firstName: "Rahul",
    middleName: "K.",
    lastName: "Sharma",
    name: "Rahul K. Sharma",
    gender: "Male",
    age: "22",
    maritalStatus: "Single",
    bloodGroup: "A+",
    height: "175 cm",
    weight: "72 kg",
    number: "+91 9871012345",
    phone: "+91 9871012345",
    address: "Mumbai",
    city: "Mumbai",
    previousHospitalization: "Deenanath Mangeshkar Hospital - Pune",
    hospitalizationDate: "24 Jan 2023",
    diabetesStatus: "NO",
    cardiacHistory: "NO",
    surgicalHistory: "NO",
    fallIncidence: "NO",
    neurologicalHistory: "NO",
    chronicRespiratory: "NO",
    familyGeneticRisk: "LOW RISK",
    allergiesRecorded: "NONE REPORTED",
    immunizationStatus: "UP TO DATE (VERIFIED)",
    avatar_url: "👤"
  });

  useEffect(() => {
    let isSubscribed = true;

    // 1. Check in 50 patients dataset first
    const matched = initial50PatientsList.find(p => p.id === patientID || p.uid === patientID);
    if (matched && isSubscribed) {
      setProfile(prev => ({
        ...prev,
        ...matched,
        id: matched.id || patientID,
        name: matched.name || `${matched.firstName || ''} ${matched.lastName || ''}`.trim(),
        gender: matched.gender || prev.gender,
        age: String(matched.age || prev.age),
        maritalStatus: matched.maritalStatus || prev.maritalStatus,
        bloodGroup: matched.bloodGroup || prev.bloodGroup,
        height: matched.height || prev.height,
        weight: matched.weight || prev.weight,
        number: matched.phone || matched.number || prev.number,
        address: matched.address || matched.city || prev.address,
        previousHospitalization: matched.previousHospitalization || prev.previousHospitalization,
        hospitalizationDate: matched.hospitalizationDate || prev.hospitalizationDate,
        familyGeneticRisk: matched.familyGeneticRisk || prev.familyGeneticRisk,
        allergiesRecorded: matched.allergiesRecorded || prev.allergiesRecorded,
        immunizationStatus: matched.immunizationStatus || prev.immunizationStatus,
        avatar_url: matched.avatar_url || prev.avatar_url
      }));
    }

    // 2. Fetch from Supabase PostgreSQL if available
    if (!isSupabaseConfigured || !patientID) return;

    const fetchPatientData = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", patientID)
          .single();

        if (data && isSubscribed) {
          setProfile(prev => ({
            ...prev,
            name: data.name || prev.name,
            number: data.phone || prev.number,
            address: data.hospital || prev.address,
            avatar_url: data.avatar_url || prev.avatar_url
          }));
        }
      } catch (e) {
        console.warn("ViewPatient fetch error:", e);
      }
    };

    fetchPatientData();

    return () => {
      isSubscribed = false;
    };
  }, [patientID]);

  const handleUpdatePatient = (updatedFields) => {
    setProfile(prev => {
      const next = { ...prev, ...updatedFields };
      updatePatientRecord(prev.id, next);

      if (isSupabaseConfigured) {
        supabase.from("profiles").upsert({
          id: prev.id,
          name: next.name,
          phone: next.phone || next.number,
          hospital: next.address,
          avatar_url: next.avatar_url
        }).then(() => {}).catch(() => {});
      }

      return next;
    });
  };

  return (
    <div className="text-slate-300 font-sans space-y-6">
      <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
        <div className="lg:w-2/3 w-full">
          <PatientDetails
            patient={profile}
            onUpdatePatient={handleUpdatePatient}
          />
        </div>
        <div className="lg:w-1/3 w-full flex flex-col gap-6">
          <PatientMedicalHistory patient={profile} />
          <PatientOtherHistory patient={profile} />
        </div>
      </div>
    </div>
  );
}