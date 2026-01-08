// ===== DASHBOARD FUNCTIONALITY WITH SUPABASE =====

// Initialize dashboard on page load
document.addEventListener("DOMContentLoaded", function () {
    checkSession();
    initializeDashboard();
    loadFacilityStats();
    setupLogout();
    setupPatientIdGenerator();
    setupSidebarToggle();

    // Initialize date pickers after delay to ensure all libraries are loaded
    setTimeout(function () {
        initializeDatePickers();
    }, 1000);
});

// Setup sidebar toggle
function setupSidebarToggle() {
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            window.toggleSidebar();
        });
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            window.toggleSidebar();
        });
    }

    // Close sidebar when clicking on sidebar links
    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    sidebarLinks.forEach((link) => {
        if (!link.hasAttribute("data-bs-toggle")) {
            link.addEventListener("click", function (e) {
                // Only close sidebar if it's on mobile
                if (window.innerWidth <= 767) {
                    setTimeout(function () {
                        const sidebar = document.querySelector(".sidebar");
                        const overlay = document.getElementById("sidebarOverlay");
                        if (sidebar) sidebar.classList.remove("active");
                        if (overlay) overlay.classList.remove("active");
                    }, 100);
                }
            });
        }
    });
}

// Toggle sidebar visibility (global function for onclick handlers)
window.toggleSidebar = function () {
    const sidebar = document.querySelector(".sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    if (sidebar) {
        sidebar.classList.toggle("active");
    }
    if (sidebarOverlay) {
        sidebarOverlay.classList.toggle("active");
    }

    return false;
};

// Setup patient ID generator
function setupPatientIdGenerator() {
    // Reset patient ID field when modal opens
    const modal = document.getElementById("patientWizardModal");
    if (modal) {
        modal.addEventListener("show.bs.modal", function () {
            const patientIdInput = document.getElementById("patientIdInput");
            if (patientIdInput) {
                patientIdInput.value = "";
                patientIdInput.disabled = false;
                patientIdInput.placeholder = "Click Generate to create ID";
            }

            // Initialize date pickers in the modal
            setTimeout(function () {
                initializeDatePickers();
            }, 300);
        });
    }

    const generateBtn = document.getElementById("generatePatientIdBtn");
    if (generateBtn) {
        generateBtn.addEventListener("click", function (e) {
            e.preventDefault();
            generateNewPatientId();
        });
    }
}

// Check if user has valid session
function checkSession() {
    const session = sessionStorage.getItem("healthflow_session");

    if (!session) {
        // No valid session, redirect to login
        window.location.href = "login.html";
        return false;
    }

    try {
        const userData = JSON.parse(session);
        displayUserInfo(userData);
        return true;
    } catch (e) {
        console.error("Invalid session data:", e);
        sessionStorage.clear();
        window.location.href = "login.html";
        return false;
    }
}

// Display user information in header
function displayUserInfo(userData) {
    const initials = userData.facilityName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const userAvatar = document.querySelector(".user-avatar");
    if (userAvatar) {
        userAvatar.textContent = initials;
    }

    const userDetailsDiv = document.querySelector(".user-details");
    if (userDetailsDiv) {
        userDetailsDiv.innerHTML = `
      <small>${userData.userRole}</small>
    `;
    }

    // Display facility information in the dashboard card
    const facilityNameDisplay = document.getElementById("facilityNameDisplay");
    if (facilityNameDisplay) {
        facilityNameDisplay.textContent = userData.facilityName || "N/A";
    }

    const facilityIdDisplay = document.getElementById("facilityIdDisplay");
    if (facilityIdDisplay) {
        facilityIdDisplay.textContent = userData.facilityId || "N/A";
    }

    const facilityRegionDisplay = document.getElementById(
        "facilityRegionDisplay"
    );
    if (facilityRegionDisplay) {
        facilityRegionDisplay.textContent = userData.facilityRegion || "N/A";
    }
}

// Initialize dashboard sections
function initializeDashboard() {
    const sidebarLinks = document.querySelectorAll(".sidebar-menu a");

    sidebarLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            // Only handle section clicks, not href links
            if (this.hasAttribute("onclick")) {
                e.preventDefault();

                // Get the section ID from onclick
                const onclickText = this.getAttribute("onclick");
                const match = onclickText.match(/showSection\('([^']+)'/);
                if (match) {
                    const sectionId = match[1];
                    showSection(sectionId);

                    // Update active state
                    sidebarLinks.forEach((l) => l.classList.remove("active"));
                    this.classList.add("active");
                }
            }
        });
    });

    // Show dashboard section by default
    showSection("overview");
    const overviewLink = document.querySelector('[onclick*="overview"]');
    if (overviewLink) {
        overviewLink.classList.add("active");
    }
}

