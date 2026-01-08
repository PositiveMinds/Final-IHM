// ===== DASHBOARD FUNCTIONALITY =====

// Check if user is logged in on page load
window.addEventListener("load", function () {
  const session = sessionStorage.getItem("healthflow_session");

  if (!session) {
    // Not logged in, redirect to login
    window.location.href = "login.html";
    return;
  }

  // Parse session data
  const sessionData = JSON.parse(session);

  // Display facility name and user initials
  document.getElementById("facilityName").textContent = sessionData.facilityName;

  // Get initials from facility name
  const initials = sessionData.facilityName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  document.getElementById("userInitials").textContent = initials;
});

// ===== SECTION NAVIGATION =====
function showSection(sectionId, event) {
  if (event) {
    event.preventDefault();
  }

  // Hide all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  // Remove active class from all sidebar links
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Show selected section
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add("active");
  }

  // Add active class to clicked link
  event.target.closest("a").classList.add("active");
}

// ===== LOGOUT FUNCTIONALITY =====
function logout() {
  Swal.fire({
    title: "Logout",
    text: "Are you sure you want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, logout",
  }).then((result) => {
    if (result.isConfirmed) {
      // Clear session
      sessionStorage.removeItem("healthflow_session");

      // Show logout message
      Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been successfully logged out.",
        confirmButtonColor: "#0052CC",
      }).then(() => {
        // Redirect to home or login
        window.location.href = "index.html";
      });
    }
  });
}

// ===== QUICK ACTION BUTTONS =====
document.addEventListener("DOMContentLoaded", function () {
  // Add Patient button
  const addPatientBtn = document.querySelector("button:has(i.fa-plus)");
  if (addPatientBtn) {
    addPatientBtn.addEventListener("click", function () {
      Swal.fire({
        title: "Add New Patient",
        html: `
          <form id="addPatientForm" style="text-align: left;">
            <div class="mb-3">
              <label for="patientName" class="form-label">Patient Name</label>
              <input type="text" class="form-control" id="patientName" placeholder="Full name" required>
            </div>
            <div class="mb-3">
              <label for="patientAge" class="form-label">Age</label>
              <input type="number" class="form-control" id="patientAge" placeholder="Age" required>
            </div>
            <div class="mb-3">
              <label for="patientCondition" class="form-label">Primary Condition</label>
              <select class="form-control" id="patientCondition" required>
                <option value="">Select condition</option>
                <option value="HIV">HIV/AIDS</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Hypertension">Hypertension</option>
                <option value="Maternal">Maternal Health</option>
              </select>
            </div>
          </form>
        `,
        showCancelButton: true,
        confirmButtonColor: "#0052CC",
        confirmButtonText: "Add Patient",
      }).then((result) => {
        if (result.isConfirmed) {
          const name = document.getElementById("patientName").value;
          if (name) {
            Swal.fire({
              icon: "success",
              title: "Patient Added",
              text: `${name} has been added to the system.`,
              confirmButtonColor: "#28a745",
            });
          }
        }
      });
    });
  }

  // Schedule Visit button
  const scheduleBtn = document.querySelector("button:has(i.fa-calendar-plus)");
  if (scheduleBtn) {
    scheduleBtn.addEventListener("click", function () {
      Swal.fire({
        title: "Schedule Visit",
        html: `
          <form style="text-align: left;">
            <div class="mb-3">
              <label for="visitPatient" class="form-label">Select Patient</label>
              <select class="form-control" id="visitPatient" required>
                <option value="">-- Select Patient --</option>
                <option value="John Mwangi">John Mwangi</option>
                <option value="Sarah Kipchoge">Sarah Kipchoge</option>
                <option value="James Ochieng">James Ochieng</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="visitDate" class="form-label">Date</label>
              <input type="date" class="form-control" id="visitDate" required>
            </div>
            <div class="mb-3">
              <label for="visitTime" class="form-label">Time</label>
              <input type="time" class="form-control" id="visitTime" required>
            </div>
          </form>
        `,
        showCancelButton: true,
        confirmButtonColor: "#0052CC",
        confirmButtonText: "Schedule",
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: "success",
            title: "Visit Scheduled",
            text: "The visit has been scheduled successfully.",
            confirmButtonColor: "#28a745",
          });
        }
      });
    });
  }

  // Download Report button
  const downloadBtn = document.querySelector("button:has(i.fa-download):nth-of-type(1)");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      Swal.fire({
        icon: "success",
        title: "Report Downloaded",
        text: "Your monthly performance report has been downloaded.",
        confirmButtonColor: "#28a745",
      });
    });
  }

  // Notifications button
  const notifBtn = document.querySelector("button:has(i.fa-bell)");
  if (notifBtn) {
    notifBtn.addEventListener("click", function () {
      Swal.fire({
        title: "Notifications",
        html: `
          <div style="text-align: left;">
            <div class="p-2 mb-2" style="background: #f0f4ff; border-radius: 5px;">
              <strong>5 pending appointments</strong> scheduled for tomorrow
            </div>
            <div class="p-2 mb-2" style="background: #fff3cd; border-radius: 5px;">
              <strong>2 patients</strong> with high viral loads need follow-up
            </div>
            <div class="p-2" style="background: #f8d7da; border-radius: 5px;">
              <strong>1 patient</strong> lost to follow-up in the last month
            </div>
          </div>
        `,
        confirmButtonColor: "#0052CC",
        confirmButtonText: "Got it",
      });
    });
  }
});

// ===== PAGE LOAD ANIMATIONS =====
document.addEventListener("DOMContentLoaded", function () {
  // Add fade-in animation to stat cards
  const statCards = document.querySelectorAll(".stat-card");
  statCards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    setTimeout(() => {
      card.style.transition = "all 0.5s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 100);
  });
});

// ===== SIDEBAR ACTIVE STATE =====
document.addEventListener("DOMContentLoaded", function () {
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  sidebarLinks.forEach((link) => {
    if (!link.classList.contains("active")) {
      link.classList.remove("active");
    }
  });
});

// ===== AUTO REFRESH FEATURE =====
// Optional: Refresh data every 30 seconds
setInterval(function () {
  // In production, this would fetch updated data from Supabase
  console.log("Auto-refreshing dashboard data...");
}, 30000);

// ===== EXPORT SESSION INFO (for debugging) =====
function getSessionInfo() {
  const session = sessionStorage.getItem("healthflow_session");
  if (session) {
    console.log("Session Data:", JSON.parse(session));
  }
}
