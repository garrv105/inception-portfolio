/* ═══════════════════════════════════════════════════════════
   HOLOGRAPHIC 3D AVATAR
   Appears after boot sequence completes.
   Full Three.js scene — wireframe bust + rings + particles
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  // ── DOM wrapper ───────────────────────────────────────────
  const wrapper = document.getElementById('avatar-hero');
  const cvs     = document.getElementById('avatar-hero-canvas');
  if (!wrapper || !cvs) return;

  // ── Renderer ──────────────────────────────────────────────
  const W = 340, H = 500;
  cvs.width  = W;
  cvs.height = H;

  const renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, W / H, 0.1, 500);
  camera.position.set(0, 1.4, 8.5);
  camera.lookAt(0, 1.8, 0);

  // ── Lighting ──────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x0a0a2a, 3));
  const keyLight = new THREE.PointLight(0x00e5ff, 8, 40);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0x9d4edd, 5, 40);
  fillLight.position.set(-3, 2, 2);
  scene.add(fillLight);
  const rimLight = new THREE.PointLight(0x00ff88, 3, 30);
  rimLight.position.set(0, -3, -4);
  scene.add(rimLight);

  // ── Holographic material helper ────────────────────────────
  function holoMat(color, opacity) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6,
      metalness: 0.1,
      roughness: 0.3,
      transparent: true,
      opacity,
      wireframe: false,
    });
  }

  function wireMat(color, opacity) {
    return new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity,
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  AVATAR BUST — built from primitives (head + neck + torso)
  // ═══════════════════════════════════════════════════════════
  const avatarGroup = new THREE.Group();
  scene.add(avatarGroup);

  // HEAD — slightly flattened sphere
  const headGeo   = new THREE.SphereGeometry(0.95, 32, 24);
  const headSolid = new THREE.Mesh(headGeo, holoMat(0x00e5ff, 0.08));
  const headWire  = new THREE.Mesh(headGeo, wireMat(0x00e5ff, 0.35));
  headSolid.position.y = 3.0;
  headWire.position.y  = 3.0;
  headSolid.scale.set(1, 1.15, 0.9);
  headWire.scale.set(1, 1.15, 0.9);
  avatarGroup.add(headSolid, headWire);

  // SKULL CAP — emissive top highlight
  const capGeo  = new THREE.SphereGeometry(0.96, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const capMesh = new THREE.Mesh(capGeo, new THREE.MeshBasicMaterial({
    color: 0x00e5ff, transparent: true, opacity: 0.12, side: THREE.BackSide
  }));
  capMesh.position.y = 3.0;
  capMesh.scale.set(1, 1.15, 0.9);
  avatarGroup.add(capMesh);

  // FACE PLANE — faint grid overlay on face
  const faceGeo  = new THREE.PlaneGeometry(1.1, 1.3, 8, 10);
  const faceMesh = new THREE.Mesh(faceGeo, wireMat(0x00e5ff, 0.12));
  faceMesh.position.set(0, 3.0, 0.88);
  avatarGroup.add(faceMesh);

  // NECK
  const neckGeo   = new THREE.CylinderGeometry(0.28, 0.32, 0.6, 12);
  const neckSolid = new THREE.Mesh(neckGeo, holoMat(0x00e5ff, 0.07));
  const neckWire  = new THREE.Mesh(neckGeo, wireMat(0x00e5ff, 0.25));
  neckSolid.position.y = 2.05;
  neckWire.position.y  = 2.05;
  avatarGroup.add(neckSolid, neckWire);

  // SHOULDERS — wide capped cylinder
  const shoulderGeo   = new THREE.CylinderGeometry(1.55, 1.2, 0.25, 20);
  const shoulderSolid = new THREE.Mesh(shoulderGeo, holoMat(0x00e5ff, 0.07));
  const shoulderWire  = new THREE.Mesh(shoulderGeo, wireMat(0x00e5ff, 0.22));
  shoulderSolid.position.y = 1.72;
  shoulderWire.position.y  = 1.72;
  avatarGroup.add(shoulderSolid, shoulderWire);

  // TORSO
  const torsoGeo   = new THREE.CylinderGeometry(1.15, 0.9, 1.6, 20);
  const torsoSolid = new THREE.Mesh(torsoGeo, holoMat(0x9d4edd, 0.06));
  const torsoWire  = new THREE.Mesh(torsoGeo, wireMat(0x9d4edd, 0.20));
  torsoSolid.position.y = 0.9;
  torsoWire.position.y  = 0.9;
  avatarGroup.add(torsoSolid, torsoWire);

  // CHEST PLATE — decorative hex mesh overlay
  const chestGeo  = new THREE.TorusGeometry(0.45, 0.04, 6, 6);
  const chestMesh = new THREE.Mesh(chestGeo, new THREE.MeshBasicMaterial({
    color: 0x00e5ff, transparent: true, opacity: 0.5,
  }));
  chestMesh.position.set(0, 1.1, 1.0);
  chestMesh.rotation.x = Math.PI / 2;
  avatarGroup.add(chestMesh);

  // Chest glow orb
  const chestOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.9 })
  );
  chestOrb.position.set(0, 1.1, 1.0);
  avatarGroup.add(chestOrb);

  // COLLAR RING
  const collarGeo  = new THREE.TorusGeometry(0.38, 0.06, 8, 40);
  const collarMesh = new THREE.Mesh(collarGeo, new THREE.MeshBasicMaterial({
    color: 0x00e5ff, transparent: true, opacity: 0.45,
  }));
  collarMesh.position.y = 1.72;
  collarMesh.rotation.x = Math.PI / 2;
  avatarGroup.add(collarMesh);

  // ── Full-body holographic scan sweep ─────────────────────────
  // Three scan planes: wide horizontal slabs that travel root→crown
  // Each plane is a thin flat box rendered with DoubleSide so it glows
  const scanPlanes = [];
  const SCAN_COLORS = [0x00e5ff, 0x9d4edd, 0x00e5ff];
  const SCAN_SPEEDS = [0.007, 0.005, 0.009]; // different rates for organic feel
  for (let s = 0; s < 3; s++) {
    const planeGeo = new THREE.PlaneGeometry(2.4, 0.018, 1, 1);
    const planeMat = new THREE.MeshBasicMaterial({
      color: SCAN_COLORS[s],
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = Math.PI / 2; // lay flat (horizontal)
    // start offset so they don't all sync
    const startPhase = s / 3;
    avatarGroup.add(plane);
    scanPlanes.push({ plane, mat: planeMat, phase: startPhase, speed: SCAN_SPEEDS[s] });
  }

  // Bright leading edge line for each scan plane
  const scanEdges = [];
  for (let s = 0; s < 3; s++) {
    const edgeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.3, 0, 0),
      new THREE.Vector3( 1.3, 0, 0),
    ]);
    const edgeMat = new THREE.LineBasicMaterial({
      color: SCAN_COLORS[s], transparent: true, opacity: 0,
    });
    const edge = new THREE.Line(edgeGeo, edgeMat);
    avatarGroup.add(edge);
    scanEdges.push({ edge, mat: edgeMat, planeRef: scanPlanes[s] });
  }

  // ── Head qubit orbit rings (tight, centered on head) ─────────
  const headOrbitRings = [];
  const HEAD_Y = 3.0; // head centre world Y in avatarGroup space
  const headOrbitDefs = [
    { r: 1.3,  thick: 0.03,  color: 0x00e5ff, rx: Math.PI / 2,       ry: 0,    speed:  0.022, driftY: 0.0006 },
    { r: 1.15, thick: 0.022, color: 0x9d4edd, rx: Math.PI / 2.8,     ry: 0.9,  speed: -0.016, driftY: 0.0004 },
    { r: 1.25, thick: 0.016, color: 0x00ff88, rx: Math.PI * 0.38,    ry: -0.4, speed:  0.013, driftY: 0.0005 },
  ];
  headOrbitDefs.forEach((def, idx) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(def.r, def.thick, 8, 100),
      new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.55 })
    );
    // position centred on the head
    ring.position.set(0, HEAD_Y, 0);
    ring.rotation.x = def.rx;
    ring.rotation.y = def.ry;
    avatarGroup.add(ring);

    // Glowing qubit bead travelling the ring
    const beadMat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.95 });
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), beadMat);
    bead.position.set(def.r, 0, 0); // starts at 3 o'clock
    ring.add(bead);

    // Glow halo behind bead
    const glowMat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.18, side: THREE.BackSide });
    const glowBead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), glowMat);
    glowBead.position.set(def.r, 0, 0);
    ring.add(glowBead);

    headOrbitRings.push({
      ring,
      bead, glowBead,
      r: def.r,
      angle: (idx / 3) * Math.PI * 2, // stagger starting angles
      speed: def.speed,
      driftY: def.driftY,
      color: def.color,
    });
  });

  // ── Holographic base disc ──────────────────────────────────
  const baseDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.6, 64),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.06, side: THREE.DoubleSide })
  );
  baseDisc.rotation.x = -Math.PI / 2;
  baseDisc.position.y = -0.0;
  scene.add(baseDisc);

  // Base ring
  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.04, 8, 80),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.55 })
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.0;
  scene.add(baseRing);

  // Inner ring
  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.02, 6, 60),
    new THREE.MeshBasicMaterial({ color: 0x9d4edd, transparent: true, opacity: 0.4 })
  );
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 0.0;
  scene.add(innerRing);

  // ── Orbiting qubit rings around avatar ────────────────────
  const orbitRings = [];
  const orbitDefs = [
    { r: 1.8, thick: 0.025, color: 0x00e5ff, rotX: Math.PI/3,   rotY: 0.2,  speed:  0.012 },
    { r: 2.1, thick: 0.018, color: 0x9d4edd, rotX: Math.PI/5,   rotY: 1.0,  speed: -0.009 },
    { r: 2.4, thick: 0.015, color: 0x00ff88, rotX: Math.PI*0.4, rotY: -0.5, speed:  0.007 },
  ];
  orbitDefs.forEach(def => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(def.r, def.thick, 8, 120),
      new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.35 })
    );
    ring.position.y = 1.8;
    ring.rotation.x = def.rotX;
    ring.rotation.y = def.rotY;
    scene.add(ring);

    // Bead on ring
    const bead = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.95 })
    );
    ring.add(bead);
    bead.position.set(def.r, 0, 0);

    orbitRings.push({ ring, bead, r: def.r, angle: Math.random() * Math.PI * 2, speed: def.speed });
  });

  // ── Particle halo ─────────────────────────────────────────
  const haloCount = 280;
  const haloPos   = new Float32Array(haloCount * 3);
  const haloCols  = new Float32Array(haloCount * 3);
  for (let i = 0; i < haloCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 2.2 + Math.random() * 0.8;
    haloPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    haloPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + 1.8;
    haloPos[i * 3 + 2] = r * Math.cos(phi);
    const t = Math.random();
    haloCols[i * 3]     = t * 0.0  + (1 - t) * 0.6;
    haloCols[i * 3 + 1] = t * 0.9  + (1 - t) * 0.2;
    haloCols[i * 3 + 2] = t * 1.0  + (1 - t) * 0.93;
  }
  const haloGeo = new THREE.BufferGeometry();
  haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos, 3));
  haloGeo.setAttribute('color',    new THREE.BufferAttribute(haloCols, 3));
  const haloPoints = new THREE.Points(haloGeo, new THREE.PointsMaterial({
    size: 0.055, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true,
  }));
  scene.add(haloPoints);

  // ── Data stream pillars (vertical lines around base) ──────
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const x = 1.55 * Math.cos(angle);
    const z = 1.55 * Math.sin(angle);
    const h = 0.3 + Math.random() * 2.0;
    const geo  = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0, z),
      new THREE.Vector3(x, h, z),
    ]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: i % 3 === 0 ? 0x00e5ff : i % 3 === 1 ? 0x9d4edd : 0x00ff88,
      transparent: true,
      opacity: 0.3 + Math.random() * 0.3,
    }));
    scene.add(line);
  }

  // ── Holographic projection beam (from base) ───────────────
  const beamGeo = new THREE.CylinderGeometry(0.02, 1.5, 4.0, 32, 1, true);
  const beamMesh = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
    color: 0x00e5ff, transparent: true, opacity: 0.04,
    side: THREE.DoubleSide,
  }));
  beamMesh.position.y = 2.0;
  scene.add(beamMesh);

  // ═══════════════════════════════════════════════════════════
  //  ANIMATION
  // ═══════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════
  //  QUANTUM DECOHERENCE ENGINE
  // ═══════════════════════════════════════════════════════════

  // Pseudo-noise: 3 irrational-ratio sines, never visibly repeats
  function qNoise(time, phase, f1, f2, f3) {
    return (
      Math.sin(time * f1 + phase)           * 0.50 +
      Math.sin(time * f2 + phase * 1.6180)  * 0.30 +
      Math.sin(time * f3 + phase * 2.4142)  * 0.20
    );
  }

  // Body part registry — each drives one mesh independently
  const qParts = [
    { mesh: headSolid,     sol: 0.08,  ghost: 0.006, phase: 0.00, f1:0.23, f2:0.71, f3:1.37, jit:0.08 },
    { mesh: headWire,      sol: 0.35,  ghost: 0.03,  phase: 0.50, f1:0.19, f2:0.61, f3:1.13, jit:0.06 },
    { mesh: capMesh,       sol: 0.12,  ghost: 0.008, phase: 1.20, f1:0.31, f2:0.83, f3:1.57, jit:0.04 },
    { mesh: faceMesh,      sol: 0.12,  ghost: 0.006, phase: 2.10, f1:0.17, f2:0.53, f3:1.91, jit:0.07 },
    { mesh: neckSolid,     sol: 0.07,  ghost: 0.004, phase: 0.80, f1:0.27, f2:0.79, f3:1.43, jit:0.04 },
    { mesh: neckWire,      sol: 0.25,  ghost: 0.02,  phase: 1.50, f1:0.22, f2:0.67, f3:1.29, jit:0.03 },
    { mesh: shoulderSolid, sol: 0.07,  ghost: 0.004, phase: 3.10, f1:0.18, f2:0.59, f3:1.17, jit:0.02 },
    { mesh: shoulderWire,  sol: 0.22,  ghost: 0.016, phase: 0.30, f1:0.24, f2:0.77, f3:1.51, jit:0.015 },
    { mesh: torsoSolid,    sol: 0.06,  ghost: 0.003, phase: 2.60, f1:0.21, f2:0.65, f3:1.23, jit:0.008 },
    { mesh: torsoWire,     sol: 0.20,  ghost: 0.014, phase: 1.80, f1:0.26, f2:0.81, f3:1.61, jit:0.008 },
    { mesh: collarMesh,    sol: 0.45,  ghost: 0.04,  phase: 0.90, f1:0.33, f2:0.87, f3:1.71, jit:0.00  },
  ];
  qParts.forEach(q => { q.origPos = q.mesh.position.clone(); });

  // Observation level: 1 = collapsed/solid, 0 = superposition/ghost
  let observationLevel = 0.0;
  const COLLAPSE_DECAY  = 0.016; // ~3s decay per frame back to 0
  const DECOHERENCE_STR = 0.55;  // ghost depth at idle

  function triggerCollapse() {
    observationLevel = 1.0;
    // Instant white flash on wireframes
    qParts.forEach(q => {
      if (q.mesh.material && q.mesh.material.wireframe) q.mesh.material.color.set(0xffffff);
    });
    setTimeout(() => {
      qParts.forEach(q => {
        if (q.mesh.material && q.mesh.material.wireframe) q.mesh.material.color.set(0x00e5ff);
      });
    }, 80);
    // Spike emissive on solid meshes
    if (headSolid.material.emissiveIntensity  !== undefined) headSolid.material.emissiveIntensity  = 3.5;
    if (torsoSolid.material.emissiveIntensity !== undefined) torsoSolid.material.emissiveIntensity = 3.0;
    setTimeout(() => {
      if (headSolid.material.emissiveIntensity  !== undefined) headSolid.material.emissiveIntensity  = 0.6;
      if (torsoSolid.material.emissiveIntensity !== undefined) torsoSolid.material.emissiveIntensity = 0.6;
    }, 280);
  }

  cvs.addEventListener('mouseenter', triggerCollapse);
  cvs.addEventListener('click',      triggerCollapse);
  let _moveThrottle = 0;
  cvs.addEventListener('mousemove', () => { if (++_moveThrottle % 45 === 0) triggerCollapse(); });

  let t = 0;

  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    // Slow avatar rotation
    avatarGroup.rotation.y = Math.sin(t * 0.18) * 0.35;

    // ── QUANTUM DECOHERENCE ───────────────────────────────────────
    // Decay observation level back toward 0 (superposition)
    observationLevel = Math.max(0, observationLevel - COLLAPSE_DECAY);

    qParts.forEach(q => {
      // Noise value in [-1,1] — unique per part
      const n = qNoise(t, q.phase, q.f1, q.f2, q.f3);

      // solidFrac: 0=fully ghost, 1=fully observed
      const rawDeco  = (n + 1) * 0.5;  // noise mapped to [0,1]
      const solidFrac = Math.min(1, observationLevel + rawDeco * (1 - DECOHERENCE_STR));

      // Opacity interpolation
      q.mesh.material.opacity = q.ghost + (q.sol - q.ghost) * solidFrac;

      // Spatial jitter: shimmers when decoherent, still when observed
      if (q.jit > 0) {
        const j = (1 - solidFrac) * q.jit;
        q.mesh.position.set(
          q.origPos.x + Math.sin(t * q.f1 * 1.31 + q.phase * 3.7) * j,
          q.origPos.y,
          q.origPos.z + Math.sin(t * q.f2 * 0.89 + q.phase * 2.1) * j
        );
      }

      // Colour: shift toward translucent blue-white when ghosting,
      // back to solid cyan when observed (wireframe meshes only)
      if (q.mesh.material.wireframe) {
        q.mesh.material.color.setRGB(
          solidFrac * 0.0 + (1 - solidFrac) * 0.5,  // R: ghostly pale
          0.82 + 0.18 * solidFrac,                   // G
          1.0                                         // B: always full
        );
      }
    });

    // Chest orb pulse
    const cp = 0.7 + 0.3 * Math.sin(t * 2.2);
    chestOrb.material.opacity = cp * 0.9;
    chestOrb.scale.setScalar(1 + 0.15 * Math.sin(t * 2.2));
    chestMesh.material.opacity = 0.3 + 0.2 * Math.sin(t * 1.5);

    // ── Full-body scan sweep ────────────────────────────────────
    // Each scan plane travels from Y=-0.2 (base) to Y=4.1 (crown)
    const SCAN_BOTTOM = -0.2;
    const SCAN_TOP    =  4.1;
    const SCAN_RANGE  = SCAN_TOP - SCAN_BOTTOM;

    scanPlanes.forEach((sp, idx) => {
      // advance phase
      sp.phase = (sp.phase + sp.speed * 0.01) % 1;
      const y = SCAN_BOTTOM + sp.phase * SCAN_RANGE;
      sp.plane.position.y = y;

      // brightness: peak at centre of body, fade at extremes
      const rel  = (y - SCAN_BOTTOM) / SCAN_RANGE; // 0..1
      // sharp leading edge with soft trail: use sawtooth envelope
      const edgeGlow = 0.55 * Math.pow(Math.sin(rel * Math.PI), 0.4);
      sp.mat.opacity  = edgeGlow * 0.18;

      // matching edge line
      const edgeSp = scanEdges[idx];
      edgeSp.edge.position.y = y;
      edgeSp.mat.opacity = edgeGlow * 0.65;
    });

    // ── Head qubit orbit rings ──────────────────────────────────
    headOrbitRings.forEach((hr, idx) => {
      hr.angle += hr.speed;
      // orbit bead around ring in local ring-space
      hr.bead.position.set(hr.r * Math.cos(hr.angle), hr.r * Math.sin(hr.angle), 0);
      hr.glowBead.position.copy(hr.bead.position);
      // slow drift of ring tilt
      hr.ring.rotation.z += hr.driftY;
      // pulse opacity so rings breathe
      const breathe = 0.45 + 0.20 * Math.sin(t * 0.9 + idx * 1.2);
      hr.ring.material.opacity = breathe;
    });

    // Body orbit rings (around full figure)
    orbitRings.forEach(or => {
      or.angle += or.speed;
      or.bead.position.set(or.r * Math.cos(or.angle), or.r * Math.sin(or.angle), 0);
      or.ring.rotation.z += 0.001;
    });

    // Halo rotate
    haloPoints.rotation.y = t * 0.06;

    // Key light orbit
    keyLight.position.x = 3 * Math.cos(t * 0.3);
    keyLight.position.z = 3 * Math.sin(t * 0.3);

    // Base disc pulse
    baseDisc.material.opacity = 0.04 + 0.03 * Math.sin(t * 1.8);
    baseRing.material.opacity = 0.4 + 0.15 * Math.sin(t * 2.1);
    innerRing.rotation.z = t * 0.5;

    // Beam opacity flicker
    beamMesh.material.opacity = 0.03 + 0.015 * Math.sin(t * 3.1);

    renderer.render(scene, camera);
  }

  animate();

  // ── Expose show/hide ──────────────────────────────────────
  window.__showHoloAvatar = function () {
    wrapper.classList.add('visible');
  };
  window.__hideHoloAvatar = function () {
    wrapper.classList.remove('visible');
  };

})();
