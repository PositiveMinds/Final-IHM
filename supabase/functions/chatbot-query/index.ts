import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// TYPES & INTERFACES
// ============================================================

interface QueryParams {
  query: string;
  facility_id: string;
  handler?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

interface Alert {
  severity: "critical" | "warning" | "info";
  message: string;
  icon: string;
}

interface QueryLog {
  facility_id: string;
  query: string;
  handler: string;
  timestamp: string;
}

// ============================================================
// QUERY PATTERNS & HANDLERS MAPPING
// ============================================================

const HANDLERS: Record<string, (facilityId: string, query: string, params?: any) => Promise<any>> = {
  // Appointments
  getAppointments: getAppointments,
  getAppointmentsToday: getAppointmentsToday,
  getAppointmentsThisWeek: getAppointmentsThisWeek,
  getAppointmentsLastWeek: getAppointmentsLastWeek,
  getAppointmentsNextWeek: getAppointmentsNextWeek,
  getAppointmentsThisMonth: getAppointmentsThisMonth,
  getAppointmentsLastMonth: getAppointmentsLastMonth,
  getAppointmentsNextMonth: getAppointmentsNextMonth,
  getAppointmentsPast30Days: getAppointmentsPast30Days,
  getAppointmentsNext30Days: getAppointmentsNext30Days,
  getMissedAppointments: getMissedAppointments,
  getDueAppointments: getDueAppointments,

  // Patient counts & demographics
  getARTPatients: getARTPatients,
  getTotalPatients: getTotalPatients,
  getFemalePatients: getFemalePatients,
  getMalePatients: getMalePatients,
  getNewPatients: getNewPatients,

  // Viral load
  getHighViralLoadPatients: getHighViralLoadPatients,
  getUndetectablePatients: getUndetectablePatients,
  getDueForViralLoadTest: getDueForViralLoadTest,

  // CD4
  getLowCD4Patients: getLowCD4Patients,
  getDueForCD4Test: getDueForCD4Test,

  // NCDs
  getDiabetesPatients: getDiabetesPatients,
  getHypertensionPatients: getHypertensionPatients,
  getAsthmaPatients: getAsthmaPatients,
  getCancerPatients: getCancerPatients,
  getHeartDiseasePatients: getHeartDiseasePatients,
  getCKDPatients: getCKDPatients,
  getMentalHealthPatients: getMentalHealthPatients,
  getTuberculosisPatients: getTuberculosisPatients,

  // Additional handlers
  getPatientsByStatus: getPatientsByStatus,
  getPatientsWithComplications: getPatientsWithComplications,
  getOverdueRefillPatients: getOverdueRefillPatients,
  getPatientProfile: getPatientProfile,
  getHighRiskPatients: getHighRiskPatients,
  getCriticalPatients: getCriticalPatients,
  getIACPatients: getIACPatients,
  getDueForBleedingTest: getDueForBleedingTest,
};

// ============================================================
// MAIN REQUEST HANDLER
// ============================================================

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for full data access
    const supabaseUrl = Deno.env.get("DB_URL");
    const supabaseKey = Deno.env.get("DB_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing environment variables - URL:", !!supabaseUrl, "KEY:", !!supabaseKey);
      return new Response(
        JSON.stringify({ 
          error: "Edge function not configured",
          details: `DB_URL: ${!!supabaseUrl}, DB_KEY: ${!!supabaseKey}`
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { query, facility_id, handler, startDate, endDate, status, sortBy, page = 1, limit = 50 } = await req.json();

    if (!query || !facility_id) {
      return new Response(
        JSON.stringify({ error: "Missing query or facility_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate facility exists
    const { data: facility, error: facilityError } = await supabase
      .from("facilities")
      .select("fid")
      .eq("fid", facility_id)
      .single();

    if (facilityError || !facility) {
      return new Response(
        JSON.stringify({ error: "Facility not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse time period from query
    const timePeriod = parseTimePeriod(query);

    // Create params object
    const params = {
      startDate: startDate || timePeriod.startDate,
      endDate: endDate || timePeriod.endDate,
      status,
      sortBy: sortBy || "default",
      page,
      limit,
    };

    // Determine which handler to use
    let handlerFunc: ((facilityId: string, query: string, params?: any) => Promise<any>) | null = null;
    let handlerName = handler || "";

    if (handler && HANDLERS[handler]) {
      handlerFunc = HANDLERS[handler];
      handlerName = handler;
    } else {
      const result = findBestHandler(query);
      handlerFunc = result.handler;
      handlerName = result.name;
    }

    if (!handlerFunc) {
      return new Response(
        JSON.stringify({
          type: "text",
          message:
            "I couldn't understand that query. Try asking about: patients, appointments, viral load, CD4 count, medications, or patient demographics.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log query (async, non-blocking)
    logQuery(facility_id, query, handlerName).catch(console.error);

    // Execute handler
    const result = await handlerFunc(facility_id, query, params);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function parseTimePeriod(query: string): { startDate?: string; endDate?: string } {
  const lowerQuery = query.toLowerCase();
  const today = new Date();
  const endDate = today.toISOString().split("T")[0];
  let startDate: string | undefined;

  // This quarter / 90 days
  if (lowerQuery.includes("quarter") || lowerQuery.includes("90 day")) {
    startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  }
  // Last 30 days / month
  else if (lowerQuery.includes("30 day") || lowerQuery.includes("last month") || lowerQuery.includes("this month")) {
    startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  }
  // Last week / 7 days (Monday to Sunday)
  else if (lowerQuery.includes("week") || lowerQuery.includes("7 day")) {
    // Calculate current week's Monday
    const dayOfWeek = today.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 6 days from Monday
    const lastMonday = new Date(today.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
    startDate = lastMonday.toISOString().split("T")[0];
  }
  // Last year
  else if (lowerQuery.includes("year")) {
    startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  }
  // Since January
  else if (lowerQuery.includes("since january")) {
    startDate = `${today.getFullYear()}-01-01`;
  }

  return { startDate, endDate };
}

async function logQuery(facilityId: string, query: string, handler: string) {
  try {
    await supabase.from("query_logs").insert({
      facility_id: facilityId,
      query,
      handler,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Silently fail - logging shouldn't break the request
    console.error("Query logging error:", error);
  }
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function calculateAge(dobString: string | null | undefined): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function calculateRiskScore(patient: any): number {
  let score = 0;
  if (patient.last_viral_load && patient.last_viral_load > 1000) score += 30;
  if (patient.last_cd4_count && patient.last_cd4_count < 200) score += 30;
  if (patient.medication_adherence && patient.medication_adherence < 0.85) score += 20;
  if (patient.last_cd4_count && patient.last_cd4_count < 50) score += 20;
  return Math.min(100, score);
}

function generateAlerts(data: any[]): Alert[] {
  const alerts: Alert[] = [];

  const criticalVL = data.filter((p: any) => p.last_viral_load && p.last_viral_load > 100000);
  if (criticalVL.length > 0) {
    alerts.push({
      severity: "critical",
      icon: "🚨",
      message: `${criticalVL.length} patient(s) with critical viral load (>100k)`,
    });
  }

  const criticalCD4 = data.filter((p: any) => p.last_cd4_count && p.last_cd4_count < 50);
  if (criticalCD4.length > 0) {
    alerts.push({
      severity: "critical",
      icon: "🚨",
      message: `${criticalCD4.length} patient(s) with critical CD4 (<50)`,
    });
  }

  const highVL = data.filter((p: any) => p.last_viral_load && p.last_viral_load > 10000 && p.last_viral_load <= 100000);
  if (highVL.length > 0) {
    alerts.push({
      severity: "warning",
      icon: "🟡",
      message: `${highVL.length} patient(s) with high viral load (10k-100k)`,
    });
  }

  return alerts;
}

function paginateData(data: any[], page: number = 1, limit: number = 50) {
  const start = (page - 1) * limit;
  const paginatedData = data.slice(start, start + limit);
  const hasMore = start + limit < data.length;
  const totalPages = Math.ceil(data.length / limit);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      totalRecords: data.length,
      totalPages,
      hasMore,
      showing: `${Math.min(start + 1, data.length)}-${Math.min(start + limit, data.length)} of ${data.length}`,
    },
  };
}

// ============================================================
// HANDLER: APPOINTMENTS
// ============================================================

async function getAppointments(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("appointments")
    .select("apid, pid, appointment_date, appointment_type, status")
    .eq("fid", facilityId)
    .order("appointment_date", { ascending: false })
    .limit(100);

  if (error || !data?.length) {
    return { type: "text", message: "No appointments found." };
  }

  const filtered = applyFilters(data, params);
  const { data: paginatedData, pagination } = paginateData(filtered, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Appointment ID", "Patient ID", "Date", "Type", "Status"],
    data: paginatedData.map((a: any) => ({
      "Appointment ID": a.apid,
      "Patient ID": a.pid,
      Date: formatDate(a.appointment_date),
      Type: a.appointment_type || "Follow-up",
      Status: a.status || "Scheduled",
    })),
    pagination,
  };
}

async function getAppointmentsToday(facilityId: string, query: string, params?: any) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("apid, pid, appointment_date, appointment_type, status")
    .eq("fid", facilityId)
    .eq("appointment_date", today)
    .order("appointment_date", { ascending: true });

  if (error || !data?.length) {
    return { type: "text", message: `No appointments scheduled for ${today}.` };
  }

  return {
    type: "table",
    columns: ["Appointment ID", "Patient ID", "Date", "Type", "Status"],
    data: data.map((a: any) => ({
      "Appointment ID": a.apid,
      "Patient ID": a.pid,
      Date: formatDate(a.appointment_date),
      Type: a.appointment_type || "Follow-up",
      Status: a.status || "Scheduled",
    })),
  };
}

async function getAppointmentsThisWeek(facilityId: string, query: string, params?: any) {
  const today = new Date();
  
  // Calculate week boundaries (Monday to Sunday)
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 6 days from Monday
  const weekMonday = new Date(today.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
  const weekSunday = new Date(weekMonday.getTime() + 6 * 24 * 60 * 60 * 1000);

  const weekMondayStr = weekMonday.toISOString().split("T")[0];
  const weekSundayStr = weekSunday.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("apid, pid, appointment_date, appointment_type, status")
    .eq("fid", facilityId)
    .gte("appointment_date", weekMondayStr)
    .lte("appointment_date", weekSundayStr)
    .order("appointment_date", { ascending: true });

  if (error || !data?.length) {
    return { type: "text", message: "No appointments scheduled for this week." };
  }

  return {
    type: "table",
    columns: ["Appointment ID", "Patient ID", "Date", "Type", "Status"],
    data: data.map((a: any) => ({
      "Appointment ID": a.apid,
      "Patient ID": a.pid,
      Date: formatDate(a.appointment_date),
      Type: a.appointment_type || "Follow-up",
      Status: a.status || "Scheduled",
    })),
  };
}

async function getAppointmentsLastWeek(facilityId: string, query: string, params?: any) {
  const today = new Date();
  
  // Calculate last week boundaries (Monday to Sunday)
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisWeekMonday = new Date(today.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
  const lastWeekSunday = new Date(thisWeekMonday.getTime() - 24 * 60 * 60 * 1000);
  const lastWeekMonday = new Date(lastWeekSunday.getTime() - 6 * 24 * 60 * 60 * 1000);

  const lastWeekMondayStr = lastWeekMonday.toISOString().split("T")[0];
  const lastWeekSundayStr = lastWeekSunday.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("apid, pid, appointment_date, appointment_type, status")
    .eq("fid", facilityId)
    .gte("appointment_date", lastWeekMondayStr)
    .lte("appointment_date", lastWeekSundayStr)
    .order("appointment_date", { ascending: true });

  if (error || !data?.length) {
    return { type: "text", message: "No appointments scheduled for last week." };
  }

  return {
    type: "table",
    columns: ["Appointment ID", "Patient ID", "Date", "Type", "Status"],
    data: data.map((a: any) => ({
      "Appointment ID": a.apid,
      "Patient ID": a.pid,
      Date: formatDate(a.appointment_date),
      Type: a.appointment_type || "Follow-up",
      Status: a.status || "Scheduled",
    })),
  };
}

async function getAppointmentsNextWeek(facilityId: string, query: string, params?: any) {
  const today = new Date();
  
  // Calculate week boundaries (Monday to Sunday)
  // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = today.getDay();
  
  // Calculate Monday of the next week
  // If today is Monday (1), next Monday is 7 days away
  // If today is Sunday (0), next Monday is 1 day away
  const daysUntilNextMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  const nextMonday = new Date(today.getTime() + daysUntilNextMonday * 24 * 60 * 60 * 1000);
  
  // Sunday of next week is 6 days after Monday
  const nextSunday = new Date(nextMonday.getTime() + 6 * 24 * 60 * 60 * 1000);

  const nextMondayStr = nextMonday.toISOString().split("T")[0];
  const nextSundayStr = nextSunday.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("apid, pid, appointment_date, appointment_type, status")
    .eq("fid", facilityId)
    .gte("appointment_date", nextMondayStr)
    .lte("appointment_date", nextSundayStr)
    .order("appointment_date", { ascending: true });

  if (error || !data?.length) {
    return { type: "text", message: "No appointments scheduled for next week." };
  }

  return {
    type: "table",
    columns: ["Appointment ID", "Patient ID", "Date", "Type", "Status"],
    data: data.map((a: any) => ({
      "Appointment ID": a.apid,
      "Patient ID": a.pid,
      Date: formatDate(a.appointment_date),
      Type: a.appointment_type || "Follow-up",
      Status: a.status || "Scheduled",
    })),
  };
}

async function getAppointmentsThisMonth(facilityId: string, query: string, params?: any) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Calculate the first and last day of current month
  const thisMonthStart = new Date(currentYear, currentMonth, 1);
  const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0);

  const thisMonthStartStr = thisMonthStart.toISOString().split("T")[0];
  const thisMonthEndStr = thisMonthEnd.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("apid, pid, appointment_date, appointment_type, status")
    .eq("fid", facilityId)
    .gte("appointment_date", thisMonthStartStr)
    .lte("appointment_date", thisMonthEndStr)
    .order("appointment_date", { ascending: true });

  if (error || !data?.length) {
    return { type: "text", message: "No appointments scheduled for this month." };
  }

  return {
    type: "table",
    columns: ["Appointment ID", "Patient ID", "Date", "Type", "Status"],
    data: data.map((a: any) => ({
      "Appointment ID": a.apid,
      "Patient ID": a.pid,
      Date: formatDate(a.appointment_date),
      Type: a.appointment_type || "Follow-up",
      Status: a.status || "Scheduled",
    })),
  };
}

async function getAppointmentsLastMonth(facilityId: string, query: string, params?: any) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Calculate the first and last day of last month
  const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthEnd = new Date(currentYear, currentMonth, 0);

  const lastMonthStartStr = lastMonthStart.toISOString().split("T")[0];
  const lastMonthEndStr = lastMonthEnd.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("apid, pid, appointment_date, appointment_type, status")
    .eq("fid", facilityId)
    .gte("appointment_date", lastMonthStartStr)
    .lte("appointment_date", lastMonthEndStr)
    .order("appointment_date", { ascending: true });

  if (error || !data?.length) {
    return { type: "text", message: "No appointments scheduled for last month." };
  }

  return {
    type: "table",
    columns: ["Appointment ID", "Patient ID", "Date", "Type", "Status"],
    data: data.map((a: any) => ({
      "Appointment ID": a.apid,
      "Patient ID": a.pid,
      Date: formatDate(a.appointment_date),
      Type: a.appointment_type || "Follow-up",
      Status: a.status || "Scheduled",
    })),
  };
}

async function getAppointmentsNextMonth(facilityId: string, query: string, params?: any) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Calculate the first day of next month
  const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);
  // Calculate the last day of next month
  const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0);

  const nextMonthStartStr = nextMonthStart.toISOString().split("T")[0];
  const nextMonthEndStr = nextMonthEnd.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("apid, pid, appointment_date, appointment_type, status")
    .eq("fid", facilityId)
    .gte("appointment_date", nextMonthStartStr)
    .lte("appointment_date", nextMonthEndStr)
    .order("appointment_date", { ascending: true });

  if (error || !data?.length) {
    return { type: "text", message: "No appointments scheduled for next month." };
  }

  return {
    type: "table",
    columns: ["Appointment ID", "Patient ID", "Date", "Type", "Status"],
    data: data.map((a: any) => ({
      "Appointment ID": a.apid,
      "Patient ID": a.pid,
      Date: formatDate(a.appointment_date),
      Type: a.appointment_type || "Follow-up",
      Status: a.status || "Scheduled",
    })),
  };
}

async function getAppointmentsPast30Days(facilityId: string, query: string, params?: any) {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];
  const todayStr = today.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("apid, pid, appointment_date, appointment_type, status")
    .eq("fid", facilityId)
    .gte("appointment_date", thirtyDaysAgoStr)
    .lte("appointment_date", todayStr)
    .order("appointment_date", { ascending: false });

  if (error || !data?.length) {
    return { type: "text", message: "No appointments found in the last 30 days." };
  }

  return {
    type: "table",
    columns: ["Appointment ID", "Patient ID", "Date", "Type", "Status"],
    data: data.map((a: any) => ({
      "Appointment ID": a.apid,
      "Patient ID": a.pid,
      Date: formatDate(a.appointment_date),
      Type: a.appointment_type || "Follow-up",
      Status: a.status || "Scheduled",
    })),
  };
}

async function getAppointmentsNext30Days(facilityId: string, query: string, params?: any) {
  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const todayStr = today.toISOString().split("T")[0];
  const in30DaysStr = in30Days.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("apid, pid, appointment_date, appointment_type, status")
    .eq("fid", facilityId)
    .gte("appointment_date", todayStr)
    .lte("appointment_date", in30DaysStr)
    .order("appointment_date", { ascending: true });

  if (error || !data?.length) {
    return { type: "text", message: "No appointments scheduled for the next 30 days." };
  }

  return {
    type: "table",
    columns: ["Appointment ID", "Patient ID", "Date", "Type", "Status"],
    data: data.map((a: any) => ({
      "Appointment ID": a.apid,
      "Patient ID": a.pid,
      Date: formatDate(a.appointment_date),
      Type: a.appointment_type || "Follow-up",
      Status: a.status || "Scheduled",
    })),
  };
}

async function getMissedAppointments(facilityId: string, query: string, params?: any) {
  let queryObj = supabase
    .from("appointments")
    .select("apid, pid, appointment_date, appointment_type, status")
    .eq("fid", facilityId)
    .eq("status", "Missed");

  // Apply date filters
  if (params?.startDate) {
    queryObj = queryObj.gte("appointment_date", params.startDate);
  }
  if (params?.endDate) {
    queryObj = queryObj.lte("appointment_date", params.endDate);
  }

  const { data, error } = await queryObj.order("appointment_date", { ascending: false }).limit(100);

  if (error || !data?.length) {
    return {
      type: "text",
      message: params?.startDate ? `No missed appointments found in date range.` : "No missed appointments found.",
    };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Appointment ID", "Patient ID", "Date", "Type", "Status"],
    data: paginatedData.map((a: any) => ({
      "Appointment ID": a.apid,
      "Patient ID": a.pid,
      Date: formatDate(a.appointment_date),
      Type: a.appointment_type || "Follow-up",
      Status: a.status,
    })),
    pagination,
    summary: `⚠️ ${data.length} missed appointments${params?.startDate ? " in period" : ""}`,
  };
}

async function getDueAppointments(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("appointments")
    .select("apid, pid, appointment_date, appointment_type, status")
    .eq("fid", facilityId)
    .eq("status", "Pending")
    .order("appointment_date", { ascending: true })
    .limit(100);

  if (error || !data?.length) {
    return { type: "text", message: "No pending appointments found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Appointment ID", "Patient ID", "Date", "Type", "Status"],
    data: paginatedData.map((a: any) => ({
      "Appointment ID": a.apid,
      "Patient ID": a.pid,
      Date: formatDate(a.appointment_date),
      Type: a.appointment_type || "Follow-up",
      Status: a.status,
    })),
    pagination,
  };
}

// ============================================================
// HANDLER: PATIENTS - GENERAL & DEMOGRAPHICS
// ============================================================

async function getTotalPatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, hiv_status, gender, registration_date")
    .eq("fid", facilityId);

  if (error || !data) {
    return { type: "text", message: "Error fetching patient count." };
  }

  const total = data.length;
  const hiv_positive = data.filter((p: any) => p.hiv_status === "Positive").length;
  const hiv_negative = data.filter((p: any) => p.hiv_status === "Negative").length;
  const female = data.filter((p: any) => p.gender === "Female").length;
  const male = data.filter((p: any) => p.gender === "Male").length;

  const suppressed = data.filter((p: any) => p.hiv_status === "Positive" && p.last_viral_load && p.last_viral_load <= 50)
    .length;
  const suppressionRate = hiv_positive > 0 ? ((suppressed / hiv_positive) * 100).toFixed(1) : 0;

  return {
    type: "text",
    message:
      `📊 **Facility Patient Summary**\n\n` +
      `✓ Total Patients: **${total}**\n` +
      `🔴 HIV Positive: **${hiv_positive}** (${total > 0 ? ((hiv_positive / total) * 100).toFixed(1) : 0}%)\n` +
      `🟢 HIV Negative: **${hiv_negative}** (${total > 0 ? ((hiv_negative / total) * 100).toFixed(1) : 0}%)\n\n` +
      `👩 Female: **${female}** | 👨 Male: **${male}**\n\n` +
      `💊 **Viral Suppression**: **${suppressed}/${hiv_positive}** patients (${suppressionRate}%)\n` +
      `📈 National avg: 85% | **Your facility: ${suppressionRate}%**`,
    alerts: generateAlerts(data.filter((p: any) => p.hiv_status === "Positive")),
  };
}

async function getFemalePatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, dob, hiv_status, last_viral_load")
    .eq("fid", facilityId)
    .eq("gender", "Female")
    .order("patient_name", { ascending: true })
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No female patients found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Age", "HIV Status", "Viral Load"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Age: calculateAge(p.dob),
      "HIV Status": p.hiv_status || "Unknown",
      "Viral Load": p.last_viral_load ? (p.last_viral_load <= 50 ? "Suppressed" : p.last_viral_load.toLocaleString()) : "Unknown",
    })),
    pagination,
  };
}

async function getMalePatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, dob, hiv_status, last_viral_load")
    .eq("fid", facilityId)
    .eq("gender", "Male")
    .order("patient_name", { ascending: true })
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No male patients found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Age", "HIV Status", "Viral Load"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Age: calculateAge(p.dob),
      "HIV Status": p.hiv_status || "Unknown",
      "Viral Load": p.last_viral_load ? (p.last_viral_load <= 50 ? "Suppressed" : p.last_viral_load.toLocaleString()) : "Unknown",
    })),
    pagination,
  };
}

async function getARTPatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, hiv_status, medication_regimen, status, last_viral_load")
    .eq("fid", facilityId)
    .eq("hiv_status", "Positive")
    .order("patient_name", { ascending: true })
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No HIV-positive patients found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Regimen", "Status", "Viral Load"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Regimen: p.medication_regimen || "Not specified",
      Status: p.status || "Active",
      "Viral Load": p.last_viral_load ? (p.last_viral_load <= 50 ? "Suppressed" : p.last_viral_load.toLocaleString()) : "Unknown",
    })),
    pagination,
  };
}

