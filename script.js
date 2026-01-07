// ===== FORM HANDLING WITH SWEET ALERT ===== 

// Contact Form Submission
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const organization = document.getElementById('organization').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Validate form
    if (!name || !email || !organization || !subject || !message) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'Please fill in all required fields.',
            confirmButtonColor: '#007bff'
        });
        return;
    }
    
    // Show loading state
    Swal.fire({
        title: 'Sending...',
        html: 'Please wait while we process your message.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Simulate sending (in production, this would send to your backend)
    setTimeout(() => {
        // Success message
        Swal.fire({
            icon: 'success',
            title: 'Message Sent!',
            html: `<strong>Thank you, ${name}!</strong><br><br>We've received your message and will get back to you within 24 hours at ${email}.<br><br>In the meantime, feel free to contact us via WhatsApp: <strong>+256-775-582-868</strong>`,
            confirmButtonColor: '#28a745',
            confirmButtonText: 'Got it!'
        });
        
        // Reset form
        document.getElementById('contactForm').reset();
    }, 2000);
});

// Demo Form Submission
document.getElementById('demoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('demoName').value;
    const email = document.getElementById('demoEmail').value;
    const phone = document.getElementById('demoPhone').value;
    const facility = document.getElementById('demoFacility').value;
    const patients = document.getElementById('demoPatients').value;
    const preference = document.getElementById('demoPreference').value;
    
    // Validate form
    if (!name || !email || !phone || !facility || !patients || !preference) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'Please fill in all fields to schedule your demo.',
            confirmButtonColor: '#007bff'
        });
        return;
    }
    
    // Show loading state
    Swal.fire({
        title: 'Scheduling Your Demo...',
        html: 'Please wait while we confirm your appointment.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Simulate scheduling (in production, this would send to your backend/calendar)
    setTimeout(() => {
        // Success message
        Swal.fire({
            icon: 'success',
            title: 'Demo Scheduled!',
            html: `<strong>Perfect, ${name}!</strong><br><br>Your free demo has been scheduled.<br><br><strong>Details:</strong><br>
                   📧 Email: ${email}<br>
                   📞 Phone: ${phone}<br>
                   🏥 Facility: ${facility}<br>
                   📊 Patient Load: ${patients}<br><br>
                   We'll send you a calendar invite and Zoom link shortly. Our team will call you at your preferred time.<br><br>
                   Questions? Contact us: <strong>+256-775-582-868</strong>`,
            confirmButtonColor: '#28a745',
            confirmButtonText: 'Excellent!'
        });
        
        // Reset form
        document.getElementById('demoForm').reset();
    }, 2000);
});

// ===== SCROLL TO FORM FUNCTION ===== 
function scrollToForm() {
    const contactSection = document.getElementById('contact');
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    // Focus on demo form
    setTimeout(() => {
        document.getElementById('demoName').focus();
    }, 500);
}

// ===== NAVIGATION SMOOTH SCROLLING ===== 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href === '#' || href === '#!') {
            return;
        }
        
        e.preventDefault();
        
        const target = document.querySelector(href);
        if (target) {
            // Close mobile nav menu if open
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                const navbarToggler = document.querySelector('.navbar-toggler');
                navbarToggler.click();
            }
            
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== PAGE LOAD ANIMATIONS ===== 
window.addEventListener('load', function() {
    // Add fade-in animations to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.classList.add('fade-in-up');
            card.style.animation = `fadeInUp 0.5s ease forwards`;
            card.style.animationDelay = `${index * 0.1}s`;
        }, 0);
    });
});

// ===== FORM INPUT VALIDATION ===== 
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    // Accept various phone formats
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phone === '' || phoneRegex.test(phone.replace(/\s/g, ''));
}

// ===== REAL-TIME EMAIL VALIDATION ===== 
document.getElementById('email')?.addEventListener('blur', function() {
    if (this.value && !validateEmail(this.value)) {
        this.classList.add('is-invalid');
    } else {
        this.classList.remove('is-invalid');
    }
});

document.getElementById('demoEmail')?.addEventListener('blur', function() {
    if (this.value && !validateEmail(this.value)) {
        this.classList.add('is-invalid');
    } else {
        this.classList.remove('is-invalid');
    }
});

// ===== PHONE VALIDATION ===== 
document.getElementById('phone')?.addEventListener('blur', function() {
    if (this.value && !validatePhone(this.value)) {
        this.classList.add('is-invalid');
    } else {
        this.classList.remove('is-invalid');
    }
});

document.getElementById('demoPhone')?.addEventListener('blur', function() {
    if (this.value && !validatePhone(this.value)) {
        this.classList.add('is-invalid');
    } else {
        this.classList.remove('is-invalid');
    }
});

