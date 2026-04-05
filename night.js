/* ============================================
   NIGHT.JS — Three.js Quantum Neural Network Brain
   70 nodes, qubit rings, particle cloud, entanglement beams
   ============================================ */

(function() {
  'use strict';

  let scene, camera, renderer;
  let brainGroup, particleSystem, qubitRings = [];
  let nodes = [], connections = [];
  let coreOrb, coreGlow;
  let mouseX = 0, mouseY = 0;
  let animationId = null;
  let isActive = false;
  let isInitialized = false;
  const canvas = document.getElementById('night-canvas');

  const NODE_COUNT = 70;
  const COLORS = {
    cyan: 0x00e5ff,
    purple: 0x9d4edd,
    green: 0x00ff88,
    pink: 0xff2d87,
    white: 0xffffff
  };

  // Zone definitions
  const ZONES = [
    { name: 'AI', color: COLORS.cyan, count: 20, radius: 3.0, yBias: 1.2 },
    { name: 'Quantum', color: COLORS.purple, count: 20, radius: 3.2, yBias: -0.8 },
    { name: 'Cyber', color: COLORS.green, count: 18, radius: 2.8, yBias: 0.2 },
    { name: 'Core', color: COLORS.pink, count: 12, radius: 1.5, yBias: 0 }
  ];

  function init() {
    if (!canvas || isInitialized) return;
    isInitialized = true;

    scene = new THREE.Scene();

    // Use parent dimensions for sizing
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 100);
    camera.position.z = 7;

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0x111133, 0.5);
    scene.add(ambient);

    const pointCyan = new THREE.PointLight(COLORS.cyan, 0.6, 15);
    pointCyan.position.set(3, 3, 3);
    scene.add(pointCyan);

    const pointPurple = new THREE.PointLight(COLORS.purple, 0.4, 15);
    pointPurple.position.set(-3, -2, 2);
    scene.add(pointPurple);

    const pointPink = new THREE.PointLight(COLORS.pink, 0.3, 10);
    pointPink.position.set(0, 0, 0);
    scene.add(pointPink);

    brainGroup = new THREE.Group();
    scene.add(brainGroup);

    createCoreOrb();
    createNodes();
    createEntanglementBeams();
    createQubitRings();
    createParticleCloud();

    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);
  }

  function createCoreOrb() {
    // Inner orb
    const coreGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: COLORS.pink,
      emissive: COLORS.pink,
      emissiveIntensity: 0.8,
      metalness: 0.3,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    coreOrb = new THREE.Mesh(coreGeo, coreMat);
    brainGroup.add(coreOrb);

    // Glow sphere
    const glowGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: COLORS.pink,
      transparent: true,
      opacity: 0.15
    });
    coreGlow = new THREE.Mesh(glowGeo, glowMat);
    brainGroup.add(coreGlow);
  }

  function createNodes() {
    let nodeIndex = 0;

    ZONES.forEach(zone => {
      for (let i = 0; i < zone.count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = zone.radius * (0.6 + Math.random() * 0.4);

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta) + zone.yBias * (Math.random() - 0.5);
        const z = r * Math.cos(phi);

        const size = zone.name === 'Core' ? 0.06 + Math.random() * 0.06 : 0.04 + Math.random() * 0.05;
        const geo = new THREE.IcosahedronGeometry(size, 1);
        const mat = new THREE.MeshStandardMaterial({
          color: zone.color,
          emissive: zone.color,
          emissiveIntensity: 0.5,
          metalness: 0.6,
          roughness: 0.2,
          wireframe: Math.random() > 0.5
        });

        const node = new THREE.Mesh(geo, mat);
        node.position.set(x, y, z);
        node.userData = {
          zone: zone.name,
          color: zone.color,
          basePos: new THREE.Vector3(x, y, z),
          speed: 0.3 + Math.random() * 0.7,
          offset: Math.random() * Math.PI * 2,
          amplitude: 0.1 + Math.random() * 0.15,
          index: nodeIndex++
        };

        nodes.push(node);
        brainGroup.add(node);
      }
    });
  }

  function createEntanglementBeams() {
    const beamMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.08
    });

    // Connect nodes within zones and some cross-zone
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].position.distanceTo(nodes[j].position);
        const sameZone = nodes[i].userData.zone === nodes[j].userData.zone;
        const threshold = sameZone ? 2.5 : 1.5;

        if (dist < threshold && Math.random() > 0.4) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            nodes[i].position.clone(),
            nodes[j].position.clone()
          ]);
          const mat = beamMaterial.clone();
          mat.color = new THREE.Color(nodes[i].userData.color);
          mat.opacity = sameZone ? 0.1 : 0.05;

          const line = new THREE.Line(geo, mat);
          line.userData = { nodeA: i, nodeB: j };
          connections.push(line);
          brainGroup.add(line);
        }
      }
    }
  }

  function createQubitRings() {
    const ringConfigs = [
      { radius: 3.5, color: COLORS.cyan, tiltX: 0.3, tiltY: 0.5, speed: 0.3 },
      { radius: 3.8, color: COLORS.purple, tiltX: -0.8, tiltY: 0.2, speed: -0.2 },
      { radius: 3.2, color: COLORS.green, tiltX: 0.6, tiltY: -0.4, speed: 0.25 },
      { radius: 4.0, color: COLORS.pink, tiltX: -0.2, tiltY: 0.8, speed: -0.35 }
    ];

    ringConfigs.forEach(cfg => {
      const geo = new THREE.TorusGeometry(cfg.radius, 0.015, 8, 100);
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.25
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = cfg.tiltX;
      ring.rotation.y = cfg.tiltY;
      ring.userData = { speed: cfg.speed };
      qubitRings.push(ring);
      brainGroup.add(ring);

      // Add small orbiting particles on each ring
      for (let i = 0; i < 6; i++) {
        const particleGeo = new THREE.SphereGeometry(0.03, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeo, particleMat);
        particle.userData = {
          ring: ring,
          angle: (Math.PI * 2 / 6) * i,
          radius: cfg.radius,
          speed: cfg.speed * 2
        };
        ring.add(particle);
      }
    });
  }

  function createParticleCloud() {
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorOptions = [
      new THREE.Color(COLORS.cyan),
      new THREE.Color(COLORS.purple),
      new THREE.Color(COLORS.green),
      new THREE.Color(COLORS.pink)
    ];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 2;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particleSystem = new THREE.Points(geo, mat);
    brainGroup.add(particleSystem);
  }

  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function onResize() {
    if (!canvas || !camera || !renderer) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate() {
    if (!isActive) return;
    animationId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Animate nodes
    nodes.forEach(node => {
      const { basePos, speed, offset, amplitude } = node.userData;
      node.position.x = basePos.x + Math.sin(time * speed + offset) * amplitude;
      node.position.y = basePos.y + Math.cos(time * speed * 0.8 + offset) * amplitude;
      node.position.z = basePos.z + Math.sin(time * speed * 0.5 + offset * 1.5) * amplitude * 0.5;
      node.rotation.x = time * speed * 0.5;
      node.rotation.y = time * speed * 0.3;
    });

    // Update connections
    connections.forEach(line => {
      const { nodeA, nodeB } = line.userData;
      const posArr = line.geometry.attributes.position.array;
      posArr[0] = nodes[nodeA].position.x;
      posArr[1] = nodes[nodeA].position.y;
      posArr[2] = nodes[nodeA].position.z;
      posArr[3] = nodes[nodeB].position.x;
      posArr[4] = nodes[nodeB].position.y;
      posArr[5] = nodes[nodeB].position.z;
      line.geometry.attributes.position.needsUpdate = true;
    });

    // Rotate qubit rings
    qubitRings.forEach(ring => {
      ring.rotation.z += ring.userData.speed * 0.005;
      // Animate orbiting particles
      ring.children.forEach(particle => {
        if (particle.userData && particle.userData.angle !== undefined) {
          particle.userData.angle += particle.userData.speed * 0.008;
          const a = particle.userData.angle;
          const r = particle.userData.radius;
          particle.position.set(
            Math.cos(a) * r,
            Math.sin(a) * r,
            0
          );
        }
      });
    });

    // Core orb pulse
    const pulse = 1 + Math.sin(time * 2) * 0.1;
    coreOrb.scale.set(pulse, pulse, pulse);
    coreGlow.scale.set(pulse * 1.2, pulse * 1.2, pulse * 1.2);
    coreGlow.material.opacity = 0.1 + Math.sin(time * 3) * 0.05;

    // Particle cloud rotation
    if (particleSystem) {
      particleSystem.rotation.y = time * 0.05;
      particleSystem.rotation.x = time * 0.02;
    }

    // Brain group auto-rotation
    brainGroup.rotation.y = time * 0.1;
    brainGroup.rotation.x = Math.sin(time * 0.15) * 0.1;

    // Mouse parallax
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  // Public API
  window.NightScene = {
    init: function() {
      init();
    },
    start: function() {
      if (!isInitialized) init();
      isActive = true;
      if (!animationId) animate();
      onResize();
    },
    stop: function() {
      isActive = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },
    resize: onResize
  };

})();
