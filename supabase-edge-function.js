// Supabase Edge Function: chatbot-query
// Deploy to Supabase Functions dashboard
// This file shows the logic that should be in the Edge Function

// ============================================================
// COPY THIS CODE TO SUPABASE FUNCTIONS DASHBOARD
// Path: functions/chatbot-query/index.ts
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseKey)

// Pattern-based query definitions
const QUERY_PATTERNS = {
  // Appointments patterns
  'appointments': {
    keywords: ['appointment', 'appointments', 'scheduled', 'schedule'],
    handler: 'getAppointments'
  },
  'appointments_next_week': {
    keywords: ['appointment.*next week', 'appointments.*next week', 'upcoming appointments'],
    handler: 'getAppointmentsNextWeek'
  },
  'appointments_today': {
    keywords: ['appointment.*today', 'today.*appointment', 'todays appointment'],
    handler: 'getAppointmentsToday'
  },

  // ART patterns
  'art_patients': {
    keywords: ['on art', 'art.*patient', 'receiving art', 'art.*treatment'],
    handler: 'getARTPatients'
  },

  // Viral load patterns
  'high_viral_load': {
    keywords: ['high.*viral', 'viral.*high', 'viral load.*1000', 'elevated viral'],
    handler: 'getHighViralLoadPatients'
  },
  'undetectable_viral': {
    keywords: ['undetectable', 'viral.*undetectable', 'u=u'],
    handler: 'getUndetectablePatients'
  },

  // Patient patterns
  'new_patients': {
    keywords: ['new.*patient', 'registered.*month', 'new registration'],
    handler: 'getNewPatients'
  },
  'critical_patients': {
    keywords: ['critical', 'alert', 'inactive', 'lost to follow', 'ltfu'],
    handler: 'getCriticalPatients'
  },

  // CD4 patterns
  'low_cd4': {
    keywords: ['low cd4', 'cd4.*low', 'cd4.*count', 'cd4.*below'],
    handler: 'getLowCD4Patients'
  },

  // Status patterns
  'patient_status': {
    keywords: ['status', 'patient.*status', 'how many.*status'],
    handler: 'getPatientsByStatus'
  },

  // ============================================================
  // NCD (Non-Communicable Diseases) patterns
  // ============================================================
  'hypertension': {
    keywords: ['hypertension', 'high.*blood.*pressure', 'hbp', 'hypertensive'],
    handler: 'getHypertensionPatients'
  },
  'diabetes': {
    keywords: ['diabetes', 'diabetic', 'glucose', 'blood.*sugar'],
    handler: 'getDiabetesPatients'
  },
  'asthma': {
    keywords: ['asthma', 'asthmatic', 'chronic.*respiratory'],
    handler: 'getAsthmaPatients'
  },
  'cancer': {
    keywords: ['cancer', 'oncology', 'malignancy', 'tumor'],
    handler: 'getCancerPatients'
  },
  'heart_disease': {
    keywords: ['heart.*disease', 'cardiac', 'cardiovascular', 'cvd'],
    handler: 'getHeartDiseasePatients'
  },
  'ckd': {
    keywords: ['chronic.*kidney', 'ckd', 'renal.*disease', 'kidney.*disease'],
    handler: 'getCKDPatients'
  },
  'mental_health': {
    keywords: ['mental.*health', 'depression', 'anxiety', 'psychiatric'],
    handler: 'getMentalHealthPatients'
  },
  'tuberculosis': {
    keywords: ['tuberculosis', 'tb', 'lung.*disease'],
    handler: 'getTuberculosisPatients'
  },

  // ============================================================
  // Appointment-related patterns
  // ============================================================
  'missed_appointments': {
    keywords: ['missed.*appointment', 'defaulter', 'no show', 'absent', 'did not come'],
    handler: 'getMissedAppointments'
  },
  'due_appointments': {
    keywords: ['due.*appointment', 'overdue', 'not attended', 'pending.*appointment'],
    handler: 'getDueAppointments'
  },

  // ============================================================
  // Testing & Lab patterns
  // ============================================================
  'due_viral_load': {
    keywords: ['due.*viral.*load', 'viral.*load.*due', 'vl.*test.*due', 'viral.*testing'],
    handler: 'getDueForViralLoadTest'
  },
  'due_cd4': {
    keywords: ['due.*cd4', 'cd4.*due', 'cd4.*test.*due'],
    handler: 'getDueForCD4Test'
  },
  'labs_overdue': {
    keywords: ['lab.*overdue', 'test.*overdue', 'investigation.*due'],
    handler: 'getOverdueLabTests'
  },

  // ============================================================
  // Pregnancy & Maternal Health patterns
  // ============================================================
  'antenatal': {
    keywords: ['antenatal', 'ante-natal', 'pregnant', 'pregnancy', 'maternal.*care'],
    handler: 'getAntenatalPatients'
  },
  'postnatal': {
    keywords: ['postnatal', 'post-natal', 'postpartum', 'puerperal'],
    handler: 'getPostnatalPatients'
  },
  'maternal_complications': {
    keywords: ['maternal.*complication', 'pregnancy.*complication', 'obstetric.*emergency'],
    handler: 'getMaternalComplications'
  },

  // ============================================================
  // Bleeding & Complications patterns
  // ============================================================
  'bleeding': {
    keywords: ['bleeding', 'hemorrhage', 'bleed', 'hemoptysis', 'gi.*bleed'],
    handler: 'getBleeedingPatients'
  },
  'complications': {
    keywords: ['complication', 'adverse.*event', 'side.*effect', 'iae'],
    handler: 'getPatientsWithComplications'
  },

  // ============================================================
  // Adherence & Follow-up patterns
  // ============================================================
  'poor_adherence': {
    keywords: ['poor.*adherence', 'non-adherent', 'non adherent', 'medication.*adherence'],
    handler: 'getPoorAdherencePatients'
  },
  'due_review': {
    keywords: ['due.*review', 'clinic.*review.*due', 'follow.?up.*due'],
    handler: 'getDueForClinicReview'
  },

  // ============================================================
  // Treatment & Regimen patterns
  // ============================================================
  'first_line_art': {
    keywords: ['first.*line', 'first line art', 'initial.*regimen', 'starter.*regimen'],
    handler: 'getFirstLineARTPatients'
  },
  'second_line_art': {
    keywords: ['second.*line', 'second line art', 'switch.*regimen', 'treatment.*failure'],
    handler: 'getSecondLineARTPatients'
  },
  'switch_regimen': {
    keywords: ['switch', 'regimen.*change', 'change.*regimen', 'medication.*switch'],
    handler: 'getPatientsNeedingRegimenSwitch'
  },
  'drug_interactions': {
    keywords: ['drug.*interaction', 'interaction', 'polypharmacy'],
    handler: 'getPatientsWithPossibleDrugInteractions'
  },

  // ============================================================
  // Pregnancy & HIV patterns
  // ============================================================
  'pmtct': {
    keywords: ['pmtct', 'prevention.*mother.*child', 'prevention of mother to child'],
    handler: 'getPMTCTPatients'
  },
  'pregnant_hiv': {
    keywords: ['pregnant.*hiv', 'hiv.*pregnant', 'pregnancy.*hiv status'],
    handler: 'getPregnantHIVPatients'
  },
  'infant_prophylaxis': {
    keywords: ['infant.*prophylaxis', 'baby.*hiv.*prevention', 'neonatal.*prophylaxis'],
    handler: 'getInfantProphylaxisPatients'
  },

  // ============================================================
  // Opportunistic Infections & Comorbidities
  // ============================================================
  'oi_patients': {
    keywords: ['opportunistic.*infection', 'oi.*patient', 'oportunistic'],
    handler: 'getOIPatients'
  },
  'tb_hiv_coinfection': {
    keywords: ['tb.*hiv', 'hiv.*tb', 'tb/hiv', 'co.?infection'],
    handler: 'getTBHIVCoinfection'
  },
  'on_tb_treatment': {
    keywords: ['on.*tb', 'tb.*treatment', 'anti.*tb'],
    handler: 'getOnTBTreatment'
  },
  'cns_infections': {
    keywords: ['meningitis', 'cns.*infection', 'encephalitis', 'cryptococcal'],
    handler: 'getCNSInfections'
  },

  // ============================================================
  // Immunological Monitoring patterns
  // ============================================================
  'baseline_cd4': {
    keywords: ['baseline.*cd4', 'cd4.*baseline', 'pre.?art.*cd4'],
    handler: 'getBaselineCD4Patients'
  },
  'cd4_recovery': {
    keywords: ['cd4.*recovery', 'recovering.*cd4', 'cd4.*improving'],
    handler: 'getCD4RecoveryPatients'
  },
  'cd4_declining': {
    keywords: ['cd4.*declining', 'declining.*cd4', 'cd4.*falling', 'cd4.*drop'],
    handler: 'getCD4DecliningPatients'
  },
  'immune_reconstitution': {
    keywords: ['immune.*reconstitution', 'iris', 'paradoxical response'],
    handler: 'getImmuneReconstitutionDisease'
  },

  // ============================================================
  // Virological Monitoring patterns
  // ============================================================
  'vl_suppressed': {
    keywords: ['suppressed', 'viral.*suppressed', 'vl.*suppressed', 'undetectable'],
    handler: 'getVLSuppressedPatients'
  },
  'vl_blip': {
    keywords: ['viral.*blip', 'vl.*blip', 'transient.*vl', 'viral.*spike'],
    handler: 'getVLBlipPatients'
  },
  'vl_failure': {
    keywords: ['virological.*failure', 'vl.*failure', 'viral.*failure'],
    handler: 'getVirologicalFailurePatients'
  },
  'vl_monitoring': {
    keywords: ['vl.*monitoring', 'viral.*monitoring', 'monitoring plan'],
    handler: 'getVLMonitoringRequired'
  },

  // ============================================================
  // NCD Specific patterns
  // ============================================================
  'hypertension_uncontrolled': {
    keywords: ['uncontrolled.*hypertension', 'hypertension.*uncontrolled', 'high.*bp'],
    handler: 'getUncontrolledHypertension'
  },
  'diabetes_uncontrolled': {
    keywords: ['uncontrolled.*diabetes', 'diabetes.*uncontrolled', 'high.*glucose', 'poor.*glycemic'],
    handler: 'getUncontrolledDiabetes'
  },
  'on_insulin': {
    keywords: ['on.*insulin', 'insulin.*therapy', 'insulin.*dependent'],
    handler: 'getOnInsulinTherapy'
  },
  'copd': {
    keywords: ['copd', 'chronic.*obstructive', 'chronic.*airway.*disease'],
    handler: 'getCOPDPatients'
  },
  'stroke_history': {
    keywords: ['stroke', 'cvd.*event', 'cerebrovascular', 'tia'],
    handler: 'getStrokeHistoryPatients'
  },

  // ============================================================
  // Medication & Pharmacy patterns
  // ============================================================
  'overdue_refill': {
    keywords: ['refill.*due', 'due.*refill', 'overdue.*refill', 'medication.*due'],
    handler: 'getOverdueRefillPatients'
  },
  'stock_out': {
    keywords: ['stock.*out', 'out of stock', 'no stock', 'medication.*unavailable'],
    handler: 'getPatientAffectedByStockOut'
  },
  'on_antiretroviral': {
    keywords: ['antiretroviral', 'arv', 'art.*medication', 'on.*art'],
    handler: 'getOnAntiretroviral'
  },

  // ============================================================
  // Risk & Alert patterns
  // ============================================================
  'at_risk': {
    keywords: ['at.*risk', 'risk.*patient', 'high.*risk'],
    handler: 'getAtRiskPatients'
  },
  'vulnerable_population': {
    keywords: ['vulnerable', 'vulnerable.*population', 'marginalized', 'hcw'],
    handler: 'getVulnerablePopulation'
  },
  'defaulter_alert': {
    keywords: ['defaulter.*alert', 'alert.*defaulter', 'potential.*defaulter'],
    handler: 'getDefaulterAlerts'
  },
  'mortality_risk': {
    keywords: ['mortality.*risk', 'death.*risk', 'high.*risk.*mortality'],
    handler: 'getMortalityRiskPatients'
  },

  // ============================================================
  // Gender & Special Population patterns
  // ============================================================
  'female_patients': {
    keywords: ['female', 'women', 'ladies', 'female.*patient'],
    handler: 'getFemalePatients'
  },
  'male_patients': {
    keywords: ['male', 'men', 'male.*patient'],
    handler: 'getMalePatients'
  },
  'adolescent': {
    keywords: ['adolescent', 'youth', 'young.*person', 'teenager'],
    handler: 'getAdolescentPatients'
  },
  'elderly': {
    keywords: ['elderly', 'aged', 'senior', 'over.*60'],
    handler: 'getElderlyPatients'
  },
  'key_populations': {
    keywords: ['key.*population', 'msm', 'sex.*worker', 'pwid', 'migrant'],
    handler: 'getKeyPopulationPatients'
  },

  // ============================================================
  // Statistics & Summary patterns
  // ============================================================
  'total_patients': {
    keywords: ['total.*patient', 'how many.*patient', 'patient.*count', 'patient.*statistics'],
    handler: 'getTotalPatients'
  },
  'patient_breakdown': {
    keywords: ['breakdown', 'distribution', 'patient.*type.*breakdown'],
    handler: 'getPatientBreakdown'
  },
  'facility_summary': {
    keywords: ['facility.*summary', 'summary', 'overview', 'facility.*overview'],
    handler: 'getFacilitySummary'
  },
  'caseload': {
    keywords: ['caseload', 'case load', 'total.*load'],
    handler: 'getCaseloadSummary'
  },
  'monthly_stats': {
    keywords: ['monthly', 'month.*stat', 'this.*month'],
    handler: 'getMonthlyStatistics'
  }
}

