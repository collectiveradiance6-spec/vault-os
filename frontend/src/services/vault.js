import { loadVault, saveVault } from './storage.js';

let _entries = [];

export const initVault  = () => { _entries = loadVault(); };
export const getEntries = () => [..._entries];

export function addEntry(raw) {
  const entry = normalise({ ...raw, id: crypto.randomUUID(), createdAt: Date.now() });
  _entries.push(entry);
  saveVault(_entries);
  return entry;
}

export function updateEntry(id, patch) {
  const i = _entries.findIndex(e => e.id === id);
  if (i === -1) return null;
  _entries[i] = normalise({ ..._entries[i], ...patch, updatedAt: Date.now() });
  saveVault(_entries);
  return _entries[i];
}

export function deleteEntry(id) {
  _entries = _entries.filter(e => e.id !== id);
  saveVault(_entries);
}

export function togglePin(id) {
  const e = _entries.find(x => x.id === id);
  if (!e) return;
  updateEntry(id, { pinned: !e.pinned });
}

export function touchEntry(id) {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const i = _entries.findIndex(e => e.id === id);
  if (i === -1) return;
  _entries[i] = { ..._entries[i], lastUsed: now };
  saveVault(_entries);
}

export function searchEntries(q) {
  const s = q.toLowerCase();
  return _entries.filter(e =>
    e.name?.toLowerCase().includes(s) ||
    e.category?.toLowerCase().includes(s) ||
    (e.notes || '').toLowerCase().includes(s) ||
    (e.tags || []).join(' ').toLowerCase().includes(s) ||
    (e.username || '').toLowerCase().includes(s)
  );
}

export function getFilteredEntries(filter = 'All', query = '') {
  let list = query ? searchEntries(query) : getEntries();
  if (filter !== 'All') list = list.filter(e => e.category === filter);
  return list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
}

export function getCategories() {
  return ['All', ...new Set(_entries.map(e => e.category).filter(Boolean))];
}

export function getStats() {
  return {
    total:   _entries.length,
    active:  _entries.filter(e => e.status === 'active').length,
    pinned:  _entries.filter(e => e.pinned).length,
    pending: _entries.filter(e => e.status === 'pending').length,
  };
}

export function exportJSON() {
  const blob = new Blob([JSON.stringify(_entries, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `vault_export_${Date.now()}.json`,
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// ── Normalise raw entry shape ──────────────────────────────────────────────
function normalise(e) {
  return {
    id:        e.id       ?? crypto.randomUUID(),
    name:      e.name     ?? e.t ?? 'Untitled',
    category:  e.category ?? e.cat ?? 'General',
    icon:      e.icon     ?? '⬡',
    status:    ['active','inactive','pending'].includes(e.status) ? e.status : 'active',
    username:  e.username ?? e.user ?? '',
    password:  e.password ?? e.pass ?? '',
    url:       e.url      ?? '',
    notes:     e.notes    ?? '',
    tags:      Array.isArray(e.tags) ? e.tags : [],
    pinned:    Boolean(e.pinned),
    createdAt: e.createdAt ?? Date.now(),
    updatedAt: e.updatedAt ?? null,
    lastUsed:  e.lastUsed  ?? 'Never',
  };
}
