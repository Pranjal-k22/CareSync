import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const initial50PatientsList = Array.from({ length: 50 }, (_, i) => {
  const index = i + 1;
  const firstNames = [
    'Rahul', 'Priya', 'Amitabh', 'Sneha', 'Vikram', 'Ananya', 'Suresh', 'Kavita',
    'Rajesh', 'Meenakshi', 'Gaurav', 'Sunita', 'Deepak', 'Fatima', 'Tariq', 'Pooja',
    'Siddharth', 'Anita', 'Ramesh', 'Evelyn', 'Marcus', 'Chloe', 'Benjamin', 'Omar',
    'Karan', 'Aakash', 'Bhavna', 'Chetan', 'Divya', 'Eshwar', 'Farhan', 'Geeta',
    'Harish', 'Isha', 'Jatin', 'Komal', 'Lokesh', 'Manish', 'Neha', 'Omkar',
    'Payal', 'Qasim', 'Ritu', 'Sameer', 'Tanvi', 'Utkarsh', 'Varun', 'Yash', 'Zoya', 'Alok'
  ];

  const lastNames = [
    'Sharma', 'Patel', 'Roy', 'Reddy', 'Mehta', 'Nambiar', 'Kumar', 'Verma',
    'Gupta', 'Sundaram', 'Joshi', 'Singh', 'Chopra', 'Sheikh', 'Hassan', 'Iyer',
    'Rao', 'Nair', 'Deshmukh', 'Taylor', 'Vance', 'Dubois', 'Carter', 'Mansoor',
    'Johar', 'Agarwal', 'Bhasin', 'Chawla', 'Dutt', 'Fernandes', 'Ghosal', 'Hegde',
    'Inamdar', 'Jain', 'Kulkarni', 'Lamba', 'Mahajan', 'Naidu', 'Oza', 'Pillai',
    'Rathore', 'Saxena', 'Trivedi', 'Upadhyay', 'Vyas', 'Walia', 'Yadav', 'Zaidi', 'Bhatt', 'Kapoor'
  ];

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'];
  const doctors = ['Dr. Sarah Johnson, MD', 'Dr. Michael Chen, MD', 'Dr. Emily Rodriguez, MD', 'Dr. James Wilson, MD', 'Dr. Priya Patel, MD', 'Dr. Ananya Roy, MD'];
  const conditions = ['Cardiology Follow-up', 'Routine General Checkup', 'Neurology Consultation', 'Orthopedic Rehabilitation', 'Dermatology Care', 'Pediatric Wellness'];
  const statuses = ['Admitted', 'Outpatient', 'Scheduled Consultation', 'Discharged'];

  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const age = 22 + (i * 3) % 55;
  const gender = i % 2 === 0 ? 'Male' : 'Female';
  const heightVal = 155 + (i * 4) % 35;
  const weightVal = 55 + (i * 5) % 40;

  return {
    id: `PAT-10${index.toString().padStart(2, '0')}`,
    uid: `PAT-10${index.toString().padStart(2, '0')}`,
    firstName: fn,
    middleName: 'K.',
    lastName: ln,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}${index}@example.com`,
    phone: `+91 987${(1000000 + index * 12345).toString().slice(0, 7)}`,
    number: `+91 987${(1000000 + index * 12345).toString().slice(0, 7)}`,
    city: cities[i % cities.length],
    address: `${cities[i % cities.length]}, India`,
    aadhar: `4521-${(1000 + index * 11).toString()}-${(2000 + index * 22).toString()}`,
    age: age,
    gender: gender,
    maritalStatus: i % 3 === 0 ? 'Married' : 'Single',
    bloodGroup: bloodGroups[i % bloodGroups.length],
    height: `${heightVal} cm`,
    weight: `${weightVal} kg`,
    previousHospitalization: 'Deenanath Mangeshkar Hospital - Pune',
    hospitalizationDate: '24 Jan 2023',
    diabetesStatus: i % 5 === 0 ? 'YES' : 'NO',
    cardiacHistory: i % 7 === 0 ? 'YES' : 'NO',
    surgicalHistory: i % 4 === 0 ? 'YES' : 'NO',
    fallIncidence: 'NO',
    neurologicalHistory: 'NO',
    chronicRespiratory: 'NO',
    familyGeneticRisk: i % 6 === 0 ? 'MODERATE RISK' : 'LOW RISK',
    allergiesRecorded: i % 8 === 0 ? 'Penicillin Allergy' : 'NONE REPORTED',
    immunizationStatus: 'UP TO DATE (VERIFIED)',
    assignedDoctor: doctors[i % doctors.length],
    condition: conditions[i % conditions.length],
    status: statuses[i % statuses.length],
    role: 'patient',
    created_at: new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
  };
});

export const addPatientRecord = (newPatientObj) => {
  initial50PatientsList.unshift(newPatientObj);
};

export const updatePatientRecord = (patientId, updatedFields) => {
  const index = initial50PatientsList.findIndex(p => p.id === patientId || p.uid === patientId);
  if (index !== -1) {
    initial50PatientsList[index] = { ...initial50PatientsList[index], ...updatedFields };
  }
};

export default function FetchPatients() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState(initial50PatientsList);

  useEffect(() => {
    let isSubscribed = true;

    const loadPatients = async () => {
      setLoading(true);
      if (!isSupabaseConfigured) {
        if (isSubscribed) {
          setPatients(initial50PatientsList);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'patient')
          .order('created_at', { ascending: false });

        if (err) throw err;
        if (isSubscribed) {
          if (data && data.length > 0) {
            const formatted = data.map((p, idx) => ({
              ...p,
              id: p.id || `PAT-10${(idx + 1).toString().padStart(2, '0')}`,
              firstName: p.name ? p.name.split(' ')[0] : 'Patient',
              lastName: p.name && p.name.split(' ').length > 1 ? p.name.split(' ').slice(1).join(' ') : `#${idx + 1}`,
              name: p.name || 'Patient',
              city: p.hospital || 'Central Tower',
              number: p.phone || '+91 9876543210',
              aadhar: `4521-8899-${idx + 1000}`,
              age: p.age || 35,
              gender: p.gender || 'Male',
              bloodGroup: p.bloodGroup || 'O+',
              height: p.height || '175 cm',
              weight: p.weight || '72 kg',
              familyGeneticRisk: p.familyGeneticRisk || 'LOW RISK',
              allergiesRecorded: p.allergiesRecorded || 'NONE REPORTED',
              immunizationStatus: p.immunizationStatus || 'UP TO DATE (VERIFIED)',
              assignedDoctor: p.assignedDoctor || 'Dr. Sarah Johnson, MD',
              condition: p.condition || 'General Medicine',
              status: p.status || 'Outpatient'
            }));

            const dbNames = new Set(formatted.map(item => item.name.toLowerCase()));
            const fallbackUniques = initial50PatientsList.filter(item => !dbNames.has(item.name.toLowerCase()));
            setPatients([...formatted, ...fallbackUniques]);
          } else {
            setPatients(initial50PatientsList);
          }
        }
      } catch (err) {
        console.warn('Supabase fetchPatients error:', err);
        if (isSubscribed) {
          setPatients(initial50PatientsList);
          setError(err.message);
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    loadPatients();

    return () => {
      isSubscribed = false;
    };
  }, []);

  return { loading, error, patients, setPatients };
}