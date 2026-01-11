// ===== DASHBOARD ENHANCEMENTS =====
// This file contains all the advanced features for the dashboard

let allPatients = [];
let allAppointments = [];
let conditionChart = null;
let registrationChart = null;
let appointmentTrendChart = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupTableSearchAndFilter();
    setupCharts();
    loadAnalyticsData();
});

function initializeDashboard() {
    // Initialize event listeners
    document.getElementById('patientSearch')?.addEventListener('keyup', filterPatientTable);
    document.getElementById('patientStatusFilter')?.addEventListener('change', filterPatientTable);
    document.getElementById('appointmentSearch')?.addEventListener('keyup', filterAppointmentTable);
    document.getElementById('appointmentStatusFilter')?.addEventListener('change', filterAppointmentTable);
    document.getElementById('appointmentTypeFilter')?.addEventListener('change', filterAppointmentTable);
    document.getElementById('upcomingSearch')?.addEventListener('keyup', filterUpcomingTable);
    document.getElementById('upcomingTypeFilter')?.addEventListener('change', filterUpcomingTable);
}

// ===== ANALYTICS DATA LOADING =====
async function loadAnalyticsData() {
    try {
        await loadPatients();
        await loadAppointments();
        updateKPIs();
        updateAlerts();
        updateQuickStats();
        updateUpcomingAppointments();
    } catch (error) {
        console.error('Error loading analytics data:', error);
    }
}

async function loadPatients() {
    try {
        const { data, error } = await supabaseClient
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.warn('Error loading patients, using empty array:', error);
            allPatients = [];
        } else {
            allPatients = data || [];
        }
        renderPatientTable();
    } catch (error) {
        console.error('Error loading patients:', error);
        allPatients = [];
    }
}

async function loadAppointments() {
    try {
        const { data, error } = await supabaseClient
            .from('appointments')
            .select('*')
            .order('appointment_date', { ascending: false });
        
        if (error) {
            console.warn('Error loading appointments, using empty array:', error);
            allAppointments = [];
        } else {
            allAppointments = data || [];
        }
        renderAppointmentTable();
        updateAppointmentCharts();
    } catch (error) {
        console.error('Error loading appointments:', error);
        allAppointments = [];
    }
}

