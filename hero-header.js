// Hero Header JavaScript
(function () {
    'use strict';

    // Preloader
    window.addEventListener('load', function () {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.classList.add('hidden');
                preloader.style.display = 'none';
                preloader.style.visibility = 'hidden';
                preloader.style.pointerEvents = 'none';
                // Ensure body is scrollable
                document.body.style.overflow = 'scroll';
                document.body.style.overflowY = 'scroll';
                document.html = document.documentElement;
                document.html.style.overflow = 'scroll';
                document.html.style.overflowY = 'scroll';
            }, 500);
        }
    });

    // Immediate preloader removal
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.classList.add('hidden');
        preloader.style.display = 'none';
        preloader.style.visibility = 'hidden';
        preloader.style.pointerEvents = 'none';
    }

    // Fallback: Hide preloader after 3 seconds
    setTimeout(() => {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.classList.add('hidden');
            preloader.style.display = 'none';
            preloader.style.visibility = 'hidden';
            preloader.style.pointerEvents = 'none';
            document.body.style.overflow = 'scroll';
            document.body.style.overflowY = 'scroll';
        }
    }, 3000);

    // Sticky Navbar on Scroll
    window.addEventListener('scroll', function () {
        const navbarArea = document.querySelector('.navbar-area');
        if (navbarArea) {
            if (window.scrollY < 20) {
                navbarArea.classList.remove('sticky');
            } else {
                navbarArea.classList.add('sticky');
            }
        }
    });

    // Initialize WOW.js animations
    if (typeof WOW !== 'undefined') {
        new WOW().init();
    }

    // Initialize VenoBox for video
    if (typeof VenoBox !== 'undefined') {
        document.addEventListener('DOMContentLoaded', function () {
            new VenoBox({
                selector: '.venobox'
            });
        });
    }

    // Mobile Menu - Close on Link Click
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarToggle = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth < 992) {
                // Close mobile menu
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    navbarToggle.click();
                }
            }
        });
    });

    // Smooth Scroll for Navigation Links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
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

    // Scroll Navigation Indicator
    window.addEventListener('scroll', function () {
        const sections = document.querySelectorAll('[data-scroll-index]');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link[data-scroll-nav]');

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('data-scroll-index');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-scroll-nav') === current) {
                link.classList.add('active');
            }
        });
    });

    // Responsive Logo Adjustment
    const navbar = document.querySelector('.navbar');
    const adjustNavbar = () => {
        if (window.innerWidth < 768) {
            if (navbar) {
                navbar.style.paddingTop = '15px';
                navbar.style.paddingBottom = '15px';
            }
        } else {
            if (navbar) {
                navbar.style.paddingTop = '20px';
                navbar.style.paddingBottom = '20px';
            }
        }
    };

    adjustNavbar();
    window.addEventListener('resize', adjustNavbar);

    // Parallax Effect for Header Image (Optional)
    window.addEventListener('scroll', function () {
        const headerImage = document.querySelector('.header-image');
        if (headerImage && window.innerWidth >= 992) {
            const scrolled = window.pageYOffset;
            headerImage.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

})();