// Show/hide sections (global function for onclick handlers)
window.showSection = function (sectionId, event) {
    if (event) {
        event.preventDefault();
    }

    const sections = document.querySelectorAll(".section");
    sections.forEach((section) => section.classList.remove("active"));

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add("active");
    }

    // Update active sidebar link
    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    sidebarLinks.forEach((link) => link.classList.remove("active"));
    const activeLink = document.querySelector(`[onclick*="'${sectionId}'"]`);
    if (activeLink) {
        activeLink.classList.add("active");
    }

    // Close sidebar on mobile after clicking
    const sidebar = document.querySelector(".sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    if (window.innerWidth <= 767) {
        if (sidebar && sidebar.classList.contains("active")) {
            sidebar.classList.remove("active");
        }
        if (sidebarOverlay && sidebarOverlay.classList.contains("active")) {
            sidebarOverlay.classList.remove("active");
        }
    }

    // Load patients when patients section is shown
    if (sectionId === "patients") {
        loadAllPatients();
    }
};

// Load facility statistics from Supabase
async function loadFacilityStats() {
    try {
        const session = sessionStorage.getItem("healthflow_session");
        if (!session) return;

        const userData = JSON.parse(session);
        const facilityId = userData.facilityId;

        if (!supabaseClient) {
            console.error("Supabase client not initialized");
            return;
        }

        // Load patients count
        const {
            count: totalPatients,
            error: patientsError
        } = await supabaseClient
            .from("patients")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("facility_id", facilityId);

        if (!patientsError && totalPatients !== null) {
            updateStatCard("totalPatients", totalPatients);
        }

        // Load active patients
        const {
            count: activePatients,
            error: activeError
        } = await supabaseClient
            .from("patients")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("facility_id", facilityId)
            .eq("status", "Active");

        if (!activeError && activePatients !== null) {
            updateStatCard("activePatients", activePatients);
        }

        // Load at-risk patients
        const {
            count: atRiskPatients,
            error: atRiskError
        } = await supabaseClient
            .from("patients")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("facility_id", facilityId)
            .eq("status", "At Risk");

        if (!atRiskError && atRiskPatients !== null) {
            updateStatCard("atRiskPatients", atRiskPatients);
        }

        // Load HIV patients
        const {
            count: hivPatients,
            error: hivError
        } = await supabaseClient
            .from("patients")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("facility_id", facilityId)
            .eq("primary_condition", "HIV");

        if (!hivError && hivPatients !== null) {
            updateStatCard("hivPatients", hivPatients);
        }

        // Load recent patients for table
        const {
            data: recentPatients,
            error: recentError
        } = await supabaseClient
            .from("patients")
            .select("*")
            .eq("facility_id", facilityId)
            .order("created_at", {
                ascending: false
            })
            .limit(5);

        if (!recentError && recentPatients) {
            displayRecentPatients(recentPatients);
        }
    } catch (error) {
        console.error("Error loading facility stats:", error);
    }
}

// Update stat card with value
function updateStatCard(cardId, value) {
    // Map of card IDs to stat card elements
    const statCardMap = {
        totalPatients: 0,
        activePatients: 1,
        atRiskPatients: 2,
        hivPatients: 3,
    };

    const cards = document.querySelectorAll("#overview .stat-card");
    if (statCardMap[cardId] !== undefined) {
        const card = cards[statCardMap[cardId]];
        if (card) {
            const valueElement = card.querySelector(".stat-value");
            if (valueElement) {
                valueElement.textContent = value;
            }
        }
    }
}

