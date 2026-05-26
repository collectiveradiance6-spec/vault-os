import { setState, getState } from './state.js';
import { loadSession, clearSession, saveSession } from './session.js';

const API = import.meta.env.VITE_API_URL;

export async function checkAuth() {
  const session = loadSession();
  if (!session?.token) { setState('locked', true); return false; }

  try {
    const res = await fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    if (!res.ok) { clearSession(); setState('locked', true); return false; }
    const user = await res.json();
    setState('user', user);
    setState('session', session);
    setState('locked', false);

    // Sync local vault to server on login
    _syncVaultToServer(session.token);
    return true;
  } catch {
    console.warn('[Auth] Backend unreachable — local mode');
    setState('locked', true);
    return false;
  }
}

export function loginWithDiscord() {
  window.location.href = `${API}/auth/discord`;
}

export async function logout() {
  const session = loadSession();
  if (session?.token && API) {
    fetch(`${API}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.token}` },
    }).catch(() => {});
  }
  clearSession();
  setState('user', null);
  setState('session', null);
  setState('locked', true);
  setState('activeModule', null);
  setState('permissions', []);
}

export function isAdmin() {
  return ['admin','owner_hidden','owner_visible'].includes(getState('user')?.role);
}

export async function getPermissions() {
  const session = loadSession();
  if (!session?.token || !API) return [];
  try {
    const res = await fetch(`${API}/rbac/permissions`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    if (!res.ok) return [];
    const { permissions } = await res.json();
    setState('permissions', permissions);
    return permissions;
  } catch { return []; }
}

// Silently push local entries to server for backup
async function _syncVaultToServer(token) {
  if (!API) return;
  try {
    const raw = localStorage.getItem('vault_os_data');
    const entries = raw ? JSON.parse(raw) : [];
    if (!entries.length) return;
    await fetch(`${API}/vault`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
  } catch {}
}
