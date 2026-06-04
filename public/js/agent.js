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
    clearActions();
    speechEl.classList.add('visible');
  }

  function showSpeech(html, actions) {
    if (!speechEl) return;
    if (speechTyping) speechTyping.style.display = 'none';
    if (speechText) {
      speechText.innerHTML = html;
      speechText.style.display = 'block';
    }
    speechEl.classList.add('visible');
    renderActions(actions || []);
  }

  function hideSpeech() {
    if (speechEl) speechEl.classList.remove('visible');
    clearActions();
  }

  // ── ACTION CHIPS ──────────────────────────────────────────
  // Render into the floating bar above the input (the in-speech-bubble
  // location is gone now that the speech card is hidden).
  function clearActions() {
    const bar = document.getElementById('agentActionsFloating');
    if (bar) bar.innerHTML = '';
    const old = document.getElementById('agentActions');
    if (old) old.remove();
  }

  function renderActions(actions) {
    clearActions();
    if (!actions || !actions.length) return;
    const wrap = document.createElement('div');
    wrap.id = 'agentActions';
    wrap.className = 'agent-actions';
    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'agent-action-chip';
      btn.innerHTML = `${actionIcon(action.type)}<span>${escapeHtml(action.label)}</span>`;
      btn.addEventListener('click', () => executeAction(action));
      wrap.appendChild(btn);
    });
    // Prefer the floating bar above the input (speech bubble is hidden)
    const floatBar = document.getElementById('agentActionsFloating');
    if (floatBar) floatBar.appendChild(wrap);
    else if (speechEl) speechEl.appendChild(wrap);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function actionIcon(type) {
    const icons = {
      contact:  '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M2 4l6 4.5L14 4"/></svg>',
      whatsapp: '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M11.6 9.6c-.2-.1-1.2-.6-1.4-.6-.2-.1-.3-.1-.4.1-.1.2-.5.6-.6.7-.1.1-.2.2-.4.1-.2-.1-.8-.3-1.6-1-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.4.1-.1.1-.2.2-.3 0-.1 0-.2-.05-.4-.05-.1-.4-1.1-.6-1.5-.15-.4-.3-.3-.4-.3h-.4c-.1 0-.3 0-.5.2-.2.2-.6.6-.6 1.5s.6 1.7.7 1.9c.1.1 1.3 2 3.1 2.7.5.2.8.3 1 .4.4.1.8.1 1.1.1.3-.1 1-.4 1.2-.8.1-.4.1-.8.1-.8-.05-.1-.2-.15-.4-.25zM8 14a6 6 0 0 1-3.1-.9L2 14l.9-2.9A6 6 0 1 1 8 14z"/></svg>',
      navigate: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
      external: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3h2v2M13 3l-6 6M8 3H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8"/></svg>',
      call:     '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2.5h2l1.5 3-2 1c.8 1.7 2.3 3.2 4 4l1-2 3.5 1.5v2c0 .8-.7 1.5-1.5 1.5C6.4 13.5 2 9 2 3.5 2 2.7 2.7 2 3 2z"/></svg>',
    };
    return icons[type] || '';
  }

  function executeAction(action) {
    if (!action || !action.type) return;
    switch (action.type) {
      case 'contact': {
        const params = new URLSearchParams();
        if (action.service) params.set('service', action.service);
        if (action.message) params.set('msg', action.message);
        const url = '/contact' + (params.toString() ? ('?' + params.toString()) : '');
        window.location.href = url;
        break;
      }
      case 'whatsapp': {
        const phone = '6281805807807';
        const text = action.message ? '?text=' + encodeURIComponent(action.message) : '';
        window.open(`https://wa.me/${phone}${text}`, '_blank', 'noopener');
        break;
      }
      case 'navigate': {
        if (action.url && action.url.startsWith('/')) {
          window.location.href = action.url;
        }
        break;
      }
      case 'external': {
        if (action.url && action.url.startsWith('https://')) {
          window.open(action.url, '_blank', 'noopener');
        }
        break;
      }
      case 'call': {
        window.location.href = 'tel:+6281805807807';
        break;
      }
    }
  }

  // ── BROWSER TTS (Jarvis response speak via Speech Synthesis) ──
  // SpeechSynthesis doesn't expose audio stream, so we simulate audio
  // amplitude oscillation while utterance is active → particles still react.
  // Voice selection prefers a male voice for the Jarvis persona.

  // Male voice name hints (case-insensitive). Includes localized male names
  // for Indonesian voices on Android/Chrome and macOS/iOS.
  const MALE_VOICE_HINTS = [
    'male','man',
    // English
    'david','daniel','alex','fred','thomas','aaron','arthur','oliver',
    'mark','michael','george','james','rishi','reed','ralph','rocko',
    'eddy','grandpa','gordon','jamie','tom','john','jacob','ryan',
    // Indonesian
    'ardi','andika','reza','rian','agus','budi','wahyu','damayanto',
    // Generic
    'baritone','bass'
  ];
  const FEMALE_VOICE_HINTS = [
    'female','woman',
    'samantha','victoria','karen','moira','tessa','fiona','amelie',
    'siri female','susan','allison','ava','zoe','google.*female',
    // Indonesian
    'damayanti','siti','ayu','dewi'
  ];

  function pickJarvisVoice(targetLang) {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    const langPrefix = targetLang.toLowerCase().split('-')[0]; // 'en' / 'id'
    const langMatch  = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
    const pool = langMatch.length ? langMatch : voices;

    function isMale(v) {
      const n = (v.name || '').toLowerCase();
      // Reject obvious female names first
      if (FEMALE_VOICE_HINTS.some(h => n.includes(h))) return false;
      return MALE_VOICE_HINTS.some(h => n.includes(h));
    }
    function isLikelyFemale(v) {
      const n = (v.name || '').toLowerCase();
      return FEMALE_VOICE_HINTS.some(h => n.includes(h));
    }

    // 1. Exact lang match + explicitly male name
    let pick = pool.find(isMale);
    if (pick) return pick;

    // 2. Exact lang match + not explicitly female (could be neutral)
    pick = pool.find(v => !isLikelyFemale(v));
    if (pick) return pick;

    // 3. Any male voice (cross-lang fallback)
    pick = voices.find(isMale);
    if (pick) return pick;

    // 4. Any matching-lang voice
    return langMatch[0] || voices[0] || null;
  }

  // Expand common acronyms so TTS pronounces them correctly.
  // "IT" gets read as the pronoun "it" — replace with full words.
  // Brand names (watsonx.ai, QRadar, IBM Z, IDE Asia) stay intact.
  function expandAcronymsForTTS(text) {
    if (!text) return '';
    return text
      // " IT " / "IT." / "IT," / start-of-sentence "IT" → Information Technology
      .replace(/(^|[\s(])IT(?=[\s.,;:!?)/-]|$)/g, '$1Information Technology');
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    text = expandAcronymsForTTS(text);
    const u = new SpeechSynthesisUtterance(text);
    const targetLang = lang === 'id' ? 'id-ID' : 'en-US';
    u.lang = targetLang;
    // Lower pitch + slightly slower rate → more masculine, more "consultant" timbre
    u.rate   = 0.95;
    u.pitch  = 0.85;
    u.volume = 1;

    const v = pickJarvisVoice(targetLang);
    if (v) {
      u.voice = v;
      // CRITICAL: Chrome will SILENTLY IGNORE u.voice if v.lang doesn't
      // match u.lang and fall back to the default voice for u.lang
      // (which on macOS is "Damayanti" — female — for id-ID).
      // We force u.lang to match the picked voice so the male voice is
      // actually used. Trade-off: if we pick Daniel (en-GB) for an
      // Indonesian user (no native male voice exists), the text will be
      // pronounced with an English accent — but at least it's MALE.
      u.lang = v.lang;
      const langMismatch = v.lang.toLowerCase().split('-')[0] !== targetLang.toLowerCase().split('-')[0];
      console.log('[agent] using voice:', v.name, v.lang, langMismatch ? '(cross-lang male fallback)' : '');
    } else {
      console.warn('[agent] no voice picked — using browser default for', targetLang);
    }

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
        body: JSON.stringify({ message: text, history, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        showSpeech(`<p>${data.error || 'Something went wrong.'}</p>`);
      } else {
        showSpeech(formatResponse(data.reply), data.actions);
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

  // Mobile browsers (iOS Safari, Android Chrome) BLOCK SpeechSynthesis
  // until a user gesture has happened on the page. We queue the welcome
  // intro and speak it on first tap. Desktop can speak immediately.
  let pendingIntro = null;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

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

        // Welcome voice — TTS instead of pre-recorded mp3s (those still say "Carolla")
        const fromInternal = document.referrer && document.referrer.includes(window.location.hostname);
        if (!fromInternal) {
          const introText = lang === 'id'
            ? 'Halo! Saya Jarvis, asisten digital Anda dari IDE Asia. Selamat datang. Katakan apa yang bisa saya bantu hari ini.'
            : 'Hello! I am Jarvis, your digital consultant from IDE Asia. Welcome. Tell me how I can help you today.';

          if (isMobile) {
            // Queue — will play on first tap (see resumeAudioOnGesture)
            pendingIntro = introText;
            showTapHint();
          } else {
            speak(introText);
          }
        }
      }, 300);
    }, 600);
  }

  // Floating "tap to enable voice" hint for mobile users
  function showTapHint() {
    if (document.getElementById('agentTapHint')) return;
    const hint = document.createElement('div');
    hint.id = 'agentTapHint';
    hint.className = 'agent-tap-hint';
    hint.textContent = lang === 'id'
      ? 'Ketuk layar untuk mengaktifkan suara'
      : 'Tap the screen to enable voice';
    document.body.appendChild(hint);
    setTimeout(() => hint.classList.add('visible'), 50);
  }
  function hideTapHint() {
    const hint = document.getElementById('agentTapHint');
    if (hint) {
      hint.classList.remove('visible');
      setTimeout(() => hint.remove(), 350);
    }
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

  // Eagerly load voices — Chrome populates them asynchronously, so getVoices()
  // returns [] on first call until 'voiceschanged' fires.
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices(); // trigger
    if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        // After voices arrive, log selected one so it's easy to debug
        const v = pickJarvisVoice(lang === 'id' ? 'id-ID' : 'en-US');
        if (v) console.log('[agent] voices loaded — Jarvis voice:', v.name);
      });
    }
  }

  // First user gesture → resume AudioContext + prime SpeechSynthesis.
  // iOS Safari and Android Chrome BLOCK SpeechSynthesis until a gesture
  // happens AND requires the speak() call to fire synchronously from
  // within the gesture handler.
  let primed = false;
  function resumeAudioOnGesture() {
    ensureAudioCtx(); // creates + resumes

    if (!primed && window.speechSynthesis) {
      primed = true;

      // Prime trick: speak an empty utterance synchronously from gesture.
      // This "unlocks" SpeechSynthesis for the rest of the page lifetime.
      try {
        const priming = new SpeechSynthesisUtterance(' ');
        priming.volume = 0;
        priming.rate = 1;
        window.speechSynthesis.speak(priming);
      } catch (e) { /* noop */ }

      // Then immediately play the queued welcome intro (if any).
      // Must happen in the same gesture tick for iOS.
      if (pendingIntro) {
        const text = pendingIntro;
        pendingIntro = null;
        hideTapHint();
        // Small delay so the priming finishes; still inside gesture window
        setTimeout(() => speak(text), 30);
      }
    }

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
