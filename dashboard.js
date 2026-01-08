// ===== DASHBOARD FUNCTIONALITY WITH SUPABASE =====

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
  checkSession();
  initializeDashboard();
  loadFacilityStats();
  setupLogout();
});

// Check if user has valid session
function checkSession() {
  const session = sessionStorage.getItem('healthflow_session');
  
  if (!session) {
    // No valid session, redirect to login
    window.location.href = 'login.html';
    return false;
  }
  
  try {
    const userData = JSON.parse(session);
    displayUserInfo(userData);
    return true;
  } catch (e) {
    console.error('Invalid session data:', e);
    sessionStorage.clear();
    window.location.href = 'login.html';
    return false;
  }
}

// Display user information in header
function displayUserInfo(userData) {
  const initials = userData.facilityName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const userAvatar = document.querySelector('.user-avatar');
  if (userAvatar) {
    userAvatar.textContent = initials;
  }
  
  const userDetailsDiv = document.querySelector('.user-details');
  if (userDetailsDiv) {
    userDetailsDiv.innerHTML = `
      <small>${userData.userRole}</small>
      <div title="${userData.facilityName}">${userData.facilityName}</div>
      <small style="color: #666; font-size: 10px;">
        ${userData.facilityRegion || 'N/A'} • ${userData.facilityId || 'N/A'}
      </small>
    `;
  }

  // Display facility information in the dashboard card
  const facilityNameDisplay = document.getElementById('facilityNameDisplay');
  if (facilityNameDisplay) {
    facilityNameDisplay.textContent = userData.facilityName || 'N/A';
  }

  const facilityIdDisplay = document.getElementById('facilityIdDisplay');
  if (facilityIdDisplay) {
    facilityIdDisplay.textContent = userData.facilityId || 'N/A';
  }

  const facilityRegionDisplay = document.getElementById('facilityRegionDisplay');
  if (facilityRegionDisplay) {
    facilityRegionDisplay.textContent = userData.facilityRegion || 'N/A';
  }
}

// Initialize dashboard sections
function initializeDashboard() {
  const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
  
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Only handle section clicks, not href links
      if (this.hasAttribute('onclick')) {
        e.preventDefault();
        
        // Get the section ID from onclick
        const onclickText = this.getAttribute('onclick');
        const match = onclickText.match(/showSection\('([^']+)'/);
        if (match) {
          const sectionId = match[1];
          showSection(sectionId);
          
          // Update active state
          sidebarLinks.forEach(l => l.classList.remove('active'));
          this.classList.add('active');
        }
      }
    });
  });
  
  // Show dashboard section by default
  showSection('overview');
  const overviewLink = document.querySelector('[onclick*="overview"]');
  if (overviewLink) {
    overviewLink.classList.add('active');
  }
}

// Show/hide sections
function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.remove('active'));
  
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
  }
}

// Load facility statistics from Supabase
async function loadFacilityStats() {
  try {
    const session = sessionStorage.getItem('healthflow_session');
    if (!session) return;
    
    const userData = JSON.parse(session);
    const facilityId = userData.facilityId;
    
    if (!supabaseClient) {
      console.error('Supabase client not initialized');
      return;
    }
    
    // Load patients count
    const { count: totalPatients, error: patientsError } = await supabaseClient
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('facility_id', facilityId);
    
    if (!patientsError && totalPatients !== null) {
      updateStatCard('totalPatients', totalPatients);
    }
    
    // Load active patients
    const { count: activePatients, error: activeError } = await supabaseClient
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('facility_id', facilityId)
      .eq('status', 'Active');
    
    if (!activeError && activePatients !== null) {
      updateStatCard('activePatients', activePatients);
    }
    
    // Load at-risk patients
    const { count: atRiskPatients, error: atRiskError } = await supabaseClient
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('facility_id', facilityId)
      .eq('status', 'At Risk');
    
    if (!atRiskError && atRiskPatients !== null) {
      updateStatCard('atRiskPatients', atRiskPatients);
    }
    
    // Load HIV patients
    const { count: hivPatients, error: hivError } = await supabaseClient
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('facility_id', facilityId)
      .eq('primary_condition', 'HIV');
    
    if (!hivError && hivPatients !== null) {
      updateStatCard('hivPatients', hivPatients);
    }
    
    // Load recent patients for table
    const { data: recentPatients, error: recentError } = await supabaseClient
      .from('patients')
      .select('*')
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!recentError && recentPatients) {
      displayRecentPatients(recentPatients);
    }
    
  } catch (error) {
    console.error('Error loading facility stats:', error);
  }
}

