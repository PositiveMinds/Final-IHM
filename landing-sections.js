// Landing Sections - Form Handling and Interactions

// Testimonials Data
const testimonialsData = [
    {
        id: 1,
        name: 'Dr. Sarah Namukasa',
        role: 'HIV Program Coordinator',
        facility: 'Mbarara Regional Referral Hospital',
        initials: 'SN',
        rating: 5,
        quote: 'HealthFlow has transformed how we track HIV patients with comorbidities. We used to spend 15+ hours weekly on manual data entry and patient follow-ups. Now it\'s automated and we\'re catching missed appointments before they happen. Our patient adherence rates improved by 25%.',
        metrics: [
            { value: '-12 hrs/week', label: 'Time Saved' },
            { value: '+25%', label: 'Adherence Rate' }
        ],
        details: {
            challenge: 'Manual tracking of HIV patients with diabetes and hypertension consumed 15+ hours weekly, leading to missed appointments and poor adherence monitoring.',
            solution: 'Implemented HealthFlow\'s Silver tier with HIV patient management and chronic disease tracking modules.',
            result: 'Automated patient cohort tracking, ART adherence monitoring, and appointment reminders via WhatsApp. Patient adherence improved from 65% to 90%. Staff now spend just 3 hours weekly on administrative tasks.',
            duration: '90 days',
            plan: 'Silver (UGX 2,956,300/month)'
        }
    },
    {
        id: 2,
        name: 'Eng. Peter Kato',
        role: 'Hospital Director',
        facility: 'Fort Portal Teaching Hospital',
        initials: 'PK',
        rating: 5,
        quote: 'The cost is 70% less than the EHR system we were considering. Within 90 days of implementation, we recovered our setup costs through staff productivity gains. The maternal health module helped us reduce missed PMTCT appointments from 18% to just 4%.',
        metrics: [
            { value: '-14%', label: 'Missed PMTCT Visits' },
            { value: '70%', label: 'Cost Savings vs EHR' }
        ],
        details: {
            challenge: 'EHR system quotes were UGX 20M+/month. High administrative overhead managing multiple disease programs. PMTCT follow-up gaps at 18%.',
            solution: 'Chose HealthFlow Silver tier at UGX 2.96M/month - setup fee recovered in first 90 days.',
            result: 'Multi-module tracking with automated PMTCT scheduling and follow-ups. Viral load monitoring improved. Compliance reporting automated. Hospital saved UGX 12M+ annually vs competitor solutions.',
            duration: '90 days to ROI',
            plan: 'Silver (UGX 2,956,300/month)'
        }
    },
    {
        id: 3,
        name: 'Rose Nanteza',
        role: 'NGO Program Manager',
        facility: 'Kabale Community Health Initiative',
        initials: 'RN',
        rating: 5,
        quote: 'As an NGO, budget is always tight. HealthFlow\'s Bronze tier lets us serve our clinic without breaking the bank. The WhatsApp reminders have been game-changing—patients actually show up now. We\'ve gone from 35% no-shows to 12%.',
        metrics: [
            { value: '-23%', label: 'No-Show Rate' },
            { value: 'Bronze', label: 'Plan Used' }
        ],
        details: {
            challenge: 'Limited budget (UGX 2M/month max). High patient no-show rate (35%). Manual appointment tracking.',
            solution: 'Implemented HealthFlow Bronze tier at UGX 1.48M/month for core HIV tracking and appointment management.',
            result: 'WhatsApp reminders sent automatically 1 day and 2 hours before appointments. Patient no-shows dropped from 35% to 12%. Patient satisfaction increased. Cost is sustainable long-term.',
            duration: '60 days to 50% improvement',
            plan: 'Bronze (UGX 1,476,300/month)'
        }
    },
    {
        id: 4,
        name: 'Dr. James Okello',
        role: 'District Health Officer',
        facility: 'Kisoro District Health Office',
        initials: 'JO',
        rating: 5,
        quote: 'Coordinating across multiple facilities was a nightmare. HealthFlow\'s multi-facility dashboard gives us real-time visibility into HIV programs across our district. Compliance reporting now takes 2 hours instead of a week. Our viral load suppression rate improved to 92%.',
        metrics: [
            { value: '92%', label: 'VL Suppression' },
            { value: '-40 hrs', label: 'Reporting Time' }
        ],
        details: {
            challenge: 'Manual coordination of 8 facilities. Weekly reporting took 40+ hours. Compliance visibility poor. VL suppression rate at 78%.',
            solution: 'Gold tier with multi-facility dashboard and automated compliance reporting.',
            result: 'Real-time visibility across all district facilities. Automated weekly and monthly compliance reports. District health officers can now drill down to individual patient data. VL suppression improved to 92%. Reporting reduced to 2 hours/week.',
            duration: '120 days to full adoption',
            plan: 'Gold (UGX 5,546,300/month)'
        }
    },
    {
        id: 5,
        name: 'Lydia Mbabazi',
        role: 'Nurse - Maternal Health',
        facility: 'Rukungiri Private Clinic',
        initials: 'LM',
        rating: 5,
        quote: 'The PMTCT module is incredible. Tracking antenatal care, postnatal follow-up, and infant prophylaxis in one place means no pregnant patient falls through the cracks. We\'ve eliminated missed postnatal visits entirely—100% follow-up rate.',
        metrics: [
            { value: '100%', label: 'Postnatal Follow-up' },
            { value: 'Gold', label: 'Plan Used' }
        ],
        details: {
            challenge: 'Maternal health visits scattered across systems. Infant prophylaxis adherence gaps. Postnatal follow-up at 65%. Manual tracking error-prone.',
            solution: 'Implemented Gold tier with comprehensive PMTCT module covering antenatal, delivery, postnatal, and infant care.',
            result: 'Integrated tracking from pregnancy to 18-month infant follow-up. Automated reminders ensure no appointments missed. Infant prophylaxis adherence at 100%. Postnatal follow-up improved from 65% to 100%.',
            duration: '90 days to 100% follow-up',
            plan: 'Gold (UGX 5,546,300/month)'
        }
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }

    // Schedule Demo Button
    const scheduleDemoBtn = document.getElementById('schedule-demo');
    if (scheduleDemoBtn) {
        scheduleDemoBtn.addEventListener('click', handleScheduleDemo);
    }

    // Testimonial Cards - Add Click Handler
    setupTestimonialCards();

    // Smooth Scroll Navigation
    setupSmoothScrolling();
});

