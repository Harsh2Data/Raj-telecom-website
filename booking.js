// Raj Telecom — booking wizard (Phase 1: fully static, client-side only)

document.addEventListener('DOMContentLoaded', () => {
  const wizard = document.getElementById('wizardSteps');
  if (!wizard) return; // not on the booking page

  /* ---- Data: brands, models, problems ---- */
  const BRANDS = [
    { key: 'Apple', logo: 'apple', fallback: 'A' },
    { key: 'Samsung', logo: 'samsung', fallback: 'S' },
    { key: 'OnePlus', logo: 'oneplus', fallback: 'O+' },
    { key: 'Xiaomi', logo: 'xiaomi', fallback: 'Mi' },
    { key: 'Realme', logo: 'realme', fallback: 'R' },
    { key: 'Oppo', logo: 'oppo', fallback: 'O' },
    { key: 'Vivo', logo: 'vivo', fallback: 'V' },
    { key: 'Google Pixel', logo: 'google-pixel', fallback: 'G' },
    { key: 'Motorola', logo: 'motorola', fallback: 'M' },
    { key: 'Nokia', logo: 'nokia', fallback: 'N' },
    { key: 'Asus', logo: 'asus', fallback: 'A' },
    { key: 'Honor', logo: 'honor', fallback: 'H' },
    { key: 'iQOO', logo: 'iqoo', fallback: 'iQ' },
  ];

  const MODELS = {
    'Apple': ['iPhone 15 series', 'iPhone 14 series', 'iPhone 13 series', 'iPhone 12 series', 'iPhone SE', 'iPad'],
    'Samsung': ['Galaxy S24 series', 'Galaxy S23 series', 'Galaxy A series', 'Galaxy Note series', 'Galaxy Tab'],
    'OnePlus': ['OnePlus 12 / 11', 'OnePlus 10 series', 'OnePlus Nord series'],
    'Xiaomi': ['Redmi Note series', 'Redmi series', 'Mi series', 'POCO series'],
    'Realme': ['Realme Number series', 'Realme Narzo series', 'Realme C series'],
    'Oppo': ['Oppo Reno series', 'Oppo A/F series'],
    'Vivo': ['Vivo V series', 'Vivo Y series', 'Vivo T series'],
    'Google Pixel': ['Pixel 8 series', 'Pixel 7 series', 'Pixel 6 series', 'Pixel Fold'],
    'Motorola': ['Moto G series', 'Moto Edge series', 'Razr series'],
    'Nokia': ['Nokia G series', 'Nokia C series', 'Nokia X series'],
    'Asus': ['ROG Phone series', 'Zenfone series'],
    'Honor': ['Honor Number series', 'Honor Magic series'],
    'iQOO': ['iQOO Number series', 'iQOO Neo series', 'iQOO Z series'],
  };

  const PROBLEMS = [
    'Broken Display', 'Touch', 'Charging', 'Water Damage',
    'Lost Data', 'Sound', 'Charging Jack', 'Sensor',
    'Broken Panel', 'Aux Jack', 'Camera', 'Mic',
  ];

  const state = {
    brand: '', model: '', problem: '',
    name: '', phone: '',
    service: '', serviceLabel: '', address: '',
    slot: ''
  };

  const panels = {};
  document.querySelectorAll('[data-panel]').forEach(p => panels[p.dataset.panel] = p);
  const stepEls = wizard.querySelectorAll('.wizard-step');
  const GROUP = { brand: 1, model: 1, problem: 2, details: 3, service: 4, slot: 4, confirm: 5, success: 5 };

  function goTo(name) {
    Object.values(panels).forEach(p => p.hidden = true);
    panels[name].hidden = false;
    const g = GROUP[name];
    stepEls.forEach(el => {
      const n = Number(el.dataset.group);
      el.classList.remove('active', 'done');
      if (n < g) el.classList.add('done');
      if (n === g) el.classList.add('active');
    });
    panels[name].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /* ================= PANEL: brand ================= */
  const brandGrid = document.getElementById('brandGrid');
  BRANDS.forEach(b => {
    const el = document.createElement('div');
    el.className = 'brand-block';
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.innerHTML = `<span class="brand-logo"><img src="assets/brands/${b.logo}.svg" alt="${b.key}" onerror="this.parentElement.innerHTML='${b.fallback}'"></span><span class="brand-name">${b.key}</span>`;
    el.addEventListener('click', () => selectBrand(b.key));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectBrand(b.key); } });
    brandGrid.appendChild(el);
  });
  const moreBrandsEl = document.createElement('a');
  moreBrandsEl.className = 'brand-block more-brands';
  moreBrandsEl.href = 'javascript:void(0)';
  moreBrandsEl.innerHTML = '<span class="brand-logo">+</span><span class="brand-name">More Brands</span>';
  moreBrandsEl.addEventListener('click', () => selectBrand('other'));
  brandGrid.appendChild(moreBrandsEl);

  function selectBrand(brandKey) {
    state.brand = brandKey;
    renderBrandChip();
    renderModelPanel();
    goTo('model');
  }

  function renderBrandChip() {
    const chip = document.getElementById('brandChip');
    const label = state.brand === 'other' ? 'Brand: Not listed' : `Brand: ${state.brand}`;
    chip.innerHTML = `<span>${escapeHtml(label)}</span><button type="button" id="changeBrandBtn">Change</button>`;
    document.getElementById('changeBrandBtn').addEventListener('click', () => goTo('brand'));
  }

  /* ================= PANEL: model ================= */
  const modelList = document.getElementById('modelList');
  const fieldModelOther = document.getElementById('field-model-other');
  const modelOtherInput = document.getElementById('b-model-other');
  const modelActions = document.getElementById('modelActions');
  const modelSub = document.getElementById('modelSub');

  function renderModelPanel() {
    modelList.innerHTML = '';
    fieldModelOther.hidden = true;
    modelActions.hidden = true;
    modelOtherInput.value = '';

    if (state.brand === 'other') {
      modelSub.textContent = "No problem — just tell us your phone's brand and model.";
      fieldModelOther.hidden = false;
      fieldModelOther.querySelector('label').textContent = 'Your phone brand & model';
      modelOtherInput.placeholder = 'e.g. Lava Blaze 2, Infinix Note 30';
      modelActions.hidden = false;
      return;
    }

    modelSub.textContent = "Choose the closest match — exact variant doesn't matter yet.";
    const list = MODELS[state.brand] || [];
    list.forEach(m => {
      const row = document.createElement('div');
      row.className = 'model-row';
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.innerHTML = `<span>${escapeHtml(m)}</span><span class="arrow">→</span>`;
      row.addEventListener('click', () => {
        state.model = m;
        goTo('problem');
      });
      row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); } });
      modelList.appendChild(row);
    });

    const otherRow = document.createElement('div');
    otherRow.className = 'model-row';
    otherRow.tabIndex = 0;
    otherRow.setAttribute('role', 'button');
    otherRow.innerHTML = `<span>Other / not listed</span><span class="arrow">→</span>`;
    otherRow.addEventListener('click', () => {
      fieldModelOther.hidden = false;
      fieldModelOther.querySelector('label').textContent = 'Your phone model';
      modelOtherInput.placeholder = 'e.g. Galaxy F14, Redmi 12';
      modelActions.hidden = false;
      modelOtherInput.focus();
    });
    otherRow.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); otherRow.click(); } });
    modelList.appendChild(otherRow);
  }

  document.getElementById('modelContinueBtn').addEventListener('click', () => {
    const val = modelOtherInput.value.trim();
    if (!val) { modelOtherInput.focus(); return; }
    state.model = val;
    goTo('problem');
  });

  /* ================= PANEL: problem ================= */
  const problemGrid = document.getElementById('problemGrid');
  const fieldProblemOther = document.getElementById('field-problem-other');
  const problemOtherInput = document.getElementById('b-problem-other');
  const problemActions = document.getElementById('problemActions');

  PROBLEMS.forEach(p => {
    const el = document.createElement('div');
    el.className = 'choice-block';
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.innerHTML = `<h3>${p}</h3>`;
    el.addEventListener('click', () => {
      state.problem = p;
      goTo('details');
    });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } });
    problemGrid.appendChild(el);
  });
  const otherProblemEl = document.createElement('div');
  otherProblemEl.className = 'choice-block other-block';
  otherProblemEl.tabIndex = 0;
  otherProblemEl.setAttribute('role', 'button');
  otherProblemEl.innerHTML = '<h3>Something else</h3>';
  otherProblemEl.addEventListener('click', () => {
    fieldProblemOther.hidden = false;
    problemActions.hidden = false;
    problemOtherInput.focus();
  });
  otherProblemEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); otherProblemEl.click(); } });
  problemGrid.appendChild(otherProblemEl);

  document.getElementById('problemContinueBtn').addEventListener('click', () => {
    const val = problemOtherInput.value.trim();
    if (!val) { problemOtherInput.focus(); return; }
    state.problem = val;
    goTo('details');
  });

  /* ================= PANEL: details ================= */
  const detailsForm = document.getElementById('panel-details');
  detailsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('b-name');
    const phoneEl = document.getElementById('b-phone');
    let valid = true;

    if (!nameEl.value.trim()) {
      document.getElementById('field-name').classList.add('invalid');
      valid = false;
    } else {
      document.getElementById('field-name').classList.remove('invalid');
    }

    const phoneDigits = phoneEl.value.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      document.getElementById('field-phone').classList.add('invalid');
      valid = false;
    } else {
      document.getElementById('field-phone').classList.remove('invalid');
    }

    if (!valid) return;

    state.name = nameEl.value.trim();
    state.phone = phoneEl.value.trim();
    goTo('service');
  });

  /* ================= PANEL: service ================= */
  const optionCards = document.querySelectorAll('#panel-service .option-card');
  const addressField = document.getElementById('field-address');
  const serviceContinueBtn = document.getElementById('serviceContinueBtn');

  optionCards.forEach(card => {
    const select = () => {
      optionCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.service = card.dataset.value;
      state.serviceLabel = card.querySelector('h3').textContent;

      if (state.service === 'visit') {
        addressField.hidden = true;
        serviceContinueBtn.hidden = true;
        goTo('slot');
      } else {
        addressField.hidden = false;
        serviceContinueBtn.hidden = false;
      }
    };
    card.addEventListener('click', select);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
  });

  serviceContinueBtn.addEventListener('click', () => {
    state.address = document.getElementById('b-address').value.trim();
    goTo('slot');
  });

  /* ================= PANEL: slot ================= */
  const slotChips = document.querySelectorAll('#panel-slot .slot-chip');
  slotChips.forEach(chip => {
    chip.addEventListener('click', () => {
      slotChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      state.slot = chip.dataset.value;
      buildSummary('summaryList');
      goTo('confirm');
    });
  });

  /* ================= PANEL: confirm / success ================= */
  function buildSummary(targetId) {
    const el = document.getElementById(targetId);
    const rows = [
      ['Brand', state.brand === 'other' ? 'Not listed' : state.brand],
      ['Model', state.model],
      ['Problem', state.problem],
      ['Name', state.name],
      ['Phone', state.phone],
      ['Service', state.serviceLabel],
    ];
    if (state.service !== 'visit' && state.address) rows.push(['Address', state.address]);
    rows.push(['Slot', state.slot]);

    el.innerHTML = rows.map(([label, value]) => `
      <div class="summary-row"><span>${label}</span><span>${escapeHtml(value)}</span></div>
    `).join('');
  }

  document.getElementById('confirmBtn').addEventListener('click', () => {
    const ticketNum = 'RT-' + (1000 + Math.floor(Math.random() * 9000));
    document.getElementById('ticketNum').textContent = '#' + ticketNum;
    document.getElementById('ticketTime').textContent =
      'Booked ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
      ', ' + new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    buildSummary('ticketSummary');
    goTo('success');
    const stamp = document.querySelector('#panel-success [data-ticket-stamp]');
    if (stamp) {
      stamp.classList.remove('show');
      setTimeout(() => stamp.classList.add('show'), 450);
    }
  });

  /* ================= Back buttons ================= */
  document.querySelectorAll('[data-back-to]').forEach(btn => {
    btn.addEventListener('click', () => goTo(btn.dataset.backTo));
  });

  /* ================= Restart ================= */
  document.getElementById('restartBtn').addEventListener('click', () => {
    detailsForm.reset();
    document.getElementById('b-address').value = '';
    optionCards.forEach(c => c.classList.remove('selected'));
    slotChips.forEach(c => c.classList.remove('selected'));
    addressField.hidden = true;
    serviceContinueBtn.hidden = true;
    Object.keys(state).forEach(k => state[k] = '');
    goTo('brand');
  });

  /* ================= Entry point: read ?brand= from URL ================= */
  const params = new URLSearchParams(window.location.search);
  const brandParam = params.get('brand');

  if (brandParam) {
    state.brand = brandParam;
    renderBrandChip();
    renderModelPanel();
    goTo('model');
  } else {
    goTo('brand');
  }
});
