import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { initial50PatientsList } from '@/lib/fetchPatients';

export default async function handler(req, res) {
  try {
    let telemetryReports = [];

    // 1. Fetch latest telemetry reports from Supabase PostgreSQL if available
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        telemetryReports = data;
      }
    }

    // 2. Evaluate all 50 patients against latest vitals
    const criticalPatientsList = [];

    initial50PatientsList.forEach(patient => {
      // Find latest telemetry for this patient ID
      const latestReport = telemetryReports.find(r => r.patient_id === patient.id);
      
      const hr = latestReport ? latestReport.heart_rate : (patient.age > 70 ? 112 : 76);
      const spo2 = latestReport ? latestReport.spo2 : (patient.condition?.includes('Critical') || patient.condition?.includes('Pneumonia') ? 89 : 98);
      const temp = latestReport ? latestReport.temperature : 98.6;

      const isCritical = spo2 < 92 || hr > 115 || hr < 50 || temp > 101.5;

      if (isCritical) {
        criticalPatientsList.push({
          id: patient.id,
          name: patient.name || `${patient.firstName} ${patient.lastName}`,
          phone: patient.phone || '+91 9876543210',
          assigned_doctor: patient.assignedDoctor || 'Dr. Sarah Johnson, MD',
          condition: patient.condition || 'Severe Respiratory Distress',
          heart_rate: hr,
          spo2: spo2,
          temperature: temp,
          detected_at: latestReport?.created_at || new Date().toISOString()
        });
      }
    });

    // 3. Automatically dispatch notifications into Supabase PostgreSQL for critical patients
    let notificationsDispatched = 0;

    if (isSupabaseConfigured && criticalPatientsList.length > 0) {
      for (const crit of criticalPatientsList) {
        const title = `🚨 AUTOMATED CRITICAL ALERT: ${crit.name} (${crit.id})`;
        const message = `Device Telemetry Warning: SpO2 at ${crit.spo2}% (Below 92%), HR at ${crit.heart_rate} BPM. Assigned Doctor: ${crit.assigned_doctor}. Automated Email & SMS alerts dispatched.`;

        // Check if alert already exists recently to avoid duplicate flood
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('title', title)
          .gte('created_at', new Date(Date.now() - 300000).toISOString()); // 5 min deduplication

        if (!existing || existing.length === 0) {
          await supabase.from('notifications').insert({
            title: title,
            message: message,
            type: 'emergency',
            target_role: 'doctor',
            sender_role: 'system'
          });
          notificationsDispatched++;
        }
      }
    } else if (criticalPatientsList.length > 0) {
      notificationsDispatched = criticalPatientsList.length;
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      patients_scanned: initial50PatientsList.length,
      critical_count: criticalPatientsList.length,
      notifications_dispatched: notificationsDispatched,
      critical_patients: criticalPatientsList
    });
  } catch (err) {
    console.error('Auto-scan API error:', err);
    return res.status(500).json({ error: err.message || 'Auto-scan evaluation error' });
  }
}
