import { getState, setState } from './state.js';
import { loadSession, clearSession } from '../services/session.js';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export async function checkAuth() {
  const session = loadSession();

  if (!session || !session.token) {
    setState('locked', true);
    return false;
  }

  if (Date.now() > session.expires) {
    clearSession();
    setState('locked', true);
    return false;
  }

  setState('session', session);
  setState('user', session.user);
  setState('locked', false);
  return true;
}

export function isAdmin() {
  const user = getState('user');
  return user?.role === 'admin';
}

export function requireAdmin() {
  if (!isAdmin()) {
    throw new Error('[Auth] Admin access required');
  }
}

export function login(username, password) {
  // LOCAL AUTH — swap this for POST /login in backend mode
  const ADMIN_HASH = btoa(`${username}:${password}`); // NOT for production — placeholder
  const VALID = btoa('admin:vault2025'); // change via config

  if (ADMIN_HASH !== VALID) return false;

  const session = {
    token: crypto.randomUUID(),
    expires: Date.now() + SESSION_TTL_MS,
    user: { id: '1', username, role: 'admin' },
  };

  import('../services/session.js').then(({ saveSession }) => saveSession(session));
  setState('session', session);
  setState('user', session.user);
  setState('locked', false);
  return true;
}

export function logout() {
  clearSession();
  setState('session', null);
  setState('user', null);
  setState('locked', true);
  setState('activeModule', null);
}