// Display recent patients in table
function displayRecentPatients(patientsData) {
    const tbody = document.querySelector("#overview .table tbody");
    if (!tbody) return;

    if (patientsData.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">
          <i class="fas fa-inbox"></i> No patients yet
        </td>
      </tr>
    `;
        return;
    }

    tbody.innerHTML = patientsData
        .map((patient) => {
            const statusBadge = `badge-${patient.status
        .toLowerCase()
        .replace(" ", "-")}`;
            return `
      <tr>
        <td>${patient.first_name} ${patient.last_name}</td>
        <td>${patient.age || "N/A"}</td>
        <td>${patient.primary_condition}</td>
        <td>${patient.registered_date}</td>
        <td><span class="badge-custom ${statusBadge}">${
        patient.status
      }</span></td>
        <td><button class="btn btn-sm btn-outline-primary" onclick="viewPatientFromDashboard('${
          patient.id
        }')">View</button></td>
      </tr>
    `;
        })
        .join("");
}

// Load all patients
async function loadAllPatients() {
    try {
        const session = sessionStorage.getItem("healthflow_session");
        if (!session) return;

        const userData = JSON.parse(session);
        const facilityId = userData.facilityId;

        if (!supabaseClient) {
            console.error("Supabase client not initialized");
            return;
        }

        // Load all patients for this facility
        const {
            data: allPatients,
            error
        } = await supabaseClient
            .from("patients")
            .select("*")
            .eq("facility_id", facilityId)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.error("Error loading patients:", error);
            return;
        }

        // Display patients
        displayAllPatients(allPatients || []);

        // Update patient count
        const patientCount = document.getElementById("patientCount");
        if (patientCount) {
            patientCount.textContent = `Total: ${
        allPatients ? allPatients.length : 0
      } patients`;
        }
    } catch (error) {
        console.error("Error loading all patients:", error);
    }
}

// Display all patients in grid
function displayAllPatients(patientsData) {
    const container = document.getElementById("patientsContainer");
    if (!container) return;

    if (patientsData.length === 0) {
        container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-users"></i>
        <h5>No patients yet</h5>
        <p>Click "Add Patient" to register your first patient</p>
      </div>
    `;
        return;
    }

    container.innerHTML = patientsData
        .map((patient) => {
            const statusBadge = `badge-${patient.status
        .toLowerCase()
        .replace(" ", "-")}`;
            const initials =
                `${patient.first_name[0]}${patient.last_name[0]}`.toUpperCase();

            return `
      <div class="patient-card">
        <div class="patient-header">
          <div class="patient-avatar">${initials}</div>
          <div class="patient-info">
            <h5>${patient.first_name} ${patient.last_name}</h5>
            <small>${patient.patient_id}</small>
          </div>
          <span class="badge-custom ${statusBadge}">${patient.status}</span>
        </div>
        <div class="patient-details">
          <div class="detail-row">
            <span class="label">Age:</span>
            <span class="value">${patient.age || "N/A"} years</span>
          </div>
          <div class="detail-row">
            <span class="label">Gender:</span>
            <span class="value">${patient.gender || "N/A"}</span>
          </div>
          <div class="detail-row">
            <span class="label">Condition:</span>
            <span class="value">${patient.primary_condition}</span>
          </div>
          <div class="detail-row">
            <span class="label">Phone:</span>
            <span class="value">${patient.phone_number || "N/A"}</span>
          </div>
          <div class="detail-row">
            <span class="label">Registered:</span>
            <span class="value">${patient.registered_date || "N/A"}</span>
          </div>
        </div>
        <div class="patient-actions">
          <button class="btn btn-sm btn-outline-primary" onclick="viewPatientFromDashboard('${
            patient.id
          }')">
            <i class="fas fa-eye me-1"></i> View
          </button>
          <button class="btn btn-sm btn-outline-secondary" onclick="editPatient('${
            patient.id
          }')">
            <i class="fas fa-edit me-1"></i> Edit
          </button>
        </div>
      </div>
    `;
        })
        .join("");
}

// Calculate age from date of birth
function calculateAge(dateString) {
    if (!dateString) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;
}

// View patient from dashboard
async function viewPatientFromDashboard(patientId) {
    try {
        const {
            data: patient,
            error
        } = await supabaseClient
            .from("patients")
            .select("*")
            .eq("id", patientId)
            .single();

        if (error || !patient) {
            console.error("Error loading patient:", error);
            return;
        }

        Swal.fire({
            title: `${patient.first_name} ${patient.last_name}`,
            html: `
        <div style="text-align: left;">
          <p><strong>Patient ID:</strong> ${patient.patient_id}</p>
          <p><strong>Age:</strong> ${
            patient.age || "N/A"
          } years | <strong>Gender:</strong> ${patient.gender || "N/A"}</p>
          <p><strong>Phone:</strong> ${patient.phone_number || "N/A"}</p>
          <p><strong>Primary Condition:</strong> ${
            patient.primary_condition
          }</p>
          <p><strong>Status:</strong> <span class="badge" style="background: #0052CC; color: white;">${
            patient.status
          }</span></p>
          <p><strong>Registered:</strong> ${patient.registered_date}</p>
        </div>
      `,
            confirmButtonColor: "#0052CC",
            confirmButtonText: "Close",
        });
    } catch (error) {
        console.error("Error viewing patient:", error);
    }
}

