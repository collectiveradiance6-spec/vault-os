import { describe, it, expect, beforeEach } from 'vitest';
import {
  getState,
  setState,
  set,
  replaceState,
  subscribe,
} from '../src/core/state.js';
import { DEFAULT_STATE } from '../src/data/defaults.js';

describe('state', () => {
  beforeEach(() => {
    replaceState(structuredClone(DEFAULT_STATE));
  });

  it('getState returns current snapshot', () => {
    expect(getState().locked).toBe(true);
    expect(getState().activeModule).toBe('dashboard');
  });

  it('setState merges partial updates', () => {
    setState({ locked: false, theme: 'red' });
    expect(getState().locked).toBe(false);
    expect(getState().theme).toBe('red');
    expect(getState().activeModule).toBe('dashboard');
  });

  it('set updates a single key', () => {
    set('activeModule', 'settings');
    expect(getState().activeModule).toBe('settings');
  });

  it('subscribe receives initial and subsequent updates', () => {
    const seen = [];
    const unsub = subscribe((s) => seen.push(s.activeModule));
    set('activeModule', 'admin');
    unsub();
    set('activeModule', 'dashboard');
    expect(seen).toEqual(['dashboard', 'admin']);
  });
});