// Main handler
serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, facility_id } = await req.json()

    // Validate inputs
    if (!query || !facility_id) {
      return new Response(
        JSON.stringify({ error: 'Missing query or facility_id' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Find matching pattern
    const pattern = findMatchingPattern(query.toLowerCase())

    if (!pattern) {
      return new Response(
        JSON.stringify({
          type: 'text',
          message: 'Sorry, I don\'t understand that query. Try asking about:\n\n**HIV**: Appointments, ART, Viral Load, CD4\n**NCDs**: Hypertension, Diabetes, Asthma, Heart Disease, Cancer, CKD\n**Maternal**: Antenatal, Postnatal, Complications\n**Follow-up**: Missed appointments, Due for testing, Poor adherence\n**Complications**: Bleeding, Side effects'
        }),
        { headers: corsHeaders }
      )
    }

    // Execute handler
    const handler = getHandler(pattern.handler)
    const result = await handler(facility_id, query)

    return new Response(
      JSON.stringify(result),
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Chatbot error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

// ============================================================
// PATTERN MATCHING
// ============================================================

function findMatchingPattern(query) {
  for (const [key, pattern] of Object.entries(QUERY_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      const regex = new RegExp(keyword, 'i')
      if (regex.test(query)) {
        return pattern
      }
    }
  }
  return null
}

function getHandler(name) {
  const handlers = {
    // Original handlers
    getAppointments,
    getAppointmentsNextWeek,
    getAppointmentsToday,
    getARTPatients,
    getHighViralLoadPatients,
    getUndetectablePatients,
    getNewPatients,
    getCriticalPatients,
    getLowCD4Patients,
    getPatientsByStatus,
    
    // NCD handlers
    getHypertensionPatients,
    getDiabetesPatients,
    getAsthmaPatients,
    getCancerPatients,
    getHeartDiseasePatients,
    getCKDPatients,
    getMentalHealthPatients,
    getTuberculosisPatients,
    
    // Appointment handlers
    getMissedAppointments,
    getDueAppointments,
    
    // Lab/Testing handlers
    getDueForViralLoadTest,
    getDueForCD4Test,
    getOverdueLabTests,
    
    // Pregnancy handlers
    getAntenatalPatients,
    getPostnatalPatients,
    getMaternalComplications,
    
    // Complication handlers
    getBleeedingPatients,
    getPatientsWithComplications,
    
    // Adherence handlers
    getPoorAdherencePatients,
    getDueForClinicReview
  }
  return handlers[name] || (() => ({ message: 'Handler not found' }))
}

// ============================================================
// QUERY HANDLERS
// ============================================================

async function getAppointments(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, appointment_date, status')
      .eq('fid', facilityId)
      .not('appointment_date', 'is', null)
      .order('appointment_date', { ascending: true })
      .limit(20)

    if (error) throw error

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Appointment Date', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Appointment Date': formatDate(p.appointment_date),
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching appointments: ' + error.message }
  }
}

async function getAppointmentsNextWeek(facilityId, query) {
  try {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, appointment_date, status')
      .eq('fid', facilityId)
      .gte('appointment_date', today.toISOString().split('T')[0])
      .lte('appointment_date', nextWeek.toISOString().split('T')[0])
      .order('appointment_date', { ascending: true })

    if (error) throw error

    if (!data || data.length === 0) {
      return { type: 'text', message: 'No appointments scheduled for next week.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Appointment Date', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Appointment Date': formatDate(p.appointment_date),
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching next week appointments: ' + error.message }
  }
}

async function getAppointmentsToday(facilityId, query) {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, appointment_date, status')
      .eq('fid', facilityId)
      .eq('appointment_date', today)
      .order('appointment_date', { ascending: true })

    if (error) throw error

    if (!data || data.length === 0) {
      return { type: 'text', message: 'No appointments scheduled for today.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching today\'s appointments: ' + error.message }
  }
}

async function getARTPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, art_start_date, viral_load_copies')
      .eq('fid', facilityId)
      .not('art_start_date', 'is', null)
      .order('patient_name', { ascending: true })
      .limit(20)

    if (error) throw error

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'ART Start Date', 'Viral Load'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'ART Start Date': formatDate(p.art_start_date),
        'Viral Load': p.viral_load_copies ? p.viral_load_copies + ' copies' : 'Not recorded'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching ART patients: ' + error.message }
  }
}

async function getHighViralLoadPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, viral_load_copies, viral_load_date')
      .eq('fid', facilityId)
      .gte('viral_load_copies', 1000)
      .order('viral_load_copies', { ascending: false })
      .limit(20)

    if (error) throw error

    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with high viral load (≥1000 copies).' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Viral Load', 'Test Date'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Viral Load': p.viral_load_copies + ' copies',
        'Test Date': formatDate(p.viral_load_date)
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching high viral load patients: ' + error.message }
  }
}

async function getUndetectablePatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, viral_load_copies, viral_load_date')
      .eq('fid', facilityId)
      .lt('viral_load_copies', 50)
      .order('patient_name', { ascending: true })
      .limit(20)

    if (error) throw error

    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with undetectable viral load (<50 copies).' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Viral Load', 'Test Date'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Viral Load': p.viral_load_copies < 50 ? '<50 (Undetectable)' : p.viral_load_copies,
        'Test Date': formatDate(p.viral_load_date)
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching undetectable patients: ' + error.message }
  }
}

