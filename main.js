const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const runInAnimationFrame = (callback) => {
    let queued = false;

    return () => {
        if (queued) return;
        queued = true;

        requestAnimationFrame(() => {
            queued = false;
            callback();
        });
    };
};

const scrollUpdaters = [];
const resizeUpdaters = [];

const setSvgImageHref = (element, href) => {
    element.setAttribute('href', href);
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
};

const smootherstep = (value) => {
    const x = Math.max(0, Math.min(1, value));
    return x * x * x * (x * (x * 6 - 15) + 10);
};

function initLiquidGlassMaps() {
    const displacementMap = document.getElementById('liquid-glass-displacement-map');
    const specularMap = document.getElementById('liquid-glass-specular-map');

    if (!displacementMap || !specularMap) return;

    const size = 512;
    const bezelWidth = 0.34;
    const displacementCanvas = document.createElement('canvas');
    const specularCanvas = document.createElement('canvas');
    const displacementContext = displacementCanvas.getContext('2d');
    const specularContext = specularCanvas.getContext('2d');

    if (!displacementContext || !specularContext) return;

    displacementCanvas.width = size;
    displacementCanvas.height = size;
    specularCanvas.width = size;
    specularCanvas.height = size;

    const displacementImage = displacementContext.createImageData(size, size);
    const specularImage = specularContext.createImageData(size, size);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const u = x / (size - 1);
            const v = y / (size - 1);
            const left = u;
            const right = 1 - u;
            const top = v;
            const bottom = 1 - v;
            const edgeX = Math.min(left, right);
            const edgeY = Math.min(top, bottom);
            const signX = left < right ? -1 : 1;
            const signY = top < bottom ? -1 : 1;
            const distanceX = Math.max(0, 1 - edgeX / bezelWidth);
            const distanceY = Math.max(0, 1 - edgeY / bezelWidth);
            const edgeBias = Math.max(distanceX, distanceY);
            const weightX = smootherstep(distanceX);
            const weightY = smootherstep(distanceY);
            const strength = Math.pow(smootherstep(edgeBias), 0.8);
            const vectorLength = Math.hypot(weightX, weightY) || 1;
            const normalX = signX * weightX / vectorLength;
            const normalY = signY * weightY / vectorLength;
            const innerRelax = Math.pow(Math.max(0, 1 - Math.abs(edgeBias - 0.38) / 0.32), 2) * 0.22;
            const bend = Math.max(0, strength * 0.95 - innerRelax);
            const offset = (y * size + x) * 4;
            const red = 128 + normalX * bend * 112;
            const green = 128 + normalY * bend * 112;
            const topRim = Math.max(0, -(normalX * 0.2 + normalY * 0.98)) * Math.pow(strength, 0.9);
            const sideRim = Math.max(0, Math.abs(normalX) * 0.34 - Math.abs(normalY) * 0.06) * Math.pow(strength, 1.8);
            const bevelLine = Math.pow(Math.max(0, 1 - Math.abs(edgeBias - 0.96) / 0.08), 2) * 0.45;
            const alpha = Math.min(230, (topRim * 0.78 + sideRim + bevelLine) * 210);

            displacementImage.data[offset] = Math.max(0, Math.min(255, red));
            displacementImage.data[offset + 1] = Math.max(0, Math.min(255, green));
            displacementImage.data[offset + 2] = 128;
            displacementImage.data[offset + 3] = 255;

            specularImage.data[offset] = 255;
            specularImage.data[offset + 1] = 255;
            specularImage.data[offset + 2] = 255;
            specularImage.data[offset + 3] = alpha;
        }
    }

    displacementContext.putImageData(displacementImage, 0, 0);
    specularContext.putImageData(specularImage, 0, 0);
    setSvgImageHref(displacementMap, displacementCanvas.toDataURL('image/png'));
    setSvgImageHref(specularMap, specularCanvas.toDataURL('image/png'));
}

initLiquidGlassMaps();

// Scroll-triggered reveal animations
const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 })
    : null;

document.querySelectorAll('.fade-in-up, .fade-in, .reveal-text').forEach(el => {
    if (revealObserver) {
        revealObserver.observe(el);
    } else {
        el.classList.add('visible');
    }
});

// Mobile menu
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

if (mobileMenuBtn && mobileMenu && mobileMenuOverlay) {
    const setMenuOpen = (isOpen) => {
        mobileMenu.classList.toggle('open', isOpen);
        mobileMenuBtn.classList.toggle('open', isOpen);
        mobileMenuOverlay.classList.toggle('open', isOpen);
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        mobileMenuOverlay.setAttribute('aria-hidden', String(!isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    mobileMenuBtn.addEventListener('click', () => {
        setMenuOpen(!mobileMenu.classList.contains('open'));
    });

    mobileMenuOverlay.addEventListener('click', () => setMenuOpen(false));

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
            setMenuOpen(false);
        }
    });
}

