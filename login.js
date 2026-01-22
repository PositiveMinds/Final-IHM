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
      console.error("User search error:", searchError);
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

      // Fetch the actual facility info from the facilities table
       let facilityId = null;
       let facilityRegion = null;
       let facilityName = users.facility_name || "Facility";
       try {
         const { data: facility, error: facilityError } = await supabaseClient
           .from('facilities')
           .select('fid, facility_id, region, facility_name')
           .eq('fid', users.fid)
           .single();
        
        console.log("Facility lookup result:", { facility, facilityError });
        
        if (facility && !facilityError) {
          facilityId = facility.fid;
          facilityRegion = facility.region;
          facilityName = facility.facility_name || facilityName;
        } else if (facilityError) {
          console.warn('Facility not found:', facilityError);
          facilityId = users.fid;
        }
        } catch (e) {
        console.warn('Could not fetch facility:', e);
        facilityId = users.fid;
        }

        // Store session data
         const sessionData = {
           id: users.uid,
           email: users.email,
           fullname: users.fullname || facilityName,
           username: users.username,
           facilityName: facilityName,
           facility_id: facilityId || users.fid,
           fid: users.fid,
           facilityIdCode: users.facility_id,
           facilityRegion: facilityRegion,
           userRole: users.user_role,
           isActive: users.is_active,
           loginTime: new Date().toISOString(),
         };

        localStorage.setItem("userSession", JSON.stringify(sessionData));

      if (rememberMe) {
        localStorage.setItem("healthflow_email", email);
      }

      // Success message
      const displayName = users.fullname || users.facility_name || 'User';
      Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: `Welcome back, ${displayName}!`,
        confirmButtonColor: "#28a745",
        confirmButtonText: "Continue",
      }).then((result) => {
        if (result.isConfirmed) {
          // Add delay to ensure localStorage is written, then redirect
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1000);
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

// Password comparison function using bcryptjs
async function comparePassword(plainPassword, hashedPassword) {
  try {
    // Check if password looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    const isBcryptHash = /^\$2[aby]\$/.test(hashedPassword);
    
    // Check if bcryptjs is available globally and password is a bcrypt hash
    if (isBcryptHash && window.dcodeIO && window.dcodeIO.bcrypt) {
      const match = window.dcodeIO.bcrypt.compareSync(plainPassword, hashedPassword);
      console.log("Password comparison result (bcrypt):", match);
      return match;
    } else {
      console.warn("Using plaintext password comparison (demo mode)");
      // Demo mode: simple plaintext comparison
      const match = plainPassword === hashedPassword;
      console.log("Password comparison result (plaintext):", match);
      return match;
    }
  } catch (e) {
    console.error("Password comparison error:", e);
    // Fallback to simple comparison if bcryptjs fails
    return plainPassword === hashedPassword;
  }
}

// Load remembered email if exists
window.addEventListener("load", function () {
  const rememberedEmail = localStorage.getItem("healthflow_email");
  if (rememberedEmail) {
    document.getElementById("facilityEmail").value = rememberedEmail;
    document.getElementById("rememberMe").checked = true;
  }
});
