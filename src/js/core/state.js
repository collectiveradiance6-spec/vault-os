// ─────────────────────────────────────────────────────────────────────────────
// src/js/core/state.js — Vault OS reactive state
// Single source of truth. Import `state` anywhere; mutate via setState().
// ─────────────────────────────────────────────────────────────────────────────

export const state = {
  locked: true,
  entries: [],
  activityLog: [],
  activeTab: 'creds',
  searchQuery: '',
  activeFilter: 'All',
  editingId: null,
  settings: {
    mask: true,
    particles: true,
    scanlines: true,
    autoLock: true,
    clipboardClear: false,
  },
};

const listeners = new Set();

/**
 * Mutate state and notify all subscribers.
 * @param {Partial<typeof state>} patch
 */
export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach(fn => fn(state));
}

/**
 * Subscribe to all state changes.
 * @param {(state: typeof state) => void} fn
 * @returns {() => void} unsubscribe
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
