import { setState, setKey } from './state.js';
import { loadSession, clearSession } from './session.js';

const API = import.meta.env.VITE_API_URL;

export async function checkAuth() {
  const session = loadSession();
  if (!session?.token) { setKey('locked', true); return false; }

  try {
    const res = await fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    if (!res.ok) { clearSession(); setKey('locked', true); return false; }
    const user = await res.json();
    setState({ user, session, locked: false });
    return true;
  } catch {
    console.warn('[Auth] Backend unreachable');
    setKey('locked', true);
    return false;
  }
}

export function loginWithDiscord() {
  window.location.href = `${API}/auth/discord`;
}

export function logout() {
  clearSession();
  setState({ user: null, session: null, locked: true, activeTab: 'creds' });
}
