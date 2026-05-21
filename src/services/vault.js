import { loadVault, saveVault } from './storage.js';

let _entries = [];

export function initVault() {
  _entries = loadVault();
}

export function getEntries() {
  return [..._entries];
}

export function addEntry(entry) {
  const newEntry = { ...entry, id: crypto.randomUUID(), createdAt: Date.now() };
  _entries.push(newEntry);
  saveVault(_entries);
  return newEntry;
}

export function updateEntry(id, patch) {
  const idx = _entries.findIndex(e => e.id === id);
  if (idx === -1) return null;
  _entries[idx] = { ..._entries[idx], ...patch, updatedAt: Date.now() };
  saveVault(_entries);
  return _entries[idx];
}

export function deleteEntry(id) {
  const before = _entries.length;
  _entries = _entries.filter(e => e.id !== id);
  if (_entries.length < before) saveVault(_entries);
  return _entries.length < before;
}

export function searchEntries(query) {
  const q = query.toLowerCase();
  return _entries.filter(e =>
    e.name?.toLowerCase().includes(q) ||
    e.category?.toLowerCase().includes(q) ||
    e.tags?.some(t => t.toLowerCase().includes(q))
  );
}
