import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const initialDoctorsList = [
  {
    id: 'doc-1',
    uid: 'doc-1',
    name: 'Dr. Sarah Johnson, MD',
    specialty: 'Cardiology',
    speciality: 'Cardiology',
    email: 'sarah.johnson@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543210',
    hospital: 'Stanford Health Care',
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '09:00 AM - 05:00 PM',
    fee: '₹500',
    role: 'doctor'
  },
  {
    id: 'doc-2',
    uid: 'doc-2',
    name: 'Dr. Michael Chen, MD',
    specialty: 'Neurology',
    speciality: 'Neurology',
    email: 'michael.chen@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543211',
    hospital: 'Johns Hopkins Hospital',
    avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '10:00 AM - 06:00 PM',
    fee: '₹600',
    role: 'doctor'
  },
  {
    id: 'doc-3',
    uid: 'doc-3',
    name: 'Dr. Emily Rodriguez, MD',
    specialty: 'Pediatrics',
    speciality: 'Pediatrics',
    email: 'emily.rodriguez@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543212',
    hospital: "Boston Children's Hospital",
    avatar_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '08:30 AM - 04:30 PM',
    fee: '₹450',
    role: 'doctor'
  },
  {
    id: 'doc-4',
    uid: 'doc-4',
    name: 'Dr. James Wilson, MD',
    specialty: 'Orthopedics',
    speciality: 'Orthopedics',
    email: 'james.wilson@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543213',
    hospital: 'Mayo Clinic Network',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    is_available_today: false,
    schedule_hours: '09:00 AM - 02:00 PM',
    fee: '₹700',
    role: 'doctor'
  },
  {
    id: 'doc-5',
    uid: 'doc-5',
    name: 'Dr. Priya Patel, MD',
    specialty: 'Dermatology',
    speciality: 'Dermatology',
    email: 'priya.patel@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543214',
    hospital: 'Mount Sinai Hospital',
    avatar_url: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '09:00 AM - 05:00 PM',
    fee: '₹550',
    role: 'doctor'
  },
  {
    id: 'doc-6',
    uid: 'doc-6',
    name: 'Dr. Robert Sterling, MD',
    specialty: 'General Medicine',
    speciality: 'General Medicine',
    email: 'robert.sterling@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543215',
    hospital: 'Cleveland Clinic Main Campus',
    avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '08:00 AM - 04:00 PM',
    fee: '₹400',
    role: 'doctor'
  },
  {
    id: 'doc-7',
    uid: 'doc-7',
    name: 'Dr. Lisa Ray, MD',
    specialty: 'Oncology',
    speciality: 'Oncology',
    email: 'lisa.ray@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543216',
    hospital: 'Memorial Sloan Kettering',
    avatar_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '10:00 AM - 05:00 PM',
    fee: '₹800',
    role: 'doctor'
  },
  {
    id: 'doc-8',
    uid: 'doc-8',
    name: 'Dr. Ananya Roy, MD',
    specialty: 'Cardiology',
    speciality: 'Cardiology',
    email: 'ananya.roy@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543217',
    hospital: 'HealConnect Central Tower',
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '09:00 AM - 05:00 PM',
    fee: '₹500',
    role: 'doctor'
  },
  {
    id: 'doc-9',
    uid: 'doc-9',
    name: 'Dr. Rajesh Sharma, MD',
    specialty: 'Neurology',
    speciality: 'Neurology',
    email: 'rajesh.sharma@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543218',
    hospital: 'AIIMS Medical Super Specialty',
    avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '11:00 AM - 07:00 PM',
    fee: '₹650',
    role: 'doctor'
  },
  {
    id: 'doc-10',
    uid: 'doc-10',
    name: 'Dr. David Kim, MD',
    specialty: 'Orthopedics',
    speciality: 'Orthopedics',
    email: 'david.kim@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543219',
    hospital: 'Cedars-Sinai Medical Center',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '09:00 AM - 04:00 PM',
    fee: '₹600',
    role: 'doctor'
  },
  {
    id: 'doc-11',
    uid: 'doc-11',
    name: 'Dr. Sophia Martinez, MD',
    specialty: 'Pediatrics',
    speciality: 'Pediatrics',
    email: 'sophia.martinez@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543220',
    hospital: 'Texas Childrens Hospital',
    avatar_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '08:30 AM - 04:00 PM',
    fee: '₹450',
    role: 'doctor'
  },
  {
    id: 'doc-12',
    uid: 'doc-12',
    name: 'Dr. Vikramaditya Gupta, MD',
    specialty: 'Cardiology',
    speciality: 'Cardiology',
    email: 'vikram.gupta@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543221',
    hospital: 'Fortis Escorts Heart Institute',
    avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '09:00 AM - 06:00 PM',
    fee: '₹750',
    role: 'doctor'
  },
  {
    id: 'doc-13',
    uid: 'doc-13',
    name: 'Dr. Marcus Vance, MD',
    specialty: 'Dermatology',
    speciality: 'Dermatology',
    email: 'marcus.vance@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543222',
    hospital: 'UCSF Medical Center',
    avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    is_available_today: false,
    schedule_hours: '10:00 AM - 04:00 PM',
    fee: '₹500',
    role: 'doctor'
  },
  {
    id: 'doc-14',
    uid: 'doc-14',
    name: 'Dr. Meera Nambiar, MD',
    specialty: 'General Medicine',
    speciality: 'General Medicine',
    email: 'meera.nambiar@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543223',
    hospital: 'Apollo Hospitals Central',
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '08:00 AM - 05:00 PM',
    fee: '₹400',
    role: 'doctor'
  },
  {
    id: 'doc-15',
    uid: 'doc-15',
    name: 'Dr. Daniel Foster, MD',
    specialty: 'Oncology',
    speciality: 'Oncology',
    email: 'daniel.foster@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543224',
    hospital: 'MD Anderson Cancer Center',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '09:00 AM - 05:00 PM',
    fee: '₹850',
    role: 'doctor'
  },
  {
    id: 'doc-16',
    uid: 'doc-16',
    name: 'Dr. Kavita Verma, MD',
    specialty: 'Pediatrics',
    speciality: 'Pediatrics',
    email: 'kavita.verma@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543225',
    hospital: 'Max Super Specialty Hospital',
    avatar_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '09:30 AM - 05:30 PM',
    fee: '₹500',
    role: 'doctor'
  },
  {
    id: 'doc-17',
    uid: 'doc-17',
    name: 'Dr. Jonathan Blake, MD',
    specialty: 'Neurology',
    speciality: 'Neurology',
    email: 'jonathan.blake@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543226',
    hospital: 'Northwestern Memorial Hospital',
    avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '10:00 AM - 06:00 PM',
    fee: '₹650',
    role: 'doctor'
  },
  {
    id: 'doc-18',
    uid: 'doc-18',
    name: 'Dr. Chloe Dubois, MD',
    specialty: 'General Medicine',
    speciality: 'General Medicine',
    email: 'chloe.dubois@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543227',
    hospital: 'NYU Langone Health',
    avatar_url: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '08:30 AM - 04:30 PM',
    fee: '₹450',
    role: 'doctor'
  },
  {
    id: 'doc-19',
    uid: 'doc-19',
    name: 'Dr. Benjamin Carter, MD',
    specialty: 'Cardiology',
    speciality: 'Cardiology',
    email: 'benjamin.carter@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543228',
    hospital: 'Duke University Health System',
    avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '09:00 AM - 05:00 PM',
    fee: '₹700',
    role: 'doctor'
  },
  {
    id: 'doc-20',
    uid: 'doc-20',
    name: 'Dr. Omar Al-Mansoor, MD',
    specialty: 'Orthopedics',
    speciality: 'Orthopedics',
    email: 'omar.mansoor@caresync.com',
    doctor_password_hint: 'doc12345',
    phone: '+91 9876543229',
    hospital: 'Barnes-Jewish Hospital',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    is_available_today: true,
    schedule_hours: '10:00 AM - 06:00 PM',
    fee: '₹600',
    role: 'doctor'
  }
];

