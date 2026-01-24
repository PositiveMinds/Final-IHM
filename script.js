// Main script file for HealthFlow landing page

// ============================================
// DASHBOARD ACCESS CONTROL
// ============================================
function checkDashboardAccess(event) {
    event.preventDefault();

    // Check if user session exists
    const sessionData = localStorage.getItem("healthflow_session");

    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            // If session exists and is valid, redirect to dashboard
            if (session.id && session.email) {
                window.location.href = "dashboard.html";
                return;
            }
        } catch (e) {
            console.error("Invalid session data:", e);
        }
    }

    // No valid session, redirect to login
    Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to access the dashboard.",
        confirmButtonColor: "#0052CC",
        confirmButtonText: "Go to Login",
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "login.html";
        }
    });
}

// Dark mode toggle functionality
function toggleDarkMode() {
    const body = document.body;
    const darkModeToggleBtn = document.getElementById("darkModeToggleBtn");

    if (body.classList.contains("dark-mode")) {
        body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "false");
        darkModeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "true");
        darkModeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Check dark mode preference on load
document.addEventListener("DOMContentLoaded", function () {
    const darkModePreference = localStorage.getItem("darkMode");
    const darkModeToggleBtn = document.getElementById("darkModeToggleBtn");

    if (darkModePreference === "true") {
        document.body.classList.add("dark-mode");
        if (darkModeToggleBtn) {
            darkModeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
});

// Testimonials carousel scroll
function scrollTestimonials(direction) {
    const container = document.querySelector(".testimonials-container");
    if (container) {
        const scrollAmount = 350;
        container.scrollBy({
            left: direction * scrollAmount,
            behavior: "smooth",
        });
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href !== "#") {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }
    });
});

// Initialize Select2 if jQuery is available
document.addEventListener("DOMContentLoaded", function () {
    if (typeof jQuery !== "undefined" && typeof $.fn.select2 !== "undefined") {
        // Initialize any select elements with Select2
        $(".select2-capable").select2({
            placeholder: "Select an option",
            allowClear: true,
        });
    }
});

// Intersection Observer for section reveal animations
document.addEventListener("DOMContentLoaded", function () {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal");
                // Optional: stop observing after revealed
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections and cards
    document
        .querySelectorAll(
            ".section-light, .section-dark, .card, .step-card, .step-card-enhanced, .feature-card, .testimonial-card, .blog-card"
        )
        .forEach((el) => {
            observer.observe(el);
        });
});

