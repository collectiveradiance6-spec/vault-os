const API_BASE = import.meta.env.VITE_API_URL || null;

async function _request(method, path, body = null, token = null) {
  if (!API_BASE) {
    console.warn('[API] No backend configured — local mode');
    return null;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw new Error(`[API] ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  login: (username, password) =>
    _request('POST', '/login', { username, password }),

  getUser: (token) =>
    _request('GET', '/me', null, token),

  getVault: (token) =>
    _request('GET', '/vault', null, token),
};
