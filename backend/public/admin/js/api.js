// Thin fetch wrapper for the admin API. Same-origin as this static panel
// (both served by the Express backend), so cookies (the JWT session) go
// along automatically with credentials: 'include'.
window.AdminAPI = (function () {
  // Any 401 outside of the login call itself means the session expired —
  // redirect to login instead of leaving the admin stuck looking at an
  // error toast with no way back in.
  function handleUnauthorized(path) {
    if (path.includes('/auth/login')) return;
    if (/\blogin\.html$/.test(location.pathname)) return;
    window.location.href = 'login.html';
  }

  async function request(path, options = {}) {
    const response = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (response.status === 401) handleUnauthorized(path);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }
    return data;
  }

  return {
    login: (email, password) =>
      request('/api/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    logout: () => request('/api/admin/auth/logout', { method: 'POST' }),
    me: () => request('/api/admin/auth/me'),
    dashboard: () => request('/api/admin/dashboard'),
    listConversations: ({ status, search, repairStage, expiringSoon } = {}) => {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.set('status', status);
      if (search) params.set('search', search);
      if (repairStage && repairStage !== 'all') params.set('repairStage', repairStage);
      if (expiringSoon) params.set('expiringSoon', 'true');
      const qs = params.toString();
      return request(`/api/admin/conversations${qs ? `?${qs}` : ''}`);
    },
    getConversation: (id) => request(`/api/admin/conversations/${id}`),
    sendMessage: (id, text) =>
      request(`/api/admin/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
    setStatus: (id, status) =>
      request(`/api/admin/conversations/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    setRepairStage: (id, repairStage) =>
      request(`/api/admin/conversations/${id}/repair-stage`, { method: 'PATCH', body: JSON.stringify({ repairStage }) }),
    listTemplates: () => request('/api/admin/templates'),
    sendTemplate: (id, templateName, params) =>
      request(`/api/admin/conversations/${id}/template`, { method: 'POST', body: JSON.stringify({ templateName, params }) }),
    mediaUrl: (messageId) => `/api/admin/media/${messageId}`,
    whatsappStatus: () => request('/api/whatsapp/status'),
    listAdmins: () => request('/api/admin/auth/admins'),
    createAdmin: (name, email, password) =>
      request('/api/admin/auth/admins', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    updateProfile: (changes) =>
      request('/api/admin/auth/me', { method: 'PATCH', body: JSON.stringify(changes) })
  };
})();