// Initialize Owl Carousel for Team Slider
document.addEventListener("DOMContentLoaded", function () {
    if (jQuery && jQuery.fn.owlCarousel) {
        jQuery(".team-carousel").owlCarousel({
            loop: true,
            margin: 30,
            nav: true,
            dots: true,
            autoplay: false,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
            stagePadding: 0,
            responsive: {
                0: {
                    items: 1,
                    margin: 15,
                },
                480: {
                    items: 1,
                    margin: 20,
                },
                576: {
                    items: 2,
                    margin: 20,
                },
                768: {
                    items: 2,
                    margin: 25,
                },
                1024: {
                    items: 3,
                    margin: 30,
                },
                1200: {
                    items: 3,
                    margin: 30,
                },
            },
            navText: [
                '<i class="fas fa-chevron-left"></i>',
                '<i class="fas fa-chevron-right"></i>',
            ],
        });

        // Initialize Owl Carousel for Video Slider
        jQuery(".video-carousel").owlCarousel({
            loop: true,
            margin: 30,
            nav: true,
            dots: true,
            autoplay: false,
            autoplayTimeout: 6000,
            autoplayHoverPause: true,
            stagePadding: 0,
            responsive: {
                0: {
                    items: 1,
                    margin: 15,
                },
                480: {
                    items: 1,
                    margin: 20,
                },
                576: {
                    items: 1,
                    margin: 20,
                },
                768: {
                    items: 1,
                    margin: 20,
                },
                1024: {
                    items: 2,
                    margin: 25,
                },
                1200: {
                    items: 2,
                    margin: 30,
                },
            },
            navText: [
                '<i class="fas fa-chevron-left"></i>',
                '<i class="fas fa-chevron-right"></i>',
            ],
        });

        // Initialize Owl Carousel for Testimonials
        jQuery(".testimonials-carousel").owlCarousel({
            loop: true,
            margin: 30,
            nav: true,
            dots: true,
            autoplay: false,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
            stagePadding: 0,
            responsive: {
                0: {
                    items: 1,
                    margin: 15,
                },
                480: {
                    items: 1,
                    margin: 20,
                },
                576: {
                    items: 1,
                    margin: 20,
                },
                768: {
                    items: 2,
                    margin: 20,
                },
                1024: {
                    items: 2,
                    margin: 25,
                },
                1200: {
                    items: 2,
                    margin: 30,
                },
            },
            navText: [
                '<i class="fas fa-chevron-left"></i>',
                '<i class="fas fa-chevron-right"></i>',
            ],
        });
    }

    // Initialize How It Works Carousel
    const $howItWorksCarousel = $(".how-it-works-carousel");
    if ($howItWorksCarousel.length) {
        try {
            $howItWorksCarousel.owlCarousel({
                items: 1,
                loop: false,
                margin: 20,
                autoplay: false,
                nav: true,
                dots: true,
                stagePadding: 0,
                navText: [
                    '<i class="fas fa-chevron-left"></i>',
                    '<i class="fas fa-chevron-right"></i>',
                ],
                responsive: {
                    0: {
                        items: 1,
                        margin: 10,
                    },
                    480: {
                        items: 1,
                        margin: 15,
                    },
                    576: {
                        items: 1,
                        margin: 15,
                    },
                    768: {
                        items: 2,
                        margin: 20,
                    },
                    1024: {
                        items: 2,
                        margin: 25,
                    },
                    1200: {
                        items: 3,
                        margin: 30,
                    },
                },
            });
        } catch (e) {
            console.error("Carousel initialization error:", e);
        }
    }
});

// ============================================
// TESTIMONIALS CAROUSEL (OWL CAROUSEL)
// ============================================
document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector(".owl-testimonials")) {
        try {
            $(".owl-testimonials").owlCarousel({
                loop: true,
                margin: 20,
                nav: true,
                dots: true,
                autoplay: true,
                autoplayTimeout: 5000,
                autoplayHoverPause: true,
                stagePadding: 0,
                responsive: {
                    0: {
                        items: 1,
                        margin: 10,
                    },
                    480: {
                        items: 1,
                        margin: 15,
                    },
                    576: {
                        items: 1,
                        margin: 15,
                    },
                    768: {
                        items: 2,
                        margin: 20,
                    },
                    1024: {
                        items: 2,
                        margin: 20,
                    },
                    1200: {
                        items: 2,
                        margin: 25,
                    },
                },
            });
        } catch (e) {
            console.error("Testimonials carousel initialization error:", e);
        }
    }
});

// ============================================
// PRICING TOGGLE FUNCTIONALITY
// ============================================
document.addEventListener("DOMContentLoaded", function () {
    const toggleBtns = document.querySelectorAll(".toggle-btn");
    const pricingCards = document.querySelectorAll(".pricing-card");

    toggleBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const period = this.getAttribute("data-period");

            // Update active button
            toggleBtns.forEach((b) => b.classList.remove("active"));
            this.classList.add("active");

            // Update pricing cards
            pricingCards.forEach((card) => {
                const monthlyPrice = card.getAttribute("data-monthly-price");
                const annualPrice = card.getAttribute("data-annual-price");
                const amountElement = card.querySelector(".amount");
                const periodElement = card.querySelector(".period");

                if (period === "annual" && annualPrice) {
                    amountElement.textContent = annualPrice;
                    periodElement.textContent = "/year";
                    card.setAttribute("data-current-period", "annual");
                } else {
                    amountElement.textContent = monthlyPrice;
                    periodElement.textContent = "/month";
                    card.setAttribute("data-current-period", "monthly");
                }
            });
        });
    });
});

