import { describe, it, expect } from 'vitest';
import {
  isApiConfigured,
  fetchVault,
  pushVault,
  tryRemoteSync,
} from '../src/services/api.js';

describe('api stub', () => {
  it('is not configured without VITE_API_BASE_URL', () => {
    expect(isApiConfigured()).toBe(false);
  });

  it('fetchVault returns stub reason when unconfigured', async () => {
    const result = await fetchVault();
    expect(result).toEqual({ ok: false, reason: 'api-stub' });
  });

  it('pushVault returns stub reason when unconfigured', async () => {
    const result = await pushVault([]);
    expect(result).toEqual({ ok: false, reason: 'api-stub' });
  });

  it('tryRemoteSync resolves without throwing', async () => {
    await expect(tryRemoteSync()).resolves.toMatchObject({
      ok: false,
      reason: 'api-stub',
    });
  });
});