async function getNewPatients(facilityId: string, query: string, params?: any) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateThreshold = thirtyDaysAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, registration_date, hiv_status")
    .eq("fid", facilityId)
    .gte("registration_date", dateThreshold)
    .order("registration_date", { ascending: false })
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No new patients in the last 30 days." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Registration Date", "HIV Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      "Registration Date": formatDate(p.registration_date),
      "HIV Status": p.hiv_status || "Unknown",
    })),
    pagination,
    summary: `✨ ${data.length} new patient(s) registered in last 30 days`,
  };
}

// ============================================================
// HANDLER: VIRAL LOAD
// ============================================================

async function getHighViralLoadPatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, last_viral_load, last_viral_load_date, medication_regimen")
    .eq("fid", facilityId)
    .gt("last_viral_load", 1000)
    .order("last_viral_load", { ascending: false })
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No patients with high viral load found." };
  }

  // Fetch next appointments for all patients
  const pids = data.map((p: any) => p.pid);
  const { data: appointmentData } = await supabase
    .from("appointments")
    .select("patient_id, appointment_date")
    .in("patient_id", pids)
    .gte("appointment_date", new Date().toISOString())
    .order("appointment_date", { ascending: true });

  const appointmentMap: Record<string, string> = {};
  appointmentData?.forEach((apt: any) => {
    if (!appointmentMap[apt.patient_id]) {
      appointmentMap[apt.patient_id] = formatDate(apt.appointment_date);
    }
  });

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);
  const alerts = generateAlerts(data);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Viral Load", "Last Test", "Next Appointment", "Regimen"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      "Viral Load": p.last_viral_load ? p.last_viral_load.toLocaleString() + " copies/mL" : "Unknown",
      "Last Test": formatDate(p.last_viral_load_date),
      "Next Appointment": appointmentMap[p.pid] || "None scheduled",
      Regimen: p.medication_regimen || "Not specified",
    })),
    pagination,
    alerts,
    summary: `⚠️ ${data.length} patient(s) with elevated viral load (>1000)`,
  };
}

