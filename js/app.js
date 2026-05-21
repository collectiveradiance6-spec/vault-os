import { loadVault } from './storage.js';
import { setEntries } from './vault.js';
import { filterCards } from './search.js';
import { initUI } from './ui/ui.js';
import { safeParticles } from './core/performance.js';

safeParticles(initParticles);

export function initApp() {
  console.log('[Vault OS] init');

  const data = loadVault();
  setEntries(data);

  initUI();

  // performance-safe loading
  requestAnimationFrame(() => {
  safeParticles(initParticles);
    if (!/Mobi|Android/i.test(navigator.userAgent)) {
      initParticles();
    }
  });

  window.filterCards = filterCards;
}