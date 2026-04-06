/* ══════════════════════════════════════════════════════
   MAIN.JS — Night world helpers (light portfolio version)
   Keeps: loader guard, night cursor, scroll reveals
   Removed: boot HUD, matrix rain, security canvas, profile modal, terminal
   ══════════════════════════════════════════════════════ */

// ── LOADER ────────────────────────────────────────────────
(function () {
  'use strict';
  const loader = document.getElementById('sphere-loader');
  if (!loader) return;
  document.body.classList.add('loading');

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.style.transition = 'opacity 0.6s ease';
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
        document.body.classList.remove('loading');
      }, 700);
    }, 800);
  });

  document.body.style.overflow = 'hidden';
})();

// ── CUSTOM CURSOR (night world) ───────────────────────────
(function () {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  let dx = -200, dy = -200, rx = -200, ry = -200;

  // ── State colours ──────────────────────────────────────
  const C_DEFAULT = '#06B6D4';
  const C_HOVER   = '#A855F7';

  function setCursorState(state) {
    if (state === 'hover') {
      dot.style.background    = C_HOVER;
      dot.style.boxShadow     = `0 0 8px ${C_HOVER}, 0 0 20px ${C_HOVER}44`;
      ring.style.borderColor  = `${C_HOVER}99`;
      ring.style.width        = '38px';
      ring.style.height       = '38px';
      ring.style.borderWidth  = '1.5px';
    } else {
      dot.style.background    = C_DEFAULT;
      dot.style.boxShadow     = `0 0 6px ${C_DEFAULT}`;
      ring.style.borderColor  = 'rgba(6,182,212,0.4)';
      ring.style.width        = '28px';
      ring.style.height       = '28px';
      ring.style.borderWidth  = '1px';
    }
  }

  document.addEventListener('mousedown', () => {
    dot.style.background  = '#fff';
    dot.style.boxShadow   = '0 0 12px #fff, 0 0 30px #06B6D4';
    ring.style.transform  = 'translate(-50%,-50%) scale(1.6)';
    ring.style.opacity    = '0.4';
  });
  document.addEventListener('mouseup', () => {
    ring.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.opacity   = '1';
    setCursorState('default');
  });

  document.addEventListener('mouseover', e => {
    const t = e.target.closest('a, button, [role="button"], .qn-proj-card, .qn-contact-card, .qn-skill-item, .qn-nav-cta, label[for]');
    if (t) setCursorState('hover');
    else   setCursorState('default');
  });

  document.addEventListener('mousemove', e => {
    dx = e.clientX; dy = e.clientY;
    dot.style.left = dx + 'px'; dot.style.top = dy + 'px';
  });
  (function loop() {
    rx += (dx - rx) * 0.1; ry += (dy - ry) * 0.1;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();

  setCursorState('default');
})();

// ── NAV ───────────────────────────────────────────────────
(function () {
  const nav = document.querySelector('.qn-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });
})();

// ── SCROLL REVEAL ─────────────────────────────────────────
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const d = parseInt(e.target.dataset.delay || 0, 10);
        setTimeout(() => e.target.classList.add('visible'), d);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();

// ── SMOOTH ANCHOR SCROLL ──────────────────────────────────
(function () {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();

// ── STUBS — keep inception-main.js happy ─────────────────
window.__nightBootMain   = function () {
  // Re-observe all reveal elements on each Arise
  const els = document.querySelectorAll('#world-night .reveal');
  els.forEach(el => {
    el.classList.remove('visible');
  });
  // Re-trigger observations after a frame
  requestAnimationFrame(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const d = parseInt(e.target.dataset.delay || 0, 10);
          setTimeout(() => e.target.classList.add('visible'), d);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  });

  // Show avatar
  if (window.__showHoloAvatar) window.__showHoloAvatar();
};

window.__resetProfileOpen = function () {};