async function getNewPatients(facilityId, query) {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, patient_registration_date, status')
      .eq('fid', facilityId)
      .gte('patient_registration_date', monthStart)
      .order('patient_registration_date', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      return { type: 'text', message: 'No new patients registered this month.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Registration Date', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Registration Date': formatDate(p.patient_registration_date),
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching new patients: ' + error.message }
  }
}

async function getCriticalPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, status, viral_load_copies')
      .eq('fid', facilityId)
      .in('status', ['Critical', 'Alert', 'Inactive'])
      .order('patient_name', { ascending: true })

    if (error) throw error

    if (!data || data.length === 0) {
      return { type: 'text', message: 'No critical patients found.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Status', 'Viral Load'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Status': p.status,
        'Viral Load': p.viral_load_copies ? p.viral_load_copies + ' copies' : 'Not recorded'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching critical patients: ' + error.message }
  }
}

async function getLowCD4Patients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, cd4_count, cd4_date')
      .eq('fid', facilityId)
      .lt('cd4_count', 200)
      .order('cd4_count', { ascending: true })
      .limit(20)

    if (error) throw error

    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with low CD4 count (<200).' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'CD4 Count', 'Test Date'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'CD4 Count': p.cd4_count || 'N/A',
        'Test Date': formatDate(p.cd4_date)
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching low CD4 patients: ' + error.message }
  }
}

