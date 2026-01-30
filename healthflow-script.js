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
    animatePhoneCounters();
    initializeWebinarCalendar();
    initializeWebinarRegistration();
    initializeTeamMemberModals();
    initializeBottomNavbar();
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

     // Reset form when modal is hidden
     const demoModal = document.getElementById('demoFormModal');
     if (demoModal) {
         demoModal.addEventListener('hidden.bs.modal', function() {
             resetMultiStepForm();
         });
     }

    demoForm.addEventListener('submit', function(e) {
        // Validate form data before native submission
        const step1 = document.getElementById('step-1');
        const inputs1 = step1.querySelectorAll('input');
        const fullName = inputs1[0]?.value || '';
        const email = inputs1[1]?.value || '';
        const phone = inputs1[2]?.value || '';

        // Validate
        if (!fullName || !email || !phone) {
            e.preventDefault();
            showAlert('error', 'Please fill in all required fields');
            return false;
        }

        if (!validateEmail(email)) {
            e.preventDefault();
            showAlert('error', 'Please enter a valid email address');
            return false;
        }

        if (!validatePhone(phone)) {
            e.preventDefault();
            showAlert('error', 'Please enter a valid phone number');
            return false;
        }

        // Allow native form submission to webhook
        showAlert('success', 'Demo request submitted! Check your email for confirmation.');
        
        // Close modal after submission
        setTimeout(() => {
            const demoModal = document.getElementById('demoFormModal');
            if (demoModal) {
                const modalInstance = bootstrap.Modal.getInstance(demoModal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        }, 1000);
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

     // Scroll modal body to top
     setTimeout(() => {
         const modalBody = document.querySelector('#demoFormModal .modal-body');
         if (modalBody) {
             modalBody.scrollTop = 0;
         } else {
             document.querySelector('.multi-step-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
         }
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
         const modalBody = document.querySelector('#demoFormModal .modal-body');
         if (modalBody) {
             modalBody.scrollTop = 0;
         } else {
             document.querySelector('.multi-step-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
         }
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
        dotsData: false,
        autoplay: false,
        responsive: {
            0: {
                items: 1,
                margin: 10
            },
            576: {
                items: 1,
                margin: 15
            },
            768: {
                items: 2,
                margin: 20,
                nav: true
            },
            1024: {
                items: 2,
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
        dotsData: false,
        autoplay: true,
        autoplayTimeout: 6000,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1,
                margin: 10
            },
            576: {
                items: 1,
                margin: 15
            },
            768: {
                items: 2,
                margin: 20,
                nav: true
            },
            1024: {
                items: 2,
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
        dotsData: false,
        autoplay: false,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1,
                margin: 10
            },
            576: {
                items: 2,
                margin: 15
            },
            768: {
                items: 3,
                margin: 20,
                nav: true
            },
            1200: {
                items: 4,
                margin: 20,
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
// Phone Mockup Counter Animation
// ========================================

function animatePhoneCounters() {
    // Animate all counter elements with data-value attribute
    const counterElements = document.querySelectorAll('.animate-number');
    
    counterElements.forEach(element => {
        const targetValue = element.getAttribute('data-value');
        
        // Handle string values (like "< 50" or "138/85")
        if (targetValue.includes('<') || targetValue.includes('/')) {
            element.textContent = targetValue;
            return;
        }
        
        const numValue = parseInt(targetValue, 10);
        if (isNaN(numValue)) return;
        
        let currentValue = 0;
        const increment = numValue / 30; // 30 frames of animation
        const duration = 1000; // 1 second total
        const stepTime = duration / 30;
        
        const counter = setInterval(() => {
            currentValue += increment;
            if (currentValue >= numValue) {
                element.textContent = numValue.toLocaleString();
                clearInterval(counter);
            } else {
                element.textContent = Math.floor(currentValue).toLocaleString();
            }
        }, stepTime);
    });
    
    // Add real-time notifications
    addPhoneNotifications();
    updatePhoneTime();
}

function addPhoneNotifications() {
    const notificationCenter = document.getElementById('phoneNotificationCenter');
    if (!notificationCenter) return;
    
    const notifications = [
        {
            type: 'success',
            icon: '✓',
            title: 'Patient Checked',
            message: 'John Doe appointment completed'
        },
        {
            type: 'alert',
            icon: '⚠️',
            title: 'High BP Alert',
            message: 'Patient ID #2845 - 160/95 mmHg'
        },
        {
            type: 'info',
            icon: 'ℹ️',
            title: 'Medication Due',
            message: 'Patient #5612 - ART refill reminder'
        },
        {
            type: 'success',
            icon: '✓',
            title: 'Viral Suppressed',
            message: 'Patient #4521 - VL < 50 copies/ml'
        }
    ];
    
    // Add notifications with staggered timing
    notifications.forEach((notif, index) => {
        setTimeout(() => {
            const toast = document.createElement('div');
            toast.className = `notification-toast ${notif.type}`;
            toast.innerHTML = `
                <span class="notification-icon">${notif.icon}</span>
                <div class="notification-content">
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-message">${notif.message}</div>
                </div>
            `;
            notificationCenter.appendChild(toast);
            
            // Auto remove notification after 4 seconds
            setTimeout(() => {
                toast.style.animation = 'toastSlideOut 0.4s ease-out forwards';
                setTimeout(() => toast.remove(), 400);
            }, 4000);
        }, index * 1500); // Stagger notifications
    });
}

function updatePhoneTime() {
    const timeElement = document.getElementById('phone-time');
    if (!timeElement) return;
    
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;
    }
    
    updateTime();
    setInterval(updateTime, 60000); // Update every minute
    
    // Show appointments popup after 2 seconds
    setTimeout(showAppointmentsPopup, 2000);
}

function showAppointmentsPopup() {
    const popup = document.getElementById('appointmentsPopup');
    if (popup) {
        popup.classList.remove('hidden');
        
        // Auto-hide after 6 seconds
        setTimeout(() => {
            closeAppointmentsPopup();
        }, 6000);
    }
}

function closeAppointmentsPopup() {
    const popup = document.getElementById('appointmentsPopup');
    if (popup) {
        popup.classList.add('hidden');
        setTimeout(() => {
            popup.style.display = 'none';
        }, 400);
    }
}

// ========================================
// Webinar Calendar
// ========================================

function initializeWebinarCalendar() {
    let currentDate = new Date();
    const webinarDates = [5, 12, 19, 26]; // Webinar dates in February
    
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const currentMonthSpan = document.getElementById('currentMonth');
    const calendarDays = document.getElementById('calendarDays');
    
    if (!prevMonthBtn || !nextMonthBtn || !calendarDays) return;
    
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Update month display
        const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        currentMonthSpan.textContent = monthName;
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Clear previous days
        calendarDays.innerHTML = '';
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarDays.appendChild(emptyDay);
        }
        
        // Add days of month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            
            // Check if it's today
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayEl.classList.add('today');
            }
            
            // Check if webinar scheduled
            if (webinarDates.includes(day) && month === 1) { // February is month 1
                dayEl.classList.add('has-event');
            }
            
            calendarDays.appendChild(dayEl);
        }
    }
    
    // Event listeners
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Initial render
    renderCalendar();
}

function initializeWebinarRegistration() {
    const registerBtns = document.querySelectorAll('.register-webinar-btn');
    
    registerBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const webinarName = this.getAttribute('data-webinar');
            
            // Show SweetAlert confirmation
            Swal.fire({
                title: 'Register for Webinar',
                html: `<p>You're registering for:</p><strong>${webinarName}</strong>`,
                icon: 'info',
                input: 'email',
                inputPlaceholder: 'Enter your email address',
                confirmButtonText: 'Register',
                confirmButtonColor: '#12a16b',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value) {
                        return 'Please enter your email address'
                    }
                    // Basic email validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        return 'Please enter a valid email address'
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Here you would send the registration to your backend
                    Swal.fire({
                        title: 'Registration Successful!',
                        text: `We've sent confirmation details to ${result.value}. Check your email for the webinar link.`,
                        icon: 'success',
                        confirmButtonColor: '#12a16b'
                    });
                    
                    // Change button text
                    this.textContent = 'Registered ✓';
                    this.disabled = true;
                    this.classList.remove('btn-outline-primary');
                    this.classList.add('btn-success');
                }
            });
        });
    });
}

