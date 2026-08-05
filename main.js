// Raj Telecom — shared interactions

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Dark / light mode toggle ----
     Theme is applied pre-paint by an inline script in <head> (reads the
     same localStorage key) so there's no flash on load; this just wires
     up the button to flip it afterwards. */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        try { localStorage.setItem('rt-theme', 'light'); } catch (e) {}
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('rt-theme', 'dark'); } catch (e) {}
      }
    });
  }

  /* ---- Mobile nav toggle (fullscreen overlay) ---- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const navClose = document.getElementById('navClose');
  if (toggle && links) {
    function closeMenu() {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }
    function openMenu() {
      links.classList.add('open');
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('nav-open');
    }

    toggle.addEventListener('click', () => {
      links.classList.contains('open') ? closeMenu() : openMenu();
    });

    if (navClose) navClose.addEventListener('click', closeMenu);

    links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    document.addEventListener('click', (e) => {
      if (links.classList.contains('open') && !links.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('open')) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  /* ---- Signature hero ticket: cycles through repair stages ---- */
  const pill = document.querySelector('[data-ticket-status]');
  const fill = document.querySelector('[data-ticket-fill]');
  const labels = document.querySelectorAll('[data-ticket-label]');
  const stamp = document.querySelector('[data-ticket-stamp]');

  if (pill && fill) {
    const stages = [
      { key: 'diagnosing', text: 'Diagnosing', width: '18%', cls: '' },
      { key: 'repairing',  text: 'Repairing',  width: '58%', cls: 'state-repairing' },
      { key: 'ready',      text: 'Ready for pickup', width: '100%', cls: 'state-ready' },
    ];
    let i = 0;

    function applyStage(stage) {
      pill.classList.remove('state-repairing', 'state-ready');
      fill.classList.remove('state-repairing', 'state-ready');
      if (stage.cls) { pill.classList.add(stage.cls); fill.classList.add(stage.cls); }
      pill.querySelector('[data-status-text]').textContent = stage.text;
      fill.style.width = stage.width;
      labels.forEach(l => l.classList.toggle('active', l.dataset.ticketLabel === stage.key));
      if (stamp) stamp.classList.toggle('show', stage.key === 'ready');
    }

    applyStage(stages[0]);

    // Note: this is a state/text change (ticket status), not motion in the
    // vestibular sense, so it runs regardless of prefers-reduced-motion —
    // only the cursor-tilt effect below respects that setting.
    setInterval(() => {
      i = (i + 1) % stages.length;
      applyStage(stages[i]);
    }, 3200);
  }

  /* ---- Hero ticket: subtle cursor tilt, like picking up a physical card ---- */
  const heroTicket = document.querySelector('.hero .ticket');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroTicket && canHover && !prefersReducedMotion) {
    const maxTilt = 6;
    heroTicket.addEventListener('mousemove', (e) => {
      const rect = heroTicket.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotY = (px - 0.5) * maxTilt * 2;
      const rotX = (0.5 - py) * maxTilt * 2;
      heroTicket.classList.add('tilting');
      heroTicket.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
    heroTicket.addEventListener('mouseleave', () => {
      heroTicket.classList.remove('tilting');
      heroTicket.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  }

  /* ---- Nav: solid glass once scrolled past 50px ---- */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Animated count-up for stat numbers ---- */
  const statEls = document.querySelectorAll('.stat-cell strong');
  if ('IntersectionObserver' in window && statEls.length) {
    const prefersReducedCounters = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        countIO.unobserve(el);
        const raw = el.textContent.trim();
        const match = raw.match(/^([\d.]+)(.*)$/);
        if (!match || prefersReducedCounters) return;
        const end = parseFloat(match[1]);
        const suffix = match[2];
        const isDecimal = match[1].includes('.');
        const duration = 900;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = end * eased;
          el.textContent = (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = raw;
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    statEls.forEach(el => countIO.observe(el));
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---- Contact form (static placeholder — Phase 2 wires this to real submission) ---- */
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const note = form.querySelector('.form-status');
      btn.textContent = 'Sending…';
      setTimeout(() => {
        btn.textContent = 'Message sent ✓';
        if (note) note.textContent = "This is a design preview — once we connect the backend, this will notify the shop instantly on WhatsApp.";
        form.reset();
        setTimeout(() => { btn.textContent = 'Send message'; }, 2600);
      }, 700);
    });
  }
});