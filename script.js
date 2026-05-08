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
  initMetrics();
  initModal();
  initCardEffects();
});

// ── DYNAMIC DATA & WHATSAPP ───────────────────────
function initDynamicData() {
  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      const waNumber = data.whatsapp.phoneNumber;
      const baseMsg = data.whatsapp.baseMessage;

      // Update all "Enquire" buttons in services and programs
      document.querySelectorAll('.enquire-btn').forEach(link => {
        const card = link.closest('.service-card, .program-card');
        const title = card ? (card.querySelector('.service-title') || card.querySelector('.program-card-title')).innerText : 'your services';
        link.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(baseMsg + "'" + title + "'.")}`;
        link.target = '_blank';
      });

      // Update Modal WhatsApp link
      const modalWa = document.getElementById('modal-whatsapp');
      if (modalWa) {
        modalWa.href = `https://wa.me/${waNumber}`;
      }

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

// ── PRELOADER ─────────────────────────────────────
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

  function completePreloader() {
    updateProgress(totalSteps);
    setTimeout(() => {
      if (preloaderEl) preloaderEl.classList.add('fade-out');
      if (heroText)    heroText.classList.add('visible');
      setTimeout(() => {
        if (preloaderEl) preloaderEl.style.display = 'none';
      }, 800);
    }, 800);
  }

  updateProgress(1);
  
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

  playVideo();

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
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ── COUNT-UP & METRICS ─────────────────────────────
function initMetrics() {
  // Animate numbers
  function animateValue(obj, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // use ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = progress === 1 ? end : start + (end - start) * easeProgress;
      
      // Check if the number has a decimal point
      if (end % 1 !== 0) {
        obj.textContent = current.toFixed(1) + suffix;
      } else {
        obj.textContent = Math.round(current) + suffix;
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // Simple stats
        e.target.querySelectorAll('[data-target]:not(.radial-num):not(.bar-fill)').forEach(el => {
          const target = parseInt(el.dataset.target);
          if (!isNaN(target)) animateValue(el, 0, target, 2000, target > 100 ? '+' : '');
        });
        
        // Radial numbers
        e.target.querySelectorAll('.radial-num').forEach(el => {
          const target = parseFloat(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          if (!isNaN(target)) animateValue(el, 0, target, 2000, suffix);
        });

        // Bar fill numbers
        e.target.querySelectorAll('.bar-fill').forEach(el => {
          const target = parseFloat(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          if (!isNaN(target)) animateValue(el, 0, target, 2000, suffix);
          
          // Animate the bar width
          setTimeout(() => { el.classList.add('animated'); }, 200);
        });

        // Radial rings
        e.target.querySelectorAll('.radial-progress').forEach(circle => {
          var targetOffset = parseFloat(circle.getAttribute('data-offset'));
          circle.style.strokeDashoffset = '314'; // Reset to empty
          setTimeout(() => {
            circle.style.strokeDashoffset = targetOffset;
          }, 100);
        });

        statObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  
  document.querySelectorAll('#stats, #metrics').forEach(s => statObs.observe(s));
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

// ── MODAL HANDLING ────────────────────────────────
function initModal() {
  const modal = document.getElementById('details-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalWa = document.getElementById('modal-whatsapp');
  const closeBtn = document.querySelector('.modal-close');
  const closeBtnText = document.querySelector('.modal-close-btn');

  if (!modal) return;

  document.querySelectorAll('.learn-more-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const card = btn.closest('.service-card, .program-card');
      const title = (card.querySelector('.service-title') || card.querySelector('.program-card-title')).innerText;
      const details = card.getAttribute('data-details');
      
      modalTitle.innerText = title;
      modalDesc.innerText = details;
      
      // Update modal WhatsApp link with context
      fetch('data.json').then(res => res.json()).then(data => {
        modalWa.href = `https://wa.me/${data.whatsapp.phoneNumber}?text=${encodeURIComponent(data.whatsapp.baseMessage + "'" + title + "'.")}`;
      });

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      
      // Add a small animation to the card when loading the modal
      card.style.transform = 'scale(0.95)';
      setTimeout(() => { card.style.transform = ''; }, 200);
    });
  });

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeBtnText) closeBtnText.addEventListener('click', closeModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}
// ── CARD EFFECTS ──────────────────────────────────
function initCardEffects() {
  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}
