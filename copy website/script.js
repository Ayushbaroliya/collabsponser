document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initPreloader();
  initThemeToggle();
  initScrollTracker();
  initMagneticButtons();
});

// ── LENIS SMOOTH SCROLL ──────────────────────────
let lenis;
function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

// ── SCROLL TRACKER ────────────────────────────────
function initScrollTracker() {
  const progress = document.querySelector('.scroll-progress');
  const percentage = document.querySelector('.scroll-percentage');
  const nav = document.getElementById('main-nav');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressVal = (window.scrollY / totalHeight) * 100;
    
    if (progress) progress.style.height = progressVal + '%';
    if (percentage) percentage.textContent = Math.round(progressVal) + '%';
    
    // Nav reveal logic
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

// ── MAGNETIC BUTTONS ──────────────────────────────
function initMagneticButtons() {
  const btns = document.querySelectorAll('.hero-cta, .pricing-btn, .social-btn, .theme-btn');
  
  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      
      gsap.to(btn, {
        x: distanceX * 0.4,
        y: distanceY * 0.4,
        duration: 0.2,
        ease: "power2.out",
        overwrite: true
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
        overwrite: true
      });
    });
  });
}

// ── THEME TOGGLE ──────────────────────────────────
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  if (!btn) return;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  btn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Add a quick transition effect
    gsap.to('body', {
      opacity: 0.8,
      duration: 0.2,
      onComplete: () => {
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        gsap.to('body', { opacity: 1, duration: 0.2 });
      }
    });
  });
}

// ── PRELOADER ─────────────────────────────────────
function initPreloader() {
  const preloaderEl = document.getElementById('preloader');
  const progressBar = document.getElementById('progress-bar');

  let progress = 0;
  if (lenis) lenis.stop();

  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      completePreloader();
    }
    if (progressBar) progressBar.style.width = progress + '%';
  }, 100);

  function completePreloader() {
    if (lenis) lenis.start();
    setTimeout(() => {
      const tl = gsap.timeline();
      
      tl.to(preloaderEl, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          preloaderEl.style.display = 'none';
        }
      });

      // Hero Entrance
      tl.from("#main-nav", { y: -100, opacity: 0, duration: 1, ease: "power4.out" }, "-=0.4")
        .from(".hero-eyebrow", { y: 30, opacity: 0, duration: 0.8 }, "-=0.4")
        .from(".hero-title", { y: 50, opacity: 0, duration: 1, skewY: 5 }, "-=0.6")
        .from(".hero-sub", { y: 30, opacity: 0, duration: 0.8 }, "-=0.8")
        .from(".hero-cta-group", { y: 30, opacity: 0, duration: 0.8, scale: 0.9 }, "-=0.6");

      initScrollAnimations();
    }, 400);
  }
}

// ── SCROLL ANIMATIONS ─────────────────────────────
function initScrollAnimations() {
  // Reveal sections
  gsap.utils.toArray('section').forEach(section => {
    gsap.from(section.querySelectorAll('.section-title, .section-sub, .section-eyebrow'), {
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none none"
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    });
  });

  // Stagger grid items
  const grids = ['.stats-grid', '.works-grid', '.services-grid', '.programs-grid', '.pricing-grid'];
  grids.forEach(grid => {
    gsap.from(document.querySelectorAll(`${grid} > *`), {
      scrollTrigger: {
        trigger: grid,
        start: "top 85%"
      },
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power4.out"
    });
  });

  initCountUp();
  initHamburger();
}

// ── HAMBURGER ─────────────────────────────────────
function initHamburger() {
  const ham = document.getElementById('hamburger');
  const menu = document.getElementById('nav-menu');
  if (!ham || !menu) return;
  
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    menu.classList.toggle('open');
    
    if (menu.classList.contains('open')) {
      gsap.from(menu.querySelectorAll('a'), {
        x: -20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.4
      });
    }
  });
}

// ── COUNT-UP ──────────────────────────────────────
function initCountUp() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      onEnter: () => {
        let current = 0;
        const duration = 2;
        gsap.to({ val: 0 }, {
          val: target,
          duration: duration,
          ease: "power1.out",
          onUpdate: function() {
            el.textContent = Math.round(this.targets()[0].val) + (target > 100 ? '+' : '');
          }
        });
      }
    });
  });
}



