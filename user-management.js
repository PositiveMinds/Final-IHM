// ===== USER MANAGEMENT FUNCTIONALITY =====
console.log('USER MANAGEMENT JS FILE LOADED');

// Initialize user management on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded event fired');
  initializeUserManagement();
});

// Initialize user management
async function initializeUserManagement() {
  setupUserManagementListeners();
  await loadUsers();
}

// Setup event listeners
function setupUserManagementListeners() {
  const createUserBtn = document.getElementById('createNewUserBtn');
  if (createUserBtn) {
    createUserBtn.addEventListener('click', openCreateUserModal);
  }

  const submitBtn = document.getElementById('submitCreateUserBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleCreateUser);
  }

  const submitEditBtn = document.getElementById('submitEditUserBtn');
  if (submitEditBtn) {
    submitEditBtn.addEventListener('click', handleEditUserSubmit);
  }

  // Auto-generate username from fullname
  const fullnameInput = document.getElementById('newUserFullname');
  if (fullnameInput) {
    fullnameInput.addEventListener('input', function() {
      generateUsernameFromFullname(this.value);
    });
  }
}

// Load and display all users
async function loadUsers() {
  console.log('loadUsers function called');
  
  try {
    const session = JSON.parse(localStorage.getItem('healthflow_session'));
    console.log('Session found:', !!session);
    
    if (!session) {
      console.warn('No session found');
      return;
    }

    const usersTableBody = document.getElementById('usersTableBody');
    console.log('usersTableBody element found:', !!usersTableBody);
    
    if (!usersTableBody) {
      console.error('usersTableBody not found');
      return;
    }

    // Show loading state
    usersTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4"><i class="ri-loader-4-line animate-spin"></i> Loading users...</td></tr>';

    // Fetch users from Supabase
    console.log('Fetching users from Supabase...');
    const { data: users, error } = await supabaseClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Supabase users response:', { users, error });

    if (error) {
      console.error('Error fetching users:', error);
      usersTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading users: ' + error.message + '</td></tr>';
      return;
    }

    if (!users || users.length === 0) {
      console.warn('No users found');
      usersTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No users found</td></tr>';
      return;
    }

    console.log('Populating table with ' + users.length + ' users');

    // Populate table
    usersTableBody.innerHTML = '';
    users.forEach((user, index) => {
      const row = document.createElement('tr');
      const userRole = user.user_role || 'User';
      const statusBadge = user.is_active 
        ? '<span class="badge bg-success">Active</span>' 
        : '<span class="badge bg-secondary">Inactive</span>';
      
      const createdDate = new Date(user.created_at).toLocaleDateString();
      
      console.log(`Creating row ${index} for user ${user.uid} - ${user.fullname}`);
      
      row.innerHTML = `
        <td>${user.fullname || 'N/A'}</td>
        <td>${user.email || 'N/A'}</td>
        <td>${user.username || 'N/A'}</td>
        <td>${userRole}</td>
        <td>${statusBadge}</td>
        <td>${createdDate}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="editUserAccount('${user.uid}')" title="Edit">
            <i class="ri-edit-line"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteUserAccount('${user.uid}')" title="Delete">
            <i class="ri-delete-bin-line"></i>
          </button>
        </td>
      `;
      usersTableBody.appendChild(row);
      
      // Add direct event listeners to the edit button
      const editBtn = row.querySelector('.btn-outline-primary');
      if (editBtn) {
        editBtn.addEventListener('click', function(e) {
          console.log('Edit button clicked for user:', user.uid);
          e.preventDefault();
          e.stopPropagation();
          editUserAccount(user.uid);
        });
      }
    });
    
    console.log('Table populated successfully with ' + users.length + ' users');
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// Open create user modal
function openCreateUserModal() {
  const form = document.getElementById('createUserForm');
  if (form) {
    form.reset();
  }
  const modal = new bootstrap.Modal(document.getElementById('createUserModal'));
  modal.show();
}

// Generate username from fullname
function generateUsernameFromFullname(fullname) {
  const usernameInput = document.getElementById('newUserUsername');
  if (!usernameInput) return;

  if (!fullname.trim()) {
    usernameInput.value = '';
    return;
  }

  // Generate username: lowercase first name + first 3 chars of last name + random number
  const names = fullname.trim().split(/\s+/);
  const firstName = names[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const lastName = names.length > 1 ? names[names.length - 1].substring(0, 3).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const randomNum = Math.floor(Math.random() * 1000);
  
  usernameInput.value = `@${firstName}${lastName}${randomNum}`.substring(0, 20);
}

// Handle create user submission
async function handleCreateUser(e) {
  e.preventDefault();

  const fullname = document.getElementById('newUserFullname').value.trim();
  const email = document.getElementById('newUserEmail').value.trim();
  const username = document.getElementById('newUserUsername').value.trim();
  const password = document.getElementById('newUserPassword').value;
  const confirmPassword = document.getElementById('newUserConfirmPassword').value;
  const role = document.getElementById('newUserRole').value;
  const messageDiv = document.getElementById('createUserMessage');

  // Validation
  if (!fullname || !email || !username || !password || !confirmPassword) {
    showUserMessage(messageDiv, 'All fields are required', 'danger');
    return;
  }

  if (!isValidEmail(email)) {
    showUserMessage(messageDiv, 'Invalid email format', 'danger');
    return;
  }

  if (password !== confirmPassword) {
    showUserMessage(messageDiv, 'Passwords do not match', 'danger');
    return;
  }

  if (!validatePassword(password)) {
    showUserMessage(messageDiv, 'Password must be at least 8 characters with uppercase, lowercase, and numbers', 'danger');
    return;
  }

  // Submit
  await submitCreateUser({
    fullname,
    email,
    username,
    password,
    user_role: role,
    is_active: true
  }, messageDiv);
}

// Submit create user request
async function submitCreateUser(userData, messageDiv) {
  try {
    const submitBtn = document.getElementById('submitCreateUserBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Creating...';

    // Check if email exists
    const { data: existingEmail, error: checkError } = await supabaseClient
      .from('users')
      .select('email')
      .eq('email', userData.email)
      .single();

    if (existingEmail) {
      showUserMessage(messageDiv, 'Email already registered', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }

    // Get current facility ID from session
    const session = JSON.parse(localStorage.getItem('healthflow_session'));
    const facilityId = session?.fid || null;

    // Create user
    const { data: newUser, error: insertError } = await supabaseClient
      .from('users')
      .insert([
        {
          fullname: userData.fullname,
          email: userData.email,
          username: userData.username,
          password: userData.password,
          user_role: userData.user_role,
          fid: facilityId,
          is_active: userData.is_active,
          created_at: new Date().toISOString()
        }
      ]);

    if (insertError) {
      console.error('Insert error:', insertError);
      showUserMessage(messageDiv, `Error: ${insertError.message}`, 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }

    // Success
    showUserMessage(messageDiv, 'User created successfully!', 'success');
    
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
      modal.hide();
      loadUsers();
    }, 1500);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  } catch (error) {
    console.error('Error creating user:', error);
    showUserMessage(messageDiv, `Error: ${error.message}`, 'danger');
    
    const submitBtn = document.getElementById('submitCreateUserBtn');
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Create User';
  }
}

// Store current editing user ID
let currentEditingUserId = null;

// Close edit modal
function closeEditModal() {
  console.log('Closing edit modal');
  const customModal = document.getElementById('editUserModalCustom');
  if (customModal) {
    customModal.style.display = 'none';
  }
  currentEditingUserId = null;
}

// Edit user account
async function editUserAccount(userId) {
  console.log('editUserAccount called with userId:', userId);
  
  try {
    console.log('Fetching user details from Supabase...');
    
    // Fetch user details
    const { data: user, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('uid', userId)
      .single();

    console.log('Supabase response:', { user, error });

    if (error || !user) {
      console.error('Error loading user:', error);
      Swal.fire('Error', 'Could not load user details: ' + (error ? error.message : 'User not found'), 'error');
      return;
    }

    console.log('User loaded successfully:', user);

    // Store the user ID for submission
    currentEditingUserId = userId;

    // Get form elements
    const fullnameEl = document.getElementById('modalEditFullname');
    const emailEl = document.getElementById('modalEditEmail');
    const roleEl = document.getElementById('modalEditRole');
    const activeEl = document.getElementById('modalEditActive');
    const messageDiv = document.getElementById('editUserMessage');
    const modalEl = document.getElementById('editUserModal');

    console.log('Form elements found:', { fullnameEl, emailEl, roleEl, activeEl, messageDiv, modalEl });

    if (!fullnameEl || !emailEl || !roleEl || !activeEl || !messageDiv || !modalEl) {
      console.error('Some form elements are missing');
      Swal.fire('Error', 'Form elements not found on page', 'error');
      return;
    }

    // Populate form fields
    console.log('Setting form values...');
    fullnameEl.value = user.fullname || '';
    emailEl.value = user.email || '';
    roleEl.value = user.user_role || 'User';
    activeEl.checked = user.is_active || false;

    console.log('Form values set:', {
      fullname: fullnameEl.value,
      email: emailEl.value,
      role: roleEl.value,
      active: activeEl.checked
    });

    // Clear any previous messages
    messageDiv.style.display = 'none';
    messageDiv.innerHTML = '';

    // Show the custom modal
    console.log('Opening custom modal...');
    const customModal = document.getElementById('editUserModalCustom');
    if (customModal) {
      customModal.style.display = 'flex';
      customModal.style.visibility = 'visible';
      customModal.style.pointerEvents = 'auto';
      console.log('Custom modal opened');
      
      // Add click listeners to inputs for debugging
      const fullnameInput = document.getElementById('modalEditFullname');
      const emailInput = document.getElementById('modalEditEmail');
      const roleInput = document.getElementById('modalEditRole');
      
      [fullnameInput, emailInput, roleInput].forEach(input => {
        if (input) {
          input.addEventListener('click', function(e) {
            console.log('Input clicked:', this.id, e);
          });
          input.addEventListener('mousedown', function(e) {
            console.log('Input mousedown:', this.id, e);
          });
          input.addEventListener('focus', function(e) {
            console.log('Input focused:', this.id, e);
          });
        }
      });
      
      // Focus on first input
      setTimeout(() => {
        const firstInput = document.getElementById('modalEditFullname');
        if (firstInput) {
          console.log('Attempting to focus first input');
          firstInput.style.pointerEvents = 'auto';
          firstInput.style.position = 'relative';
          firstInput.style.zIndex = '100000';
          firstInput.focus();
          firstInput.click();
          console.log('Focus and click completed');
        }
      }, 100);
    } else {
      console.error('Custom modal element not found');
    }

  } catch (error) {
    console.error('Error editing user:', error);
    Swal.fire('Error', 'Exception: ' + error.message, 'error');
  }
}

// Handle edit user submission
async function handleEditUserSubmit() {
  const fullname = document.getElementById('modalEditFullname').value.trim();
  const email = document.getElementById('modalEditEmail').value.trim();
  const role = document.getElementById('modalEditRole').value;
  const isActive = document.getElementById('modalEditActive').checked;
  const messageDiv = document.getElementById('editUserMessage');

  // Validation
  if (!fullname) {
    showEditMessage(messageDiv, 'Full name is required', 'danger');
    return;
  }

  if (!email) {
    showEditMessage(messageDiv, 'Email is required', 'danger');
    return;
  }

  if (!isValidEmail(email)) {
    showEditMessage(messageDiv, 'Invalid email format', 'danger');
    return;
  }

  // Submit update
  try {
    const submitBtn = document.getElementById('submitEditUserBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Updating...';

    const { error: updateError } = await supabaseClient
      .from('users')
      .update({
        fullname: fullname,
        email: email,
        user_role: role,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('uid', currentEditingUserId);

    if (updateError) {
      showEditMessage(messageDiv, `Error: ${updateError.message}`, 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }

    // Success
    showEditMessage(messageDiv, 'User updated successfully!', 'success');
    
    setTimeout(() => {
      closeEditModal();
      loadUsers();
    }, 1500);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  } catch (error) {
    console.error('Error updating user:', error);
    showEditMessage(messageDiv, `Error: ${error.message}`, 'danger');
    
    const submitBtn = document.getElementById('submitEditUserBtn');
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Update User';
  }
}

// Show edit message
function showEditMessage(messageDiv, message, type) {
  messageDiv.className = `alert alert-${type} alert-dismissible fade show`;
  messageDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  messageDiv.style.display = 'block';
}

// Delete user account
async function deleteUserAccount(userId) {
  try {
    const { isConfirmed } = await Swal.fire({
      title: 'Delete User?',
      text: 'This action cannot be undone. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });

    if (!isConfirmed) return;

    // Delete user
    const { error } = await supabaseClient
      .from('users')
      .delete()
      .eq('uid', userId);

    if (error) {
      Swal.fire('Error', error.message, 'error');
      return;
    }

    Swal.fire('Deleted', 'User has been deleted', 'success');
    loadUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
    Swal.fire('Error', error.message, 'error');
  }
}

// Validate email
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

// Show message
function showUserMessage(messageDiv, message, type) {
  messageDiv.className = `alert alert-${type} alert-dismissible fade show`;
  messageDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  messageDiv.style.display = 'block';
}

// Export function for global access
window.openCreateUserModal = openCreateUserModal;
window.editUserAccount = editUserAccount;
window.handleEditUserSubmit = handleEditUserSubmit;
window.closeEditModal = closeEditModal;
window.deleteUserAccount = deleteUserAccount;
window.loadUsers = loadUsers;
