/* ══════════════════════════════════════════════════════
   QUANTUM BRAIN — Main JS  v3
   Loader · Cursor · Nav · Profile reveal · Terminal
   ══════════════════════════════════════════════════════ */

// ── LOADER ────────────────────────────────────────────────
(function () {
  const loader = document.getElementById('loader');
  const bar    = document.getElementById('loader-bar');
  const msg    = document.getElementById('loader-msg');
  if (!loader) return;

  const msgs = [
    'INITIALIZING QUANTUM MATRIX',
    'CALIBRATING NEURAL NODES',
    'LOADING SECURITY PROTOCOLS',
    'DECRYPTING RESEARCH DATA',
    'QUANTUM COHERENCE ACHIEVED',
    'SYSTEM READY'
  ];
  let step = 0;

  const iv = setInterval(() => {
    step++;
    const pct = Math.min(step * 18, 100);
    if (bar) bar.style.width = pct + '%';
    if (msg && step < msgs.length) msg.textContent = msgs[step];
    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        loader.classList.add('gone');
        setTimeout(() => { loader.style.display = 'none'; }, 900);
        document.body.style.overflow = '';
      }, 400);
    }
  }, 320);

  document.body.style.overflow = 'hidden';
})();

// ── CUSTOM CURSOR ─────────────────────────────────────────
(function () {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  let dx = -200, dy = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    dx = e.clientX; dy = e.clientY;
    dot.style.left = dx + 'px'; dot.style.top = dy + 'px';
  });
  (function loop() {
    rx += (dx - rx) * 0.1; ry += (dy - ry) * 0.1;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
})();

// ── NAV ───────────────────────────────────────────────────
(function () {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('nav-burger');
  const links  = document.getElementById('nav-links');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.dataset.open === '1';
      links.dataset.open = open ? '0' : '1';
      if (open) {
        links.style.cssText = '';
      } else {
        links.style.cssText = 'display:flex;flex-direction:column;position:fixed;top:64px;left:0;right:0;background:rgba(2,2,15,.97);padding:2rem;gap:1.5rem;z-index:400;border-bottom:1px solid rgba(0,229,255,.1)';
      }
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => { links.style.cssText = ''; links.dataset.open = '0'; });
    });
  }

  // Active nav on scroll
  const sections = ['hero','research','projects','about','contact'];
  window.addEventListener('scroll', () => {
    let cur = 'hero';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) cur = id;
    });
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.dataset.section === cur);
    });
  }, { passive: true });
})();