// ============================================
// MOBILE FAB MENU & SIDEBAR NAVIGATION
// ============================================
document.addEventListener("DOMContentLoaded", function () {
    const fabButton = document.getElementById("fabButton");
    const fabMenuItems = document.getElementById("fabMenuItems");
    const fabChatBtn = document.getElementById("fabChatBtn");
    const fabImportBtn = document.getElementById("fabImportBtn");
    const fabNavBtn = document.getElementById("fabNavBtn");
    const sidebarNav = document.getElementById("mobileSidebarNav");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
    const sidebarMenuItems = document.querySelectorAll(".sidebar-menu-item");

    let menuOpen = false;

    // Toggle FAB menu
    fabButton.addEventListener("click", function (e) {
        e.stopPropagation();
        menuOpen = !menuOpen;

        if (menuOpen) {
            fabMenuItems.classList.add("active");
            fabButton.classList.add("active");
        } else {
            fabMenuItems.classList.remove("active");
            fabButton.classList.remove("active");
        }
    });

    // Chat button - Open chat system
    fabChatBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (typeof chatSystem !== "undefined" && chatSystem.openChat) {
            chatSystem.openChat();
            closeFabMenu();
        } else {
            alert("Chat system is not loaded yet. Please try again.");
        }
    });

    // Import button - Open import modal
    fabImportBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openImportModal();
        closeFabMenu();
    });

    // Navigation button - Open sidebar
    fabNavBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        sidebarNav.classList.add("show");
        sidebarOverlay.classList.add("show");
        closeFabMenu();
    });

    // Close FAB menu
    function closeFabMenu() {
        menuOpen = false;
        fabMenuItems.classList.remove("active");
        fabButton.classList.remove("active");
    }

    // Close sidebar
    function closeSidebar() {
        sidebarNav.classList.remove("show");
        sidebarOverlay.classList.remove("show");
    }

    // Close when clicking close button
    sidebarCloseBtn.addEventListener("click", closeSidebar);

    // Close when clicking overlay
    sidebarOverlay.addEventListener("click", closeSidebar);

    // Close when clicking a menu item
    sidebarMenuItems.forEach((item) => {
        item.addEventListener("click", closeSidebar);
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
        const fabMenu = document.querySelector(".mobile-fab-menu");
        if (!sidebarNav.contains(e.target) && !fabMenu.contains(e.target)) {
            closeSidebar();
            closeFabMenu();
        }
    });
});

