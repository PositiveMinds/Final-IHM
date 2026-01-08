// ===== REGISTRATION FUNCTIONALITY WITH SUPABASE =====

// Password strength checker
function checkPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return strength;
}

// Update password strength indicator
function updatePasswordStrength() {
  const password = document.getElementById("password").value;
  const strengthIndicator = document.getElementById("strengthIndicator");
  const strengthText = document.getElementById("strengthText");
  
  if (password.length === 0) {
    strengthIndicator.className = "strength-indicator";
    strengthText.className = "strength-text";
    return;
  }
  
  const strength = checkPasswordStrength(password);
  
  strengthText.className = "strength-text show";
  strengthIndicator.className = "strength-indicator";
  
  if (strength <= 2) {
    strengthIndicator.classList.add("strength-weak");
    strengthText.innerHTML = '<i class="fas fa-exclamation-circle"></i> Weak password';
    strengthText.classList.add("strength-weak-text");
  } else if (strength <= 3) {
    strengthIndicator.classList.add("strength-fair");
    strengthText.innerHTML = '<i class="fas fa-check-circle"></i> Fair password';
    strengthText.classList.add("strength-fair-text");
  } else {
    strengthIndicator.classList.add("strength-strong");
    strengthText.innerHTML = '<i class="fas fa-check-circle"></i> Strong password';
    strengthText.classList.add("strength-strong-text");
  }
}

// Check password match
function checkPasswordMatch() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const passwordMatch = document.getElementById("passwordMatch");
  
  if (confirmPassword.length === 0) {
    passwordMatch.className = "password-match";
    return;
  }
  
  passwordMatch.className = "password-match show";
  
  if (password === confirmPassword) {
    passwordMatch.innerHTML = '<i class="fas fa-check-circle"></i> Passwords match';
    passwordMatch.classList.add("match");
  } else {
    passwordMatch.innerHTML = '<i class="fas fa-times-circle"></i> Passwords do not match';
    passwordMatch.classList.remove("match");
    passwordMatch.classList.add("mismatch");
  }
}

// Auto-generate Facility ID from Facility Name
function generateFacilityId(facilityName) {
  // Convert to lowercase, replace spaces and special characters with hyphens
  const slug = facilityName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-')  // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // Add a random suffix for uniqueness (4 random chars)
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  
  return `facility-${slug}-${randomSuffix}`;
}

// Update facility ID when facility name changes
document.getElementById("facilityName").addEventListener("input", function() {
  const facilityName = this.value;
  if (facilityName.trim()) {
    const generatedId = generateFacilityId(facilityName);
    document.getElementById("facilityId").value = generatedId;
  } else {
    document.getElementById("facilityId").value = '';
  }
});

// Event listeners for password fields
document.getElementById("password").addEventListener("input", function() {
  updatePasswordStrength();
  checkPasswordMatch();
});

document.getElementById("confirmPassword").addEventListener("input", checkPasswordMatch);

// Handle registration form submission
document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("facilityEmail").value;
  const facilityName = document.getElementById("facilityName").value;
  const facilityId = document.getElementById("facilityId").value;
  const userRole = document.getElementById("userRole").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const termsAccepted = document.getElementById("terms").checked;

  // Validation
  if (!email || !facilityName || !facilityId || !userRole || !password || !confirmPassword) {
    Swal.fire({
      icon: "warning",
      title: "Missing Information",
      text: "Please fill in all required fields.",
      confirmButtonColor: "#0052CC",
    });
    return;
  }

  if (!termsAccepted) {
    Swal.fire({
      icon: "warning",
      title: "Terms Not Accepted",
      text: "You must agree to the Terms and Conditions to continue.",
      confirmButtonColor: "#0052CC",
    });
    return;
  }

  if (password !== confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "Passwords Do Not Match",
      text: "Please ensure both password fields are identical.",
      confirmButtonColor: "#dc3545",
    });
    return;
  }

  const strength = checkPasswordStrength(password);
  if (strength < 3) {
    Swal.fire({
      icon: "warning",
      title: "Weak Password",
      text: "Please create a stronger password with at least 8 characters, including uppercase, numbers, and special characters.",
      confirmButtonColor: "#0052CC",
    });
    return;
  }

  // Show loading state
  Swal.fire({
    title: "Creating Account...",
    html: "Please wait while we set up your facility account.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    // Hash password (using simple bcrypt - in production use server-side hashing)
    const passwordHash = await hashPassword(password);

    // Check if email already exists
    const { data: existingUser, error: searchError } = await supabaseClient
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      Swal.fire({
        icon: "error",
        title: "Email Already Registered",
        text: "This email is already associated with an account.",
        confirmButtonColor: "#dc3545",
      });
      return;
    }

    // Check if facility ID already exists
    const { data: existingFacility } = await supabaseClient
      .from("users")
      .select("facility_id")
      .eq("facility_id", facilityId)
      .single();

    if (existingFacility) {
      Swal.fire({
        icon: "error",
        title: "Facility ID Already Exists",
        text: "This facility ID is already registered.",
        confirmButtonColor: "#dc3545",
      });
      return;
    }

    // Insert new user
    const { data: newUser, error: insertError } = await supabaseClient
      .from("users")
      .insert([
        {
          email: email,
          password: passwordHash,
          facility_name: facilityName,
          facility_id: facilityId,
          user_role: userRole,
          is_active: true,
        }
      ])
      .select();

    if (insertError) {
      throw insertError;
    }

    // Success message
    Swal.fire({
      icon: "success",
      title: "Account Created!",
      html: `<p>Welcome to HealthFlow, <strong>${facilityName}</strong>!</p><p>Your account has been successfully created.</p>`,
      confirmButtonColor: "#28a745",
      confirmButtonText: "Go to Login",
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to login page
        window.location.href = "login.html";
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    let errorMessage = "An error occurred during registration.";
    
    if (error.message.includes("NetworkError")) {
      errorMessage = "Network error. Please check:<br>1. Your internet connection<br>2. Supabase URL is correct<br>3. Supabase anon key is valid<br>4. Check browser console for details";
    } else if (error.message.includes("duplicate key")) {
      errorMessage = "This email or facility ID is already registered.";
    } else if (error.message.includes("401")) {
      errorMessage = "Invalid Supabase credentials. Please check your configuration.";
    } else if (error.message.includes("404")) {
      errorMessage = "Users table not found in Supabase. Please create it first.";
    }
    
    Swal.fire({
      icon: "error",
      title: "Registration Error",
      html: errorMessage,
      confirmButtonColor: "#dc3545",
    });
  }
});

