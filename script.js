// Main script file for HealthFlow landing page

// Dark mode toggle functionality
function toggleDarkMode() {
    const body = document.body;
    const darkModeToggleBtn = document.getElementById('darkModeToggleBtn');
    
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
        darkModeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        darkModeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Check dark mode preference on load
document.addEventListener('DOMContentLoaded', function() {
    const darkModePreference = localStorage.getItem('darkMode');
    const darkModeToggleBtn = document.getElementById('darkModeToggleBtn');
    
    if (darkModePreference === 'true') {
        document.body.classList.add('dark-mode');
        if (darkModeToggleBtn) {
            darkModeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
});

// Testimonials carousel scroll
function scrollTestimonials(direction) {
    const container = document.querySelector('.testimonials-container');
    if (container) {
        const scrollAmount = 350;
        container.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Initialize Select2 if jQuery is available
document.addEventListener('DOMContentLoaded', function() {
    if (typeof jQuery !== 'undefined' && typeof $.fn.select2 !== 'undefined') {
        // Initialize any select elements with Select2
        $('.select2-capable').select2({
            placeholder: 'Select an option',
            allowClear: true
        });
    }
});
