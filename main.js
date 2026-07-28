// Raj Telecom — shared interactions

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile nav toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
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
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    if (!prefersReduced) {
      setInterval(() => {
        i = (i + 1) % stages.length;
        applyStage(stages[i]);
      }, 3200);
    }
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