// ============================================
// IMPORT DATA MODAL
// ============================================
function openImportModal() {
    // Create or show import modal
    let importModal = document.getElementById("importDataModal");

    if (!importModal) {
        // Create the modal if it doesn't exist
        const modalHTML = `
      <div class="modal fade" id="importDataModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="fas fa-file-import me-2"></i>Import Data
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-info" role="alert">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Import CSV Data:</strong> Upload patient or appointment data from CSV files.
              </div>
              
              <!-- Import Tabs -->
              <ul class="nav nav-tabs mb-4" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="patients-tab" data-bs-toggle="tab" data-bs-target="#patients-content" type="button" role="tab">
                    <i class="fas fa-users me-2"></i>Patients
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="appointments-tab" data-bs-toggle="tab" data-bs-target="#appointments-content" type="button" role="tab">
                    <i class="fas fa-calendar me-2"></i>Appointments
                  </button>
                </li>
              </ul>

              <!-- Tab Content -->
              <div class="tab-content">
                <!-- Patients Tab -->
                <div class="tab-pane fade show active" id="patients-content" role="tabpanel">
                  <div class="mb-3">
                    <label class="form-label">Select Patient CSV File</label>
                    <input type="file" class="form-control" id="patientsFileInput" accept=".csv" />
                    <small class="text-muted">
                      <a href="sample_patients_import.csv" download>Download sample file</a>
                    </small>
                  </div>
                  <button class="btn btn-primary w-100" id="importPatientsBtn">
                    <i class="fas fa-upload me-2"></i>Import Patients
                  </button>
                </div>

                <!-- Appointments Tab -->
                <div class="tab-pane fade" id="appointments-content" role="tabpanel">
                  <div class="mb-3">
                    <label class="form-label">Select Appointment CSV File</label>
                    <input type="file" class="form-control" id="appointmentsFileInput" accept=".csv" />
                    <small class="text-muted">
                      <a href="sample_appointments_import.csv" download>Download sample file</a>
                    </small>
                  </div>
                  <button class="btn btn-primary w-100" id="importAppointmentsBtn">
                    <i class="fas fa-upload me-2"></i>Import Appointments
                  </button>
                </div>
              </div>

              <!-- Import Progress -->
              <div id="importProgress" style="display: none;" class="mt-4">
                <div class="progress" style="height: 25px;">
                  <div class="progress-bar" id="progressBar" role="progressbar" style="width: 0%">0%</div>
                </div>
                <p id="progressText" class="text-center mt-2 text-muted">Processing...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
        document.body.insertAdjacentHTML("beforeend", modalHTML);
        importModal = document.getElementById("importDataModal");

        // Add event listeners
        document.getElementById("importPatientsBtn").addEventListener("click", function () {
            handleFileImport("patients");
        });
        document.getElementById("importAppointmentsBtn").addEventListener("click", function () {
            handleFileImport("appointments");
        });
    }

    // Show the modal
    const bsModal = new bootstrap.Modal(importModal);
    bsModal.show();
}

// Handle file import
function handleFileImport(type) {
    const fileInput = type === "patients" ?
        document.getElementById("patientsFileInput") :
        document.getElementById("appointmentsFileInput");

    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file to import.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const csv = e.target.result;
            const data = parseCSV(csv);

            // Show progress
            const progressDiv = document.getElementById("importProgress");
            progressDiv.style.display = "block";

            // Simulate processing
            let progress = 0;
            const interval = setInterval(function () {
                progress += Math.random() * 30;
                if (progress >= 90) progress = 90;
                document.getElementById("progressBar").style.width = progress + "%";
                document.getElementById("progressBar").textContent = Math.round(progress) + "%";
            }, 300);

            // Process the data
            setTimeout(function () {
                clearInterval(interval);
                document.getElementById("progressBar").style.width = "100%";
                document.getElementById("progressBar").textContent = "100%";
                document.getElementById("progressText").textContent = `Successfully imported ${data.length} ${type} records`;

                // Redirect to dashboard after 2 seconds
                setTimeout(function () {
                    window.location.href = "dashboard.html";
                }, 2000);
            }, 2000);
        } catch (error) {
            alert("Error importing file: " + error.message);
        }
    };
    reader.readAsText(file);
}

// Simple CSV parser
function parseCSV(csv) {
    const lines = csv.split("\n").filter(line => line.trim());
    const headers = lines[0].split(",");
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim() : "";
        });
        data.push(row);
    }

    return data;
}

// ============================================
// FAB BUTTON INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    const fabButton = document.getElementById('fabButton');
    const fabContainer = document.getElementById('fabContainer');
    const fabChatbotBtn = document.getElementById('fabChatbotBtn');
    const fabChatBtn = document.getElementById('fabChatBtn');
    const fabImportBtn = document.getElementById('fabImportBtn');

    if (fabButton && fabContainer) {
        // Toggle FAB menu on main button click
        fabButton.addEventListener('click', function (e) {
            e.stopPropagation();
            fabContainer.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!fabContainer.contains(e.target)) {
                fabContainer.classList.remove('active');
            }
        });

        // Chatbot button
        if (fabChatbotBtn) {
            fabChatbotBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                fabContainer.classList.remove('active');
                // Trigger chatbot
                if (typeof chatbotUI !== 'undefined' && chatbotUI.toggleChat) {
                    chatbotUI.toggleChat();
                }
            });
        }

        // Chat button
        if (fabChatBtn) {
            fabChatBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                fabContainer.classList.remove('active');
                // Trigger chat system
                if (typeof chatSystem !== 'undefined' && chatSystem.openChat) {
                    chatSystem.openChat();
                }
            });
        }

        // Import button
        if (fabImportBtn) {
            fabImportBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                fabContainer.classList.remove('active');
                // Trigger import modal
                const importModal = document.getElementById('importModal');
                if (importModal) {
                    const modal = new bootstrap.Modal(importModal);
                    modal.show();
                }
            });
        }
    }
});