// Simple password hashing function (for demo - use bcryptjs in production)
async function hashPassword(password) {
  // For production, use bcryptjs:
  // const bcrypt = require('bcryptjs');
  // const salt = await bcrypt.genSalt(10);
  // return await bcrypt.hash(password, salt);

  // For now, return password as-is (NOT SECURE - FOR DEMO ONLY)
  // This should be replaced with server-side hashing
  return password;
}

// Show Terms and Conditions
function showTerms(e) {
  e.preventDefault();
  Swal.fire({
    title: "Terms and Conditions",
    html: `
      <div style="text-align: left; max-height: 400px; overflow-y: auto;">
        <h5>HealthFlow Terms of Service</h5>
        <p><strong>1. Acceptance of Terms</strong></p>
        <p>By registering for HealthFlow, you agree to comply with these terms.</p>
        
        <p><strong>2. Account Responsibility</strong></p>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        
        <p><strong>3. Data Protection</strong></p>
        <p>You agree that patient data will be handled in compliance with HIPAA and local healthcare regulations.</p>
        
        <p><strong>4. Acceptable Use</strong></p>
        <p>You agree not to use HealthFlow for any unlawful purposes or in violation of any applicable regulations.</p>
        
        <p><strong>5. Limitation of Liability</strong></p>
        <p>HealthFlow is provided on an "as-is" basis. We are not liable for any indirect or consequential damages.</p>
        
        <p><strong>6. Termination</strong></p>
        <p>We reserve the right to terminate accounts that violate these terms.</p>
      </div>
    `,
    confirmButtonColor: "#0052CC",
  });
}

// Show Privacy Policy
function showPrivacy(e) {
  e.preventDefault();
  Swal.fire({
    title: "Privacy Policy",
    html: `
      <div style="text-align: left; max-height: 400px; overflow-y: auto;">
        <h5>HealthFlow Privacy Policy</h5>
        <p><strong>1. Information We Collect</strong></p>
        <p>We collect facility information, user credentials, and patient health data as needed for system operation.</p>
        
        <p><strong>2. How We Use Information</strong></p>
        <p>Your data is used solely for operating HealthFlow and providing healthcare management services.</p>
        
        <p><strong>3. Data Security</strong></p>
        <p>We use AES-256 encryption and HIPAA-compliant security measures to protect your data.</p>
        
        <p><strong>4. Data Sharing</strong></p>
        <p>We do not share your data with third parties without explicit consent, except as required by law.</p>
        
        <p><strong>5. Your Rights</strong></p>
        <p>You have the right to access, modify, or request deletion of your data.</p>
        
        <p><strong>6. Contact Us</strong></p>
        <p>For privacy concerns, contact us at privacy@healthflow.io</p>
      </div>
    `,
    confirmButtonColor: "#0052CC",
  });
}

// Check session on load (redirect if already logged in)
window.addEventListener("load", function () {
  const session = sessionStorage.getItem("healthflow_session");
  if (session) {
    // User is already logged in, redirect to dashboard
    window.location.href = "dashboard.html";
  }
});