// Edit patient
function editPatient(patientId) {
    // Get patient from the patients array loaded in the DOM
    const allPatients = document.querySelectorAll(".patient-card");
    let patient = null;

    // Fetch patient data from Supabase to ensure we have the latest
    supabaseClient
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single()
        .then(({
            data,
            error
        }) => {
            if (error || !data) {
                Swal.fire("Error", "Patient not found", "error");
                return;
            }

            patient = data;

            Swal.fire({
                title: "Edit Patient",
                html: `
          <div class="mb-3 text-start">
            <label class="form-label">First Name</label>
            <input type="text" class="form-control" id="editFirstName" value="${
              patient.first_name
            }">
          </div>
          <div class="mb-3 text-start">
            <label class="form-label">Last Name</label>
            <input type="text" class="form-control" id="editLastName" value="${
              patient.last_name
            }">
          </div>
          <div class="mb-3 text-start">
            <label class="form-label">Status</label>
            <select class="form-select" id="editStatus">
              <option value="Active" ${
                patient.status === "Active" ? "selected" : ""
              }>Active</option>
              <option value="At Risk" ${
                patient.status === "At Risk" ? "selected" : ""
              }>At Risk</option>
              <option value="Inactive" ${
                patient.status === "Inactive" ? "selected" : ""
              }>Inactive</option>
            </select>
          </div>
          <div class="mb-3 text-start">
            <label class="form-label">Notes</label>
            <textarea class="form-control" id="editNotes" rows="3">${
              patient.notes || ""
            }</textarea>
          </div>
        `,
                showCancelButton: true,
                confirmButtonText: "Save Changes",
                confirmButtonColor: "#0052CC",
                preConfirm: () => {
                    const firstName = document.getElementById("editFirstName").value;
                    const lastName = document.getElementById("editLastName").value;
                    const status = document.getElementById("editStatus").value;
                    const notes = document.getElementById("editNotes").value;

                    if (!firstName || !lastName) {
                        Swal.showValidationMessage("Name cannot be empty");
                        return false;
                    }

                    return {
                        firstName,
                        lastName,
                        status,
                        notes
                    };
                },
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const {
                            error
                        } = await supabaseClient
                            .from("patients")
                            .update({
                                first_name: result.value.firstName,
                                last_name: result.value.lastName,
                                status: result.value.status,
                                notes: result.value.notes,
                            })
                            .eq("id", patientId);

                        if (error) throw error;

                        Swal.fire("Success", "Patient updated successfully", "success");
                        loadAllPatients(); // Reload patients to show updated data
                    } catch (error) {
                        console.error("Error updating patient:", error);
                        Swal.fire("Error", "Failed to update patient", "error");
                    }
                }
            });
        });
}

// Generate new patient ID with pattern: timestamp-facility-initials-random (with hyphens)
function generateNewPatientId() {
    try {
        const session = sessionStorage.getItem("healthflow_session");
        if (!session) return;

        const userData = JSON.parse(session);
        const facilityName = userData.facilityName || "FAC";

        // Get first 3 letters of facility name (uppercase)
        const facilityInitials = facilityName.substring(0, 3).toUpperCase();

        // Get date part (YYYYMMDD)
        const now = new Date();
        const dateStr = now.toISOString().substring(0, 10).replace(/-/g, ""); // YYYYMMDD

        // Get time part (HHmmss)
        const timeStr = now.toISOString().substring(11, 19).replace(/:/g, ""); // HHmmss

        // Generate 4 random alphanumeric characters
        const randomChars = Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();

        // Combine with hyphens: YYYYMMDD-HHmmss-FFF-XXXX
        const patientId = `${dateStr}-${timeStr}-${facilityInitials}-${randomChars}`;

        // Set the value in the input field and disable it
        const patientIdInput = document.getElementById("patientIdInput");
        if (patientIdInput) {
            patientIdInput.value = patientId;
            patientIdInput.disabled = true;
        }
    } catch (error) {
        console.error("Error generating patient ID:", error);
        Swal.fire("Error", "Failed to generate patient ID", "error");
    }
}

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }
}

// Global logout function for onclick handlers
window.logout = function () {
    handleLogout();
};

// Handle logout
function handleLogout() {
    Swal.fire({
        title: "Logout Confirmation",
        text: "Are you sure you want to logout?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, Logout",
        cancelButtonText: "Cancel",
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear session data
            sessionStorage.removeItem("healthflow_session");
            localStorage.removeItem("healthflow_email");

            // Show logout message
            Swal.fire({
                icon: "success",
                title: "Logged Out",
                text: "You have been successfully logged out.",
                confirmButtonColor: "#0052CC",
            }).then(() => {
                // Redirect to login
                window.location.href = "login.html";
            });
        }
    });
}

// Add Supabase to dashboard
function initSupabase() {
    if (typeof supabaseClient === "undefined") {
        console.error(
            "Supabase client not loaded. Check that supabase-config.js is included."
        );
    }
}

// Initialize all date pickers - now handled in modal show event
function initializeDatePickers() {
    console.log("Date pickers will be initialized when modals open");
}

// Initialize Supabase on load
window.addEventListener("load", function () {
    initSupabase();
});