export default function FetchDoctors() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState(initialDoctorsList);

  useEffect(() => {
    let isSubscribed = true;

    const loadDoctors = async () => {
      setLoading(true);
      if (!isSupabaseConfigured) {
        if (isSubscribed) {
          setDoctors(initialDoctorsList);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'doctor')
          .order('created_at', { ascending: false });

        if (err) throw err;
        if (isSubscribed) {
          if (data && data.length > 0) {
            const formatted = data.map(d => ({
              ...d,
              uid: d.id,
              speciality: d.specialty || d.speciality || 'General Medicine',
              img: d.avatar_url || d.img || '/Logo.svg',
              is_available_today: d.is_available_today !== undefined ? d.is_available_today : true,
              schedule_hours: d.schedule_hours || '09:00 AM - 05:00 PM'
            }));
            
            // Merge with initial list to ensure full 20 doctors are present
            const dbNames = new Set(formatted.map(d => d.name.toLowerCase()));
            const defaults = initialDoctorsList.filter(d => !dbNames.has(d.name.toLowerCase()));
            setDoctors([...formatted, ...defaults]);
          } else {
            setDoctors(initialDoctorsList);
          }
        }
      } catch (err) {
        console.warn('Supabase fetchDoctors error:', err);
        if (isSubscribed) {
          setDoctors(initialDoctorsList);
          setError(err.message);
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    loadDoctors();
    return () => {
      isSubscribed = false;
    };
  }, []);

  return { doctors, loading, error, setDoctors };
}