async function getUndetectablePatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, last_viral_load, last_viral_load_date")
    .eq("fid", facilityId)
    .lte("last_viral_load", 50)
    .order("last_viral_load_date", { ascending: false })
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No patients with undetectable viral load found." };
  }

  // Fetch next appointments for all patients
  const pids = data.map((p: any) => p.pid);
  const { data: appointmentData } = await supabase
    .from("appointments")
    .select("patient_id, appointment_date")
    .in("patient_id", pids)
    .gte("appointment_date", new Date().toISOString())
    .order("appointment_date", { ascending: true });

  const appointmentMap: Record<string, string> = {};
  appointmentData?.forEach((apt: any) => {
    if (!appointmentMap[apt.patient_id]) {
      appointmentMap[apt.patient_id] = formatDate(apt.appointment_date);
    }
  });

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Viral Load", "Last Test", "Next Appointment"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      "Viral Load": "Undetectable (<50 copies/mL)",
      "Last Test": formatDate(p.last_viral_load_date),
      "Next Appointment": appointmentMap[p.pid] || "None scheduled",
    })),
    pagination,
    summary: `💊 ${data.length} patient(s) with undetectable viral load (U=U)`,
  };
}

async function getDueForViralLoadTest(facilityId: string, query: string, params?: any) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const dateThreshold = sixMonthsAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, last_viral_load_date, medication_regimen")
    .eq("fid", facilityId)
    .eq("hiv_status", "Positive")
    .lt("last_viral_load_date", dateThreshold)
    .order("last_viral_load_date", { ascending: true })
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No patients due for viral load testing." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);
  const maxOverdue = Math.max(...data.map((p: any) => {
    const lastTest = new Date(p.last_viral_load_date);
    const today = new Date();
    return Math.floor((today.getTime() - lastTest.getTime()) / (1000 * 60 * 60 * 24));
  }));

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Last Test", "Days Overdue"],
    data: paginatedData.map((p: any) => {
      const lastTest = new Date(p.last_viral_load_date);
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - lastTest.getTime()) / (1000 * 60 * 60 * 24));
      return {
        "Patient ID": p.pid,
        Name: p.patient_name || "N/A",
        "Last Test": formatDate(p.last_viral_load_date),
        "Days Overdue": daysOverdue,
      };
    }),
    pagination,
    alerts: [
      {
        severity: "warning",
        icon: "🟡",
        message: `${data.length} patients due for VL testing (highest overdue: ${maxOverdue} days)`,
      },
    ],
    recommendations: [`Suggest calling patient ${paginatedData[0]?.["Patient ID"]} (${paginatedData[0]?.["Days Overdue"]} days overdue)`],
  };
}

