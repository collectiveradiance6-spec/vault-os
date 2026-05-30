// ─────────────────────────────────────────────────────────────────────────────
// src/js/services/vault.js — Vault OS CRUD layer
// All mutations go through here so state + storage always stay in sync.
// ─────────────────────────────────────────────────────────────────────────────

import { state, setState } from '../core/state.js';
import { saveVault, saveLog } from './storage.js';

// ── Logging ───────────────────────────────────────────────────────────────────
export function addLog(text, type = 'ok') {
  const entry = {
    text,
    type,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ts: Date.now(),
  };
  const log = [entry, ...state.activityLog].slice(0, 80);
  setState({ activityLog: log });
  saveLog(log);
}

// ── Read ──────────────────────────────────────────────────────────────────────
export function getEntry(id) {
  return state.entries.find(e => e.id === id) ?? null;
}

export function getFilteredEntries() {
  const q = state.searchQuery.toLowerCase();
  const filter = state.activeFilter;

  return state.entries
    .filter(e => {
      const matchCat  = filter === 'All' || e.cat === filter;
      const matchQ    = !q
        || e.t.toLowerCase().includes(q)
        || e.cat.toLowerCase().includes(q)
        || (e.notes ?? '').toLowerCase().includes(q)
        || (e.tags ?? []).join(' ').toLowerCase().includes(q)
        || (e.user ?? '').toLowerCase().includes(q);
      return matchCat && matchQ;
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
}

export function getCategories() {
  return ['All', ...new Set(state.entries.map(e => e.cat))];
}

export function getStats() {
  const { entries } = state;
  return {
    total:   entries.length,
    active:  entries.filter(e => e.status === 'active').length,
    pinned:  entries.filter(e => e.pinned).length,
    pending: entries.filter(e => e.status === 'pending').length,
  };
}

// ── Create ────────────────────────────────────────────────────────────────────
export function addEntry(data) {
  const entry = normalise({ ...data, id: crypto.randomUUID() });
  const entries = [...state.entries, entry];
  setState({ entries });
  saveVault(entries);
  addLog(`Added: ${entry.t}`, 'ok');
  return entry;
}

// ── Update ────────────────────────────────────────────────────────────────────
export function updateEntry(id, patch) {
  const entries = state.entries.map(e =>
    e.id === id ? normalise({ ...e, ...patch }) : e
  );
  setState({ entries });
  saveVault(entries);
  const updated = entries.find(e => e.id === id);
  addLog(`Updated: ${updated?.t ?? id}`, 'ok');
  return updated ?? null;
}

export function touchEntry(id) {
  // Update lastUsed without triggering a full log event
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const entries = state.entries.map(e =>
    e.id === id ? { ...e, lastUsed: now } : e
  );
  setState({ entries });
  saveVault(entries);
}

export function togglePin(id) {
  const entry = getEntry(id);
  if (!entry) return;
  updateEntry(id, { pinned: !entry.pinned });
  addLog(`${entry.pinned ? 'Unpinned' : 'Pinned'}: ${entry.t}`, 'ok');
}

// ── Delete ────────────────────────────────────────────────────────────────────
export function deleteEntry(id) {
  const entry = getEntry(id);
  if (!entry) return false;
  const entries = state.entries.filter(e => e.id !== id);
  setState({ entries });
  saveVault(entries);
  addLog(`Deleted: ${entry.t}`, 'warn');
  return true;
}

// ── Bulk ──────────────────────────────────────────────────────────────────────
export function setEntries(entries) {
  setState({ entries: entries.map(normalise) });
  saveVault(state.entries);
}

export function nukeAll() {
  setState({ entries: [], activityLog: [] });
  saveVault([]);
  saveLog([]);
  addLog('All data cleared', 'err');
}

// ── Internal helpers ──────────────────────────────────────────────────────────
function normalise(e) {
  return {
    id:       e.id ?? crypto.randomUUID(),
    t:        e.t ?? 'Untitled',
    cat:      e.cat ?? 'General',
    icon:     e.icon ?? '🔑',
    status:   ['active','inactive','pending'].includes(e.status) ? e.status : 'active',
    user:     e.user ?? '',
    pass:     e.pass ?? '',
    url:      e.url ?? '',
    notes:    e.notes ?? '',
    tags:     Array.isArray(e.tags) ? e.tags : [],
    pinned:   Boolean(e.pinned),
    created:  e.created ?? new Date().toLocaleDateString(),
    lastUsed: e.lastUsed ?? 'Never',
  };
}