async function getPatientsByStatus(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('status')
      .eq('fid', facilityId)

    if (error) throw error

    // Count by status
    const statusCounts = {}
    data.forEach(p => {
      const status = p.status || 'Unknown'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    const summary = Object.entries(statusCounts)
      .map(([status, count]) => `${status}: ${count}`)
      .join('\n')

    return {
      type: 'text',
      message: `Patient Status Summary:\n${summary}`
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching patient status: ' + error.message }
  }
}

// ============================================================
// NCD HANDLERS
// ============================================================

async function getHypertensionPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, ncd_conditions, status')
      .eq('fid', facilityId)
      .ilike('ncd_conditions', '%Hypertension%')
      .order('patient_name', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with hypertension recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',

        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching hypertension patients: ' + error.message }
  }
}

async function getDiabetesPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, ncd_conditions, glucose_level, status')
      .eq('fid', facilityId)
      .ilike('ncd_conditions', '%Diabetes%')
      .order('patient_name', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with diabetes recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Glucose Level', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Glucose Level': p.glucose_level ? p.glucose_level + ' mg/dL' : 'Not recorded',
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching diabetes patients: ' + error.message }
  }
}

async function getAsthmaPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, ncd_conditions, status')
      .eq('fid', facilityId)
      .ilike('ncd_conditions', '%Asthma%')
      .order('patient_name', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with asthma recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching asthma patients: ' + error.message }
  }
}

