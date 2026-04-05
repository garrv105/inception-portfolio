/* ═══════════════════════════════════════════════════════════
   DAY.JS — Cyber Grid Terrain Hero
   Perspective grid + data pillars + scan beam + particles
   Completely distinct from the quantum brain
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('day-canvas');
  if (!canvas) return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 18, 42);
  camera.lookAt(0, 0, -20);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  resize();

  scene.fog = new THREE.FogExp2(0x020818, 0.018);

  // ── Lighting ──────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x050a1a, 4));
  const keyLight = new THREE.PointLight(0x2563eb, 12, 120);
  keyLight.position.set(0, 30, 10);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x0ea5e9, 6, 80);
  rimLight.position.set(40, 10, -30);
  scene.add(rimLight);

  // ── Ground grid ───────────────────────────────────────────
  // Custom grid with perspective lines going to a vanishing point
  const GRID_W = 80, GRID_D = 120, GRID_DIV_X = 24, GRID_DIV_Z = 36;

  const gridMat = new THREE.LineBasicMaterial({
    color: 0x2563eb,
    transparent: true,
    opacity: 0.22,
  });

  const gridGroup = new THREE.Group();
  scene.add(gridGroup);

  // Lines parallel to Z axis (going away from camera)
  for (let i = 0; i <= GRID_DIV_X; i++) {
    const x = -GRID_W / 2 + (i / GRID_DIV_X) * GRID_W;
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0, 10),
      new THREE.Vector3(x * 0.15, 0, -GRID_D),
    ]);
    gridGroup.add(new THREE.Line(geo, gridMat.clone()));
  }

  // Lines parallel to X axis (horizontal bands)
  for (let j = 0; j <= GRID_DIV_Z; j++) {
    const z = 10 - (j / GRID_DIV_Z) * (GRID_D + 10);
    const fade = j / GRID_DIV_Z;
    const x = GRID_W / 2 * (1 - fade * 0.88);
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-x, 0, z),
      new THREE.Vector3( x, 0, z),
    ]);
    const mat = gridMat.clone();
    mat.opacity = 0.22 * (1 - fade * 0.7);
    gridGroup.add(new THREE.Line(geo, mat));
  }

  // ── Data pillars ──────────────────────────────────────────
  // Tall glowing bars rising from the grid, scattered across the field
  const pillars = [];
  const PILLAR_COUNT = 60;

  function makePillar(x, z) {
    const h      = 0.5 + Math.random() * 12;
    const bright = Math.random() > 0.85;
    const col    = bright ? 0x0ea5e9 : (Math.random() > 0.5 ? 0x2563eb : 0x1d4ed8);

    const geo = new THREE.BoxGeometry(0.35, h, 0.35);
    const mat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: bright ? 1.8 : 0.8,
      metalness: 0.5,
      roughness: 0.3,
      transparent: true,
      opacity: 0.75,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    scene.add(mesh);

    // Glow cap on top
    if (bright) {
      const capGeo = new THREE.SphereGeometry(0.45, 8, 8);
      const capMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.7 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(x, h, z);
      scene.add(cap);
      pillars.push({ mesh, cap, capMat, h, bright, pulseOffset: Math.random() * Math.PI * 2, pulseSpeed: 0.5 + Math.random() * 1.5, targetH: h });
    } else {
      pillars.push({ mesh, h, bright, pulseOffset: Math.random() * Math.PI * 2, pulseSpeed: 0.4 + Math.random() * 0.8, targetH: h });
    }
  }

  for (let i = 0; i < PILLAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 4 + Math.random() * 38;
    const x     = Math.cos(angle) * dist * (0.6 + Math.random() * 0.4);
    const z     = -5 - Math.random() * 80;
    makePillar(x, z);
  }

  // ── Horizontal scan beam ──────────────────────────────────
  // A flat plane that sweeps from near to far like a security radar sweep
  const beamGeo = new THREE.PlaneGeometry(100, 4);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x2563eb,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.rotation.x = -Math.PI / 2;
  beam.position.y = 0.1;
  scene.add(beam);

  // Bright leading edge
  const edgeGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-50, 0, 0),
    new THREE.Vector3( 50, 0, 0),
  ]);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.6 });
  const edge = new THREE.Line(edgeGeo, edgeMat);
  edge.rotation.x = 0;
  scene.add(edge);

  // ── Floating data particles ───────────────────────────────
  const PART_COUNT = 500;
  const partPos  = new Float32Array(PART_COUNT * 3);
  const partVel  = new Float32Array(PART_COUNT * 3);
  for (let i = 0; i < PART_COUNT; i++) {
    partPos[i*3]   = (Math.random() - 0.5) * 80;
    partPos[i*3+1] = Math.random() * 25;
    partPos[i*3+2] = -Math.random() * 90;
    partVel[i*3+1] = 0.01 + Math.random() * 0.04; // float upward
  }
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
  const partMesh = new THREE.Points(partGeo, new THREE.PointsMaterial({
    color: 0x3b82f6, size: 0.18, transparent: true, opacity: 0.55, sizeAttenuation: true,
  }));
  scene.add(partMesh);

  // ── Holographic rings on the horizon ─────────────────────
  for (let i = 0; i < 3; i++) {
    const r = 20 + i * 14;
    const ringGeo = new THREE.TorusGeometry(r, 0.06, 6, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: i === 1 ? 0x0ea5e9 : 0x1d4ed8,
      transparent: true,
      opacity: 0.15 - i * 0.04,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, -2, -40 - i * 10);
    scene.add(ring);
  }

  // ── Camera mouse parallax ─────────────────────────────────
  let mouseX = 0, mouseY = 0, camX = 0, camY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Animate ───────────────────────────────────────────────
  let frame = 0, isActive = true, animFrame = null;

  function animate() {
    if (!isActive) return;
    animFrame = requestAnimationFrame(animate);
    frame++;
    const t = frame * 0.008;

    // Smooth camera drift
    camX += (mouseX * 4 - camX) * 0.035;
    camY += (-mouseY * 2 - camY) * 0.035;
    camera.position.x = camX;
    camera.position.y = 18 + camY;
    camera.lookAt(camX * 0.2, 0, -20);

    // Scan beam sweeps toward horizon
    const scanZ = 10 - ((t * 8) % 120);
    beam.position.z = scanZ;
    edge.position.z = scanZ;
    // Beam fades at extremes
    const rel = (10 - scanZ) / 120;
    beamMat.opacity = 0.12 * Math.sin(rel * Math.PI);
    edgeMat.opacity = 0.6  * Math.sin(rel * Math.PI);

    // Pulse pillars
    pillars.forEach(p => {
      const pulse = 0.6 + 0.4 * Math.sin(t * p.pulseSpeed + p.pulseOffset);
      p.mesh.material.emissiveIntensity = (p.bright ? 1.8 : 0.8) * pulse;
      // Animate height — pillars breathe
      const newH = p.targetH * (0.88 + 0.12 * Math.sin(t * p.pulseSpeed * 0.5 + p.pulseOffset));
      p.mesh.scale.y = newH / p.h;
      p.mesh.position.y = newH / 2;
      if (p.cap) {
        p.cap.position.y = newH;
        p.capMat.opacity = 0.5 + 0.4 * pulse;
      }
    });

    // Float particles upward, wrap around
    const pa = partGeo.attributes.position.array;
    for (let i = 0; i < PART_COUNT; i++) {
      pa[i*3+1] += partVel[i*3+1];
      if (pa[i*3+1] > 28) pa[i*3+1] = 0;
    }
    partGeo.attributes.position.needsUpdate = true;

    // Drift grid subtly
    gridGroup.position.z = (t * 3) % (GRID_D / GRID_DIV_Z);

    renderer.render(scene, camera);
  }

  // ── Resize ────────────────────────────────────────────────
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);

  // ── Public API ────────────────────────────────────────────
  window.DayScene = {
    start() { isActive = true; if (!animFrame) animate(); resize(); },
    stop()  { isActive = false; if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; } },
    resize,
  };

})();
