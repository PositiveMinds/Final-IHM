// ===== USER REGISTRATION MODAL FUNCTIONALITY =====

// Initialize user registration on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeUserRegistration();
});

// Initialize user registration functionality
function initializeUserRegistration() {
  autoPopulateFacilityId();
  setupUserRegistrationForm();
}

// Auto-populate facility info from login session
function autoPopulateFacilityId() {
  try {
    const session = sessionStorage.getItem('healthflow_session');
    if (!session) {
      console.warn('No session found');
      return;
    }

    const userData = JSON.parse(session);
    const facilityId = userData.facilityId;
    const facilityName = userData.facilityName;

    if (facilityId) {
      const facilityIdField = document.getElementById('userFacilityId');
      if (facilityIdField) {
        facilityIdField.value = facilityId;
      }
    }

    if (facilityName) {
      const facilityNameField = document.getElementById('userFacilityName');
      if (facilityNameField) {
        facilityNameField.value = facilityName;
      }
    }
  } catch (error) {
    console.error('Error auto-populating facility info:', error);
  }
}

// Setup user registration form
function setupUserRegistrationForm() {
  const form = document.getElementById('userRegistrationForm');
  const submitBtn = document.getElementById('userRegistrationSubmitBtn');
  const messageDiv = document.getElementById('userRegistrationMessage');
  const fullnameInput = document.querySelector('input[name="fullname"]');
  const usernameInput = document.querySelector('input[name="username"]');

  // Auto-generate username from fullname and facility name
  if (fullnameInput && usernameInput) {
    fullnameInput.addEventListener('input', function() {
      const fullname = this.value.trim();
      const facilityName = document.getElementById('userFacilityName').value;
      if (fullname && facilityName) {
        const username = generateUsernameFromFullname(fullname, facilityName);
        usernameInput.value = username;
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', async function(e) {
      e.preventDefault();

      // Reset message
      messageDiv.style.display = 'none';
      messageDiv.innerHTML = '';

      // Get form values
      const email = document.querySelector('input[name="email"]').value;
      const password = document.getElementById('userPassword').value;
      const confirmPassword = document.getElementById('userConfirmPassword').value;

      // Validate email format
      if (!isValidEmail(email)) {
        showUserRegistrationMessage('Please enter a valid email address', 'danger');
        return;
      }

      // Validate passwords match
      if (password !== confirmPassword) {
        showUserRegistrationMessage('Passwords do not match', 'danger');
        return;
      }

      // Validate password requirements
      if (!validatePassword(password)) {
        showUserRegistrationMessage(
          'Password must be at least 8 characters and contain uppercase, lowercase, and numbers',
          'danger'
        );
        return;
      }

      // Get form data
      const formData = new FormData(form);
      const userData = {
        email: formData.get('email'),
        password: password,
        username: formData.get('username'),
        fullname: formData.get('fullname'),
        facility_id: formData.get('facility_id'),
        user_role: formData.get('user_role'),
        is_active: document.getElementById('isActive').checked
      };

      // Submit form
      await submitUserRegistration(userData, form, messageDiv);
    });
  }
}

// Generate username from fullname and facility name
function generateUsernameFromFullname(fullname, facilityName) {
  // Get first name (before first space) and convert to lowercase
  const firstName = fullname.trim().split(/\s+/)[0].toLowerCase();
  
  // Remove special characters from first name, keep only alphanumeric
  const cleanedFirstName = firstName.replace(/[^a-z0-9]/g, '');
  
  // Get first three letters of facility name and convert to lowercase
  const facilityPrefix = facilityName.trim().substring(0, 3).toLowerCase();
  
  // Remove special characters from facility prefix
  const cleanedFacilityPrefix = facilityPrefix.replace(/[^a-z0-9]/g, '');
  
  // Return with @ prefix: @firstname + first3lettersoffacility
  return '@' + cleanedFirstName + cleanedFacilityPrefix;
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password
function validatePassword(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const isLongEnough = password.length >= 8;

  return hasUpperCase && hasLowerCase && hasNumbers && isLongEnough;
}

// Submit user registration
async function submitUserRegistration(userData, form, messageDiv) {
  try {
    // Show loading state
    const submitBtn = document.getElementById('userRegistrationSubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      showUserRegistrationMessage('Email already registered', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }

    // Insert new user
    const { data: newUser, error: insertError } = await supabaseClient
      .from('users')
      .insert([
        {
          email: userData.email,
          password: userData.password,
          username: userData.username,
          fullname: userData.fullname,
          facility_id: userData.facility_id,
          user_role: userData.user_role,
          is_active: userData.is_active,
          created_at: new Date().toISOString()
        }
      ]);

    if (insertError) {
      console.error('Error registering user:', insertError);
      showUserRegistrationMessage(`Error: ${insertError.message}`, 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }

    // Success
    showUserRegistrationMessage('User registered successfully!', 'success');

    // Reset form
    form.reset();
    document.getElementById('isActive').checked = true;

    // Close modal after 2 seconds
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('userRegistrationModal'));
      if (modal) {
        modal.hide();
      }
    }, 2000);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  } catch (error) {
    console.error('Error submitting user registration:', error);
    showUserRegistrationMessage(`Error: ${error.message}`, 'danger');
    
    const submitBtn = document.getElementById('userRegistrationSubmitBtn');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Show registration message
function showUserRegistrationMessage(message, type) {
  const messageDiv = document.getElementById('userRegistrationMessage');
  messageDiv.className = `alert alert-${type} alert-dismissible fade show`;
  messageDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  messageDiv.style.display = 'block';
}

// Function to open user registration modal from dashboard
function openUserRegistrationModal() {
  const modal = new bootstrap.Modal(document.getElementById('userRegistrationModal'));
  modal.show();
}
