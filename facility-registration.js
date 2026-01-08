// ===== FACILITY REGISTRATION FUNCTIONALITY =====

// Initialize facility registration on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeFacilityRegistration();
});

// Initialize facility registration functionality
function initializeFacilityRegistration() {
  setupFacilityRegistration();
}

// Setup facility registration form
function setupFacilityRegistration() {
  const generateBtn = document.getElementById('generateFacilityIdBtn');
  const facilityNameInput = document.getElementById('facilityNameInput');
  const facilityIdInput = document.getElementById('facilityIdInput');
  const regionSelect = document.querySelector('select[name="region"]');

  if (generateBtn) {
    generateBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const facilityName = facilityNameInput.value.trim();
      const region = regionSelect.value;

      if (!facilityName) {
        showFacilityMessage('Please enter facility name first', 'warning');
        return;
      }

      if (!region) {
        showFacilityMessage('Please select a region first', 'warning');
        return;
      }

      const generatedId = generateFacilityId(facilityName, region);
      facilityIdInput.value = generatedId;
      showFacilityMessage('Facility ID generated successfully!', 'success');
    });
  }
}

// Generate facility ID from name and region
function generateFacilityId(facilityName, region) {
  // Convert region to lowercase and replace spaces with hyphens
  const regionCode = region.toLowerCase().replace(/\s+/g, '-');
  
  // Get first word of facility name (usually the city or main identifier)
  const facilityCode = facilityName
    .toLowerCase()
    .split(/\s+/)[0]
    .replace(/[^a-z0-9]/g, '');
  
  // Format: facility-region-001
  // In a real app, you'd check the database for existing IDs to increment the number
  const facilityId = `facility-${regionCode}-${facilityCode}`;
  
  return facilityId;
}

// Show facility registration message
function showFacilityMessage(message, type) {
  const messageDiv = document.getElementById('facilityMessage');
  messageDiv.className = `alert alert-${type} alert-dismissible fade show`;
  messageDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  messageDiv.style.display = 'block';
}

// Setup facility form when modal is shown
document.addEventListener('show.bs.modal', function(e) {
  if (e.target && e.target.id === 'facilityModal') {
    // Reset form when modal opens
    document.getElementById('facilityForm').reset();
    const messageDiv = document.getElementById('facilityMessage');
    if (messageDiv) {
      messageDiv.style.display = 'none';
    }
  }
});

// Initialize on load
window.addEventListener('load', function() {
  setupFacilityRegistration();
});
