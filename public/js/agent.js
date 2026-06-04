// IDEA Asia — Agent Page
// Audio-reactive particle node visualization + Web Speech API + Groq chat
// (No more 3D model — clean particle system)

(function () {
  'use strict';

  const lang = window.AGENT_LANG || 'en';

  // ── DOM ───────────────────────────────────────────────────
  const canvas        = document.getElementById('agentCanvas');
  const loader        = document.getElementById('agentLoader');
  const loaderBar     = document.getElementById('loaderBar');
  const loaderText    = document.getElementById('loaderText');
  const speechEl      = document.getElementById('agentSpeech');
  const speechTyping  = document.getElementById('speechTyping');
  const speechText    = document.getElementById('speechText');
  const inputEl       = document.getElementById('agentInput');
  const sendBtn       = document.getElementById('agentSend');
  const suggestionsEl = document.getElementById('agentSuggestions');
  const micBtn        = document.getElementById('agentMic');

  if (!canvas || !inputEl || !sendBtn) {
    console.error('IDEA Agent: critical DOM elements missing');
    return;
  }

  // ── STATE ─────────────────────────────────────────────────
  let history = [];
  let isLoading = false;
  let welcomeSpoken = false;
  let audioLevel = 0; // 0..1 — drives particle reactivity

  // ── PARTICLE SYSTEM ───────────────────────────────────────
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  let nodes = [];

  function resizeCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth  * DPR;
    H = canvas.offsetHeight * DPR;
    canvas.width  = W;
    canvas.height = H;
    initNodes();
  }

  function initNodes() {
    const targetCount = Math.min(Math.floor((W * H) / (12000 * DPR)), 140);
    nodes = [];
    const cx = W / 2;
    const cy = H / 2;
    const baseR = Math.min(W, H) * 0.32;

    for (let i = 0; i < targetCount; i++) {
      // Distribute nodes in a soft disk around center, denser near middle
      const u = Math.random();
      const ringR = baseR * Math.sqrt(u);
      const angle = Math.random() * Math.PI * 2;
      const x = cx + Math.cos(angle) * ringR;
      const y = cy + Math.sin(angle) * ringR * 0.85; // slightly elliptical (taller)

      nodes.push({
        homeX: x,
        homeY: y,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 0.25 * DPR,
        vy: (Math.random() - 0.5) * 0.25 * DPR,
        r: (Math.random() * 1.6 + 0.6) * DPR,
        pulse: Math.random() * Math.PI * 2,
        // ~18% blue accent nodes, rest dark ink
        accent: Math.random() < 0.18,
      });
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    // Connection threshold scales with audio
    const maxDist = (140 + audioLevel * 80) * DPR;
    const lineWidth = 0.5 * DPR;

    // Update positions
    const cx = W / 2;
    const cy = H / 2;
    const audioBoost = 1 + audioLevel * 2.5;

    const t = performance.now() * 0.0008;
    const isIdle = audioLevel < 0.05;
    // Slow orbital rotation of "home" anchors when idle → cluster gently swirls
    const orbitSpeed = isIdle ? 0.0006 : 0;
    const cos = Math.cos(orbitSpeed);
    const sin = Math.sin(orbitSpeed);

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      // Drift
      n.x += n.vx * audioBoost;
      n.y += n.vy * audioBoost;
      n.pulse += 0.020 + audioLevel * 0.10;

      // Loose spring back to home — looser when idle for more freedom
      const springK = isIdle ? 0.0035 : 0.012;
      n.x += (n.homeX - n.x) * springK;
      n.y += (n.homeY - n.y) * springK;

      // Idle waves: gentle sinusoidal undulation, each node phase-shifted
      if (isIdle) {
        const wavePhase = t + i * 0.18;
        n.x += Math.sin(wavePhase) * 0.18 * DPR;
        n.y += Math.cos(wavePhase * 0.85) * 0.14 * DPR;

        // Slowly rotate the home anchor → cluster appears to revolve
        const hdx = n.homeX - cx;
        const hdy = n.homeY - cy;
        n.homeX = cx + hdx * cos - hdy * sin;
        n.homeY = cy + hdx * sin + hdy * cos;
      }

      // Audio pulse: push nodes outward from center on loud signals
      if (audioLevel > 0.05) {
        const dx = n.x - cx;
        const dy = n.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const push = audioLevel * 0.6 * DPR;
        n.x += (dx / dist) * push;
        n.y += (dy / dist) * push;
      }
    }

    // Draw connection lines first (under nodes)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        const max2 = maxDist * maxDist;
        if (d2 < max2) {
          const t = 1 - Math.sqrt(d2) / maxDist;
          const alpha = t * (0.30 + audioLevel * 0.45);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(26, 80, 232, ${alpha})`;
          ctx.lineWidth = lineWidth;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const p = Math.sin(n.pulse) * 0.5 + 0.5;
      const r = n.r * (1 + audioLevel * 0.55 + p * 0.4);

      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      if (n.accent) {
        ctx.fillStyle = `rgba(26, 80, 232, ${0.7 + p * 0.3})`;
      } else {
        ctx.fillStyle = `rgba(10, 15, 28, ${0.55 + p * 0.30})`;
      }
      ctx.fill();

      // Glow ring on larger nodes when audio is active
      if (n.r > 1.4 * DPR && audioLevel > 0.08) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 3 + audioLevel * 6 * DPR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(26, 80, 232, ${audioLevel * 0.18})`;
        ctx.lineWidth = 1 * DPR;
        ctx.stroke();
      }
    }

    // Decay audio level so animation stays smooth after spikes
    audioLevel *= 0.92;
    if (audioLevel < 0.002) audioLevel = 0;

    requestAnimationFrame(drawFrame);
  }

  // ── AUDIO REACTIVITY ──────────────────────────────────────
  let audioCtx = null;
  let micAnalyser = null;
  let micData = null;
  let ttsAnalysers = []; // for currently-playing TTS audio elements

  function ensureAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Aggressively resume — autoplay policy suspends context until user gesture
    if (audioCtx.state === 'suspended' && audioCtx.resume) {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function attachMicAnalyser(stream) {
    const ac = ensureAudioCtx();
    const source = ac.createMediaStreamSource(stream);
    micAnalyser = ac.createAnalyser();
    micAnalyser.fftSize = 256;
    micAnalyser.smoothingTimeConstant = 0.55;
    source.connect(micAnalyser);
    micData = new Uint8Array(micAnalyser.frequencyBinCount);
    console.log('[agent] mic analyser attached, polling…');
    pollMicAudio();
  }

  function pollMicAudio() {
    if (!micAnalyser) return;
    micAnalyser.getByteFrequencyData(micData);
    let sum = 0;
    for (let i = 0; i < micData.length; i++) sum += micData[i];
    const avg = (sum / micData.length) / 255; // 0..1
    audioLevel = Math.max(audioLevel, avg * 2.2);
    requestAnimationFrame(pollMicAudio);
  }

  // IMPORTANT: must be called BEFORE audioEl.play() so that the analyser
  // is part of the audio routing graph from the start.
  function attachTTSAnalyser(audioEl) {
    try {
      const ac = ensureAudioCtx();
      // Mark element so we don't try to attach twice (causes "already connected" error)
      if (audioEl._idea_analyser_attached) return;
      audioEl._idea_analyser_attached = true;

      const source = ac.createMediaElementSource(audioEl);
      const an = ac.createAnalyser();
      an.fftSize = 256;
      an.smoothingTimeConstant = 0.55;
      source.connect(an);
      an.connect(ac.destination); // keep audible
      const data = new Uint8Array(an.frequencyBinCount);
      console.log('[agent] TTS analyser attached');

      let polling = false;
      function pollTTS() {
        if (audioEl.paused || audioEl.ended) { polling = false; return; }
        an.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = (sum / data.length) / 255;
        audioLevel = Math.max(audioLevel, avg * 2.4);
        requestAnimationFrame(pollTTS);
      }
      audioEl.addEventListener('play', () => {
        if (ac.state === 'suspended') ac.resume();
        if (!polling) { polling = true; pollTTS(); }
      });
    } catch (e) {
      console.warn('[agent] TTS analyser attach failed:', e.message);
    }
  }

  // ── SPEECH BUBBLE ─────────────────────────────────────────
  function showTyping() {
    if (!speechEl) return;
    if (speechTyping) speechTyping.style.display = 'flex';
    if (speechText)   speechText.style.display = 'none';
    speechEl.classList.add('visible');
  }

  function showSpeech(html) {
    if (!speechEl) return;
    if (speechTyping) speechTyping.style.display = 'none';
    if (speechText) {
      speechText.innerHTML = html;
      speechText.style.display = 'block';
    }
    speechEl.classList.add('visible');
  }

  function hideSpeech() {
    if (speechEl) speechEl.classList.remove('visible');
  }

  // ── BROWSER TTS (Jarvis response speak via Speech Synthesis) ──
  // SpeechSynthesis doesn't expose audio stream, so we simulate audio
  // amplitude oscillation while utterance is active → particles still react.
  let synthPulseTimer = 0;
  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'id' ? 'id-ID' : 'en-US';
    u.rate = 1; u.pitch = 1; u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(vv => vv.lang.toLowerCase().startsWith(u.lang.toLowerCase()));
    if (v) u.voice = v;

    let speaking = false;
    u.onstart = () => { speaking = true; simulatePulse(); };
    u.onend = () => { speaking = false; };

    function simulatePulse() {
      if (!speaking) return;
      // Random oscillation 0.25 .. 0.65 to mimic voice envelope
      const t = performance.now() * 0.005;
      const pulse = 0.45 + 0.20 * Math.sin(t) + (Math.random() - 0.5) * 0.15;
      audioLevel = Math.max(audioLevel, Math.max(0.1, Math.min(0.75, pulse)));
      requestAnimationFrame(simulatePulse);
    }

    window.speechSynthesis.speak(u);
  }

  function formatResponse(text) {
    if (!text) return '';
    // Bold **word**
    let html = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Newlines → paragraphs / list items
    const lines = html.split('\n').filter(l => l.trim());
    let inList = false;
    const out = [];
    lines.forEach(line => {
      const isBullet = /^[\-\*•]\s/.test(line);
      if (isBullet) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + line.replace(/^[\-\*•]\s+/, '') + '</li>');
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push('<p>' + line + '</p>');
      }
    });
    if (inList) out.push('</ul>');
    return out.join('');
  }

  // ── CHAT ──────────────────────────────────────────────────
  async function sendMessage(text) {
    text = (text || '').trim();
    if (!text || isLoading) return;

    if (suggestionsEl) suggestionsEl.classList.add('hidden');
    inputEl.value = '';
    autoResize();
    showTyping();
    isLoading = true;
    sendBtn.disabled = true;

    try {
      const res = await fetch('/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      if (!res.ok) {
        showSpeech(`<p>${data.error || 'Something went wrong.'}</p>`);
      } else {
        showSpeech(formatResponse(data.reply));
        history.push({ role: 'user', content: text });
        history.push({ role: 'assistant', content: data.reply });
        speak(data.reply.replace(/\*\*/g, '').replace(/\n/g, ' '));
      }
    } catch (err) {
      console.error('Chat error:', err);
      showSpeech(`<p>${lang === 'id' ? 'Tidak dapat terhubung. Coba lagi.' : 'Connection failed. Try again.'}</p>`);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
    }
  }

  function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  }

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    resizeCanvas();
    drawFrame();
    window.addEventListener('resize', resizeCanvas);

    // Smooth loader sequence
    if (loaderText) loaderText.textContent = 'Initializing…';
    if (loaderBar) loaderBar.style.width = '40%';
    setTimeout(() => {
      if (loaderBar) loaderBar.style.width = '100%';
      if (loaderText) loaderText.textContent = 'Ready';
      setTimeout(() => {
        if (loader) loader.classList.add('hidden');

        const welcome = lang === 'id'
          ? '<p>Halo! Saya <strong>Jarvis</strong> 👋</p><p>Selamat datang di website kami. Saya akan membantu kamu — katakan apa yang bisa saya bantu.</p>'
          : '<p>Hello! I\'m <strong>Jarvis</strong> 👋</p><p>Welcome. I\'m your digital consultant today — how can I help you?</p>';
        showSpeech(welcome);

        // Welcome voice — pre-recorded mp3s still say "Carolla" so we skip them
        // and use Browser TTS (which we control text-wise) for the "Jarvis" intro.
        const fromInternal = document.referrer && document.referrer.includes(window.location.hostname);
        if (!fromInternal) {
          const introText = lang === 'id'
            ? 'Halo! Saya Jarvis, asisten digital Anda dari IDEA Asia. Selamat datang. Katakan apa yang bisa saya bantu hari ini.'
            : 'Hello! I am Jarvis, your digital consultant from IDEA Asia. Welcome. Tell me how I can help you today.';
          // Browser TTS doesn't expose an audio stream, but speak() simulates
          // amplitude oscillation so particles react during the intro.
          speak(introText);
        }
      }, 300);
    }, 600);
  }

  // ── EVENT WIRING ──────────────────────────────────────────
  inputEl.addEventListener('input', autoResize);
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

  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {};
    window.speechSynthesis.getVoices();
  }

  // First user gesture → resume AudioContext (required by autoplay policy
  // before mic / TTS analyser data can flow)
  function resumeAudioOnGesture() {
    ensureAudioCtx(); // creates + resumes
    if (welcomeSpoken) {
      document.removeEventListener('click', resumeAudioOnGesture);
      document.removeEventListener('keydown', resumeAudioOnGesture);
      document.removeEventListener('touchstart', resumeAudioOnGesture);
      return;
    }
    welcomeSpoken = true;
  }
  document.addEventListener('click', resumeAudioOnGesture);
  document.addEventListener('keydown', resumeAudioOnGesture);
  document.addEventListener('touchstart', resumeAudioOnGesture);

  // ── MIC (Speech Recognition + Audio Analyser) ─────────────
  let recognition = null;
  let isRecording = false;
  let activeMicStream = null;

  if (micBtn) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === 'id' ? 'id-ID' : 'en-US';

      recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        inputEl.placeholder = lang === 'id' ? 'Mendengarkan…' : 'Listening…';
      };
      recognition.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        inputEl.value = transcript;
        autoResize();
      };
      recognition.onend = () => {
        isRecording = false;
        micBtn.classList.remove('recording');
        inputEl.placeholder = lang === 'id' ? 'Tanya saya tentang layanan IT…' : 'Ask me about IT services…';
        if (activeMicStream) {
          activeMicStream.getTracks().forEach(t => t.stop());
          activeMicStream = null;
        }
        if (micAnalyser) {
          try { micAnalyser.disconnect(); } catch(e) {}
          micAnalyser = null;
        }
        if (inputEl.value.trim()) setTimeout(() => sendMessage(inputEl.value), 300);
      };
      recognition.onerror = (e) => {
        isRecording = false;
        micBtn.classList.remove('recording');
        console.error('Speech recognition error:', e.error);
      };

      micBtn.addEventListener('click', () => {
        if (isRecording) {
          recognition.stop();
          return;
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        recognition.lang = (window.AGENT_LANG || 'en') === 'id' ? 'id-ID' : 'en-US';
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            activeMicStream = stream;
            attachMicAnalyser(stream); // particles react to mic
            try { recognition.start(); } catch(e) { console.error('start error:', e); }
          })
          .catch(err => {
            console.error('Mic denied:', err);
            alert(lang === 'id'
              ? 'Izin mikrofon ditolak. Mohon izinkan akses mikrofon di browser Anda.'
              : 'Microphone access denied. Please allow microphone access in your browser.');
          });
      });
    } else {
      micBtn.style.display = 'none';
    }
  }

  // Cleanup on navigate-away
  window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  });
  window.addEventListener('pagehide', () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  });

  init();
})();
