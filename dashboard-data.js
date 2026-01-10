// Dashboard Data Fetching and Updating

// Fetch and display dashboard statistics
async function loadDashboardStats() {
    try {
        const session = JSON.parse(localStorage.getItem('healthflow_session'));
        if (!session) return;

        console.log('Session data:', session);

        // Try multiple approaches to get the facility filter
        let facilityUUID = session.facilityId;
        let facilityCode = session.facilityIdCode;

        console.log('Facility UUID:', facilityUUID, 'Facility Code:', facilityCode);

        // Fetch total patients - try without filter first to debug
        let { count: totalPatients, error: patientError } = await supabaseClient
            .from('patients')
            .select('*', { count: 'exact', head: true });

        console.log('Total patients (no filter):', totalPatients, 'Error:', patientError);

        // If we got results, try filtering by facility
        if (totalPatients > 0) {
            // Try filtering by facility ID (UUID)
            const { count: facilityPatients1 } = await supabaseClient
                .from('patients')
                .select('*', { count: 'exact', head: true })
                .eq('fid', facilityUUID);

            console.log('Patients with fid filter:', facilityPatients1);

            // Try filtering by facility_id (code)
            const { count: facilityPatients2 } = await supabaseClient
                .from('patients')
                .select('*', { count: 'exact', head: true })
                .eq('facility_id', facilityCode);

            console.log('Patients with facility_id filter:', facilityPatients2);

            // Use the one that has results
            totalPatients = facilityPatients1 > 0 ? facilityPatients1 : (facilityPatients2 > 0 ? facilityPatients2 : totalPatients);
        }

        // Fetch patients by chronic condition
        const conditions = {
            'HIV': 0,
            'Diabetes': 0,
            'Hypertension': 0,
            'TB': 0
        };

        // Get patient data instead
        const { data: allPatients } = await supabaseClient
            .from('patients')
            .select('id, condition');
        
        if (allPatients) {
            // Count patients by condition
            allPatients.forEach(patient => {
                const condition = patient.condition;
                if (condition && conditions.hasOwnProperty(condition)) {
                    conditions[condition]++;
                }
            });
        }
        
        for (const [condition, count] of Object.entries(conditions)) {
            console.log(`${condition}: ${count} patients`);
        }

        const activeHivCount = conditions['HIV'] || 0;

         // Fetch appointments for today
        const today = new Date().toISOString().split('T')[0];
        const { count: appointmentsToday } = await supabaseClient
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('appointment_date', today)
            .eq('status', 'Scheduled');

        // Calculate adherence rate (appointments completed / total appointments)
        const { data: allAppointments } = await supabaseClient
            .from('appointments')
            .select('status');

        const completedCount = allAppointments?.filter(a => a.status === 'Completed').length || 0;
        const totalCount = allAppointments?.length || 1;
        const adherenceRate = Math.round((completedCount / totalCount) * 100);

        // Update dashboard cards
        document.getElementById('statsPatients').textContent = totalPatients || 0;
        document.getElementById('statsAppointments').textContent = appointmentsToday || 0;
        document.getElementById('statsHIV').textContent = activeHivCount || 0;
        document.getElementById('statsAdherence').textContent = adherenceRate + '%';
        
        // Update chronic condition cards
        document.getElementById('statsConditionHIV').textContent = conditions['HIV'] || 0;
        document.getElementById('statsConditionDiabetes').textContent = conditions['Diabetes'] || 0;
        document.getElementById('statsConditionHypertension').textContent = conditions['Hypertension'] || 0;
        document.getElementById('statsConditionTB').textContent = conditions['TB'] || 0;

        console.log('Dashboard stats loaded:', {
            totalPatients,
            appointmentsToday,
            activeHivCount,
            adherenceRate,
            conditions
        });
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Fetch recent patients
async function loadRecentPatients() {
    try {
        const session = JSON.parse(localStorage.getItem('healthflow_session'));
        if (!session) return;

        const facilityUUID = session.facilityId;
        const facilityCode = session.facilityIdCode;

        // Try fetching with UUID first, then fallback to code
        let { data: patients, error } = await supabaseClient
            .from('patients')
            .select('patient_id, first_name, last_name, age, gender, status, registered_date')
            .eq('fid', facilityUUID)
            .order('registered_date', { ascending: false })
            .limit(10);

        // If no results, try with facility code
        if (!patients || patients.length === 0) {
            ({ data: patients, error } = await supabaseClient
                .from('patients')
                .select('patient_id, first_name, last_name, age, gender, status, registered_date')
                .eq('facility_id', facilityCode)
                .order('registered_date', { ascending: false })
                .limit(10));
        }

        // If still no results, fetch all patients
        if (!patients || patients.length === 0) {
            ({ data: patients, error } = await supabaseClient
                .from('patients')
                .select('patient_id, first_name, last_name, age, gender, status, registered_date')
                .order('registered_date', { ascending: false })
                .limit(10));
        }

        if (error) throw error;

        const tableBody = document.getElementById('recentPatientsTable');
        if (tableBody) {
            tableBody.innerHTML = '';

            if (patients && patients.length > 0) {
                patients.forEach(patient => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${patient.patient_id || 'N/A'}</td>
                        <td>${patient.first_name} ${patient.last_name}</td>
                        <td>${patient.age || 'N/A'}</td>
                        <td>${patient.gender || 'N/A'}</td>
                        <td><span class="badge bg-${patient.status === 'Active' ? 'success' : 'secondary'}">${patient.status || 'N/A'}</span></td>
                        <td>${new Date(patient.registered_date).toLocaleDateString()}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No patients found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading recent patients:', error);
    }
}

// Fetch recent appointments
async function loadRecentAppointments() {
    try {
        const session = JSON.parse(localStorage.getItem('healthflow_session'));
        if (!session) return;

        const { data: appointments, error } = await supabaseClient
            .from('appointments')
            .select('aid, patient_id, patient_name, appointment_date, appointment_time, status, primary_condition')
            .order('appointment_date', { ascending: false })
            .limit(10);

        if (error) throw error;

        const tableBody = document.getElementById('recentAppointmentsTable');
        if (tableBody) {
            tableBody.innerHTML = '';

            if (appointments && appointments.length > 0) {
                appointments.forEach(appt => {
                    const row = document.createElement('tr');
                    const statusColor = appt.status === 'Completed' ? 'success' : appt.status === 'Scheduled' ? 'info' : 'warning';
                    row.innerHTML = `
                        <td>${appt.patient_id || 'N/A'}</td>
                        <td>${appt.patient_name || 'N/A'}</td>
                        <td>${new Date(appt.appointment_date).toLocaleDateString()}</td>
                        <td>${appt.appointment_time || 'N/A'}</td>
                        <td>${appt.primary_condition || 'N/A'}</td>
                        <td><span class="badge bg-${statusColor}">${appt.status || 'N/A'}</span></td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No appointments found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading recent appointments:', error);
    }
}

// Fetch HIV viral load data
async function loadViralLoadData() {
    try {
        const { data: appointments, error } = await supabaseClient
            .from('appointments')
            .select('patient_id, patient_name, viral_load_copies, viral_load_status, appointment_date')
            .not('viral_load_status', 'is', null)
            .order('appointment_date', { ascending: false })
            .limit(15);

        if (error) throw error;

        const tableBody = document.getElementById('viralLoadTable');
        if (tableBody) {
            tableBody.innerHTML = '';

            if (appointments && appointments.length > 0) {
                appointments.forEach(record => {
                    const row = document.createElement('tr');
                    const statusColor = record.viral_load_status === 'Detected' ? 'warning' : 'success';
                    row.innerHTML = `
                        <td>${record.patient_id || 'N/A'}</td>
                        <td>${record.patient_name || 'N/A'}</td>
                        <td>${record.viral_load_copies || 0}</td>
                        <td><span class="badge bg-${statusColor}">${record.viral_load_status || 'N/A'}</span></td>
                        <td>${new Date(record.appointment_date).toLocaleDateString()}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No viral load data found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading viral load data:', error);
    }
}

// Fetch chronic conditions data
async function loadChronicConditionsData() {
    try {
        const { data: appointments, error } = await supabaseClient
            .from('appointments')
            .select('patient_id, patient_name, primary_condition, appointment_date, status')
            .not('primary_condition', 'is', null)
            .order('appointment_date', { ascending: false })
            .limit(20);

        if (error) throw error;

        const tableBody = document.getElementById('chronicConditionsTable');
        if (tableBody) {
            tableBody.innerHTML = '';

            if (appointments && appointments.length > 0) {
                appointments.forEach(record => {
                    const row = document.createElement('tr');
                    const statusColor = record.status === 'Completed' ? 'success' : record.status === 'Scheduled' ? 'info' : 'warning';
                    
                    // Determine adherence based on status
                    let adherence = 'Pending';
                    if (record.status === 'Completed') {
                        adherence = '<span class="badge bg-success">Good</span>';
                    } else if (record.status === 'Cancelled') {
                        adherence = '<span class="badge bg-danger">Poor</span>';
                    }
                    
                    row.innerHTML = `
                        <td>${record.patient_id || 'N/A'}</td>
                        <td>${record.patient_name || 'N/A'}</td>
                        <td><span class="badge bg-primary">${record.primary_condition || 'N/A'}</span></td>
                        <td>${new Date(record.appointment_date).toLocaleDateString()}</td>
                        <td><span class="badge bg-${statusColor}">${record.status || 'N/A'}</span></td>
                        <td>${adherence}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No chronic condition data found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading chronic conditions data:', error);
    }
}

// Load all dashboard data on page load
function initializeDashboardData() {
    loadDashboardStats();
    loadRecentPatients();
    loadRecentAppointments();
    loadViralLoadData();
    loadChronicConditionsData();
}

// Call initialization when dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment for session to be available
    setTimeout(initializeDashboardData, 500);
});
