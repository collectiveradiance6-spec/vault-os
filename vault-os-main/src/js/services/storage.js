// ─────────────────────────────────────────────────────────────────────────────
// src/js/services/storage.js — Vault OS persistent storage
// All vault data lives here. Uses btoa/atob as a light obfuscation layer so
// credentials aren't plaintext in DevTools → Application → localStorage.
// ─────────────────────────────────────────────────────────────────────────────

const KEYS = {
  vault:    'vault_os_v3_entries',
  log:      'vault_os_v3_log',
  settings: 'vault_os_v3_settings',
};

// ── Obfuscation (NOT cryptographic — just keeps DevTools from showing raw PWs)
function encode(data) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(data)))); }
  catch { return JSON.stringify(data); }
}

function decode(raw) {
  try { return JSON.parse(decodeURIComponent(escape(atob(raw)))); }
  catch {
    try { return JSON.parse(raw); }  // fallback: plain JSON (migration)
    catch { return null; }
  }
}

// ── Generic helpers ───────────────────────────────────────────────────────────
function persist(key, data) {
  try { localStorage.setItem(key, encode(data)); }
  catch (e) { console.warn('[Storage] write failed:', e); }
}

function retrieve(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return decode(raw);
}

// ── Vault entries ─────────────────────────────────────────────────────────────
export function saveVault(entries) {
  persist(KEYS.vault, entries);
}

export function loadVault() {
  return retrieve(KEYS.vault);
}

// ── Activity log ──────────────────────────────────────────────────────────────
export function saveLog(log) {
  persist(KEYS.log, log.slice(0, 80));
}

export function loadLog() {
  return retrieve(KEYS.log) ?? [];
}

// ── Settings ──────────────────────────────────────────────────────────────────
export function saveSettings(settings) {
  persist(KEYS.settings, settings);
}

export function loadSettings() {
  return retrieve(KEYS.settings);
}

// ── Full export (plain JSON for user download) ────────────────────────────────
export function exportJSON(entries, log) {
  const payload = {
    version: 3,
    exported: new Date().toISOString(),
    entries,
    log: log.slice(0, 50),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `vault_os_export_${Date.now()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// ── Import from JSON file ─────────────────────────────────────────────────────
export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch { reject(new Error('Invalid JSON')); }
    };
    reader.onerror = () => reject(new Error('Read failed'));
    reader.readAsText(file);
  });
}

// ── Nuke everything ───────────────────────────────────────────────────────────
export function clearAll() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
