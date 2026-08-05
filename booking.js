// Raj Telecom — booking wizard (Phase 1: fully static, client-side only)

document.addEventListener('DOMContentLoaded', () => {
  const wizard = document.getElementById('wizardSteps');
  if (!wizard) return; // not on the booking page

  /* ---- Data: brands, models, problems ---- */
  const BRANDS = [
    { key: 'Apple', logo: 'iphone', fallback: 'A' },
    { key: 'Samsung', logo: 'samsung', fallback: 'S' },
    { key: 'OnePlus', logo: 'oneplus', fallback: 'O+' },
    { key: 'Xiaomi', logo: 'xiaomi', fallback: 'Mi' },
    { key: 'Redmi', logo: 'redmi', fallback: 'R' },
    { key: 'Poco', logo: 'poco', fallback: 'P' },
    { key: 'Realme', logo: 'realme', fallback: 'R' },
    { key: 'Oppo', logo: 'oppo', fallback: 'O' },
    { key: 'Vivo', logo: 'vivo', fallback: 'V' },
    { key: 'Google Pixel', logo: 'gpixel', fallback: 'G' },
    { key: 'Motorola', logo: 'motorola', fallback: 'M' },
    { key: 'Nokia', logo: 'nokia', fallback: 'N' },
    { key: 'Asus', logo: 'asus', fallback: 'A' },
    { key: 'Honor', logo: 'Honor', fallback: 'H' },
    { key: 'iQOO', logo: 'iqoo', fallback: 'iQ' },
    { key: 'Huawei', logo: 'huawei', fallback: 'HW' },
    { key: 'Infinix', logo: 'infinix', fallback: 'I' },
    { key: 'Nothing', logo: 'nothing', fallback: 'N' },
    { key: 'Lava', logo: 'lava', fallback: 'L' },
    { key: 'Micromax', logo: 'micromax', fallback: 'M' },
    { key: 'Tecno', logo: 'tecno', fallback: 'T' },
    { key: 'LG', logo: 'lg', fallback: 'LG' },
  ];

  const MODELS = {
    'Apple': ['iPhone 15 series', 'iPhone 14 series', 'iPhone 13 series', 'iPhone 12 series', 'iPhone SE', 'iPad'],
    'Samsung': ['Galaxy S24 series', 'Galaxy S23 series', 'Galaxy A series', 'Galaxy Note series', 'Galaxy Tab'],
    'OnePlus': ['OnePlus 12 / 11', 'OnePlus 10 series', 'OnePlus Nord series'],
    'Xiaomi': ['Mi series', 'Xiaomi Number series', 'Xiaomi Civi series'],
    'Redmi': ['Redmi Note series', 'Redmi series', 'Redmi K series'],
    'Poco': ['POCO X series', 'POCO M series', 'POCO F series'],
    'Realme': ['Realme Number series', 'Realme Narzo series', 'Realme C series'],
    'Oppo': ['Oppo Reno series', 'Oppo A/F series'],
    'Vivo': ['Vivo V series', 'Vivo Y series', 'Vivo T series'],
    'Google Pixel': ['Pixel 8 series', 'Pixel 7 series', 'Pixel 6 series', 'Pixel Fold'],
    'Motorola': ['Moto G series', 'Moto Edge series', 'Razr series'],
    'Nokia': ['Nokia G series', 'Nokia C series', 'Nokia X series'],
    'Asus': ['ROG Phone series', 'Zenfone series'],
    'Honor': ['Honor Number series', 'Honor Magic series'],
    'iQOO': ['iQOO Number series', 'iQOO Neo series', 'iQOO Z series'],
    'Huawei': ['P series', 'Mate series', 'Nova series'],
    'Infinix': ['Note series', 'Hot series', 'Zero series'],
    'Nothing': ['Phone (1)', 'Phone (2)', 'Phone (2a)'],
    'Lava': ['Blaze series', 'Yuva series'],
    'Micromax': ['IN Note series', 'IN series'],
    'Tecno': ['Camon series', 'Spark series', 'Pova series'],
    'LG': ['LG G series', 'LG V series', 'LG Wing'],
  };

  /* Icon fallback for services with no matching photo yet — kept in the
     same stroke-SVG style used elsewhere on the site. */
  const ICONS = {
    unsure: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4"/><path d="M12 17h.01"/></svg>',
    network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5a11 11 0 0 1 14 0"/><path d="M8.5 16a6 6 0 0 1 7 0"/><path d="M12 19.5h.01"/></svg>',
    jack: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v7M12 15v7"/></svg>',
    power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/></svg>',
  };

  const SERVICES = [
    { key: 'Not Sure About The Issue', icon: ICONS.unsure },
    { key: 'Display Replacement', image: 'broken-display.png' },
    { key: 'Touch Glass Replacement', image: 'broken-display.png' },
    { key: 'Charging Port', image: 'phone-charging.png' },
    { key: 'Network Repair', icon: ICONS.network },
    { key: 'Back Glass Replacement', image: 'phone-back-panel.png' },
    { key: 'Back Panel Replacement', image: 'phone-back-panel.png' },
    { key: 'Microphone', image: 'phone-mic.png' },
    { key: 'Headphone Jack', icon: ICONS.jack },
    { key: 'Ringer', image: 'speaker-repair.png' },
    { key: 'Ear Speaker', image: 'speaker-repair.png' },
    { key: 'Front Camera', image: 'back-camera.png' },
    { key: 'Rear Camera', image: 'back-camera.png' },
    { key: 'Device not Switching on', icon: ICONS.power },
    { key: 'Auto Restart', image: 'phone-software.png' },
    { key: 'Bluetooth & Wifi', image: 'sensor.png' },
    { key: 'Battery', image: 'battery-replacement.png' },
    { key: 'Water Damage', image: 'water-damage.png' },
  ];

  const state = {
    brand: '', model: '', services: [],
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
    el.innerHTML = `<span class="brand-logo"><img src="assets/brands/${b.logo}.${b.ext || 'png'}" alt="${b.key}" onerror="this.parentElement.innerHTML='${b.fallback}'"></span><span class="brand-name">${b.key}</span>`;
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
        goTo(state.services.length ? 'details' : 'problem');
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
    goTo(state.services.length ? 'details' : 'problem');
  });

  /* ================= PANEL: service selection (multi-select) ================= */
  const serviceList = document.getElementById('serviceList');
  const serviceSearch = document.getElementById('serviceSearch');
  const serviceEmpty = document.getElementById('serviceEmpty');
  const serviceError = document.getElementById('serviceError');
  const serviceCount = document.getElementById('serviceCount');

  SERVICES.forEach(s => {
    const row = document.createElement('div');
    row.className = 'service-row';
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.dataset.name = s.key.toLowerCase();
    const iconHtml = s.image
      ? `<img src="assets/repairs/${s.image}" alt="">`
      : s.icon;
    row.innerHTML = `
      <span class="service-icon">${iconHtml}</span>
      <span class="service-name">${escapeHtml(s.key)}</span>
      <span class="service-toggle" aria-hidden="true">+</span>
    `;
    const toggle = () => {
      const i = state.services.indexOf(s.key);
      if (i === -1) { state.services.push(s.key); row.classList.add('selected'); }
      else { state.services.splice(i, 1); row.classList.remove('selected'); }
      row.querySelector('.service-toggle').textContent = row.classList.contains('selected') ? '✓' : '+';
      updateServiceCount();
    };
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    serviceList.appendChild(row);
  });

  function updateServiceCount() {
    const n = state.services.length;
    if (n > 0) {
      serviceError.hidden = true;
      serviceCount.hidden = false;
      serviceCount.textContent = ` (${n})`;
    } else {
      serviceCount.hidden = true;
    }
  }

  serviceSearch.addEventListener('input', () => {
    const q = serviceSearch.value.trim().toLowerCase();
    let visible = 0;
    serviceList.querySelectorAll('.service-row').forEach(row => {
      const match = row.dataset.name.includes(q);
      row.classList.toggle('hidden', !match);
      if (match) visible++;
    });
    serviceEmpty.hidden = visible !== 0;
  });

  document.getElementById('problemContinueBtn').addEventListener('click', () => {
    if (!state.services.length) { serviceError.hidden = false; return; }
    goTo('details');
  });

  /* ================= PANEL: details ================= */
  const detailsForm = document.getElementById('panel-details');
  detailsForm.addEventListener('submit', async (e) => {
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

try {

    await window.RajTelecomAPI.createLead({

        name: state.name,

        phone: state.phone.replace(/\D/g, ''),

        brand: state.brand === 'other'
            ? 'Other'
            : state.brand,

        model: state.model,

        issue: state.services.join(', ')

    });

}
catch (error) {

    alert(
        error.message +
        "\n\nPlease make sure the backend server is running."
    );

    return;

}

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
      ['Services', state.services.join(', ')],
      ['Name', state.name],
      ['Phone', state.phone],
      ['Delivery', state.serviceLabel],
    ];
    if (state.service !== 'visit' && state.address) rows.push(['Address', state.address]);
    rows.push(['Slot', state.slot]);

    el.innerHTML = rows.map(([label, value]) => `
      <div class="summary-row"><span>${label}</span><span>${escapeHtml(value)}</span></div>
    `).join('');
  }

  document.getElementById('confirmBtn').addEventListener('click', async () => {
    const confirmBtn = document.getElementById('confirmBtn');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Sending booking...';
    try {
      await window.RajTelecomAPI.confirmBooking({
        name: state.name,
        phone: state.phone.replace(/\D/g, ''),
        brand: state.brand === 'other' ? 'Other' : state.brand,
        model: state.model,
        issue: state.services.join(', '),
        serviceLabel: state.serviceLabel,
        address: state.address,
        slot: state.slot
      });
    } catch (error) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = originalText;
      window.alert(error.message + ' Please make sure the local backend is running.');
      return;
    }
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
    serviceList.querySelectorAll('.service-row').forEach(row => {
      row.classList.remove('selected', 'hidden');
      row.querySelector('.service-toggle').textContent = '+';
    });
    serviceSearch.value = '';
    serviceError.hidden = true;
    serviceEmpty.hidden = true;
    Object.keys(state).forEach(k => { state[k] = Array.isArray(state[k]) ? [] : ''; });
    updateServiceCount();
    goTo('brand');
  });

  /* ================= Entry point: read ?brand= from URL ================= */
  const params = new URLSearchParams(window.location.search);
  const brandParam = params.get('brand');
  const issueParam = params.get('issue');
  const issueLookup = {
    screen: 'Display Replacement', battery: 'Battery', charging: 'Charging Port',
    water: 'Water Damage', camera: 'Rear Camera', sound: 'Ear Speaker',
    'back-panel': 'Back Panel Replacement', software: 'Auto Restart',
  };
  if (issueParam && issueLookup[issueParam]) {
    const preselected = issueLookup[issueParam];
    state.services.push(preselected);
    const row = serviceList.querySelector(`[data-name="${preselected.toLowerCase()}"]`);
    if (row) { row.classList.add('selected'); row.querySelector('.service-toggle').textContent = '✓'; }
    updateServiceCount();
  }

  if (brandParam) {
    state.brand = brandParam;
    renderBrandChip();
    renderModelPanel();
    goTo('model');
  } else {
    goTo('brand');
  }
});
