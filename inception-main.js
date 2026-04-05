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

  // ══════════════════════════════════════════════════════════  //  NEURAL SPHERE LOADER + 3D TRANSITIONS
  // ═══════════════════════════════════════════════════════════  //  NEURAL SPHERE LOADER + 3D TRANSITIONS
  // ═══════════════════════════════════════════════════════════

  // ─── Helper: build a Three.js renderer on a canvas ────────
  function makeRenderer(canvas) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.setClearColor(0x000000, 0);
    return r;
  }

  // ═══════════════════════════════════════════════════════════
  //  NEURAL SPHERE LOADER
  //  A dense icosphere wireframe assembles from the center,
  //  orbited by qubit rings. Boot log types below. At end,
  //  a bright flash clears and day world appears.
  // ═══════════════════════════════════════════════════════════
  function startLoader() {
    const loaderEl = document.getElementById('sys-loader');
    if (!loaderEl) { revealDayWorld(); return; }

    const canvas  = document.getElementById('loader-canvas');
    const logEl   = document.getElementById('sl-boot-log');
    const fillEl  = document.createElement('div');
    fillEl.className = 'sl-progress-fill';
    const barEl   = document.querySelector('.sl-progress-bar');
    if (barEl) barEl.appendChild(fillEl);
    const pctEl   = document.getElementById('sl-pct');
    const glitch  = document.getElementById('sl-glitch');

    if (!canvas) { revealDayWorld(); return; }

    // ── Three.js scene ──────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(50, canvas.offsetWidth / canvas.offsetHeight || 1.6, 0.1, 200);
    camera.position.set(0, 0, 32);
    const renderer = makeRenderer(canvas);
    renderer.setSize(canvas.offsetWidth || window.innerWidth, canvas.offsetHeight || window.innerHeight);

    scene.add(new THREE.AmbientLight(0x111133, 2));
    const ptCyan = new THREE.PointLight(0x00e5ff, 8, 80);
    ptCyan.position.set(20, 20, 20);
    scene.add(ptCyan);
    const ptPurp = new THREE.PointLight(0x9d4edd, 6, 80);
    ptPurp.position.set(-20, -10, 10);
    scene.add(ptPurp);

    // Central icosphere — wireframe + solid layers
    const icoGeo  = new THREE.IcosahedronGeometry(7, 3);
    const solidMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a2a, emissive: 0x001133,
      emissiveIntensity: 1, metalness: 0.4, roughness: 0.5,
      transparent: true, opacity: 0,
    });
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff, wireframe: true,
      transparent: true, opacity: 0,
    });
    const sphere     = new THREE.Mesh(icoGeo, solidMat);
    const sphereWire = new THREE.Mesh(icoGeo, wireMat);
    scene.add(sphere, sphereWire);

    // Inner glow core
    const coreGeo = new THREE.SphereGeometry(2.2, 20, 20);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xff2d87, transparent: true, opacity: 0,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Qubit orbital rings (3)
    const rings = [];
    [[9.5, 0x00e5ff, Math.PI/2.5, 0], [11, 0x9d4edd, Math.PI/4, 1.2], [12.5, 0x00ff88, Math.PI*0.38, -0.6]].forEach(([r, col, rx, ry]) => {
      const ringGeo = new THREE.TorusGeometry(r, 0.08, 8, 100);
      const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = rx; ring.rotation.y = ry;
      scene.add(ring);
      // Bead
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 })
      );
      ring.add(bead);
      bead.position.set(r, 0, 0);
      rings.push({ ring, bead, r, mat: ringMat, beadMat: bead.material, angle: Math.random()*Math.PI*2, speed: (0.008 + Math.random()*0.005) * (Math.random()>0.5?1:-1) });
    });

    // Particle cloud
    const pcCount = 600;
    const pcPos   = new Float32Array(pcCount * 3);
    const pcCol   = new Float32Array(pcCount * 3);
    for (let i = 0; i < pcCount; i++) {
      const th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
      const r  = 14 + Math.random()*8;
      pcPos[i*3]   = r*Math.sin(ph)*Math.cos(th);
      pcPos[i*3+1] = r*Math.sin(ph)*Math.sin(th);
      pcPos[i*3+2] = r*Math.cos(ph);
      const t = Math.random();
      pcCol[i*3]   = t*0 + (1-t)*0.6;
      pcCol[i*3+1] = t*0.9 + (1-t)*0.2;
      pcCol[i*3+2] = 1.0;
    }
    const pcGeo = new THREE.BufferGeometry();
    pcGeo.setAttribute('position', new THREE.BufferAttribute(pcPos, 3));
    pcGeo.setAttribute('color',    new THREE.BufferAttribute(pcCol, 3));
    const pcMesh = new THREE.Points(pcGeo, new THREE.PointsMaterial({
      size: 0.3, vertexColors: true, transparent: true, opacity: 0, sizeAttenuation: true,
    }));
    scene.add(pcMesh);

    // ── Animation loop ──────────────────────────────────────
    let frame = 0, loaderAF = null;
    function loaderLoop() {
      loaderAF = requestAnimationFrame(loaderLoop);
      frame++;
      const t = frame * 0.01;
      sphere.rotation.y     = t * 0.18;
      sphere.rotation.x     = Math.sin(t * 0.12) * 0.15;
      sphereWire.rotation.copy(sphere.rotation);
      pcMesh.rotation.y     = t * 0.06;
      ptCyan.position.x     = 20 * Math.cos(t * 0.4);
      ptCyan.position.z     = 20 * Math.sin(t * 0.4);
      const pulse = 0.7 + 0.3 * Math.sin(t * 2.2);
      core.scale.setScalar(pulse);
      rings.forEach(q => {
        q.angle += q.speed;
        q.bead.position.set(q.r * Math.cos(q.angle), q.r * Math.sin(q.angle), 0);
        q.ring.rotation.z += 0.001;
      });
      renderer.render(scene, camera);
    }
    loaderLoop();

    // ── Tween helper ─────────────────────────────────────────
    function fadeMat(mat, prop, to, dur) {
      const start = mat[prop], startT = performance.now();
      function tick() {
        const p = Math.min((performance.now()-startT)/(dur*1000), 1);
        mat[prop] = start + (to - start) * (1 - Math.pow(1-p, 3));
        if (p < 1) requestAnimationFrame(tick);
      }
      tick();
    }

    // ── Boot sequence ─────────────────────────────────────────
    let pct = 0;
    function setPct(val) {
      pct = val;
      if (fillEl) fillEl.style.width = val + '%';
      if (pctEl)  pctEl.textContent  = Math.round(val) + '%';
    }

    const BOOT_LINES = [
      [0,    '',    'INITIALIZING NEURAL MATRIX...', 30],
      [400,  'ok',  'QUANTUM COHERENCE ACHIEVED',     0 ],
      [750,  '',    'LOADING SECURITY PROTOCOLS...',  25],
      [1400, 'ok',  'THREAT DETECTION: ARMED',         0 ],
      [1700, '',    'CALIBRATING AI INFERENCE...',    22],
      [2350, 'ok',  'SYSTEM NOMINAL',                  0 ],
      [2700, 'info','GARRVSIPANI@JOHNSSHOPKINS.EDU',  0 ],
    ];

    let lastLine = null;
    BOOT_LINES.forEach(([delay, cls, text, speed]) => {
      setTimeout(() => {
        if (lastLine) lastLine.querySelector('.sl-cur')?.remove();
        const el = document.createElement('div');
        const prefix = cls === 'ok' ? '[ OK ] ' : cls === 'info' ? '[ >> ] ' : '[ .. ] ';
        el.className = cls === 'ok' ? 'sl-ok' : cls === 'info' ? 'sl-info' : '';
        if (logEl) { logEl.appendChild(el); lastLine = el; }

        // Typewriter
        let i = 0, full = prefix + text;
        const cursor = document.createElement('span');
        cursor.className = 'sl-cur'; cursor.textContent = '▋';
        el.appendChild(cursor);
        if (speed > 0) {
          const iv = setInterval(() => {
            el.insertBefore(document.createTextNode(full[i] || ''), cursor);
            if (++i >= full.length) { clearInterval(iv); cursor.remove(); }
          }, speed);
        } else {
          el.insertBefore(document.createTextNode(full), cursor);
          cursor.remove();
        }
        // Keep last 3 lines visible
        while (logEl && logEl.children.length > 3) logEl.removeChild(logEl.firstChild);
      }, delay);
    });

    // ── Progressive reveal of sphere ──────────────────────────
    // Phase 1 (0-0.8s): wireframe fades in, core starts glowing
    setTimeout(() => {
      fadeMat(wireMat,  'opacity', 0.55, 0.8);
      fadeMat(solidMat, 'opacity', 0.08, 1.0);
      fadeMat(coreMat,  'opacity', 0.6,  0.9);
    }, 200);

    // Phase 2 (0.8s): rings and particles materialise
    setTimeout(() => {
      rings.forEach((q, i) => {
        setTimeout(() => {
          fadeMat(q.mat,     'opacity', 0.45, 0.5);
          fadeMat(q.beadMat, 'opacity', 0.95, 0.4);
        }, i * 200);
      });
      fadeMat(pcMesh.material, 'opacity', 0.5, 0.8);
    }, 800);

    // ── Progress fill ─────────────────────────────────────────
    const progIv = setInterval(() => {
      setPct(Math.min(pct + 1.1, 90));
      if (pct >= 90) clearInterval(progIv);

    }, 28);

    // ── Final phase (3.2s): glitch flash + launch ──────────────
    setTimeout(() => {
      clearInterval(progIv);
      setPct(100);

      // Glitch flash sequence
      if (glitch) {
        const seq = [0.9, 0, 0.7, 0, 0.85, 0];
        let gi = 0;
        const gIv = setInterval(() => {
          glitch.style.opacity = seq[gi++];
          if (gi >= seq.length) clearInterval(gIv);
        }, 60);
      }

      // Sphere explodes outward
      fadeMat(wireMat,  'opacity', 0, 0.4);
      fadeMat(solidMat, 'opacity', 0, 0.4);
      fadeMat(coreMat,  'opacity', 0, 0.3);
      rings.forEach(q => {
        fadeMat(q.mat,     'opacity', 0, 0.35);
        fadeMat(q.beadMat, 'opacity', 0, 0.3);
      });
      fadeMat(pcMesh.material, 'opacity', 0, 0.4);

      setTimeout(() => {
        cancelAnimationFrame(loaderAF);
        renderer.dispose();
        loaderEl.classList.add('fade-out');
        setTimeout(() => {
          loaderEl.style.display = 'none';
          revealDayWorld();
        }, 650);
      }, 450);

    }, 3300);
  }

  // ═══════════════════════════════════════════════════════════
  //  REVEAL DAY WORLD — called after loader completes
  // ═══════════════════════════════════════════════════════════
  function revealDayWorld() {
    updateNav();
    setupCursor();
    setupMobileNav();
    setupSmoothScroll();
    setupDayScrollReveal();
    if (window.DayScene) window.DayScene.start();
    if (window.DayLive) window.DayLive.init(); // start live command-center animations
    initVoice();
  }

  // ═══════════════════════════════════════════════════════════
  //  3D TRANSITIONS — particle warp via Three.js canvas
  // ═══════════════════════════════════════════════════════════

  let transRenderer = null, transScene = null, transCamera = null, transAF = null;

  function initTransCanvas() {
    const canvas = document.getElementById('transition-canvas');
    if (!canvas || transRenderer) return;
    transScene    = new THREE.Scene();
    transCamera   = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 500);
    transCamera.position.z = 80;
    transRenderer = makeRenderer(canvas);
    transRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  // "Arise" — deep space implosion: screen goes black, particles shoot inward from all sides
  // then a quantum brain crystallises briefly before night world appears
  function enterNightMode() {
    if (isTransitioning || currentMode === 'night') return;
    isTransitioning = true;
    showVoiceFeedback('arise');
    initTransCanvas();
    if (!transScene) { completeTransition('night'); return; }

    transLayer.classList.add('active');
    gsap.set(transLayer, { opacity: 1 });

    // Build particle implosion
    const COUNT = 2000;
    const pos   = new Float32Array(COUNT * 3);
    const vel   = new Float32Array(COUNT * 3);
    const cols  = new Float32Array(COUNT * 3);
    const COLORS_NIGHT = [[0, 0.9, 1], [0.6, 0.2, 0.93], [0, 1, 0.53]];

    for (let i = 0; i < COUNT; i++) {
      const ang = Math.random() * Math.PI * 2;
      const el  = Math.acos(2 * Math.random() - 1);
      const r   = 120 + Math.random() * 80;
      pos[i*3]   = r * Math.sin(el) * Math.cos(ang);
      pos[i*3+1] = r * Math.sin(el) * Math.sin(ang);
      pos[i*3+2] = r * Math.cos(el);
      // Velocity toward center
      vel[i*3]   = -pos[i*3]   * 0.04;
      vel[i*3+1] = -pos[i*3+1] * 0.04;
      vel[i*3+2] = -pos[i*3+2] * 0.04;
      const c = COLORS_NIGHT[i % COLORS_NIGHT.length];
      cols[i*3] = c[0]; cols[i*3+1] = c[1]; cols[i*3+2] = c[2];
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    ptGeo.setAttribute('color',    new THREE.BufferAttribute(cols, 3));
    const ptMat = new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0, sizeAttenuation: true });
    const pts   = new THREE.Points(ptGeo, ptMat);
    transScene.add(pts);

    // Central flash sphere
    const flashSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0 })
    );
    transScene.add(flashSphere);

    let tFrame = 0;
    function animArse() {
      transAF = requestAnimationFrame(animArse);
      tFrame++;
      const t = tFrame / 60;

      // Move particles inward
      const posArr = pts.geometry.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        posArr[i*3]   += vel[i*3];
        posArr[i*3+1] += vel[i*3+1];
        posArr[i*3+2] += vel[i*3+2];
        // Slow down as they approach center
        vel[i*3]   *= 0.975;
        vel[i*3+1] *= 0.975;
        vel[i*3+2] *= 0.975;
      }
      pts.geometry.attributes.position.needsUpdate = true;

      // Fade in particles
      if (t < 0.3)    ptMat.opacity = t / 0.3 * 0.9;
      else if (t < 1) ptMat.opacity = 0.9;
      else            ptMat.opacity = Math.max(0, 0.9 - (t-1) * 1.2);

      // Flash sphere grows and fades
      if (t > 0.8) {
        const ft = (t - 0.8) / 0.5;
        flashSphere.scale.setScalar(1 + ft * 15);
        flashSphere.material.opacity = Math.max(0, 0.6 * (1 - ft));
      }

      transRenderer.render(transScene, transCamera);
    }
    animArse();

    // Word
    transText.className = '';
    gsap.set(transText, { opacity: 0, scale: 0.5, y: 0 });
    transText.textContent = 'A R I S E';

    const tl = gsap.timeline({ onComplete: () => {
      cancelAnimationFrame(transAF);
      transScene.remove(pts); transScene.remove(flashSphere);
      ptGeo.dispose(); ptMat.dispose();
      completeTransition('night');
    }});

    tl.to(transText,  { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }, 0.3);
    tl.to(transText,  { opacity: 0, scale: 1.4, duration: 0.4, ease: 'power2.in' }, 1.2);
    tl.to(transLayer, { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 1.5);
  }

  // "Descend" — HORIZONTAL SCAN WIPE
  // A solid cyan-white scan line races from left to right across the screen,
  // wiping the night world away. Then the day world snaps in clean.
  // Completely different feel from the Arise particle implosion.
  function enterDayMode() {
    if (isTransitioning || currentMode === 'day') return;
    isTransitioning = true;
    showVoiceFeedback('descend');

    // No Three.js canvas needed — pure CSS + GSAP wipe
    transLayer.classList.add('active');
    gsap.set(transLayer, { opacity: 1, backgroundColor: 'transparent' });

    // Build the scan-wipe overlay: a set of horizontal stripes that
    // fly in from the left at staggered speeds, covering the screen,
    // then retracting right revealing the day world
    const STRIPES = 12;
    const stripeEls = [];
    for (let i = 0; i < STRIPES; i++) {
      const el = document.createElement('div');
      const h  = 100 / STRIPES;
      const isCyanStripe = i % 3 === 0;
      Object.assign(el.style, {
        position: 'absolute',
        left: '-100%',
        top:  `${i * h}%`,
        width: '100%',
        height: `${h + 0.3}%`,
        background: isCyanStripe
          ? 'linear-gradient(90deg, rgba(37,99,235,0.95), rgba(0,229,255,0.9))'
          : 'linear-gradient(90deg, rgba(15,23,42,0.98), rgba(37,99,235,0.85))',
        zIndex: 2,
      });
      transLayer.appendChild(el);
      stripeEls.push(el);
    }

    // Bright leading edge that sweeps right
    const edgeEl = document.createElement('div');
    Object.assign(edgeEl.style, {
      position: 'absolute', top: 0, bottom: 0,
      width: '3px',
      background: 'linear-gradient(to bottom, transparent, #00e5ff, #fff, #00e5ff, transparent)',
      left: '-3px', zIndex: 5, boxShadow: '0 0 20px rgba(0,229,255,0.9)',
    });
    transLayer.appendChild(edgeEl);

    transText.className = 'day-text';
    gsap.set(transText, { opacity: 0, x: -40 });
    transText.textContent = 'D E S C E N D';

    const tl = gsap.timeline({ onComplete: () => {
      stripeEls.forEach(el => el.remove());
      edgeEl.remove();
      completeTransition('day');
    }});

    // Phase 1: stripes slam in from left (0→0.5s)
    tl.to(stripeEls, {
      left: '0%', duration: 0.35,
      stagger: { each: 0.025, from: 'start' },
      ease: 'power4.in',
    }, 0);

    // Edge sweeps across (0→0.5s)
    tl.to(edgeEl, { left: '100%', duration: 0.5, ease: 'power2.inOut' }, 0);

    // Text fades in from left
    tl.to(transText, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, 0.15);

    // Brief hold
    tl.to({}, { duration: 0.25 });

    // Phase 2: stripes retract right (reveal day world)
    tl.to(transText, { opacity: 0, x: 40, duration: 0.2, ease: 'power2.in' }, '+=0');
    tl.to(stripeEls, {
      left: '100%', duration: 0.35,
      stagger: { each: 0.02, from: 'end' },
      ease: 'power4.out',
    }, '-=0.15');
    tl.to(transLayer, { opacity: 0, duration: 0.2 }, '-=0.1');
  }

  // ── Shared: swap worlds after transition finishes ─────────
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
      // Force brain canvas resize now that it's visible, then boot
      if (window.__brainForceResize) window.__brainForceResize();
      bootNightWorld(); // lazy-init the quantum brain only now
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

    // Clean up transition layer
    transLayer.classList.remove('active');
    transLayer.style.backgroundColor = '';
    if (transShards) transShards.innerHTML = '';
    gsap.set(transText, { opacity: 0, scale: 1, y: 0 });
    transText.textContent = '';
    gsap.set(transLayer, { opacity: 0 });
    isTransitioning = false;
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
  // Mutable — can be updated live from the debug panel command editor
  let ARISE_WORDS   = ['arise','a rise','arize','a rize','arise!','a-rise','the rise','araise','rise'];
  let DESCEND_WORDS = ['descend','descent','de scend','dissend','the send','descends','desend','de-scend'];
  const ARISE_DEFAULTS   = [...ARISE_WORDS];
  const DESCEND_DEFAULTS = [...DESCEND_WORDS];

  function matchesWord(transcript, wordList) {
    return wordList.some(w => transcript.includes(w));
  }

  function initVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      hideEl(voiceBtn());
      updateVoiceHint(false);
      console.info('[Voice] SpeechRecognition not supported in this browser.');
      return;
    }

    // Start the speech engine directly — the Speech API handles its own
    // microphone permission prompt. Do NOT gate on getUserMedia() because
    // that can be blocked by iframes/HTTPS/sandbox and silently prevent
    // the engine from ever starting.
    console.info('[Voice] Initializing speech recognition...');
    buildRecognition(SR);
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
      // Keep recogActive = true so onend will restart
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

    // Mark active BEFORE first start so onend restarts correctly
    recogActive = true;
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
      initCommandEditor();
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

  // Nav mic pill also toggles panel
  document.addEventListener('click', e => {
    if (e.target?.closest('#nav-mic-status')) toggleDebugPanel();
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

    // Sync nav mic status dot
    const navDot   = document.getElementById('nms-dot');
    const navLabel = document.getElementById('nms-label');
    if (navDot) {
      navDot.className = 'nms-dot' + (cfg.dot ? ' ' + cfg.dot : '');
    }
    if (navLabel) navLabel.textContent = cfg.text === 'IDLE' ? 'MIC' : cfg.text;
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

    // If real analyser already connected, just restart draw loop
    if (analyser) { drawWave(analyser, ctx, W, H); return; }

    // Try to connect real mic for live waveform
    const tryConnect = async () => {
      try {
        const stream   = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source   = audioCtx.createMediaStreamSource(stream);
        analyser        = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;
        source.connect(analyser);
        drawWave(analyser, ctx, W, H);
        dbgLog('info', 'Live mic waveform active');
      } catch (err) {
        // Mic blocked — draw an animated simulated waveform
        dbgLog('info', 'No mic access — showing simulated waveform');
        drawSimWave(ctx, W, H);
      }
    };
    tryConnect();
  }

  // Simulated waveform (when real mic not accessible)
  function drawSimWave(ctx, W, H) {
    let phase = 0;
    function frame() {
      if (!dbgOpen) return;
      waveAF = requestAnimationFrame(frame);
      phase += 0.08;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = isCyanMode() ? 'rgba(0,229,255,0.12)' : 'rgba(37,99,235,0.15)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();

      const grad = ctx.createLinearGradient(0,0,W,0);
      if (isCyanMode()) {
        grad.addColorStop(0,   'rgba(0,229,255,0.15)');
        grad.addColorStop(0.5, 'rgba(0,229,255,0.6)');
        grad.addColorStop(1,   'rgba(157,78,221,0.4)');
      } else {
        grad.addColorStop(0,   'rgba(37,99,235,0.2)');
        grad.addColorStop(0.5, 'rgba(37,99,235,0.8)');
        grad.addColorStop(1,   'rgba(14,165,233,0.4)');
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const t  = x / W;
        const a1 = Math.sin(t * Math.PI * 6  + phase)       * 10;
        const a2 = Math.sin(t * Math.PI * 14 + phase * 1.7) * 5;
        const a3 = Math.sin(t * Math.PI * 3  + phase * 0.5) * 7;
        const y  = H/2 + a1 + a2 + a3;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    frame();
  }

  function isCyanMode() { return currentMode === 'night'; }

  function drawWave(analyser, ctx, W, H) {
    const bufLen  = analyser.frequencyBinCount;
    const dataArr = new Uint8Array(bufLen);
    const isCyan  = () => isCyanMode();

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
  //  COMMAND PHRASE EDITOR
  //  Users can type custom trigger words in the debug panel.
  //  Changes take effect immediately — no code edit needed.
  // ═══════════════════════════════════════════════════════════
  function initCommandEditor() {
    const ariseInput   = document.getElementById('vd-arise-input');
    const descendInput = document.getElementById('vd-descend-input');
    const hint         = document.getElementById('vd-cmd-hint');
    if (!ariseInput || !descendInput) return;

    function saveCommand(cmd, raw) {
      const word = raw.trim().toLowerCase();
      if (!word) return;
      // Build variants: exact + with punctuation + common mishears
      const variants = [word, word + '!', word.replace(/\s+/g, ' ')];
      // Add phonetic first-word match
      if (word.split(' ').length === 1) variants.push('the ' + word);

      if (cmd === 'arise') {
        ARISE_WORDS = [...variants, ...ARISE_DEFAULTS.filter(w => !variants.includes(w)).slice(0, 3)];
      } else {
        DESCEND_WORDS = [...variants, ...DESCEND_DEFAULTS.filter(w => !variants.includes(w)).slice(0, 3)];
      }

      if (hint) {
        hint.textContent = `✓ "${word}" set as ${cmd.toUpperCase()} trigger`;
        hint.style.color = '#00ff88';
        setTimeout(() => {
          hint.textContent = 'Type a word and press SAVE or Enter';
          hint.style.color = '';
        }, 2500);
      }
      if (window.__voiceDebug) window.__voiceDebug.log('cmd', `Custom trigger set — ${cmd.toUpperCase()}: "${word}"`);
    }

    // SAVE buttons
    document.querySelectorAll('.vd-cmd-save').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd   = btn.dataset.cmd;
        const input = document.getElementById(`vd-${cmd}-input`);
        if (input) saveCommand(cmd, input.value);
      });
    });

    // Enter key in inputs
    [ariseInput, descendInput].forEach(input => {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const cmd = input.id === 'vd-arise-input' ? 'arise' : 'descend';
          saveCommand(cmd, input.value);
        }
      });
    });

    // Reset buttons
    document.querySelectorAll('.vd-cmd-reset').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        if (cmd === 'arise')   { ARISE_WORDS   = [...ARISE_DEFAULTS];   ariseInput.value   = 'arise'; }
        if (cmd === 'descend') { DESCEND_WORDS = [...DESCEND_DEFAULTS]; descendInput.value = 'descend'; }
        if (hint) { hint.textContent = 'Reset to defaults'; hint.style.color = '#fbbf24'; setTimeout(() => { hint.textContent = 'Type a word and press SAVE or Enter'; hint.style.color = ''; }, 2000); }
        if (window.__voiceDebug) window.__voiceDebug.log('info', `${cmd.toUpperCase()} reset to defaults`);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  BOOT
  // ═══════════════════════════════════════════════════════════
  let nightWorldBooted = false;

  function bootNightWorld() {
    // Allow re-boot every time Arise fires (reset flag)
    nightWorldBooted = true;

    // Give the DOM a frame to fully show the night world
    // then boot everything fresh
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // 1. Force brain canvas to correct size
        if (window.__brainForceResize) window.__brainForceResize();

        // 2. Reset + restart the QNN node assembly sequence
        if (window.__nightBootBrain) window.__nightBootBrain();

        // 3. Boot HUD + canvases + scroll reveals + profile overlay
        if (window.__nightBootMain) window.__nightBootMain();
      });
    });
  }

  function init() {
    // Ensure correct initial state — night world stays hidden until Arise
    worldNight?.classList.add('hidden');
    worldDay?.classList.remove('hidden');
    showEl(voiceBtn());
    hideEl(returnBtn());
    updateNav();
    startLoader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