/**
 * Setup testimonial cards with click handlers
 */
function setupTestimonialCards() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    testimonialCards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            showTestimonialModal(index);
        });
        
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        });
    });
}

/**
 * Show testimonial details in SweetAlert modal
 */
function showTestimonialModal(index) {
    if (!testimonialsData[index]) return;
    
    const testimonial = testimonialsData[index];
    const details = testimonial.details;
    
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: testimonial.name,
            html: `
                <div class="testimonial-modal">
                    <div class="modal-header">
                        <p class="modal-role" style="margin: 0; color: #15696B; font-weight: 600;">${testimonial.role}</p>
                        <p class="modal-facility" style="margin: 0.25rem 0 0 0; color: #999; font-size: 0.9rem;">${testimonial.facility}</p>
                    </div>
                    
                    <div class="modal-content" style="text-align: left; margin: 1.5rem 0;">
                        <div class="modal-section" style="margin-bottom: 1rem;">
                            <h5 style="color: #333; margin-bottom: 0.5rem; font-weight: 600;">Challenge</h5>
                            <p style="margin: 0; color: #666; font-size: 0.9rem; line-height: 1.5;">${details.challenge}</p>
                        </div>
                        
                        <div class="modal-section" style="margin-bottom: 1rem;">
                            <h5 style="color: #333; margin-bottom: 0.5rem; font-weight: 600;">Solution Implemented</h5>
                            <p style="margin: 0; color: #666; font-size: 0.9rem; line-height: 1.5;">${details.solution}</p>
                        </div>
                        
                        <div class="modal-section" style="margin-bottom: 1rem;">
                            <h5 style="color: #333; margin-bottom: 0.5rem; font-weight: 600;">Results Achieved</h5>
                            <p style="margin: 0; color: #666; font-size: 0.9rem; line-height: 1.5;">${details.result}</p>
                        </div>
                        
                        <div class="modal-metrics" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e0e0e0;">
                            <div style="text-align: center;">
                                <p style="margin: 0; font-size: 0.8rem; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Implementation Time</p>
                                <p style="margin: 0.25rem 0 0 0; font-size: 1.25rem; font-weight: 700; color: #15696B;">${details.duration}</p>
                            </div>
                            <div style="text-align: center;">
                                <p style="margin: 0; font-size: 0.8rem; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Plan Used</p>
                                <p style="margin: 0.25rem 0 0 0; font-size: 1.25rem; font-weight: 700; color: #15696B;">${details.plan}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-quote" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid #f0f0f0;">
                        <p style="margin: 0; font-style: italic; color: #555; line-height: 1.6; font-size: 0.95rem;">
                            <i class="fas fa-quote-left" style="color: #15696B; margin-right: 0.5rem;"></i>
                            ${testimonial.quote}
                            <i class="fas fa-quote-right" style="color: #15696B; margin-left: 0.5rem;"></i>
                        </p>
                    </div>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#15696B',
            confirmButtonText: 'Request Demo',
            showCancelButton: true,
            cancelButtonText: 'Close',
            didOpen: function() {
                const confirmBtn = Swal.getConfirmButton();
                confirmBtn.addEventListener('click', function() {
                    Swal.close();
                    // Scroll to contact form
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            },
            width: 600,
            customClass: {
                popup: 'testimonial-modal-popup',
                title: 'testimonial-modal-title',
                content: 'testimonial-modal-content'
            }
        });
    } else {
        // Fallback if SweetAlert not available
        alert(`${testimonial.name}\n${testimonial.role}\n${testimonial.facility}\n\n${testimonial.quote}`);
    }
}

/**
 * Handle contact form submission
 */
function handleContactFormSubmit(e) {
    e.preventDefault();

    // Get form data
    const form = e.target;

    // Validate form
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        validateInterests();
        return;
    }

    // Collect selected interests
    const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
    if (interestCheckboxes.length === 0) {
        validateInterests();
        return;
    }

    const interests = Array.from(interestCheckboxes).map(cb => cb.value);

    // Collect form fields
    const demoRequest = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        facilityName: document.getElementById('facilityName').value.trim(),
        facilityType: document.getElementById('facilityType').value,
        patientLoad: document.getElementById('patientLoad').value,
        demoDate: document.getElementById('demoDate').value,
        preferredTime: document.getElementById('preferredTime').value,
        interests: interests,
        timestamp: new Date().toISOString(),
        source: 'demo-request-form',
        userAgent: navigator.userAgent
    };

    // Log to console (replace with actual backend call)
    console.log('Demo Request Submission:', demoRequest);

    // Send to backend
    submitDemoRequest(demoRequest);
}

/**
 * Validate interests checkboxes
 */
function validateInterests() {
    const interestCheckboxes = document.querySelectorAll('input[name="interests"]');
    const interestError = document.getElementById('interests-error');
    const anyChecked = Array.from(interestCheckboxes).some(cb => cb.checked);
    
    if (!anyChecked) {
        interestError.textContent = 'Please select at least one area of interest';
        interestError.style.display = 'block';
    } else {
        interestError.style.display = 'none';
    }
}

/**
 * Submit demo request to backend
 */
function submitDemoRequest(data) {
    // Replace with your actual backend endpoint
    const endpoint = '/api/demo-requests'; // Update this with your actual endpoint

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        // Show success message
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Demo Scheduled!',
                html: `
                    <p>Thank you, ${data.fullName}!</p>
                    <p>We've received your demo request for <strong>${data.demoDate}</strong> at <strong>${data.preferredTime}</strong></p>
                    <p>You'll receive a confirmation email and WhatsApp message shortly.</p>
                `,
                confirmButtonColor: '#15696B'
            });
        } else {
            alert(`Demo scheduled for ${data.demoDate} at ${data.preferredTime}. You'll receive a confirmation email shortly.`);
        }

        // Reset form
        document.getElementById('contact-form').reset();
        document.getElementById('contact-form').classList.remove('was-validated');
    })
    .catch(error => {
        console.error('Error:', error);
        
        // Show error message
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: 'Something went wrong. Please try again or contact us directly at hello@healthflow.app',
                confirmButtonColor: '#15696B'
            });
        } else {
            alert('Error submitting demo request. Please try again.');
        }
    });
}

