/* =========================================
   استوديو اقرأ — تفاعلات وحركة
   الملف سهل التعديل: غيّر القيم بحرية
   ========================================= */

(() => {
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== القائمة للموبايل =====
  const menuBtn = $('#menuBtn');
  const navLinks = $('#navLinks');
  menuBtn?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  // ===== نافبار عند السكرول =====
  const nav = $('#nav');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.style.background = y > 40 ? 'rgba(7,14,26,.88)' : 'rgba(7,14,26,.62)';
    nav.style.boxShadow = y > 40 ? '0 14px 44px rgba(0,0,0,.35)' : '0 10px 40px rgba(0,0,0,.28)';
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== ظهور العناصر عند السكرول =====
  const revealEls = $$('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));

  // ===== عدادات =====
  const counters = $$('[data-count]');
  const countIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      countIo.unobserve(el);
      const target = parseFloat(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const isFloat = String(target).includes('.');
      if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
      const dur = 1600;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val = target * ease;
        el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + target + suffix;
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countIo.observe(c));

  // ===== ميلان البطاقات =====
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    $$('.tilt').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  // ===== جسيمات الخلفية =====
  const canvas = $('#particles');
  const ctx = canvas?.getContext('2d');
  if (canvas && ctx && !reduceMotion) {
    let w, h, dpr, particles, raf;
    const mouse = { x: -9999, y: -9999 };
    const COUNT = Math.min(72, Math.floor(window.innerWidth / 18));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const init = () => {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        r: Math.random() * 2.2 + 0.8,
        a: Math.random() * .45 + .15
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;

        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) { p.x -= dx * .003; p.y -= dy * .003; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(94,234,212,${p.a})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const ddx = p.x - q.x, ddy = p.y - q.y;
          const d = ddx * ddx + ddy * ddy;
          if (d < 140 * 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(159,247,232,${0.10 * (1 - d / (140 * 140))})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener('resize', () => { resize(); init(); });
    resize(); init(); draw();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }

  // ===== تفعيل رابط النافبار حسب القسم =====
  const sections = $$('section[id]');
  const navAs = $$('#navLinks a[href^="#"]');
  const secIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(s => secIo.observe(s));


  // ===== نافذة القراء =====
  const readersBtn = $('#readersBtn');
  const readersModal = $('#readersModal');
  const readersClose = $('#readersClose');
  const readersBackdrop = $('#readersBackdrop');
  const openReaders = () => { readersModal.classList.add('open'); readersModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; };
  const closeReaders = () => { readersModal.classList.remove('open'); readersModal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };
  readersBtn?.addEventListener('click', openReaders);
  readersClose?.addEventListener('click', closeReaders);
  readersBackdrop?.addEventListener('click', closeReaders);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && readersModal?.classList.contains('open')) closeReaders(); });

  // ===== Ripple للأزرار =====
  $$('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.width = r.style.height = size + 'px';
      r.style.left = (e.clientX - rect.left - size/2) + 'px';
      r.style.top = (e.clientY - rect.top - size/2) + 'px';
      this.appendChild(r);
      r.addEventListener('animationend', () => r.remove());
    });
  });

})();