// ── QUANTUM FIELD CANVAS (hero background) ───────────────
(function () {
  const canvas = document.getElementById('quantum-field-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Matrix-style quantum characters
  const chars = '01ψΩ∑∆⊗⊕≡Ψ∂∇αβγδ量子';
  const colW  = 18;
  let cols    = Math.floor(canvas.width / colW);
  const drops = Array.from({ length: cols }, () => Math.random() * canvas.height / colW);

  setInterval(() => {
    cols = Math.floor(canvas.width / colW);
    while (drops.length < cols) drops.push(0);

    ctx.fillStyle = 'rgba(2,2,15,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${colW - 2}px Space Mono, monospace`;

    for (let i = 0; i < cols; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * colW;
      const y = drops[i] * colW;
      const r = Math.random();
      if (r > 0.97)      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      else if (r > 0.65) ctx.fillStyle = 'rgba(0,229,255,0.25)';
      else               ctx.fillStyle = 'rgba(157,78,221,0.15)';
      ctx.fillText(char, x, y);
      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      else drops[i] += 0.35;
    }
  }, 45);
})();

// ── SECURITY CANVAS (matrix rain in about section) ───────
(function () {
  const canvas = document.getElementById('security-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || 600;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  const chars = '01アイウ∑∆ΩΨ∫∂∇⊗⊕';
  const colW  = 16;
  let cols    = Math.floor(canvas.width / colW);
  const drops = Array.from({ length: cols }, () => Math.random() * canvas.height / colW);
  setInterval(() => {
    cols = Math.floor(canvas.width / colW);
    while (drops.length < cols) drops.push(0);
    ctx.fillStyle = 'rgba(2,2,10,0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${colW - 2}px Space Mono, monospace`;
    for (let i = 0; i < cols; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const r = Math.random();
      if (r > 0.98)      ctx.fillStyle = '#ffffff';
      else if (r > 0.7)  ctx.fillStyle = 'rgba(0,229,255,0.35)';
      else               ctx.fillStyle = 'rgba(157,78,221,0.2)';
      ctx.fillText(char, i * colW, drops[i] * colW);
      if (drops[i] * colW > canvas.height && Math.random() > 0.975) drops[i] = 0;
      else drops[i] += 0.4;
    }
  }, 40);
})();

// ══════════════════════════════════════════════════════════
//  PROFILE OVERLAY REVEAL
// ══════════════════════════════════════════════════════════
(function () {
  const overlay  = document.getElementById('profile-overlay');
  const modal    = document.getElementById('profile-modal');
  const closeBtn = document.getElementById('profile-close');
  const heroEntry= document.getElementById('hero-entry');
  if (!overlay || !modal) return;

  let avatarStarted = false;

  // Avatar canvas — rotating qubit visualization
  function startAvatarCanvas() {
    if (avatarStarted) return;
    avatarStarted = true;
    const ac = document.getElementById('avatar-canvas');
    if (!ac) return;
    const ctx = ac.getContext('2d');
    const cx = ac.width / 2, cy = ac.height / 2;
    let t = 0;
    (function loop() {
      ctx.clearRect(0, 0, ac.width, ac.height);
      ctx.save();
      ctx.translate(cx, cy);

      // Draw rotating quantum probability rings
      for (let r = 0; r < 3; r++) {
        const radius = 30 + r * 20;
        const speed  = (r + 1) * 0.012 * (r % 2 === 0 ? 1 : -1);
        ctx.save();
        ctx.rotate(t * speed);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = r === 0 ? 'rgba(0,229,255,0.3)' : r === 1 ? 'rgba(157,78,221,0.25)' : 'rgba(0,255,136,0.2)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Bead on each ring
        const bx = radius;
        const by = 0;
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = r === 0 ? 'rgba(0,229,255,0.9)' : r === 1 ? 'rgba(157,78,221,0.9)' : 'rgba(0,255,136,0.9)';
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      t++;
      requestAnimationFrame(loop);
    })();
  }

  let profileIsOpen = false;

  function openProfile() {
    if (profileIsOpen) return; // already open
    profileIsOpen = true;
    overlay.classList.remove('hidden');
    overlay.classList.add('visible');
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
    startAvatarCanvas();
    setTimeout(animateSkillBars, 600);
    if (heroEntry) heroEntry.style.opacity = '0';
  }

  function closeProfile() {
    profileIsOpen = false;
    modal.classList.remove('active');
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.classList.remove('visible');
      // Restore "CLICK TO ACCESS PROFILE" prompt
      if (heroEntry) {
        heroEntry.style.opacity = '1';
        heroEntry.style.pointerEvents = 'none';
      }
    }, 400);
  }

  function animateSkillBars() {
    document.querySelectorAll('.pm-skill-bar div').forEach((bar, i) => {
      const target = bar.style.width;
      bar.style.width = '0';
      setTimeout(() => {
        bar.style.width = target;
      }, i * 80);
    });
  }

  // Expose for brain.js
  window.__triggerProfileReveal = openProfile;

  // Also: clicking hero canvas background (not nodes) = open profile
  const brainCanvas = document.getElementById('brain-canvas');
  if (brainCanvas) {
    brainCanvas.addEventListener('click', () => {
      // brain.js handles this and calls __triggerProfileReveal if needed
      // But also handle direct entry-point click
    });
  }

  // Close
  if (closeBtn) closeBtn.addEventListener('click', closeProfile);
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.classList.contains('profile-overlay-bg')) closeProfile();
  });

  // Explore button inside profile scrolls down + closes
  document.getElementById('profile-explore')?.addEventListener('click', e => {
    e.preventDefault();
    closeProfile();
    setTimeout(() => {
      document.getElementById('research')?.scrollIntoView({ behavior: 'smooth' });
    }, 450);
  });

  // Tab switching
  document.querySelectorAll('.pm-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pm-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.pm-tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('tab-' + tab.dataset.tab);
      if (target) {
        target.classList.add('active');
        // Re-animate skill bars if switching to skills tab
        if (tab.dataset.tab === 'skills') animateSkillBars();
      }
    });
  });

  // Keyboard ESC to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeProfile();
  });
})();