// ============================================================
// HANDLER: CD4
// ============================================================

async function getLowCD4Patients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, last_cd4_count, last_cd4_date, medication_regimen")
    .eq("fid", facilityId)
    .lt("last_cd4_count", 200)
    .order("last_cd4_count", { ascending: true })
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No patients with low CD4 count found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);
  const alerts = generateAlerts(data);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "CD4 Count", "Last Test", "Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      "CD4 Count": p.last_cd4_count ? p.last_cd4_count + " cells/μL" : "Unknown",
      "Last Test": formatDate(p.last_cd4_date),
      Status: p.last_cd4_count < 50 ? "🚨 CRITICAL" : "🟡 Warning",
    })),
    pagination,
    alerts,
  };
}

async function getDueForCD4Test(facilityId: string, query: string, params?: any) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const dateThreshold = sixMonthsAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, last_cd4_date")
    .eq("fid", facilityId)
    .eq("hiv_status", "Positive")
    .lt("last_cd4_date", dateThreshold)
    .order("last_cd4_date", { ascending: true })
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No patients due for CD4 testing." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Last Test", "Days Overdue"],
    data: paginatedData.map((p: any) => {
      const lastTest = new Date(p.last_cd4_date);
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - lastTest.getTime()) / (1000 * 60 * 60 * 24));
      return {
        "Patient ID": p.pid,
        Name: p.patient_name || "N/A",
        "Last Test": formatDate(p.last_cd4_date),
        "Days Overdue": daysOverdue,
      };
    }),
    pagination,
  };
}

