// Global Variables
let currentSlideIndex = 0;
let slides, dots, totalSlides, slideInterval;
let countdownInterval;
let scrollToTopButton;

// music player
const musicBtn = document.getElementById("musicBtn");
    const weddingMusic = document.getElementById("weddingMusic");
    const iconPlay = document.getElementById("iconPlay");
    const iconPause = document.getElementById("iconPause");
    let isPlaying = false;

    musicBtn.addEventListener("click", () => {
      if (isPlaying) {
        weddingMusic.pause();
        iconPause.style.display = "none";
        iconPlay.style.display = "block";
      } else {
        weddingMusic.play()
          .then(() => {
            iconPlay.style.display = "none";
            iconPause.style.display = "block";
          })
          .catch(err => {
            console.log("Error play musik:", err);
          });
      }
      isPlaying = !isPlaying;
    });

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
    initMobileMenu();
});

// Window Load Event
window.addEventListener('load', function() {
    handleLoadingScreen();
    createParticles();
});

// Loading Screen Handler
function handleLoadingScreen() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
    }, 2000);
}

// Intro Page Animation
function enterWebsite() {
    const introPage = document.getElementById('introPage');
    const mainWebsite = document.getElementById('mainWebsite');
    const navbar = document.getElementById('navbar');
    
    introPage.classList.add('fade-out');
    
    setTimeout(() => {
        introPage.style.display = 'none';
        mainWebsite.classList.add('show');
        navbar.classList.add('show');
        initScrollAnimations();
        startSlider();
        startCountdown();
    }, 1000);
}

// Initialize Event Listeners
function initEventListeners() {
    // Navigation Links
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });

    // Scroll Events
    window.addEventListener('scroll', handleScroll);
    
    // Event Cards Animation
    initEventCardsAnimation();
    
    // Location Cards Animation
    initLocationCardsAnimation();
}

// Scroll Animations
function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    sections.forEach(section => {
        observer.observe(section);
    });
}

// Mobile Menu Functions
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavClose = document.getElementById('mobileNavClose');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', openMobileNav);
    }
    
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileNav);
    }
    
    // Close on overlay click
    if (mobileNav) {
        mobileNav.addEventListener('click', function(e) {
            if (e.target === mobileNav) {
                closeMobileNav();
            }
        });
    }
}

function openMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav) {
        mobileNav.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav) {
        mobileNav.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Gallery Slider Functions
function initSlider() {
    slides = document.querySelectorAll('.slider-item');
    dots = document.querySelectorAll('.slider-dot');
    totalSlides = slides ? slides.length : 0;
}

function showSlide(index) {
    if (!slides || !dots || totalSlides === 0) return;
    
    // Ensure index is within bounds
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    
    // Remove active class from all
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current
    if (slides[index]) slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    
    currentSlideIndex = index;
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    showSlide(currentSlideIndex);
}

function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    currentSlideIndex = index;
    showSlide(currentSlideIndex);
    
    // Scroll to slider if clicked from grid
    const gallerySlider = document.querySelector('.gallery-slider');
    if (gallerySlider) {
        gallerySlider.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

function startSlider() {
    initSlider();
    if (totalSlides > 0) {
        // Clear any existing interval
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        // Auto-play every 4 seconds
        slideInterval = setInterval(nextSlide, 4000);
    }
}

// Countdown Timer Functions
function startCountdown() {
    // Set wedding date (example: December 20, 2025 11:00:00)
    const weddingDate = new Date('December 20, 2025 11:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();   
        const timeLeft = weddingDate - now;
        
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
            return;
        }
        
        if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            daysElement.textContent = days.toString().padStart(2, '0');
            hoursElement.textContent = hours.toString().padStart(2, '0');
            minutesElement.textContent = minutes.toString().padStart(2, '0');
            secondsElement.textContent = seconds.toString().padStart(2, '0');
        } else {
            // Wedding day has arrived
            daysElement.textContent = '00';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
        }
    }
    
    // Clear any existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Update immediately and then every second
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Smooth Scrolling
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Handle Scroll Events
function handleScroll() {
    handleNavbarScroll();
    handleParallaxEffect();
    handleScrollToTop();
}

// Navbar Scroll Effect
function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}

// Parallax Effect
function handleParallaxEffect() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
}

// Scroll to Top Button
function handleScrollToTop() {
    if (!scrollToTopButton) {
        createScrollToTopButton();
    }
    
    if (window.pageYOffset > 300) {
        scrollToTopButton.classList.add('show');
    } else {
        scrollToTopButton.classList.remove('show');
    }
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

// Event Cards Animation
function initEventCardsAnimation() {
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Location Cards Animation
function initLocationCardsAnimation() {
    const locationCards = document.querySelectorAll('.location-card');
    
    locationCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });
}

