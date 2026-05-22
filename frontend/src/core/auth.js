import { setState, getState } from './state.js';
import { loadSession, clearSession } from './session.js';

const API = import.meta.env.VITE_API_URL;

export async function checkAuth() {
  const session = loadSession();
  if (!session?.token) {
    setState('locked', true);
    return false;
  }

  try {
    const res = await fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });

    if (!res.ok) {
      clearSession();
      setState('locked', true);
      return false;
    }

    const user = await res.json();
    setState('user', user);
    setState('session', session);
    setState('locked', false);
    return true;
  } catch {
    console.warn('[Auth] Backend unreachable');
    setState('locked', true);
    return false;
  }
}

export function loginWithDiscord() {
  window.location.href = `${API}/auth/discord`;
}

export function logout() {
  clearSession();
  setState('user', null);
  setState('session', null);
  setState('locked', true);
  setState('activeModule', null);
}

export function isAdmin() {
  return getState('user')?.role === 'admin';
}
