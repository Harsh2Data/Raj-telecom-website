// Thin fetch wrapper for the admin API. Same-origin as this static panel
// (both served by the Express backend), so cookies (the JWT session) go
// along automatically with credentials: 'include'.
window.AdminAPI = (function () {
  async function request(path, options = {}) {
    const response = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
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
    listConversations: ({ status, search } = {}) => {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.set('status', status);
      if (search) params.set('search', search);
      const qs = params.toString();
      return request(`/api/admin/conversations${qs ? `?${qs}` : ''}`);
    },
    getConversation: (id) => request(`/api/admin/conversations/${id}`),
    sendMessage: (id, text) =>
      request(`/api/admin/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
    setStatus: (id, status) =>
      request(`/api/admin/conversations/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    listAdmins: () => request('/api/admin/auth/admins'),
    createAdmin: (name, email, password) =>
      request('/api/admin/auth/admins', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    updateProfile: (changes) =>
      request('/api/admin/auth/me', { method: 'PATCH', body: JSON.stringify(changes) })
  };
})();
