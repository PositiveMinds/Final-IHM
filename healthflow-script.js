// ========================================
// HEALTHFLOW - Main JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    handleMultiStepForm();
    handleSmoothScroll();
    handleNavbarCollapse();
    handleStickyNavbar();
    initializeSelect2();
    handleFacilityTypeChange();
    initializeTeamCarousel();
    initializeTestimonialsCarousel();
    initializeVideoCarousel();
}

// ========================================
// Smooth Scrolling
// ========================================

function handleSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// Navbar Collapse on Link Click (Mobile)
// ========================================

function handleNavbarCollapse() {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.navbar-collapse .nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Only collapse on mobile
            if (window.innerWidth < 992) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                    toggle: true
                });
            }
        });
    });
}

// ========================================
// Sticky Navbar Scroll Effect
// ========================================

function handleStickyNavbar() {
    const navbar = document.querySelector('.hf-navbar');
    if (!navbar) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
}

// ========================================
// Multi-Step Demo Form Handler
// ========================================

function handleMultiStepForm() {
    const demoForm = document.getElementById('multiStepDemoForm');
    if (!demoForm) return;

    demoForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Collect form data from all steps
        const formSteps = document.querySelectorAll('.form-step');
        const formData = {};

        // Step 1 data
        const step1 = document.getElementById('step-1');
        const inputs1 = step1.querySelectorAll('input');
        formData.fullName = inputs1[0]?.value || '';
        formData.email = inputs1[1]?.value || '';
        formData.phone = inputs1[2]?.value || '';

        // Step 2 data
        const step2 = document.getElementById('step-2');
        const inputs2 = step2.querySelectorAll('input, select');
        formData.facilityName = inputs2[0]?.value || '';
        formData.facilityType = inputs2[1]?.value || '';
        formData.patientLoad = inputs2[2]?.value || '';

        // Step 3 data
        const step3 = document.getElementById('step-3');
        const inputs3 = step3.querySelectorAll('input, select');
        formData.demoDate = inputs3[0]?.value || '';
        formData.preferredTime = inputs3[1]?.value || '';
        
        // Collect selected interests
        const interests = [];
        step3.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            interests.push(checkbox.value);
        });
        formData.interests = interests;

        // Validate
        if (!formData.fullName || !formData.email || !formData.phone) {
            showAlert('error', 'Please fill in all required fields');
            return;
        }

        if (!validateEmail(formData.email)) {
            showAlert('error', 'Please enter a valid email address');
            return;
        }

        if (!validatePhone(formData.phone)) {
            showAlert('error', 'Please enter a valid phone number');
            return;
        }

        // Show loading
        const submitBtn = demoForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Scheduling...';

        try {
            // Send form data
            await sendDemoRequest(formData);

            // Reset form
            resetMultiStepForm();

            // Show success
            showAlert('success', 'Demo scheduled successfully! Check your email for confirmation details.');

        } catch (error) {
            showAlert('error', 'Something went wrong. Please try again.');
            console.error('Form error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Multi-step form navigation
window.nextStep = function(stepNum) {
    const currentStep = document.querySelector('.form-step.active');
    const nextStepEl = document.getElementById('step-' + stepNum);
    
    if (!currentStep || !nextStepEl) return;

    // Validate current step
    const inputs = currentStep.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.type === 'email' && !validateEmail(input.value)) {
            isValid = false;
            input.classList.add('is-invalid');
        } else if (!input.value) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    if (!isValid) {
        showAlert('error', 'Please fill in all required fields correctly');
        return;
    }

    // Hide current step
    currentStep.classList.remove('active');

    // Show next step
    nextStepEl.classList.add('active');

    // Update step indicators
    updateStepIndicators(stepNum);

    // Scroll to form
    setTimeout(() => {
        document.querySelector('.multi-step-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
};

window.prevStep = function(stepNum) {
    const currentStep = document.querySelector('.form-step.active');
    const prevStepEl = document.getElementById('step-' + stepNum);
    
    if (!currentStep || !prevStepEl) return;

    currentStep.classList.remove('active');
    prevStepEl.classList.add('active');
    updateStepIndicators(stepNum);

    setTimeout(() => {
        document.querySelector('.multi-step-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
};

function updateStepIndicators(activeStep) {
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        const stepNum = index + 1;
        indicator.classList.remove('active', 'completed');
        
        if (stepNum === activeStep) {
            indicator.classList.add('active');
        } else if (stepNum < activeStep) {
            indicator.classList.add('completed');
        }
    });

    // Update step lines
    document.querySelectorAll('.step-line').forEach((line, index) => {
        if (index + 1 < activeStep) {
            line.style.backgroundColor = 'var(--accent-color)';
        } else {
            line.style.backgroundColor = '#e9ecef';
        }
    });
}

function resetMultiStepForm() {
    document.getElementById('multiStepDemoForm').reset();
    
    // Reset to step 1
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('step-1').classList.add('active');
    
    updateStepIndicators(1);
}

// ========================================
// Contact Form Handler (Kept for backward compatibility)
// ========================================

function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form values
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const facilityType = document.getElementById('facilityType').value;
        const message = document.getElementById('message').value.trim();
        const whatsappConsent = document.getElementById('whatsappConsent').checked;

        // Validation
        if (!fullName || !email || !phone || !facilityType) {
            showAlert('error', 'Please fill in all required fields');
            return;
        }

        if (!validateEmail(email)) {
            showAlert('error', 'Please enter a valid email address');
            return;
        }

        if (!validatePhone(phone)) {
            showAlert('error', 'Please enter a valid phone number');
            return;
        }

        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

        try {
            // Simulate API call (replace with actual API endpoint)
            const response = await sendContactData({
                fullName,
                email,
                phone,
                facilityType,
                message,
                whatsappConsent
            });

            // Reset form
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;

            // Show success message
            showAlert('success', 'Thank you! We\'ll contact you shortly with demo details.');

            // Optional: Redirect after success
            setTimeout(() => {
                // You can add redirect logic here if needed
            }, 2000);

        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            showAlert('error', 'Something went wrong. Please try again.');
            console.error('Form submission error:', error);
        }
    });
}

// ========================================
// Form Validation Helpers
// ========================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    // Basic phone validation (accepts digits, +, -, spaces)
    const re = /^[\d\s\+\-\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// ========================================
// Alert/Notification System
// ========================================

function showAlert(type, message) {
    // Using SweetAlert2 if available
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: type,
            title: type === 'success' ? 'Success!' : 'Error',
            text: message,
            confirmButtonColor: '#1b3bee',
            confirmButtonText: 'OK',
            didOpen: (modal) => {
                modal.style.borderRadius = '12px';
            }
        });
    } else {
        // Fallback to browser alert
        alert(message);
    }
}

