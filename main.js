import * as THREE from 'three';

// ─── Intersection Observer for scroll-triggered fade animations ───
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in-up, .fade-in').forEach(el => {
    observer.observe(el);
});

// ─── Mobile Menu Toggle ───
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

if (mobileMenuBtn && mobileMenu && mobileMenuOverlay) {
    const toggleMenu = () => {
        const isOpen = mobileMenu.classList.toggle('open');
        mobileMenuBtn.classList.toggle('open', isOpen);
        mobileMenuOverlay.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    mobileMenuBtn.addEventListener('click', toggleMenu);
    mobileMenuOverlay.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            mobileMenuBtn.classList.remove('open');
            mobileMenuOverlay.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

// ─── Navbar hide/show on scroll ───
const navbar = document.getElementById('navbar');
let lastScrollY = 0;
let navbarTimeout = null;

if (navbar) {
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.classList.add('navbar-hidden');
        } else {
            navbar.classList.remove('navbar-hidden');
        }

        lastScrollY = currentScrollY;
    }, { passive: true });
}

// ─── Interactive Mouse Background Effect ───
const mouseGlow = document.getElementById('mouse-glow');
const uniGlow = document.getElementById('uni-glow');

if (mouseGlow && uniGlow) {
    let mouseRAFQueued = false;
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;

        if (!mouseRAFQueued) {
            mouseRAFQueued = true;
            requestAnimationFrame(() => {
                const glowX = (mouseX - 0.5) * 40;
                const glowY = (mouseY - 0.5) * 40;
                mouseGlow.style.transform = `translate(calc(-50% + ${glowX}vw), calc(-50% + ${glowY}vh))`;

                const uniX = (mouseX - 0.5) * -15;
                const uniY = (mouseY - 0.5) * -15;
                uniGlow.style.transform = `translate(calc(-50% + ${uniX}px), calc(-50% + ${uniY}px))`;

                mouseRAFQueued = false;
            });
        }
    }, { passive: true });
}

// ─── Smooth scroll for anchor links ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ─── Dotted Surface Three.js Background ───
function initDottedSurface() {
    const container = document.getElementById('dotted-surface');
    if (!container) return;

    // Reduce particle count on mobile for performance
    const isMobile = window.innerWidth <= 768;
    const SEPARATION = isMobile ? 200 : 150;
    const AMOUNTX = isMobile ? 20 : 40;
    const AMOUNTY = isMobile ? 30 : 60;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0d0d12, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile, // Disable AA on mobile for perf
        powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color, 0);

    container.appendChild(renderer.domElement);

    const positions = [];
    const colors = [];
    const geometry = new THREE.BufferGeometry();

    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
            const y = 0;
            const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

            positions.push(x, y, z);
            colors.push(200 / 255, 200 / 255, 200 / 255);
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: isMobile ? 6 : 8,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let isVisible = true;

    // Pause when hero is not visible for performance
    const heroSection = document.getElementById('home');
    if (heroSection) {
        const visibilityObserver = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0 });
        visibilityObserver.observe(heroSection);
    }

    const animate = () => {
        requestAnimationFrame(animate);

        // Skip rendering when not visible
        if (!isVisible) return;

        const positionAttribute = geometry.attributes.position;
        const posArray = positionAttribute.array;

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                const index = i * 3;
                posArray[index + 1] =
                    Math.sin((ix + count) * 0.3) * 50 +
                    Math.sin((iy + count) * 0.5) * 50;
                i++;
            }
        }

        positionAttribute.needsUpdate = true;
        renderer.render(scene, camera);
        count += 0.1;
    };

    // Debounced resize handler
    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    animate();
}

initDottedSurface();

// ─── Container Scroll Animation (3D tilt for Features) ───
const scrollContainer = document.getElementById('scroll-container');
const scrollHeader = document.getElementById('scroll-header');
const scrollCard = document.getElementById('scroll-card');

if (scrollContainer && scrollHeader && scrollCard) {
    let scrollRAFQueued = false;

    const updateScrollAnimation = () => {
        const rect = scrollContainer.getBoundingClientRect();
        const containerHeight = rect.height;
        const windowHeight = window.innerHeight;

        let rawProgress = (windowHeight - rect.top) / (windowHeight + containerHeight);
        rawProgress = Math.max(0, Math.min(1, rawProgress));

        // Complete animation within first 50% of scroll
        let progress = Math.min(rawProgress / 0.5, 1);

        const isMobile = window.innerWidth <= 768;

        const translateY = progress * -100;
        const rotateX = 45 - (progress * 45);
        const scale = isMobile
            ? (0.7 + progress * 0.2)
            : (1.05 - progress * 0.05);

        scrollHeader.style.transform = `translateY(${translateY}px)`;
        scrollCard.style.transform = `rotateX(${rotateX}deg) scale(${scale})`;
        scrollRAFQueued = false;
    };

    window.addEventListener('scroll', () => {
        if (!scrollRAFQueued) {
            scrollRAFQueued = true;
            requestAnimationFrame(updateScrollAnimation);
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        requestAnimationFrame(updateScrollAnimation);
    }, { passive: true });

    updateScrollAnimation();
}

// ─── Preloader Logic ───
const preloader = document.getElementById('preloader');
const preloaderProgress = document.getElementById('preloader-progress');

if (preloader && preloaderProgress) {
    let progress = 0;
    // We want it to take ~2000ms. If we update every 40ms, that's 50 steps.
    // 100% / 50 steps = 2% per step.
    const interval = setInterval(() => {
        progress += 2;
        if (progress > 100) progress = 100;
        preloaderProgress.style.width = `${progress}%`;
        
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                preloader.classList.add('hidden');
                setTimeout(() => {
                    preloader.remove(); // Remove from DOM after fade out
                }, 800);
            }, 200); // slight pause at 100% before fading out
        }
    }, 36); // 36ms * 50 steps = 1800ms + 200ms pause = 2000ms total
}

