const VAULT_KEY = 'vault_os_data';

export function loadVault() {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVault(entries) {
  try {
    localStorage.setItem(VAULT_KEY, JSON.stringify(entries));
  } catch {
    console.error('[Storage] Failed to save vault');
  }
}

export function clearVault() {
  localStorage.removeItem(VAULT_KEY);
}