// ============================================================
// HANDLER: NCDs (Non-Communicable Diseases)
// ============================================================

async function getDiabetesPatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, last_glucose, hba1c, last_glucose_date")
    .eq("fid", facilityId)
    .like("chronic_conditions", "%Diabetes%")
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No diabetes patients found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Last Glucose", "HbA1c", "Last Test"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      "Last Glucose": p.last_glucose ? p.last_glucose + " mg/dL" : "Not tested",
      HbA1c: p.hba1c ? p.hba1c + "%" : "Not tested",
      "Last Test": formatDate(p.last_glucose_date),
    })),
    pagination,
  };
}

async function getHypertensionPatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, chronic_conditions, status")
    .eq("fid", facilityId)
    .like("chronic_conditions", "%Hypertension%")
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No hypertension patients found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Condition", "Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Condition: "Hypertension",
      Status: p.status || "Active",
    })),
    pagination,
  };
}

async function getAsthmaPatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, chronic_conditions, status")
    .eq("fid", facilityId)
    .like("chronic_conditions", "%Asthma%")
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No asthma patients found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Condition", "Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Condition: "Asthma",
      Status: p.status || "Active",
    })),
    pagination,
  };
}

async function getCancerPatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, chronic_conditions, status")
    .eq("fid", facilityId)
    .like("chronic_conditions", "%Cancer%")
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No cancer patients found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Condition", "Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Condition: "Cancer",
      Status: p.status || "Active",
    })),
    pagination,
  };
}

async function getHeartDiseasePatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, chronic_conditions, status")
    .eq("fid", facilityId)
    .like("chronic_conditions", "%Heart%")
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No heart disease patients found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Condition", "Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Condition: "Heart Disease",
      Status: p.status || "Active",
    })),
    pagination,
  };
}

async function getCKDPatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, chronic_conditions, status")
    .eq("fid", facilityId)
    .like("chronic_conditions", "%CKD%")
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No CKD patients found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Condition", "Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Condition: "Chronic Kidney Disease",
      Status: p.status || "Active",
    })),
    pagination,
  };
}

async function getMentalHealthPatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, chronic_conditions, status")
    .eq("fid", facilityId)
    .like("chronic_conditions", "%Mental%")
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No mental health patients found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Condition", "Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Condition: "Mental Health",
      Status: p.status || "Active",
    })),
    pagination,
  };
}

async function getTuberculosisPatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, chronic_conditions, status")
    .eq("fid", facilityId)
    .like("chronic_conditions", "%TB%")
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No tuberculosis patients found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Condition", "Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Condition: "Tuberculosis",
      Status: p.status || "Active",
    })),
    pagination,
  };
}

// ============================================================
// HANDLER: PATIENT PROFILE (NEW)
// ============================================================

async function getPatientProfile(facilityId: string, query: string, params?: any) {
  // Extract patient ID from query (e.g., "tell me about patient PID123")
  const pidMatch = query.match(/([A-Z0-9]+)/i);
  if (!pidMatch) {
    return { type: "text", message: "Please specify patient ID (e.g., 'tell me about patient PID123')" };
  }

  const patientId = pidMatch[0];

  const { data: patient, error } = await supabase
    .from("patients")
    .select(
      "pid, patient_name, dob, gender, hiv_status, last_viral_load, last_viral_load_date, last_cd4_count, last_cd4_date, medication_regimen, status, chronic_conditions"
    )
    .eq("fid", facilityId)
    .eq("pid", patientId)
    .single();

  if (error || !patient) {
    return { type: "text", message: `Patient ${patientId} not found.` };
  }

  const riskScore = calculateRiskScore(patient);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("appointment_date, status")
    .eq("pid", patientId)
    .order("appointment_date", { ascending: false })
    .limit(5);

  return {
    type: "text",
    message:
      `📋 **Patient Profile: ${patient.patient_name}**\n\n` +
      `**Demographics:**\n` +
      `- ID: ${patient.pid}\n` +
      `- Age: ${calculateAge(patient.dob)} years\n` +
      `- Gender: ${patient.gender}\n\n` +
      `**HIV Status:**\n` +
      `- Status: ${patient.hiv_status}\n` +
      `- Regimen: ${patient.medication_regimen || "Not specified"}\n` +
      `- Current Status: ${patient.status || "Active"}\n\n` +
      `**Lab Results:**\n` +
      `- Viral Load: ${patient.last_viral_load ? (patient.last_viral_load <= 50 ? "Suppressed (<50)" : patient.last_viral_load.toLocaleString() + " copies/mL") : "Not tested"} (${formatDate(patient.last_viral_load_date)})\n` +
      `- CD4: ${patient.last_cd4_count || "Not tested"} cells/μL (${formatDate(patient.last_cd4_date)})\n\n` +
      `**Chronic Conditions:**\n` +
      `${patient.chronic_conditions || "None recorded"}\n\n` +
      `**Risk Score:** ${riskScore}/100 ${riskScore > 60 ? "🚨" : riskScore > 30 ? "🟡" : "✅"}\n\n` +
      `**Recent Appointments:**\n` +
      (appointments?.length
        ? appointments.map((a: any) => `- ${formatDate(a.appointment_date)}: ${a.status}`).join("\n")
        : "None scheduled"),
  };
}

// ============================================================
// HANDLER: HIGH-RISK PATIENTS (NEW)
// ============================================================

async function getHighRiskPatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, last_viral_load, last_cd4_count, medication_regimen, status, hiv_status")
    .eq("fid", facilityId)
    .eq("hiv_status", "Positive")
    .limit(500);

  if (error || !data?.length) {
    return { type: "text", message: "No patients found." };
  }

  // Calculate risk scores and sort
  const withRiskScores = data.map((p: any) => ({
    ...p,
    riskScore: calculateRiskScore(p),
  }));

  const highRiskPatients = withRiskScores.filter((p: any) => p.riskScore >= 50).sort((a: any, b: any) => b.riskScore - a.riskScore);

  if (!highRiskPatients.length) {
    return { type: "text", message: "No high-risk patients identified." };
  }

  const { data: paginatedData, pagination } = paginateData(highRiskPatients, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Viral Load", "CD4", "Risk Score", "Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      "Viral Load": p.last_viral_load ? (p.last_viral_load <= 50 ? "Suppressed" : p.last_viral_load.toLocaleString()) : "Unknown",
      CD4: p.last_cd4_count || "Unknown",
      "Risk Score": `${p.riskScore}/100 ${p.riskScore > 70 ? "🚨" : "🟡"}`,
      Status: p.status || "Active",
    })),
    pagination,
    alerts: [
      {
        severity: "warning",
        icon: "🟡",
        message: `${highRiskPatients.length} high-risk patient(s) identified - recommend follow-up calls`,
      },
    ],
  };
}