// ===== MOBILE MENU CLOSE ON LINK CLICK ===== 
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (navbarCollapse.classList.contains('show')) {
            navbarToggler.click();
        }
    });
});

// ===== NAVBAR BACKGROUND ON SCROLL ===== 
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    }
});

// ===== CURRENCY FORMATTER (OPTIONAL) ===== 
function formatCurrency(amount, currency = 'UGX') {
    const formatter = new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    });
    return formatter.format(amount);
}

// ===== DEMO MESSAGE ===== 
// Show welcome message on page load
window.addEventListener('load', function() {
    // Check if user has dismissed the welcome message before
    if (!localStorage.getItem('healthflowWelcomeDismissed')) {
        setTimeout(() => {
            Swal.fire({
                title: 'Welcome to HealthFlow!',
                html: 'Discover how we help healthcare facilities save 12-15 hours monthly while improving patient outcomes.<br><br><small>This message appears once per session.</small>',
                icon: 'info',
                confirmButtonColor: '#28a745',
                confirmButtonText: 'Got it!',
                allowOutsideClick: false
            }).then(() => {
                localStorage.setItem('healthflowWelcomeDismissed', 'true');
            });
        }, 2000);
    }
});

// ===== ACCORDION BEHAVIOR ===== 
document.querySelectorAll('.accordion-button').forEach(button => {
    button.addEventListener('click', function() {
        setTimeout(() => {
            // Scroll to expanded content
            const accordionItem = this.closest('.accordion-item');
            const accordionBody = accordionItem.querySelector('.accordion-body');
            
            if (accordionBody.style.display !== 'none') {
                accordionBody.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 300);
    });
});

// ===== PRICING CALCULATOR (OPTIONAL ENHANCEMENT) ===== 
function calculateROI() {
    const timeSavingsHourly = 50000; // UGX per hour
    const monthlyTimeSavings = 12 * timeSavingsHourly; // 12-15 hours
    const noShowReductionValue = 300000; // UGX value of reduced no-shows
    
    return {
        timeSavings: monthlyTimeSavings,
        noShowReduction: noShowReductionValue,
        totalValue: monthlyTimeSavings + noShowReductionValue
    };
}

// ===== COPY TO CLIPBOARD (OPTIONAL) ===== 
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Copied to clipboard',
            timer: 2000,
            timerProgressBar: true
        });
    });
}

// ===== THEME TOGGLE (OPTIONAL FOR DARK MODE) ===== 
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('healthflowDarkMode', document.body.classList.contains('dark-mode'));
}

