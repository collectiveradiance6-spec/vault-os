import { saveSession } from './core/session.js';
import { navigate }    from './core/router.js';

export function handleAuthCallback() {
  const hash  = window.location.hash;
  if (!hash.includes('token=')) return false;
  const token = new URLSearchParams(hash.slice(1)).get('token');
  if (!token) return false;
  saveSession({ token });
  window.history.replaceState(null, '', '/');
  return true;
}