// ========================================
// API Integration
// ========================================

async function sendDemoRequest(formData) {
    // Replace with your actual API endpoint
    const apiEndpoint = '/api/demo-request'; // or your actual endpoint

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        // For now, simulate success even without backend
        // Remove this in production when API is ready
        console.log('Demo request (simulated):', formData);
        return { success: true, message: 'Demo request received' };
    }
}

async function sendContactData(formData) {
    // Replace with your actual API endpoint
    const apiEndpoint = '/api/contact'; // or your actual endpoint

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        // For now, simulate success even without backend
        // Remove this in production when API is ready
        console.log('Form data (simulated):', formData);
        return { success: true, message: 'Demo request received' };
    }
}

// ========================================
// Video Carousel Initialization
// ========================================

function initializeVideoCarousel() {
    const videoCarousel = document.querySelector('.video-carousel');
    if (!videoCarousel || typeof $ === 'undefined' || !$.fn.owlCarousel) {
        console.log('Owl Carousel not available or video carousel not found');
        return;
    }

    $(videoCarousel).owlCarousel({
        loop: true,
        margin: 20,
        nav: false,
        dots: true,
        autoplay: false,
        responsive: {
            0: {
                items: 1,
                margin: 10
            },
            576: {
                items: 1.3,
                margin: 15
            },
            768: {
                items: 2,
                margin: 20,
                nav: true
            },
            1024: {
                items: 2.5,
                margin: 20,
                nav: true
            },
            1200: {
                items: 3,
                margin: 30,
                nav: true
            }
        },
        navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
        smartSpeed: 800
    });
}