// ===== PATIENT TABLE =====
function filterPatientTable() {
    const searchValue = document.getElementById('patientSearch').value.toLowerCase();
    const statusFilter = document.getElementById('patientStatusFilter').value;
    
    let filtered = allPatients.filter(patient => {
        const matchesSearch = !searchValue || 
            (patient.first_name?.toLowerCase().includes(searchValue)) ||
            (patient.last_name?.toLowerCase().includes(searchValue)) ||
            (patient.phone_number?.includes(searchValue)) ||
            (patient.national_id?.includes(searchValue));
        
        const matchesStatus = !statusFilter || patient.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderPatientTable(filtered);
}

function renderPatientTable(patients = allPatients) {
    const tbody = document.getElementById('patientTableBody');
    const countEl = document.getElementById('patientCount');
    
    if (!tbody) return;
    
    countEl.textContent = patients.length;
    
    if (patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">No patients found</td></tr>';
        return;
    }
    
    tbody.innerHTML = patients.map(patient => `
        <tr>
            <td><strong>${patient.first_name} ${patient.last_name}</strong></td>
            <td>${patient.national_id || '-'}</td>
            <td>${patient.phone_number || '-'}</td>
            <td>${patient.gender || '-'}</td>
            <td>
                <span class="status-${patient.status.toLowerCase()}">${patient.status}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewPatient('${patient.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== APPOINTMENT TABLE =====
function filterAppointmentTable() {
    const searchValue = document.getElementById('appointmentSearch').value.toLowerCase();
    const statusFilter = document.getElementById('appointmentStatusFilter').value;
    const typeFilter = document.getElementById('appointmentTypeFilter').value;
    
    let filtered = allAppointments.filter(appt => {
        const patient = allPatients.find(p => p.id === appt.patient_id);
        const patientName = patient ? `${patient.first_name} ${patient.last_name}`.toLowerCase() : '';
        
        const matchesSearch = !searchValue || patientName.includes(searchValue);
        const matchesStatus = !statusFilter || appt.status === statusFilter;
        const matchesType = !typeFilter || appt.appointment_type === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
    });
    
    renderAppointmentTable(filtered);
}

function renderAppointmentTable(appointments = allAppointments) {
    const tbody = document.getElementById('appointmentTableBody');
    
    if (!tbody) return;
    
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No appointments found</td></tr>';
        return;
    }
    
    tbody.innerHTML = appointments.map(appt => {
        const patient = allPatients.find(p => p.id === appt.patient_id);
        return `
            <tr>
                <td><strong>${patient ? patient.first_name + ' ' + patient.last_name : 'Unknown'}</strong></td>
                <td>${new Date(appt.appointment_date).toLocaleDateString()}</td>
                <td>${appt.appointment_time || '-'}</td>
                <td>${appt.appointment_type || '-'}</td>
                <td>
                    <span class="status-${appt.status.toLowerCase()}">${appt.status}</span>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== UPCOMING APPOINTMENTS =====
function filterUpcomingAppts(days) {
    // Update button states
    document.querySelectorAll('[onclick*="filterUpcomingAppts"]').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    let upcoming = allAppointments.filter(appt => {
        const apptDate = new Date(appt.appointment_date);
        return apptDate >= now && apptDate <= futureDate && appt.status === 'Scheduled';
    });
    
    renderUpcomingAppointments(upcoming);
}

function filterUpcomingTable() {
    const searchValue = document.getElementById('upcomingSearch').value.toLowerCase();
    const typeFilter = document.getElementById('upcomingTypeFilter').value;
    
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    let filtered = allAppointments.filter(appt => {
        const apptDate = new Date(appt.appointment_date);
        const patient = allPatients.find(p => p.id === appt.patient_id);
        const patientName = patient ? `${patient.first_name} ${patient.last_name}`.toLowerCase() : '';
        
        const matchesSearch = !searchValue || patientName.includes(searchValue);
        const matchesType = !typeFilter || appt.appointment_type === typeFilter;
        const isUpcoming = apptDate >= now && apptDate <= futureDate && appt.status === 'Scheduled';
        
        return matchesSearch && matchesType && isUpcoming;
    });
    
    renderUpcomingAppointments(filtered);
}

function renderUpcomingAppointments(appointments = []) {
    const tbody = document.getElementById('upcomingApptsBody');
    
    if (!tbody) return;
    
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No upcoming appointments</td></tr>';
        return;
    }
    
    const now = new Date();
    
    tbody.innerHTML = appointments.map(appt => {
        const patient = allPatients.find(p => p.id === appt.patient_id);
        const apptDate = new Date(appt.appointment_date);
        const daysUntil = Math.ceil((apptDate - now) / (1000 * 60 * 60 * 24));
        
        return `
            <tr>
                <td><strong>${patient ? patient.first_name + ' ' + patient.last_name : 'Unknown'}</strong></td>
                <td>${apptDate.toLocaleDateString()}</td>
                <td>${appt.appointment_time || '-'}</td>
                <td>${appt.appointment_type || '-'}</td>
                <td>
                    <span class="badge ${daysUntil <= 3 ? 'bg-danger' : daysUntil <= 7 ? 'bg-warning' : 'bg-info'}">
                        ${daysUntil} days
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// Initial load
function updateUpcomingAppointments() {
    filterUpcomingAppts('30');
}

// ===== KPI CALCULATIONS =====
function updateKPIs() {
    // Appointment Adherence Rate
    const completedAppts = allAppointments.filter(a => a.status === 'Completed').length;
    const totalScheduledAppts = allAppointments.filter(a => a.status === 'Completed' || a.status === 'Scheduled').length;
    const adherenceRate = totalScheduledAppts > 0 ? Math.round((completedAppts / totalScheduledAppts) * 100) : 0;
    document.getElementById('appointmentAdherence').textContent = adherenceRate + '%';
    
    // New Patients This Month
     const now = new Date();
     const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
     const newPatientsThisMonth = allPatients.filter(p => {
         const regDate = p.patient_registration_date ? new Date(p.patient_registration_date) : null;
         return regDate && regDate >= monthStart && regDate <= now;
     }).length;
     document.getElementById('newPatientsCount').textContent = newPatientsThisMonth;
     document.getElementById('newPatientsBadge').textContent = newPatientsThisMonth;
    
    // High Risk Patients (example: based on status)
    const highRiskCount = allPatients.filter(p => p.status === 'Inactive').length;
    document.getElementById('highRiskCount').textContent = highRiskCount;
    document.getElementById('riskBadge').textContent = highRiskCount;
}

// ===== ALERTS =====
function updateAlerts() {
    updateOverdueAppointments();
    updateCriticalVitalLoads();
}

function updateOverdueAppointments() {
    const now = new Date();
    const overdue = allAppointments.filter(appt => {
        const apptDate = new Date(appt.appointment_date);
        return apptDate < now && appt.status === 'Scheduled';
    });
    
    const overdueList = document.getElementById('overdueList');
    const overdueCount = document.getElementById('overdueCount');
    
    if (!overdueList) return;
    
    overdueCount.textContent = overdue.length;
    
    if (overdue.length === 0) {
        overdueList.innerHTML = '<p class="text-muted text-center py-3">No overdue appointments</p>';
        return;
    }
    
    overdueList.innerHTML = overdue.slice(0, 5).map(appt => {
        const patient = allPatients.find(p => p.id === appt.patient_id);
        const daysOverdue = Math.ceil((now - new Date(appt.appointment_date)) / (1000 * 60 * 60 * 24));
        return `
            <div class="alert-item">
                <span class="alert-item-name">${patient ? patient.first_name + ' ' + patient.last_name : 'Unknown'}</span>
                <span class="alert-item-detail">${daysOverdue} days overdue • ${new Date(appt.appointment_date).toLocaleDateString()}</span>
            </div>
        `;
    }).join('');
}

function updateCriticalVitalLoads() {
    // This would connect to your vital load data
    // For now, showing placeholder
    const criticalVLList = document.getElementById('criticalVLList');
    const criticalVLCount = document.getElementById('criticalVLCount');
    
    if (!criticalVLList) return;
    
    criticalVLCount.textContent = 0;
    criticalVLList.innerHTML = '<p class="text-muted text-center py-3">No critical viral loads detected</p>';
}

// ===== QUICK STATS =====
function updateQuickStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Last 7 Days
    const last7DaysComplete = allAppointments.filter(a => {
        const apptDate = new Date(a.appointment_date);
        return apptDate >= sevenDaysAgo && apptDate <= today && a.status === 'Completed';
    }).length;
    
    const last7DaysNew = allPatients.filter(p => new Date(p.created_at) >= sevenDaysAgo).length;
    
    document.getElementById('last7DaysComplete').textContent = last7DaysComplete;
    document.getElementById('last7DaysNew').textContent = last7DaysNew;
    document.getElementById('last7DaysLost').textContent = '0'; // Placeholder
    
    // Today
    const todayComplete = allAppointments.filter(a => {
        const apptDate = new Date(a.appointment_date);
        return apptDate >= today && apptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000) && a.status === 'Completed';
    }).length;
    
    const todayScheduled = allAppointments.filter(a => {
        const apptDate = new Date(a.appointment_date);
        return apptDate >= today && apptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000) && a.status === 'Scheduled';
    }).length;
    
    const todayNew = allPatients.filter(p => new Date(p.created_at) >= today).length;
    
    document.getElementById('todayComplete').textContent = todayComplete;
    document.getElementById('todayScheduled').textContent = todayScheduled;
    document.getElementById('todayNew').textContent = todayNew;
    
    // Next 7 Days
    const next7DaysAppts = allAppointments.filter(a => {
        const apptDate = new Date(a.appointment_date);
        return apptDate > today && apptDate <= sevenDaysFromNow && a.status === 'Scheduled';
    }).length;
    
    document.getElementById('next7DaysAppts').textContent = next7DaysAppts;
    document.getElementById('next7DaysFollowUp').textContent = '0'; // Placeholder
    document.getElementById('pendingLabResults').textContent = '0'; // Placeholder
}

// ===== CHARTS SETUP =====
function setupCharts() {
    // Wait for eazychart to load
    if (typeof eazychart !== 'undefined') {
        initializeCharts();
    } else {
        setTimeout(setupCharts, 100);
    }
}

function initializeCharts() {
    // These will be initialized after data loads
    updateConditionChart();
    updateRegistrationChart();
}

function updateAppointmentCharts() {
    updateConditionChart();
    updateRegistrationChart();
    updateAppointmentTrendChart();
}

function updateConditionChart() {
    const canvas = document.getElementById('conditionChart');
    if (!canvas) return;
    
    // Sample data - replace with real data from your system
    const conditions = {
        'HIV': allPatients.filter(p => p.condition === 'HIV').length || 25,
        'Diabetes': allPatients.filter(p => p.condition === 'Diabetes').length || 18,
        'Hypertension': allPatients.filter(p => p.condition === 'Hypertension').length || 22,
        'TB': allPatients.filter(p => p.condition === 'TB').length || 8,
        'Other': Math.max(0, allPatients.length - 73)
    };
    
    const ctx = canvas.getContext('2d');
    
    if (window.conditionChart) {
        window.conditionChart.destroy();
    }
    
    window.conditionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditions),
            datasets: [{
                data: Object.values(conditions),
                backgroundColor: [
                    '#15696B',
                    '#EAB34B',
                    '#06b6d4',
                    '#10b981',
                    '#f59e0b'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateRegistrationChart() {
    const canvas = document.getElementById('registrationChart');
    if (!canvas) return;
    
    // Get monthly registration data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyData = months.map((month, i) => {
        const startDate = new Date(2024, i, 1);
        const endDate = new Date(2024, i + 1, 0);
        return allPatients.filter(p => {
            const created = new Date(p.created_at);
            return created >= startDate && created <= endDate;
        }).length;
    });
    
    const ctx = canvas.getContext('2d');
    
    if (window.registrationChart) {
        window.registrationChart.destroy();
    }
    
    window.registrationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'New Patient Registrations',
                data: monthlyData,
                backgroundColor: '#15696B',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                }
            }
        }
    });
}

function updateAppointmentTrendChart() {
    const canvas = document.getElementById('appointmentTrendChart');
    if (!canvas) return;
    
    // Get monthly appointment data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const scheduledData = [];
    const completedData = [];
    
    months.forEach((month, i) => {
        const startDate = new Date(2024, i, 1);
        const endDate = new Date(2024, i + 1, 0);
        
        const scheduled = allAppointments.filter(a => {
            const apptDate = new Date(a.appointment_date);
            return apptDate >= startDate && apptDate <= endDate && a.status === 'Scheduled';
        }).length;
        
        const completed = allAppointments.filter(a => {
            const apptDate = new Date(a.appointment_date);
            return apptDate >= startDate && apptDate <= endDate && a.status === 'Completed';
        }).length;
        
        scheduledData.push(scheduled);
        completedData.push(completed);
    });
    
    const ctx = canvas.getContext('2d');
    
    if (window.appointmentTrendChart) {
        window.appointmentTrendChart.destroy();
    }
    
    window.appointmentTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Scheduled',
                    data: scheduledData,
                    borderColor: '#15696B',
                    backgroundColor: 'rgba(21, 105, 107, 0.1)',
                    tension: 0.4,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Completed',
                    data: completedData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: false,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ===== TABLE UTILITIES =====
function setupTableSearchAndFilter() {
    // Delegated to individual filter functions
}

function sortTable(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();
        
        // Try numeric sort first
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
        }
        
        // Fallback to string sort
        return aValue.localeCompare(bValue);
    });
    
    rows.forEach(row => tbody.appendChild(row));
}

// ===== EXPORT FUNCTIONS =====
function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    let csv = [];
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    csv.push(headers.join(','));
    
    Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
        const cells = Array.from(row.querySelectorAll('td')).map(td => {
            let text = td.textContent.trim();
            // Escape quotes and wrap in quotes if contains comma
            if (text.includes(',')) {
                text = `"${text.replace(/"/g, '""')}"`;
            }
            return text;
        });
        csv.push(cells.join(','));
    });
    
    const csvContent = csv.join('\n');
    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

function exportTableToExcel(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ===== HELPER FUNCTIONS =====
function viewPatient(patientId) {
    const patient = allPatients.find(p => p.id === patientId);
    if (patient) {
        console.log('View patient:', patient);
        // Open patient details modal or navigate to details page
        alert(`Patient: ${patient.first_name} ${patient.last_name}`);
    }
}

// Load Chart.js library
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
document.head.appendChild(script);