async function getCancerPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, ncd_conditions, cancer_type, status')
      .eq('fid', facilityId)
      .ilike('ncd_conditions', '%Cancer%')
      .order('patient_name', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with cancer recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Cancer Type', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Cancer Type': p.cancer_type || 'Not specified',
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching cancer patients: ' + error.message }
  }
}

async function getHeartDiseasePatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, ncd_conditions, status')
      .eq('fid', facilityId)
      .ilike('ncd_conditions', '%Heart%|%Cardiac%|%CVD%')
      .order('patient_name', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with heart disease recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Condition', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Condition': p.ncd_conditions || 'Cardiac disease',
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching heart disease patients: ' + error.message }
  }
}

async function getCKDPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, ncd_conditions, ckd_stage, status')
      .eq('fid', facilityId)
      .ilike('ncd_conditions', '%CKD%|%Kidney%|%Renal%')
      .order('patient_name', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with chronic kidney disease recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'CKD Stage', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'CKD Stage': p.ckd_stage || 'Not determined',
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching CKD patients: ' + error.message }
  }
}

async function getMentalHealthPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, ncd_conditions, status')
      .eq('fid', facilityId)
      .ilike('ncd_conditions', '%Mental%|%Depression%|%Anxiety%')
      .order('patient_name', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with mental health conditions recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Condition', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Condition': p.ncd_conditions || 'Mental health',
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching mental health patients: ' + error.message }
  }
}

async function getTuberculosisPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, ncd_conditions, tb_status, status')
      .eq('fid', facilityId)
      .ilike('ncd_conditions', '%TB%|%Tuberculosis%')
      .order('patient_name', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with tuberculosis recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'TB Status', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'TB Status': p.tb_status || 'Active',
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching TB patients: ' + error.message }
  }
}

// ============================================================
// APPOINTMENT HANDLERS
// ============================================================

async function getMissedAppointments(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, last_appointment_date, status')
      .eq('fid', facilityId)
      .in('status', ['Defaulter', 'Lost to Follow-up', 'Inactive'])
      .order('last_appointment_date', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No missed appointments recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Last Appointment', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Last Appointment': formatDate(p.last_appointment_date),
        'Status': p.status || 'Inactive'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching missed appointments: ' + error.message }
  }
}