// ─── Scroll Progress Bar ───
const scrollProgressBar = document.getElementById('scroll-progress-bar');

if (scrollProgressBar) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgressBar.style.width = `${scrollPercent}%`;
    }, { passive: true });
}

// ─── Custom Interactive Cursor ───
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

if (cursorDot && cursorOutline) {
    // Only enable on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
        let cursorX = window.innerWidth / 2;
        let cursorY = window.innerHeight / 2;
        let outlineX = cursorX;
        let outlineY = cursorY;

        // Mouse move
        window.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            
            // Dot follows instantly
            cursorDot.style.transform = `translate(calc(-50% + ${cursorX}px), calc(-50% + ${cursorY}px))`;
        }, { passive: true });

        // Outline follows with easing (LERP)
        const animateCursor = () => {
            const dx = cursorX - outlineX;
            const dy = cursorY - outlineY;
            
            outlineX += dx * 0.15;
            outlineY += dy * 0.15;
            
            cursorOutline.style.transform = `translate(calc(-50% + ${outlineX}px), calc(-50% + ${outlineY}px))`;
            
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Hover effects on interactable elements
        const interactables = document.querySelectorAll('a, button, .portfolio-card');
        
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    } else {
        // Hide on touch devices
        cursorDot.style.display = 'none';
        cursorOutline.style.display = 'none';
    }
}

// ─── Text Reveal ───
const revealTexts = document.querySelectorAll('.reveal-text');

revealTexts.forEach(el => {
    observer.observe(el);
});

// ─── Magnetic Buttons ───
const magneticBtns = document.querySelectorAll('.magnetic-btn');

magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // The pull factor (lower is weaker)
        const pull = 0.3;
        btn.style.transform = `translate(${x * pull}px, ${y * pull}px)`;
        btn.style.transition = 'none'; // Snap instantly to mouse
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0px, 0px)`;
        btn.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Spring back
    });
});

// ─── Image Parallax ───
const parallaxImages = document.querySelectorAll('.parallax-img');

if (parallaxImages.length > 0) {
    let parallaxQueued = false;
    
    const updateParallax = () => {
        const windowHeight = window.innerHeight;
        
        parallaxImages.forEach(img => {
            const container = img.parentElement;
            const rect = container.getBoundingClientRect();
            
            // Check if in viewport
            if (rect.top < windowHeight && rect.bottom > 0) {
                // Progress from 0 (just entered bottom) to 1 (just left top)
                const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
                // Translate Y from -10% to +10% based on progress
                const yPercent = (progress - 0.5) * 20; 
                img.style.transform = `translateY(${yPercent}%)`;
            }
        });
        parallaxQueued = false;
    };

    window.addEventListener('scroll', () => {
        if (!parallaxQueued) {
            parallaxQueued = true;
            requestAnimationFrame(updateParallax);
        }
    }, { passive: true });
}

// ─── Project Modals ───
const projectData = {
    fintech: {
        title: "Fintech Platform",
        subtitle: "UI/UX & WebGL Dashboard",
        img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        role: "Lead Frontend Developer",
        tech: "React, WebGL, TailwindCSS",
        desc: "A high-performance financial dashboard featuring real-time data visualization through custom WebGL shaders. The interface was designed to handle thousands of data points without dropping frames, offering users an unparalleled analytical experience."
    },
    ecommerce: {
        title: "E-Commerce 3D",
        subtitle: "Interactive Product Configurator",
        img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
        role: "Creative Developer",
        tech: "Three.js, Next.js, GSAP",
        desc: "An immersive e-commerce experience allowing users to configure and rotate products in full 3D space before purchasing. This project increased user engagement time by 300% and significantly boosted conversion rates for premium items."
    },
    agency: {
        title: "Creative Agency",
        subtitle: "Award-winning Awwwards Website",
        img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
        role: "UI/UX Designer & Engineer",
        tech: "Vanilla JS, WebGL, Lenis Scroll",
        desc: "A flagship portfolio website for a top-tier creative agency. Featuring seamless page transitions, kinetic typography, and fluid webGL distortion effects that won Site of the Day on Awwwards and FWA."
    }
};

const projectModal = document.getElementById('project-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const portfolioCards = document.querySelectorAll('.portfolio-card');

if (projectModal && portfolioCards.length > 0) {
    const titleEl = document.getElementById('modal-title');
    const subtitleEl = document.getElementById('modal-subtitle');
    const imgEl = document.getElementById('modal-img');
    const roleEl = document.getElementById('modal-role');
    const techEl = document.getElementById('modal-tech');
    const descEl = document.getElementById('modal-desc');

    const openModal = (projectKey) => {
        const data = projectData[projectKey];
        if (!data) return;

        titleEl.textContent = data.title;
        subtitleEl.textContent = data.subtitle;
        imgEl.src = data.img;
        roleEl.textContent = data.role;
        techEl.textContent = data.tech;
        descEl.textContent = data.desc;

        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeModal = () => {
        projectModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    portfolioCards.forEach(card => {
        // Change cursor to pointer for cards
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', () => {
            const projectKey = card.getAttribute('data-project');
            openModal(projectKey);
        });
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
}
