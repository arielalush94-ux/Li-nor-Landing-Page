// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('L.A Nails Academy: JS Initialized');
    initNavbar();       // Setup sticky navbar
    initHamburger();    // Mobile menu toggle
    initHeroVideo();    // Force hero background video to play
    initScrollAnimate(); // Intersection Observer for animations
    initCountUp();      // Animate stat numbers
    initLeadForm();     // Handle form submission
    initSmoothScroll(); // Robust smooth scroll with offset
    initLegalModals();  // Privacy & Accessibility Modals
    initAccessibilityWidget(); // Accessibility Toolbar
    initPricingSelection(); // Pre-fill form from pricing cards
    initFAQAccordion();   // Expand/Collapse FAQ items
    initFloatingCTA();    // Scroll-based visibility for floating button
});

// ===== HERO VIDEO - force autoplay =====
function initHeroVideo() {
    const video = document.querySelector('.hero-video');
    if (!video) return;

    // Ensure muted (required for autoplay)
    video.muted = true;
    video.playsInline = true;

    // Try to play
    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Autoplay blocked - play on first user interaction
            document.addEventListener('click', function playOnce() {
                video.play();
                document.removeEventListener('click', playOnce);
            }, { once: true });
        });
    }
}

// ===== FAQ ACCORDION - toggle items =====
function initFAQAccordion() {
    const questions = document.querySelectorAll('.faq-question');
    if (questions.length === 0) return;

    questions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');

            // Close all other items (optional, but cleaner)
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ===== NAVBAR - add scrolled class on scroll =====
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ===== HAMBURGER MENU - mobile toggle =====
function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// ===== SCROLL ANIMATIONS - fade in elements on scroll =====
function initScrollAnimate() {
    const elements = document.querySelectorAll('[data-animate]');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80); // Slightly faster stagger
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px 50px 0px' // Start loading slightly before it enters the view
    });

    elements.forEach(el => observer.observe(el));
}

// ===== COUNT UP ANIMATION - animate stat numbers =====
function initCountUp() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (statNumbers.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCount(entry.target, 0, target, 1500);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
}

function animateCount(element, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * eased);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end;
        }
    }

    requestAnimationFrame(update);
}

// ===== LEAD FORM - handle submission =====
function initLeadForm() {
    const form = document.getElementById('leadForm');
    const successDiv = document.getElementById('formSuccess');
    if (!form || !successDiv) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const course = document.getElementById('courseInterest').value;
        const consent = document.getElementById('consent').checked;

        if (!name || !phone || !course) return;

        if (!consent) {
            alert('מעולה, אבל רגע - צריך לאשר את הסכמתך לקבלת עדכונים כדי להתקדם :)');
            return;
        }

        console.log('Lead Captured:', { name, phone, course, consent });

        // Save to Google Sheets (Backup)
        const sheetUrl = 'https://script.google.com/macros/s/AKfycbzbN6cItSLRASfoUUFTfZawThFbujbRb6hbWW6zKDG2DUFWCBCt388IRGtUo0ow92qF/exec';
        fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone: "'" + phone, course })
        }).catch(err => console.error('Google Sheets Error:', err));

        // Prepare WhatsApp message
        const businessPhone = '972542024714';
        const message = `היי לינור, אני מעוניינת בפרטים נוספים לגבי ${course}.\nהנה הפרטים שלי:\nשם: ${name}\nטלפון: ${phone}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodedMessage}`;

        // Hide form and show success
        form.classList.add('hidden');
        successDiv.classList.remove('hidden');

        // Redirect to WhatsApp after a short delay
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 1500);
    });
}

// ===== SMOOTH SCROLL - robust manual calculation with duration and easing =====
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // If this button has a specific course selection, handle it
                const courseValue = this.getAttribute('data-course-select');
                const courseSelect = document.getElementById('courseInterest');
                if (courseValue && courseSelect) {
                    courseSelect.value = courseValue;

                    // Add highlight effect to form
                    const formContainer = document.querySelector('.contact-form-container');
                    if (formContainer) {
                        formContainer.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.5s ease';
                        formContainer.style.transform = 'scale(1.03)';
                        formContainer.style.boxShadow = '0 10px 40px rgba(177, 148, 112, 0.4)'; // Gold/Bronze glow
                        setTimeout(() => {
                            formContainer.style.transform = 'scale(1)';
                            formContainer.style.boxShadow = '';
                        }, 1200);
                    }
                }

                // Offset calculation (matching CSS scroll-margin-top)
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const targetPosition = elementPosition - headerOffset;

                // Use custom slow smooth scroll for a "pleasant" effect
                customSmoothScroll(targetPosition, 800);
            }
        });
    });
}

// ===== LEGAL MODALS - Privacy & Accessibility =====
function initLegalModals() {
    const modal = document.getElementById('legalModal');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.querySelector('.modal-close');
    const triggers = document.querySelectorAll('.legal-trigger');

    if (!modal || !modalBody || !closeBtn) return;

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const type = trigger.getAttribute('data-modal');
            const template = document.getElementById(`${type}-content`);

            if (template) {
                modalBody.innerHTML = template.innerHTML;
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scroll
            }
        });
    });

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scroll
    }
}

