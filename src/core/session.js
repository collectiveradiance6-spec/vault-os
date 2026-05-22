const KEY = 'vault_os_session';
const TTL = 8 * 3600 * 1000;

export function loadSession() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (Date.now() - s.storedAt > TTL) { clearSession(); return null; }
    return s;
  } catch { return null; }
}

export function saveSession(data) {
  try { sessionStorage.setItem(KEY, JSON.stringify({ ...data, storedAt: Date.now() })); }
  catch { console.warn('[Session] persist failed'); }
}

export function clearSession() { sessionStorage.removeItem(KEY); }
