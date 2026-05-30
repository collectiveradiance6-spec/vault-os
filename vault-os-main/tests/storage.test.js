import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_STATE } from '../src/data/defaults.js';
import { replaceState, getState, setState } from '../src/core/state.js';
import {
  STORAGE_KEY,
  loadPersistedState,
  persistState,
  snapshotFromState,
} from '../src/services/storage.js';

function mockLocalStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, v),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
}

describe('storage', () => {
  beforeEach(() => {
    global.localStorage = mockLocalStorage();
    replaceState(structuredClone(DEFAULT_STATE));
  });

  it('persistState and loadPersistedState round-trip', () => {
    setState({ locked: false, theme: 'blue' });
    persistState();
    replaceState(structuredClone(DEFAULT_STATE));
    loadPersistedState();
    expect(getState().locked).toBe(false);
    expect(getState().theme).toBe('blue');
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
  });

  it('snapshotFromState includes canonical fields', () => {
    const snap = snapshotFromState();
    expect(snap).toHaveProperty('entries');
    expect(snap).toHaveProperty('locked');
    expect(snap).not.toHaveProperty('unknown');
  });
});
