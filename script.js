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
// MOBILE SIDEBAR NAVIGATION
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const fabButton = document.getElementById("fabButton");
  const sidebarNav = document.getElementById("mobileSidebarNav");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
  const sidebarMenuItems = document.querySelectorAll(".sidebar-menu-item");

  // Open sidebar
  fabButton.addEventListener("click", function (e) {
    e.stopPropagation();
    sidebarNav.classList.add("show");
    sidebarOverlay.classList.add("show");
  });

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

  // Close when clicking outside
  document.addEventListener("click", function (e) {
    const fabMenu = document.querySelector(".mobile-fab-menu");
    if (!sidebarNav.contains(e.target) && !fabMenu.contains(e.target)) {
      closeSidebar();
    }
  });
});