// ===== PATIENT MANAGEMENT WITH SUPABASE =====

let patients = [];
let filteredPatients = [];
let currentFacilityId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  checkSession();
  setupEventListeners();
  loadPatients();
});

// Check session
function checkSession() {
  const session = sessionStorage.getItem('healthflow_session');
  
  if (!session) {
    window.location.href = 'login.html';
    return false;
  }
  
  try {
    const userData = JSON.parse(session);
    currentFacilityId = userData.facilityId;
    displayUserInfo(userData);
    return true;
  } catch (e) {
    sessionStorage.clear();
    window.location.href = 'login.html';
    return false;
  }
}

// Display user info
function displayUserInfo(userData) {
  const initials = userData.facilityName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  document.getElementById('userAvatar').textContent = initials;
}

// Setup event listeners
function setupEventListeners() {
  // Search
  document.getElementById('searchInput').addEventListener('input', filterPatients);
  
  // Filters
  document.getElementById('statusFilter').addEventListener('change', filterPatients);
  document.getElementById('conditionFilter').addEventListener('change', filterPatients);
  
  // Form submission
  document.getElementById('addPatientForm').addEventListener('submit', handleAddPatient);
}

// Load patients from Supabase
async function loadPatients() {
  try {
    if (!supabaseClient) {
      console.error('Supabase client not initialized');
      showError('Database connection failed');
      return;
    }

    // Show loading state
    document.getElementById('patientsContainer').innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-spinner fa-spin"></i>
        <h5>Loading patients...</h5>
      </div>
    `;

    const { data, error } = await supabaseClient
      .from('patients')
      .select('*')
      .eq('facility_id', currentFacilityId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    patients = data || [];
    displayPatients(patients);
  } catch (error) {
    console.error('Error loading patients:', error);
    showError('Failed to load patients from database');
  }
}

// Display patients
function displayPatients(patientsToDisplay) {
  const container = document.getElementById('patientsContainer');
  const count = document.getElementById('patientCount');
  
  if (patientsToDisplay.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-users"></i>
        <h5>No patients found</h5>
        <p>Try adjusting your search or filters</p>
      </div>
    `;
    count.textContent = 'Total: 0 patients';
    return;
  }
  
  container.innerHTML = patientsToDisplay.map(patient => createPatientCard(patient)).join('');
  count.textContent = `Total: ${patientsToDisplay.length} patients`;
  
  // Add event listeners to action buttons
  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', function() {
      const patientId = this.getAttribute('data-patient-id');
      viewPatientDetails(patientId);
    });
  });
  
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function() {
      const patientId = this.getAttribute('data-patient-id');
      editPatient(patientId);
    });
  });
  
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', function() {
      const patientId = this.getAttribute('data-patient-id');
      deletePatient(patientId);
    });
  });
}

// Create patient card HTML
function createPatientCard(patient) {
  const statusClass = `status-${patient.status.toLowerCase().replace(' ', '-')}`;
  
  return `
    <div class="patient-card">
      <div class="patient-card-header">
        <div>
          <div class="patient-name">${patient.first_name} ${patient.last_name}</div>
          <div class="patient-info">
            <span><i class="fas fa-id-card"></i> ${patient.patient_id}</span>
          </div>
        </div>
        <div class="patient-avatar">
          ${patient.first_name[0]}${patient.last_name[0]}
        </div>
      </div>
      <div class="patient-card-body">
        <div class="patient-info">
          <span><i class="fas fa-birthday-cake"></i> ${patient.age || 'N/A'} years</span>
          <span><i class="fas fa-mars"></i> ${patient.gender || 'N/A'}</span>
        </div>
        <div class="patient-info">
          <span><i class="fas fa-phone"></i> ${patient.phone_number || 'N/A'}</span>
        </div>
        <div class="patient-info">
          <span><i class="fas fa-stethoscope"></i> ${patient.primary_condition}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <span class="patient-status ${statusClass}">${patient.status}</span>
        </div>
        <div class="patient-actions">
          <button class="btn-view" data-patient-id="${patient.id}">
            <i class="fas fa-eye"></i> View
          </button>
          <button class="btn-edit" data-patient-id="${patient.id}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn-delete" data-patient-id="${patient.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `;
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

// Filter patients
function filterPatients() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  const conditionFilter = document.getElementById('conditionFilter').value;
  
  filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.first_name.toLowerCase().includes(searchTerm) ||
      patient.last_name.toLowerCase().includes(searchTerm) ||
      patient.patient_id.toLowerCase().includes(searchTerm) ||
      patient.phone_number.includes(searchTerm);
    
    const matchesStatus = !statusFilter || patient.status === statusFilter;
    const matchesCondition = !conditionFilter || patient.primary_condition === conditionFilter;
    
    return matchesSearch && matchesStatus && matchesCondition;
  });
  
  displayPatients(filteredPatients);
}

// Open add patient modal
function openAddPatientModal() {
  document.getElementById('addPatientForm').reset();
  const modal = new bootstrap.Modal(document.getElementById('addPatientModal'));
  modal.show();
}

