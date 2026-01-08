// ===== DATA IMPORT FUNCTIONALITY =====

// Initialize import modal
function initializeImportModal() {
  const importBtn = document.getElementById('importDataBtn');
  if (importBtn) {
    importBtn.addEventListener('click', openImportModal);
  }

  const fileInput = document.getElementById('importFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelection);
  }

  const importTypeSelect = document.getElementById('importTypeSelect');
  if (importTypeSelect) {
    importTypeSelect.addEventListener('change', updateImportInstructions);
  }

  const importConfirmBtn = document.getElementById('importConfirmBtn');
  if (importConfirmBtn) {
    importConfirmBtn.addEventListener('click', processImport);
  }
}

// Open import modal
function openImportModal() {
  const modal = new bootstrap.Modal(document.getElementById('importModal'));
  modal.show();
  resetImportForm();
}

// Reset import form
function resetImportForm() {
  document.getElementById('importFileInput').value = '';
  document.getElementById('importTypeSelect').value = 'patients';
  document.getElementById('importPreview').innerHTML = '';
  document.getElementById('importStats').innerHTML = '';
  updateImportInstructions();
}

// Handle file selection
function handleFileSelection(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.name.endsWith('.csv')) {
    Swal.fire('Error', 'Please select a CSV file', 'error');
    event.target.value = '';
    return;
  }

  // Read and preview file
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const csv = e.target.result;
      const rows = parseCSV(csv);
      
      if (rows.length === 0) {
        throw new Error('CSV file is empty');
      }

      displayImportPreview(rows);
    } catch (error) {
      Swal.fire('Error', 'Failed to parse CSV: ' + error.message, 'error');
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

// Parse CSV string
function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row = {};
    headers.forEach((header, index) => {
      row[header.toLowerCase().trim()] = values[index] ? values[index].trim() : '';
    });
    rows.push(row);
  }

  return rows;
}

// Parse a single CSV line (handles quoted values)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// Display import preview
function displayImportPreview(rows) {
  const importType = document.getElementById('importTypeSelect').value;
  const previewDiv = document.getElementById('importPreview');
  const statsDiv = document.getElementById('importStats');

  // Validate data for selected type
  const validation = validateImportData(rows, importType);
  
  if (!validation.valid) {
    previewDiv.innerHTML = `<div class="alert alert-danger">${validation.errors.join('<br>')}</div>`;
    statsDiv.innerHTML = '';
    return;
  }

  // Display stats
  statsDiv.innerHTML = `
    <div class="alert alert-info">
      <strong>Import Statistics:</strong><br>
      Total Records: <strong>${rows.length}</strong><br>
      Valid Records: <strong>${validation.validCount}</strong><br>
      Issues: <strong>${validation.issues.length > 0 ? validation.issues.length : 'None'}</strong>
    </div>
  `;

  // Display preview
  if (validation.issues.length > 0) {
    statsDiv.innerHTML += `
      <div class="alert alert-warning">
        <strong>Issues Found:</strong><br>
        ${validation.issues.map((issue, idx) => `Row ${idx + 2}: ${issue}`).join('<br>')}
      </div>
    `;
  }

  // Show sample of data
  const sampleRows = rows.slice(0, 5);
  const columns = Object.keys(sampleRows[0]);
  
  let table = '<table class="table table-sm table-bordered mt-3"><thead><tr>';
  columns.forEach(col => {
    table += `<th>${col}</th>`;
  });
  table += '</tr></thead><tbody>';

  sampleRows.forEach(row => {
    table += '<tr>';
    columns.forEach(col => {
      table += `<td style="font-size: 11px; max-width: 100px; overflow: hidden; text-overflow: ellipsis;">${row[col]}</td>`;
    });
    table += '</tr>';
  });
  table += '</tbody></table>';
  
  if (rows.length > 5) {
    table += `<p class="text-muted text-small">... and ${rows.length - 5} more records</p>`;
  }

  previewDiv.innerHTML = table;
}

// Validate import data based on type
function validateImportData(rows, importType) {
  const validation = {
    valid: true,
    validCount: rows.length,
    errors: [],
    issues: []
  };

  if (importType === 'patients') {
    const requiredFields = ['full_name', 'age', 'gender', 'phone', 'email', 'primary_condition'];
    
    // Check required fields in header
    const sampleRow = rows[0];
    const missingFields = requiredFields.filter(field => 
      !Object.keys(sampleRow).some(key => key === field.toLowerCase())
    );

    if (missingFields.length > 0) {
      validation.valid = false;
      validation.errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      return validation;
    }

    // Validate each row
    rows.forEach((row, idx) => {
      if (!row['full_name'] || row['full_name'].trim() === '') {
        validation.issues.push('Missing full_name');
      }
      if (!row['phone'] || row['phone'].trim() === '') {
        validation.issues.push('Missing phone');
      }
      if (!row['email'] || row['email'].trim() === '') {
        validation.issues.push('Missing email');
      }
      if (!row['age'] || isNaN(parseInt(row['age']))) {
        validation.issues.push('Invalid age value');
      }
    });

  } else if (importType === 'appointments') {
    const requiredFields = ['patient_id', 'full_name', 'next_appointment', 'appointment_time', 'status'];
    
    const sampleRow = rows[0];
    const missingFields = requiredFields.filter(field => 
      !Object.keys(sampleRow).some(key => key === field.toLowerCase())
    );

    if (missingFields.length > 0) {
      validation.valid = false;
      validation.errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      return validation;
    }

    // Validate each row
    rows.forEach((row, idx) => {
      if (!row['patient_id'] || row['patient_id'].trim() === '') {
        validation.issues.push('Missing patient_id');
      }
      if (!row['full_name'] || row['full_name'].trim() === '') {
        validation.issues.push('Missing full_name');
      }
      if (!row['next_appointment'] || row['next_appointment'].trim() === '') {
        validation.issues.push('Missing next_appointment');
      }
    });
  }

  return validation;
}

