// ===== LOGIN FUNCTIONALITY =====

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

  // Simulate login (in production, this would call your backend/Supabase)
  setTimeout(() => {
    // Demo credentials check
    if (email === "demo@facility.com" && password === "Demo123!") {
      // Store session
      const sessionData = {
        email: email,
        facilityName: "Demo Facility",
        facilityId: "facility-001",
        userRole: "Administrator",
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
        text: "You have been successfully logged in.",
        confirmButtonColor: "#28a745",
        confirmButtonText: "Continue",
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirect to dashboard
          window.location.href = "dashboard.html";
        }
      });
    } else {
      // Invalid credentials
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        html: `Invalid email or password.<br><br><small>Demo: demo@facility.com / Demo123!</small>`,
        confirmButtonColor: "#dc3545",
      });
    }
  }, 1500);
});

// Load remembered email if exists
window.addEventListener("load", function () {
  const rememberedEmail = localStorage.getItem("healthflow_email");
  if (rememberedEmail) {
    document.getElementById("facilityEmail").value = rememberedEmail;
    document.getElementById("rememberMe").checked = true;
  }
});