// ============================================================
// HANDLER: CRITICAL PATIENTS
// ============================================================

async function getCriticalPatients(facilityId: string, query: string, params?: any) {
  // Fetch all patients with potential risk factors
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, hiv_status, last_viral_load, last_cd4_count, conditions")
    .eq("fid", facilityId)
    .limit(500);

  if (error || !data?.length) {
    return { type: "text", message: "No patients found." };
  }

  // Filter for critical patients based on clinical criteria:
  // - High viral load (>=1000 copies/mL)
  // - Low CD4 (<50)
  // - Has hypertension in conditions
  // - Has diabetes in conditions
  const criticalPatients = data.filter((p: any) => {
    const vl = p.last_viral_load || 0;
    const cd4 = p.last_cd4_count || 0;
    const cond = (p.conditions || "").toLowerCase();

    return (
      vl >= 1000 ||
      cd4 < 50 ||
      cond.includes("hypertension") ||
      cond.includes("diabetes")
    );
  });

  if (!criticalPatients.length) {
    return { type: "text", message: "No critical patients at this time." };
  }

  // Fetch next appointments for all critical patients
  const pids = criticalPatients.map((p: any) => p.pid);
  const { data: appointmentData } = await supabase
    .from("appointments")
    .select("patient_id, appointment_date")
    .in("patient_id", pids)
    .gte("appointment_date", new Date().toISOString())
    .order("appointment_date", { ascending: true });

  const appointmentMap: Record<string, string> = {};
  appointmentData?.forEach((apt: any) => {
    if (!appointmentMap[apt.patient_id]) {
      appointmentMap[apt.patient_id] = formatDate(apt.appointment_date);
    }
  });

  const { data: paginatedData, pagination } = paginateData(criticalPatients, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Viral Load", "CD4", "Conditions", "Next Appointment"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      "Viral Load": p.last_viral_load ? (p.last_viral_load >= 1000 ? `${p.last_viral_load.toLocaleString()} 🔴` : (p.last_viral_load <= 50 ? "Suppressed" : p.last_viral_load.toLocaleString())) : "Unknown",
      CD4: p.last_cd4_count ? (p.last_cd4_count < 50 ? `${p.last_cd4_count} 🔴` : p.last_cd4_count) : "Unknown",
      Conditions: p.conditions || "N/A",
      "Next Appointment": appointmentMap[p.pid] || "None scheduled",
    })),
    pagination,
    alerts: [
      {
        severity: "critical",
        icon: "🚨",
        message: `${criticalPatients.length} critical patient(s) require immediate attention (VL≥1000 or CD4<50 or HTN/DM)`,
      },
    ],
  };
}

// ============================================================
// HANDLER: IAC PATIENTS (Integrated Antiretroviral Clinic)
// ============================================================

async function getIACPatients(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, hiv_status, medication_regimen, last_viral_load, status")
    .eq("fid", facilityId)
    .eq("hiv_status", "Positive")
    .order("patient_name", { ascending: true })
    .limit(500);

  if (error || !data?.length) {
    return { type: "text", message: "No IAC patients found." };
  }

  // Filter for patients on ART (medication regimen indicates they're enrolled in IAC)
  const iacPatients = data.filter((p: any) => p.medication_regimen);

  if (!iacPatients.length) {
    return { type: "text", message: "No patients on ART/IAC found." };
  }

  // Fetch next appointments for all IAC patients
  const pids = iacPatients.map((p: any) => p.pid);
  const { data: appointmentData } = await supabase
    .from("appointments")
    .select("patient_id, appointment_date")
    .in("patient_id", pids)
    .gte("appointment_date", new Date().toISOString())
    .order("appointment_date", { ascending: true });

  const appointmentMap: Record<string, string> = {};
  appointmentData?.forEach((apt: any) => {
    if (!appointmentMap[apt.patient_id]) {
      appointmentMap[apt.patient_id] = formatDate(apt.appointment_date);
    }
  });

  const { data: paginatedData, pagination } = paginateData(iacPatients, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Medication Regimen", "Viral Load", "Next Appointment", "Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      "Medication Regimen": p.medication_regimen || "Not specified",
      "Viral Load": p.last_viral_load ? (p.last_viral_load <= 50 ? "Suppressed ✓" : p.last_viral_load.toLocaleString()) : "Unknown",
      "Next Appointment": appointmentMap[p.pid] || "None scheduled",
      Status: p.status || "Active",
    })),
    pagination,
    summary: `📋 ${iacPatients.length} patient(s) enrolled in IAC program`,
  };
}

// ============================================================
// HANDLER: DUE FOR VIRAL LOAD TEST (Bleeding/Lab)
// ============================================================

async function getDueForBleedingTest(facilityId: string, query: string, params?: any) {
  const today = new Date();
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, last_viral_load_date, last_viral_load, hiv_status, status")
    .eq("fid", facilityId)
    .eq("hiv_status", "Positive")
    .lte("last_viral_load_date", ninetyDaysAgoStr)
    .order("last_viral_load_date", { ascending: true })
    .limit(500);

  if (error || !data?.length) {
    return { type: "text", message: "No patients due for viral load test." };
  }

  // Fetch next appointments for all patients
  const pids = data.map((p: any) => p.pid);
  const { data: appointmentData } = await supabase
    .from("appointments")
    .select("patient_id, appointment_date")
    .in("patient_id", pids)
    .gte("appointment_date", new Date().toISOString())
    .order("appointment_date", { ascending: true });

  const appointmentMap: Record<string, string> = {};
  appointmentData?.forEach((apt: any) => {
    if (!appointmentMap[apt.patient_id]) {
      appointmentMap[apt.patient_id] = formatDate(apt.appointment_date);
    }
  });

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Last VL Date", "Last VL Result", "Days Overdue", "Next Appointment", "Status"],
    data: paginatedData.map((p: any) => {
      const lastVLDate = p.last_viral_load_date ? new Date(p.last_viral_load_date) : null;
      const daysOverdue = lastVLDate ? Math.floor((today.getTime() - lastVLDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return {
        "Patient ID": p.pid,
        Name: p.patient_name || "N/A",
        "Last VL Date": lastVLDate ? formatDate(p.last_viral_load_date) : "Never",
        "Last VL Result": p.last_viral_load ? p.last_viral_load.toLocaleString() : "N/A",
        "Days Overdue": `${daysOverdue} days 🔴`,
        "Next Appointment": appointmentMap[p.pid] || "None scheduled",
        Status: p.status || "Active",
      };
    }),
    pagination,
    alerts: [
      {
        severity: "warning",
        icon: "⚠️",
        message: `${data.length} patient(s) overdue for viral load testing (90+ days since last test)`,
      },
    ],
  };
}

// ============================================================
// HANDLER: ADDITIONAL HANDLERS
// ============================================================

async function getPatientsByStatus(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, status, hiv_status")
    .eq("fid", facilityId)
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No patients found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Status", "HIV Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Status: p.status || "Active",
      "HIV Status": p.hiv_status || "Unknown",
    })),
    pagination,
  };
}