// ── BOOT SEQUENCE HUD ────────────────────────────────────
(function () {
  const hud = document.getElementById('boot-hud');
  if (!hud) return;

  const LINES = [
    [    0, 'QUANTUM NEURAL NETWORK v3.0',         '',    28 ],
    [  320, '================================',     'dim',  0 ],
    [  480, 'INITIALIZING QUBITS...',               '',    30 ],
    [ 1100, 'SUPERPOSITION STATE: ACTIVE',          'ok',  22 ],
    [ 1650, 'MAPPING NEURAL PATHWAYS...',           '',    26 ],
    [ 2400, 'ENTANGLEMENT MATRIX: STABLE',          'ok',  22 ],
    [ 2900, 'LOADING SECURITY PROTOCOLS...',        '',    24 ],
    [ 3600, 'THREAT DETECTION: ARMED',              'ok',  22 ],
    [ 4000, 'CALIBRATING QUANTUM INTERFERENCE...', '',    20 ],
    [ 4900, 'COHERENCE TIME: 847us',               'ok',  22 ],
    [ 5200, 'SYNCING AI NEURAL CLUSTERS...',        '',    24 ],
    [ 5900, 'ALL SYSTEMS NOMINAL',                  'ok',  22 ],
    [ 6300, '================================',     'dim',  0 ],
    [ 6500, 'SYSTEM ONLINE -- CLICK TO ACCESS',     'ok',  20 ],
  ];

  const MAX_VISIBLE = 7;
  const lineEls = [];

  function typeLine(el, text, speed, done) {
    if (speed === 0) {
      el.textContent = text;
      if (done) done();
      return;
    }
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'boot-cursor';
    el.appendChild(cursor);
    const iv = setInterval(() => {
      el.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      if (i >= text.length) {
        clearInterval(iv);
        cursor.remove();
        if (done) done();
      }
    }, speed);
  }

  function addLine(text, cls, speed) {
    const el = document.createElement('div');
    el.className = 'boot-hud-line' + (cls ? ' ' + cls : '');
    hud.appendChild(el);
    lineEls.push(el);
    // Fade out old lines when list gets long
    if (lineEls.length > MAX_VISIBLE) {
      lineEls.slice(0, lineEls.length - MAX_VISIBLE).forEach(old => {
        old.style.opacity = '0';
      });
    }
    requestAnimationFrame(() => {
      el.classList.add('visible');
      typeLine(el, text, speed);
    });
  }

  let bootStarted = false;

  function startBootSequence() {
    if (bootStarted) return;
    bootStarted = true;
    LINES.forEach(([delay, text, cls, speed]) => {
      setTimeout(() => addLine(text, cls, speed), delay);
    });
    // Fade out the whole HUD ~2s after last line finishes
    const last = LINES[LINES.length - 1];
    const fadeAt = last[0] + last[1].length * last[3] + 2000;
    setTimeout(() => {
      hud.style.transition = 'opacity 1.2s ease';
      hud.style.opacity = '0';
      setTimeout(() => { hud.style.display = 'none'; }, 1400);
    }, fadeAt);

    // Reveal holographic avatar after boot finishes
    setTimeout(() => {
      if (window.__showHoloAvatar) window.__showHoloAvatar();
    }, fadeAt - 800); // appear slightly before HUD fades out
  }

  const loader = document.getElementById('loader');
  if (!loader) { startBootSequence(); return; }
  const check = setInterval(() => {
    if (loader.classList.contains('gone') || loader.style.display === 'none') {
      clearInterval(check);
      setTimeout(startBootSequence, 250);
    }
  }, 100);
  // Fallback — only fires if interval hasn't already triggered
  setTimeout(() => { clearInterval(check); startBootSequence(); }, 2700);
})();

// ── SCROLL REVEAL ─────────────────────────────────────────
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || 0);
        setTimeout(() => {
          e.target.classList.add('visible');
          e.target.querySelectorAll('.snode-bar div').forEach(b => {
            const w = b.style.width; b.style.width = '0';
            setTimeout(() => { b.style.transition = 'width 1.4s cubic-bezier(0.16,1,0.3,1)'; b.style.width = w; }, 100);
          });
        }, delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => obs.observe(el));
})();

