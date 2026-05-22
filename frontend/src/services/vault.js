import { loadVault, saveVault } from './storage.js';

let _entries = [];

export const initVault = () => { _entries = loadVault(); };
export const getEntries = () => [..._entries];

export function addEntry(e) {
  const entry = { ...e, id: crypto.randomUUID(), createdAt: Date.now() };
  _entries.push(entry);
  saveVault(_entries);
  return entry;
}

export function updateEntry(id, patch) {
  const i = _entries.findIndex(e => e.id === id);
  if (i === -1) return null;
  _entries[i] = { ..._entries[i], ...patch, updatedAt: Date.now() };
  saveVault(_entries);
  return _entries[i];
}

export function deleteEntry(id) {
  _entries = _entries.filter(e => e.id !== id);
  saveVault(_entries);
}

export function searchEntries(q) {
  const s = q.toLowerCase();
  return _entries.filter(e =>
    e.name?.toLowerCase().includes(s) ||
    e.category?.toLowerCase().includes(s) ||
    e.tags?.some(t => t.toLowerCase().includes(s))
  );
}
