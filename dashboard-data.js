// Dashboard Data Fetching and Updating

// Fetch and display dashboard statistics
async function loadDashboardStats() {
    try {
        const session = JSON.parse(localStorage.getItem('healthflow_session'));
        if (!session) return;

        console.log('Session data:', session);

        // Get facility filter from session (use fid which is the numeric facility ID)
        let facilityId = session.fid || session.facility_id;
        let facilityCode = session.facilityIdCode;

        console.log('Facility ID:', facilityId, 'Facility Code:', facilityCode);

        // Fetch total patients - try without filter first to debug
        let { count: totalPatients, error: patientError } = await supabaseClient
            .from('patients')
            .select('*', { count: 'exact', head: true });

        console.log('Total patients (no filter):', totalPatients, 'Error:', patientError);

        // Filter by facility ID
         if (facilityId) {
             const { count: facilityPatients, error: facilityError } = await supabaseClient
                 .from('patients')
                 .select('*', { count: 'exact', head: true })
                 .eq('fid', facilityId);

             if (!facilityError && facilityPatients > 0) {
                 totalPatients = facilityPatients;
                 console.log('Facility patients count:', facilityPatients);
             } else if (facilityError) {
                 console.warn('Error filtering by facility:', facilityError);
             }
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
            .select('id, condition, viral_load_copies');
        
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

        // Calculate adherence rate from viral load suppression (VL < 100 = good adherence)
        const suppressedCount = allPatients?.filter(p => {
            const vl = parseInt(p.viral_load_copies);
            return vl < 100; // VL < 100 copies indicates good adherence
        }).length || 0;
        const totalCount = allPatients?.length || 1;
        const adherenceRate = Math.round((suppressedCount / totalCount) * 100);

        // Fetch new patients in the current month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const { count: newPatientsMonth } = await supabaseClient
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .gte('patient_registration_date', monthStart)
            .lte('patient_registration_date', monthEnd);

        // Update dashboard cards (check if element exists first)
        const statsPatients = document.getElementById('statsPatients');
        const statsHIV = document.getElementById('statsHIV');
        const statsAdherence = document.getElementById('statsAdherence');
        const newPatientsCount = document.getElementById('newPatientsCount');
        const statsConditionHIV = document.getElementById('statsConditionHIV');
        const statsConditionDiabetes = document.getElementById('statsConditionDiabetes');
        const statsConditionHypertension = document.getElementById('statsConditionHypertension');
        const statsConditionTB = document.getElementById('statsConditionTB');

        if (statsPatients) statsPatients.textContent = totalPatients || 0;
        if (statsHIV) statsHIV.textContent = activeHivCount || 0;
        if (statsAdherence) statsAdherence.textContent = adherenceRate + '%';
        if (newPatientsCount) newPatientsCount.textContent = newPatientsMonth || 0;
        
        // Update chronic condition cards
        if (statsConditionHIV) statsConditionHIV.textContent = conditions['HIV'] || 0;
        if (statsConditionDiabetes) statsConditionDiabetes.textContent = conditions['Diabetes'] || 0;
        if (statsConditionHypertension) statsConditionHypertension.textContent = conditions['Hypertension'] || 0;
        if (statsConditionTB) statsConditionTB.textContent = conditions['TB'] || 0;

        console.log('Dashboard stats loaded:', {
            totalPatients,
            activeHivCount,
            adherenceRate,
            newPatientsMonth,
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

        const numericFacilityId = session.fid || session.facility_id || session.facilityId;

        // Fetch patients with correct column names
        let { data: patients, error } = await supabaseClient
            .from('patients')
            .select('patient_no, first_name, last_name, age, gender, status, patient_registration_date')
            .eq('fid', numericFacilityId)
            .order('patient_registration_date', { ascending: false })
            .limit(10);

        if (error) throw error;

        const tableBody = document.getElementById('recentPatientsTable');
        if (tableBody) {
            tableBody.innerHTML = '';

            if (patients && patients.length > 0) {
                patients.forEach(patient => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${patient.patient_no || 'N/A'}</td>
                        <td>${patient.first_name} ${patient.last_name}</td>
                        <td>${patient.age || 'N/A'}</td>
                        <td>${patient.gender || 'N/A'}</td>
                        <td><span class="badge bg-${patient.status === 'Active' ? 'success' : 'secondary'}">${patient.status || 'N/A'}</span></td>
                        <td>${patient.patient_registration_date ? new Date(patient.patient_registration_date).toLocaleDateString() : 'N/A'}</td>
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

// Fetch recent appointments from patients table
async function loadRecentAppointments() {
    try {
        const session = JSON.parse(localStorage.getItem('healthflow_session'));
        if (!session) return;

        const numericFacilityId = session.fid || session.facility_id || session.facilityId;

        const { data: patients, error } = await supabaseClient
            .from('patients')
            .select('patient_no, first_name, last_name, patient_registration_date, status')
            .eq('fid', numericFacilityId)
            .order('patient_registration_date', { ascending: false })
            .limit(10);

        if (error) throw error;

        const tableBody = document.getElementById('recentAppointmentsTable');
        if (tableBody) {
            tableBody.innerHTML = '';

            if (patients && patients.length > 0) {
                patients.forEach(patient => {
                    const row = document.createElement('tr');
                    const statusColor = patient.status === 'Active' ? 'success' : patient.status === 'Scheduled' ? 'info' : 'warning';
                    row.innerHTML = `
                        <td>${patient.patient_no || 'N/A'}</td>
                        <td>${patient.first_name} ${patient.last_name}</td>
                        <td>${new Date(patient.patient_registration_date).toLocaleDateString()}</td>
                        <td>N/A</td>
                        <td>N/A</td>
                        <td><span class="badge bg-${statusColor}">${patient.status || 'N/A'}</span></td>
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

// Fetch HIV viral load data from patients table
async function loadViralLoadData() {
    try {
        const session = JSON.parse(localStorage.getItem('healthflow_session'));
        if (!session) return;

        const numericFacilityId = session.fid || session.facility_id || session.facilityId;

        const { data: patients, error } = await supabaseClient
            .from('patients')
            .select('patient_no, first_name, last_name, viral_load_copies, patient_registration_date')
            .eq('fid', numericFacilityId)
            .not('viral_load_copies', 'is', null)
            .order('patient_registration_date', { ascending: false })
            .limit(15);

        if (error) throw error;

        const tableBody = document.getElementById('viralLoadTable');
        if (tableBody) {
            tableBody.innerHTML = '';

            if (patients && patients.length > 0) {
                patients.forEach(patient => {
                    const row = document.createElement('tr');
                    const vl = parseInt(patient.viral_load_copies);
                    const statusColor = vl > 0 ? 'warning' : 'success';
                    row.innerHTML = `
                        <td>${patient.patient_no || 'N/A'}</td>
                        <td>${patient.first_name} ${patient.last_name}</td>
                        <td>${patient.viral_load_copies || 0}</td>
                        <td><span class="badge bg-${statusColor}">${vl > 0 ? 'Detected' : 'Undetectable'}</span></td>
                        <td>${new Date(patient.patient_registration_date).toLocaleDateString()}</td>
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

// Fetch total appointments count
async function loadTotalAppointments() {
    try {
        const session = JSON.parse(localStorage.getItem('healthflow_session'));
        if (!session) return;

        const numericFacilityId = session.fid || session.facility_id || session.facilityId;

        // Count all patients (each patient has an appointment record/status)
        let query = supabaseClient
            .from('patients')
            .select('*', { count: 'exact', head: true });
        
        if (numericFacilityId) {
            query = query.eq('fid', numericFacilityId);
        }

        const { count: totalAppointments, error } = await query;

        if (error) throw error;

        // Update the appointments card
        const appointmentsCard = document.getElementById('totalAppointmentsCount');
        if (appointmentsCard) {
            appointmentsCard.textContent = totalAppointments || 0;
        }

        console.log('Total appointments loaded:', totalAppointments);
    } catch (error) {
        console.error('Error loading total appointments:', error);
    }
}

// Fetch chronic conditions data from patients table
async function loadChronicConditionsData() {
    try {
        const session = JSON.parse(localStorage.getItem('healthflow_session'));
        if (!session) return;

        const numericFacilityId = session.fid || session.facility_id || session.facilityId;

        const { data: patients, error } = await supabaseClient
            .from('patients')
            .select('patient_no, first_name, last_name, condition, patient_registration_date, status')
            .eq('fid', numericFacilityId)
            .not('condition', 'is', null)
            .order('patient_registration_date', { ascending: false })
            .limit(20);

        if (error) throw error;

        const tableBody = document.getElementById('chronicConditionsTable');
        if (tableBody) {
            tableBody.innerHTML = '';

            if (patients && patients.length > 0) {
                patients.forEach(patient => {
                    const row = document.createElement('tr');
                    const statusColor = patient.status === 'Active' ? 'success' : patient.status === 'Scheduled' ? 'info' : 'warning';
                    
                    // Determine adherence based on status
                    let adherence = 'Pending';
                    if (patient.status === 'Active') {
                        adherence = '<span class="badge bg-success">Good</span>';
                    } else if (patient.status === 'Inactive') {
                        adherence = '<span class="badge bg-danger">Poor</span>';
                    }
                    
                    row.innerHTML = `
                        <td>${patient.patient_no || 'N/A'}</td>
                        <td>${patient.first_name} ${patient.last_name}</td>
                        <td><span class="badge bg-primary">${patient.condition || 'N/A'}</span></td>
                        <td>${new Date(patient.patient_registration_date).toLocaleDateString()}</td>
                        <td><span class="badge bg-${statusColor}">${patient.status || 'N/A'}</span></td>
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

// Fetch and populate Patients chart with New vs Return data by month
async function loadPatientChart() {
    try {
        const session = JSON.parse(localStorage.getItem('healthflow_session'));
        if (!session) {
            console.warn('No session found for patient chart');
            return;
        }

        const numericFacilityId = session.fid || session.facility_id || session.facilityId;

        // Fetch all patients with their registration dates and patient_type
        let query = supabaseClient
            .from('patients')
            .select('patient_registration_date, patient_type');
        
        if (numericFacilityId) {
            query = query.eq('fid', numericFacilityId);
        }
        
        const { data: allPatients, error } = await query;

        if (error) {
            console.error('Error fetching patient chart data:', error);
            throw error;
        }

        // Organize data by month
        const monthlyData = {};
        const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (allPatients) {
            allPatients.forEach(patient => {
                if (!patient.patient_registration_date) return;
                
                const date = new Date(patient.patient_registration_date);
                const monthIndex = date.getMonth();
                const monthName = monthsOrder[monthIndex];

                if (!monthlyData[monthName]) {
                    monthlyData[monthName] = { new: 0, return: 0 };
                }

                // Use patient_type column to categorize (New or Return)
                const isNew = patient.patient_type === 'New';
                
                if (isNew) {
                    monthlyData[monthName].new++;
                } else {
                    monthlyData[monthName].return++;
                }
            });
        }

        // Prepare data for all 12 months
        const newPatientData = monthsOrder.map(month => monthlyData[month]?.new || 0);
        const returnPatientData = monthsOrder.map(month => monthlyData[month]?.return || 0);



        // Initialize ApexCharts for Patients chart
        const patientChartElement = document.getElementById('patients');
        if (patientChartElement) {
            // Destroy any existing chart first
            if (window.ApexCharts) {
                // Find and destroy any existing ApexCharts instances on this element
                const existingCharts = ApexCharts.getChartByID(patientChartElement.id);
                if (existingCharts) {
                    existingCharts.destroy();
                }
            }
            
            // Clear the element
            patientChartElement.innerHTML = '';
            
            const options = {
                chart: {
                    type: 'area',
                    height: 315,
                    width: '100%',
                    stacked: false,
                    toolbar: {
                        show: true,
                        tools: {
                            download: true,
                            selection: true,
                            zoom: true,
                            zoomin: true,
                            zoomout: true,
                            pan: true,
                            reset: true
                        }
                    }
                },
                colors: ['#116aef', '#0ebb13'],
                stroke: {
                    curve: 'smooth',
                    width: [4, 4]
                },
                plotOptions: {
                    area: {
                        fillTo: 'origin'
                    }
                },
                dataLabels: {
                    enabled: false
                },
                xaxis: {
                    categories: monthsOrder,
                    type: 'category'
                },
                yaxis: {
                    title: {
                        text: 'Number of Patients'
                    }
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center'
                },
                tooltip: {
                    theme: 'light',
                    y: {
                        formatter: function(value) {
                            return value + ' patients';
                        }
                    }
                },
                grid: {
                    padding: {
                        bottom: 20
                    }
                }
            };

            const series = [
                {
                    name: 'New Patients',
                    data: newPatientData
                },
                {
                    name: 'Return Patients',
                    data: returnPatientData
                }
            ];

            // Create and render new chart
            const chart = new ApexCharts(patientChartElement, {
                ...options,
                series: series
            });

            chart.render();
            
            // Force resize after a small delay
            setTimeout(() => {
                chart.windowResizeHandler();
            }, 100);
        }

        // Update stat cards if they exist
        const totalNewPatients = newPatientData.reduce((a, b) => a + b, 0);
        const totalReturnPatients = returnPatientData.reduce((a, b) => a + b, 0);

        const newPatientCard = document.getElementById('newPatientCount');
        const returnPatientCard = document.getElementById('returnPatientCount');

        if (newPatientCard) {
            newPatientCard.textContent = totalNewPatients;
        }
        if (returnPatientCard) {
            returnPatientCard.textContent = totalReturnPatients;
        }

    } catch (error) {
        console.error('Error loading patient chart:', error);
    }
}

// Load all dashboard data on page load
function initializeDashboardData() {
    loadDashboardStats();
    loadTotalAppointments();
    loadRecentPatients();
    loadRecentAppointments();
    loadViralLoadData();
    loadChronicConditionsData();
    loadPatientChart();
}

// Call initialization when dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment for session to be available
    setTimeout(initializeDashboardData, 500);
});
