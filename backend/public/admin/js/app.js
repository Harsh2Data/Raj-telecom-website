(function () {
  const state = {
    admin: null,
    conversations: [],
    statusFilter: 'all',
    search: '',
    selectedId: null,
    selectedMessages: []
  };

  const el = {
    navBtns: document.querySelectorAll('.sidebar nav button'),
    views: document.querySelectorAll('.view'),
    logoutBtn: document.getElementById('logoutBtn'),
    convList: document.getElementById('convList'),
    convSearch: document.getElementById('convSearch'),
    filterBtns: document.querySelectorAll('.conv-filters button'),
    chatPane: document.getElementById('chatPane'),
    toastStack: document.getElementById('toastStack'),
    statUnread: document.getElementById('statUnread'),
    statActive: document.getElementById('statActive'),
    statClosed: document.getElementById('statClosed'),
    statTotal: document.getElementById('statTotal'),
    statToday: document.getElementById('statToday')
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
    setupNav();
    setupLogout();
    setupConversationControls();
    loadDashboard();
    loadConversations();
    connectSocket();
    setupNotifications();
  }

  /* ---------------- Nav ---------------- */
  function setupNav() {
    el.navBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        el.navBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        el.views.forEach((v) => v.classList.remove('active'));
        document.getElementById(`view-${btn.dataset.view}`).classList.add('active');
        if (btn.dataset.view === 'dashboard') loadDashboard();
      });
    });
  }

  function setupLogout() {
    el.logoutBtn.addEventListener('click', async () => {
      try { await AdminAPI.logout(); } catch (e) { /* log out locally regardless */ }
      window.location.href = 'login.html';
    });
  }

  /* ---------------- Dashboard ---------------- */
  async function loadDashboard() {
    try {
      const { summary } = await AdminAPI.dashboard();
      el.statUnread.textContent = summary.unread;
      el.statActive.textContent = summary.active;
      el.statClosed.textContent = summary.closed;
      el.statTotal.textContent = summary.total;
      el.statToday.textContent = summary.today;
    } catch (error) {
      console.error('Dashboard load failed:', error.message);
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
  }

  async function loadConversations() {
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

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = String(str == null ? '' : str);
    return d.innerHTML;
  }

  function renderConvList() {
    if (!state.conversations.length) {
      el.convList.innerHTML = '<div class="conv-empty">No conversations yet.</div>';
      return;
    }
    el.convList.innerHTML = state.conversations.map((c) => `
      <div class="conv-item ${c.status === 'closed' ? 'closed' : ''} ${c._id === state.selectedId ? 'selected' : ''}" data-id="${c._id}">
        <div class="conv-item-top">
          <span class="conv-item-name">${escapeHtml(c.customerName)}</span>
          <span class="conv-item-time">${timeLabel(c.lastMessageAt)}</span>
        </div>
        <div class="conv-item-phone">${escapeHtml(c.customerPhone)}${c.deviceModel ? ` · ${escapeHtml(c.deviceModel)}` : ''}</div>
        <div class="conv-item-last">${escapeHtml(c.lastMessage || 'No messages yet')}</div>
        <div class="conv-item-badges">
          <span class="status-pill ${c.status}">${c.status}</span>
          ${c.unreadCount > 0 ? `<span class="unread-dot">${c.unreadCount} unread</span>` : ''}
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
    renderConvList();
  }

  /* ---------------- Chat pane ---------------- */
  async function selectConversation(id) {
    state.selectedId = id;
    renderConvList();
    try {
      const { conversation, messages } = await AdminAPI.getConversation(id);
      upsertConversation(conversation);
      state.selectedMessages = messages;
      renderChat(conversation, messages);
    } catch (error) {
      console.error('Conversation load failed:', error.message);
    }
  }

  function msgBubble(m) {
    const statusNote = m.senderType === 'owner'
      ? `<span class="msg-status ${m.status === 'failed' ? 'failed' : ''}">${m.status === 'failed' ? 'failed to send' : m.status}</span>`
      : '';
    return `
      <div class="msg-row ${m.senderType}" data-message-id="${m._id}">
        <div>
          <div class="msg-bubble">${escapeHtml(m.message)}</div>
          <div class="msg-meta">${timeLabel(m.createdAt)} ${statusNote}</div>
        </div>
      </div>
    `;
  }

  function renderChat(conversation, messages) {
    const device = [conversation.deviceBrand, conversation.deviceModel].filter(Boolean).join(' ');
    el.chatPane.innerHTML = `
      <div class="chat-head">
        <div>
          <h3>${escapeHtml(conversation.customerName)}</h3>
          <div class="meta">
            ${escapeHtml(conversation.customerPhone)}<br>
            ${device ? `Device: ${escapeHtml(device)}<br>` : ''}
            ${conversation.issue ? `Issue: ${escapeHtml(conversation.issue)}` : ''}
          </div>
        </div>
        <div class="chat-head-actions">
          <button type="button" class="btn btn-ghost btn-sm" id="toggleStatusBtn">
            ${conversation.status === 'open' ? 'Close conversation' : 'Reopen conversation'}
          </button>
        </div>
      </div>
      <div class="chat-messages" id="chatMessages">${messages.map(msgBubble).join('') || '<p style="color:var(--muted);text-align:center;">No messages yet.</p>'}</div>
      <div class="chat-input-bar">
        <input type="text" id="chatInput" placeholder="Type a message…" autocomplete="off">
        <button type="button" class="btn btn-primary btn-sm" id="chatSendBtn">Send</button>
      </div>
    `;
    scrollChatToBottom();

    document.getElementById('toggleStatusBtn').addEventListener('click', async () => {
      const next = conversation.status === 'open' ? 'closed' : 'open';
      try {
        const { conversation: updated } = await AdminAPI.setStatus(conversation._id, next);
        upsertConversation(updated);
        renderChat(updated, state.selectedMessages);
      } catch (error) {
        showToast('Error', error.message);
      }
    });

    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const send = async () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
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
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
  }

  function scrollChatToBottom() {
    const box = document.getElementById('chatMessages');
    if (box) box.scrollTop = box.scrollHeight;
  }

  /* ---------------- Socket.IO (real-time) ---------------- */
  function connectSocket() {
    const socket = io({ withCredentials: true });

    socket.on('message:new', ({ conversation, message }) => {
      upsertConversation(conversation);

      if (state.selectedId === conversation._id) {
        state.selectedMessages.push(message);
        const box = document.getElementById('chatMessages');
        if (box) {
          box.insertAdjacentHTML('beforeend', msgBubble(message));
          scrollChatToBottom();
        }
        // Admin is actively looking at this conversation — sync the
        // server-side unread counter back to zero without re-rendering.
        if (message.senderType === 'customer') AdminAPI.getConversation(conversation._id).catch(() => {});
      }

      if (message.senderType === 'customer') {
        notify(conversation.customerName, message.message);
        loadDashboard();
      }
    });

    socket.on('conversation:updated', ({ conversation }) => {
      upsertConversation(conversation);
      if (state.selectedId === conversation._id) {
        document.getElementById('toggleStatusBtn').textContent =
          conversation.status === 'open' ? 'Close conversation' : 'Reopen conversation';
      }
      loadDashboard();
    });

    socket.on('message:status', ({ messageId, status }) => {
      const row = document.querySelector(`.msg-row[data-message-id="${messageId}"] .msg-status`);
      if (row) {
        row.textContent = status === 'failed' ? 'failed to send' : status;
        row.classList.toggle('failed', status === 'failed');
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

  function showToast(title, body) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<b>${escapeHtml(title)}</b>${escapeHtml(body)}`;
    el.toastStack.appendChild(toast);
    setTimeout(() => toast.remove(), 6000);
  }

  function notify(customerName, messageText) {
    playBeep();
    showToast(`🔔 New WhatsApp message`, `${customerName}: "${messageText}"`);
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      new Notification(`New message from ${customerName}`, { body: messageText });
    }
  }
})();