async function getDueAppointments(facilityId, query) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, appointment_date, status')
      .eq('fid', facilityId)
      .lte('appointment_date', today)
      .order('appointment_date', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No overdue appointments.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Appointment Date', 'Days Overdue'],
      data: data.map(p => {
        const daysOverdue = Math.floor((new Date() - new Date(p.appointment_date)) / (1000 * 60 * 60 * 24))
        return {
          'Patient ID': p.pid,
          'Name': p.patient_name || 'N/A',
          'Appointment Date': formatDate(p.appointment_date),
          'Days Overdue': daysOverdue + ' days'
        }
      })
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching due appointments: ' + error.message }
  }
}

// ============================================================
// TESTING & LAB HANDLERS
// ============================================================

async function getDueForViralLoadTest(facilityId, query) {
  try {
    // VL test due if: last test > 6 months ago or no test recorded
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, viral_load_date, viral_load_copies, status')
      .eq('fid', facilityId)
      .or(`viral_load_date.lt.${sixMonthsAgoStr},viral_load_date.is.null`)
      .order('viral_load_date', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients due for viral load testing.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Last VL Test', 'Last Result'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Last VL Test': formatDate(p.viral_load_date) || 'Never tested',
        'Last Result': p.viral_load_copies ? p.viral_load_copies + ' copies' : 'Not available'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching patients due for VL test: ' + error.message }
  }
}

async function getDueForCD4Test(facilityId, query) {
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, cd4_date, cd4_count, status')
      .eq('fid', facilityId)
      .or(`cd4_date.lt.${sixMonthsAgoStr},cd4_date.is.null`)
      .order('cd4_date', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients due for CD4 testing.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Last CD4 Test', 'Last Count'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Last CD4 Test': formatDate(p.cd4_date) || 'Never tested',
        'Last Count': p.cd4_count ? p.cd4_count + ' cells/mm³' : 'Not available'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching patients due for CD4 test: ' + error.message }
  }
}

async function getOverdueLabTests(facilityId, query) {
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, viral_load_date, cd4_date, status')
      .eq('fid', facilityId)
      .or(`viral_load_date.lt.${sixMonthsAgoStr},cd4_date.lt.${sixMonthsAgoStr}`)
      .order('viral_load_date', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with overdue lab tests.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Last VL', 'Last CD4'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Last VL': formatDate(p.viral_load_date) || 'Never',
        'Last CD4': formatDate(p.cd4_date) || 'Never'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching overdue lab tests: ' + error.message }
  }
}

// ============================================================
// PREGNANCY & MATERNAL HEALTH HANDLERS
// ============================================================

async function getAntenatalPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, pregnancy_status, gestational_weeks, lmp_date')
      .eq('fid', facilityId)
      .eq('pregnancy_status', 'Pregnant')
      .order('lmp_date', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No antenatal patients currently enrolled.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Gestational Weeks', 'LMP Date'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Gestational Weeks': p.gestational_weeks ? p.gestational_weeks + ' weeks' : 'Not determined',
        'LMP Date': formatDate(p.lmp_date) || 'Not recorded'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching antenatal patients: ' + error.message }
  }
}

async function getPostnatalPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, pregnancy_status, delivery_date, postnatal_days')
      .eq('fid', facilityId)
      .eq('pregnancy_status', 'Postnatal')
      .order('delivery_date', { ascending: false })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No postnatal patients currently under care.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Delivery Date', 'Days Postnatal'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Delivery Date': formatDate(p.delivery_date) || 'Not recorded',
        'Days Postnatal': p.postnatal_days ? p.postnatal_days + ' days' : 'Not calculated'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching postnatal patients: ' + error.message }
  }
}

async function getMaternalComplications(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, pregnancy_status, maternal_complication, complication_type')
      .eq('fid', facilityId)
      .eq('maternal_complication', true)
      .order('patient_name', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No maternal complications recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Status', 'Complication Type'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Status': p.pregnancy_status || 'Unknown',
        'Complication Type': p.complication_type || 'Unspecified'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching maternal complications: ' + error.message }
  }
}

// ============================================================
// COMPLICATIONS HANDLERS
// ============================================================

async function getBleeedingPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, bleeding_event, bleeding_date, bleeding_severity, status')
      .eq('fid', facilityId)
      .eq('bleeding_event', true)
      .order('bleeding_date', { ascending: false })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No bleeding events recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Bleeding Date', 'Severity'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Bleeding Date': formatDate(p.bleeding_date) || 'Not recorded',
        'Severity': p.bleeding_severity || 'Unknown'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching bleeding patients: ' + error.message }
  }
}

