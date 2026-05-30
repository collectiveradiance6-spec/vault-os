import { getState, setState } from '../core/state.js';
import { saveVault, saveLog } from './storage.js';

const ICONS = ['🔑','🛡','🔐','⚡','🌐','🎯','💎','🚀','🔥','🌊','⚙️','📡','💬','🖥','☁️','🐙'];
export { ICONS };

export function addLog(text, type = 'ok') {
  const entry = { text, type, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ts: Date.now() };
  const log = [entry, ...getState('activityLog')].slice(0, 80);
  setState({ activityLog: log });
  saveLog(log);
}

export const getEntry = id => getState('entries').find(e => e.id === id) ?? null;

export function getFilteredEntries() {
  const q = getState('searchQuery').toLowerCase();
  const filter = getState('activeFilter');
  return getState('entries')
    .filter(e => {
      const mc = filter === 'All' || e.cat === filter;
      const mq = !q || e.t.toLowerCase().includes(q) || e.cat.toLowerCase().includes(q)
        || (e.notes ?? '').toLowerCase().includes(q)
        || (e.tags ?? []).join(' ').toLowerCase().includes(q)
        || (e.user ?? '').toLowerCase().includes(q);
      return mc && mq;
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
}

export const getCategories = () => ['All', ...new Set(getState('entries').map(e => e.cat))];

export function getStats() {
  const entries = getState('entries');
  return {
    total: entries.length, active: entries.filter(e => e.status === 'active').length,
    pinned: entries.filter(e => e.pinned).length, pending: entries.filter(e => e.status === 'pending').length,
  };
}

export function addEntry(data) {
  const entry = normalise({ ...data, id: crypto.randomUUID() });
  const entries = [...getState('entries'), entry];
  setState({ entries }); saveVault(entries);
  addLog(`Added: ${entry.t}`, 'ok'); return entry;
}

export function updateEntry(id, patch) {
  const entries = getState('entries').map(e => e.id === id ? normalise({ ...e, ...patch }) : e);
  setState({ entries }); saveVault(entries);
  addLog(`Updated: ${entries.find(e => e.id === id)?.t ?? id}`, 'ok');
}

export function touchEntry(id) {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const entries = getState('entries').map(e => e.id === id ? { ...e, lastUsed: now } : e);
  setState({ entries }); saveVault(entries);
}

export function togglePin(id) {
  const e = getEntry(id); if (!e) return;
  updateEntry(id, { pinned: !e.pinned });
  addLog(`${e.pinned ? 'Unpinned' : 'Pinned'}: ${e.t}`, 'ok');
}

export function deleteEntry(id) {
  const e = getEntry(id); if (!e) return;
  const entries = getState('entries').filter(x => x.id !== id);
  setState({ entries }); saveVault(entries);
  addLog(`Deleted: ${e.t}`, 'warn');
}

export function setEntries(entries) {
  const normed = entries.map(normalise);
  setState({ entries: normed }); saveVault(normed);
}

export function nukeAll() {
  setState({ entries: [], activityLog: [] });
  saveVault([]); saveLog([]);
  addLog('All data cleared', 'err');
}

function normalise(e) {
  return {
    id: e.id ?? crypto.randomUUID(), t: e.t ?? 'Untitled', cat: e.cat ?? 'General',
    icon: e.icon ?? '🔑', status: ['active','inactive','pending'].includes(e.status) ? e.status : 'active',
    user: e.user ?? '', pass: e.pass ?? '', url: e.url ?? '', notes: e.notes ?? '',
    tags: Array.isArray(e.tags) ? e.tags : [], pinned: Boolean(e.pinned),
    created: e.created ?? new Date().toLocaleDateString(), lastUsed: e.lastUsed ?? 'Never',
  };
}
