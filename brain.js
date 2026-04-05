/* ═══════════════════════════════════════════════════════
   QUANTUM NEURAL NETWORK BRAIN  v3
   — True 3D volumetric brain with shader glow
   — Click brain → avatar profile reveal sequence
   — Quantum superposition / entanglement effects
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('brain-canvas');
  if (!canvas) return;

  // ── Renderer ─────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 160);

  // ── Fog for depth ─────────────────────────
  scene.fog = new THREE.FogExp2(0x02020f, 0.0035);

  // ── Lighting (physical) ───────────────────
  scene.add(new THREE.AmbientLight(0x0a0a2a, 2));
  const light1 = new THREE.PointLight(0x00e5ff, 6, 300);
  light1.position.set(60, 60, 60);
  scene.add(light1);
  const light2 = new THREE.PointLight(0x7c3aed, 5, 300);
  light2.position.set(-60, -40, 40);
  scene.add(light2);
  const light3 = new THREE.PointLight(0x00ff88, 3, 200);
  light3.position.set(0, -80, -40);
  scene.add(light3);

  // ══════════════════════════════════════════
  //  QUANTUM BRAIN — node layout
  // ══════════════════════════════════════════
  const ZONES = {
    ai:      { color: 0x00e5ff, emissive: 0x003344, center: new THREE.Vector3(-22, 12,  8),  count: 24, label: 'AI Systems' },
    quantum: { color: 0x9d4edd, emissive: 0x2d0066, center: new THREE.Vector3( 22, -6, 12),  count: 22, label: 'Quantum' },
    cyber:   { color: 0x00ff88, emissive: 0x003322, center: new THREE.Vector3(  0,  28, -8), count: 20, label: 'Cybersecurity' },
    core:    { color: 0xff2d87, emissive: 0x440011, center: new THREE.Vector3(  0,  0,  0),  count: 10, label: 'Core' },
  };

  const ZONE_DETAILS = {
    ai: {
      title: 'AI Systems',
      desc: 'Deep learning for adversarial robustness, ensemble methods, and neural architectures in security-critical applications.',
      items: ['LSTM + Attention Networks','CNN Ensembles','Isolation Forest','Federated Learning','Adversarial ML','PyTorch / TensorFlow']
    },
    quantum: {
      title: 'Quantum Computing',
      desc: 'Quantum-classical hybrid systems using Cirq and Qiskit — next-generation security through quantum advantage.',
      items: ['Qiskit / Cirq','Quantum Bayesian Inference','Variational Algorithms','Post-Quantum Cryptography','Quantum Error Correction','Superposition & Entanglement']
    },
    cyber: {
      title: 'Cybersecurity',
      desc: 'Full-spectrum security from penetration testing to enterprise quantum-enhanced defense platform architecture.',
      items: ['Penetration Testing','Intrusion Detection','Threat Modeling','Incident Response','SIEM / IDS','Palo Alto Networks','Metasploit / Burp Suite']
    },
    core: {
      title: 'Research Core',
      desc: 'IEEE published researcher, Johns Hopkins MS Cybersecurity. Building quantum-resilient defenses for tomorrow.',
      items: ['IEEE Published 2026','arXiv:2507.00403','JHU Teaching Assistant','Head Consultant Quaranta.io','CISSP Certified','4+ Years Research']
    }
  };

  // ── Node meshes ────────────────────────────
  const nodes = [];
  const meshToNode = new Map();

  // Shared geometries
  const GEO = {
    sm: new THREE.IcosahedronGeometry(0.9, 1),
    md: new THREE.IcosahedronGeometry(1.7, 2),
    lg: new THREE.IcosahedronGeometry(3.2, 3),
    xl: new THREE.IcosahedronGeometry(5.0, 3),
  };

  function buildNode(zoneKey, zone, idx) {
    const isCore  = (zoneKey === 'core' && idx < 3);
    const size    = isCore ? 'xl' : (Math.random() > 0.8 ? 'lg' : (Math.random() > 0.5 ? 'md' : 'sm'));
    const spread  = isCore ? 6 : 30;

    const mat = new THREE.MeshStandardMaterial({
      color:     zone.color,
      emissive:  zone.emissive,
      emissiveIntensity: 1.2,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9,
    });

    // Outer glow sphere
    const glowMat = new THREE.MeshBasicMaterial({
      color: zone.color,
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide,
    });

    const mesh = new THREE.Mesh(GEO[size], mat);
    const glowGeo = new THREE.SphereGeometry(GEO[size].parameters?.radius * 2.5 || 4, 8, 8);
    const glow = new THREE.Mesh(glowGeo, glowMat);

    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = spread * (0.3 + Math.random() * 0.7);

    const pos = new THREE.Vector3(
      zone.center.x + r * Math.sin(phi) * Math.cos(theta),
      zone.center.y + r * Math.sin(phi) * Math.sin(theta),
      zone.center.z + r * Math.cos(phi)
    );
    mesh.position.copy(pos);
    glow.position.copy(pos);

    scene.add(mesh);
    scene.add(glow);

    const node = {
      mesh, glow, zoneKey, zone,
      color: zone.color,
      originalPos: pos.clone(),
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed:  0.5 + Math.random() * 1.0,
      floatAmp:    0.4 + Math.random() * 0.8,
      floatFreq:   0.3 + Math.random() * 0.4,
      isCore, size,
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      )
    };
    meshToNode.set(mesh, node);
    return node;
  }

  Object.entries(ZONES).forEach(([key, zone]) => {
    for (let i = 0; i < zone.count; i++) nodes.push(buildNode(key, zone, i));
  });

  // ── Assembly state: all nodes start collapsed at origin, invisible ──
  let assemblyDone = false;
  nodes.forEach(n => {
    n.mesh.scale.setScalar(0.001);
    n.mesh.material.opacity = 0;
    n.glow.material.opacity = 0;
    // Store final position, start at core origin
    n.assembleFrom = new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4
    );
    n.mesh.position.copy(n.assembleFrom);
    n.glow.position.copy(n.assembleFrom);
    n.assembling = false;
    n.assembled  = false;
    n.assembleT  = 0; // 0 → 1 lerp progress
  });

  // Hide all connections until assembly done
  // (connections built later, stored in array)

  // Update HUD
  const hudNodes  = document.getElementById('hud-nodes');
  const hudQubits = document.getElementById('hud-qubits');
  if (hudNodes)  hudNodes.textContent  = nodes.length;
  if (hudQubits) hudQubits.textContent = Math.floor(nodes.length * 0.6);

  // ── Neural connections ─────────────────────
  const connections = [];

  function hexToRgb(hex) {
    return { r: ((hex >> 16) & 255) / 255, g: ((hex >> 8) & 255) / 255, b: (hex & 255) / 255 };
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = nodes[i].mesh.position.distanceTo(nodes[j].mesh.position);
      const sameZone = nodes[i].zoneKey === nodes[j].zoneKey;
      const thresh = sameZone ? 28 : 16;
      if (dist < thresh && Math.random() > 0.55) {
        const col = sameZone ? nodes[i].zone.color : 0x334466;
        const c = hexToRgb(col);
        const mat = new THREE.LineBasicMaterial({
          color: col,
          transparent: true,
          opacity: sameZone ? 0.14 : 0.06,
        });
        const geo = new THREE.BufferGeometry().setFromPoints([
          nodes[i].mesh.position.clone(),
          nodes[j].mesh.position.clone()
        ]);
        mat.opacity = 0; // hidden until assembly done
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        connections.push({
          line, nodeA: nodes[i], nodeB: nodes[j],
          baseOpacity: sameZone ? 0.14 : 0.06,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  // ── Flow particles along synapses ──────────
  const flowParticles = [];
  const flowGeo = new THREE.SphereGeometry(0.4, 6, 6);

  connections.filter(() => Math.random() > 0.6).slice(0, 70).forEach(conn => {
    const mat = new THREE.MeshBasicMaterial({
      color: conn.nodeA.zone.color,
      transparent: true, opacity: 0.0,
    });
    const mesh = new THREE.Mesh(flowGeo, mat);
    scene.add(mesh);
    flowParticles.push({
      mesh, conn,
      t: Math.random(),
      speed: 0.004 + Math.random() * 0.010,
      dir: Math.random() > 0.5 ? 1 : -1,
    });
  });

  // ══════════════════════════════════════════
  //  QUANTUM EFFECTS
  // ══════════════════════════════════════════

  // ── Qubit orbital rings (3 tilted) ────────
  const qubitRings = [];
  for (let i = 0; i < 4; i++) {
    const r = 42 + i * 14;
    const ringGeo = new THREE.TorusGeometry(r, 0.18, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x00e5ff : 0x9d4edd,
      transparent: true,
      opacity: 0, // hidden until assembly done
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = (Math.PI / 5) * (i + 0.3);
    ring.rotation.y = (Math.PI / 6) * i;
    scene.add(ring);

    // Qubit bead on each ring
    const beadMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00e5ff : 0x9d4edd, transparent: true, opacity: 0 });
    const bead = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 10), beadMat);
    ring.add(bead);
    const angle = Math.random() * Math.PI * 2;
    bead.position.set(r * Math.cos(angle), r * Math.sin(angle), 0);

    qubitRings.push({
      ring, bead, r,
      ringMat,  beadMat,
      targetRingOp: 0.06 + i * 0.01,
      angle: Math.random() * Math.PI * 2,
      speed: (0.004 + Math.random() * 0.003) * (i % 2 === 0 ? 1 : -1),
      driftX: 0.0004 + Math.random() * 0.0003,
      driftY: 0.0003 + Math.random() * 0.0002,
    });
  }

  // ── Entanglement beam (pulsing line between two nodes) ──
  const entBeams = [];
  for (let k = 0; k < 6; k++) {
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const b = nodes[Math.floor(Math.random() * nodes.length)];
    if (a === b) continue;
    const mat = new THREE.LineBasicMaterial({ color: 0xff2d87, transparent: true, opacity: 0.0 });
    const geo = new THREE.BufferGeometry().setFromPoints([a.mesh.position.clone(), b.mesh.position.clone()]);
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    entBeams.push({ line, a, b, phase: Math.random() * Math.PI * 2, period: 3 + Math.random() * 4 });
  }

  // ── Quantum field — large point cloud ─────
  const fieldCount = 3000;
  const fieldPos = new Float32Array(fieldCount * 3);
  const fieldCol = new Float32Array(fieldCount * 3);
  for (let i = 0; i < fieldCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 60 + Math.random() * 80;
    fieldPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    fieldPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    fieldPos[i * 3 + 2] = r * Math.cos(phi);
    // Cyan/purple mix
    const t = Math.random();
    fieldCol[i * 3]     = t * 0.0 + (1 - t) * 0.6;
    fieldCol[i * 3 + 1] = t * 0.9 + (1 - t) * 0.2;
    fieldCol[i * 3 + 2] = t * 1.0 + (1 - t) * 0.9;
  }
  const fieldGeo = new THREE.BufferGeometry();
  fieldGeo.setAttribute('position', new THREE.BufferAttribute(fieldPos, 3));
  fieldGeo.setAttribute('color', new THREE.BufferAttribute(fieldCol, 3));
  const fieldMat = new THREE.PointsMaterial({
    size: 0.5, vertexColors: true, transparent: true, opacity: 0.22, sizeAttenuation: true,
  });
  scene.add(new THREE.Points(fieldGeo, fieldMat));

  // ── Deep star field ────────────────────────
  const starCount = 2500;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 900;
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0.18 })));

  // ── Central brain core (glowing orb) ──────
  const coreOrb = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xff2d87,
      emissive: 0xff2d87,
      emissiveIntensity: 0.8,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0, // hidden until assembly done
    })
  );
  scene.add(coreOrb);

  // Outer glow shell around core
  const coreGlowMesh = new THREE.Mesh(
    new THREE.SphereGeometry(8, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xff2d87, transparent: true, opacity: 0, side: THREE.BackSide })
  );
  scene.add(coreGlowMesh);

  // ── Superposition probability cloud ───────
  const superCount = 800;
  const superPos   = new Float32Array(superCount * 3);
  for (let i = 0; i < superCount; i++) {
    const u = Math.random(), v = Math.random(), w = Math.random();
    superPos[i * 3]     = 18 * (u + v + w - 1.5);
    superPos[i * 3 + 1] = 18 * (u - v + w - 0.5) * 0.8;
    superPos[i * 3 + 2] = 18 * (u + v - w - 0.5) * 0.6;
  }
  const superGeo = new THREE.BufferGeometry();
  superGeo.setAttribute('position', new THREE.BufferAttribute(superPos, 3));
  const superCloud = new THREE.Points(superGeo, new THREE.PointsMaterial({
    color: 0x9d4edd, size: 0.7, transparent: true, opacity: 0.35, sizeAttenuation: true,
  }));
  scene.add(superCloud);

  // ══════════════════════════════════════════
  //  INTERACTION
  // ══════════════════════════════════════════
  const raycaster   = new THREE.Raycaster();
  raycaster.params.Points = { threshold: 2 };
  const mouse       = new THREE.Vector2(-999, -999);
  let hoveredNode   = null;
  document.addEventListener('mousemove', e => {
    mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Click on canvas → always open profile (or zone panel if hovering a non-core node)
  canvas.addEventListener('click', () => {
    if (hoveredNode && hoveredNode.zoneKey !== 'core' && !hoveredNode.isCore) {
      openZonePanel(hoveredNode.zoneKey);
    } else {
      openProfile();
    }
  });

  // Zone label clicks
  document.querySelectorAll('.zone-label').forEach(el => {
    el.addEventListener('click', () => openZonePanel(el.dataset.zone));
  });

  // Zone panel close
  document.getElementById('zone-panel-close')?.addEventListener('click', () => {
    document.getElementById('zone-panel')?.classList.add('hidden');
    window.QuantumAudio?.panelClose();
  });

  // ── Profile reveal ────────────────────────
  function openProfile() {
    // Always allow re-open — main.js guards double-opens
    if (window.__triggerProfileReveal) window.__triggerProfileReveal();
    window.QuantumAudio?.panelOpen();

    // Zoom camera in slowly toward core
    let zoom = 0;
    const zoomInterval = setInterval(() => {
      zoom += 0.015;
      camera.position.z = 160 - zoom * 40;
      if (zoom >= 1) {
        clearInterval(zoomInterval);
        camera.position.z = 120;
      }
    }, 16);

    // Burst particles outward from core
    burstParticles();
  }

  function burstParticles() {
    const count = 60;
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xff2d87, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 4, 4), mat);
      mesh.position.set(0, 0, 0);
      scene.add(mesh);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
      );
      let life = 0;
      const tick = setInterval(() => {
        life++;
        mesh.position.add(vel);
        mat.opacity = 0.9 * (1 - life / 50);
        if (life >= 50) { clearInterval(tick); scene.remove(mesh); }
      }, 16);
    }
  }

  // ── Zone panel ────────────────────────────
  function openZonePanel(zone) {
    const panel   = document.getElementById('zone-panel');
    const content = document.getElementById('zone-panel-content');
    const data    = ZONE_DETAILS[zone] || ZONE_DETAILS['core'];
    if (!panel || !content) return;

    const colorMap = { ai: '#00e5ff', quantum: '#9d4edd', cyber: '#00ff88', core: '#ff2d87' };
    const col = colorMap[zone] || '#00e5ff';

    content.innerHTML = `
      <div class="zp-header">
        <div class="zp-color-bar" style="background:${col}"></div>
        <h2 style="color:${col}">${data.title}</h2>
      </div>
      <p class="zp-desc">${data.desc}</p>
      <ul class="zp-list">${data.items.map(i => `<li><span class="zp-bullet" style="color:${col}">▸</span>${i}</li>`).join('')}</ul>
    `;
    panel.classList.remove('hidden');
    window.QuantumAudio?.panelOpen();
  }

  // ── Camera mouse drift ────────────────────
  let tCamX = 0, tCamY = 0, cCamX = 0, cCamY = 0;
  let autoRotAngle = 0;

  document.addEventListener('mousemove', e => {
    tCamX =  (e.clientX / window.innerWidth  - 0.5) * 18;
    tCamY = -(e.clientY / window.innerHeight - 0.5) * 12;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ══════════════════════════════════════════
  //  QNN ASSEMBLY SEQUENCE
  // ══════════════════════════════════════════
  //
  // Triggered after the page loader disappears (~2s).
  // Nodes fly out one by one from the core; connections
  // draw in after; rings fade in; then entry prompt appears.

  const ASSEMBLY_STAGGER  = 38;   // ms between each node firing
  const ASSEMBLY_DURATION = 900;  // ms for each node to reach target
  const EASING = t => 1 - Math.pow(1 - t, 3); // cubic ease-out

  // Node sort: core nodes first, then by distance from origin
  const assemblyOrder = [...nodes].sort((a, b) => {
    if (a.isCore && !b.isCore) return -1;
    if (!a.isCore && b.isCore) return  1;
    return a.originalPos.length() - b.originalPos.length();
  });

  let assemblyActive = false;

  function startAssembly() {
    if (assemblyActive) return;
    assemblyActive = true;

    const heroEntry = document.getElementById('hero-entry');

    assemblyOrder.forEach((node, idx) => {
      setTimeout(() => {
        node.assembling = true;
        node.assembleStartTime = performance.now();
      }, idx * ASSEMBLY_STAGGER);
    });

    // Total time for all nodes to land
    const totalNodeTime = assemblyOrder.length * ASSEMBLY_STAGGER + ASSEMBLY_DURATION;

    // After nodes land: fade in connections, rings, core orb
    setTimeout(() => {
      assemblyDone = true;

      // Fade connections in over 600ms
      let connT = 0;
      const connInterval = setInterval(() => {
        connT = Math.min(connT + 0.025, 1);
        connections.forEach(c => {
          c.line.material.opacity = connT * c.baseOpacity;
        });
        if (connT >= 1) clearInterval(connInterval);
      }, 16);

      // Fade in qubit rings sequentially
      qubitRings.forEach((q, i) => {
        setTimeout(() => {
          let rt = 0;
          const ri = setInterval(() => {
            rt = Math.min(rt + 0.03, 1);
            q.ringMat.opacity = rt * q.targetRingOp;
            q.beadMat.opacity = rt * 0.95;
            if (rt >= 1) clearInterval(ri);
          }, 16);
        }, i * 180);
      });

      // Fade in core orb
      let ct = 0;
      const coreIn = setInterval(() => {
        ct = Math.min(ct + 0.02, 1);
        coreOrb.material.opacity = ct * 0.7;
        coreGlowMesh.material.opacity = ct * 0.06;
        if (ct >= 1) clearInterval(coreIn);
      }, 16);

      // Show entry prompt after everything is settled
      setTimeout(() => {
        if (heroEntry) {
          heroEntry.style.transition = 'opacity 0.8s ease';
          heroEntry.style.opacity    = '1';
        }
      }, 700);

    }, totalNodeTime);
  }

  // Wait for page loader to finish (~2s) then start assembly
  // We watch for the loader to get class 'gone' or after 2.2s fallback
  function waitForLoaderThenAssemble() {
    const loader = document.getElementById('loader');
    if (!loader) { startAssembly(); return; }
    const check = setInterval(() => {
      if (loader.classList.contains('gone') || loader.style.display === 'none') {
        clearInterval(check);
        setTimeout(startAssembly, 200); // small buffer after loader fades
      }
    }, 100);
    // Hard fallback
    setTimeout(() => { clearInterval(check); startAssembly(); }, 2600);
  }
  waitForLoaderThenAssemble();

  // Hide entry prompt initially (shown by assembly sequence)
  const heroEntryEl = document.getElementById('hero-entry');
  if (heroEntryEl) heroEntryEl.style.opacity = '0';

  // ══════════════════════════════════════════
  //  ANIMATION LOOP
  // ══════════════════════════════════════════
  let frame = 0;
  const meshList = nodes.map(n => n.mesh);

  function animate() {
    requestAnimationFrame(animate);
    frame++;
    const t = frame * 0.008;

    // Camera smooth drift + slow auto-rotate when idle
    cCamX += (tCamX - cCamX) * 0.035;
    cCamY += (tCamY - cCamY) * 0.035;
    autoRotAngle += 0.0008;
    camera.position.x = cCamX + Math.sin(autoRotAngle) * 8;
    camera.position.y = cCamY + Math.cos(autoRotAngle * 0.7) * 4;
    camera.lookAt(scene.position);

    // Pulse nodes (with assembly animation)
    const now = performance.now();
    nodes.forEach((n, i) => {

      // ── ASSEMBLY phase: lerp from origin to final position ──
      if (n.assembling && !n.assembled) {
        const elapsed = now - n.assembleStartTime;
        const raw     = Math.min(elapsed / ASSEMBLY_DURATION, 1);
        const ease    = EASING(raw);

        // Position: fly from near-core to final spot
        n.mesh.position.lerpVectors(n.assembleFrom, n.originalPos, ease);
        n.glow.position.copy(n.mesh.position);

        // Scale: grow from 0 to 1
        const sc = ease;
        n.mesh.scale.setScalar(sc);

        // Opacity: fade in
        n.mesh.material.opacity = ease * 0.92;
        n.glow.material.opacity = ease * 0.055;
        n.mesh.material.emissiveIntensity = ease * 2;

        if (raw >= 1) {
          n.assembled  = true;
          n.assembling = false;
          n.mesh.scale.setScalar(1);
          n.mesh.position.copy(n.originalPos);
        }
        return; // skip idle pulse while assembling
      }

      // ── IDLE phase: normal pulse ──
      if (!n.assembled) return; // not yet spawned

      const pulse = 0.55 + 0.45 * Math.sin(t * n.pulseSpeed + n.pulseOffset);
      n.mesh.material.opacity = pulse * 0.92;
      n.glow.material.opacity = pulse * 0.055;
      n.mesh.material.emissiveIntensity = 0.8 + 0.6 * pulse;
      n.mesh.position.y = n.originalPos.y + Math.sin(t * n.floatFreq + i * 0.35) * n.floatAmp;
      n.glow.position.copy(n.mesh.position);
      // Slow rotate icosahedra
      n.mesh.rotation.x += n.rotSpeed.x;
      n.mesh.rotation.y += n.rotSpeed.y;
    });

    // Pulse connections (only after assembly)
    connections.forEach(c => {
      if (!assemblyDone) return;
      const pulse = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.6 + c.pulseOffset));
      c.line.material.opacity = pulse * c.baseOpacity;
      // Update line endpoints (nodes float)
      const pts = c.line.geometry.attributes.position;
      pts.array[0] = c.nodeA.mesh.position.x;
      pts.array[1] = c.nodeA.mesh.position.y;
      pts.array[2] = c.nodeA.mesh.position.z;
      pts.array[3] = c.nodeB.mesh.position.x;
      pts.array[4] = c.nodeB.mesh.position.y;
      pts.array[5] = c.nodeB.mesh.position.z;
      pts.needsUpdate = true;
    });

    // Flow particles (only after assembly)
    flowParticles.forEach(fp => {
      if (!assemblyDone) { fp.mesh.material.opacity = 0; return; }
      fp.t += fp.speed * fp.dir;
      if (fp.t > 1 || fp.t < 0) fp.dir *= -1;
      const a = fp.conn.nodeA.mesh.position;
      const b = fp.conn.nodeB.mesh.position;
      fp.mesh.position.lerpVectors(a, b, fp.t);
      fp.mesh.material.opacity = 0.8 * Math.sin(fp.t * Math.PI);
    });

    // Orbital qubit rings
    qubitRings.forEach(q => {
      q.angle += q.speed;
      q.bead.position.set(q.r * Math.cos(q.angle), q.r * Math.sin(q.angle), 0);
      q.ring.rotation.x += q.driftX;
      q.ring.rotation.z += q.driftY;
    });

    // Entanglement beams (only after assembly)
    entBeams.forEach(eb => {
      if (!assemblyDone) return;
      const progress = (Math.sin(t / eb.period + eb.phase) + 1) * 0.5;
      eb.line.material.opacity = 0.35 * progress;
      const pts = eb.line.geometry.attributes.position;
      pts.array[0] = eb.a.mesh.position.x;
      pts.array[1] = eb.a.mesh.position.y;
      pts.array[2] = eb.a.mesh.position.z;
      pts.array[3] = eb.b.mesh.position.x;
      pts.array[4] = eb.b.mesh.position.y;
      pts.array[5] = eb.b.mesh.position.z;
      pts.needsUpdate = true;
    });

    // Core orb pulse (only after assembled)
    if (assemblyDone) {
      const corePulse = 0.7 + 0.3 * Math.sin(t * 1.5);
      coreOrb.material.emissiveIntensity = corePulse * 1.2;
      coreOrb.scale.setScalar(1 + 0.06 * Math.sin(t * 2.1));
      coreGlowMesh.scale.setScalar(1 + 0.12 * Math.sin(t * 1.6));
    }

    // Superposition cloud slow rotate
    superCloud.rotation.y = t * 0.12;
    superCloud.rotation.x = t * 0.07;

    // Quantum field slow spin
    scene.children.forEach(c => {
      if (c.isPoints && c === superCloud) return; // skip supercloud
    });

    // Raycasting hover
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(meshList);
    if (hits.length > 0) {
      const hit = meshToNode.get(hits[0].object);
      if (hit && hit !== hoveredNode) {
        if (hoveredNode) {
          hoveredNode.mesh.material.color.setHex(hoveredNode.color);
          hoveredNode.mesh.material.emissiveIntensity = 1.2;
          hoveredNode.mesh.scale.setScalar(1);
        }
        hoveredNode = hit;
        hoveredNode.mesh.material.color.setHex(0xffffff);
        hoveredNode.mesh.material.emissiveIntensity = 3;
        hoveredNode.mesh.scale.setScalar(2.0);
        canvas.style.cursor = 'pointer';
      }
    } else {
      if (hoveredNode) {
        hoveredNode.mesh.material.color.setHex(hoveredNode.color);
        hoveredNode.mesh.material.emissiveIntensity = 1.2;
        hoveredNode.mesh.scale.setScalar(1);
        hoveredNode = null;
        canvas.style.cursor = 'none';
      }
    }

    renderer.render(scene, camera);
  }

  animate();

  // Expose
  window.__brainScene  = scene;
  window.__brainCamera = camera;
  window.__quantumNodes = nodes.length;

  // ── Night boot hook ──────────────────────────────────────
  // Called by inception-main.js when "Arise" fires so the assembly
  // sequence runs fresh even though scripts already loaded once.
  window.__nightBootBrain = function () {
    // Reset assembly state and restart
    assemblyActive = false;
    assemblyOrder.forEach(node => {
      node.assembling = false;
      node.assembled  = false;
      node.assembleT  = 0;
      node.mesh.scale.setScalar(0.001);
      node.mesh.material.opacity = 0;
      node.glow.material.opacity = 0;
      node.mesh.position.copy(node.assembleFrom);
      node.glow.position.copy(node.assembleFrom);
    });
    // Reset connections + qubit rings + core
    connections.forEach(c => { c.line.material.opacity = 0; });
    qubitRings.forEach(q => { q.ringMat.opacity = 0; q.beadMat.opacity = 0; });
    coreOrb.material.opacity = 0;
    coreGlowMesh.material.opacity = 0;
    const heroEntryEl = document.getElementById('hero-entry');
    if (heroEntryEl) heroEntryEl.style.opacity = '0';
    // Restart
    startAssembly();
  };

})();