// Load dark mode preference on page load
if (localStorage.getItem('healthflowDarkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// ===== ERROR HANDLING ===== 
window.addEventListener('error', function(event) {
    console.error('An error occurred:', event.error);
    
    if (event.error && event.error.message && event.error.message.includes('network')) {
        Swal.fire({
            icon: 'error',
            title: 'Connection Error',
            text: 'Please check your internet connection and try again.',
            confirmButtonColor: '#dc3545'
        });
    }
});

// ===== ANALYTICS TRACKING (OPTIONAL) ===== 
function trackEvent(eventName, eventData = {}) {
    if (window.gtag) {
        gtag('event', eventName, eventData);
    }
    console.log(`Event tracked: ${eventName}`, eventData);
}

// Track form submissions
document.getElementById('contactForm')?.addEventListener('submit', function() {
    trackEvent('contact_form_submitted', {
        form_type: 'contact_inquiry'
    });
});

document.getElementById('demoForm')?.addEventListener('submit', function() {
    trackEvent('demo_scheduled', {
        form_type: 'demo_request'
    });
});

// ===== SELECT2 INITIALIZATION ===== 
$(document).ready(function() {
    // Initialize Select2 for facility dropdowns
    $('.facility-select').each(function() {
        $(this).select2({
            placeholder: 'Search or select your healthcare facility...',
            allowClear: true,
            width: '100%',
            dropdownParent: $(this).closest('.form-card-enhanced'),
            templateResult: formatFacilityOption,
            templateSelection: formatFacilitySelection,
            matcher: matchFacilitySearch
        });
    });
    
    // Also initialize standard form preference select
    $('#demoPreference').select2({
        placeholder: 'Select your preferred time...',
        allowClear: true,
        width: '100%',
        dropdownParent: $('#demoPreference').closest('.form-card-enhanced')
    });
});

// Custom formatting for facility options
function formatFacilityOption(option) {
    if (!option.id) {
        return option.text;
    }
    return $('<span><i class="fas fa-hospital-user me-2"></i>' + option.text + '</span>');
}

// Format selection display
function formatFacilitySelection(option) {
    if (!option.id) {
        return option.text;
    }
    return $('<span><i class="fas fa-hospital-user me-2"></i>' + option.text + '</span>');
}

// Custom search matcher to search by facility name
function matchFacilitySearch(params, data) {
    // If there are no search terms, return all of the data
    if ($.trim(params.term) === '') {
        return data;
    }

    // Do not display the item if there is no 'text' property
    if (typeof data.text === 'undefined') {
        return null;
    }

    // `params.term` should be the term that is used for searching
    // `data.text` is the text that is displayed for the option
    var term = params.term.toLowerCase();
    var text = data.text.toLowerCase();
    
    // Check if text contains the term
    if (text.indexOf(term) > -1) {
        return data;
    }
    
    // Return `null` if the term does not match
    return null;
}

// ===== TESTIMONIALS CAROUSEL ===== 
function scrollTestimonials(direction) {
    const track = document.querySelector('.testimonial-track');
    if (track) {
        const scrollAmount = 400; // Card width + gap
        track.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }
}

// ===== ROI CALCULATOR ===== 
document.getElementById('staffHours')?.addEventListener('input', function() {
    const hours = parseInt(this.value);
    const hourlyRate = 50000; // UGX
    const monthlySavings = hours * hourlyRate;
    
    document.getElementById('hoursDisplay').textContent = hours + ' hours';
    document.getElementById('hoursValue').textContent = 'UGX ' + monthlySavings.toLocaleString() + '/mo';
    
    updateROITotal();
});

document.getElementById('noShowRate')?.addEventListener('input', function() {
    const rate = parseInt(this.value);
    const monthlyLoss = rate * 30000; // UGX loss per % of no-shows
    
    document.getElementById('noShowDisplay').textContent = rate + '%';
    document.getElementById('noShowValue').textContent = 'UGX ' + monthlyLoss.toLocaleString() + '/mo loss';
    
    updateROITotal();
});

function updateROITotal() {
    const staffHours = parseInt(document.getElementById('staffHours')?.value || 60);
    const noShowRate = parseInt(document.getElementById('noShowRate')?.value || 30);
    
    const hourlyRate = 50000;
    const timeSavings = (staffHours * 0.6) * hourlyRate; // 60% reduction with HealthFlow
    const noShowReduction = (noShowRate * 0.2) * 30000; // 20% reduction
    
    const totalBenefit = timeSavings + noShowReduction;
    const healthflowCost = 250000;
    const netSavings = totalBenefit - healthflowCost;
    const breakEven = healthflowCost / (totalBenefit || 1);
    
    document.getElementById('timeSavingsCalc').textContent = Math.round(staffHours * 0.6) + ' hours';
    document.getElementById('timeSavingsValue').textContent = 'UGX ' + Math.round(timeSavings).toLocaleString();
    
    document.getElementById('noShowReductionCalc').textContent = Math.round(noShowRate * 0.2) + '%';
    document.getElementById('noShowSavingsValue').textContent = 'UGX ' + Math.round(noShowReduction).toLocaleString();
    
    document.getElementById('totalBenefitCalc').textContent = 'UGX ' + Math.round(totalBenefit).toLocaleString();
    document.getElementById('breakEvenCalc').textContent = breakEven.toFixed(1);
}

// ===== MULTI-STEP FORM ===== 
function nextStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step-indicator').forEach(el => el.classList.remove('active'));
    
    // Show current step
    document.getElementById('step-' + step)?.classList.add('active');
    document.querySelector(`[data-step="${step}"]`)?.classList.add('active');
    
    // Scroll to form
    document.querySelector('.multi-step-form-card').scrollIntoView({ behavior: 'smooth' });
}

function prevStep(step) {
    nextStep(step);
}

document.getElementById('multiStepDemoForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    Swal.fire({
        icon: 'success',
        title: 'Demo Scheduled!',
        text: 'Thank you! We will contact you shortly to confirm your demo appointment.',
        confirmButtonColor: '#28a745'
    });
    
    this.reset();
    nextStep(1);
});

// ===== WEBINAR SCHEDULER ===== 
function scheduleWebinar(webinarId) {
    Swal.fire({
        title: 'Register for Webinar',
        html: 'You are about to register for this webinar. Please provide your email to receive the joining link.',
        input: 'email',
        inputPlaceholder: 'your@healthcare.ug',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Register',
        confirmButtonColor: '#28a745',
        preConfirm: (email) => {
            if (!email || !validateEmail(email)) {
                Swal.showValidationMessage('Please enter a valid email address');
            }
            return email;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: 'Registered!',
                text: `Webinar details have been sent to ${result.value}. See you there!`,
                confirmButtonColor: '#28a745'
            });
        }
    });
}

// ===== MOBILE SIDEBAR TOGGLE ===== 
document.getElementById('sidebarToggle')?.addEventListener('click', function() {
    const sidebar = document.getElementById('mobileSidebar');
    sidebar.classList.add('active');
});