async function getPatientsWithComplications(facilityId: string, query: string, params?: any) {
  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, chronic_conditions, status")
    .eq("fid", facilityId)
    .not("chronic_conditions", "is", null)
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No patients with complications found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Complications", "Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Complications: p.chronic_conditions || "None",
      Status: p.status || "Active",
    })),
    pagination,
  };
}

async function getOverdueRefillPatients(facilityId: string, query: string, params?: any) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("patients")
    .select("pid, patient_name, medication_regimen, status")
    .eq("fid", facilityId)
    .lt("last_refill_date", today)
    .order("last_refill_date", { ascending: true })
    .limit(200);

  if (error || !data?.length) {
    return { type: "text", message: "No patients with overdue refills found." };
  }

  const { data: paginatedData, pagination } = paginateData(data, params?.page, params?.limit);

  return {
    type: "table",
    columns: ["Patient ID", "Name", "Regimen", "Status"],
    data: paginatedData.map((p: any) => ({
      "Patient ID": p.pid,
      Name: p.patient_name || "N/A",
      Regimen: p.medication_regimen || "Not specified",
      Status: p.status || "Active",
    })),
    pagination,
    alerts: [
      {
        severity: "warning",
        icon: "🟡",
        message: `${data.length} patient(s) with overdue medication refills`,
      },
    ],
  };
}

// ============================================================
// FILTER & SORT HELPERS
// ============================================================

function applyFilters(data: any[], params?: any): any[] {
  if (!params) return data;

  let filtered = [...data];

  // Status filter
  if (params.status) {
    filtered = filtered.filter((item: any) => item.status?.toLowerCase() === params.status.toLowerCase());
  }

  // Date range filters
  if (params.startDate) {
    filtered = filtered.filter((item: any) => {
      const itemDate = item.appointment_date || item.registration_date;
      return itemDate >= params.startDate;
    });
  }

  if (params.endDate) {
    filtered = filtered.filter((item: any) => {
      const itemDate = item.appointment_date || item.registration_date;
      return itemDate <= params.endDate;
    });
  }

  // Sorting
  if (params.sortBy && params.sortBy !== "default") {
    if (params.sortBy === "newest") {
      filtered.sort((a: any, b: any) => new Date(b.appointment_date || b.registration_date).getTime() - new Date(a.appointment_date || a.registration_date).getTime());
    } else if (params.sortBy === "oldest") {
      filtered.sort((a: any, b: any) => new Date(a.appointment_date || a.registration_date).getTime() - new Date(b.appointment_date || b.registration_date).getTime());
    }
  }

  return filtered;
}

// ============================================================
// SMART HANDLER FINDER
// ============================================================

