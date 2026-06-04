// IDEA Asia — Agent Page
// Three.js 3D avatar + morph target lip sync + Web Speech API + Groq chat

(function () {
  'use strict';

  const lang = window.AGENT_LANG || 'en';

  // ── DOM ───────────────────────────────────────────────────
  const canvas      = document.getElementById('agentCanvas');
  const loader      = document.getElementById('agentLoader');
  const loaderBar   = document.getElementById('loaderBar');
  const loaderText  = document.getElementById('loaderText');
  const speechEl    = document.getElementById('agentSpeech');
  const speechTyping= document.getElementById('speechTyping');
  const speechText  = document.getElementById('speechText');
  const inputEl     = document.getElementById('agentInput');
  const sendBtn     = document.getElementById('agentSend');
  const suggestionsEl = document.getElementById('agentSuggestions');

  // Guard: if critical elements missing, abort
  if (!canvas || !inputEl || !sendBtn) {
    console.error('IDEA Agent: critical DOM elements missing');
    return;
  }

  // ── STATE ─────────────────────────────────────────────────
  let agentState = 'idle'; // idle | listening | thinking | talking
  let history = [];
  let welcomeSpoken = false;
  let isLoading = false;
  let isSpeaking = false;
  let morphTargets = {}; // name → mesh[] map
  let mixer = null;
  let clock = null;
  let camera = null, scene = null, renderer = null;
  let model = null;
  let blinkTimer = 0, nextBlink = 3;
  let idleTimer = 0;

  // Viseme map: phoneme → morph target weights
  const VISEME_MAP = {
    'viseme_sil': { viseme_sil: 1 },
    'viseme_PP':  { viseme_PP: 1, mouthClose: 0.5 },
    'viseme_FF':  { viseme_FF: 1 },
    'viseme_TH':  { viseme_TH: 1 },
    'viseme_DD':  { viseme_DD: 1, jawOpen: 0.3 },
    'viseme_kk':  { viseme_kk: 1, jawOpen: 0.3 },
    'viseme_CH':  { viseme_CH: 1, jawOpen: 0.4 },
    'viseme_SS':  { viseme_SS: 1 },
    'viseme_nn':  { viseme_nn: 1, jawOpen: 0.2 },
    'viseme_RR':  { viseme_RR: 1, jawOpen: 0.3 },
    'viseme_aa':  { viseme_aa: 1, jawOpen: 0.8, mouthOpen: 0.7 },
    'viseme_E':   { viseme_E: 1,  jawOpen: 0.5, mouthSmile: 0.2 },
    'viseme_I':   { viseme_I: 1,  jawOpen: 0.3, mouthSmile: 0.3 },
    'viseme_O':   { viseme_O: 1,  jawOpen: 0.6, mouthFunnel: 0.5 },
    'viseme_U':   { viseme_U: 1,  jawOpen: 0.4, mouthPucker: 0.5 },
  };

  // Talking sequence — cycles through phonemes to simulate speech
  const TALK_PHONEMES = [
    'viseme_aa','viseme_E','viseme_I','viseme_O','viseme_U',
    'viseme_DD','viseme_kk','viseme_RR','viseme_nn','viseme_SS',
    'viseme_aa','viseme_PP','viseme_FF','viseme_aa','viseme_E',
  ];
  let phonemeIdx = 0;
  let phonemeTimer = 0;
  const PHONEME_INTERVAL = 0.09; // seconds per phoneme

  // ── THREE.JS SETUP ─────────────────────────────────────────
  function loadScript(src, required=true) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = required ? reject : () => resolve();
      document.head.appendChild(s);
    });
  }

  async function initThree() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
  }

  async function initGLTFLoader() {
    await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
    // Patch: expose THREE.GLTFLoader if loaded into THREE namespace
    if (window.THREE && !window.THREE.GLTFLoader && window.GLTFLoader) {
      window.THREE.GLTFLoader = window.GLTFLoader;
    }
  }

  async function initOrbitControls() {
    await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', false);
    if (window.THREE && !window.THREE.OrbitControls && window.OrbitControls) {
      window.THREE.OrbitControls = window.OrbitControls;
    }
  }

  function setupScene() {
    const THREE = window.THREE;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene
    scene = new THREE.Scene();
    // Subtle gradient fog background
    scene.background = null;
    // fog removed

    // Camera — tighter portrait bust shot
    camera = new THREE.PerspectiveCamera(22, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.60, 2.0);
    camera.lookAt(0, 1.55, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0x8899bb, 0.4);
    scene.add(ambient);

    // Key light — warm front
    const keyLight = new THREE.DirectionalLight(0xfff4e8, 1.8);
    keyLight.position.set(1.5, 3, 2.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    // Fill light — cool blue left
    const fillLight = new THREE.DirectionalLight(0x4488cc, 0.6);
    fillLight.position.set(-2, 2, 1);
    scene.add(fillLight);

    // Rim light — from behind
    const rimLight = new THREE.DirectionalLight(0x2255aa, 0.8);
    rimLight.position.set(0, 1, -3);
    scene.add(rimLight);

    // Hemisphere
    const hemi = new THREE.HemisphereLight(0x0a1535, 0x050810, 0.3);
    scene.add(hemi);

    // Orbit controls (subtle — just for feel)
    if (window.THREE && window.THREE.OrbitControls) {
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 1.5, 0);
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.minPolarAngle = Math.PI / 4;
      controls.maxPolarAngle = Math.PI / 1.8;
      controls.minAzimuthAngle = -Math.PI / 5;
      controls.maxAzimuthAngle = Math.PI / 5;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = false;
      window._orbitControls = controls;
    }

    clock = new THREE.Clock();

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  function loadModel() {
    return new Promise((resolve, reject) => {
      const THREE = window.THREE;
      // GLTFLoader may be on THREE or global depending on how it loaded
      const GLTFLoaderClass = THREE.GLTFLoader || window.GLTFLoader;
      if (!GLTFLoaderClass) { reject(new Error('GLTFLoader not available')); return; }
      const loader = new GLTFLoaderClass();

      loader.load(
        '/models/agent-model.glb',
        (gltf) => {
          model = gltf.scene;

          // ── Force visibility + disable culling on all meshes ──
          model.traverse((node) => {
            if (node.isMesh) { node.visible = true; node.frustumCulled = false; }
          });

          // ── Geometry-local height detection (Box3 unreliable for SkinnedMesh) ──
          let geomLocalSize = new THREE.Vector3();
          model.traverse((node) => {
            if (node.isMesh && node.geometry?.boundingBox === null) node.geometry.computeBoundingBox();
            if (node.isMesh && !geomLocalSize.lengthSq() && node.geometry?.boundingBox) {
              node.geometry.boundingBox.getSize(geomLocalSize);
            }
          });
          console.log('[avatar] geometry-local size:', geomLocalSize.x.toFixed(2), geomLocalSize.y.toFixed(2), geomLocalSize.z.toFixed(2));

          // Determine which geometry-local axis is height
          let upAxis = 'y';
          if (geomLocalSize.z > geomLocalSize.x && geomLocalSize.z > geomLocalSize.y) upAxis = 'z';
          else if (geomLocalSize.x > geomLocalSize.y && geomLocalSize.x > geomLocalSize.z) upAxis = 'x';

          // Convert geometry up-axis → world Y-up
          if (upAxis === 'z') {
            model.rotation.x = -Math.PI / 2;
            console.log('[avatar] rotation: Z-up → Y-up');
          } else if (upAxis === 'x') {
            model.rotation.z = Math.PI / 2;
            console.log('[avatar] rotation: X-up → Y-up');
          }

          // Place model so feet are roughly at y=0 (origin already at feet after apply_transform)
          model.position.set(0, 0, 0);

          // ── Pose arms down (Renderpeople Sophia ships in T/A-pose) ──
          // Log all bones for inspection, then try to rotate upper-arm bones so arms hang.
          const boneNames = [];
          model.traverse((node) => {
            if (node.isBone) boneNames.push(node.name);
          });
          console.log('[avatar] bones found:', boneNames.length);
          console.log('[avatar] sample bone names:', boneNames.slice(0, 20).join(', '));

          // Find arm bones via name pattern matching common Renderpeople conventions
          model.traverse((node) => {
            if (!node.isBone) return;
            const n = node.name.toLowerCase();

            // Upper arm / shoulder area — rotate so arm hangs ~vertical
            const isUpperArm = /(upper[_-]?arm|^l_arm$|^r_arm$|leftarm|rightarm|^arm_l|^arm_r|shoulder)/.test(n);
            if (!isUpperArm) return;

            const isLeft  = /(^l[_-]|left|^arm_l)/.test(n);
            const isRight = /(^r[_-]|right|^arm_r)/.test(n);

            // Rotate around Z axis ~75° to pull arm from horizontal toward vertical
            // Sign depends on left/right (mirror)
            if (isLeft) {
              node.rotation.z += 1.3;  // ~75° clockwise from chest POV
              console.log(`[avatar] rotated LEFT arm: ${node.name}`);
            } else if (isRight) {
              node.rotation.z -= 1.3;
              console.log(`[avatar] rotated RIGHT arm: ${node.name}`);
            }
          });

          scene.add(model);
          console.log('[avatar] scene.add complete. Camera tight portrait at (0, 1.60, 2.0)');

          // Build morph target index
          model.traverse((node) => {
            if (node.isMesh && node.morphTargetDictionary) {
              Object.keys(node.morphTargetDictionary).forEach(name => {
                if (!morphTargets[name]) morphTargets[name] = [];
                morphTargets[name].push(node);
              });
            }
          });

          // Animation DISABLED — Renderpeople clip distorts mesh.
          // Keep model in rest pose (T-pose or initial). Static avatar = clean look.
          if (gltf.animations && gltf.animations.length) {
            console.log(`[avatar] animation found ("${gltf.animations[0].name}") but disabled by config`);
          }
          // mixer stays null → update loop skips animation tick

          resolve();
        },
        (progress) => {
          const pct = Math.round((progress.loaded / progress.total) * 100);
          loaderBar.style.width = pct + '%';
          loaderText.textContent = `Loading model... ${pct}%`;
        },
        reject
      );
    });
  }

  // ── MORPH TARGET CONTROL ──────────────────────────────────
  function setMorph(name, value) {
    const meshes = morphTargets[name];
    if (!meshes) return;
    meshes.forEach(mesh => {
      const idx = mesh.morphTargetDictionary[name];
      if (idx !== undefined && mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[idx] = Math.max(0, Math.min(1, value));
      }
    });
  }

  function getMorph(name) {
    const meshes = morphTargets[name];
    if (!meshes || !meshes[0]) return 0;
    const idx = meshes[0].morphTargetDictionary[name];
    return meshes[0].morphTargetInfluences[idx] || 0;
  }

  function lerpMorph(name, target, speed) {
    const current = getMorph(name);
    setMorph(name, current + (target - current) * speed);
  }

  function resetMorphs() {
    const keys = ['jawOpen','mouthOpen','mouthSmile','mouthFunnel','mouthPucker','mouthClose',
      'viseme_sil','viseme_PP','viseme_FF','viseme_TH','viseme_DD','viseme_kk',
      'viseme_CH','viseme_SS','viseme_nn','viseme_RR','viseme_aa','viseme_E',
      'viseme_I','viseme_O','viseme_U'];
    keys.forEach(k => lerpMorph(k, 0, 0.15));
  }

  // ── ANIMATION LOOP ────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock ? clock.getDelta() : 0.016;
    const elapsed = clock ? clock.getElapsedTime() : 0;

    if (mixer) mixer.update(dt);
    if (window._orbitControls) window._orbitControls.update();

    if (model) {
      // Idle breathing — subtle chest/body sway
      const breathe = Math.sin(elapsed * 1.1) * 0.003;
      const sway    = Math.sin(elapsed * 0.4) * 0.008;
      model.rotation.y = sway;
      model.position.y += (breathe - model.position.y * 0.01) * 0.05;

      // Blink
      blinkTimer += dt;
      if (blinkTimer >= nextBlink) {
        blinkTimer = 0;
        nextBlink = 2.5 + Math.random() * 4;
        doBlink();
      }

      // State-based morph animations
      if (agentState === 'idle') {
        resetMorphs();
        // Subtle idle mouth
        const idleM = Math.abs(Math.sin(elapsed * 0.3)) * 0.02;
        lerpMorph('mouthSmile', idleM + 0.05, 0.05);

      } else if (agentState === 'listening') {
        resetMorphs();
        lerpMorph('browInnerUp', 0.25, 0.08);
        lerpMorph('mouthSmile', 0.1, 0.08);
        lerpMorph('jawOpen', 0.05, 0.08);

      } else if (agentState === 'thinking') {
        resetMorphs();
        const thinkT = Math.sin(elapsed * 2);
        lerpMorph('browDownLeft', 0.3 + thinkT * 0.1, 0.08);
        lerpMorph('browDownRight', 0.25 + thinkT * 0.08, 0.08);
        lerpMorph('browInnerUp', 0.15, 0.08);
        lerpMorph('mouthPressLeft', 0.2, 0.08);
        lerpMorph('mouthPressRight', 0.2, 0.08);
        // Slight head tilt when thinking
        model.rotation.z = Math.sin(elapsed * 0.5) * 0.04;

      } else if (agentState === 'talking') {
        // Drive phoneme lip sync
        phonemeTimer += dt;
        if (phonemeTimer >= PHONEME_INTERVAL) {
          phonemeTimer = 0;
          phonemeIdx = (phonemeIdx + 1) % TALK_PHONEMES.length;
        }
        // Clear previous visemes
        const visemeKeys = Object.keys(VISEME_MAP).flatMap(k => Object.keys(VISEME_MAP[k]));
        [...new Set(visemeKeys)].forEach(k => lerpMorph(k, 0, 0.3));
        // Apply current phoneme
        const phoneme = TALK_PHONEMES[phonemeIdx];
        const weights = VISEME_MAP[phoneme] || {};
        Object.entries(weights).forEach(([k, v]) => lerpMorph(k, v, 0.4));
        // Talking expression — slight smile
        lerpMorph('mouthSmile', 0.1, 0.05);
      }
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // ── BLINK ─────────────────────────────────────────────────
  function doBlink() {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.016;
      const v = t < 0.08 ? t / 0.08 : Math.max(0, 1 - (t - 0.08) / 0.1);
      setMorph('eyeBlinkLeft', v);
      setMorph('eyeBlinkRight', v);
      if (t > 0.18) {
        setMorph('eyeBlinkLeft', 0);
        setMorph('eyeBlinkRight', 0);
        clearInterval(interval);
      }
    }, 16);
  }

  // ── SPEECH BUBBLE ─────────────────────────────────────────
  function showTyping() {
    speechTyping.style.display = 'flex';
    speechText.style.display = 'none';
    speechEl.classList.add('visible');
  }

  function showSpeech(html) {
    speechTyping.style.display = 'none';
    speechText.style.display = 'block';
    speechText.innerHTML = html;
    speechEl.classList.add('visible');
  }

  function hideSpeech() {
    speechEl.classList.remove('visible');
  }

  // ── WEB SPEECH API (TTS) ──────────────────────────────────
  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    utterance.lang = lang === 'id' ? 'id-ID' : 'en-US';

    // Pick a female voice if available
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v =>
      (v.name.toLowerCase().includes('female') ||
       v.name.toLowerCase().includes('zira') ||
       v.name.toLowerCase().includes('samantha') ||
       v.name.toLowerCase().includes('victoria') ||
       v.name.toLowerCase().includes('karen') ||
       (lang === 'id' && v.lang === 'id-ID')) &&
      !v.name.toLowerCase().includes('male')
    );
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onstart = () => {
      isSpeaking = true;
      setAgentState('talking');
    };
    utterance.onend = () => {
      isSpeaking = false;
      setAgentState('idle');
    };
    utterance.onerror = () => {
      isSpeaking = false;
      setAgentState('idle');
    };

    window.speechSynthesis.speak(utterance);
  }

  // ── AGENT STATE ───────────────────────────────────────────
  function setAgentState(s) {
    agentState = s;
    if (model) model.rotation.z = 0; // reset tilt
  }

  // ── FORMAT AI RESPONSE ────────────────────────────────────
  function formatResponse(text) {
    let html = text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');

    const lines = html.split('\n');
    let out = [], inList = false;
    for (const line of lines) {
      const t = line.trim();
      if (/^[-•]\s+/.test(t)) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push(`<li>${t.replace(/^[-•]\s+/,'')}</li>`);
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        if (t) out.push(`<p>${t}</p>`);
      }
    }
    if (inList) out.push('</ul>');
    return out.join('');
  }

  // ── SEND MESSAGE ──────────────────────────────────────────
  async function sendMessage(text) {
    text = text.trim();
    if (!text || isLoading) return;

    if (suggestionsEl) suggestionsEl.classList.add('hidden');
    history.push({ role: 'user', content: text });
    inputEl.value = '';
    autoResize();

    setAgentState('thinking');
    showTyping();
    setLoading(true);

    try {
      const res = await fetch('/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(-10) })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        const errMsg = data.error || (lang === 'id' ? 'Terjadi kesalahan.' : 'Something went wrong.');
        showSpeech(`<p>${errMsg}</p>`);
        setAgentState('idle');
      } else {
        history.push({ role: 'assistant', content: data.reply });
        if (history.length > 20) history = history.slice(-20);
        showSpeech(formatResponse(data.reply));
        // Speak the response
        speak(data.reply);
      }
    } catch (e) {
      const msg = lang === 'id' ? 'Gagal terhubung ke server.' : 'Failed to connect.';
      showSpeech(`<p>${msg}</p>`);
      setAgentState('idle');
    }

    setLoading(false);
  }

  function setLoading(v) {
    isLoading = v;
    sendBtn.disabled = v;
    inputEl.disabled = v;
  }

  function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  }

  // ── INIT ──────────────────────────────────────────────────
  async function init() {
    try {
      if(loaderText) loaderText.textContent = 'Loading Three.js...';
      if(loaderBar) loaderBar.style.width = '10%';
      await initThree();

      if(loaderText) loaderText.textContent = 'Loading GLTF loader...';
      if(loaderBar) loaderBar.style.width = '25%';
      await initGLTFLoader();
      await initOrbitControls();

      if(loaderText) loaderText.textContent = 'Setting up scene...';
      if(loaderBar) loaderBar.style.width = '35%';
      setupScene();

      if(loaderText) loaderText.textContent = 'Loading model...';
      await loadModel();

      if(loaderBar) loaderBar.style.width = '100%';
      if(loaderText) loaderText.textContent = 'Ready';

      // Start animation
      animate();

      // Show welcome after short delay
      setTimeout(() => {
        if(loader) loader.classList.add('hidden');
        const welcome = lang === 'id'
          ? '<p>Halo! Saya <strong>Carolla</strong> 👋</p><p>Selamat datang di website kami! Saya Carolla yang akan membantu kamu. Katakan apa yang bisa saya bantu.</p>'
          : '<p>Hello! I\'m <strong>Carolla</strong> 👋</p><p>Welcome to our website! I\'m Carolla, and I will be your digital consultant today. How can I help you?</p>';
        showSpeech(welcome);
        setAgentState('idle');
        // Speak welcome - tunggu voices ready
        const welcomeText = lang === 'id'
          ? 'Selamat datang di website kami. Saya Carolla yang akan membantu kamu. Katakan apa yang bisa saya bantu.'
          : 'Welcome to our website! I am Carolla, and I will be your digital consultant today. Please tell me how I can help you.';

        // Play welcome voice hanya jika bukan dari internal website
        const fromInternal = document.referrer && document.referrer.includes(window.location.hostname);
        if (!fromInternal) {
          const audioFile = lang === 'id' ? '/audio/welcome_id.mp3' : '/audio/welcome_en.mp3';
          const welcomeAudio = new Audio(audioFile);
          welcomeAudio.volume = 1.0;
          welcomeAudio.play().catch(() => {
            speak(welcomeText);
          });
          welcomeAudio.onplay = () => setAgentState('talking');
          welcomeAudio.onended = () => setAgentState('idle');
        }
      }, 500);

    } catch (err) {
      console.error('Agent init error:', err);
      if(loaderText) loaderText.textContent = 'Error loading. Please refresh.';
    }
  }

  // ── EVENT LISTENERS ───────────────────────────────────────
  inputEl.addEventListener('input', () => {
    autoResize();
    if (inputEl.value.trim()) {
      setAgentState('listening');
    } else {
      setAgentState('idle');
    }
  });

  // Trigger welcome voice on first user interaction (browser policy)
  function triggerWelcomeVoice() {
    if (welcomeSpoken) return;
    welcomeSpoken = true;
    const txt = lang === 'id'
      ? 'Selamat datang di website kami. Saya Carolla yang akan membantu kamu. Katakan apa yang bisa saya bantu.'
      : 'Welcome to our website! I am Carolla, and I will be your digital consultant today. Please tell me how I can help you.';
    speak(txt);
    document.removeEventListener('click', triggerWelcomeVoice);
    document.removeEventListener('keydown', triggerWelcomeVoice);
  }
  document.addEventListener('click', triggerWelcomeVoice);
  document.addEventListener('keydown', triggerWelcomeVoice);

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));

  if (suggestionsEl) {
    suggestionsEl.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const msg = chip.dataset.msg;
        if (msg) sendMessage(msg);
      });
    });
  }

  // Load voices when available
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {};
    window.speechSynthesis.getVoices();
  }

  // ── SPEECH RECOGNITION (client voice input) ─────────────────────────
  const micBtn = document.getElementById('agentMic');
  let recognition = null;
  let isRecording = false;

  if (micBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === 'id' ? 'id-ID' : 'en-US';

      recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        setAgentState('listening');
        inputEl.placeholder = lang === 'id' ? 'Mendengarkan...' : 'Listening...';
      };

      recognition.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        inputEl.value = transcript;
        autoResize();
      };

      recognition.onend = () => {
        isRecording = false;
        micBtn.classList.remove('recording');
        inputEl.placeholder = lang === 'id' ? 'Tanya saya tentang layanan IT...' : 'Ask me about IT services...';
        setAgentState('idle');
        if (inputEl.value.trim()) setTimeout(() => sendMessage(inputEl.value), 300);
      };

      recognition.onerror = (e) => {
        isRecording = false;
        micBtn.classList.remove('recording');
        setAgentState('idle');
        console.error('Speech recognition error:', e.error);
      };

      micBtn.addEventListener('click', () => {
        if (isRecording) {
          recognition.stop();
          return;
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        recognition.lang = (window.AGENT_LANG || 'en') === 'id' ? 'id-ID' : 'en-US';
        // Minta izin mic dulu via getUserMedia
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            stream.getTracks().forEach(t => t.stop());
            try { recognition.start(); } catch(e) { console.error('start error:', e); }
          })
          .catch(err => {
            console.error('Mic denied:', err);
            alert(window.AGENT_LANG === 'id'
              ? 'Izin mikrofon ditolak. Mohon izinkan akses mikrofon di browser Anda.'
              : 'Microphone access denied. Please allow microphone access in your browser.');
          });
      });

    } else {
      micBtn.style.display = 'none';
    }
  }


  // Stop semua audio saat user navigasi keluar dari halaman
  window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (window._welcomeAudio) {
      window._welcomeAudio.pause();
      window._welcomeAudio.currentTime = 0;
    }
  });
  window.addEventListener('pagehide', () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  });

  init();

})();