// ===== ACCESSIBILITY WIDGET - toolbar logic =====
function initAccessibilityWidget() {
    const widgetBtn = document.getElementById('accessibilityBtn');
    const menu = document.getElementById('accessibilityMenu');
    const closeBtn = document.getElementById('closeAccessibility');
    const options = document.querySelectorAll('.acc-opt');

    if (!widgetBtn || !menu || !closeBtn) return;

    // Toggle Menu
    widgetBtn.addEventListener('click', () => {
        menu.classList.toggle('active');
    });

    closeBtn.addEventListener('click', () => {
        menu.classList.remove('active');
    });

    // Close menu when clicking outside
    window.addEventListener('click', (e) => {
        if (!document.getElementById('accessibilityWidget').contains(e.target)) {
            menu.classList.remove('active');
        }
    });

    // Handle Options
    options.forEach(opt => {
        opt.addEventListener('click', () => {
            const action = opt.getAttribute('data-action');
            handleAccessibilityAction(action);
        });
    });
}

let currentTextScale = 0; // 0=normal, 1=xl, 2=xxl

function handleAccessibilityAction(action) {
    const body = document.body;

    switch (action) {
        case 'contrast':
            body.classList.toggle('high-contrast');
            document.documentElement.classList.remove('grayscale');
            break;
        case 'grayscale':
            document.documentElement.classList.toggle('grayscale');
            body.classList.remove('high-contrast');
            break;
        case 'highlight-links':
            body.classList.toggle('links-highlight');
            break;
        case 'increase-text':
            if (currentTextScale < 2) {
                currentTextScale++;
                updateTextScale();
            }
            break;
        case 'decrease-text':
            if (currentTextScale > 0) {
                currentTextScale--;
                updateTextScale();
            }
            break;
        case 'reset':
            body.classList.remove('high-contrast', 'links-highlight');
            document.documentElement.classList.remove('grayscale', 'text-xl', 'text-xxl');
            currentTextScale = 0;
            break;
    }
}

function updateTextScale() {
    const html = document.documentElement;
    html.classList.remove('text-xl', 'text-xxl');
    if (currentTextScale === 1) html.classList.add('text-xl');
    if (currentTextScale === 2) html.classList.add('text-xxl');
}

// ===== COURSE SELECTION - pre-fill form from course cards =====
function initPricingSelection() {
    const courseSelect = document.getElementById('courseInterest');
    const contactSection = document.getElementById('contact');

    if (!courseSelect || !contactSection) return;

    // Handle new course card selection (Full section clickable)
    const courseCards = document.querySelectorAll('.course-card-clickable');
    courseCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const courseValue = card.getAttribute('data-course-select');
            if (courseValue) {
                courseSelect.value = courseValue; // Pre-fill the form select

                const headerOffset = 100;
                const contactTop = contactSection.getBoundingClientRect().top + window.pageYOffset;
                const targetPosition = contactTop - headerOffset;

                // Smooth scroll to form
                customSmoothScroll(targetPosition, 800);

                // Highlight effect on form
                const formContainer = document.querySelector('.contact-form-container');
                if (formContainer) {
                    formContainer.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.5s ease';
                    formContainer.style.transform = 'scale(1.03)';
                    formContainer.style.boxShadow = '0 10px 40px rgba(177, 148, 112, 0.4)';
                    setTimeout(() => {
                        formContainer.style.transform = 'scale(1)';
                        formContainer.style.boxShadow = '';
                    }, 1200);
                }
            }
        });
    });

    // Handle floating CTA buttons with data-course-select
    const courseCTAs = document.querySelectorAll('[data-course-select]:not(.course-card-clickable)');
    courseCTAs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const courseValue = btn.getAttribute('data-course-select');
            if (courseValue) {
                courseSelect.value = courseValue;
                const headerOffset = 100;
                const contactTop = contactSection.getBoundingClientRect().top + window.pageYOffset;
                customSmoothScroll(contactTop - headerOffset, 800);
            }
        });
    });
}

/**
 * Custom smooth scroll with duration and easing control
 * @param {number} targetY - Destination scroll position
 * @param {number} duration - Animation duration in ms
 */
function customSmoothScroll(targetY, duration) {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;

        // Easing function (easeInOutCubic)
        const run = easeInOutCubic(timeElapsed, startY, distance, duration);

        window.scrollTo(0, run);

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    // Cubic Bezier Easing: easeInOutCubic
    function easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    }

    requestAnimationFrame(animation);
}

// ===== FLOATING CTA - show/hide on scroll =====
function initFloatingCTA() {
    const fab = document.getElementById('floatingCTA');
    if (!fab) return;

    window.addEventListener('scroll', () => {
        // Show only after scrolling past the hero stats (below Linor's story)
        const heroStats = document.querySelector('.hero-stats');
        const showThreshold = heroStats
            ? heroStats.getBoundingClientRect().bottom + window.pageYOffset
            : 800; // Fallback

        if (window.scrollY > showThreshold) {
            fab.classList.add('visible');
        } else {
            fab.classList.remove('visible');
        }

        // Hide when near the actual contact form to avoid overlap
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            const rect = contactSection.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                fab.style.opacity = '0';
                fab.style.visibility = 'hidden';
                fab.style.pointerEvents = 'none';
            } else {
                fab.style.opacity = '';
                fab.style.visibility = '';
                fab.style.pointerEvents = '';
            }
        }
    });
}