// Navbar hide/show on scroll
const navbar = document.getElementById('navbar');
let lastScrollY = window.scrollY;

if (navbar) {
    scrollUpdaters.push(() => {
        const currentScrollY = window.scrollY;
        navbar.classList.toggle('navbar-hidden', currentScrollY > lastScrollY && currentScrollY > 100);
        lastScrollY = currentScrollY;
    });
}

// Interactive hero glow
const mouseGlow = document.getElementById('mouse-glow');
const uniGlow = document.getElementById('uni-glow');

if (!prefersReducedMotion && mouseGlow && uniGlow && finePointer) {
    let mouseX = 0.5;
    let mouseY = 0.5;

    const updateGlow = runInAnimationFrame(() => {
        const glowX = (mouseX - 0.5) * 40;
        const glowY = (mouseY - 0.5) * 40;
        const uniX = (mouseX - 0.5) * -15;
        const uniY = (mouseY - 0.5) * -15;

        mouseGlow.style.transform = `translate(calc(-50% + ${glowX}vw), calc(-50% + ${glowY}vh))`;
        uniGlow.style.transform = `translate(calc(-50% + ${uniX}px), calc(-50% + ${uniY}px))`;
    });

    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX / window.innerWidth;
        mouseY = event.clientY / window.innerHeight;
        updateGlow();
    }, { passive: true });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (event) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        }
    });
});

function initDottedSurface() {
    const container = document.getElementById('dotted-surface');
    const heroSection = document.getElementById('home');

    if (!container || prefersReducedMotion) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: true });

    if (!context) return;

    container.appendChild(canvas);

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frameId = 0;
    let time = 0;
    let isVisible = true;

    const resize = () => {
        width = container.clientWidth || window.innerWidth;
        height = container.clientHeight || window.innerHeight;
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = () => {
        const isMobile = window.innerWidth <= 768;
        const columns = isMobile ? 22 : 46;
        const rows = isMobile ? 28 : 48;
        const amplitude = isMobile ? 12 : 22;
        const baseSize = isMobile ? 1.3 : 1.7;
        const startY = height * 0.27;
        const depthHeight = height * 0.64;

        context.clearRect(0, 0, width, height);

        for (let row = 0; row < rows; row++) {
            const depth = row / Math.max(rows - 1, 1);
            const perspective = 0.35 + depth * 1.25;
            const alpha = 0.12 + depth * 0.5;
            const yBase = startY + depth * depthHeight;
            const yWave = Math.sin(row * 0.55 + time) * amplitude * perspective;
            const rowOffset = Math.sin(time * 0.45 + row * 0.2) * 16 * depth;
            const dotSize = baseSize * perspective;

            context.fillStyle = `rgba(180, 205, 255, ${alpha})`;

            for (let column = 0; column < columns; column++) {
                const xDepthOffset = (column / Math.max(columns - 1, 1) - 0.5) * width * depth * 0.22;
                const x = (column / Math.max(columns - 1, 1)) * width + rowOffset + xDepthOffset;
                const y = yBase + yWave + Math.sin(column * 0.42 + time * 0.8) * amplitude * 0.35 * depth;

                context.fillRect(x, y, dotSize, dotSize);
            }
        }
    };

    const stop = () => {
        if (frameId) {
            cancelAnimationFrame(frameId);
            frameId = 0;
        }
    };

    const tick = () => {
        if (!isVisible || document.hidden) {
            frameId = 0;
            return;
        }

        draw();
        time += 0.075;
        frameId = requestAnimationFrame(tick);
    };

    const start = () => {
        if (!frameId && isVisible && !document.hidden) {
            frameId = requestAnimationFrame(tick);
        }
    };

    resize();
    draw();
    start();

    resizeUpdaters.push(() => {
        resize();
        draw();
    });

    if ('ResizeObserver' in window) {
        new ResizeObserver(() => {
            resize();
            draw();
        }).observe(container);
    }

    if (heroSection && 'IntersectionObserver' in window) {
        const visibilityObserver = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
            if (isVisible) {
                start();
            } else {
                stop();
            }
        }, { threshold: 0 });

        visibilityObserver.observe(heroSection);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    });
}

initDottedSurface();

// Container scroll animation for Expertise
const scrollContainer = document.getElementById('scroll-container');
const scrollHeader = document.getElementById('scroll-header');
const scrollCard = document.getElementById('scroll-card');

if (!prefersReducedMotion && scrollContainer && scrollHeader && scrollCard) {
    const updateScrollAnimation = () => {
        const rect = scrollContainer.getBoundingClientRect();
        const containerHeight = rect.height;
        const windowHeight = window.innerHeight;
        const rawProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + containerHeight)));
        const progress = Math.min(rawProgress / 0.5, 1);
        const isMobile = window.innerWidth <= 768;

        scrollHeader.style.transform = `translateY(${progress * -100}px)`;
        scrollCard.style.transform = `rotateX(${45 - progress * 45}deg) scale(${isMobile ? 0.7 + progress * 0.2 : 1.05 - progress * 0.05})`;
    };

    scrollUpdaters.push(updateScrollAnimation);
    resizeUpdaters.push(updateScrollAnimation);
    updateScrollAnimation();
}

