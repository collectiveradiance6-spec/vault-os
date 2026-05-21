import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ENTRIES,
  DEFAULT_STATE,
  DEFAULT_SETTINGS,
} from '../src/data/defaults.js';

describe('defaults', () => {
  it('DEFAULT_STATE has required fields', () => {
    expect(DEFAULT_STATE).toMatchObject({
      user: null,
      session: null,
      theme: 'default',
      activeModule: 'dashboard',
      locked: true,
    });
    expect(Array.isArray(DEFAULT_STATE.entries)).toBe(true);
  });

  it('DEFAULT_ENTRIES is non-empty sample data', () => {
    expect(DEFAULT_ENTRIES.length).toBeGreaterThan(0);
    expect(DEFAULT_ENTRIES[0]).toHaveProperty('name');
  });

  it('DEFAULT_SETTINGS toggles exist', () => {
    expect(DEFAULT_SETTINGS).toMatchObject({
      mask: true,
      particles: true,
      scanlines: true,
    });
  });
});