// Floating Particles Effect
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const particleCount = window.innerWidth < 768 ? 30 : 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(201, 170, 124, 0.3);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
            pointer-events: none;
        `;
        hero.appendChild(particle);
    }
}

// Utility Functions
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

// Optimized scroll handler
window.addEventListener('scroll', debounce(handleScroll, 16));

// Handle window resize
window.addEventListener('resize', debounce(function() {
    // Close mobile menu on resize
    if (window.innerWidth > 1024) {
        closeMobileNav();
    }
}, 250));

// Handle visibility change (pause/resume animations when tab is not visible)
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // Resume animations
        if (totalSlides > 0 && !slideInterval) {
            slideInterval = setInterval(nextSlide, 4000);
        }
        if (!countdownInterval) {
            startCountdown();
        }
    } else {
        // Pause animations
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }
});

// Handle keyboard navigation
document.addEventListener('keydown', function(e) {
    // Close mobile menu with Escape key
    if (e.key === 'Escape') {
        closeMobileNav();
        closeLightbox();
    }
    
    // Navigate gallery with arrow keys
    if (e.key === 'ArrowLeft' && totalSlides > 0) {
        goToSlide((currentSlideIndex - 1 + totalSlides) % totalSlides);
    }
    
    if (e.key === 'ArrowRight' && totalSlides > 0) {
        goToSlide((currentSlideIndex + 1) % totalSlides);
    }
    
    // Navigate lightbox with arrow keys
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('show')) {
        if (e.key === 'ArrowLeft') {
            lightboxPrev();
        }
        if (e.key === 'ArrowRight') {
            lightboxNext();
        }
    }
});

// Enhanced Touch Events for Lightbox
let lightboxTouchStartX = 0;
let lightboxTouchEndX = 0;

function handleLightboxTouchStart(e) {
    lightboxTouchStartX = e.changedTouches[0].screenX;
}

function handleLightboxTouchEnd(e) {
    lightboxTouchEndX = e.changedTouches[0].screenX;
    handleLightboxSwipe();
}

function handleLightboxSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = lightboxTouchStartX - lightboxTouchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            lightboxNext();
        } else {
            lightboxPrev();
        }
    }
}

// Add lightbox touch events
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('touchstart', handleLightboxTouchStart, { passive: true });
        lightbox.addEventListener('touchend', handleLightboxTouchEnd, { passive: true });
        
        // Close lightbox on background click
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
});

// Dynamic Gallery Loading Function
function addGalleryImage(imageSrc, altText) {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    const index = galleryImages.length;
    galleryImages.push({ src: imageSrc, alt: altText || `Gallery Photo ${index + 1}` });
    
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.setAttribute('onclick', `openLightbox(${index})`);
    galleryItem.setAttribute('data-image', imageSrc);
    
    galleryItem.innerHTML = `
        <img src="${imageSrc}" alt="${altText || `Gallery Photo ${index + 1}`}" class="gallery-image">
        <span class="gallery-placeholder fallback"><i class="fas fa-image"></i></span>
        <div class="gallery-overlay">
            <i class="fas fa-search-plus"></i>
        </div>
    `;
    
    // Add image error handler
    const img = galleryItem.querySelector('.gallery-image');
    img.addEventListener('error', function() {
        this.classList.add('error');
    });
    img.addEventListener('load', function() {
        this.classList.remove('error');
    });
    
    galleryGrid.appendChild(galleryItem);
    
    // Update lightbox total count
    const totalElement = document.getElementById('lightbox-total');
    if (totalElement) {
        totalElement.textContent = galleryImages.length;
    }
}

// Function to update map links
function updateMapLinks(ceremonyLink, receptionLink) {
    const mapButtons = document.querySelectorAll('.map-button');
    if (mapButtons.length >= 2) {
        mapButtons[0].href = ceremonyLink || '#';
        mapButtons[1].href = receptionLink || '#';
    }
}

// Function to update couple photos
function updateCouplePhoto(bridePhotoSrc, groomPhotoSrc) {
    const couplePhotos = document.querySelectorAll('.couple-photo');
    if (couplePhotos.length >= 2) {
        if (bridePhotoSrc) couplePhotos[0].src = bridePhotoSrc;
        if (groomPhotoSrc) couplePhotos[1].src = groomPhotoSrc;
    }
}

// Enhanced Error Handling
function handleImageError(img, fallbackElement) {
    img.style.opacity = '0';
    if (fallbackElement) {
        fallbackElement.style.opacity = '1';
    }
}

// Optimize performance for large galleries
function lazyLoadGalleryImages() {
    const galleryImages = document.querySelectorAll('.gallery-image');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        galleryImages.forEach(img => {
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
        });
    }
}

// Initialize lazy loading on DOM ready
document.addEventListener('DOMContentLoaded', lazyLoadGalleryImages);

// Configuration object for easy customization
window.WeddingConfig = {
    // Gallery images - Add your images here
    galleryImages: [
        'images/gallery/gallery-1.jpg',
        'images/gallery/gallery-2.jpg',
        'images/gallery/gallery-3.jpg',
        'images/gallery/gallery-4.jpg',
        'images/gallery/gallery-5.jpg',
        'images/gallery/gallery-6.jpg',
        'images/gallery/gallery-7.jpg',
        'images/gallery/gallery-8.jpg',
        'images/gallery/gallery-9.jpg'
        // Add more images as needed
    ],
    
    // Slider images - Add your slider images here
    sliderImages: [
        'images/gallery/slide-1.jpg',
        'images/gallery/slide-2.jpg',
        'images/gallery/slide-3.jpg',
        'images/gallery/slide-4.jpg',
        'images/gallery/slide-5.jpg',
        'images/gallery/slide-6.jpg'
    ],
    
    // Couple photos
    bridePhoto: 'images/bride.jpg',
    groomPhoto: 'images/groom.jpg',
    
    // Map links - Update with your actual Google Maps links
    ceremonyMapLink: 'https://maps.google.com/maps?q=St.+Catherine+Cathedral,+Jl.+Kebon+Sirih+No.+17,+Jakarta+Pusat',
    receptionMapLink: 'https://maps.google.com/maps?q=The+Ritz-Carlton+Jakarta,+Jl.+DR.+Ide+Anak+Agung+Gde+Agung,+Jakarta+Selatan',
    
    // Wedding date
    weddingDate: 'December 20, 2025 11:00:00'
};

// Apply configuration on load
document.addEventListener('DOMContentLoaded', function() {
    // Update map links
    updateMapLinks(WeddingConfig.ceremonyMapLink, WeddingConfig.receptionMapLink);
});

// Export enhanced functions for global access
window.WeddingInvitation = {
    enterWebsite,
    scrollToSection,
    goToSlide,
    prevSlide,
    nextSlide: nextSlide,
    openMobileNav,
    closeMobileNav,
    openLightbox,
    closeLightbox,
    lightboxNext,
    lightboxPrev,
    addGalleryImage,
    updateMapLinks,
    updateCouplePhoto
};

// Error handling for missing elements
function safeElementOperation(elementId, operation) {
    try {
        const element = document.getElementById(elementId);
        if (element && typeof operation === 'function') {
            operation(element);
        }
    } catch (error) {
        console.warn(`Error operating on element ${elementId}:`, error);
    }
}

// Lazy loading for better performance
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// Performance optimization: Preload critical resources
function preloadCriticalResources() {
    const criticalResources = [
        'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = 'style';
        document.head.appendChild(link);
    });
}

// Initialize all functions when DOM is ready
function initializeWebsite() {
    preloadCriticalResources();
    initLazyLoading();
}

// Clean up function for when page is unloaded
window.addEventListener('beforeunload', function() {
    // Clear intervals to prevent memory leaks
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
});

// Touch events for mobile gallery navigation
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX - touchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold && totalSlides > 0) {
        if (swipeDistance > 0) {
            // Swipe left - next slide
            goToSlide((currentSlideIndex + 1) % totalSlides);
        } else {
            // Swipe right - previous slide
            goToSlide((currentSlideIndex - 1 + totalSlides) % totalSlides);
        }
    }
}

// Add touch events to gallery slider
document.addEventListener('DOMContentLoaded', function() {
    const gallerySlider = document.querySelector('.gallery-slider');
    if (gallerySlider) {
        gallerySlider.addEventListener('touchstart', handleTouchStart, { passive: true });
        gallerySlider.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    // Initialize website
    initializeWebsite();
});

// Accessibility improvements
function initAccessibility() {
    // Add ARIA labels
    const sliderDots = document.querySelectorAll('.slider-dot');
    sliderDots.forEach((dot, index) => {
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        
        // Keyboard support for dots
        dot.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToSlide(index);
            }
        });
    });
    
    // Add skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#couple';
    skipLink.textContent = 'Skip to content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
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

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', initAccessibility);

// Service Worker registration for better caching (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Analytics tracking (placeholder - replace with actual analytics)
function trackEvent(eventName, eventData = {}) {
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Example: Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, eventData);
    }
    
    console.log('Event tracked:', eventName, eventData);
}

// Track user interactions
document.addEventListener('click', function(e) {
    const target = e.target;
    
    if (target.matches('.enter-button')) {
        trackEvent('invitation_opened');
    }
    
    if (target.matches('.nav-links a, .mobile-nav-links a')) {
        trackEvent('navigation_click', { section: target.textContent });
    }
    
    if (target.matches('.slider-dot, .gallery-item')) {
        trackEvent('gallery_interaction');
    }
});

// Export functions for global access if needed
window.WeddingInvitation = {
    enterWebsite,
    scrollToSection,
    goToSlide,
    openMobileNav,
    closeMobileNav
};