// Scroll progress bar
const scrollProgressBar = document.getElementById('scroll-progress-bar');

if (scrollProgressBar) {
    const updateScrollProgress = () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
        scrollProgressBar.style.transform = `scaleX(${scrollPercent})`;
    };

    scrollUpdaters.push(updateScrollProgress);
    resizeUpdaters.push(updateScrollProgress);
    updateScrollProgress();
}

// Magnetic buttons
const magneticBtns = document.querySelectorAll('.magnetic-btn');

if (!prefersReducedMotion && finePointer && magneticBtns.length > 0) {
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (event) => {
            const rect = btn.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            btn.style.transition = 'none';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            btn.style.transition = 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
    });
}

// Image parallax
const parallaxImages = document.querySelectorAll('.parallax-img');

if (!prefersReducedMotion && parallaxImages.length > 0) {
    const updateParallax = () => {
        const windowHeight = window.innerHeight;

        parallaxImages.forEach(img => {
            const container = img.parentElement;
            if (!container) return;

            const rect = container.getBoundingClientRect();

            if (rect.top < windowHeight && rect.bottom > 0) {
                const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
                img.style.transform = `translateY(${(progress - 0.5) * 20}%)`;
            }
        });
    };

    scrollUpdaters.push(updateParallax);
    resizeUpdaters.push(updateParallax);
    updateParallax();
}

// Project modals
const projectData = {
    fintech: {
        title: 'Fintech Platform',
        subtitle: 'UI/UX & WebGL Dashboard',
        img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        role: 'Lead Frontend Developer',
        tech: 'React, WebGL, TailwindCSS',
        desc: 'A high-performance financial dashboard featuring real-time data visualization through custom WebGL shaders. The interface was designed to handle thousands of data points without dropping frames, offering users an unparalleled analytical experience.'
    },
    ecommerce: {
        title: 'E-Commerce 3D',
        subtitle: 'Interactive Product Configurator',
        img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        role: 'Creative Developer',
        tech: 'Three.js, Next.js, GSAP',
        desc: 'An immersive e-commerce experience allowing users to configure and rotate products in full 3D space before purchasing. This project increased user engagement time by 300% and significantly boosted conversion rates for premium items.'
    },
    agency: {
        title: 'Creative Agency',
        subtitle: 'Award-winning Awwwards Website',
        img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        role: 'UI/UX Designer & Engineer',
        tech: 'Vanilla JS, WebGL, Lenis Scroll',
        desc: 'A flagship portfolio website for a top-tier creative agency. Featuring seamless page transitions, kinetic typography, and fluid WebGL distortion effects that won Site of the Day on Awwwards and FWA.'
    }
};

const projectModal = document.getElementById('project-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const portfolioCards = document.querySelectorAll('.portfolio-card');

if (projectModal && modalOverlay && modalClose && portfolioCards.length > 0) {
    const titleEl = document.getElementById('modal-title');
    const subtitleEl = document.getElementById('modal-subtitle');
    const imgEl = document.getElementById('modal-img');
    const roleEl = document.getElementById('modal-role');
    const techEl = document.getElementById('modal-tech');
    const descEl = document.getElementById('modal-desc');
    let activeModalTrigger = null;

    const openModal = (projectKey, trigger) => {
        const data = projectData[projectKey];
        if (!data || !titleEl || !subtitleEl || !imgEl || !roleEl || !techEl || !descEl) return;

        activeModalTrigger = trigger || null;
        titleEl.textContent = data.title;
        subtitleEl.textContent = data.subtitle;
        imgEl.src = data.img;
        imgEl.alt = data.title;
        roleEl.textContent = data.role;
        techEl.textContent = data.tech;
        descEl.textContent = data.desc;

        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => modalClose.focus({ preventScroll: true }), 50);
    };

    const closeModal = () => {
        projectModal.classList.remove('active');
        document.body.style.overflow = '';
        activeModalTrigger?.focus({ preventScroll: true });
        activeModalTrigger = null;
    };

    portfolioCards.forEach(card => {
        const projectKey = card.getAttribute('data-project');

        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');

        card.addEventListener('click', () => openModal(projectKey, card));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openModal(projectKey, card);
            }
        });
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && projectModal.classList.contains('active')) {
            closeModal();
        }
    });
}

if (scrollUpdaters.length > 0) {
    const updateOnScroll = runInAnimationFrame(() => {
        scrollUpdaters.forEach(update => update());
    });

    window.addEventListener('scroll', updateOnScroll, { passive: true });
}

if (resizeUpdaters.length > 0) {
    const updateOnResize = runInAnimationFrame(() => {
        resizeUpdaters.forEach(update => update());
    });

    window.addEventListener('resize', updateOnResize, { passive: true });
}
