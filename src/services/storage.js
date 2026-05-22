import { getState, setState } from '../core/state.js';

const KEYS = {
  vault: 'vault_os_v3',
  log: 'vault_os_v3_log',
  settings: 'vault_os_v3_settings',
};

const enc = d => {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(d))));
  } catch {
    return JSON.stringify(d);
  }
};

const dec = r => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(r))));
  } catch {
    try {
      return JSON.parse(r);
    } catch {
      return null;
    }
  }
};

const save = (k, d) => {
  try {
    localStorage.setItem(k, enc(d));
  } catch {}
};

const load = k => {
  const r = localStorage.getItem(k);
  return r ? dec(r) : null;
};

export const saveVault = entries => save(KEYS.vault, entries);
export const loadVault = () => load(KEYS.vault);
export const saveLog = log => save(KEYS.log, log.slice(0, 80));
export const loadLog = () => load(KEYS.log) ?? [];
export const saveSettings = settings => save(KEYS.settings, settings);
export const loadSettings = () => load(KEYS.settings);
export const clearAll = () => Object.values(KEYS).forEach(k => localStorage.removeItem(k));

export function exportJSON(entries, log) {
  const blob = new Blob(
    [JSON.stringify({ version: 3, exported: new Date().toISOString(), entries, log: log.slice(0, 50) }, null, 2)],
    { type: 'application/json' }
  );
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `vault_export_${Date.now()}.json`,
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export async function loadPersistedState() {
  const vault = loadVault();
  const log = loadLog();
  const settings = loadSettings();

  if (vault || log || settings) {
    setState({
      entries: vault ?? [],
      activityLog: log ?? [],
      settings: { ...getState('settings'), ...settings },
    });
  }
}
