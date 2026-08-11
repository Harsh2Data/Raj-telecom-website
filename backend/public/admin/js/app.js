(function () {
  const QUICK_REPLIES_KEY = 'rt_admin_quick_replies';
  const MUTE_KEY = 'rt_admin_muted';
  const DEFAULT_QUICK_REPLIES = [
    'Thanks for reaching out! We\'ll check your device and get back to you shortly.',
    'Your device is ready for pickup at the shop.',
    'Could you share a bit more detail or a photo of the issue?',
    'We\'re currently closed. Our working hours are 10 AM–8 PM, Monday to Saturday.',
    'The estimated repair cost is ₹___. Shall we go ahead?'
  ];

  const ICONS = {
    clock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    doubleCheck: '<svg width="16" height="14" viewBox="0 0 28 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12l5 5L18 6"/><path d="M10 12l5 5L26 6"/></svg>',
    alert: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    call: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.902.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.908.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    whatsapp: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.24 0 4.35.87 5.93 2.46a8.3 8.3 0 0 1 2.45 5.92c0 4.61-3.76 8.36-8.38 8.36a8.37 8.37 0 0 1-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.29 8.29 0 0 1-1.28-4.45c0-4.61 3.76-8.36 8.32-8.36" /></svg>',
    edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    send: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    bell: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    bellOff: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 21a1.94 1.94 0 0 1-3.41 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    empty: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  };

  const AVATAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ef4444', '#14b8a6'];

  const state = {
    admin: null,
    conversations: [],
    statusFilter: 'all',
    search: '',
    selectedId: null,
    selectedConversation: null,
    selectedMessages: [],
    muted: localStorage.getItem(MUTE_KEY) === '1',
    windowTimerId: null
  };

  const VIEW_DISPLAY = { dashboard: 'block', conversations: 'flex', settings: 'block' };

  const el = {
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),
    sidebarClose: document.getElementById('sidebarClose'),
    hamburgerBtn: document.getElementById('hamburgerBtn'),
    topbarTitle: document.getElementById('topbarTitle'),
    muteBtn: document.getElementById('muteBtn'),
    connStatus: document.getElementById('connStatus'),
    navBtns: document.querySelectorAll('.nav-item'),
    navUnreadBadge: document.getElementById('navUnreadBadge'),
    views: document.querySelectorAll('.view'),
    logoutBtn: document.getElementById('logoutBtn'),
    adminAvatar: document.getElementById('adminAvatar'),
    adminName: document.getElementById('adminName'),
    adminEmail: document.getElementById('adminEmail'),
    greeting: document.getElementById('greeting'),
    todayDate: document.getElementById('todayDate'),
    convList: document.getElementById('convList'),
    convView: document.getElementById('view-conversations'),
    convSearch: document.getElementById('convSearch'),
    filterBtns: document.querySelectorAll('.segmented button'),
    chatPane: document.getElementById('chatPane'),
    toastStack: document.getElementById('toastStack'),
    statUnread: document.getElementById('statUnread'),
    statActive: document.getElementById('statActive'),
    statClosed: document.getElementById('statClosed'),
    statTotal: document.getElementById('statTotal'),
    statToday: document.getElementById('statToday'),
    statGrid: document.getElementById('statGrid'),
    profileName: document.getElementById('profileName'),
    profileEmail: document.getElementById('profileEmail'),
    saveProfileBtn: document.getElementById('saveProfileBtn'),
    profileMsg: document.getElementById('profileMsg'),
    curPassword: document.getElementById('curPassword'),
    newPassword: document.getElementById('newPassword'),
    confirmPassword: document.getElementById('confirmPassword'),
    savePasswordBtn: document.getElementById('savePasswordBtn'),
    passwordMsg: document.getElementById('passwordMsg'),
    adminTeamList: document.getElementById('adminTeamList'),
    newAdminName: document.getElementById('newAdminName'),
    newAdminEmail: document.getElementById('newAdminEmail'),
    newAdminPassword: document.getElementById('newAdminPassword'),
    addAdminBtn: document.getElementById('addAdminBtn'),
    addAdminMsg: document.getElementById('addAdminMsg')
  };

  /* ---------------- Auth gate ---------------- */
  AdminAPI.me()
    .then((data) => {
      state.admin = data.admin;
      boot();
    })
    .catch(() => {
      window.location.href = 'login.html';
    });

  function boot() {
    renderAdminCard();
    renderGreeting();
    setupNav();
    setupSidebarToggle();
    setupLogout();
    setupMute();
    setupConversationControls();
    setupSettings();
    showView('dashboard');
    loadDashboard();
    loadConversations();
    connectSocket();
    setupNotifications();
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = String(str == null ? '' : str);
    return d.innerHTML;
  }

  function initials(name) {
    const parts = String(name || '?').trim().split(/\s+/);
    const chars = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
    return chars.toUpperCase();
  }

  function colorFor(seed) {
    let hash = 0;
    const s = String(seed || '');
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  /* ---------------- Sidebar / admin card ---------------- */
  function renderAdminCard() {
    if (!state.admin) return;
    el.adminAvatar.textContent = initials(state.admin.name);
    el.adminAvatar.style.background = colorFor(state.admin.email);
    el.adminName.textContent = state.admin.name;
    el.adminEmail.textContent = state.admin.email;
  }

  function renderGreeting() {
    const hour = new Date().getHours();
    const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const first = (state.admin && state.admin.name ? state.admin.name : '').split(' ')[0];
    el.greeting.textContent = `Good ${part}${first ? ', ' + first : ''}`;
    el.todayDate.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function setupSidebarToggle() {
    const open = () => { el.sidebar.classList.add('open'); el.sidebarBackdrop.classList.add('open'); };
    const close = () => { el.sidebar.classList.remove('open'); el.sidebarBackdrop.classList.remove('open'); };
    el.hamburgerBtn.addEventListener('click', open);
    el.sidebarClose.addEventListener('click', close);
    el.sidebarBackdrop.addEventListener('click', close);
  }

  const VIEW_TITLES = { dashboard: 'Dashboard', conversations: 'Conversations', settings: 'Settings' };

  // Display is set inline (not via a CSS class) — see the comment above
  // .view in admin.css: a plain `.active { display: block }` rule can't
  // express that the conversations view needs `display:flex` while the
  // others need `display:block`, and that specificity clash was the root
  // cause of the conversations screen rendering broken/overlapping.
  function showView(name) {
    el.views.forEach((v) => { v.style.display = 'none'; v.classList.remove('active'); });
    const view = document.getElementById(`view-${name}`);
    view.style.display = VIEW_DISPLAY[name] || 'block';
    view.classList.add('active');

    el.navBtns.forEach((b) => b.classList.toggle('active', b.dataset.view === name));
    el.topbarTitle.textContent = VIEW_TITLES[name] || '';

    if (name === 'dashboard') loadDashboard();
    if (name === 'settings') loadSettings();
  }

  function setupNav() {
    el.navBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        showView(btn.dataset.view);
        el.sidebar.classList.remove('open');
        el.sidebarBackdrop.classList.remove('open');
      });
    });
  }

  function setupLogout() {
    el.logoutBtn.addEventListener('click', async () => {
      try { await AdminAPI.logout(); } catch (e) { /* log out locally regardless */ }
      window.location.href = 'login.html';
    });
  }

  function setupMute() {
    const render = () => {
      el.muteBtn.innerHTML = state.muted ? ICONS.bellOff : ICONS.bell;
      el.muteBtn.classList.toggle('on', state.muted);
      el.muteBtn.title = state.muted ? 'Notifications muted — click to unmute' : 'Mute notifications';
    };
    render();
    el.muteBtn.addEventListener('click', () => {
      state.muted = !state.muted;
      localStorage.setItem(MUTE_KEY, state.muted ? '1' : '0');
      render();
    });
  }

  /* ---------------- Settings ---------------- */
  function setSettingsMsg(el2, text, ok) {
    el2.textContent = text;
    el2.classList.toggle('ok', !!ok);
    el2.classList.toggle('error', !ok);
  }

  function setupSettings() {
    el.saveProfileBtn.addEventListener('click', async () => {
      const name = el.profileName.value.trim();
      if (!name) return setSettingsMsg(el.profileMsg, 'Name cannot be empty.', false);
      el.saveProfileBtn.disabled = true;
      try {
        const { admin } = await AdminAPI.updateProfile({ name });
        state.admin = admin;
        renderAdminCard();
        renderGreeting();
        setSettingsMsg(el.profileMsg, 'Saved.', true);
      } catch (error) {
        setSettingsMsg(el.profileMsg, error.message, false);
      } finally {
        el.saveProfileBtn.disabled = false;
      }
    });

    el.savePasswordBtn.addEventListener('click', async () => {
      const currentPassword = el.curPassword.value;
      const newPassword = el.newPassword.value;
      const confirmPassword = el.confirmPassword.value;
      if (!currentPassword || !newPassword) return setSettingsMsg(el.passwordMsg, 'Fill in both password fields.', false);
      if (newPassword.length < 8) return setSettingsMsg(el.passwordMsg, 'New password must be at least 8 characters.', false);
      if (newPassword !== confirmPassword) return setSettingsMsg(el.passwordMsg, 'New password and confirmation do not match.', false);

      el.savePasswordBtn.disabled = true;
      try {
        await AdminAPI.updateProfile({ currentPassword, newPassword });
        el.curPassword.value = '';
        el.newPassword.value = '';
        el.confirmPassword.value = '';
        setSettingsMsg(el.passwordMsg, 'Password updated.', true);
      } catch (error) {
        setSettingsMsg(el.passwordMsg, error.message, false);
      } finally {
        el.savePasswordBtn.disabled = false;
      }
    });

    el.addAdminBtn.addEventListener('click', async () => {
      const name = el.newAdminName.value.trim();
      const email = el.newAdminEmail.value.trim();
      const password = el.newAdminPassword.value;
      if (!name || !email || !password) return setSettingsMsg(el.addAdminMsg, 'Fill in name, email and password.', false);
      if (password.length < 8) return setSettingsMsg(el.addAdminMsg, 'Password must be at least 8 characters.', false);

      el.addAdminBtn.disabled = true;
      try {
        await AdminAPI.createAdmin(name, email, password);
        el.newAdminName.value = '';
        el.newAdminEmail.value = '';
        el.newAdminPassword.value = '';
        setSettingsMsg(el.addAdminMsg, `${name} can now log in.`, true);
        loadAdminTeam();
      } catch (error) {
        setSettingsMsg(el.addAdminMsg, error.message, false);
      } finally {
        el.addAdminBtn.disabled = false;
      }
    });
  }

  function loadSettings() {
    if (state.admin) {
      el.profileName.value = state.admin.name || '';
      el.profileEmail.value = state.admin.email || '';
    }
    loadAdminTeam();
  }

  async function loadAdminTeam() {
    el.adminTeamList.innerHTML = Array.from({ length: 2 }).map(() => `
      <div class="admin-team-row"><div class="skel-circle"></div><div class="skel-lines"><div class="skel-line w60"></div><div class="skel-line w40"></div></div></div>
    `).join('');
    try {
      const { admins } = await AdminAPI.listAdmins();
      el.adminTeamList.innerHTML = admins.map((a) => `
        <div class="admin-team-row">
          <span class="conv-avatar" style="background:${colorFor(a.email)}">${initials(a.name)}</span>
          <div class="admin-team-info">
            <div class="admin-team-name">${escapeHtml(a.name)}${state.admin && a.email === state.admin.email ? ' (you)' : ''}</div>
            <div class="admin-team-email">${escapeHtml(a.email)}</div>
          </div>
          <span class="admin-team-date">${new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      `).join('');
    } catch (error) {
      el.adminTeamList.innerHTML = `<p style="color:var(--text-mute);font-size:0.82rem;">Could not load the admin list: ${escapeHtml(error.message)}</p>`;
    }
  }

  /* ---------------- Dashboard ---------------- */
  async function loadDashboard() {
    try {
      const { summary } = await AdminAPI.dashboard();
      el.statGrid.querySelectorAll('.stat-card').forEach((c) => c.classList.remove('skel'));
      el.statUnread.textContent = summary.unread;
      el.statActive.textContent = summary.active;
      el.statClosed.textContent = summary.closed;
      el.statTotal.textContent = summary.total;
      el.statToday.textContent = summary.today;
      updateUnreadBadge(summary.unread);
    } catch (error) {
      console.error('Dashboard load failed:', error.message);
    }
  }

  function updateUnreadBadge(count) {
    if (count > 0) {
      el.navUnreadBadge.hidden = false;
      el.navUnreadBadge.textContent = count > 99 ? '99+' : String(count);
      document.title = `(${count}) Admin — Raj Telecom`;
    } else {
      el.navUnreadBadge.hidden = true;
      document.title = 'Admin — Raj Telecom';
    }
  }

  /* ---------------- Conversation list ---------------- */
  function setupConversationControls() {
    let searchTimer;
    el.convSearch.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.search = el.convSearch.value.trim();
        loadConversations();
      }, 250);
    });

    el.filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        el.filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.statusFilter = btn.dataset.status;
        loadConversations();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== el.convSearch && !/input|textarea/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        el.convSearch.focus();
      }
    });
  }

  function renderSkeletonList() {
    el.convList.innerHTML = Array.from({ length: 6 }).map(() => `
      <div class="skel-item">
        <div class="skel-circle"></div>
        <div class="skel-lines">
          <div class="skel-line w60"></div>
          <div class="skel-line w40"></div>
          <div class="skel-line w80"></div>
        </div>
      </div>
    `).join('');
  }

  let firstLoad = true;
  async function loadConversations() {
    if (firstLoad) { renderSkeletonList(); firstLoad = false; }
    try {
      const { conversations } = await AdminAPI.listConversations({ status: state.statusFilter, search: state.search });
      state.conversations = conversations;
      renderConvList();
    } catch (error) {
      console.error('Conversation list load failed:', error.message);
    }
  }

  function timeLabel(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    return sameDay
      ? date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
      : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  function dayLabel(iso) {
    const date = new Date(iso);
    const now = new Date();
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === now.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  }

  function renderConvList() {
    if (!state.conversations.length) {
      el.convList.innerHTML = `<div class="conv-empty">${ICONS.empty}<div>No conversations found.</div></div>`;
      return;
    }
    el.convList.innerHTML = state.conversations.map((c) => `
      <div class="conv-item ${c.status === 'closed' ? 'closed' : ''} ${c.unreadCount > 0 ? 'unread' : ''} ${c._id === state.selectedId ? 'selected' : ''}" data-id="${c._id}">
        <span class="conv-avatar" style="background:${colorFor(c.customerPhone)}">${initials(c.customerName)}</span>
        <div class="conv-item-body">
          <div class="conv-item-top">
            <span class="conv-item-name">${escapeHtml(c.customerName)}</span>
            <span class="conv-item-time">${timeLabel(c.lastMessageAt)}</span>
          </div>
          <div class="conv-item-sub">${escapeHtml(c.customerPhone)}${c.deviceModel ? ` · ${escapeHtml(c.deviceModel)}` : ''}</div>
          <div class="conv-item-last">${escapeHtml(c.lastMessage || 'No messages yet')}</div>
          <div class="conv-item-badges">
            <span class="status-pill ${c.status}">${c.status}</span>
            ${c.unreadCount > 0 ? `<span class="unread-dot">${c.unreadCount}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    el.convList.querySelectorAll('.conv-item').forEach((item) => {
      item.addEventListener('click', () => selectConversation(item.dataset.id));
    });
  }

  function upsertConversation(conversation) {
    const idx = state.conversations.findIndex((c) => c._id === conversation._id);
    if (idx === -1) state.conversations.unshift(conversation);
    else state.conversations[idx] = conversation;
    state.conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    if (state.selectedId === conversation._id) state.selectedConversation = conversation;
    renderConvList();
  }

  /* ---------------- Chat pane ---------------- */
  async function selectConversation(id) {
    state.selectedId = id;
    el.convView.classList.add('chat-open');
    renderConvList();
    el.chatPane.innerHTML = `<div class="chat-placeholder"><div class="skel-circle" style="width:40px;height:40px;"></div></div>`;
    try {
      const { conversation, messages } = await AdminAPI.getConversation(id);
      upsertConversation(conversation);
      state.selectedConversation = conversation;
      state.selectedMessages = messages;
      renderChat(conversation, messages);
      loadDashboard();
    } catch (error) {
      console.error('Conversation load failed:', error.message);
    }
  }

  function deselectConversation() {
    state.selectedId = null;
    el.convView.classList.remove('chat-open');
    stopWindowTimer();
  }

  function stopWindowTimer() {
    if (state.windowTimerId) {
      clearInterval(state.windowTimerId);
      state.windowTimerId = null;
    }
  }

  function lastCustomerMessageAt(messages) {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderType === 'customer') return new Date(messages[i].createdAt);
    }
    return null;
  }

  function windowRemainingLabel(msRemaining) {
    const totalMinutes = Math.max(0, Math.floor(msRemaining / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  function renderWindowTimer(lastAt) {
    const bar = document.getElementById('windowTimerBar');
    if (!bar) return;
    if (!lastAt) {
      bar.style.display = 'none';
      bar.innerHTML = '';
      return;
    }
    bar.style.display = 'flex';
    const msRemaining = 24 * 60 * 60 * 1000 - (Date.now() - lastAt.getTime());
    if (msRemaining <= 0) {
      bar.className = 'window-timer closed';
      bar.innerHTML = `<span class="live-dot"></span> 24-hour reply window closed — only WhatsApp template messages will deliver until the customer messages again.`;
    } else {
      const cls = msRemaining < 2 * 60 * 60 * 1000 ? 'warn' : 'ok';
      bar.className = `window-timer ${cls}`;
      bar.innerHTML = `<span class="live-dot"></span> <strong>${windowRemainingLabel(msRemaining)}</strong> left in the free reply window`;
    }
  }

  function startWindowTimer(messages) {
    stopWindowTimer();
    const lastAt = lastCustomerMessageAt(messages);
    renderWindowTimer(lastAt);
    state.windowTimerId = setInterval(() => renderWindowTimer(lastCustomerMessageAt(state.selectedMessages)), 30000);
  }

  function statusTick(m) {
    if (m.senderType !== 'owner') return '';
    if (m.status === 'sending') return `<span class="msg-status-icon">${ICONS.clock}</span>`;
    if (m.status === 'sent') return `<span class="msg-status-icon">${ICONS.check}</span>`;
    if (m.status === 'delivered') return `<span class="msg-status-icon">${ICONS.doubleCheck}</span>`;
    if (m.status === 'read') return `<span class="msg-status-icon read">${ICONS.doubleCheck}</span>`;
    if (m.status === 'failed') return `<span class="msg-status-icon failed">${ICONS.alert}</span> <button type="button" class="msg-retry" data-retry="${escapeHtml(m.message)}">Retry</button>`;
    return '';
  }

  function msgBubble(m) {
    return `
      <div class="msg-row ${m.senderType}" data-message-id="${m._id}">
        <div class="msg-bubble-wrap">
          <div class="msg-bubble">${escapeHtml(m.message)}</div>
          <div class="msg-meta">${timeLabel(m.createdAt)} ${statusTick(m)}</div>
        </div>
      </div>
    `;
  }

  function renderMessagesWithSeparators(messages) {
    let lastDay = null;
    let html = '';
    messages.forEach((m) => {
      const day = dayLabel(m.createdAt);
      if (day !== lastDay) {
        html += `<div class="chat-day-sep"><span>${day}</span></div>`;
        lastDay = day;
      }
      html += msgBubble(m);
    });
    return html || '<p style="color:var(--text-mute);text-align:center;margin-top:30px;">No messages yet.</p>';
  }

  function getQuickReplies() {
    try {
      const saved = JSON.parse(localStorage.getItem(QUICK_REPLIES_KEY));
      return Array.isArray(saved) && saved.length ? saved : DEFAULT_QUICK_REPLIES;
    } catch (e) { return DEFAULT_QUICK_REPLIES; }
  }

  function saveQuickReplies(list) {
    localStorage.setItem(QUICK_REPLIES_KEY, JSON.stringify(list));
  }

  function renderChat(conversation, messages) {
    const device = [conversation.deviceBrand, conversation.deviceModel].filter(Boolean).join(' ');
    const phoneDigits = conversation.customerPhone.replace(/\D/g, '');
    const quickReplies = getQuickReplies();

    el.chatPane.innerHTML = `
      <div class="chat-head">
        <div class="chat-head-left">
          <button type="button" class="chat-back" id="chatBackBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span class="chat-avatar" style="background:${colorFor(conversation.customerPhone)}">${initials(conversation.customerName)}</span>
          <div class="chat-head-text">
            <h3>${escapeHtml(conversation.customerName)}</h3>
            <div class="meta">
              <a href="tel:+${phoneDigits}">${ICONS.call} ${escapeHtml(conversation.customerPhone)}</a>
              <a href="https://wa.me/${phoneDigits}" target="_blank" rel="noopener">${ICONS.whatsapp} <span class="whatsapp-label">WhatsApp</span></a>
              ${device ? `<span>${escapeHtml(device)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="chat-head-actions">
          <button type="button" class="btn ${conversation.status === 'open' ? 'btn-danger-ghost' : 'btn-ghost'} btn-sm" id="toggleStatusBtn">
            ${conversation.status === 'open' ? 'Close' : 'Reopen'}
          </button>
        </div>
      </div>
      ${conversation.issue ? `<div class="window-warning" style="background:var(--surface-alt);color:var(--text-soft);border-bottom:1px solid var(--border-soft);"><span>Issue: ${escapeHtml(conversation.issue)}</span></div>` : ''}
      <div class="window-timer" id="windowTimerBar"></div>
      <div class="chat-messages" id="chatMessages">${renderMessagesWithSeparators(messages)}</div>
      <div class="quick-replies-bar" id="quickRepliesBar">
        ${quickReplies.map((q) => `<button type="button" class="quick-chip" data-text="${escapeHtml(q)}">${escapeHtml(q.length > 42 ? q.slice(0, 42) + '…' : q)}</button>`).join('')}
        <button type="button" class="icon-btn" id="quickRepliesManageBtn" title="Manage quick replies" style="flex:0 0 auto;">${ICONS.edit}</button>
      </div>
      <div class="qr-manager" id="qrManager"></div>
      <div class="chat-input-bar">
        <textarea id="chatInput" placeholder="Type a message… (Enter to send, Shift+Enter for new line)" rows="1"></textarea>
        <button type="button" class="btn btn-primary send-btn" id="chatSendBtn">${ICONS.send}</button>
      </div>
    `;
    scrollChatToBottom();
    startWindowTimer(messages);

    document.getElementById('chatBackBtn').addEventListener('click', deselectConversation);

    document.getElementById('toggleStatusBtn').addEventListener('click', async () => {
      const next = conversation.status === 'open' ? 'closed' : 'open';
      try {
        const { conversation: updated } = await AdminAPI.setStatus(conversation._id, next);
        upsertConversation(updated);
        renderChat(updated, state.selectedMessages);
        loadDashboard();
      } catch (error) {
        showToast('Error', error.message);
      }
    });

    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');

    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    const send = async () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      input.style.height = 'auto';
      sendBtn.disabled = true;
      try {
        await AdminAPI.sendMessage(conversation._id, text);
        // The new message renders via the 'message:new' socket broadcast —
        // this call just triggers the send; no need to render it twice.
      } catch (error) {
        showToast('Message failed', error.message);
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    };
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });

    document.getElementById('chatMessages').addEventListener('click', (e) => {
      const retryBtn = e.target.closest('.msg-retry');
      if (retryBtn) {
        input.value = retryBtn.dataset.retry;
        input.focus();
      }
    });

    document.getElementById('quickRepliesBar').addEventListener('click', (e) => {
      const chip = e.target.closest('.quick-chip');
      if (chip) {
        input.value = (input.value ? input.value + ' ' : '') + chip.dataset.text;
        input.dispatchEvent(new Event('input'));
        input.focus();
      }
      if (e.target.closest('#quickRepliesManageBtn')) toggleQuickReplyManager(conversation, messages);
    });
  }

  function toggleQuickReplyManager(conversation, messages) {
    const panel = document.getElementById('qrManager');
    if (!panel) return;
    if (panel.classList.contains('open')) { panel.classList.remove('open'); return; }
    renderQuickReplyManager(panel);
    panel.classList.add('open');
  }

  function renderQuickReplyManager(panel) {
    const list = getQuickReplies();
    panel.innerHTML = `
      <h4>Quick replies</h4>
      <div class="qr-list">
        ${list.map((q, i) => `
          <div class="qr-row">
            <span>${escapeHtml(q)}</span>
            <button type="button" data-remove="${i}" title="Remove">✕</button>
          </div>
        `).join('') || '<p style="color:var(--text-mute);font-size:0.78rem;">No saved replies yet.</p>'}
      </div>
      <div class="qr-add">
        <input type="text" id="qrNewText" placeholder="Add a new quick reply…">
        <button type="button" id="qrAddBtn">Add</button>
      </div>
    `;

    panel.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.remove);
        const updated = getQuickReplies().filter((_, i) => i !== idx);
        saveQuickReplies(updated);
        renderQuickReplyManager(panel);
        if (state.selectedConversation) renderChat(state.selectedConversation, state.selectedMessages);
      });
    });

    const addBtn = panel.querySelector('#qrAddBtn');
    const input = panel.querySelector('#qrNewText');
    const add = () => {
      const text = input.value.trim();
      if (!text) return;
      const updated = getQuickReplies().concat(text);
      saveQuickReplies(updated);
      input.value = '';
      renderQuickReplyManager(panel);
      if (state.selectedConversation) renderChat(state.selectedConversation, state.selectedMessages);
    };
    addBtn.addEventListener('click', add);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
  }

  function scrollChatToBottom() {
    const box = document.getElementById('chatMessages');
    if (box) box.scrollTop = box.scrollHeight;
  }

  /* ---------------- Socket.IO (real-time) ---------------- */
  function setConnStatus(mode) {
    el.connStatus.classList.remove('live', 'down');
    const label = el.connStatus.querySelector('.conn-label');
    if (mode === 'live') { el.connStatus.classList.add('live'); label.textContent = 'Live'; }
    else if (mode === 'down') { el.connStatus.classList.add('down'); label.textContent = 'Reconnecting…'; }
    else { label.textContent = 'Connecting…'; }
  }

  function connectSocket() {
    const socket = io({ withCredentials: true });

    socket.on('connect', () => setConnStatus('live'));
    socket.on('disconnect', () => setConnStatus('down'));
    socket.on('reconnect_attempt', () => setConnStatus('down'));

    socket.on('message:new', ({ conversation, message }) => {
      upsertConversation(conversation);

      if (state.selectedId === conversation._id) {
        state.selectedMessages.push(message);
        const box = document.getElementById('chatMessages');
        if (box) {
          const lastDay = state.selectedMessages.length > 1 ? dayLabel(state.selectedMessages[state.selectedMessages.length - 2].createdAt) : null;
          const thisDay = dayLabel(message.createdAt);
          let html = '';
          if (thisDay !== lastDay) html += `<div class="chat-day-sep"><span>${thisDay}</span></div>`;
          html += msgBubble(message);
          box.insertAdjacentHTML('beforeend', html);
          const lastRow = box.querySelector(`.msg-row[data-message-id="${message._id}"]`);
          if (lastRow) lastRow.classList.add('msg-in');
          scrollChatToBottom();
        }
        if (message.senderType === 'customer') AdminAPI.getConversation(conversation._id).catch(() => {});
      }

      if (message.senderType === 'customer') {
        notify(conversation.customerName, message.message, conversation._id);
        loadDashboard();
      }
    });

    socket.on('conversation:updated', ({ conversation }) => {
      upsertConversation(conversation);
      if (state.selectedId === conversation._id) {
        const btn = document.getElementById('toggleStatusBtn');
        if (btn) {
          btn.textContent = conversation.status === 'open' ? 'Close' : 'Reopen';
          btn.className = `btn ${conversation.status === 'open' ? 'btn-danger-ghost' : 'btn-ghost'} btn-sm`;
        }
      }
      loadDashboard();
    });

    socket.on('message:status', ({ messageId, status }) => {
      const row = document.querySelector(`.msg-row[data-message-id="${messageId}"]`);
      if (!row) return;
      const msg = state.selectedMessages.find((m) => m._id === messageId);
      if (msg) msg.status = status;
      const metaEl = row.querySelector('.msg-meta');
      if (metaEl && msg) {
        metaEl.innerHTML = `${timeLabel(msg.createdAt)} ${statusTick(msg)}`;
      }
    });
  }

  /* ---------------- Notifications ---------------- */
  function setupNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function playBeep() {
    if (state.muted) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 720;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (error) { /* audio unsupported/blocked — non-critical */ }
  }

  function showToast(title, body, onClick) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${ICONS.bell}</span><div class="toast-body"><b>${escapeHtml(title)}</b><span>${escapeHtml(body)}</span></div>`;
    if (onClick) toast.addEventListener('click', onClick);
    el.toastStack.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('leaving');
      setTimeout(() => toast.remove(), 220);
    }, 6000);
  }

  function notify(customerName, messageText, conversationId) {
    if (state.muted) return;
    playBeep();
    showToast('New WhatsApp message', `${customerName}: "${messageText}"`, () => {
      document.querySelector('.nav-item[data-view="conversations"]').click();
      selectConversation(conversationId);
    });
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      const n = new Notification(`New message from ${customerName}`, { body: messageText });
      n.onclick = () => { window.focus(); };
    }
  }
})();
