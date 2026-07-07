/**
 * WIMBO WAKO - Main JavaScript
 * Handles: navigation, order form, FAQ, scroll animations, mobile menu
 */

document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // ============================================
    // MOBILE MENU TOGGLE
    // ============================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');

        // Animate hamburger
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close mobile menu on link click
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // ORDER FORM - MULTI-STEP
    // ============================================
    let currentPackage = 'premium';
    let currentPrice = 79;
    let currentDelivery = '12 hours';

    // Package data
    const packages = {
        standard: { price: 49, delivery: '24 hours' },
        premium: { price: 79, delivery: '12 hours' },
        express: { price: 99, delivery: '1 hour' }
    };

    // Select package
    window.selectPackage = function(pkg) {
        currentPackage = pkg;
        currentPrice = packages[pkg].price;
        currentDelivery = packages[pkg].delivery;

        // Update UI
        document.querySelectorAll('.package-option').forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelector(`.package-option[data-package="${pkg}"]`).classList.add('selected');

        // Update hidden form fields
        const pkgInput = document.getElementById('selectedPackage');
        const priceInput = document.getElementById('selectedPrice');
        if (pkgInput) pkgInput.value = pkg;
        if (priceInput) priceInput.value = currentPrice;

        // Update submit button
        const submitPrice = document.getElementById('submitPrice');
        if (submitPrice) submitPrice.textContent = '$' + currentPrice;
    };

    // Navigate between steps
    window.goToStep = function(step) {
        document.querySelectorAll('.order-step').forEach(el => {
            el.classList.add('hidden');
        });
        document.getElementById('step' + step).classList.remove('hidden');

        // Scroll to order section
        document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    };

    // Reset order
    window.resetOrder = function() {
        selectPackage('premium');
        goToStep(1);
        document.getElementById('songForm').reset();
    };

    // Form submission
    const songForm = document.getElementById('songForm');
    if (songForm) {
        songForm.addEventListener('submit', function(e) {
            // Formspree handles the submission
            // Show confirmation after brief delay (Formspree redirects)
            setTimeout(() => {
                goToStep(3);
                document.getElementById('confirmDelivery').textContent = currentDelivery;
            }, 500);
        });
    }

    // ============================================
    // FAQ ACCORDION
    // ============================================
    window.toggleFaq = function(button) {
        const item = button.parentElement;
        const wasActive = item.classList.contains('active');

        // Close all
        document.querySelectorAll('.faq-item').forEach(faq => {
            faq.classList.remove('active');
        });

        // Open clicked if it wasn't active
        if (!wasActive) {
            item.classList.add('active');
        }
    };

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    const revealElements = document.querySelectorAll(
        '.step, .occasion-card, .sample-card, .testimonial-card, ' +
        '.pricing-card, .faq-item, .section-header'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // ============================================
    // HERO ENTRANCE ANIMATIONS
    // ============================================
    const heroElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-cta, .hero-trust');
    heroElements.forEach((el, index) => {
        el.style.animationDelay = (index * 0.1) + 's';
    });

    // ============================================
    // PLAY BUTTON INTERACTION
    // ============================================
    document.querySelectorAll('.sample-play').forEach(playBtn => {
        playBtn.addEventListener('click', function() {
            const sample = this.dataset.sample;

            // Show "coming soon" for now (replace with actual audio later)
            const existingPopup = document.querySelector('.audio-popup');
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement('div');
            popup.className = 'audio-popup';
            popup.innerHTML = `
                <div class="audio-popup-content">
                    <button class="audio-popup-close">&times;</button>
                    <div class="audio-popup-icon">&#9836;</div>
                    <h4>Sample Song Coming Soon</h4>
                    <p>We're preparing sample songs! Order now and we'll create your unique song from scratch.</p>
                    <a href="#order" class="btn btn-primary" onclick="document.querySelector('.audio-popup').remove()">Create My Song</a>
                </div>
            `;
            document.body.appendChild(popup);

            // Style popup
            const style = document.createElement('style');
            style.textContent = `
                .audio-popup {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                .audio-popup-content {
                    background: white;
                    padding: 48px 36px;
                    border-radius: 20px;
                    text-align: center;
                    max-width: 400px;
                    margin: 20px;
                    position: relative;
                    animation: fadeInUp 0.4s ease;
                }
                .audio-popup-close {
                    position: absolute;
                    top: 16px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-size: 1.8rem;
                    cursor: pointer;
                    color: #999;
                }
                .audio-popup-icon {
                    font-size: 3rem;
                    color: var(--primary, #C4723C);
                    margin-bottom: 16px;
                }
                .audio-popup h4 {
                    font-size: 1.3rem;
                    margin-bottom: 12px;
                    color: #2D2A26;
                }
                .audio-popup p {
                    color: #7A746C;
                    margin-bottom: 24px;
                    line-height: 1.6;
                }
            `;
            popup.appendChild(style);

            popup.querySelector('.audio-popup-close').addEventListener('click', () => popup.remove());
            popup.addEventListener('click', (e) => {
                if (e.target === popup) popup.remove();
            });
        });
    });

    // ============================================
    // ACTIVE NAV LINK HIGHLIGHTING
    // ============================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    console.log('🎵 Wimbo Wako loaded successfully!');
});