// ========================================
// Team Member Modal Initialization
// ========================================

function initializeTeamMemberModals() {
    const teamCards = document.querySelectorAll('.team-member-card');
    const modal = document.getElementById('teamMemberModal');
    const bootstrapModal = modal ? new bootstrap.Modal(modal) : null;
    
    teamCards.forEach(card => {
        card.addEventListener('click', function() {
            const name = this.getAttribute('data-member-name');
            const position = this.getAttribute('data-member-position');
            const image = this.getAttribute('data-member-image');
            const bio = this.getAttribute('data-member-bio');
            const expertise = this.getAttribute('data-member-expertise');
            const experience = this.getAttribute('data-member-experience');
            
            // Populate modal
            document.getElementById('modalMemberName').textContent = name;
            document.getElementById('modalMemberPosition').textContent = position;
            document.getElementById('modalMemberImage').src = image;
            document.getElementById('modalMemberBio').textContent = bio;
            document.getElementById('modalMemberExperience').textContent = experience;
            
            // Create expertise tags
            const expertiseTags = document.getElementById('modalMemberExpertise');
            expertiseTags.innerHTML = '';
            
            const expertiseArray = expertise.split(',').map(item => item.trim());
            expertiseArray.forEach(skill => {
                const tag = document.createElement('span');
                tag.className = 'expertise-tag';
                tag.textContent = skill;
                expertiseTags.appendChild(tag);
            });
            
            // Show modal
            if (bootstrapModal) {
                bootstrapModal.show();
            }
        });
    });
}

// ========================================
// Mobile Bottom Navbar Active State
// ========================================

function initializeBottomNavbar() {
    const navbarItems = document.querySelectorAll('.mobile-bottom-navbar .navbar-item');
    
    // Set active state on page load
    updateBottomNavbar();
    
    // Update on scroll
    window.addEventListener('scroll', updateBottomNavbar);
    
    // Handle clicks
    navbarItems.forEach(item => {
        item.addEventListener('click', function() {
            navbarItems.forEach(i => i.classList.remove('active'));
            
            // Only add active to anchor links, not buttons
            if (this.tagName === 'A') {
                this.classList.add('active');
            }
        });
    });
}

function updateBottomNavbar() {
    const sections = document.querySelectorAll('[id]');
    const navbarItems = document.querySelectorAll('.mobile-bottom-navbar a.navbar-item');
    let currentSection = 'home';
    
    // Determine current section based on scroll position
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (window.pageYOffset >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });
    
    // Check if on dashboard or other pages
    if (!currentSection || currentSection === '') {
        currentSection = 'home';
    }
    
    // Update active states
    navbarItems.forEach(item => {
        const href = item.getAttribute('href');
        item.classList.remove('active');
        
        if (href === '#home' && currentSection === 'home') {
            item.classList.add('active');
        } else if (href === '#contact' && currentSection === 'contact') {
            item.classList.add('active');
        } else if (currentSection && href === '#' + currentSection) {
            item.classList.add('active');
        }
    });
}

// ========================================
// Initialization Complete
// ========================================

console.log('HealthFlow Landing Page Initialized');