// Update stat card with value
function updateStatCard(cardId, value) {
  // Map of card IDs to stat card elements
  const statCardMap = {
    'totalPatients': 0,
    'activePatients': 1,
    'atRiskPatients': 2,
    'hivPatients': 3
  };
  
  const cards = document.querySelectorAll('#overview .stat-card');
  if (statCardMap[cardId] !== undefined) {
    const card = cards[statCardMap[cardId]];
    if (card) {
      const valueElement = card.querySelector('.stat-value');
      if (valueElement) {
        valueElement.textContent = value;
      }
    }
  }
}

// Display recent patients in table
function displayRecentPatients(patientsData) {
  const tbody = document.querySelector('#overview .table tbody');
  if (!tbody) return;
  
  if (patientsData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">
          <i class="fas fa-inbox"></i> No patients yet
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = patientsData.map(patient => {
    const statusBadge = `badge-${patient.status.toLowerCase().replace(' ', '-')}`;
    return `
      <tr>
        <td>${patient.first_name} ${patient.last_name}</td>
        <td>${patient.age || 'N/A'}</td>
        <td>${patient.primary_condition}</td>
        <td>${patient.registered_date}</td>
        <td><span class="badge-custom ${statusBadge}">${patient.status}</span></td>
        <td><button class="btn btn-sm btn-outline-primary" onclick="viewPatientFromDashboard('${patient.id}')">View</button></td>
      </tr>
    `;
  }).join('');
}

// Calculate age from date of birth
function calculateAge(dateString) {
  if (!dateString) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// View patient from dashboard
async function viewPatientFromDashboard(patientId) {
  try {
    const { data: patient, error } = await supabaseClient
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
    
    if (error || !patient) {
      console.error('Error loading patient:', error);
      return;
    }
    
    Swal.fire({
      title: `${patient.first_name} ${patient.last_name}`,
      html: `
        <div style="text-align: left;">
          <p><strong>Patient ID:</strong> ${patient.patient_id}</p>
          <p><strong>Age:</strong> ${patient.age || 'N/A'} years | <strong>Gender:</strong> ${patient.gender || 'N/A'}</p>
          <p><strong>Phone:</strong> ${patient.phone_number || 'N/A'}</p>
          <p><strong>Primary Condition:</strong> ${patient.primary_condition}</p>
          <p><strong>Status:</strong> <span class="badge" style="background: #0052CC; color: white;">${patient.status}</span></p>
          <p><strong>Registered:</strong> ${patient.registered_date}</p>
        </div>
      `,
      confirmButtonColor: '#0052CC',
      confirmButtonText: 'Close'
    });
  } catch (error) {
    console.error('Error viewing patient:', error);
  }
}

// Setup logout functionality
function setupLogout() {
  const logoutBtn = document.querySelector('.logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

// Handle logout
function handleLogout() {
  Swal.fire({
    title: 'Logout Confirmation',
    text: 'Are you sure you want to logout?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, Logout',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      // Clear session data
      sessionStorage.removeItem('healthflow_session');
      localStorage.removeItem('healthflow_email');
      
      // Show logout message
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been successfully logged out.',
        confirmButtonColor: '#0052CC',
      }).then(() => {
        // Redirect to login
        window.location.href = 'login.html';
      });
    }
  });
}

// Add Supabase to dashboard
function initSupabase() {
  if (typeof supabaseClient === 'undefined') {
    console.error('Supabase client not loaded. Check that supabase-config.js is included.');
  }
}

// Initialize Supabase on load
window.addEventListener('load', function() {
  initSupabase();
});