// Update import instructions based on type
function updateImportInstructions() {
  const importType = document.getElementById('importTypeSelect').value;
  const instructionsDiv = document.getElementById('importInstructions');

  const instructions = {
    patients: `
      <h6>Required Columns for Patient Import:</h6>
      <ul class="small">
        <li><strong>full_name</strong> - Patient's full name</li>
        <li><strong>age</strong> - Patient's age (numeric)</li>
        <li><strong>gender</strong> - M or F</li>
        <li><strong>phone</strong> - Contact phone number</li>
        <li><strong>email</strong> - Email address</li>
        <li><strong>primary_condition</strong> - Health condition</li>
        <li><strong>region</strong> - Geographic region (optional)</li>
        <li><strong>facility</strong> - Facility name (optional)</li>
      </ul>
    `,
    appointments: `
      <h6>Required Columns for Appointment Import:</h6>
      <ul class="small">
        <li><strong>patient_id</strong> - Patient ID (PAT****)</li>
        <li><strong>full_name</strong> - Patient's full name</li>
        <li><strong>next_appointment</strong> - Appointment date (DD/MM/YYYY)</li>
        <li><strong>appointment_time</strong> - Appointment time (HH:MM AM/PM)</li>
        <li><strong>status</strong> - Scheduled, Confirmed, Completed, etc.</li>
        <li><strong>primary_condition</strong> - Health condition (optional)</li>
        <li><strong>notes</strong> - Additional notes (optional)</li>
        <li><strong>facility</strong> - Facility name (optional)</li>
      </ul>
    `
  };

  instructionsDiv.innerHTML = instructions[importType] || '';
}

// Process import
async function processImport() {
  const importType = document.getElementById('importTypeSelect').value;
  const fileInput = document.getElementById('importFileInput');

  if (!fileInput.files[0]) {
    Swal.fire('Error', 'Please select a file', 'error');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function(e) {
    try {
      const csv = e.target.result;
      const rows = parseCSV(csv);

      // Show loading
      const loadingAlert = Swal.fire({
        title: 'Importing Data',
        html: 'Processing records... <br><small id="importProgress">0 / ' + rows.length + '</small>',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      if (importType === 'patients') {
        await importPatients(rows);
      } else if (importType === 'appointments') {
        await importAppointments(rows);
      }

      Swal.fire('Success', 'Data imported successfully!', 'success');
      resetImportForm();
      const modal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
      modal.hide();
      
      // Reload data
      loadFacilityStats();

    } catch (error) {
      Swal.fire('Error', 'Import failed: ' + error.message, 'error');
    }
  };

  reader.readAsText(file);
}

// Import patients
async function importPatients(rows) {
  const session = sessionStorage.getItem('healthflow_session');
  if (!session) throw new Error('Session expired');

  const userData = JSON.parse(session);
  const facilityId = userData.facilityId;
  
  let successCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      // Map CSV columns to database columns
      const patientData = {
        facility_id: facilityId,
        first_name: row['full_name']?.split(' ')[0] || '',
        last_name: row['full_name']?.split(' ').slice(1).join(' ') || '',
        age: parseInt(row['age']) || null,
        gender: row['gender']?.toUpperCase() || '',
        phone_number: row['phone'] || '',
        email: row['email'] || '',
        primary_condition: row['primary_condition'] || '',
        region: row['region'] || '',
        status: 'Active',
        registered_date: new Date().toISOString().split('T')[0],
        patient_id: generatePatientId()
      };

      const { data, error } = await supabaseClient
        .from('patients')
        .insert([patientData])
        .select();

      if (!error && data) {
        successCount++;
      }

      // Update progress
      document.getElementById('importProgress').textContent = (i + 1) + ' / ' + rows.length;

    } catch (error) {
      console.error('Error importing patient row:', error);
    }
  }

  return successCount;
}

// Import appointments
async function importAppointments(rows) {
  const session = sessionStorage.getItem('healthflow_session');
  if (!session) throw new Error('Session expired');

  const userData = JSON.parse(session);
  const facilityId = userData.facilityId;
  
  let successCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      // Map CSV columns to database columns
      const appointmentData = {
        facility_id: facilityId,
        patient_id: row['patient_id'] || '',
        patient_name: row['full_name'] || '',
        appointment_date: formatDateForDB(row['next_appointment']),
        appointment_time: row['appointment_time'] || '',
        status: row['status'] || 'Scheduled',
        primary_condition: row['primary_condition'] || '',
        notes: row['notes'] || '',
        facility: row['facility'] || '',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('appointments')
        .insert([appointmentData])
        .select();

      if (!error && data) {
        successCount++;
      }

      // Update progress
      document.getElementById('importProgress').textContent = (i + 1) + ' / ' + rows.length;

    } catch (error) {
      console.error('Error importing appointment row:', error);
    }
  }

  return successCount;
}

// Generate unique patient ID
function generatePatientId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return 'PAT' + timestamp + random;
}

// Format date from DD/MM/YYYY to YYYY-MM-DD
function formatDateForDB(dateStr) {
  if (!dateStr) return null;
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = parts[2];
  
  return `${year}-${month}-${day}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeImportModal();
});