function findBestHandler(query: string): { handler: ((facilityId: string, query: string, params?: any) => Promise<any>) | null; name: string } {
  const lowerQuery = query.toLowerCase();

  // ============================================================
  // PATIENT PROFILE PATTERN
  // ============================================================
  if (
    (lowerQuery.includes("tell") && lowerQuery.includes("about")) ||
    (lowerQuery.includes("profile") && lowerQuery.includes("patient")) ||
    /pid\d+/i.test(query)
  ) {
    return { handler: HANDLERS["getPatientProfile"], name: "getPatientProfile" };
  }

  // ============================================================
  // CRITICAL & HIGH-RISK PATIENTS PATTERN
  // ============================================================
  if (
    lowerQuery.includes("critical") ||
    (lowerQuery.includes("high") && lowerQuery.includes("risk")) ||
    lowerQuery.includes("at risk") ||
    lowerQuery.includes("vulnerable")
  ) {
    if (lowerQuery.includes("critical")) {
      return { handler: HANDLERS["getCriticalPatients"], name: "getCriticalPatients" };
    }
    return { handler: HANDLERS["getHighRiskPatients"], name: "getHighRiskPatients" };
  }

  // ============================================================
  // IAC & ART PATIENTS PATTERN
  // ============================================================
  if (
    lowerQuery.includes("iac") ||
    (lowerQuery.includes("art") && lowerQuery.includes("clinic")) ||
    (lowerQuery.includes("antiretroviral") && lowerQuery.includes("clinic"))
  ) {
    return { handler: HANDLERS["getIACPatients"], name: "getIACPatients" };
  }

  // ============================================================
  // VIRAL LOAD TEST / BLEEDING TEST PATTERN
  // ============================================================
  if (
    (lowerQuery.includes("due") && (lowerQuery.includes("viral") || lowerQuery.includes("bleeding") || lowerQuery.includes("vl") || lowerQuery.includes("test"))) ||
    (lowerQuery.includes("overdue") && (lowerQuery.includes("viral") || lowerQuery.includes("bleeding"))) ||
    (lowerQuery.includes("viral") && lowerQuery.includes("test") && lowerQuery.includes("due"))
  ) {
    return { handler: HANDLERS["getDueForBleedingTest"], name: "getDueForBleedingTest" };
  }

  // ============================================================
  // APPOINTMENT PATTERNS
  // ============================================================
  if (
    lowerQuery.includes("appointment") ||
    lowerQuery.includes("clinic") ||
    lowerQuery.includes("visit") ||
    lowerQuery.includes("scheduled")
  ) {
    // Time-specific appointments (ordered by specificity)
    if (lowerQuery.includes("today")) return { handler: HANDLERS["getAppointmentsToday"], name: "getAppointmentsToday" };
    if (lowerQuery.includes("this week")) return { handler: HANDLERS["getAppointmentsThisWeek"], name: "getAppointmentsThisWeek" };
    if (lowerQuery.includes("last week")) return { handler: HANDLERS["getAppointmentsLastWeek"], name: "getAppointmentsLastWeek" };
    if (lowerQuery.includes("next week") || lowerQuery.includes("upcoming")) return { handler: HANDLERS["getAppointmentsNextWeek"], name: "getAppointmentsNextWeek" };
    if (lowerQuery.includes("this month")) return { handler: HANDLERS["getAppointmentsThisMonth"], name: "getAppointmentsThisMonth" };
    if (lowerQuery.includes("last month")) return { handler: HANDLERS["getAppointmentsLastMonth"], name: "getAppointmentsLastMonth" };
    if (lowerQuery.includes("next month")) return { handler: HANDLERS["getAppointmentsNextMonth"], name: "getAppointmentsNextMonth" };
    if ((lowerQuery.includes("30 day") || lowerQuery.includes("past 30")) && (lowerQuery.includes("last") || lowerQuery.includes("past") || lowerQuery.includes("previous"))) return { handler: HANDLERS["getAppointmentsPast30Days"], name: "getAppointmentsPast30Days" };
    if (lowerQuery.includes("30 day") || lowerQuery.includes("next 30")) return { handler: HANDLERS["getAppointmentsNext30Days"], name: "getAppointmentsNext30Days" };

    // Missed appointments - with time ranges
    if (lowerQuery.includes("miss") || lowerQuery.includes("missed")) {
      return { handler: HANDLERS["getMissedAppointments"], name: "getMissedAppointments" };
    }

    // Pending/due appointments
    if (lowerQuery.includes("due") || lowerQuery.includes("pending") || lowerQuery.includes("overdue")) {
      return { handler: HANDLERS["getDueAppointments"], name: "getDueAppointments" };
    }

    // Default: all appointments
    return { handler: HANDLERS["getAppointments"], name: "getAppointments" };
  }

  // ============================================================
  // PATIENT DEMOGRAPHICS & COUNTS
  // ============================================================
  if (lowerQuery.includes("patient") || lowerQuery.includes("total") || lowerQuery.includes("count")) {
    // Check for specific demographics before generic total
    if (lowerQuery.includes("female") || lowerQuery.includes("women") || lowerQuery.includes("girls")) {
      return { handler: HANDLERS["getFemalePatients"], name: "getFemalePatients" };
    }
    if (lowerQuery.includes("male") || lowerQuery.includes("men") || lowerQuery.includes("boys")) {
      return { handler: HANDLERS["getMalePatients"], name: "getMalePatients" };
    }
    if (lowerQuery.includes("new")) {
      return { handler: HANDLERS["getNewPatients"], name: "getNewPatients" };
    }
    // Default to total if no specific demographic
    if (lowerQuery.includes("total") || lowerQuery.includes("how many") || lowerQuery.includes("count")) {
      return { handler: HANDLERS["getTotalPatients"], name: "getTotalPatients" };
    }
  }

  // ============================================================
  // HIV/ART PATTERNS
  // ============================================================
  if (
    lowerQuery.includes("art") ||
    lowerQuery.includes("arv") ||
    lowerQuery.includes("antiretroviral") ||
    lowerQuery.includes("hiv") ||
    lowerQuery.includes("positive") ||
    lowerQuery.includes("on treatment")
  ) {
    return { handler: HANDLERS["getARTPatients"], name: "getARTPatients" };
  }

  // ============================================================
  // VIRAL LOAD PATTERNS
  // ============================================================
  if (lowerQuery.includes("viral") || lowerQuery.includes("vl") || lowerQuery.includes("rna")) {
    if (lowerQuery.includes("high") || lowerQuery.includes("elevated") || lowerQuery.includes(">1000")) {
      return { handler: HANDLERS["getHighViralLoadPatients"], name: "getHighViralLoadPatients" };
    }
    if (
      lowerQuery.includes("undetectable") ||
      lowerQuery.includes("u=u") ||
      lowerQuery.includes("suppressed") ||
      lowerQuery.includes("<50")
    ) {
      return { handler: HANDLERS["getUndetectablePatients"], name: "getUndetectablePatients" };
    }
    if (lowerQuery.includes("due") || lowerQuery.includes("test") || lowerQuery.includes("overdue")) {
      return { handler: HANDLERS["getDueForViralLoadTest"], name: "getDueForViralLoadTest" };
    }
    return { handler: HANDLERS["getHighViralLoadPatients"], name: "getHighViralLoadPatients" };
  }

  // ============================================================
  // CD4 PATTERNS
  // ============================================================
  if (lowerQuery.includes("cd4") || lowerQuery.includes("count") || lowerQuery.includes("immune")) {
    if (lowerQuery.includes("low") || lowerQuery.includes("<200")) {
      return { handler: HANDLERS["getLowCD4Patients"], name: "getLowCD4Patients" };
    }
    if (lowerQuery.includes("due") || lowerQuery.includes("test") || lowerQuery.includes("overdue")) {
      return { handler: HANDLERS["getDueForCD4Test"], name: "getDueForCD4Test" };
    }
    return { handler: HANDLERS["getLowCD4Patients"], name: "getLowCD4Patients" };
  }

  // ============================================================
  // ADHERENCE & FOLLOW-UP PATTERNS
  // ============================================================
  if (
    lowerQuery.includes("adherence") ||
    lowerQuery.includes("adherent") ||
    lowerQuery.includes("non-adherent") ||
    lowerQuery.includes("poor adherence") ||
    lowerQuery.includes("defaulter") ||
    lowerQuery.includes("ltfu")
  ) {
    return { handler: HANDLERS["getMissedAppointments"], name: "getMissedAppointments" };
  }

  // ============================================================
  // MEDICATION & REFILL PATTERNS
  // ============================================================
  if (
    lowerQuery.includes("refill") ||
    lowerQuery.includes("medication") ||
    lowerQuery.includes("meds") ||
    lowerQuery.includes("medicine") ||
    lowerQuery.includes("drugs") ||
    lowerQuery.includes("prescription")
  ) {
    return { handler: HANDLERS["getOverdueRefillPatients"], name: "getOverdueRefillPatients" };
  }

  // ============================================================
  // NCDs - DIABETES
  // ============================================================
  if (
    lowerQuery.includes("diabetes") ||
    lowerQuery.includes("diabetic") ||
    lowerQuery.includes("dm") ||
    lowerQuery.includes("glucose") ||
    lowerQuery.includes("sugar")
  ) {
    return { handler: HANDLERS["getDiabetesPatients"], name: "getDiabetesPatients" };
  }

  // ============================================================
  // NCDs - HYPERTENSION
  // ============================================================
  if (
    lowerQuery.includes("hypertension") ||
    lowerQuery.includes("htn") ||
    lowerQuery.includes("blood pressure") ||
    lowerQuery.includes("bp") ||
    lowerQuery.includes("elevated bp")
  ) {
    return { handler: HANDLERS["getHypertensionPatients"], name: "getHypertensionPatients" };
  }

  // ============================================================
  // NCDs - OTHER CONDITIONS
  // ============================================================
  if (lowerQuery.includes("asthma") || lowerQuery.includes("respiratory")) {
    return { handler: HANDLERS["getAsthmaPatients"], name: "getAsthmaPatients" };
  }
  if (lowerQuery.includes("cancer") || lowerQuery.includes("oncology") || lowerQuery.includes("malignancy")) {
    return { handler: HANDLERS["getCancerPatients"], name: "getCancerPatients" };
  }
  if (lowerQuery.includes("heart") || lowerQuery.includes("cardiac") || lowerQuery.includes("cvd")) {
    return { handler: HANDLERS["getHeartDiseasePatients"], name: "getHeartDiseasePatients" };
  }
  if (lowerQuery.includes("kidney") || lowerQuery.includes("ckd") || lowerQuery.includes("renal")) {
    return { handler: HANDLERS["getCKDPatients"], name: "getCKDPatients" };
  }
  if (lowerQuery.includes("mental") || lowerQuery.includes("depression") || lowerQuery.includes("psychiatric")) {
    return { handler: HANDLERS["getMentalHealthPatients"], name: "getMentalHealthPatients" };
  }
  if (lowerQuery.includes("tb") || lowerQuery.includes("tuberculosis") || lowerQuery.includes("chest")) {
    return { handler: HANDLERS["getTuberculosisPatients"], name: "getTuberculosisPatients" };
  }

  // ============================================================
  // COMPLICATIONS & STATUS PATTERNS
  // ============================================================
  if (lowerQuery.includes("complication") || lowerQuery.includes("adverse") || lowerQuery.includes("side effect")) {
    return { handler: HANDLERS["getPatientsWithComplications"], name: "getPatientsWithComplications" };
  }

  // ============================================================
  // TESTING & LAB PATTERNS
  // ============================================================
  if (lowerQuery.includes("test") || lowerQuery.includes("lab") || lowerQuery.includes("investigation")) {
    if (lowerQuery.includes("due") || lowerQuery.includes("overdue")) {
      return { handler: HANDLERS["getDueForViralLoadTest"], name: "getDueForViralLoadTest" };
    }
  }

  return { handler: null, name: "" };
}
