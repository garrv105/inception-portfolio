/* ═══════════════════════════════════════════════════════════
   DAY.JS — CYBER THREAT LIVE MAP v2
   Dark space globe · attack arcs · data spikes · star field
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('day-canvas');
  if (!canvas) return;

  // ── Scene + Camera ────────────────────────────────────────
  const scene  = new THREE.Scene();
  // Camera faces the globe straight-on, slightly left-of-center
  // so the right half of the viewport is free for hero text
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 600);
  camera.position.set(-6, 2, 52);
  camera.lookAt(-6, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x030a14, 1); // dark space — not transparent
  resize();

  // ── Star field ────────────────────────────────────────────
  const starCount = 2200;
  const starPos   = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i*3]   = (Math.random() - 0.5) * 500;
    starPos[i*3+1] = (Math.random() - 0.5) * 500;
    starPos[i*3+2] = (Math.random() - 0.5) * 400 - 50;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.22, transparent: true, opacity: 0.55,
  })));

  // ── Lighting ──────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x0a1628, 5));
  const sunLight = new THREE.DirectionalLight(0x4a80ff, 2.5);
  sunLight.position.set(30, 20, 40);
  scene.add(sunLight);
  const rimLight = new THREE.PointLight(0x0ea5e9, 4, 200);
  rimLight.position.set(-40, -20, -30);
  scene.add(rimLight);

  // ── Globe ─────────────────────────────────────────────────
  const R = 13; // globe radius

  // Dark base sphere (landmass-like coloring)
  const globeMat = new THREE.MeshStandardMaterial({
    color:     0x0d2137,
    emissive:  0x061220,
    emissiveIntensity: 0.6,
    metalness: 0.2,
    roughness: 0.85,
  });
  const globe = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 40), globeMat);
  scene.add(globe);

  // Latitude/longitude grid lines
  const gridMat = new THREE.LineBasicMaterial({ color: 0x1a3a5c, transparent: true, opacity: 0.35 });
  // Lat lines
  for (let lat = -75; lat <= 75; lat += 15) {
    const pts = [];
    const phi = (90 - lat) * (Math.PI / 180);
    for (let lon = 0; lon <= 360; lon += 4) {
      const theta = lon * (Math.PI / 180);
      pts.push(new THREE.Vector3(
        -R * Math.sin(phi) * Math.cos(theta),
         R * Math.cos(phi),
         R * Math.sin(phi) * Math.sin(theta)
      ));
    }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat.clone()));
  }
  // Lon lines
  for (let lon = 0; lon < 360; lon += 20) {
    const pts = [];
    const theta = lon * (Math.PI / 180);
    for (let lat = -90; lat <= 90; lat += 4) {
      const phi = (90 - lat) * (Math.PI / 180);
      pts.push(new THREE.Vector3(
        -R * Math.sin(phi) * Math.cos(theta),
         R * Math.cos(phi),
         R * Math.sin(phi) * Math.sin(theta)
      ));
    }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat.clone()));
  }

  // Atmosphere glow (thick shell)
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(R + 0.7, 40, 28),
    new THREE.MeshBasicMaterial({ color: 0x1a4aff, transparent: true, opacity: 0.045, side: THREE.BackSide })
  ));
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(R + 1.8, 40, 28),
    new THREE.MeshBasicMaterial({ color: 0x0a2244, transparent: true, opacity: 0.02, side: THREE.BackSide })
  ));

  // ── Lat/lon → 3D ──────────────────────────────────────────
  function ll(lat, lon, r) {
    const phi   = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  // ── City data ─────────────────────────────────────────────
  const CITIES = [
    { name: 'NEW YORK',   lat: 40.7,  lon: -74.0,  role: 'target' },
    { name: 'LONDON',     lat: 51.5,  lon: -0.1,   role: 'target' },
    { name: 'SINGAPORE',  lat: 1.3,   lon: 103.8,  role: 'source' },
    { name: 'MOSCOW',     lat: 55.7,  lon: 37.6,   role: 'source' },
    { name: 'BEIJING',    lat: 39.9,  lon: 116.4,  role: 'source' },
    { name: 'SAO PAULO',  lat: -23.5, lon: -46.6,  role: 'target' },
    { name: 'SYDNEY',     lat: -33.9, lon: 151.2,  role: 'secure' },
    { name: 'DUBAI',      lat: 25.2,  lon: 55.3,   role: 'source' },
    { name: 'CHICAGO',    lat: 41.9,  lon: -87.6,  role: 'target' },
    { name: 'FRANKFURT',  lat: 50.1,  lon: 8.7,    role: 'target' },
    { name: 'TORONTO',    lat: 43.7,  lon: -79.4,  role: 'secure' },
    { name: 'MUMBAI',     lat: 19.1,  lon: 72.9,   role: 'source' },
  ];

  const ROLE_COLOR = { source: 0xff2d55, target: 0xf59e0b, secure: 0x00e5ff };

  // ── Data spike bars (like reference image) ─────────────────
  // Vertical bars rising from each city — height = activity level
  const cityNodes = [];
  CITIES.forEach((city, idx) => {
    const basePos = ll(city.lat, city.lon, R);
    const col     = ROLE_COLOR[city.role];
    const spikeH  = 0.8 + Math.random() * 2.8;

    // Base dot
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: col })
    );
    dot.position.copy(basePos);
    scene.add(dot);

    // Spike bar — oriented outward from globe surface
    const dir   = basePos.clone().normalize();
    const spike = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.1, spikeH, 6),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })
    );
    // Position halfway up the spike outward
    spike.position.copy(dir.clone().multiplyScalar(R + spikeH / 2));
    // Align cylinder to outward normal
    const up = new THREE.Vector3(0, 1, 0);
    spike.quaternion.setFromUnitVectors(up, dir);
    scene.add(spike);

    // Glow cap at tip
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 })
    );
    cap.position.copy(dir.clone().multiplyScalar(R + spikeH + 0.2));
    scene.add(cap);

    cityNodes.push({
      dot, spike, cap, col, dir: dir.clone(),
      spikeH, baseH: spikeH,
      role: city.role,
      lat: city.lat, lon: city.lon,
      pulseOff: Math.random() * Math.PI * 2,
      pulseSpd: 0.6 + Math.random() * 1.0,
    });
  });

  // ── Threat arcs ───────────────────────────────────────────
  const ARC_PAIRS = [[2,0],[3,1],[4,9],[7,8],[5,0],[11,4],[2,8],[3,9]];
  const arcs = [];

  ARC_PAIRS.forEach(([from, to]) => {
    const p0  = ll(CITIES[from].lat, CITIES[from].lon, R);
    const p1  = ll(CITIES[to].lat,   CITIES[to].lon,   R);
    const mid = p0.clone().add(p1).normalize().multiplyScalar(R + 5 + Math.random() * 3);
    const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1);
    const pts   = curve.getPoints(64);
    const geo   = new THREE.BufferGeometry().setFromPoints(pts);
    const mat   = new THREE.LineBasicMaterial({
      color: 0xff2d55, transparent: true, opacity: 0,
    });
    const line = new THREE.Line(geo, mat);
    scene.add(line);

    // Travel bead
    const bead = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff6680, transparent: true, opacity: 0 })
    );
    scene.add(bead);

    arcs.push({ line, mat, bead, curve, t: Math.random(), spd: 0.005 + Math.random() * 0.006 });
  });

  // ── Orbital ring ──────────────────────────────────────────
  const orbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(R + 1.5, 0.05, 6, 120),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.35 })
  );
  orbitRing.rotation.x = -Math.PI / 10;
  scene.add(orbitRing);

  // ── Camera mouse drift ─────────────────────────────────────
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Resolve timer ─────────────────────────────────────────
  let resolveTimer = 0;

  // ── Animate ───────────────────────────────────────────────
  let frame = 0, isActive = true, animFrame = null;

  function animate() {
    if (!isActive) return;
    animFrame = requestAnimationFrame(animate);
    frame++;
    const t = frame * 0.008;

    // Camera gentle drift — stays centered on globe
    cx += (mx * 3 - cx) * 0.03;
    cy += (-my * 2 - cy) * 0.03;
    camera.position.set(-6 + cx, 2 + cy, 52);
    camera.lookAt(-6, 0, 0);

    // Rotate globe slowly
    globe.rotation.y += 0.0018;

    // Update city node positions with globe rotation
    cityNodes.forEach((n, idx) => {
      const city    = CITIES[idx];
      const basePos = ll(city.lat, city.lon, R);
      basePos.applyEuler(new THREE.Euler(0, globe.rotation.y, 0));
      const dir = basePos.clone().normalize();

      n.dot.position.copy(basePos);

      // Pulse spike height
      const pulse = 0.8 + 0.2 * Math.sin(t * n.pulseSpd + n.pulseOff);
      const h     = n.baseH * pulse;
      n.spike.scale.set(1, h / n.baseH, 1);
      n.spike.position.copy(dir.clone().multiplyScalar(R + h / 2));
      n.spike.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
      n.cap.position.copy(dir.clone().multiplyScalar(R + h + 0.2));
    });

    // Animate arcs
    arcs.forEach(arc => {
      arc.t = (arc.t + arc.spd) % 1;
      // Fade arc in/out by travel position (visible near front of globe)
      const arcOpacity = 0.5 * Math.sin(arc.t * Math.PI);
      arc.mat.opacity  = arcOpacity;
      arc.bead.material.opacity = arcOpacity > 0.1 ? 0.9 : 0;
      arc.bead.position.copy(arc.curve.getPoint(arc.t));
    });

    // Orbit ring pulses
    orbitRing.rotation.y += 0.004;
    orbitRing.material.opacity = 0.28 + 0.12 * Math.sin(t * 2);

    // Resolve a threat every 5s
    resolveTimer++;
    if (resolveTimer >= 300) {
      resolveTimer = 0;
      const sources = cityNodes.filter(n => n.role === 'source');
      if (sources.length) flashResolve(sources[Math.floor(Math.random() * sources.length)]);
    }

    renderer.render(scene, camera);
  }

  function flashResolve(node) {
    let f = 0;
    const iv = setInterval(() => {
      const c = f % 2 === 0 ? 0xffffff : ROLE_COLOR.secure;
      node.dot.material.color.setHex(c);
      node.spike.material.color.setHex(c);
      node.cap.material.color.setHex(c);
      if (++f >= 8) {
        clearInterval(iv);
        node.role = 'secure';
        // Update threat counter in DOM
        const el = document.getElementById('th-threats');
        if (el) el.textContent = Math.max(0, parseInt(el.textContent || 0) - 1);
        const se = document.getElementById('th-secured');
        if (se) se.textContent = parseInt(se.textContent || 0) + 1;
      }
    }, 80);
  }

  // ── Resize ────────────────────────────────────────────────
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    if (camera) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
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