// Handle add patient
async function handleAddPatient(e) {
  e.preventDefault();
  
  const patientId = await generatePatientId();
  const age = parseInt(document.getElementById('age').value) || null;
  
  const newPatient = {
    patient_id: patientId,
    facility_id: currentFacilityId,
    first_name: document.getElementById('firstName').value,
    last_name: document.getElementById('lastName').value,
    age: age,
    gender: document.getElementById('gender').value,
    phone_number: document.getElementById('phoneNumber').value,
    email: document.getElementById('email').value,
    primary_condition: document.getElementById('primaryCondition').value,
    status: document.getElementById('patientStatus').value,
    notes: document.getElementById('notes').value
  };
  
  try {
    const { data, error } = await supabaseClient
      .from('patients')
      .insert([newPatient])
      .select();
    
    if (error) throw error;
    
    Swal.fire({
      icon: 'success',
      title: 'Patient Added',
      text: `${newPatient.first_name} ${newPatient.last_name} has been registered.`,
      confirmButtonColor: '#0052CC'
    }).then(() => {
      bootstrap.Modal.getInstance(document.getElementById('addPatientModal')).hide();
      loadPatients();
    });
  } catch (error) {
    console.error('Error adding patient:', error);
    showError('Failed to add patient');
  }
}

// Generate patient ID
async function generatePatientId() {
  const { data, error } = await supabaseClient
    .from('patients')
    .select('patient_id')
    .eq('facility_id', currentFacilityId)
    .order('created_at', { ascending: false })
    .limit(1);
  
  let count = 1;
  if (data && data.length > 0) {
    const lastId = data[0].patient_id;
    const match = lastId.match(/\d+$/);
    if (match) {
      count = parseInt(match[0]) + 1;
    }
  }
  
  return `PT-${String(count).padStart(3, '0')}`;
}

// View patient details
function viewPatientDetails(patientId) {
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return;
  
  Swal.fire({
    title: `${patient.first_name} ${patient.last_name}`,
    html: `
      <div style="text-align: left;">
        <p><strong>Patient ID:</strong> ${patient.patient_id}</p>
        <p><strong>Age:</strong> ${patient.age || 'N/A'} years | <strong>Gender:</strong> ${patient.gender || 'N/A'}</p>
        <p><strong>Phone:</strong> ${patient.phone_number || 'N/A'}</p>
        <p><strong>Email:</strong> ${patient.email || 'N/A'}</p>
        <p><strong>Primary Condition:</strong> ${patient.primary_condition}</p>
        <p><strong>Status:</strong> <span class="badge" style="background: #0052CC; color: white;">${patient.status}</span></p>
        <p><strong>Registered:</strong> ${patient.registered_date || 'N/A'}</p>
        <hr>
        <p><strong>Notes:</strong></p>
        <p>${patient.notes || 'No notes'}</p>
      </div>
    `,
    confirmButtonColor: '#0052CC',
    confirmButtonText: 'Close'
  });
}

// Edit patient
function editPatient(patientId) {
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return;
  
  Swal.fire({
    title: 'Edit Patient',
    html: `
      <div class="mb-3 text-start">
        <label class="form-label">First Name</label>
        <input type="text" class="form-control" id="editFirstName" value="${patient.first_name}">
      </div>
      <div class="mb-3 text-start">
        <label class="form-label">Last Name</label>
        <input type="text" class="form-control" id="editLastName" value="${patient.last_name}">
      </div>
      <div class="mb-3 text-start">
        <label class="form-label">Status</label>
        <select class="form-select" id="editStatus">
          <option value="Active" ${patient.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="At Risk" ${patient.status === 'At Risk' ? 'selected' : ''}>At Risk</option>
          <option value="Inactive" ${patient.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
      <div class="mb-3 text-start">
        <label class="form-label">Notes</label>
        <textarea class="form-control" id="editNotes" rows="3">${patient.notes || ''}</textarea>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Save Changes',
    confirmButtonColor: '#0052CC',
    preConfirm: () => {
      const firstName = document.getElementById('editFirstName').value;
      const lastName = document.getElementById('editLastName').value;
      const status = document.getElementById('editStatus').value;
      const notes = document.getElementById('editNotes').value;
      
      if (!firstName || !lastName) {
        Swal.showValidationMessage('Name cannot be empty');
        return false;
      }
      
      return { firstName, lastName, status, notes };
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const { error } = await supabaseClient
          .from('patients')
          .update({
            first_name: result.value.firstName,
            last_name: result.value.lastName,
            status: result.value.status,
            notes: result.value.notes
          })
          .eq('id', patientId);
        
        if (error) throw error;
        
        Swal.fire('Success', 'Patient updated successfully', 'success');
        loadPatients();
      } catch (error) {
        console.error('Error updating patient:', error);
        showError('Failed to update patient');
      }
    }
  });
}

// Delete patient
function deletePatient(patientId) {
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return;
  
  Swal.fire({
    title: 'Delete Patient?',
    text: `Are you sure you want to delete ${patient.first_name} ${patient.last_name}? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete',
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const { error } = await supabaseClient
          .from('patients')
          .delete()
          .eq('id', patientId);
        
        if (error) throw error;
        
        Swal.fire('Deleted', 'Patient has been deleted.', 'success');
        loadPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
        showError('Failed to delete patient');
      }
    }
  });
}

// Show error message
function showError(message) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonColor: '#dc3545'
  });
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
    confirmButtonText: 'Yes, Logout'
  }).then((result) => {
    if (result.isConfirmed) {
      sessionStorage.removeItem('healthflow_session');
      localStorage.removeItem('healthflow_email');
      
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been successfully logged out.',
        confirmButtonColor: '#0052CC'
      }).then(() => {
        window.location.href = 'login.html';
      });
    }
  });
}