// ── Layer label reveal ────────────────────────────────────
(function () {
  const labels = document.querySelectorAll('.layer-label');
  if (!('IntersectionObserver' in window)) { labels.forEach(l => l.style.opacity = 1); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        e.target.style.opacity = '1';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  labels.forEach(l => obs.observe(l));
})();

// ── TERMINAL ──────────────────────────────────────────────
(function () {
  const sendBtn   = document.getElementById('terminal-send');
  const nameInput = document.getElementById('terminal-name');
  const msgInput  = document.getElementById('terminal-msg');
  const response  = document.getElementById('terminal-response');
  const body      = document.getElementById('terminal-body');
  if (!sendBtn) return;

  function addLine(prompt, text, cls = '') {
    const line = document.createElement('div');
    line.className = 't-line';
    line.innerHTML = `<span class="t-prompt">${prompt}</span> <span class="t-out ${cls}">${text}</span>`;
    if (body) body.appendChild(line);
    body?.scrollTo(0, body.scrollHeight);
  }

  function handleSend() {
    const name = nameInput?.value.trim() || 'anonymous';
    const msg  = msgInput?.value.trim();
    if (!msg) { addLine('system@quantum ~$', 'ERROR: message cannot be empty.', 'muted'); return; }

    addLine('visitor@quantum ~$', `initiate_contact --name="${name}" --message="${msg}"`);
    setTimeout(() => addLine('system@quantum ~$', '> Encrypting with post-quantum cipher...', 'muted'), 300);
    setTimeout(() => addLine('system@quantum ~$', '> Routing through secure channel...', 'muted'), 900);
    setTimeout(() => {
      addLine('system@quantum ~$', '✓ MESSAGE DELIVERED TO garrvsipani@gmail.com', 'cyan');
      if (response) {
        response.textContent = `> Message from "${name}" received. Garrv will respond shortly.`;
        response.classList.remove('hidden');
      }
      if (nameInput) nameInput.value = '';
      if (msgInput)  msgInput.value  = '';
    }, 1800);
  }

  sendBtn.addEventListener('click', handleSend);
  msgInput?.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
  nameInput?.addEventListener('keydown', e => { if (e.key === 'Enter') msgInput?.focus(); });
})();

// ── GSAP SCROLL ───────────────────────────────────────────
(function () {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.section-title').forEach(el => {
    gsap.fromTo(el, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  gsap.to('#brain-canvas', {
    y: -60, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('#quantum-field-canvas', {
    y: -40, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });
})();

// ── GLITCH EFFECT ─────────────────────────────────────────
(function () {
  const glitch = document.querySelector('.glitch');
  if (!glitch) return;
  const chars    = '01アイウエ∑∆ΩΨ∫∂◼◻▪▫';
  const original = glitch.dataset.text;

  function runGlitch() {
    let iter = 0;
    const iv = setInterval(() => {
      glitch.textContent = original.split('').map((c, i) => {
        if (i < iter) return original[i];
        if (c === ' ') return ' ';
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (iter >= original.length) { clearInterval(iv); glitch.textContent = original; }
      iter += 0.5;
    }, 45);
  }
  setTimeout(runGlitch, 1500);
  setInterval(runGlitch, 7000);
})();

// ── Night boot hook ────────────────────────────────────────
// Resets and restarts all main.js night-world systems:
// boot HUD, quantum field canvas, avatar, scroll reveals,
// terminal, profile overlay — everything that ran on first load
// but needs to fire again when Arise is triggered lazily.
window.__nightBootMain = function () {
  // 1. Boot HUD — reset and restart typewriter sequence
  (function () {
    const hud = document.getElementById('boot-hud');
    if (!hud) return;
    hud.innerHTML = ''; // clear old lines
    hud.style.opacity = '1';
    hud.style.display = '';
    // Re-run boot sequence from scratch
    const LINES = [
      [    0, 'QUANTUM NEURAL NETWORK v3.0',         '',    28 ],
      [  320, '================================',     'dim',  0 ],
      [  480, 'INITIALIZING QUBITS...',               '',    30 ],
      [ 1100, 'SUPERPOSITION STATE: ACTIVE',          'ok',  22 ],
      [ 1650, 'MAPPING NEURAL PATHWAYS...',           '',    26 ],
      [ 2400, 'ENTANGLEMENT MATRIX: STABLE',          'ok',  22 ],
      [ 2900, 'LOADING SECURITY PROTOCOLS...',        '',    24 ],
      [ 3600, 'THREAT DETECTION: ARMED',              'ok',  22 ],
      [ 4000, 'CALIBRATING QUANTUM INTERFERENCE...', '',    20 ],
      [ 4900, 'COHERENCE TIME: 847us',               'ok',  22 ],
      [ 5200, 'SYNCING AI NEURAL CLUSTERS...',        '',    24 ],
      [ 5900, 'ALL SYSTEMS NOMINAL',                  'ok',  22 ],
      [ 6300, '================================',     'dim',  0 ],
      [ 6500, 'SYSTEM ONLINE -- CLICK TO ACCESS',     'ok',  20 ],
    ];
    const MAX_VISIBLE = 7;
    const lineEls = [];

    function typeLine(el, text, speed, done) {
      if (speed === 0) { el.textContent = text; if (done) done(); return; }
      let i = 0;
      const cursor = document.createElement('span');
      cursor.className = 'boot-cursor';
      el.appendChild(cursor);
      const iv = setInterval(() => {
        el.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
        if (i >= text.length) { clearInterval(iv); cursor.remove(); if (done) done(); }
      }, speed);
    }

    function addLine(text, cls, speed) {
      const el = document.createElement('div');
      el.className = 'boot-hud-line' + (cls ? ' ' + cls : '');
      hud.appendChild(el);
      lineEls.push(el);
      if (lineEls.length > MAX_VISIBLE) {
        lineEls.slice(0, lineEls.length - MAX_VISIBLE).forEach(old => { old.style.opacity = '0'; });
      }
      requestAnimationFrame(() => { el.classList.add('visible'); typeLine(el, text, speed); });
    }

    LINES.forEach(([delay, text, cls, speed]) => {
      setTimeout(() => addLine(text, cls, speed), delay);
    });

    const last = LINES[LINES.length - 1];
    const fadeAt = last[0] + last[1].length * last[3] + 2000;
    setTimeout(() => {
      hud.style.transition = 'opacity 1.2s ease';
      hud.style.opacity = '0';
      setTimeout(() => { hud.style.display = 'none'; }, 1400);
    }, fadeAt);

    // Reveal avatar after boot
    setTimeout(() => {
      if (window.__showHoloAvatar) window.__showHoloAvatar();
    }, fadeAt - 800);
  })();

  // 2. Quantum field canvas — restart
  (function () {
    const canvas = document.getElementById('quantum-field-canvas');
    if (!canvas || canvas.__qfStarted) return;
    canvas.__qfStarted = true;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    const chars = '01ψΩ∑∆⊗⊕≡Ψ∂∇αβγδ量子';
    const colW  = 18;
    let cols    = Math.floor(canvas.width / colW);
    const drops = Array.from({ length: cols }, () => Math.random() * canvas.height / colW);
    setInterval(() => {
      cols = Math.floor(canvas.width / colW);
      while (drops.length < cols) drops.push(0);
      ctx.fillStyle = 'rgba(2,2,15,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${colW - 2}px Space Mono, monospace`;
      for (let i = 0; i < cols; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const r = Math.random();
        if (r > 0.97)      ctx.fillStyle = 'rgba(255,255,255,0.7)';
        else if (r > 0.65) ctx.fillStyle = 'rgba(0,229,255,0.25)';
        else               ctx.fillStyle = 'rgba(157,78,221,0.15)';
        ctx.fillText(char, i * colW, drops[i] * colW);
        if (drops[i] * colW > canvas.height && Math.random() > 0.975) drops[i] = 0;
        else drops[i] += 0.35;
      }
    }, 45);
  })();

  // 3. Security canvas (matrix rain in about section)
  (function () {
    const canvas = document.getElementById('security-canvas');
    if (!canvas || canvas.__scStarted) return;
    canvas.__scStarted = true;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = canvas.offsetWidth || window.innerWidth; canvas.height = canvas.offsetHeight || 600; }
    resize();
    const chars = '01アイウ∑∆ΩΨ∫∂∇⊗⊕';
    const colW  = 16;
    let cols    = Math.floor(canvas.width / colW);
    const drops = Array.from({ length: cols }, () => Math.random() * canvas.height / colW);
    setInterval(() => {
      cols = Math.floor(canvas.width / colW);
      while (drops.length < cols) drops.push(0);
      ctx.fillStyle = 'rgba(2,2,10,0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${colW - 2}px Space Mono, monospace`;
      for (let i = 0; i < cols; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const r = Math.random();
        if (r > 0.98)      ctx.fillStyle = '#ffffff';
        else if (r > 0.7)  ctx.fillStyle = 'rgba(0,229,255,0.35)';
        else               ctx.fillStyle = 'rgba(157,78,221,0.2)';
        ctx.fillText(char, i * colW, drops[i] * colW);
        if (drops[i] * colW > canvas.height && Math.random() > 0.975) drops[i] = 0;
        else drops[i] += 0.4;
      }
    }, 40);
  })();

  // 4. Night scroll reveals
  (function () {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = parseInt(e.target.dataset.delay || 0);
          setTimeout(() => { e.target.classList.add('visible'); }, delay);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach(el => { el.classList.remove('visible'); obs.observe(el); });
  })();

  // 5. Layer labels
  document.querySelectorAll('.layer-label').forEach(l => {
    l.style.transition = 'opacity 0.8s ease';
    l.style.opacity = '0';
    setTimeout(() => { l.style.opacity = '1'; }, 500);
  });

  // 6. Profile overlay reset
  const profileOverlay = document.getElementById('profile-overlay');
  if (profileOverlay) {
    profileOverlay.classList.add('hidden');
    profileOverlay.classList.remove('visible');
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('active');
  }
};
