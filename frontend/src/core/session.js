const KEY = 'vault_os_session';
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8h matches backend JWT

export function loadSession() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (Date.now() - s.storedAt > TOKEN_TTL_MS) {
      clearSession();
      return null;
    }
    return s;
  } catch { return null; }
}

export function saveSession(data) {
  try { sessionStorage.setItem(KEY, JSON.stringify({ ...data, storedAt: Date.now() })); }
  catch { console.warn('[Session] Failed to persist'); }
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
}
