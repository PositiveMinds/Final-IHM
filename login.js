// ===== LOGIN FUNCTIONALITY WITH SUPABASE =====

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("facilityEmail").value;
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  // Validate inputs
  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Missing Credentials",
      text: "Please enter both email and password.",
      confirmButtonColor: "#0052CC",
    });
    return;
  }

  // Show loading state
  Swal.fire({
    title: "Logging In...",
    html: "Authenticating your facility account.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    // Query users table to find the user
    const { data: users, error: searchError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (searchError || !users) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password.",
        confirmButtonColor: "#dc3545",
      });
      return;
    }

    // Verify password using Supabase Auth (simulated comparison)
    // Note: In production, use bcryptjs to compare hashed passwords
    if (await comparePassword(password, users.password)) {
      // Check if user is active
      if (!users.is_active) {
        Swal.fire({
          icon: "error",
          title: "Account Disabled",
          text: "Your account has been disabled. Please contact support.",
          confirmButtonColor: "#dc3545",
        });
        return;
      }

      // Fetch the actual facility UUID from the facilities table
       let facilityUUID = null;
       let facilityRegion = null;
       try {
         const { data: facility, error: facilityError } = await supabaseClient
           .from('facilities')
           .select('id, facility_id, region')
           .eq('facility_id', users.facility_id)
           .single();
         
         if (facility && !facilityError) {
           facilityUUID = facility.id;
           facilityRegion = facility.region;
         }
       } catch (e) {
         console.warn('Could not fetch facility UUID:', e);
       }

       // Store session data
       const sessionData = {
         id: users.id,
         email: users.email,
         facilityName: users.facility_name,
         facilityId: facilityUUID || users.facility_id,
         facilityIdCode: users.facility_id,
         facilityRegion: facilityRegion,
         userRole: users.user_role,
         loginTime: new Date().toISOString(),
       };

      sessionStorage.setItem("healthflow_session", JSON.stringify(sessionData));

      if (rememberMe) {
        localStorage.setItem("healthflow_email", email);
      }

      // Success message
      Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: `Welcome back, ${users.facility_name}!`,
        confirmButtonColor: "#28a745",
        confirmButtonText: "Continue",
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirect to dashboard
          window.location.href = "dashboard.html";
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password.",
        confirmButtonColor: "#dc3545",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    Swal.fire({
      icon: "error",
      title: "Login Error",
      text: "An error occurred during login. Please try again.",
      confirmButtonColor: "#dc3545",
    });
  }
});

// Password comparison function (simulated - in production use bcryptjs)
async function comparePassword(plainPassword, hashedPassword) {
  // For demo purposes, simple comparison
  // In production, import bcryptjs and use: await bcrypt.compare(plainPassword, hashedPassword)
  
  // If you want real bcrypt comparison, uncomment the code below:
  // const bcrypt = require('bcryptjs');
  // return await bcrypt.compare(plainPassword, hashedPassword);
  
  // For now, do a simple string comparison (NOT SECURE - FOR DEMO ONLY)
  return plainPassword === hashedPassword;
}

// Load remembered email if exists
window.addEventListener("load", function () {
  const rememberedEmail = localStorage.getItem("healthflow_email");
  if (rememberedEmail) {
    document.getElementById("facilityEmail").value = rememberedEmail;
    document.getElementById("rememberMe").checked = true;
  }
});
