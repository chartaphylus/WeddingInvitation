const DATA = window.WeddingData || {};

let currentSlideIndex = 0;
let slides = [];
let dots = [];
let totalSlides = 0;
let slideInterval;
let countdownInterval;
let scrollToTopButton;
let galleryImages = DATA.images?.gallery || [];
let isPlaying = false;
let parallaxFrame = null;
const parallaxState = new WeakMap();

const musicBtn = document.getElementById('musicBtn');
const weddingMusic = document.getElementById('weddingMusic');
const iconPlay = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');

document.addEventListener('DOMContentLoaded', function() {
    applyWeddingData();
    initMusic();
    initEventListeners();
    initMobileMenu();
    initLazyLoading();
    initAccessibility();
    tryAutoPlayMusic();
});

window.addEventListener('load', function() {
    handleLoadingScreen();
    initParallax();
    tryAutoPlayMusic();
});

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function setText(selector, value) {
    document.querySelectorAll(selector).forEach(element => {
        element.textContent = value;
    });
}

function setBackgroundImage(selector, imageUrl, overlay = '') {
    const element = document.querySelector(selector);
    if (!element || !imageUrl) return;
    element.style.backgroundImage = overlay
        ? `${overlay}, url('${imageUrl}')`
        : `url('${imageUrl}')`;
}

function setSingleBackgroundImage(selector, imageUrl) {
    const element = document.querySelector(selector);
    if (!element || !imageUrl) return;
    element.style.backgroundImage = `url('${imageUrl}')`;
}

function applyWeddingData() {
    if (!DATA || !Object.keys(DATA).length) return;

    document.title = DATA.siteTitle || document.title;
    setText('.logo, .intro-logo, .footer-logo', DATA.brand?.initials || 'S&I');
    setText('.nav-logo, .mobile-nav-logo', DATA.brand?.shortName || 'S & I');
    setText('.intro-content h1, .hero h1', DATA.brand?.coupleName || 'Sima & Igneel');
    setText('.intro-content .date', DATA.wedding?.dateText || '');
    setText('.hero-date', DATA.wedding?.heroDate || '');

    const footerDate = document.querySelector('.footer .date');
    if (footerDate) {
        footerDate.textContent = `${DATA.brand?.coupleName || ''} • ${DATA.wedding?.footerDate || ''}`;
    }
    setText('.footer-content p:first-of-type', DATA.footer?.thanks || '');
    setText('.footer-content p:last-of-type', DATA.footer?.closing || '');

    const descriptions = {
        '#couple .section-description': DATA.sections?.coupleDescription,
        '#events .section-description': DATA.sections?.eventsDescription,
        '#gallery .section-description': DATA.sections?.galleryDescription,
        '#countdown .section-description': DATA.sections?.countdownDescription,
        '#location .section-description': DATA.sections?.locationDescription
    };

    Object.entries(descriptions).forEach(([selector, value]) => {
        if (value) setText(selector, value);
    });

    setBackgroundImage(
        '.intro-page',
        DATA.images?.intro,
        'linear-gradient(rgba(255, 250, 242, 0.62), rgba(255, 250, 242, 0.86))'
    );
    setBackgroundImage(
        '.hero-bg',
        DATA.images?.hero,
        'linear-gradient(90deg, rgba(20, 18, 16, 0.66), rgba(20, 18, 16, 0.24))'
    );
    setSingleBackgroundImage('.hero-portrait', DATA.images?.hero);
    setBackgroundImage(
        '.countdown-bg',
        DATA.images?.countdown,
        'linear-gradient(rgba(35, 32, 29, 0.86), rgba(35, 32, 29, 0.9))'
    );
    setBackgroundImage(
        '.map-bg',
        DATA.images?.map,
        'linear-gradient(rgba(35, 32, 29, 0.14), rgba(35, 32, 29, 0.32))'
    );

    renderCouple();
    renderEvents();
    renderGallery();
    renderLocation();
    configureAudio();
}

