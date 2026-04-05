/* ═══════════════════════════════════════════════════════════
   INCEPTION MAIN v2
   Coin Loader · Voice Commands ("Arise" / "Descend") · Transitions
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── State ─────────────────────────────────────────────────
  let currentMode    = 'day';
  let isTransitioning = false;

  // ── DOM refs ──────────────────────────────────────────────
  const body        = document.body;
  const loader      = document.getElementById('coin-loader');
  const coin        = document.getElementById('coin');
  const coinCracks  = document.getElementById('coin-cracks');
  const coinShards  = document.getElementById('coin-shards');
  const progressBar = document.getElementById('coin-progress-bar');
  const worldDay    = document.getElementById('world-day');
  const worldNight  = document.getElementById('world-night');
  const navLinks    = document.getElementById('nav-links');
  const transLayer  = document.getElementById('transition-layer');
  const transText   = document.getElementById('transition-text');
  const transShards = document.getElementById('transition-shards');

  // Voice UI elements — looked up lazily so they exist after DOM load
  function voiceBtn()  { return document.getElementById('voice-btn');      }
  function returnBtn() { return document.getElementById('return-btn');     }
  function voiceInd()  { return document.getElementById('voice-indicator');}

  // ── Nav ───────────────────────────────────────────────────
  const DAY_NAV = [
    { href:'#day-about',      label:'About'      },
    { href:'#day-experience', label:'Experience' },
    { href:'#day-skills',     label:'Skills'     },
    { href:'#day-certs',      label:'Certs'      },
    { href:'#day-contact',    label:'Contact'    },
  ];
  const NIGHT_NAV = [
    { href:'#research',      label:'Research' },
    { href:'#projects',      label:'Projects' },
    { href:'#night-about',   label:'About'    },
    { href:'#night-contact', label:'Contact'  },
  ];

  function updateNav() {
    if (!navLinks) return;
    const links = currentMode === 'day' ? DAY_NAV : NIGHT_NAV;
    navLinks.innerHTML = links.map(l => `<a href="${l.href}">${l.label}</a>`).join('');
  }

  // ── UI show/hide helpers ──────────────────────────────────
  function showEl(el)  { if (el) { el.style.display = ''; el.classList.remove('hidden'); } }
  function hideEl(el)  { if (el) { el.style.display = 'none'; el.classList.add('hidden'); } }

  // ═══════════════════════════════════════════════════════════
  //  COIN LOADER
  // ═══════════════════════════════════════════════════════════
  function startCoinLoader() {
    if (!loader) { revealDayWorld(); return; }

    let pct = 0;
    const iv = setInterval(() => {
      pct += 1.4;
      if (progressBar) progressBar.style.width = Math.min(pct, 88) + '%';
      if (pct >= 88) clearInterval(iv);
    }, 30);

    // Crack phase
    setTimeout(() => {
      if (progressBar) progressBar.style.width = '100%';
      if (coin) coin.classList.add('cracking');
      if (coinCracks) coinCracks.classList.add('visible');

      // Shatter phase
      setTimeout(() => {
        if (coin) coin.classList.add('shattered');
        if (coinCracks) coinCracks.style.opacity = '0';
        spawnCoinShards();

        // Fade out loader
        setTimeout(() => {
          loader.classList.add('fade-out');
          setTimeout(() => {
            loader.style.display = 'none';
            revealDayWorld();
          }, 700);
        }, 850);
      }, 650);
    }, 2600);
  }

  function spawnCoinShards() {
    if (!coinShards) return;
    coinShards.innerHTML = '';
    const COLORS = ['#2563eb','#0ea5e9','#00e5ff','#9d4edd','#ffffff','#ff2d87'];
    const COUNT = 24;

    for (let i = 0; i < COUNT; i++) {
      const el  = document.createElement('div');
      el.className = 'shard-piece';
      const sz  = 8  + Math.random() * 30;
      const ang = (i / COUNT) * Math.PI * 2;
      const d   = 90 + Math.random() * 130;
      Object.assign(el.style, {
        width:  sz + 'px',
        height: sz * (0.35 + Math.random() * 0.65) + 'px',
        left:   (100 - sz / 2 + Math.cos(ang) * d / 3) + 'px',
        top:    (100 - sz / 2 + Math.sin(ang) * d / 3) + 'px',
        background: COLORS[i % COLORS.length],
        opacity: '0.9',
        '--tx': (Math.cos(ang) * d) + 'px',
        '--ty': (Math.sin(ang) * d) + 'px',
        '--r':  ((Math.random() - 0.5) * 360) + 'deg',
        animationDelay: (i * 0.018) + 's',
      });
      coinShards.appendChild(el);
    }
  }

  function revealDayWorld() {
    updateNav();
    setupCursor();
    setupMobileNav();
    setupSmoothScroll();
    setupDayScrollReveal();
    initVoice();   // ← start voice AFTER page is ready
  }

  // ═══════════════════════════════════════════════════════════
  //  MODE TRANSITIONS
  // ═══════════════════════════════════════════════════════════

  function enterNightMode() {
    if (isTransitioning || currentMode === 'night') return;
    isTransitioning = true;

    showVoiceFeedback('arise');
    transText.textContent   = 'A  R  I  S  E';
    transText.style.opacity = '0';
    transText.style.transform = 'scale(0.8)';
    buildTransitionGrid('night');
    transLayer.classList.add('active');

    const tl = gsap.timeline({ onComplete: () => completeTransition('night') });
    tl.to(transLayer, { opacity: 1, duration: 0.1 });
    tl.to(transText,  { opacity: 1, scale: 1.1, duration: 0.5, ease: 'power3.out' });
    tl.to(transLayer, { backgroundColor: 'rgba(0,229,255,0.07)', duration: 0.25, yoyo: true, repeat: 1 }, '-=0.15');
    tl.to(transText,  { opacity: 0, y: -30, scale: 0.9, duration: 0.3 }, '+=0.2');
    tl.to(transShards.querySelectorAll('.shard'), {
      opacity: 0, scale: 1.6,
      x: () => (Math.random() - 0.5) * 400,
      y: () => (Math.random() - 0.5) * 400,
      rotation: () => (Math.random() - 0.5) * 180,
      duration: 0.55, stagger: { each: 0.01, from: 'edges' }, ease: 'power3.in',
    }, '-=0.2');
  }

  function enterDayMode() {
    if (isTransitioning || currentMode === 'day') return;
    isTransitioning = true;

    showVoiceFeedback('descend');
    transText.textContent   = 'D  E  S  C  E  N  D';
    transText.style.opacity = '0';
    transText.style.transform = 'scale(1.2)';
    buildTransitionGrid('day');
    transLayer.classList.add('active');

    const tl = gsap.timeline({ onComplete: () => completeTransition('day') });
    tl.to(transLayer, { opacity: 1, duration: 0.1 });
    tl.to(transText,  { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' });
    tl.to(transLayer, { backgroundColor: 'rgba(37,99,235,0.07)', duration: 0.2, yoyo: true, repeat: 1 }, '-=0.1');
    tl.to(transText,  { opacity: 0, y: 30, scale: 0.85, duration: 0.3 }, '+=0.2');
    tl.to(transShards.querySelectorAll('.shard'), {
      opacity: 0, scale: 1.4,
      x: () => (Math.random() - 0.5) * 300,
      y: () => (Math.random() - 0.5) * 300,
      rotation: () => (Math.random() - 0.5) * 120,
      duration: 0.5, stagger: { each: 0.01, from: 'center' }, ease: 'power2.in',
    }, '-=0.2');
  }

  function buildTransitionGrid(toMode) {
    transShards.innerHTML = '';
    const COLS = 10, ROWS = 7;
    const W = 100 / COLS, H = 100 / ROWS;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const el = document.createElement('div');
        el.className = 'shard';
        const isNight = (toMode === 'night');
        el.style.cssText = `
          left:${c*W}%; top:${r*H}%;
          width:${W+0.3}%; height:${H+0.3}%;
          background:${isNight
            ? `linear-gradient(${120+Math.random()*90}deg,rgba(0,229,255,${0.2+Math.random()*0.45}),rgba(157,78,221,${0.15+Math.random()*0.4}))`
            : `linear-gradient(${110+Math.random()*80}deg,rgba(15,23,42,${0.3+Math.random()*0.4}),rgba(37,99,235,${0.2+Math.random()*0.35}))`
          };
          transform:scale(0.82) rotate(${(Math.random()-0.5)*10}deg);
          opacity:0;
        `;
        transShards.appendChild(el);
      }
    }
    gsap.to(transShards.querySelectorAll('.shard'), {
      opacity: 1, scale: 1, duration: 0.32,
      stagger: { each: 0.014, from: 'center', grid: 'auto' },
      ease: 'power2.out',
    });
  }

  function completeTransition(newMode) {
    currentMode = newMode;
    body.classList.remove('mode-day', 'mode-night');
    body.classList.add('mode-' + newMode);

    if (newMode === 'night') {
      worldDay?.classList.add('hidden');
      worldNight?.classList.remove('hidden');
      hideEl(voiceBtn());
      showEl(returnBtn());
      if (window.DayScene) window.DayScene.stop();
    } else {
      worldNight?.classList.add('hidden');
      worldDay?.classList.remove('hidden');
      showEl(voiceBtn());
      hideEl(returnBtn());
      if (window.DayScene) window.DayScene.start();
      setupDayScrollReveal();
    }

    updateNav();
    window.scrollTo({ top: 0, behavior: 'instant' });

    gsap.to(transLayer, {
      opacity: 0, duration: 0.4, ease: 'power2.out',
      onComplete: () => {
        transLayer.classList.remove('active');
        transLayer.style.backgroundColor = '';
        transShards.innerHTML = '';
        transText.style.opacity = '0';
        transText.style.transform = '';
        isTransitioning = false;
      }
    });
  }

  // Return button (manual fallback in night mode)
  document.addEventListener('click', e => {
    if (e.target && e.target.id === 'return-btn') enterDayMode();
  });

  // ═══════════════════════════════════════════════════════════
  //  VOICE ENGINE — fully persistent, handles both modes
  // ═══════════════════════════════════════════════════════════
  //
  //  Architecture:
  //  - One SpeechRecognition instance, runs forever
  //  - onresult dispatches based on currentMode
  //  - onerror: only abort on real errors, ignore no-speech
  //  - onend: ALWAYS restart unless we deliberately destroyed it
  //  - "Arise"   → day  → night  (many phonetic variants)
  //  - "Descend" → night → day   (many phonetic variants)
  //  - Mic button just shows/hides the listening indicator
  //    (voice is always on in background)

  let recog       = null;
  let recogActive = false;   // true while engine should be running
  let voiceReady  = false;   // true after first successful .start()
  let pendingCommand = null; // set BEFORE stop(), checked in onend

  // Phonetic fuzzy matches — handles common mis-recognitions
  const ARISE_WORDS   = ['arise','a rise','arize','a rize','arise!','a-rise','the rise','araise','rise'];
  const DESCEND_WORDS = ['descend','descent','de scend','dissend','the send','descends','desend','de-scend'];

  function matchesWord(transcript, wordList) {
    return wordList.some(w => transcript.includes(w));
  }

  function initVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      // Browser doesn't support speech — hide mic button but keep return btn
      hideEl(voiceBtn());
      updateVoiceHint(false);
      console.info('[Voice] SpeechRecognition not supported in this browser.');
      return;
    }

    // Request mic permission explicitly first (fixes "no default mic" in some browsers)
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(() => {
        console.info('[Voice] Microphone permission granted.');
        buildRecognition(SR);
      })
      .catch(err => {
        console.warn('[Voice] Mic permission denied:', err);
        hideEl(voiceBtn());
        updateVoiceHint(false);
      });
  }

  function buildRecognition(SR) {
    recog = new SR();
    recog.lang = 'en-US';
    recog.continuous = true;       // keep session alive
    recog.interimResults = false;  // only final results
    recog.maxAlternatives = 5;     // more alternatives = better fuzzy matching

    recog.onstart = () => {
      voiceReady  = true;
      recogActive = true;
      dbgSessions++;
      console.info('[Voice] Listening...');
      const d = window.__voiceDebug;
      if (d) { d.setState('listening'); d.setSession(dbgSessions); d.log('info', `Session #${dbgSessions} started`); }
    };

    recog.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) continue;

        // Collect all alternatives
        const alts = [];
        let transcript = '';
        for (let a = 0; a < event.results[i].length; a++) {
          const t = event.results[i][a].transcript.toLowerCase().trim();
          alts.push({ transcript: t, confidence: event.results[i][a].confidence || 0 });
          transcript += ' ' + t;
        }

        const topConf = alts[0]?.confidence || 0;
        const topText = alts[0]?.transcript || transcript.trim();

        console.info('[Voice] Heard:', transcript.trim(), '| Conf:', (topConf*100).toFixed(0)+'%');

        const isArise   = matchesWord(transcript, ARISE_WORDS);
        const isDescend = matchesWord(transcript, DESCEND_WORDS);
        const isCmd     = (isArise && currentMode === 'day') || (isDescend && currentMode === 'night');

        // Update debug panel
        const d = window.__voiceDebug;
        if (d) {
          d.setState(isCmd ? 'detected' : 'processing');
          d.setResult(topText, topConf, alts, isCmd);
          d.log(isCmd ? 'cmd' : 'hear', `"${topText}" (${(topConf*100).toFixed(0)}%)${isCmd ? ' ← COMMAND' : ''}`);
        }

        if (isArise && currentMode === 'day' && !isTransitioning) {
          console.info('[Voice] ✓ "Arise" detected → entering night mode');
          enterNightMode();
          break;
        }

        if (isDescend && currentMode === 'night' && !isTransitioning) {
          console.info('[Voice] ✓ "Descend" detected → returning to day mode');
          enterDayMode();
          break;
        }

        // Back to listening after processing
        setTimeout(() => { const d2 = window.__voiceDebug; if (d2) d2.setState('listening'); }, 800);
      }
    };

    recog.onerror = (e) => {
      console.warn('[Voice] Error:', e.error);
      const d = window.__voiceDebug;
      if (e.error === 'no-speech') {
        if (d) d.log('info', 'No speech detected (silence)');
        return;
      }
      if (e.error === 'aborted') return;
      if (e.error === 'not-allowed') {
        if (d) { d.setState('denied'); d.log('err', 'Microphone access denied'); }
        hideEl(voiceBtn());
        updateVoiceHint(false);
        recogActive = false;
        return;
      }
      if (d) { d.setState('error'); d.log('err', 'Recognition error: ' + e.error); }
      recogActive = false;
      setTimeout(() => { if (d) d.setState('restart'); safeStart(); }, 1000);
    };

    recog.onend = () => {
      voiceReady = false;
      const d = window.__voiceDebug;
      if (recogActive) {
        if (d) d.setState('restart');
        setTimeout(() => safeStart(), 200);
      } else {
        if (d) { d.setState('idle'); d.log('info', 'Engine stopped (disabled)'); }
      }
    };

    // Start immediately
    safeStart();
    updateVoiceHint(true);
    setupVoiceBtnClick();

    // Keep debug mode display in sync with mode changes
    setInterval(() => {
      const d = window.__voiceDebug;
      if (d) d.setMode(currentMode);
    }, 500);
  }

  function safeStart() {
    if (!recog) return;
    if (voiceReady) return;  // already running
    try {
      recog.start();
    } catch (e) {
      // InvalidStateError = already started, ignore
      if (e.name !== 'InvalidStateError') {
        console.warn('[Voice] start() error:', e);
        setTimeout(() => safeStart(), 500);
      }
    }
  }

  // Mic button: clicking it shows/hides the indicator (voice always runs)
  function setupVoiceBtnClick() {
    document.addEventListener('click', e => {
      if (!e.target) return;
      if (e.target.id === 'voice-btn' || e.target.closest('#voice-btn')) {
        const ind = voiceInd();
        if (!ind) return;
        if (ind.classList.contains('hidden')) {
          ind.classList.remove('hidden');
          setTimeout(() => ind.classList.add('hidden'), 4000);
        } else {
          ind.classList.add('hidden');
        }
      }
    });
  }

  // Update the voice hint text in the day hero
  function updateVoiceHint(supported) {
    const hint = document.querySelector('.day-voice-hint');
    if (!hint) return;
    if (!supported) {
      hint.innerHTML = '<span class="vhint-mic">⚠</span><span>Voice commands require microphone permission</span>';
    }
  }

  // Visual feedback indicator when a command is heard
  function showVoiceFeedback(command) {
    const ind = voiceInd();
    if (!ind) return;

    const span = ind.querySelector('.voice-text');
    if (command === 'arise') {
      if (span) span.innerHTML = '✦ <strong>"Arise"</strong> — entering deeper layer';
    } else {
      if (span) span.innerHTML = '✦ <strong>"Descend"</strong> — returning to surface';
    }

    ind.classList.remove('hidden');
    setTimeout(() => ind.classList.add('hidden'), 2200);
  }

  // ═══════════════════════════════════════════════════════════
  //  CURSOR (day mode)
  // ═══════════════════════════════════════════════════════════
  function setupCursor() {
    const dot  = document.getElementById('day-cursor');
    const ring = document.getElementById('day-cursor-ring');
    if (!dot || !ring) return;
    let dx = -300, dy = -300, rx = -300, ry = -300;

    document.addEventListener('mousemove', e => {
      dx = e.clientX; dy = e.clientY;
      dot.style.left = dx + 'px'; dot.style.top = dy + 'px';
    });
    (function loop() {
      rx += (dx - rx) * 0.12; ry += (dy - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
  }

  // ═══════════════════════════════════════════════════════════
  //  MOBILE NAV
  // ═══════════════════════════════════════════════════════════
  function setupMobileNav() {
    const burger = document.getElementById('nav-mobile-btn');
    const links  = document.getElementById('nav-links');
    if (!burger || !links) return;
    burger.addEventListener('click', () => links.classList.toggle('open'));
    links.addEventListener('click', e => {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  DAY SCROLL REVEAL
  // ═══════════════════════════════════════════════════════════
  function setupDayScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.day-section').forEach(el => el.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.day-section').forEach(el => {
      el.classList.remove('visible');
      obs.observe(el);
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  SMOOTH SCROLL
  // ═══════════════════════════════════════════════════════════
  function setupSmoothScroll() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  }


  // ═══════════════════════════════════════════════════════════
  //  VOICE DEBUG PANEL
  //  Toggle: ` (backtick) or click the mic button in day mode
  //  Shows: mic waveform (Web Audio), last phrase, confidence,
  //         all alternatives, event log, engine state
  // ═══════════════════════════════════════════════════════════

  // DOM refs (looked up once panel is known to exist)
  const dbg = {
    panel:    () => document.getElementById('voice-debug'),
    dot:      () => document.getElementById('vd-status-dot'),
    badge:    () => document.getElementById('vd-engine-badge'),
    state:    () => document.getElementById('vd-state'),
    mode:     () => document.getElementById('vd-mode'),
    session:  () => document.getElementById('vd-session'),
    phrase:   () => document.getElementById('vd-phrase'),
    confBar:  () => document.getElementById('vd-conf-bar'),
    confPct:  () => document.getElementById('vd-conf-pct'),
    alts:     () => document.getElementById('vd-alts'),
    log:      () => document.getElementById('vd-log'),
    waveform: () => document.getElementById('vd-waveform'),
    close:    () => document.getElementById('vd-close'),
  };

  let dbgOpen     = false;
  let dbgSessions = 0;
  let waveAF      = null;
  let analyser    = null;

  // ── Toggle panel ─────────────────────────────────────────
  function toggleDebugPanel() {
    dbgOpen = !dbgOpen;
    const panel = dbg.panel();
    if (!panel) return;
    if (dbgOpen) {
      panel.classList.remove('hidden');
      dbgLog('info', 'Debug panel opened');
      startWaveform();
    } else {
      panel.classList.add('hidden');
      stopWaveform();
    }
  }

  // Keyboard shortcut: backtick
  document.addEventListener('keydown', e => {
    if (e.key === '`' || e.key === '~') toggleDebugPanel();
  });

  // Close button inside panel
  document.addEventListener('click', e => {
    if (e.target && (e.target.id === 'vd-close' || e.target.closest('#vd-close'))) {
      dbgOpen = true; // so toggle flips it to false
      toggleDebugPanel();
    }
  });

  // ── State updates (called by voice engine) ───────────────
  function dbgSetState(state) {
    // state: 'idle' | 'listening' | 'processing' | 'detected' | 'error' | 'denied'
    const dot   = dbg.dot();
    const badge = dbg.badge();
    const stEl  = dbg.state();
    if (!dot || !badge || !stEl) return;

    dot.className   = 'vd-status-dot';
    badge.className = 'vd-badge';

    const MAP = {
      idle:       { dot: '',           badge: '',          text: 'IDLE',       label: 'IDLE'      },
      listening:  { dot: 'listening',  badge: 'listening', text: 'LISTENING',  label: 'ON'        },
      processing: { dot: 'processing', badge: '',          text: 'PROCESSING', label: 'HEARD'     },
      detected:   { dot: 'processing', badge: 'detected',  text: 'COMMAND!',   label: 'MATCHED'   },
      error:      { dot: 'error',      badge: 'error',     text: 'ERROR',      label: 'ERROR'     },
      denied:     { dot: 'error',      badge: 'error',     text: 'NO MIC',     label: 'DENIED'    },
      restart:    { dot: 'listening',  badge: 'listening', text: 'RESTARTING', label: 'RESTART'   },
    };
    const cfg = MAP[state] || MAP.idle;
    if (cfg.dot)    dot.classList.add(cfg.dot);
    if (cfg.badge)  badge.classList.add(cfg.badge);
    stEl.textContent = cfg.text;
    badge.textContent = cfg.label;
  }

  function dbgSetMode(mode) {
    const el = dbg.mode();
    if (el) el.textContent = mode.toUpperCase();
  }

  function dbgSetSession(n) {
    const el = dbg.session();
    if (el) el.textContent = n;
  }

  function dbgSetResult(transcript, confidence, alternatives, isCommand) {
    const phraseEl  = dbg.phrase();
    const confBarEl = dbg.confBar();
    const confPctEl = dbg.confPct();
    const altsEl    = dbg.alts();

    if (phraseEl) {
      phraseEl.textContent = `"${transcript}"`;
      phraseEl.className   = 'vd-phrase-text' + (isCommand ? ' match' : '');
    }

    const pct = Math.round(confidence * 100);
    if (confBarEl) confBarEl.style.width = pct + '%';
    if (confPctEl) confPctEl.textContent = pct + '%';

    if (altsEl && alternatives.length) {
      altsEl.innerHTML = alternatives.map((alt, i) =>
        `<span class="vd-alt-item ${i === 0 ? 'top' : ''}">${i+1}. "${alt.transcript}" (${Math.round(alt.confidence*100)}%)</span>`
      ).join('');
    }
  }

  function dbgLog(type, msg) {
    // type: 'info' | 'hear' | 'cmd' | 'err'
    const logEl = dbg.log();
    if (!logEl) return;
    const now = new Date();
    const ts  = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
    const entry = document.createElement('span');
    entry.className = `vd-log-entry ${type}`;
    entry.textContent = `[${ts}] ${msg}`;
    logEl.appendChild(entry);
    logEl.appendChild(document.createElement('br'));
    // Keep last 30 entries
    while (logEl.children.length > 60) logEl.removeChild(logEl.firstChild);
    logEl.scrollTop = logEl.scrollHeight;
  }

  // ── Waveform renderer ─────────────────────────────────────
  function startWaveform() {
    const canvas = dbg.waveform();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // If analyser already connected, just start drawing
    if (analyser) {
      drawWave(analyser, ctx, W, H);
      return;
    }

    // Request mic stream for waveform
    navigator.mediaDevices?.getUserMedia({ audio: true, video: false })
      .then(stream => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source   = audioCtx.createMediaStreamSource(stream);
        analyser        = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        drawWave(analyser, ctx, W, H);
        dbgLog('info', 'Waveform connected to mic stream');
      })
      .catch(err => {
        // Draw flat line if no mic
        ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(0,229,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();
        dbgLog('err', 'Waveform: ' + err.message);
      });
  }

  function drawWave(analyser, ctx, W, H) {
    const bufLen  = analyser.frequencyBinCount;
    const dataArr = new Uint8Array(bufLen);
    const isCyan  = () => currentMode === 'night';

    function frame() {
      if (!dbgOpen) return;
      waveAF = requestAnimationFrame(frame);

      analyser.getByteTimeDomainData(dataArr);

      ctx.clearRect(0, 0, W, H);

      // Background grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < H; y += 16) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      // Centre line
      ctx.strokeStyle = isCyan() ? 'rgba(0,229,255,0.12)' : 'rgba(37,99,235,0.15)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();

      // Waveform
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      if (isCyan()) {
        grad.addColorStop(0,   'rgba(0,229,255,0.2)');
        grad.addColorStop(0.5, 'rgba(0,229,255,0.9)');
        grad.addColorStop(1,   'rgba(157,78,221,0.6)');
      } else {
        grad.addColorStop(0,   'rgba(37,99,235,0.3)');
        grad.addColorStop(0.5, 'rgba(37,99,235,1)');
        grad.addColorStop(1,   'rgba(14,165,233,0.6)');
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.8;
      ctx.lineJoin    = 'round';
      ctx.beginPath();

      const sliceW = W / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = dataArr[i] / 128.0;
        const y = (v * H) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else         ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.stroke();

      // Peak glow fill
      ctx.strokeStyle = isCyan() ? 'rgba(0,229,255,0.08)' : 'rgba(37,99,235,0.08)';
      ctx.lineWidth   = 4;
      ctx.stroke();
    }
    frame();
  }

  function stopWaveform() {
    if (waveAF) { cancelAnimationFrame(waveAF); waveAF = null; }
  }

  // ── Public hooks (called from within initVoice / buildRecognition) ──
  // We expose a dbgHook object that the voice engine calls
  window.__voiceDebug = {
    setState:   dbgSetState,
    setMode:    dbgSetMode,
    setSession: dbgSetSession,
    setResult:  dbgSetResult,
    log:        dbgLog,
  };

  // ═══════════════════════════════════════════════════════════
  //  BOOT
  // ═══════════════════════════════════════════════════════════
  function init() {
    // Ensure correct initial state
    worldNight?.classList.add('hidden');
    worldDay?.classList.remove('hidden');
    showEl(voiceBtn());
    hideEl(returnBtn());
    updateNav();
    startCoinLoader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
