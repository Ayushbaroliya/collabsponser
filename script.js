/**
 * CollabSponser | Fast & Responsive Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initThemeToggle();
  initVideo();
  initDynamicData();
  initHamburger();
  initScrollReveal();
  initScrollProgress();
  initCountUp();
});

// ── DYNAMIC DATA & WHATSAPP ───────────────────────
function initDynamicData() {
  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      const waNumber = data.whatsapp.phoneNumber;
      const baseMsg = data.whatsapp.baseMessage;

      // Update all "Learn more" buttons in services
      document.querySelectorAll('.service-link').forEach(link => {
        const card = link.closest('.service-card');
        const title = card ? card.querySelector('.service-title').innerText : 'your services';
        link.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(baseMsg + "'" + title + "'.")}`;
        link.target = '_blank';
      });

      // Update CTA Banner button
      const ctaBanner = document.querySelector('#cta-banner .hero-cta');
      if (ctaBanner) {
        ctaBanner.href = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hello CollabSponser, I'm ready to build something extraordinary!")}`;
      }

      // Update all WhatsApp links
      const waLinks = document.querySelectorAll('a[href*="wa.me"], .whatsapp-sticky');
      waLinks.forEach(link => {
        const isSticky = link.classList.contains('whatsapp-sticky');
        const text = isSticky ? "Hi CollabSponser! I have a general inquiry." : "Hello CollabSponser!";
        link.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
        link.target = '_blank';
      });

      // Update Social Media Links
      if (data.socialMedia) {
        Object.entries(data.socialMedia).forEach(([platform, url]) => {
          const socialBtns = document.querySelectorAll(`.social-btn[aria-label="${platform}"]`);
          socialBtns.forEach(btn => {
            btn.href = url;
            btn.target = '_blank';
          });
        });
      }
    })
    .catch(err => console.warn('Could not load data.json. Note: This feature requires a local server (e.g. Live Server) due to CORS:', err));
}

// ── THEME TOGGLE ──────────────────────────────────
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  if (!btn) return;

  // Check saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  localStorage.setItem('theme', savedTheme);

  btn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Dispatch event to update Three.js color
    window.dispatchEvent(new Event('themeChanged'));
  });
}

// ── PRELOADER + GHOST INIT ────────────────────────
function initPreloader() {
  const preloaderEl = document.getElementById('preloader');
  const heroText    = document.getElementById('hero-text-content');
  const progressBar = document.getElementById('progress-bar');

  let step = 0;
  const totalSteps = 5;

  function updateProgress(s) {
    step = Math.min(s, totalSteps);
    if (progressBar) progressBar.style.width = ((step / totalSteps) * 100) + '%';
  }

  function completePreloader(canvas) {
    updateProgress(totalSteps);
    setTimeout(() => {
      if (preloaderEl) preloaderEl.classList.add('fade-out');
      if (heroText)    heroText.classList.add('visible');
      if (canvas) {
        canvas.style.transition = 'opacity 2s ease-in';
        canvas.style.opacity    = '1';
      }
      setTimeout(() => {
        if (preloaderEl) preloaderEl.style.display = 'none';
      }, 800);
    }, 800);
  }

  updateProgress(1);
  
  // Simulated loading steps for preloader
  let progress = 1;
  const interval = setInterval(() => {
    progress++;
    updateProgress(progress);
    if (progress >= 5) {
      clearInterval(interval);
      completePreloader();
    }
  }, 300);
}

// ── VIDEO INITIALIZER ──
function initVideo() {
  const video = document.getElementById('hero-video');
  if (!video) return;

  const playVideo = () => {
    video.play().catch(err => {
      console.log("Autoplay prevented. Waiting for interaction.");
    });
  };

  // Try to play immediately
  playVideo();

  // Force play on first interaction (fix for "rendering issue")
  const forcePlay = () => {
    playVideo();
    document.removeEventListener('click', forcePlay);
    document.removeEventListener('scroll', forcePlay);
  };
  document.addEventListener('click', forcePlay);
  document.addEventListener('scroll', forcePlay);
}

// ── HAMBURGER ─────────────────────────────────────
function initHamburger() {
  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('nav-menu');
  if (!ham || !menu) return;
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    menu.classList.toggle('open');
  });
  document.querySelectorAll('.nav-menu a').forEach(a =>
    a.addEventListener('click', () => {
      ham.classList.remove('open');
      menu.classList.remove('open');
    })
  );
}

// ── SCROLL REVEAL ─────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 }); // lower threshold for speed
  els.forEach(el => obs.observe(el));
}

// ── COUNT-UP ──────────────────────────────────────
function initCountUp() {
  function countUp(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2000, step = 30; // faster
    const increment = target / (duration / step);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.round(current) + (target > 100 ? '+' : '');
    }, step);
  }
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-target]').forEach(countUp);
        statObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('#stats').forEach(s => statObs.observe(s));
}

// ── SCROLL PROGRESS & ACTIVE TABS ─────────────────
function initScrollProgress() {
  const scrollProgress = document.getElementById('scroll-progress');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-desktop a, .nav-menu a');

  window.addEventListener('scroll', () => {
    if (scrollProgress) {
      const scrollTotal = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      scrollProgress.style.width = `${(scrollTotal / height) * 100}%`;
    }

    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

