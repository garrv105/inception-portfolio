/* ═══════════════════════════════════════════════════════════
   DAY-LIVE.JS — Live metrics, typing animation, feed ticker
   Called after revealDayWorld() via inception-main.js
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Typing animation ─────────────────────────────────────
  const PHRASES = [
    '> Initializing AI Defense Systems...',
    '> Analyzing 12,400 live endpoints...',
    '> 847 AI models secured this session...',
    '> Zero-day threats neutralized: 3...',
  ];
  let phraseIdx = 0, charIdx = 0, isDeleting = false;
  const TYPING_SPEED = 55, DELETE_SPEED = 28, PAUSE = 2200;

  function runTyping() {
    const el = document.getElementById('hero-typing');
    if (!el) return;
    const current = PHRASES[phraseIdx];

    if (!isDeleting) {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) {
        setTimeout(() => { isDeleting = true; runTyping(); }, PAUSE);
        return;
      }
      setTimeout(runTyping, TYPING_SPEED);
    } else {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
        setTimeout(runTyping, 400);
        return;
      }
      setTimeout(runTyping, DELETE_SPEED);
    }
  }

  // ── Count-up animation ───────────────────────────────────
  function animateCountUp(el, target, suffix = '', duration = 2000) {
    const isFloat = String(target).includes('.');
    const start = 0;
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      if (isFloat) {
        el.textContent = current.toFixed(2) + suffix;
      } else {
        el.textContent = Math.round(current).toLocaleString() + suffix;
      }
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── Stats count-up on view ───────────────────────────────
  function initStatCountUp() {
    const statsRow = document.querySelector('.day-hero-stats');
    if (!statsRow) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          document.querySelectorAll('[data-count]').forEach(el => {
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || '';
            animateCountUp(el, target, suffix, 1800);
          });
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(statsRow);
  }

  // ── Live threat counter ──────────────────────────────────
  // Note: th-threats is also updated by day.js globe flashResolve
  let neutralizedCount = 1247;

  function tickNeutralizedMain() {
    const neuEl = document.getElementById('th-neutralized');
    if (neuEl) {
      neutralizedCount++;
      neuEl.textContent = neutralizedCount.toLocaleString();
      neuEl.style.color = '#fff';
      setTimeout(() => { neuEl.style.color = ''; }, 300);
    }
    // Re-enqueue with jitter
    setTimeout(tickNeutralizedMain, 12000 + Math.random() * 8000);
  }

  // ── System status bar number tick ────────────────────────
  function tickStatusBar() {
    const modelEl = document.getElementById('sb-models');
    const endpointEl = document.getElementById('sb-endpoints');
    if (modelEl) {
      let v = parseInt(modelEl.textContent.replace(/,/g, '')) || 847;
      v += Math.floor(Math.random() * 3);
      modelEl.textContent = v.toLocaleString();
    }
    if (endpointEl) {
      let v = parseInt(endpointEl.textContent.replace(/,/g, '')) || 12400;
      v += Math.floor(Math.random() * 5) - 2;
      endpointEl.textContent = v.toLocaleString();
    }
    setTimeout(tickStatusBar, 4000 + Math.random() * 3000);
  }

  // ── Feed ticker ──────────────────────────────────────────
  const FEED_EVENTS = [
    '[10:23:41] Blocked: SQL injection from 45.33.xx.xx → US-EAST',
    '[10:23:38] Alert: Anomalous traffic Singapore → New York',
    '[10:23:35] Resolved: DDoS mitigation Layer 7 — Frankfurt node',
    '[10:23:32] Blocked: Brute force SSH from 91.22.xx.xx',
    '[10:23:29] AI Model #423 updated — threat signature refresh',
    '[10:23:26] Alert: Port scan detected 185.43.xx.xx → London DC',
    '[10:23:23] Resolved: Phishing domain quarantined — au-mel-01',
    '[10:23:20] Blocked: XSS attempt on endpoint /api/v2/auth',
    '[10:23:17] Alert: Lateral movement detected — isolating node',
    '[10:23:14] Secured: TLS 1.3 handshake upgraded — Mumbai relay',
    '[10:23:11] Blocked: Credential stuffing from 103.xx.xx.xx',
    '[10:23:08] AI Model #847 deployed — zero-day pattern match',
    '[10:23:05] Alert: DNS tunneling attempt — Beijing origin',
    '[10:23:02] Resolved: Ransomware payload intercepted pre-exec',
    '[10:22:59] Blocked: API abuse rate-limit triggered — 429',
    '[10:22:56] Secured: Post-quantum key exchange — Toronto node',
  ];

  function initFeedTicker() {
    const track = document.getElementById('feed-track');
    if (!track) return;
    // Fill double content for seamless loop
    let html = '';
    for (let i = 0; i < 3; i++) {
      FEED_EVENTS.forEach(ev => {
        html += `<span class="feed-item">${ev}</span>`;
      });
    }
    track.innerHTML = html;
  }

  // (neutralized counter merged into tickNeutralizedMain above)

  // ── REAL-TIME blinker ────────────────────────────────────
  function initRealtimeBlink() {
    const el = document.getElementById('sb-realtime');
    if (!el) return;
    setInterval(() => {
      el.style.opacity = el.style.opacity === '0.3' ? '1' : '0.3';
    }, 1200);
  }

  // ── Init everything ──────────────────────────────────────
  function init() {
    // Delay slightly to let DOM paint
    setTimeout(() => {
      runTyping();
      initStatCountUp();
      initFeedTicker();
      initRealtimeBlink();
      // Start live tickers after a few seconds
      setTimeout(tickNeutralizedMain, 8000);
      setTimeout(tickStatusBar, 5000);
    }, 300);
  }

  // Expose for inception-main.js
  window.DayLive = { init };

  // Auto-init on load if day world is visible
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