async function getPatientsWithComplications(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, complication_recorded, complication_type, complication_date')
      .eq('fid', facilityId)
      .eq('complication_recorded', true)
      .order('complication_date', { ascending: false })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No complications recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Complication Type', 'Date'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Complication Type': p.complication_type || 'Adverse event',
        'Date': formatDate(p.complication_date) || 'Not recorded'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching patients with complications: ' + error.message }
  }
}

// ============================================================
// ADHERENCE HANDLERS
// ============================================================

async function getPoorAdherencePatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, adherence_level, last_refill_date, status')
      .eq('fid', facilityId)
      .eq('adherence_level', 'Poor')
      .order('patient_name', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with poor adherence recorded.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Adherence', 'Last Refill'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Adherence': p.adherence_level || 'Poor',
        'Last Refill': formatDate(p.last_refill_date) || 'Not recorded'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching poor adherence patients: ' + error.message }
  }
}

async function getDueForClinicReview(facilityId, query) {
  try {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, last_clinic_visit, status')
      .eq('fid', facilityId)
      .or(`last_clinic_visit.lt.${threeMonthsAgoStr},last_clinic_visit.is.null`)
      .order('last_clinic_visit', { ascending: true })
      .limit(20)

    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients due for clinic review.' }
    }

    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Last Visit', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Last Visit': formatDate(p.last_clinic_visit) || 'Never visited',
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching patients due for review: ' + error.message }
  }
}

// ============================================================
// UTILITIES
// ============================================================

// ============================================================
// EXPANDED HANDLERS (Additional 40+ patterns)
// ============================================================

async function getFirstLineARTPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, art_regimen, art_start_date, status')
      .eq('fid', facilityId)
      .eq('art_line', 'First')
      .order('art_start_date', { ascending: false })
      .limit(50)
    
    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No first-line ART patients found.' }
    }
    
    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Regimen', 'Start Date', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Regimen': p.art_regimen || 'Not specified',
        'Start Date': formatDate(p.art_start_date),
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching first-line ART patients: ' + error.message }
  }
}

async function getSecondLineARTPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, art_regimen, art_line, switch_date, failure_reason')
      .eq('fid', facilityId)
      .eq('art_line', 'Second')
      .order('switch_date', { ascending: false })
      .limit(50)
    
    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No second-line ART patients found.' }
    }
    
    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Current Regimen', 'Switch Date', 'Reason'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Current Regimen': p.art_regimen || 'Not specified',
        'Switch Date': formatDate(p.switch_date),
        'Reason': p.failure_reason || 'Switch required'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching second-line ART patients: ' + error.message }
  }
}

async function getTBHIVCoinfection(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, tb_status, tb_treatment_start, art_status, hiv_status')
      .eq('fid', facilityId)
      .eq('tb_status', 'Active')
      .eq('hiv_status', 'Positive')
      .limit(50)
    
    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No TB/HIV coinfection cases found.' }
    }
    
    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'TB Status', 'TB Start Date', 'HIV Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'TB Status': p.tb_status || 'Unknown',
        'TB Start Date': formatDate(p.tb_treatment_start),
        'HIV Status': p.hiv_status || 'Unknown'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching TB/HIV cases: ' + error.message }
  }
}

async function getOnTBTreatment(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, tb_status, tb_treatment_start, tb_regimen, tb_duration')
      .eq('fid', facilityId)
      .eq('tb_status', 'Active')
      .order('tb_treatment_start', { ascending: false })
      .limit(50)
    
    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients currently on TB treatment.' }
    }
    
    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'TB Regimen', 'Start Date', 'Expected End'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'TB Regimen': p.tb_regimen || 'Not specified',
        'Start Date': formatDate(p.tb_treatment_start),
        'Expected End': p.tb_duration ? calculateEndDate(p.tb_treatment_start, p.tb_duration) : 'N/A'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching TB patients: ' + error.message }
  }
}

async function getUncontrolledHypertension(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, hypertension_status, last_bp_systolic, last_bp_diastolic, last_bp_date')
      .eq('fid', facilityId)
      .eq('hypertension_status', 'Uncontrolled')
      .order('last_bp_date', { ascending: false })
      .limit(50)
    
    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No uncontrolled hypertension cases found.' }
    }
    
    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Last BP', 'BP Date', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Last BP': p.last_bp_systolic && p.last_bp_diastolic ? `${p.last_bp_systolic}/${p.last_bp_diastolic}` : 'N/A',
        'BP Date': formatDate(p.last_bp_date),
        'Status': 'Requires intervention'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching uncontrolled HTN patients: ' + error.message }
  }
}

async function getUncontrolledDiabetes(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, diabetes_status, last_glucose, last_glucose_date, hba1c')
      .eq('fid', facilityId)
      .eq('diabetes_status', 'Uncontrolled')
      .order('last_glucose_date', { ascending: false })
      .limit(50)
    
    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No uncontrolled diabetes cases found.' }
    }
    
    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Last Glucose', 'HbA1c', 'Date'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Last Glucose': p.last_glucose ? p.last_glucose + ' mg/dL' : 'N/A',
        'HbA1c': p.hba1c ? p.hba1c + '%' : 'Not tested',
        'Date': formatDate(p.last_glucose_date)
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching uncontrolled diabetes patients: ' + error.message }
  }
}

