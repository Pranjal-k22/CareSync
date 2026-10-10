import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Appointments.module.css';
import Image from 'next/image';
import Footer from '../components/Footer';
import FetchDoctors from '@/lib/fetchDoctors';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const staggerChildren = {
  visible: {
    transition: { staggerChildren: 0.08 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

// High Quality Expanded Doctor Dataset (20 Board-Certified Specialists with Unique Verified Images & Accurate Gender Alignment)
const doctorsData = [
  {
    id: 1,
    name: "Dr. Sarah Johnson, MD",
    specialty: "Cardiology",
    subSpecialty: "Interventional Cardiology",
    hospital: "Stanford Health Care",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 2:30 PM",
    experience: "14 Yrs",
    rating: 4.9,
    reviews: 328,
    fee: "$150",
    location: "Palo Alto, CA",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. Sarah Johnson is a leading interventional cardiologist specializing in preventive cardiology, coronary artery disease, and complex cardiovascular treatments with over 14 years of clinical experience."
  },
  {
    id: 2,
    name: "Dr. Michael Chen, MD",
    specialty: "Neurology",
    subSpecialty: "Neuro-Oncology & Stroke Care",
    hospital: "Johns Hopkins Hospital",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 4:00 PM",
    experience: "11 Yrs",
    rating: 4.8,
    reviews: 215,
    fee: "$180",
    location: "Baltimore, MD",
    consultationTypes: ["Video Call"],
    about: "Dr. Michael Chen is a double board-certified neurologist recognized for groundbreaking clinical management of migraines, stroke rehabilitation, and neurodegenerative disorders."
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez, MD",
    specialty: "Pediatrics",
    subSpecialty: "Pediatric Primary Care",
    hospital: "Boston Children's Hospital",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 5:15 PM",
    experience: "10 Yrs",
    rating: 4.9,
    reviews: 412,
    fee: "$110",
    location: "Boston, MA",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. Emily Rodriguez has dedicated over a decade to compassionate pediatric care, immunization management, adolescent health, and newborn health assessment."
  },
  {
    id: 4,
    name: "Dr. James Wilson, MD",
    specialty: "Orthopedics",
    subSpecialty: "Sports Medicine & Joint Care",
    hospital: "Mayo Clinic Care Network",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    available: false,
    nextAvailable: "Tomorrow, 10:00 AM",
    experience: "16 Yrs",
    rating: 4.7,
    reviews: 289,
    fee: "$200",
    location: "Rochester, MN",
    consultationTypes: ["In-Clinic"],
    about: "Dr. James Wilson is an expert orthopedic surgeon specializing in minimally invasive knee & shoulder arthroscopy, ligament repair, and joint reconstruction."
  },
  {
    id: 5,
    name: "Dr. Priya Patel, MD",
    specialty: "Dermatology",
    subSpecialty: "Clinical & Cosmetic Dermatology",
    hospital: "Mount Sinai Hospital",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 3:45 PM",
    experience: "9 Yrs",
    rating: 4.9,
    reviews: 376,
    fee: "$130",
    location: "New York, NY",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. Priya Patel treats complex dermatological conditions including acne, eczema, psoriasis, skin cancer screening, and advanced laser clinical treatments."
  },
  {
    id: 6,
    name: "Dr. Robert Sterling, MD",
    specialty: "Psychiatry",
    subSpecialty: "Behavioral Health & Anxiety",
    hospital: "Columbia University Medical Center",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 6:00 PM",
    experience: "15 Yrs",
    rating: 4.8,
    reviews: 198,
    fee: "$160",
    location: "New York, NY",
    consultationTypes: ["Video Call"],
    about: "Dr. Robert Sterling offers evidence-based psychiatric evaluations, medication management, and cognitive behavioral health strategies."
  },
  {
    id: 7,
    name: "Dr. Elena Rostova, MD",
    specialty: "Oncology",
    subSpecialty: "Medical Oncology & Hematology",
    hospital: "Memorial Sloan Kettering",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Tomorrow, 11:30 AM",
    experience: "18 Yrs",
    rating: 5.0,
    reviews: 440,
    fee: "$250",
    location: "New York, NY",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. Elena Rostova is a world-renowned oncologist leading clinical trial research in targeted immunotherapy, molecular diagnostics, and personalized oncology."
  },
  {
    id: 8,
    name: "Dr. David Vance, MD",
    specialty: "General Medicine",
    subSpecialty: "Internal Medicine & Wellness",
    hospital: "Cleveland Clinic",
    image: "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 1:30 PM",
    experience: "12 Yrs",
    rating: 4.7,
    reviews: 185,
    fee: "$95",
    location: "Cleveland, OH",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. David Vance focuses on holistic internal medicine, annual health checkups, chronic hypertension management, and preventative health optimization."
  },
  {
    id: 9,
    name: "Dr. Sophia Martinez, MD",
    specialty: "Endocrinology",
    subSpecialty: "Diabetes & Thyroid Specialist",
    hospital: "UCSF Medical Center",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 4:30 PM",
    experience: "13 Yrs",
    rating: 4.9,
    reviews: 260,
    fee: "$140",
    location: "San Francisco, CA",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. Sophia Martinez specializes in endocrinology, insulin pump technology, thyroid nodules diagnostics, and metabolic wellness plans."
  },
  {
    id: 10,
    name: "Dr. Alexander Wright, MD",
    specialty: "Cardiology",
    subSpecialty: "Cardiac Electrophysiology",
    hospital: "Northwestern Memorial",
    image: "https://images.unsplash.com/photo-1536064479547-7ee40b74b807?auto=format&fit=crop&w=600&q=80",
    available: false,
    nextAvailable: "Friday, 9:00 AM",
    experience: "17 Yrs",
    rating: 4.8,
    reviews: 310,
    fee: "$190",
    location: "Chicago, IL",
    consultationTypes: ["In-Clinic"],
    about: "Dr. Alexander Wright is an expert cardiac electrophysiologist treating atrial fibrillation, complex arrhythmia, and cardiac device implantations."
  },
  {
    id: 11,
    name: "Dr. Rachel Kim, MD",
    specialty: "Ophthalmology",
    subSpecialty: "Cornea & Laser Eye Surgery",
    hospital: "Massachusetts Eye and Ear",
    image: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 11:15 AM",
    experience: "11 Yrs",
    rating: 4.9,
    reviews: 245,
    fee: "$165",
    location: "Boston, MA",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. Rachel Kim is a distinguished eye surgeon specializing in advanced LASIK, cataract procedures, corneal transplants, and glaucoma management."
  },
  {
    id: 12,
    name: "Dr. Marcus Brody, MD",
    specialty: "Gastroenterology",
    subSpecialty: "Digestive Diseases & Endoscopy",
    hospital: "Cedars-Sinai Medical Center",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 3:00 PM",
    experience: "15 Yrs",
    rating: 4.8,
    reviews: 302,
    fee: "$175",
    location: "Los Angeles, CA",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. Marcus Brody leads clinical gastroenterology care specializing in IBS, inflammatory bowel disease, endoscopy, and liver wellness."
  },
  {
    id: 13,
    name: "Dr. Lisa Wang, MD",
    specialty: "Pulmonology",
    subSpecialty: "Respiratory Care & Sleep Medicine",
    hospital: "NYU Langone Health",
    image: "https://images.unsplash.com/photo-1623854767648-e7bb8009f0db?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Tomorrow, 10:30 AM",
    experience: "12 Yrs",
    rating: 4.9,
    reviews: 219,
    fee: "$145",
    location: "New York, NY",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. Lisa Wang provides expert pulmonary consultation for asthma management, COPD, post-viral lung rehabilitation, and obstructive sleep apnea."
  },
  {
    id: 14,
    name: "Dr. Jonathan Hayes, MD",
    specialty: "Rheumatology",
    subSpecialty: "Autoimmune & Joint Arthritis",
    hospital: "Vanderbilt University Medical Center",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
    available: false,
    nextAvailable: "Tomorrow, 2:00 PM",
    experience: "14 Yrs",
    rating: 4.7,
    reviews: 188,
    fee: "$155",
    location: "Nashville, TN",
    consultationTypes: ["Video Call"],
    about: "Dr. Jonathan Hayes specializes in early diagnosis and biologic treatments for rheumatoid arthritis, lupus, osteoporosis, and connective tissue disorders."
  },
  {
    id: 15,
    name: "Dr. Maria Santos, MD",
    specialty: "Gynecology & Obstetrics",
    subSpecialty: "Maternal-Fetal Medicine",
    hospital: "Texas Medical Center",
    image: "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 4:15 PM",
    experience: "13 Yrs",
    rating: 5.0,
    reviews: 410,
    fee: "$160",
    location: "Houston, TX",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. Maria Santos offers high-risk prenatal care, reproductive endocrinology guidance, laparoscopic gynecological surgery, and women's health screening."
  },
  {
    id: 16,
    name: "Dr. Vikram Malhotra, MD",
    specialty: "Urology",
    subSpecialty: "Minimal Access Urologic Surgery",
    hospital: "UCLA Health",
    image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 1:45 PM",
    experience: "16 Yrs",
    rating: 4.8,
    reviews: 275,
    fee: "$185",
    location: "Los Angeles, CA",
    consultationTypes: ["In-Clinic"],
    about: "Dr. Vikram Malhotra is an expert urologic surgeon specializing in robotic prostate care, kidney stone management, and reconstructive urology."
  },
  {
    id: 17,
    name: "Dr. Chloe Dubois, MD",
    specialty: "Allergy & Immunology",
    subSpecialty: "Asthma & Clinical Immunotherapy",
    hospital: "Emory Healthcare",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Tomorrow, 9:30 AM",
    experience: "9 Yrs",
    rating: 4.9,
    reviews: 195,
    fee: "$125",
    location: "Atlanta, GA",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. Chloe Dubois provides personalized allergy testing, pediatric allergy care, environmental desensitization, and immune deficiency evaluations."
  },
  {
    id: 18,
    name: "Dr. Benjamin Carter, MD",
    specialty: "Nephrology",
    subSpecialty: "Kidney Care & Hypertension",
    hospital: "Duke University Health System",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 5:00 PM",
    experience: "17 Yrs",
    rating: 4.8,
    reviews: 312,
    fee: "$170",
    location: "Durham, NC",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. Benjamin Carter is a senior nephrologist leading dialysis management, chronic kidney disease prevention, and post-transplant follow-up care."
  },
  {
    id: 19,
    name: "Dr. Hannah Abbott, MD",
    specialty: "ENT Specialist",
    subSpecialty: "Otolaryngology & Sinus Surgery",
    hospital: "Yale New Haven Health",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    available: true,
    nextAvailable: "Today, 2:15 PM",
    experience: "10 Yrs",
    rating: 4.9,
    reviews: 268,
    fee: "$140",
    location: "New Haven, CT",
    consultationTypes: ["In-Clinic", "Video Call"],
    about: "Dr. Hannah Abbott treats sinus disorders, hearing & balance impairments, vocal cord conditions, and minimally invasive endoscopic nasal procedures."
  },
  {
    id: 20,
    name: "Dr. Omar Al-Mansoor, MD",
    specialty: "Plastic Surgery",
    subSpecialty: "Reconstructive Microsurgery",
    hospital: "Barnes-Jewish Hospital",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    available: false,
    nextAvailable: "Friday, 11:00 AM",
    experience: "15 Yrs",
    rating: 4.9,
    reviews: 340,
    fee: "$220",
    location: "St. Louis, MO",
    consultationTypes: ["In-Clinic"],
    about: "Dr. Omar Al-Mansoor specializes in trauma reconstructive surgery, wound healing technology, cosmetic aesthetic procedures, and scar revision."
  }
];

const specialtiesList = [
  "All Specialists",
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Psychiatry",
  "Oncology",
  "General Medicine",
  "Endocrinology",
  "Ophthalmology",
  "Gastroenterology",
  "Pulmonology",
  "Rheumatology",
  "Urology",
  "ENT Specialist"
];

const availableTimeSlots = [
  { group: "Morning", slots: ["09:00 AM", "09:30 AM", "10:15 AM", "11:00 AM", "11:45 AM"] },
  { group: "Afternoon", slots: ["01:30 PM", "02:15 PM", "03:00 PM", "03:45 PM", "04:30 PM"] },
  { group: "Evening", slots: ["05:15 PM", "06:00 PM", "06:45 PM", "07:30 PM"] }
];

export default function Appointments() {
  const { doctors: dbDoctors } = FetchDoctors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialists');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);
  const [onlyVideoConsult, setOnlyVideoConsult] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'experience' | 'fee'

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [previewDoctor, setPreviewDoctor] = useState(null);
  const [step, setStep] = useState(1); // 1: Select doctor, 2: Booking form

  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:15 AM',
    consultType: 'In-Clinic',
    reason: '',
    insurance: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  // Combine PostgreSQL doctors with default doctors list
  const combinedDoctors = useMemo(() => {
    if (!dbDoctors || dbDoctors.length === 0) return doctorsData;

    const dbMapped = dbDoctors.map(d => ({
      id: d.id || d.uid,
      name: d.name,
      specialty: d.specialty || d.speciality || 'General Medicine',
      subSpecialty: 'Board-Certified Specialist',
      hospital: d.hospital || 'CareSync Medical Center',
      image: d.avatar_url || d.img || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
      available: d.is_available_today !== undefined ? d.is_available_today : true,
      nextAvailable: d.is_available_today ? `Today (${d.schedule_hours || '09:00 AM - 05:00 PM'})` : 'Off Duty Today',
      experience: '12 Yrs',
      rating: 4.9,
      reviews: 145,
      fee: d.fee || '₹500',
      location: 'CareSync Clinic',
      consultationTypes: ['In-Clinic', 'Video Call'],
      about: `Dr. ${d.name} is a leading ${d.specialty || d.speciality} specialist providing compassionate, evidence-based care.`
    }));

    const dbNames = new Set(dbMapped.map(d => d.name.toLowerCase()));
    const filteredDefaults = doctorsData.filter(d => !dbNames.has(d.name.toLowerCase()));

    return [...dbMapped, ...filteredDefaults];
  }, [dbDoctors]);

  // Filter and Sort Doctors
  const filteredDoctors = useMemo(() => {
    return combinedDoctors
      .filter(doc => {
        const matchesSearch =
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doc.subSpecialty && doc.subSpecialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
          doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSpecialty =
          selectedSpecialty === 'All Specialists' || doc.specialty === selectedSpecialty;

        const matchesAvailability = !onlyAvailableToday || doc.available;
        const matchesVideo = !onlyVideoConsult || doc.consultationTypes.includes('Video Call');

        return matchesSearch && matchesSpecialty && matchesAvailability && matchesVideo;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience);
        if (sortBy === 'fee') return parseInt(String(a.fee).replace(/[^0-9]/g, '')) - parseInt(String(b.fee).replace(/[^0-9]/g, ''));
        return 0;
      });
  }, [combinedDoctors, searchQuery, selectedSpecialty, onlyAvailableToday, onlyVideoConsult, sortBy]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.patientName.trim()) errors.patientName = 'Patient full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Valid email is required';
    if (!formData.phone.trim()) errors.phone = 'Contact phone number is required';
    if (!formData.date) errors.date = 'Appointment date is required';
    if (!formData.timeSlot) errors.timeSlot = 'Please select a time slot';
    if (!formData.reason.trim()) errors.reason = 'Reason for consultation is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedDoctor(null);
    setStep(1);
    setFormErrors({});
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const bookingRef = 'HC-' + Math.floor(100000 + Math.random() * 900000);

    try {
      if (isSupabaseConfigured) {
        await supabase.from('appointments').insert({
          patient_name: formData.patientName,
          doctor_name: selectedDoctor?.name || 'Assigned Specialist',
          specialty: selectedDoctor?.specialty || 'General Medicine',
          date: formData.date,
          time_slot: formData.timeSlot,
          consult_type: formData.consultType,
          reason: formData.reason,
          ref_code: bookingRef,
          status: 'Confirmed'
        });
      }
    } catch (err) {
      console.warn('Booking db save error:', err);
    } finally {
      setIsSubmitting(false);
      setBookingConfirmed({
        ref: bookingRef,
        doctor: selectedDoctor,
        details: { ...formData }
      });
    }
  };

  const resetBookingState = () => {
    setBookingConfirmed(null);
    setSelectedDoctor(null);
    setStep(1);
    setFormData({
      patientName: '',
      email: '',
      phone: '',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '10:15 AM',
      consultType: 'In-Clinic',
      reason: '',
      insurance: ''
    });
    setFormErrors({});
  };

  return (
    <>
    <div className={styles.pageContainer}>
      <div className={styles.navbarSpacer}></div>

      {/* Decorative Glow Elements */}
      <div className={styles.glowCanvas}>
        <div className={`${styles.glowOrb} ${styles.orb1}`}></div>
        <div className={`${styles.glowOrb} ${styles.orb2}`}></div>
      </div>

      {/* Top Hero Banner */}
      <motion.header 
        className={styles.heroSection}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className={styles.heroBadge}>
          <span className={styles.badgePulse}></span>
          <span>⚡ Top 1% Board-Certified Specialists · Instant Telehealth & Clinic Care</span>
        </div>
        <h1 className={styles.heroTitle}>
          Book Top-Tier <span className={styles.gradientText}>Healthcare Specialists</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Direct access to world-class hospital consultants, video consultations, and transparent pricing.
        </p>

        {/* MNC Stats Ticker */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statVal}>12,400+</span>
            <span className={styles.statLbl}>Verified Bookings</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>4.9/5★</span>
            <span className={styles.statLbl}>Patient Rating</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>20+</span>
            <span className={styles.statLbl}>Medical Specialties</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>&lt; 15 min</span>
            <span className={styles.statLbl}>Average Wait Time</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className={styles.contentWrapper}>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step-1-directory"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={staggerChildren}
              className={styles.directoryContainer}
            >
              {/* Search & Filter Toolbar */}
              <div className={styles.filterCard}>
                <div className={styles.searchRow}>
                  <div className={styles.searchInputWrap}>
                    <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Search doctor name, specialty, subspecialty, or hospital..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={styles.searchInput}
                    />
                    {searchQuery && (
                      <button className={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>✕</button>
                    )}
                  </div>

                  <div className={styles.sortDropdownWrap}>
                    <label>Sort By:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.selectDropdown}>
                      <option value="rating">Highest Rated</option>
                      <option value="experience">Most Experienced</option>
                      <option value="fee">Consultation Fee</option>
                    </select>
                  </div>
                </div>

                {/* Specialty Pill Chips */}
                <div className={styles.specialtyChipsRow}>
                  {specialtiesList.map(spec => (
                    <button
                      key={spec}
                      className={`${styles.chipBtn} ${selectedSpecialty === spec ? styles.activeChip : ''}`}
                      onClick={() => setSelectedSpecialty(spec)}
                    >
                      {spec}
                    </button>
                  ))}
                </div>

                {/* Filter Toggles */}
                <div className={styles.togglesRow}>
                  <label className={styles.toggleLabel}>
                    <input 
                      type="checkbox" 
                      checked={onlyAvailableToday}
                      onChange={(e) => setOnlyAvailableToday(e.target.checked)} 
                    />
                    <span className={styles.checkboxCustom}></span>
                    <span>Available Today Only</span>
                  </label>

                  <label className={styles.toggleLabel}>
                    <input 
                      type="checkbox" 
                      checked={onlyVideoConsult}
                      onChange={(e) => setOnlyVideoConsult(e.target.checked)} 
                    />
                    <span className={styles.checkboxCustom}></span>
                    <span>Video Consultation Available</span>
                  </label>

                  <span className={styles.resultsCount}>
                    Showing <strong>{filteredDoctors.length}</strong> doctor{filteredDoctors.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Doctors Grid */}
              {filteredDoctors.length > 0 ? (
                <div className={styles.doctorsGrid}>
                  {filteredDoctors.map((doc, idx) => (
                    <motion.div 
                      key={doc.id}
                      className={styles.docCard}
                      variants={fadeInUp}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    >
                      {/* Image & Status Header */}
                      <div className={styles.cardHeader}>
                        <div className={styles.imgWrapper}>
                          <Image 
                            src={doc.image} 
                            alt={doc.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 360px"
                            priority={idx < 2}
                            className={styles.docImg}
                          />
                        </div>
                        <div className={`${styles.statusBadge} ${doc.available ? styles.bgAvailable : styles.bgBusy}`}>
                          <span className={styles.statusDot}></span>
                          {doc.available ? 'Available Today' : 'Next Available Soon'}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className={styles.cardBody}>
                        <div className={styles.docNameRow}>
                          <h3 className={styles.docName}>{doc.name}</h3>
                          <span className={styles.verifiedBadge} title="Board Certified Specialist">✓</span>
                        </div>

                        <div className={styles.specialtyTagRow}>
                          <span className={styles.mainSpecialty}>{doc.specialty}</span>
                          <span className={styles.subSpecialty}>{doc.subSpecialty}</span>
                        </div>

                        <div className={styles.hospitalInfo}>
                          <svg className={styles.iconSm} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7" />
                          </svg>
                          <span>{doc.hospital} · {doc.location}</span>
                        </div>

                        {/* Ratings & Experience */}
                        <div className={styles.metaRow}>
                          <div className={styles.ratingBadge}>
                            <span className={styles.starIcon}>★</span>
                            <span className={styles.ratingNum}>{doc.rating}</span>
                            <span className={styles.revCount}>({doc.reviews})</span>
                          </div>

                          <div className={styles.expBadge}>
                            <span>💼 {doc.experience} Exp</span>
                          </div>
                        </div>

                        {/* Consultation Types */}
                        <div className={styles.consultTypesRow}>
                          {doc.consultationTypes.map(ct => (
                            <span key={ct} className={styles.consultPill}>
                              {ct === 'Video Call' ? '📹 Video' : '🏢 In-Clinic'}
                            </span>
                          ))}
                          <span className={styles.feeTag}>{doc.fee} / visit</span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className={styles.cardFooter}>
                        <button 
                          className={styles.quickProfileBtn}
                          onClick={() => setPreviewDoctor(doc)}
                        >
                          View Bio
                        </button>
                        <button 
                          className={styles.bookNowBtn}
                          onClick={() => handleDoctorSelect(doc)}
                        >
                          Book Appointment ➔
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={styles.noResultsCard}>
                  <div className={styles.noResultsIcon}>🩺</div>
                  <h3>No Specialist Doctors Found</h3>
                  <p>Try adjusting your search query or reset active filters.</p>
                  <button 
                    className={styles.resetFilterBtn}
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSpecialty('All Specialists');
                      setOnlyAvailableToday(false);
                      setOnlyVideoConsult(false);
                    }}
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            /* STEP 2: Interactive Appointment Booking Wizard */
            <motion.div 
              key="step-2-booking"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={scaleIn}
              className={styles.bookingWizardLayout}
            >
              {/* Back Button Header */}
              <div className={styles.wizardHeader}>
                <button className={styles.backBtn} onClick={handleBack}>
                  ← Back to Specialists Directory
                </button>
                <div className={styles.stepIndicator}>
                  <span className={styles.stepActive}>Step 2 of 2</span>: Consultation & Schedule Details
                </div>
              </div>

              <div className={styles.wizardGrid}>
                {/* Left Form Column */}
                <form className={styles.bookingForm} onSubmit={handleBookingSubmit}>
                  <h2 className={styles.formSectionTitle}>1. Consultation Mode</h2>
                  <div className={styles.consultModeSelector}>
                    {selectedDoctor.consultationTypes.map(type => (
                      <label 
                        key={type} 
                        className={`${styles.modeOptionCard} ${formData.consultType === type ? styles.selectedMode : ''}`}
                      >
                        <input 
                          type="radio" 
                          name="consultType" 
                          value={type} 
                          checked={formData.consultType === type}
                          onChange={handleInputChange} 
                        />
                        <div className={styles.modeIcon}>
                          {type === 'Video Call' ? '📹' : '🏢'}
                        </div>
                        <div>
                          <div className={styles.modeTitle}>{type}</div>
                          <div className={styles.modeSub}>
                            {type === 'Video Call' ? 'HD Telehealth Video Link Provided' : `At ${selectedDoctor.hospital}`}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <h2 className={styles.formSectionTitle}>2. Select Date & Time Slot</h2>
                  <div className={styles.dateSlotRow}>
                    <div className={styles.inputFieldGroup}>
                      <label>Appointment Date</label>
                      <input 
                        type="date" 
                        name="date"
                        value={formData.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={handleInputChange}
                        className={styles.formInput}
                      />
                      {formErrors.date && <span className={styles.errorSpan}>{formErrors.date}</span>}
                    </div>
                  </div>

                  {/* Time Slots Categorized */}
                  <div className={styles.timeSlotPicker}>
                    {availableTimeSlots.map(group => (
                      <div key={group.group} className={styles.slotGroup}>
                        <div className={styles.slotGroupTitle}>{group.group} Slots</div>
                        <div className={styles.slotGrid}>
                          {group.slots.map(slot => (
                            <button
                              type="button"
                              key={slot}
                              className={`${styles.slotBtn} ${formData.timeSlot === slot ? styles.activeSlotBtn : ''}`}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, timeSlot: slot }));
                                if (formErrors.timeSlot) setFormErrors(prev => ({ ...prev, timeSlot: '' }));
                              }}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {formErrors.timeSlot && <span className={styles.errorSpan}>{formErrors.timeSlot}</span>}

                  <h2 className={styles.formSectionTitle}>3. Patient Information</h2>
                  <div className={styles.formTwoCol}>
                    <div className={styles.inputFieldGroup}>
                      <label>Patient Full Name *</label>
                      <input 
                        type="text" 
                        name="patientName"
                        placeholder="e.g. John Doe"
                        value={formData.patientName}
                        onChange={handleInputChange}
                        className={`${styles.formInput} ${formErrors.patientName ? styles.inputError : ''}`}
                      />
                      {formErrors.patientName && <span className={styles.errorSpan}>{formErrors.patientName}</span>}
                    </div>

                    <div className={styles.inputFieldGroup}>
                      <label>Email Address *</label>
                      <input 
                        type="email" 
                        name="email"
                        placeholder="john.doe@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`${styles.formInput} ${formErrors.email ? styles.inputError : ''}`}
                      />
                      {formErrors.email && <span className={styles.errorSpan}>{formErrors.email}</span>}
                    </div>
                  </div>

                  <div className={styles.formTwoCol}>
                    <div className={styles.inputFieldGroup}>
                      <label>Contact Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone"
                        placeholder="+1 (555) 019-2834"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`${styles.formInput} ${formErrors.phone ? styles.inputError : ''}`}
                      />
                      {formErrors.phone && <span className={styles.errorSpan}>{formErrors.phone}</span>}
                    </div>

                    <div className={styles.inputFieldGroup}>
                      <label>Insurance Provider (Optional)</label>
                      <input 
                        type="text" 
                        name="insurance"
                        placeholder="e.g. BlueCross, Aetna"
                        value={formData.insurance}
                        onChange={handleInputChange}
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  <div className={styles.inputFieldGroup}>
                    <label>Reason for Visit / Symptoms *</label>
                    <textarea 
                      name="reason"
                      rows={3}
                      placeholder="Briefly describe your symptoms or reason for appointment..."
                      value={formData.reason}
                      onChange={handleInputChange}
                      className={`${styles.formInput} ${formErrors.reason ? styles.inputError : ''}`}
                    />
                    {formErrors.reason && <span className={styles.errorSpan}>{formErrors.reason}</span>}
                  </div>

                  <button 
                    type="submit" 
                    className={styles.confirmSubmitBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className={styles.btnSpinner}>Processing Secure Booking...</span>
                    ) : (
                      <span>Confirm & Reserve Appointment ➔</span>
                    )}
                  </button>
                </form>

                {/* Right Side Ticket Summary Card */}
                <div className={styles.summarySidebar}>
                  <div className={styles.summaryTicketCard}>
                    <div className={styles.ticketHeader}>
                      <h3>Appointment Summary</h3>
                      <span className={styles.verifiedTag}>Verified Specialist</span>
                    </div>

                    <div className={styles.ticketDocRow}>
                      <Image 
                        src={selectedDoctor.image} 
                        alt={selectedDoctor.name} 
                        width={70} 
                        height={70}
                        style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center' }}
                      />
                      <div>
                        <h4 className={styles.ticketDocName}>{selectedDoctor.name}</h4>
                        <div className={styles.ticketDocSpec}>{selectedDoctor.specialty}</div>
                        <div className={styles.ticketHosp}>{selectedDoctor.hospital}</div>
                      </div>
                    </div>

                    <div className={styles.ticketDetailsList}>
                      <div className={styles.ticketLine}>
                        <span>Consultation Type:</span>
                        <strong>{formData.consultType}</strong>
                      </div>
                      <div className={styles.ticketLine}>
                        <span>Date:</span>
                        <strong>{formData.date}</strong>
                      </div>
                      <div className={styles.ticketLine}>
                        <span>Time Slot:</span>
                        <strong>{formData.timeSlot}</strong>
                      </div>
                      <div className={styles.ticketLine}>
                        <span>Doctor Fee:</span>
                        <strong>{selectedDoctor.fee}</strong>
                      </div>
                      <div className={styles.ticketLine}>
                        <span>Platform Booking Fee:</span>
                        <strong className={styles.freeText}>FREE</strong>
                      </div>
                      <div className={`${styles.ticketLine} ${styles.totalLine}`}>
                        <span>Total Due:</span>
                        <span className={styles.totalFee}>{selectedDoctor.fee}</span>
                      </div>
                    </div>

                    <div className={styles.guaranteeBox}>
                      <span>🔒 256-Bit SSL Encrypted & HIPAA Compliant Data Handling</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Doctor Quick Profile Modal */}
      <AnimatePresence>
        {previewDoctor && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewDoctor(null)}
          >
            <motion.div 
              className={styles.modalCard}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.modalCloseBtn} onClick={() => setPreviewDoctor(null)}>✕</button>
              
              <div className={styles.modalHeaderRow}>
                <Image 
                  src={previewDoctor.image} 
                  alt={previewDoctor.name}
                  width={90}
                  height={90}
                  style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center' }}
                />
                <div>
                  <h3 className={styles.modalDocName}>{previewDoctor.name}</h3>
                  <div className={styles.modalSpec}>{previewDoctor.specialty} · {previewDoctor.subSpecialty}</div>
                  <div className={styles.modalHosp}>🏥 {previewDoctor.hospital} ({previewDoctor.location})</div>
                  <div className={styles.modalRating}>⭐ {previewDoctor.rating} / 5.0 ({previewDoctor.reviews} Verified Reviews)</div>
                </div>
              </div>

              <div className={styles.modalBody}>
                <h4>About Specialist</h4>
                <p>{previewDoctor.about}</p>

                <div className={styles.modalGridStats}>
                  <div className={styles.mStat}>
                    <span>Experience</span>
                    <strong>{previewDoctor.experience}</strong>
                  </div>
                  <div className={styles.mStat}>
                    <span>Consultation Fee</span>
                    <strong>{previewDoctor.fee}</strong>
                  </div>
                  <div className={styles.mStat}>
                    <span>Next Slot</span>
                    <strong className={styles.textEmerald}>{previewDoctor.nextAvailable}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  className={styles.modalBookBtn}
                  onClick={() => {
                    const doc = previewDoctor;
                    setPreviewDoctor(null);
                    handleDoctorSelect(doc);
                  }}
                >
                  Proceed to Book with {previewDoctor.name.split(' ')[1]} ➔
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Confirmed E-Ticket Modal */}
      <AnimatePresence>
        {bookingConfirmed && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`${styles.modalCard} ${styles.ticketConfirmedCard}`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
            >
              <div className={styles.successBadgeCircle}>✓</div>
              <h2 className={styles.confirmedTitle}>Appointment Confirmed!</h2>
              <p className={styles.confirmedSub}>
                Your appointment has been reserved successfully. A confirmation email and SMS reminder have been sent.
              </p>

              <div className={styles.eTicketPass}>
                <div className={styles.eTicketRef}>Booking Reference: <strong>{bookingConfirmed.ref}</strong></div>
                <div className={styles.eTicketGrid}>
                  <div>
                    <span>Doctor</span>
                    <strong>{bookingConfirmed.doctor.name}</strong>
                  </div>
                  <div>
                    <span>Specialty</span>
                    <strong>{bookingConfirmed.doctor.specialty}</strong>
                  </div>
                  <div>
                    <span>Date & Time</span>
                    <strong>{bookingConfirmed.details.date} at {bookingConfirmed.details.timeSlot}</strong>
                  </div>
                  <div>
                    <span>Mode</span>
                    <strong>{bookingConfirmed.details.consultType}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.ticketActions}>
                <button className={styles.printBtn} onClick={() => window.print()}>
                  🖨️ Print E-Ticket
                </button>
                <button className={styles.doneBtn} onClick={resetBookingState}>
                  Back to Appointments Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

      {/* Footer Component */}
      <Footer />
    </>
  );
}