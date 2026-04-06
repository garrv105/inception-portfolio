/* ═══════════════════════════════════════════════════════════
   DAY-LIVE.JS — Interactive helpers for hungdesign-style page
   Clock, burger menu, scroll progress bar
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Live clock ──────────────────────────────────────────
  const clockEl = document.getElementById('al-clock');
  if (clockEl) {
    function updateClock() {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      const tz = Intl.DateTimeFormat('en', { timeZoneName: 'short' })
        .formatToParts(now)
        .find(p => p.type === 'timeZoneName')?.value || 'EST';
      clockEl.textContent = `${String(h).padStart(2, '0')}:${m} ${ampm} ${tz}`;
    }
    updateClock();
    setInterval(updateClock, 10000);
  }

  // ── Burger menu ─────────────────────────────────────────
  const burger  = document.getElementById('hd-burger');
  const overlay = document.getElementById('hd-menu-overlay');
  if (burger && overlay) {
    burger.addEventListener('click', () => {
      overlay.classList.toggle('hidden');
      document.body.style.overflow = overlay.classList.contains('hidden') ? '' : 'hidden';
    });
    overlay.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Scroll progress bar ─────────────────────────────────
  const fill = document.getElementById('hd-sp-fill');
  if (fill) {
    const feats = document.querySelectorAll('.hd-feat');
    if (feats.length) {
      const firstTop  = feats[0].offsetTop;
      const lastBot   = feats[feats.length - 1].offsetTop + feats[feats.length - 1].offsetHeight;
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + window.innerHeight / 2;
        const range   = lastBot - firstTop;
        const pct     = Math.max(0, Math.min(100, ((scrollY - firstTop) / range) * 100));
        fill.style.height = pct + '%';
      }, { passive: true });
    }
  }

  // ── Smooth anchor scroll ────────────────────────────────
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();
