/* ═══════════════════════════════════════════════════════════
   DAY.JS — Corporate Security Mesh Hero
   Three.js network: security nodes, data flows, threat map
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('day-canvas');
  if (!canvas) return;

  let scene, camera, renderer;
  let nodesGroup, flowGroup;
  let nodes = [], connections = [], flowParticles = [];
  let mouseX = 0, mouseY = 0, targetMX = 0, targetMY = 0;
  let animFrame = null;
  let isActive = true;
  let frame = 0;

  // ── Scene ─────────────────────────────────────────────────
  scene  = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 28);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  resize();

  // ── Lighting ──────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const key = new THREE.DirectionalLight(0x3b82f6, 1.8);
  key.position.set(10, 10, 10);
  scene.add(key);
  const fill = new THREE.PointLight(0x0ea5e9, 2.5, 60);
  fill.position.set(-15, 5, 5);
  scene.add(fill);
  const rim = new THREE.PointLight(0x0f172a, 1.5, 50);
  rim.position.set(0, -10, -10);
  scene.add(rim);

  nodesGroup = new THREE.Group();
  flowGroup  = new THREE.Group();
  scene.add(nodesGroup, flowGroup);

  // ── Node types ────────────────────────────────────────────
  const TYPES = [
    { color: 0x0f172a, emissive: 0x1e3a5f, size: [0.35, 0.55], prob: 0.25 }, // large anchors
    { color: 0x3b82f6, emissive: 0x1d4ed8, size: [0.18, 0.30], prob: 0.40 }, // mid blue
    { color: 0x0ea5e9, emissive: 0x0284c7, size: [0.10, 0.20], prob: 0.35 }, // small teal
  ];

  function pickType() {
    const r = Math.random();
    let acc = 0;
    for (const t of TYPES) { acc += t.prob; if (r < acc) return t; }
    return TYPES[0];
  }

  // ── Build 50 nodes in a loose sphere ─────────────────────
  for (let i = 0; i < 50; i++) {
    const type = pickType();
    const sz   = type.size[0] + Math.random() * (type.size[1] - type.size[0]);
    const geo  = Math.random() > 0.5
      ? new THREE.IcosahedronGeometry(sz, 1)
      : new THREE.SphereGeometry(sz, 10, 10);

    const mat = new THREE.MeshStandardMaterial({
      color: type.color,
      emissive: type.emissive,
      emissiveIntensity: 0.35,
      metalness: 0.6,
      roughness: 0.25,
      transparent: true,
      opacity: 0.88,
    });

    const mesh = new THREE.Mesh(geo, mat);

    // Distribute across full viewport
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 6 + Math.random() * 14;
    mesh.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta) * 0.7,
      r * Math.cos(phi) * 0.5
    );

    mesh.userData = {
      basePos: mesh.position.clone(),
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed:  0.4 + Math.random() * 0.6,
      floatAmp:    0.08 + Math.random() * 0.18,
      floatFreq:   0.25 + Math.random() * 0.4,
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008,
        0
      ),
    };

    nodesGroup.add(mesh);
    nodes.push(mesh);
  }

  // ── Connections ───────────────────────────────────────────
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = nodes[i].position.distanceTo(nodes[j].position);
      if (d < 10 && Math.random() > 0.55) {
        const mat = new THREE.LineBasicMaterial({
          color: 0x3b82f6,
          transparent: true,
          opacity: 0.06 + (1 - d / 10) * 0.1,
        });
        const geo = new THREE.BufferGeometry().setFromPoints([
          nodes[i].position.clone(),
          nodes[j].position.clone(),
        ]);
        const line = new THREE.Line(geo, mat);
        nodesGroup.add(line);
        connections.push({ line, a: i, b: j, baseOp: mat.opacity });
      }
    }
  }

  // ── Flow particles along connections ─────────────────────
  const flowGeo = new THREE.SphereGeometry(0.08, 5, 5);
  connections.filter(() => Math.random() > 0.65).slice(0, 30).forEach(conn => {
    const mat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0x3b82f6 : 0x0ea5e9,
      transparent: true, opacity: 0.0,
    });
    const mesh = new THREE.Mesh(flowGeo, mat);
    nodesGroup.add(mesh);
    flowParticles.push({ mesh, conn, t: Math.random(), speed: 0.005 + Math.random() * 0.01, dir: 1 });
  });

  // ── Thin horizontal accent lines (data streams) ───────────
  for (let i = 0; i < 6; i++) {
    const y = (i / 5 - 0.5) * 22;
    const pts = [new THREE.Vector3(-30, y, -5), new THREE.Vector3(30, y, -5)];
    const geo  = new THREE.BufferGeometry().setFromPoints(pts);
    const mat  = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.04 });
    scene.add(new THREE.Line(geo, mat));
  }

  // ── Animate ───────────────────────────────────────────────
  function animate() {
    if (!isActive) return;
    animFrame = requestAnimationFrame(animate);
    frame++;
    const t = frame * 0.008;

    // Camera parallax
    mouseX += (targetMX - mouseX) * 0.04;
    mouseY += (targetMY - mouseY) * 0.04;
    camera.position.x = mouseX * 3;
    camera.position.y = mouseY * 2;
    camera.lookAt(0, 0, 0);

    // Float nodes
    nodes.forEach((n, i) => {
      const d = n.userData;
      n.position.x = d.basePos.x + Math.sin(t * d.floatFreq + i * 0.4) * d.floatAmp;
      n.position.y = d.basePos.y + Math.cos(t * d.floatFreq * 0.8 + i * 0.3) * d.floatAmp;
      n.rotation.x += d.rotSpeed.x;
      n.rotation.y += d.rotSpeed.y;
      // Pulse emissive
      n.material.emissiveIntensity = 0.25 + 0.15 * Math.sin(t * d.pulseSpeed + d.pulseOffset);
    });

    // Update connection endpoints + pulse opacity
    connections.forEach((c, ci) => {
      const pts = c.line.geometry.attributes.position.array;
      pts[0] = nodes[c.a].position.x; pts[1] = nodes[c.a].position.y; pts[2] = nodes[c.a].position.z;
      pts[3] = nodes[c.b].position.x; pts[4] = nodes[c.b].position.y; pts[5] = nodes[c.b].position.z;
      c.line.geometry.attributes.position.needsUpdate = true;
      c.line.material.opacity = c.baseOp * (0.5 + 0.5 * Math.abs(Math.sin(t * 0.4 + ci * 0.2)));
    });

    // Flow particles
    flowParticles.forEach(fp => {
      fp.t += fp.speed * fp.dir;
      if (fp.t > 1 || fp.t < 0) fp.dir *= -1;
      const a = nodes[fp.conn.a].position;
      const b = nodes[fp.conn.b].position;
      fp.mesh.position.lerpVectors(a, b, fp.t);
      fp.mesh.material.opacity = 0.7 * Math.sin(fp.t * Math.PI);
    });

    renderer.render(scene, camera);
  }

  // ── Resize ────────────────────────────────────────────────
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    if (camera) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
    renderer.setSize(w, h);
  }

  document.addEventListener('mousemove', e => {
    targetMX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetMY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener('resize', resize);

  animate();

  window.DayScene = {
    start() { isActive = true; if (!animFrame) animate(); resize(); },
    stop()  { isActive = false; if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; } },
    resize,
  };

})();
