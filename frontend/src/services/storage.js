const KEY = 'vault_os_data';

export const loadVault = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
export const saveVault = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };
export const clearVault = () => localStorage.removeItem(KEY);