/**
 * Fallback submit function for contact form (if needed)
 */
function submitContactForm(data) {
    // This is kept as backup if the structure is ever needed
    submitDemoRequest(data);
}

/**
 * Handle schedule demo button
 */
function handleScheduleDemo() {
    // Check if Swal is available
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Schedule a Demo',
            html: `
                <div class="text-start">
                    <p>Choose your preferred scheduling method:</p>
                    <div class="d-grid gap-2 mt-3">
                        <button class="btn btn-outline-primary" id="calendar-btn">
                            <i class="fas fa-calendar-alt"></i> Use Calendar Booking
                        </button>
                        <button class="btn btn-outline-primary" id="whatsapp-btn">
                            <i class="fab fa-whatsapp"></i> Chat on WhatsApp
                        </button>
                        <button class="btn btn-outline-primary" id="email-btn">
                            <i class="fas fa-envelope"></i> Email Us
                        </button>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            confirmButtonColor: '#15696B'
        }).then(() => {
            // Add event listeners after modal is shown
            const calendarBtn = document.getElementById('calendar-btn');
            const whatsappBtn = document.getElementById('whatsapp-btn');
            const emailBtn = document.getElementById('email-btn');

            if (calendarBtn) {
                calendarBtn.addEventListener('click', function() {
                    // Replace with your calendar tool (e.g., Calendly)
                    window.open('https://calendly.com/yourprofile', '_blank');
                });
            }

            if (whatsappBtn) {
                whatsappBtn.addEventListener('click', function() {
                    window.open('https://wa.me/233571234567?text=Hi HealthFlow, I would like to schedule a demo', '_blank');
                });
            }

            if (emailBtn) {
                emailBtn.addEventListener('click', function() {
                    window.location.href = 'mailto:hello@healthflow.app?subject=Demo Request&body=Hi, I would like to schedule a demo of HealthFlow.';
                });
            }
        });
    } else {
        // Fallback to WhatsApp if Swal is not available
        window.open('https://wa.me/233571234567?text=Hi HealthFlow, I would like to schedule a demo', '_blank');
    }
}

/**
 * Setup smooth scrolling for navigation links
 */
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('[data-scroll-nav]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetIndex = this.getAttribute('data-scroll-nav');
            const targetSection = document.querySelector(`[data-scroll-index="${targetIndex}"]`);
            
            if (targetSection) {
                // Close mobile menu if open
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    const toggleBtn = document.querySelector('.navbar-toggler');
                    toggleBtn.click();
                }

                // Smooth scroll
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                // Update active link
                updateActiveNavLink(targetIndex);
            }
        });
    });
}

/**
 * Update active navigation link
 */
function updateActiveNavLink(index) {
    const navLinks = document.querySelectorAll('[data-scroll-nav]');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-scroll-nav="${index}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

/**
 * Handle pricing button clicks
 */
document.addEventListener('DOMContentLoaded', function() {
    const pricingButtons = document.querySelectorAll('.pricing-card button');
    
    pricingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const plan = this.closest('.pricing-card');
            const planName = plan.querySelector('h4').textContent;
            const price = plan.querySelector('.amount').textContent;
            
            // Show modal or redirect to checkout
            handlePricingButtonClick(planName, price);
        });
    });
});

/**
 * Handle pricing button clicks
 */
function handlePricingButtonClick(planName, price) {
    const buttonText = event.target.textContent;
    
    if (buttonText.includes('Get Started') || buttonText.includes('Free Trial')) {
        // Redirect to registration or checkout
        window.location.href = '/register?plan=' + planName.toLowerCase().replace(/\s+/g, '-');
    } else if (buttonText.includes('Contact Sales')) {
        // Show contact form or redirect to sales
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

/**
 * Auto-scroll active nav based on page scroll
 */
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('[data-scroll-index]');
    let currentSection = 0;
    
    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
            currentSection = index;
        }
    });
    
    updateActiveNavLink(currentSection);
});

/**
 * Form validation feedback
 */
const forms = document.querySelectorAll('.needs-validation');
Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        form.classList.add('was-validated');
    }, false);
});
