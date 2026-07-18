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
    let currentCurrency = 'USD';
    let currentPrice = 69;
    let currentDelivery = '24 hours';
    let currentOrderRef = '';

    // Package data
    const packages = {
        standard: { currency: 'USD', price: 39, delivery: '48 hours' },
        premium: { currency: 'USD', price: 69, delivery: '24 hours' },
        express: { currency: 'USD', price: 99, delivery: '12 hours' },
        'standard-ugx': { currency: 'UGX', price: 37000, delivery: '48 hours' },
        'premium-ugx': { currency: 'UGX', price: 65000, delivery: '24 hours' },
        'express-ugx': { currency: 'UGX', price: 95000, delivery: '12 hours' }
    };

    function basePackage(pkg) {
        return pkg.replace('-ugx', '');
    }

    function formatMoney(currency, amount) {
        if (currency === 'UGX') {
            return 'UGX ' + Number(amount).toLocaleString('en-US');
        }
        return '$' + amount;
    }

    function ensureOrderRef() {
        if (!currentOrderRef) {
            currentOrderRef = 'WW-' + Date.now().toString(36).toUpperCase();
            const refInput = document.getElementById('orderRef');
            if (refInput) refInput.value = currentOrderRef;
        }
        const refDisplay = document.getElementById('orderRefDisplay');
        if (refDisplay) refDisplay.textContent = currentOrderRef;
        return currentOrderRef;
    }

    function updatePaymentUI() {
        const money = formatMoney(currentCurrency, currentPrice);
        const submitPrice = document.getElementById('submitPrice');
        if (submitPrice) submitPrice.textContent = money;

        const paymentAmount = document.getElementById('paymentAmount');
        if (paymentAmount) paymentAmount.textContent = money;

        const paypalLink = document.getElementById('paypalLink');
        if (paypalLink) {
            paypalLink.href = currentCurrency === 'USD'
                ? 'https://paypal.me/LutwamaReagan/' + currentPrice
                : 'https://paypal.me/LutwamaReagan';
        }

        const waConfirmLink = document.getElementById('waConfirmLink');
        if (waConfirmLink) {
            const message = currentOrderRef
                ? `Hello Wimbo Wako, I have sent payment for ${currentOrderRef}. Package: ${currentPackage}. Amount: ${money}. I am sending the screenshot now.`
                : 'Hello Wimbo Wako, I need help completing payment for a custom song.';
            waConfirmLink.href = 'https://wa.me/256708813419?text=' + encodeURIComponent(message);
        }
    }

    function syncPackageOptionPrices(region) {
        ['standard', 'premium', 'express'].forEach(base => {
            const key = region === 'ugx' ? base + '-ugx' : base;
            const data = packages[key];
            const option = document.querySelector(`.package-option[data-package="${base}"]`);
            if (!data || !option) return;
            const priceEl = option.querySelector('.option-price');
            const deliveryEl = option.querySelector('.option-delivery');
            if (priceEl) priceEl.textContent = formatMoney(data.currency, data.price);
            if (deliveryEl) deliveryEl.textContent = data.delivery.replace(' hours', '-hour').replace(' hour', '-hour') + ' delivery';
        });
    }

    // Select package
    window.selectPackage = function(pkg) {
        const data = packages[pkg];
        if (!data) return;

        currentPackage = pkg;
        currentCurrency = data.currency;
        currentPrice = data.price;
        currentDelivery = data.delivery;

        // Keep the visible order-form package cards in the same currency as the selected pricing table.
        syncPackageOptionPrices(pkg.indexOf('-ugx') !== -1 ? 'ugx' : 'usd');

        // Update UI: Uganda pricing buttons map to the same 3 package cards in the order form.
        document.querySelectorAll('.package-option').forEach(el => {
            el.classList.remove('selected');
        });
        const option = document.querySelector(`.package-option[data-package="${basePackage(pkg)}"]`);
        if (option) option.classList.add('selected');

        // Update hidden form fields
        const pkgInput = document.getElementById('selectedPackage');
        const priceInput = document.getElementById('selectedPrice');
        const currencyInput = document.getElementById('selectedCurrency');
        if (pkgInput) pkgInput.value = pkg;
        if (priceInput) priceInput.value = currentPrice;
        if (currencyInput) currencyInput.value = currentCurrency;

        updatePaymentUI();
    };

    // Navigate between steps
    window.goToStep = function(step) {
        document.querySelectorAll('.order-step').forEach(el => {
            el.classList.add('hidden');
        });
        document.getElementById('step' + step).classList.remove('hidden');

        // Update payment amount, reference and WhatsApp confirmation link
        if (step === 3) {
            ensureOrderRef();
            updatePaymentUI();
        }

        // Scroll to order section
        document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    };

    // Payment selection
    window.selectPayment = function(method) {
        document.querySelectorAll('input[name="payment"]').forEach(el => {
            el.checked = (el.value === method);
        });
    };

    // Keep confirmation step accurate if it is shown
    window.submitPayment = function() {
        goToStep(4);
        document.getElementById('confirmDelivery').textContent = currentDelivery;
    };

    // Reset order
    window.resetOrder = function() {
        currentOrderRef = '';
        const refInput = document.getElementById('orderRef');
        if (refInput) refInput.value = '';
        const refDisplay = document.getElementById('orderRefDisplay');
        if (refDisplay) refDisplay.textContent = 'WW-NEW';
        selectPackage('premium');
        goToStep(1);
        document.getElementById('songForm').reset();
    };

    // Form submission - goes to payment step
    const songForm = document.getElementById('songForm');
    if (songForm) {
        songForm.addEventListener('submit', function(e) {
            e.preventDefault();
            ensureOrderRef();
            updatePaymentUI();
            // Submit to Formspree in background, then show payment instructions.
            fetch(songForm.action, {
                method: 'POST',
                body: new FormData(songForm),
                headers: { 'Accept': 'application/json' }
            }).catch(() => {});
            goToStep(3);
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

    // ============================================
    // COUNTRY PRICING TOGGLE
    // ============================================
    // Default: Show World ($) pricing, hide Uganda
    window.showUganda = function() {
        document.getElementById('pricingUganda').classList.remove('hidden');
        document.getElementById('pricingWorld').classList.add('hidden');
        document.getElementById('ugandaNote').classList.remove('hidden');
        document.getElementById('btnUganda').classList.add('active');
        document.getElementById('btnWorld').classList.remove('active');
    };

    window.showWorld = function() {
        document.getElementById('pricingWorld').classList.remove('hidden');
        document.getElementById('pricingUganda').classList.add('hidden');
        document.getElementById('ugandaNote').classList.add('hidden');
        document.getElementById('btnWorld').classList.add('active');
        document.getElementById('btnUganda').classList.remove('active');
    };

    // Keep hidden order fields in sync with the default selected package.
    selectPackage('premium');

    console.log('🎵 Wimbo Wako loaded successfully!');
});