function renderCouple() {
    const bride = DATA.couple?.bride;
    const groom = DATA.couple?.groom;
    const people = [
        { data: bride, image: DATA.images?.bride, speed: '0.05' },
        { data: groom, image: DATA.images?.groom, speed: '-0.04' }
    ];

    document.querySelectorAll('.couple-card').forEach((card, index) => {
        const person = people[index];
        if (!person?.data) return;

        const image = card.querySelector('.couple-photo');
        const initial = card.querySelector('.initial');
        const name = card.querySelector('.couple-name');
        const title = card.querySelector('.couple-title');
        const description = card.querySelector('.couple-description');
        const imageWrap = card.querySelector('.couple-image');

        if (image) {
            image.src = person.image || image.src;
            image.alt = person.data.name || image.alt;
        }
        if (imageWrap) imageWrap.dataset.parallax = person.speed;
        if (initial) initial.textContent = person.data.initial || '';
        if (name) name.textContent = person.data.name || '';
        if (title) title.textContent = person.data.title || '';
        if (description) {
            description.textContent = `${person.data.parents || ''} ${person.data.description || ''}`.trim();
        }
    });
}

function renderEvents() {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid || !Array.isArray(DATA.events)) return;

    eventsGrid.innerHTML = DATA.events.map(event => `
        <div class="event-card">
            <i class="${escapeHtml(event.icon || 'fas fa-calendar')} event-icon"></i>
            <h3 class="event-title">${escapeHtml(event.title)}</h3>
            <p class="event-time">${escapeHtml(event.time)}</p>
            <div class="event-venue">
                <strong>${escapeHtml(event.venue)}</strong>
                <p class="event-address">${(event.addressLines || []).map(escapeHtml).join('<br>')}</p>
            </div>
        </div>
    `).join('');
}

function renderGallery() {
    const sliderImages = DATA.images?.slider || [];
    galleryImages = DATA.images?.gallery || galleryImages;

    const slider = document.getElementById('gallerySlider');
    const sliderDots = document.getElementById('sliderDots');
    const galleryGrid = document.getElementById('galleryGrid');

    if (slider && sliderImages.length) {
        slider.innerHTML = sliderImages.map((src, index) => `
            <div class="slider-item ${index === 0 ? 'active' : ''}">
                <img src="${escapeHtml(src)}" alt="Wedding Photo ${index + 1}" class="slider-image">
            </div>
        `).join('');
    }

    if (sliderDots && sliderImages.length) {
        sliderDots.innerHTML = sliderImages.map((_, index) => `
            <span class="slider-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></span>
        `).join('');
    }

    if (galleryGrid && galleryImages.length) {
        galleryGrid.innerHTML = galleryImages.map((src, index) => `
            <div class="gallery-item" onclick="openLightbox(${index})">
                <img src="${escapeHtml(src)}" alt="Gallery Photo ${index + 1}" class="gallery-image">
            </div>
        `).join('');
    }
}

function renderLocation() {
    const locationInfo = document.querySelector('.location-info');
    const mapButtons = document.querySelector('.map-buttons');
    const mapOverlay = document.querySelector('.map-overlay');

    if (mapOverlay) mapOverlay.textContent = DATA.locationLabel || '';

    if (locationInfo && Array.isArray(DATA.events)) {
        locationInfo.innerHTML = DATA.events.map(event => `
            <div class="location-card">
                <h3 class="location-title">${escapeHtml(event.title)}</h3>
                <p class="location-venue">${escapeHtml(event.venue)}</p>
                <p class="location-address">${(event.addressLines || []).map(escapeHtml).join('<br>')}</p>
                <p class="location-time"><i class="fas fa-clock"></i>${escapeHtml(event.timeRange || event.time)}</p>
            </div>
        `).join('');
    }

    if (mapButtons && Array.isArray(DATA.events)) {
        mapButtons.innerHTML = DATA.events.map(event => `
            <a href="${escapeHtml(event.mapUrl || '#')}" target="_blank" class="map-button">
                <i class="${escapeHtml(event.icon || 'fas fa-map-marker-alt')}"></i>${escapeHtml(event.title)}
            </a>
        `).join('');
    }
}