document.getElementById('sidebarClose')?.addEventListener('click', function() {
    const sidebar = document.getElementById('mobileSidebar');
    sidebar.classList.remove('active');
});

document.getElementById('sidebarOverlay')?.addEventListener('click', function() {
    const sidebar = document.getElementById('mobileSidebar');
    sidebar.classList.remove('active');
});

// Close sidebar when clicking menu items
document.querySelectorAll('.sidebar-menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        const sidebar = document.getElementById('mobileSidebar');
        sidebar.classList.remove('active');
    });
});

// ===== MOBILE NAVBAR INTERACTION ===== 
document.querySelectorAll('.navbar-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all items
        document.querySelectorAll('.navbar-item').forEach(i => {
            i.classList.remove('active');
        });
        
        // Add active class to clicked item
        this.classList.add('active');
        
        // Show appropriate content (in a real app)
        const section = this.getAttribute('href');
        console.log('Navigating to:', section);
    });
});

// ===== DARK MODE TOGGLE ===== 
function toggleDarkMode() {
    const body = document.body;
    const btn = document.getElementById('darkModeToggleBtn');
    
    body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('healthflowDarkMode', isDarkMode);
    
    // Update button icon
    if (isDarkMode) {
        btn.innerHTML = '<i class="fas fa-sun"></i>';
        btn.title = 'Switch to Light Mode';
    } else {
        btn.innerHTML = '<i class="fas fa-moon"></i>';
        btn.title = 'Switch to Dark Mode';
    }
    
    // Add animation
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 200);
    
    // Track event
    trackEvent('dark_mode_toggled', { dark_mode: isDarkMode });
}

// Load dark mode preference on page load
window.addEventListener('load', function() {
    const isDarkMode = localStorage.getItem('healthflowDarkMode') === 'true';
    const btn = document.getElementById('darkModeToggleBtn');
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-sun"></i>';
            btn.title = 'Switch to Light Mode';
        }
    }
});

// ===== ANALYTICS TRACKING ===== 
// Track page views
function trackPageView(pageName) {
    trackEvent('page_view', {
        page_name: pageName,
        timestamp: new Date().toISOString()
    });
}

// Track section views (when user scrolls to sections)
window.addEventListener('scroll', debounce(function() {
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            // Section is in viewport
            if (!section.dataset.tracked) {
                trackEvent('section_viewed', {
                    section: section.id
                });
                section.dataset.tracked = 'true';
            }
        }
    });
}, 500));

// Track button clicks
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
        const buttonText = this.textContent.trim().substring(0, 30);
        trackEvent('button_clicked', {
            button_text: buttonText,
            button_class: this.className
        });
    });
});

// Track link clicks
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && !href.startsWith('#')) {
            trackEvent('external_link_clicked', {
                url: href
            });
        }
    });
});

// Video play tracking
document.querySelectorAll('button').forEach(button => {
    if (button.textContent.includes('Watch')) {
        button.addEventListener('click', function() {
            trackEvent('video_played', {
                video_title: this.closest('.video-card')?.querySelector('h5')?.textContent
            });
        });
    }
});

// Knowledge base link tracking
document.querySelectorAll('.kb-link').forEach(link => {
    link.addEventListener('click', function(e) {
        const guideTitle = this.closest('.kb-card')?.querySelector('h5')?.textContent;
        trackEvent('kb_guide_accessed', {
            guide: guideTitle
        });
    });
});

// Testimonials interaction tracking
document.querySelectorAll('.testimonial-card').forEach((card, index) => {
    card.addEventListener('mouseenter', function() {
        trackEvent('testimonial_viewed', {
            testimonial_index: index
        });
    });
});

// Team profile interaction tracking
document.querySelectorAll('.team-card').forEach((card, index) => {
    card.addEventListener('mouseenter', function() {
        const name = card.querySelector('h5')?.textContent;
        trackEvent('team_member_viewed', {
            member_name: name,
            team_index: index
        });
    });
});

// Customer logo click tracking
document.querySelectorAll('.logo-card').forEach((card, index) => {
    card.addEventListener('click', function() {
        const customerName = card.querySelector('p')?.textContent;
        trackEvent('customer_logo_clicked', {
            customer: customerName,
            logo_index: index
        });
    });
});

// ===== UTILITY FUNCTIONS ===== 
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

// ===== INITIALIZATION ===== 
console.log('HealthFlow website loaded successfully');
console.log('Version: 2.0.0');
console.log('All features active: Forms, Navigation, Animations, Select2, ROI Calculator, Multi-step Forms, Webinar Scheduler, Mobile Analytics, Dark Mode, Video Demos, Knowledge Base, Team Profiles, Customer Logos, Analytics Tracking');