async function getFemalePatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, dob, hiv_status, pregnancy_status')
      .eq('fid', facilityId)
      .eq('gender', 'Female')
      .order('patient_name', { ascending: true })
      .limit(100)
    
    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No female patients found.' }
    }
    
    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'HIV Status', 'Pregnancy Status', 'Age'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'HIV Status': p.hiv_status || 'Unknown',
        'Pregnancy Status': p.pregnancy_status || 'Not pregnant',
        'Age': calculateAge(p.dob)
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching female patients: ' + error.message }
  }
}

async function getMalePatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, dob, hiv_status, patient_type')
      .eq('fid', facilityId)
      .eq('gender', 'Male')
      .order('patient_name', { ascending: true })
      .limit(100)
    
    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No male patients found.' }
    }
    
    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'HIV Status', 'Patient Type', 'Age'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'HIV Status': p.hiv_status || 'Unknown',
        'Patient Type': p.patient_type || 'General',
        'Age': calculateAge(p.dob)
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching male patients: ' + error.message }
  }
}

async function getAdolescentPatients(facilityId, query) {
  try {
    const today = new Date()
    const ageThreshold = new Date(today.getFullYear() - 19, today.getMonth(), today.getDate())
    
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, dob, hiv_status, patient_type')
      .eq('fid', facilityId)
      .lte('dob', ageThreshold.toISOString())
      .gte('dob', new Date(today.getFullYear() - 10, today.getMonth(), today.getDate()).toISOString())
      .order('patient_name', { ascending: true })
      .limit(100)
    
    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No adolescent patients (10-19 years) found.' }
    }
    
    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Age', 'HIV Status', 'Patient Type'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Age': calculateAge(p.dob) + ' years',
        'HIV Status': p.hiv_status || 'Unknown',
        'Patient Type': p.patient_type || 'General'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching adolescent patients: ' + error.message }
  }
}

async function getTotalPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_type, hiv_status', { count: 'exact' })
      .eq('fid', facilityId)
    
    if (error) throw error
    
    const total = data ? data.length : 0
    const hiv_positive = data ? data.filter(p => p.hiv_status === 'Positive').length : 0
    const hiv_negative = data ? data.filter(p => p.hiv_status === 'Negative').length : 0
    
    return {
      type: 'text',
      message: `📊 **Facility Patient Summary**\n\n` +
        `✓ Total Patients: **${total}**\n` +
        `🔴 HIV Positive: **${hiv_positive}** (${total > 0 ? ((hiv_positive/total)*100).toFixed(1) : 0}%)\n` +
        `🟢 HIV Negative: **${hiv_negative}** (${total > 0 ? ((hiv_negative/total)*100).toFixed(1) : 0}%)`
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching patient count: ' + error.message }
  }
}

async function getPatientBreakdown(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('patient_type')
      .eq('fid', facilityId)
    
    if (error) throw error
    
    const breakdown = {}
    if (data) {
      data.forEach(p => {
        const type = p.patient_type || 'Unspecified'
        breakdown[type] = (breakdown[type] || 0) + 1
      })
    }
    
    const total = data ? data.length : 0
    const rows = Object.entries(breakdown).map(([type, count]) => ({
      'Patient Type': type,
      'Count': count,
      'Percentage': total > 0 ? ((count/total)*100).toFixed(1) + '%' : '0%'
    }))
    
    return {
      type: 'table',
      columns: ['Patient Type', 'Count', 'Percentage'],
      data: rows
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching patient breakdown: ' + error.message }
  }
}

async function getOverdueRefillPatients(facilityId, query) {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, last_refill_date, medication_regimen, status')
      .eq('fid', facilityId)
      .lt('last_refill_date', thirtyDaysAgoStr)
      .order('last_refill_date', { ascending: true })
      .limit(50)
    
    if (error) throw error
    if (!data || data.length === 0) {
      return { type: 'text', message: 'No patients with overdue refills.' }
    }
    
    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Last Refill', 'Regimen', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Last Refill': formatDate(p.last_refill_date),
        'Regimen': p.medication_regimen || 'Not specified',
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error fetching overdue refill patients: ' + error.message }
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function calculateAge(dob) {
  if (!dob) return 'N/A'
  try {
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  } catch {
    return 'N/A'
  }
}

function calculateEndDate(startDate, durationMonths) {
  if (!startDate || !durationMonths) return 'N/A'
  try {
    const end = new Date(startDate)
    end.setMonth(end.getMonth() + parseInt(durationMonths))
    return formatDate(end.toISOString().split('T')[0])
  } catch {
    return 'N/A'
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateStr
  }
}