function configureAudio() {
    if (!weddingMusic || !DATA.audio?.src) return;

    const source = weddingMusic.querySelector('source');
    if (source && source.src !== DATA.audio.src) {
        source.src = DATA.audio.src;
        weddingMusic.load();
    }
}

function initMusic() {
    if (!musicBtn || !weddingMusic) return;

    musicBtn.addEventListener('click', function() {
        if (isPlaying) {
            pauseWeddingMusic();
        } else {
            playWeddingMusic();
        }
    });
}

function setMusicIcon(playing) {
    isPlaying = playing;
    if (iconPause) iconPause.style.display = playing ? 'block' : 'none';
    if (iconPlay) iconPlay.style.display = playing ? 'none' : 'block';
}

function playWeddingMusic({ silent = false } = {}) {
    if (!weddingMusic) return Promise.resolve(false);

    return weddingMusic.play()
        .then(() => {
            setMusicIcon(true);
            return true;
        })
        .catch(error => {
            setMusicIcon(false);
            if (!silent) console.log('Audio belum bisa autoplay sebelum interaksi user:', error);
            return false;
        });
}

function pauseWeddingMusic() {
    if (!weddingMusic) return;
    weddingMusic.pause();
    setMusicIcon(false);
}

function tryAutoPlayMusic() {
    if (DATA.audio?.autoplay === false) return;
    playWeddingMusic({ silent: true });
}

function handleLoadingScreen() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) loadingScreen.classList.add('is-hidden');
    }, 2000);
}

function enterWebsite() {
    const introPage = document.getElementById('introPage');
    const mainWebsite = document.getElementById('mainWebsite');
    const navbar = document.getElementById('navbar');

    if (introPage) introPage.classList.add('fade-out');

    playWeddingMusic({ silent: true });

    setTimeout(() => {
        if (introPage) introPage.style.display = 'none';
        if (mainWebsite) mainWebsite.classList.add('show');
        if (navbar) navbar.classList.add('show');
        initScrollAnimations();
        startSlider();
        startCountdown();
        handleParallaxEffect();
    }, 1000);
}

function initEventListeners() {
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSection(this.getAttribute('href').substring(1));
        });
    });

    window.addEventListener('scroll', debounce(handleScroll, 16));
    window.addEventListener('resize', debounce(function() {
        if (window.innerWidth > 1024) closeMobileNav();
        handleParallaxEffect();
    }, 250));
}

function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('animate');
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    sections.forEach(section => observer.observe(section));
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavClose = document.getElementById('mobileNavClose');

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileNav);
    if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
    if (mobileNav) {
        mobileNav.addEventListener('click', function(e) {
            if (e.target === mobileNav) closeMobileNav();
        });
    }
}

function openMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    if (!mobileNav) return;
    mobileNav.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    if (!mobileNav) return;
    mobileNav.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function initSlider() {
    slides = Array.from(document.querySelectorAll('.slider-item'));
    dots = Array.from(document.querySelectorAll('.slider-dot'));
    totalSlides = slides.length;
}

function showSlide(index) {
    if (!totalSlides) return;
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    slides[index]?.classList.add('active');
    dots[index]?.classList.add('active');
    currentSlideIndex = index;
}

function nextSlide() {
    showSlide((currentSlideIndex + 1) % totalSlides);
}

function prevSlide() {
    showSlide((currentSlideIndex - 1 + totalSlides) % totalSlides);
}

function goToSlide(index) {
    initSlider();
    if (!totalSlides) return;
    showSlide(index);

    document.querySelector('.gallery-slider')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

function startSlider() {
    initSlider();
    if (!totalSlides) return;
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 4000);
}

