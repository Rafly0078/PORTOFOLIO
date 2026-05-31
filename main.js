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
