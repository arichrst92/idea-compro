(function() {
  'use strict';

  // Custom cursor
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  const follower = document.createElement('div');
  follower.className = 'cursor-follower';
  document.body.appendChild(cursor);
  document.body.appendChild(follower);

  let mx = -100, my = -100, fx = -100, fy = -100;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function animateCursor() {
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    fx += (mx - fx) * 0.12; fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px'; follower.style.top = fy + 'px';
    requestAnimationFrame(animateCursor);
  })();
  document.querySelectorAll('a, button, .service-card, .blog-card, .why-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); follower.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
  });

  // Navbar scroll
  const navbar = document.getElementById('navbar');
  if (navbar) window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 20));

  // Mobile menu
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      const open = navLinks.classList.contains('open');
      if (spans[0]) spans[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
      if (spans[1]) spans[1].style.opacity = open ? '0' : '';
      if (spans[2]) spans[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });
  }

  // Services carousel
  const carousel = document.getElementById('servicesCarousel');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const progressItems = document.querySelectorAll('.carousel-progress-item');
  if (carousel) {
    let current = 0;
    const total = carousel.children.length;
    function goTo(index) {
      current = ((index % total) + total) % total;
      carousel.scrollTo({ left: current * carousel.offsetWidth, behavior: 'smooth' });
      progressItems.forEach((p, i) => p.classList.toggle('active', i === current));
    }
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
    let st;
    carousel.addEventListener('scroll', () => {
      clearTimeout(st);
      st = setTimeout(() => {
        const n = Math.round(carousel.scrollLeft / carousel.offsetWidth);
        if (n !== current) { current = n; progressItems.forEach((p,i) => p.classList.toggle('active', i===current)); }
      }, 80);
    });
    // Touch
    let tx = 0;
    carousel.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
    carousel.addEventListener('touchend', e => { const d = tx - e.changedTouches[0].clientX; if (Math.abs(d) > 50) goTo(d > 0 ? current+1 : current-1); });
    // Auto-play
    let auto = setInterval(() => goTo(current+1), 6000);
    carousel.addEventListener('mouseenter', () => clearInterval(auto));
    carousel.addEventListener('mouseleave', () => { auto = setInterval(() => goTo(current+1), 6000); });
    // Keyboard
    document.addEventListener('keydown', e => {
      const s = document.getElementById('services');
      if (s) { const r = s.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) { if (e.key==='ArrowLeft') goTo(current-1); if (e.key==='ArrowRight') goTo(current+1); } }
    });
  }

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(el => obs.observe(el));
  } else { reveals.forEach(el => el.classList.add('visible')); }

  // Ticker duplicate for seamless loop
  const track = document.querySelector('.ticker-track');
  if (track) { track.innerHTML += track.innerHTML; }

  // Blog lang toggle
  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-toggle button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.dataset.lang;
      document.querySelectorAll('.content-en').forEach(el => el.style.display = lang==='en' ? '' : 'none');
      document.querySelectorAll('.content-id').forEach(el => el.style.display = lang==='id' ? '' : 'none');
    });
  });

  // Counter animation for stats
  function animateCount(el, target, duration) {
    let start = 0, step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start) + (el.dataset.suffix || '');
      if (start >= target) clearInterval(timer);
    }, 16);
  }
  // Animate both the legacy 5-stat strip (.stat-num) and the refined
  // 3-mega-stat layout (.proof-num) on the home page.
  const statNums = document.querySelectorAll('.stat-num[data-count], .proof-num[data-count]');
  if (statNums.length && 'IntersectionObserver' in window) {
    const obs2 = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target, parseInt(e.target.dataset.count), 1200);
          obs2.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => obs2.observe(el));
  }

  // Hero entrance
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0'; heroContent.style.transform = 'translateY(24px)';
    setTimeout(() => {
      heroContent.style.transition = 'opacity 0.9s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)';
      heroContent.style.opacity = '1'; heroContent.style.transform = 'translateY(0)';
    }, 80);
  }
})();

// =============================================
// HERO CANVAS - Network Animation
// =============================================
// Tech logo fallback — when simpleicons CDN 404s (brand-removed),
// swap img for a monogram badge built from data-fallback or alt text.
// =============================================
(function techLogoFallback() {
  document.querySelectorAll('.tech-chip-logo, .capability-logos img').forEach(img => {
    img.addEventListener('error', function handleErr() {
      const chip = this.closest('.tech-chip');
      const monogram = this.dataset.fallback
        || (this.alt || '').replace(/[^A-Za-z0-9]/g, '').substring(0, 2).toUpperCase()
        || '✓';
      if (chip) {
        const badge = document.createElement('span');
        badge.className = 'tech-chip-badge';
        badge.textContent = monogram;
        this.replaceWith(badge);
      } else {
        // Home highlight logos — replace with simple text badge
        const badge = document.createElement('span');
        badge.className = 'capability-logo-fallback';
        badge.textContent = monogram;
        this.replaceWith(badge);
      }
    }, { once: true });
  });
})();

// =============================================
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    nodes = [];
    const count = Math.min(Math.floor((W * H) / 10000), 80);
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 1.8 + 0.5,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const maxDist = 150;

    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy; n.pulse += 0.025;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // Lines between nearby nodes — light blue tint, visible on white bg
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(26, 80, 232,' + alpha + ')';
          ctx.lineWidth = 0.6;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Nodes — mostly dark ink with occasional blue accent, visible on white
    nodes.forEach((n, idx) => {
      const p = Math.sin(n.pulse) * 0.5 + 0.5;
      const isBlueNode = idx % 6 === 0; // ~17% blue accent nodes
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + p, 0, Math.PI * 2);
      ctx.fillStyle = isBlueNode
        ? 'rgba(26, 80, 232,' + (0.6 + p * 0.35) + ')'
        : 'rgba(10, 15, 28,' + (0.5 + p * 0.35) + ')';
      ctx.fill();
      if (n.r > 1.2) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4 + p * 3, 0, Math.PI * 2);
        ctx.strokeStyle = isBlueNode
          ? 'rgba(26, 80, 232,' + (0.08 + p * 0.08) + ')'
          : 'rgba(10, 15, 28,' + (0.06 + p * 0.06) + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });

    // Subtle scan lines in blue — adds movement without being noisy
    const t = Date.now() * 0.0005;
    [0.7, 1.3, 1.9].forEach((speed, i) => {
      const y = (t * 60 * speed) % (H + 20) - 10;
      const g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, 'rgba(26,80,232,0)');
      g.addColorStop(0.3 + i * 0.1, 'rgba(26,80,232,0.08)');
      g.addColorStop(0.7 - i * 0.1, 'rgba(26,80,232,0.12)');
      g.addColorStop(1, 'rgba(26,80,232,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, y, W, 1.5);
    });

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
})();