function startCountdown() {
    const weddingDate = new Date(DATA.wedding?.countdownDate || 'December 20, 2025 11:00:00').getTime();

    function updateCountdown() {
        const timeLeft = weddingDate - Date.now();
        const values = timeLeft > 0
            ? {
                days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
                hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((timeLeft % (1000 * 60)) / 1000)
            }
            : { days: 0, hours: 0, minutes: 0, seconds: 0 };

        Object.entries(values).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = String(value).padStart(2, '0');
        });
    }

    clearInterval(countdownInterval);
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function handleScroll() {
    handleNavbarScroll();
    handleParallaxEffect();
    handleScrollToTop();
}

function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 250, 242, 0.96)';
        navbar.style.boxShadow = '0 12px 36px rgba(35, 32, 29, 0.08)';
    } else {
        navbar.style.background = 'rgba(255, 250, 242, 0.82)';
        navbar.style.boxShadow = 'none';
    }
}

function initParallax() {
    updateParallaxTargets();
    if (parallaxFrame) return;
    animateParallax();
}

function handleParallaxEffect() {
    updateParallaxTargets();
}

function updateParallaxTargets() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('[data-parallax]').forEach(item => {
        const speed = parseFloat(item.dataset.parallax || '0');
        const rect = item.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > viewportHeight + 120) return;

        const distanceFromCenter = rect.top + rect.height / 2 - viewportHeight / 2;
        const multiplier = item.classList.contains('parallax-layer') ? 0.7 : 0.45;
        const maxMove = item.classList.contains('parallax-layer') ? 42 : 14;
        const target = Math.max(-maxMove, Math.min(maxMove, distanceFromCenter * speed * multiplier));
        const state = parallaxState.get(item) || { current: target, target };
        state.target = target;
        parallaxState.set(item, state);
    });
}

function animateParallax() {
    document.querySelectorAll('[data-parallax]').forEach(item => {
        const state = parallaxState.get(item);
        if (!state) return;

        state.current += (state.target - state.current) * 0.055;
        const y = Math.round(state.current * 100) / 100;
        item.style.transform = `translate3d(0, ${y}px, 0)`;
    });

    parallaxFrame = requestAnimationFrame(animateParallax);
}

function handleScrollToTop() {
    if (!scrollToTopButton) createScrollToTopButton();
    scrollToTopButton.classList.toggle('show', window.pageYOffset > 300);
}

function createScrollToTopButton() {
    scrollToTopButton = document.createElement('button');
    scrollToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopButton.className = 'scroll-to-top';
    scrollToTopButton.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(scrollToTopButton);
}