// ========================================
// Video Player Modal
// ========================================

window.playHealthFlowVideo = function(videoId, videoTitle) {
    const modalHtml = `
        <div class="modal fade" id="videoModal" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header border-0 bg-dark">
                        <h5 class="modal-title text-white">${videoTitle}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body bg-dark p-0">
                        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                            <iframe 
                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                                src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('videoModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('videoModal'));
    modal.show();

    // Remove modal from DOM when hidden
    document.getElementById('videoModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
};

// ========================================
// Testimonials Carousel Initialization
// ========================================

function initializeTestimonialsCarousel() {
    const testimonialsCarousel = document.querySelector('.testimonials-carousel');
    if (!testimonialsCarousel || typeof $ === 'undefined' || !$.fn.owlCarousel) {
        console.log('Owl Carousel not available or testimonials carousel not found');
        return;
    }

    $(testimonialsCarousel).owlCarousel({
        loop: true,
        margin: 20,
        nav: false,
        dots: true,
        autoplay: true,
        autoplayTimeout: 6000,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1,
                margin: 10
            },
            576: {
                items: 1.2,
                margin: 15
            },
            768: {
                items: 2,
                margin: 20,
                nav: true
            },
            1024: {
                items: 2.5,
                margin: 20,
                nav: true
            },
            1200: {
                items: 2,
                margin: 30,
                nav: true
            }
        },
        navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
        smartSpeed: 800
    });
}

// ========================================
// Team Carousel Initialization
// ========================================

function initializeTeamCarousel() {
    const teamCarousel = document.querySelector('.team-carousel');
    if (!teamCarousel || typeof $ === 'undefined' || !$.fn.owlCarousel) {
        console.log('Owl Carousel not available or team carousel not found');
        return;
    }

    $(teamCarousel).owlCarousel({
        loop: true,
        margin: 20,
        nav: false,
        dots: true,
        autoplay: false,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1,
                margin: 10
            },
            576: {
                items: 1.5,
                margin: 15
            },
            768: {
                items: 2,
                margin: 20,
                nav: true
            },
            1024: {
                items: 3,
                margin: 20,
                nav: true
            },
            1200: {
                items: 3,
                margin: 30,
                nav: true
            }
        },
        navText: ['<span></span>', '<span></span>'],
        smartSpeed: 800
    });
}

// ========================================
// Select2 Initialization
// ========================================

function initializeSelect2() {
    const facilityTypeSelect = document.getElementById('facilityType');
    if (facilityTypeSelect && typeof $ !== 'undefined' && $.fn.select2) {
        $(facilityTypeSelect).select2({
            placeholder: 'Select facility type...',
            allowClear: true,
            width: '100%',
            containerCssClass: 'form-select-lg',
            dropdownCssClass: 'facility-dropdown'
        });
    }
}

// ========================================
// Facility Type Change Handler
// ========================================

function handleFacilityTypeChange() {
    const facilityTypeSelect = document.getElementById('facilityType');
    if (!facilityTypeSelect) return;

    facilityTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        console.log('Facility type selected:', selectedType);
        // Add any logic based on facility type selection
    });
}

// ========================================
// Scroll Animations (Intersection Observer)
// ========================================

function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.hf-step-card, .hf-benefit-card, .hf-pricing-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Initialize scroll animations after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeScrollAnimations();
});

// ========================================
// Utility Functions
// ========================================

// Format phone number (optional enhancement)
function formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return phoneNumber;
}

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showAlert('success', 'Copied to clipboard!');
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showAlert('success', 'Copied to clipboard!');
    }
}

// ========================================
// Mobile Menu Handler
// ========================================

function handleMobileMenu() {
    const hamburger = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = document.querySelector('.navbar').contains(event.target);
        if (!isClickInside && navbarCollapse.classList.contains('show')) {
            hamburger.click();
        }
    });
}

document.addEventListener('DOMContentLoaded', handleMobileMenu);

// ========================================
// Performance Optimization
// ========================================

// Debounce function for window resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle responsive behavior
const handleResize = debounce(function() {
    // Add any responsive logic here
}, 250);

window.addEventListener('resize', handleResize);

// ========================================
// Dark Mode Support (Optional)
// ========================================

function initializeDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        enableDarkMode();
    }
}

function enableDarkMode() {
    document.documentElement.setAttribute('data-dark-mode', 'enabled');
    localStorage.setItem('darkMode', 'enabled');
}

function disableDarkMode() {
    document.documentElement.removeAttribute('data-dark-mode');
    localStorage.setItem('darkMode', 'disabled');
}

// ========================================
// Form Autofill Enhancement
// ========================================

function enhanceFormWithAutofill() {
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    // Restore previously entered data from localStorage
    const savedData = localStorage.getItem('healthflowFormData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            if (data.fullName) fullNameInput.value = data.fullName;
            if (data.email) emailInput.value = data.email;
            if (data.phone) phoneInput.value = data.phone;
        } catch (e) {
            console.log('Could not restore form data');
        }
    }

    // Save data to localStorage on change
    [fullNameInput, emailInput, phoneInput].forEach(input => {
        input?.addEventListener('change', function() {
            const formData = {
                fullName: fullNameInput?.value || '',
                email: emailInput?.value || '',
                phone: phoneInput?.value || ''
            };
            localStorage.setItem('healthflowFormData', JSON.stringify(formData));
        });
    });
}

document.addEventListener('DOMContentLoaded', enhanceFormWithAutofill);

// ============================================
// ACTIVE NAVBAR LINK HIGHLIGHTING
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-60px 0px -60% 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to matching link
                const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Set home as active by default
    const homeLink = document.querySelector('.nav-link[href="#home"]');
    if (homeLink) {
        homeLink.classList.add('active');
    }
});

// ============================================
// AIRDATE PICKER INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('demoDatPickerInput');
    
    if (dateInput && typeof AirDatepicker !== 'undefined') {
        new AirDatepicker('#demoDatPickerInput', {
            locale: {
                days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                today: 'Today',
                clear: 'Clear',
                dateFormat: 'yyyy-MM-dd',
                timeFormat: 'HH:mm',
                firstDay: 0
            },
            dateFormat: 'yyyy-MM-dd',
            minDate: new Date(),
            autoClose: true,
            position: 'bottom left',
            isMobile: true
        });
    }
});

// ============================================
// MOBILE SIDEBAR NAVIGATION (FAB BUTTON)
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const fabButton = document.getElementById("fabButton");
  const sidebarNav = document.getElementById("mobileSidebarNav");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
  const sidebarMenuItems = document.querySelectorAll(".sidebar-menu-item");

  if (!fabButton || !sidebarNav) return; // Elements don't exist

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
    if (sidebarNav && fabMenu && !sidebarNav.contains(e.target) && !fabMenu.contains(e.target)) {
      closeSidebar();
    }
  });
});

// ========================================
// Analytics Integration Placeholder
// ========================================

function trackEvent(eventName, eventData = {}) {
    // Replace with your analytics service (Google Analytics, Mixpanel, etc.)
    console.log('Event tracked:', eventName, eventData);
    
    // Example: Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
}

// Track button clicks
document.querySelectorAll('.btn-primary, .btn-outline-primary').forEach(btn => {
    btn.addEventListener('click', function() {
        const buttonText = this.textContent.trim();
        trackEvent('button_click', {
            button_text: buttonText,
            button_location: this.closest('section')?.id || 'unknown'
        });
    });
});

// ========================================
// Initialization Complete
// ========================================

console.log('HealthFlow Landing Page Initialized');
