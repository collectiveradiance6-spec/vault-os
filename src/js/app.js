// ─────────────────────────────────────────────────────────────────────────────
// src/js/app.js — Vault OS bootstrap / orchestration
// Everything wires together here. No globals, no window.* hacks.
// ─────────────────────────────────────────────────────────────────────────────

import { setState }            from './core/state.js';
import { isMobile }            from './core/performance.js';
import { initParticles }       from './core/particles.js';
import { mountFluidBg }        from './ui/fluid-bg.js';
import { mountClock }          from './ui/clock.js';
import { mountToast }          from './ui/toast.js';
import { mountSearch }         from './ui/search.js';
import { mountTabs, switchTab } from './ui/tabs.js';
import { renderFilters }       from './ui/filters.js';
import { renderCards }         from './components/cards.js';
import { mountPanel }          from './components/panel.js';
import { mountModal, openAddModal } from './components/modal.js';
import { mountLockscreen }     from './components/lockscreen.js';

import { loadVault, loadLog, loadSettings } from './services/storage.js';
import { setEntries, addLog }  from './services/vault.js';
import { DEFAULT_ENTRIES, DEFAULT_LOG, DEFAULT_SETTINGS } from './data/defaults.js';

export function initApp() {
  // ── 1. Hydrate state from localStorage ─────────────────────────────────────
  const storedEntries  = loadVault();
  const storedLog      = loadLog();
  const storedSettings = loadSettings();

  setState({
    settings:    { ...DEFAULT_SETTINGS, ...(storedSettings ?? {}) },
    activityLog: storedLog.length ? storedLog : DEFAULT_LOG,
  });

  setEntries(storedEntries ?? DEFAULT_ENTRIES);

  if (!storedEntries) {
    addLog('First launch — seed data loaded', 'ok');
  }

  // ── 2. Mount UI ─────────────────────────────────────────────────────────────
  mountClock();
  mountToast();
  mountFluidBg();
  mountLockscreen();
  mountPanel();
  mountModal();
  mountSearch();
  mountTabs();

  // ── 3. Initial render ───────────────────────────────────────────────────────
  switchTab('creds');   // sets display:flex on #tabCreds
  renderFilters();
  renderCards();

  // ── 4. Background FX ────────────────────────────────────────────────────────
  if (!isMobile() && (storedSettings?.particles ?? true)) {
    requestAnimationFrame(() => initParticles());
  }

  // ── 5. Wire header buttons ──────────────────────────────────────────────────
  document.getElementById('addBtn')?.addEventListener('click', openAddModal);
}
