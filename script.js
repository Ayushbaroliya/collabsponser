/**
 * CollabSponser | Fast & Responsive Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initThemeToggle();
});

// ── THEME TOGGLE ──────────────────────────────────
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  if (!btn) return;

  // Check saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  }

  btn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Dispatch event to update Three.js color
    window.dispatchEvent(new Event('themeChanged'));
  });
}

// ── PRELOADER + GHOST INIT ────────────────────────
function initPreloader() {
  const preloaderEl = document.getElementById('preloader');
  const heroText    = document.getElementById('hero-text-content');
  const progressBar = document.getElementById('progress-bar');

  let step = 0;
  const totalSteps = 5;

  function updateProgress(s) {
    step = Math.min(s, totalSteps);
    if (progressBar) progressBar.style.width = ((step / totalSteps) * 100) + '%';
  }

  function completePreloader(canvas) {
    updateProgress(totalSteps);
    setTimeout(() => {
      if (preloaderEl) preloaderEl.classList.add('fade-out');
      if (heroText)    heroText.classList.add('visible');
      if (canvas) {
        canvas.style.transition = 'opacity 2s ease-in';
        canvas.style.opacity    = '1';
      }
      setTimeout(() => {
        if (preloaderEl) preloaderEl.style.display = 'none';
      }, 800);
    }, 800);
  }

  updateProgress(1);
  initGhostScene(updateProgress, completePreloader);
  initScrollReveal();
  initCountUp();
  initHamburger();
}

// ── HAMBURGER ─────────────────────────────────────
function initHamburger() {
  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('nav-menu');
  if (!ham || !menu) return;
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
  });
  document.querySelectorAll('.nav-menu a').forEach(a =>
    a.addEventListener('click', () => {
      ham.classList.remove('open');
    })
  );
}

// ── SCROLL REVEAL ─────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 }); // lower threshold for speed
  els.forEach(el => obs.observe(el));
}

// ── COUNT-UP ──────────────────────────────────────
function initCountUp() {
  function countUp(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2000, step = 30; // faster
    const increment = target / (duration / step);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.round(current) + (target > 100 ? '+' : '');
    }, step);
  }
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-target]').forEach(countUp);
        statObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('#stats').forEach(s => statObs.observe(s));
}

// ── GHOST THREE.JS SCENE ──────────────────────────
function initGhostScene(updateProgress, completePreloader) {
  const heroSection = document.querySelector('.hero');
  if (!heroSection || typeof THREE === 'undefined') {
    completePreloader(null);
    return;
  }

  function getThemeColor() {
    const val = getComputedStyle(document.documentElement).getPropertyValue('--ghost-theme-color').trim();
    return val ? val : '#00ff80'; // Default green
  }
  let themeColorHex = getThemeColor();
  let baseColor = new THREE.Color(themeColorHex);

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(75, heroSection.offsetWidth / heroSection.offsetHeight, 0.1, 1000);
  camera.position.z = 20;

  updateProgress(2);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    premultipliedAlpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(heroSection.offsetWidth, heroSection.offsetHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  
  const canvas = renderer.domElement;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '1';
  canvas.style.opacity = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.background = 'transparent';
  heroSection.insertBefore(canvas, heroSection.firstChild);

  // Constants
  const params = {
    bodyColor: 0x0f2027, glowColor: themeColorHex, eyeGlowColor: themeColorHex,
    ghostOpacity: 0.88, ghostScale: 2.4, emissiveIntensity: 5.8,
    pulseSpeed: 1.6, pulseIntensity: 0.6,
    followSpeed: 0.075, wobbleAmount: 0.35, floatSpeed: 1.6, movementThreshold: 0.07,
    fireflyGlowIntensity: 2.6, fireflySpeed: 0.04
  };

  // Post-processing
  let composer = null;
  let analogDecayPass = null;
  if (THREE.EffectComposer && THREE.RenderPass && THREE.ShaderPass) {
    composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    const analogDecayShader = {
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(heroSection.offsetWidth, heroSection.offsetHeight) },
        uAnalogGrain: { value: 0.4 },
        uAnalogBleeding: { value: 1.0 },
        uAnalogVSync: { value: 1.0 },
        uAnalogScanlines: { value: 1.0 },
        uAnalogVignette: { value: 1.0 },
        uAnalogJitter: { value: 0.4 },
        uAnalogIntensity: { value: 0.6 },
        uLimboMode: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uAnalogGrain;
        uniform float uAnalogBleeding;
        uniform float uAnalogVSync;
        uniform float uAnalogScanlines;
        uniform float uAnalogVignette;
        uniform float uAnalogJitter;
        uniform float uAnalogIntensity;
        uniform float uLimboMode;
        varying vec2 vUv;
        float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); }
        float gaussian(float z, float u, float o) { return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o)))); }
        vec3 grain(vec2 uv, float time, float intensity) {
          float seed = dot(uv, vec2(12.9898, 78.233));
          float noise = fract(sin(seed) * 43758.5453 + time * 2.0);
          noise = gaussian(noise, 0.0, 0.5 * 0.5);
          return vec3(noise) * intensity;
        }
        void main() {
          vec2 uv = vUv;
          float time = uTime * 1.8;
          vec2 jitteredUV = uv;
          if (uAnalogJitter > 0.01) {
            float jitterAmount = (random(vec2(floor(time * 60.0))) - 0.5) * 0.003 * uAnalogJitter * uAnalogIntensity;
            jitteredUV.x += jitterAmount;
            jitteredUV.y += (random(vec2(floor(time * 30.0) + 1.0)) - 0.5) * 0.001 * uAnalogJitter * uAnalogIntensity;
          }
          if (uAnalogVSync > 0.01) {
            float vsyncRoll = sin(time * 2.0 + uv.y * 100.0) * 0.02 * uAnalogVSync * uAnalogIntensity;
            float vsyncChance = step(0.95, random(vec2(floor(time * 4.0))));
            jitteredUV.y += vsyncRoll * vsyncChance;
          }
          vec4 color = texture2D(tDiffuse, jitteredUV);
          if (uAnalogBleeding > 0.01) {
            float bleedAmount = 0.012 * uAnalogBleeding * uAnalogIntensity;
            float offsetPhase = time * 1.5 + uv.y * 20.0;
            vec2 redOffset = vec2(sin(offsetPhase) * bleedAmount, 0.0);
            vec2 blueOffset = vec2(-sin(offsetPhase * 1.1) * bleedAmount * 0.8, 0.0);
            float r = texture2D(tDiffuse, jitteredUV + redOffset).r;
            float g = texture2D(tDiffuse, jitteredUV).g;
            float b = texture2D(tDiffuse, jitteredUV + blueOffset).b;
            color = vec4(r, g, b, color.a);
          }
          if (uAnalogGrain > 0.01) {
            vec3 grainEffect = grain(uv, time, 0.075 * uAnalogGrain * uAnalogIntensity);
            grainEffect *= (1.0 - color.rgb);
            color.rgb += grainEffect;
          }
          if (uAnalogScanlines > 0.01) {
            float scanlineFreq = 600.0 + uAnalogScanlines * 400.0;
            float scanlinePattern = sin(uv.y * scanlineFreq) * 0.5 + 0.5;
            float scanlineIntensity = 0.1 * uAnalogScanlines * uAnalogIntensity;
            color.rgb *= (1.0 - scanlinePattern * scanlineIntensity);
            float horizontalLines = sin(uv.y * scanlineFreq * 0.1) * 0.02 * uAnalogScanlines * uAnalogIntensity;
            color.rgb *= (1.0 - horizontalLines);
          }
          if (uAnalogVignette > 0.01) {
            vec2 vignetteUV = (uv - 0.5) * 2.0;
            float vignette = 1.0 - dot(vignetteUV, vignetteUV) * 0.3 * uAnalogVignette * uAnalogIntensity;
            color.rgb *= vignette;
          }
          gl_FragColor = color;
        }
      `
    };
    analogDecayPass = new THREE.ShaderPass(analogDecayShader);
    composer.addPass(analogDecayPass);
  }

  const ambientLight = new THREE.AmbientLight(0x0a0a2e, 0.08); 
  scene.add(ambientLight);

  const rimLight1 = new THREE.DirectionalLight(0x4a90e2, 1.8);
  rimLight1.position.set(-8, 6, -4); scene.add(rimLight1);
  const rimLight2 = new THREE.DirectionalLight(0x50e3c2, 1.8 * 0.7);
  rimLight2.position.set(8, -4, -6); scene.add(rimLight2);

  const ghostGroup = new THREE.Group();
  scene.add(ghostGroup);

  // Detailed organic wavy geometry
  const ghostGeometry = new THREE.SphereGeometry(2, 40, 40);
  const positions = ghostGeometry.getAttribute("position").array;
  for (let i = 0; i < positions.length; i += 3) {
    if (positions[i + 1] < -0.2) {
      const x = positions[i], z = positions[i + 2];
      positions[i + 1] = -2.0 + Math.sin(x*5)*0.35 + Math.cos(z*4)*0.25 + Math.sin((x+z)*3)*0.15;
    }
  }
  ghostGeometry.computeVertexNormals();

  const ghostMaterial = new THREE.MeshStandardMaterial({
    color: params.bodyColor, transparent: true, opacity: params.ghostOpacity,
    emissive: baseColor, emissiveIntensity: params.emissiveIntensity,
    roughness: 0.02, metalness: 0.0, side: THREE.DoubleSide, alphaTest: 0.1
  });
  const ghostBody = new THREE.Mesh(ghostGeometry, ghostMaterial);
  ghostGroup.add(ghostBody);

  // Big detailed eyes
  const eyeGroup = new THREE.Group();
  ghostGroup.add(eyeGroup);

  const socketGeometry = new THREE.SphereGeometry(0.45, 16, 16);
  const socketMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const leftSocket = new THREE.Mesh(socketGeometry, socketMaterial);
  leftSocket.position.set(-0.7, 0.6, 1.9); leftSocket.scale.set(1.1, 1.0, 0.6); eyeGroup.add(leftSocket);
  const rightSocket = new THREE.Mesh(socketGeometry, socketMaterial);
  rightSocket.position.set(0.7, 0.6, 1.9); rightSocket.scale.set(1.1, 1.0, 0.6); eyeGroup.add(rightSocket);

  const eyeGeometry = new THREE.SphereGeometry(0.3, 12, 12);
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 1.0 });
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial.clone()); leftEye.position.set(-0.7, 0.6, 2.0); eyeGroup.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial.clone()); rightEye.position.set(0.7, 0.6, 2.0); eyeGroup.add(rightEye);

  const outerGlowGeometry = new THREE.SphereGeometry(0.525, 12, 12);
  const outerGlowMaterial = new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.3, side: THREE.BackSide });
  const leftOuterGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial.clone()); leftOuterGlow.position.set(-0.7, 0.6, 1.95); eyeGroup.add(leftOuterGlow);
  const rightOuterGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial.clone()); rightOuterGlow.position.set(0.7, 0.6, 1.95); eyeGroup.add(rightOuterGlow);

  updateProgress(3);

  // Glowing Fireflies
  const fireflies = [];
  const fireflyGroup = new THREE.Group(); scene.add(fireflyGroup);
  for (let i = 0; i < 20; i++) {
    const geom = new THREE.SphereGeometry(0.02, 2, 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.9 });
    const ff = new THREE.Mesh(geom, mat);
    ff.position.set((Math.random()-0.5)*40, (Math.random()-0.5)*30, (Math.random()-0.5)*20);
    
    const glGeom = new THREE.SphereGeometry(0.08, 8, 8);
    const glMat = new THREE.MeshBasicMaterial({ color: 0xffff88, transparent: true, opacity: 0.4, side: THREE.BackSide });
    const glow = new THREE.Mesh(glGeom, glMat); ff.add(glow);
    
    // Add point light for realism if available, else skip
    const ffLight = new THREE.PointLight(0xffff44, 0.8, 3, 2); ff.add(ffLight);
    
    ff.userData = {
      velocity: new THREE.Vector3((Math.random()-0.5)*params.fireflySpeed, (Math.random()-0.5)*params.fireflySpeed, (Math.random()-0.5)*params.fireflySpeed),
      phase: Math.random() * Math.PI * 2, pulseSpeed: 2 + Math.random() * 3,
      glowMat: glMat, ffMat: mat, light: ffLight
    };
    fireflyGroup.add(ff); fireflies.push(ff);
  }

  updateProgress(4);

  // Sync colors when theme goes light/dark or swaps hook
  window.addEventListener('themeChanged', () => {
    themeColorHex = getThemeColor();
    baseColor.set(themeColorHex);
    ghostMaterial.emissive.copy(baseColor);
    leftEye.material.color.copy(baseColor);
    rightEye.material.color.copy(baseColor);
    leftOuterGlow.material.color.copy(baseColor);
    rightOuterGlow.material.color.copy(baseColor);
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    ghostMaterial.emissiveIntensity = isLight ? params.emissiveIntensity * 0.3 : params.emissiveIntensity;
    ghostMaterial.color.setHex(isLight ? 0xdddddd : params.bodyColor);
  });
  window.dispatchEvent(new Event('themeChanged'));

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('resize', () => {
    camera.aspect = heroSection.offsetWidth / heroSection.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(heroSection.offsetWidth, heroSection.offsetHeight);
    if (composer) composer.setSize(heroSection.offsetWidth, heroSection.offsetHeight);
    if (analogDecayPass) analogDecayPass.uniforms.uResolution.value.set(heroSection.offsetWidth, heroSection.offsetHeight);
  });

  let time = 0;
  updateProgress(5);
  setTimeout(() => {
    for(let i=0; i<3; i++) { if (composer) composer.render(); else renderer.render(scene, camera); }
    completePreloader(canvas);
  }, 100);

  function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    if (analogDecayPass) analogDecayPass.uniforms.uTime.value = time;

    // Movement & Following
    const targetX = mouseX * 11;
    const targetY = mouseY * 7;
    ghostGroup.position.x += (targetX - ghostGroup.position.x) * params.followSpeed;
    ghostGroup.position.y += (targetY - ghostGroup.position.y) * params.followSpeed;

    ghostGroup.position.y += Math.sin(time * params.floatSpeed * 1.5) * 0.03 + Math.cos(time * params.floatSpeed * 0.7) * 0.018;

    const pulse1 = Math.sin(time * params.pulseSpeed) * params.pulseIntensity;
    const breathe = Math.sin(time * 0.6) * 0.12;
    ghostMaterial.emissiveIntensity = params.emissiveIntensity + pulse1 + breathe;

    // Wobbling
    const mDirX = targetX - ghostGroup.position.x;
    const mDirY = targetY - ghostGroup.position.y;
    const len = Math.sqrt(mDirX*mDirX + mDirY*mDirY) || 1;
    const tiltStrength = 0.1 * params.wobbleAmount;
    const tiltDecay = 0.95;
    ghostBody.rotation.z = ghostBody.rotation.z * tiltDecay + -(mDirX/len) * tiltStrength * (1 - tiltDecay);
    ghostBody.rotation.x = ghostBody.rotation.x * tiltDecay + (mDirY/len) * tiltStrength * (1 - tiltDecay);
    ghostBody.rotation.y = Math.sin(time * 1.4) * 0.05 * params.wobbleAmount;

    // Throbbing scale
    const scaleVariation = 1 + Math.sin(time * 2.1) * 0.025 * params.wobbleAmount + pulse1 * 0.015;
    const scaleBreath = 1 + Math.sin(time * 0.8) * 0.012;
    const finalScale = scaleVariation * scaleBreath;
    ghostBody.scale.set(finalScale, finalScale, finalScale);

    // Fireflies Update
    fireflies.forEach(ff => {
      const ud = ff.userData;
      const pulse = Math.sin(time + ud.phase * ud.pulseSpeed) * 0.4 + 0.6;
      ud.glowMat.opacity = params.fireflyGlowIntensity * 0.4 * pulse;
      ud.ffMat.opacity = params.fireflyGlowIntensity * 0.9 * pulse;
      ud.light.intensity = params.fireflyGlowIntensity * 0.8 * pulse;
      
      ud.velocity.x += (Math.random() - 0.5) * 0.001;
      ud.velocity.y += (Math.random() - 0.5) * 0.001;
      ud.velocity.z += (Math.random() - 0.5) * 0.001;
      ud.velocity.clampLength(0, params.fireflySpeed);
      ff.position.add(ud.velocity);
      
      if (Math.abs(ff.position.x) > 30) ud.velocity.x *= -0.5;
      if (Math.abs(ff.position.y) > 20) ud.velocity.y *= -0.5;
      if (Math.abs(ff.position.z) > 15) ud.velocity.z *= -0.5;
    });

    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  animate();
}