function ensureLightbox() {
    let lightbox = document.getElementById('lightbox');
    if (lightbox) return lightbox;

    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" type="button" aria-label="Close gallery">&times;</button>
            <button class="lightbox-arrow lightbox-prev" type="button" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button>
            <img id="lightbox-image" src="" alt="Wedding gallery preview">
            <button class="lightbox-arrow lightbox-next" type="button" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>
        </div>
    `;

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', lightboxPrev);
    lightbox.querySelector('.lightbox-next').addEventListener('click', lightboxNext);
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener('touchstart', e => {
        lightboxTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox.addEventListener('touchend', e => {
        lightboxTouchEndX = e.changedTouches[0].screenX;
        handleLightboxSwipe();
    }, { passive: true });
    document.body.appendChild(lightbox);
    return lightbox;
}

function openLightbox(index) {
    if (!galleryImages.length) return;
    if (index < 0) index = galleryImages.length - 1;
    if (index >= galleryImages.length) index = index % galleryImages.length;

    currentSlideIndex = index;
    const lightbox = ensureLightbox();
    const image = document.getElementById('lightbox-image');
    if (image) {
        image.src = galleryImages[index];
        image.alt = `Wedding gallery photo ${index + 1}`;
    }
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    lightbox.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function lightboxNext() {
    openLightbox((currentSlideIndex + 1) % galleryImages.length);
}

function lightboxPrev() {
    openLightbox((currentSlideIndex - 1 + galleryImages.length) % galleryImages.length);
}

let lightboxTouchStartX = 0;
let lightboxTouchEndX = 0;

function handleLightboxSwipe() {
    const swipeDistance = lightboxTouchStartX - lightboxTouchEndX;
    if (Math.abs(swipeDistance) <= 50) return;
    swipeDistance > 0 ? lightboxNext() : lightboxPrev();
}

let touchStartX = 0;
let touchEndX = 0;

function initGalleryTouch() {
    const gallerySlider = document.querySelector('.gallery-slider');
    if (!gallerySlider) return;
    gallerySlider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    gallerySlider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeDistance = touchStartX - touchEndX;
        if (Math.abs(swipeDistance) <= 50 || !totalSlides) return;
        swipeDistance > 0 ? nextSlide() : prevSlide();
    }, { passive: true });
}

function addGalleryImage(imageSrc, altText) {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    const index = galleryImages.length;
    galleryImages.push(imageSrc);

    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.setAttribute('onclick', `openLightbox(${index})`);
    galleryItem.innerHTML = `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(altText || `Gallery Photo ${index + 1}`)}" class="gallery-image">`;
    galleryGrid.appendChild(galleryItem);
}

function updateMapLinks(firstLink, secondLink) {
    const mapButtons = document.querySelectorAll('.map-button');
    if (mapButtons[0]) mapButtons[0].href = firstLink || '#';
    if (mapButtons[1]) mapButtons[1].href = secondLink || '#';
}

function updateCouplePhoto(bridePhotoSrc, groomPhotoSrc) {
    const couplePhotos = document.querySelectorAll('.couple-photo');
    if (couplePhotos[0] && bridePhotoSrc) couplePhotos[0].src = bridePhotoSrc;
    if (couplePhotos[1] && groomPhotoSrc) couplePhotos[1].src = groomPhotoSrc;
}

function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    if (!('IntersectionObserver' in window)) {
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
        return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

function initAccessibility() {
    document.querySelectorAll('.slider-dot').forEach((dot, index) => {
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        dot.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToSlide(index);
            }
        });
    });

    if (document.querySelector('.skip-link')) return;
    const skipLink = document.createElement('a');
    skipLink.href = '#couple';
    skipLink.textContent = 'Skip to content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #23201d;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMobileNav();
        closeLightbox();
    }

    const lightbox = document.getElementById('lightbox');
    if (lightbox?.classList.contains('show')) {
        if (e.key === 'ArrowLeft') lightboxPrev();
        if (e.key === 'ArrowRight') lightboxNext();
        return;
    }

    if (e.key === 'ArrowLeft' && totalSlides > 0) prevSlide();
    if (e.key === 'ArrowRight' && totalSlides > 0) nextSlide();
});

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        if (totalSlides > 0 && !slideInterval) slideInterval = setInterval(nextSlide, 4000);
        if (!countdownInterval) startCountdown();
        if (DATA.audio?.autoplay !== false && isPlaying) playWeddingMusic({ silent: true });
    } else {
        clearInterval(slideInterval);
        slideInterval = null;
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
});

window.addEventListener('beforeunload', function() {
    clearInterval(slideInterval);
    clearInterval(countdownInterval);
});

document.addEventListener('DOMContentLoaded', initGalleryTouch);

window.WeddingInvitation = {
    enterWebsite,
    scrollToSection,
    goToSlide,
    prevSlide,
    nextSlide,
    openMobileNav,
    closeMobileNav,
    openLightbox,
    closeLightbox,
    lightboxNext,
    lightboxPrev,
    addGalleryImage,
    updateMapLinks,
    updateCouplePhoto,
    playWeddingMusic,
    pauseWeddingMusic
};
