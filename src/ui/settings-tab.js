// ─────────────────────────────────────────────────────────────────────────────
// src/js/ui/settings-tab.js — Settings tab
// ─────────────────────────────────────────────────────────────────────────────

import { state, setState } from '../core/state.js';
import { saveSettings, exportJSON, clearAll } from '../services/storage.js';
import { nukeAll } from '../services/vault.js';
import { startParticles, stopParticles } from '../core/particles.js';
import { showToast } from './toast.js';
import { renderCards } from '../components/cards.js';
import { renderFilters } from './filters.js';

export function renderSettings() {
  const el = document.getElementById('tabSettings');
  if (!el) return;

  const s = state.settings;

  el.innerHTML = `
    <div class="settings-section">
      <div class="settings-title">Security</div>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">Mask credentials</div>
          <div class="setting-desc">Blur passwords by default in detail view</div>
        </div>
        <button class="toggle${s.mask ? ' on' : ''}" data-setting="mask"></button>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">Auto-lock</div>
          <div class="setting-desc">Re-lock after 5 minutes of inactivity</div>
        </div>
        <button class="toggle${s.autoLock ? ' on' : ''}" data-setting="autoLock"></button>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">Clipboard clear</div>
          <div class="setting-desc">Wipe clipboard 30s after copy</div>
        </div>
        <button class="toggle${s.clipboardClear ? ' on' : ''}" data-setting="clipboardClear"></button>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-title">Display</div>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">Particle field</div>
          <div class="setting-desc">Animated canvas background</div>
        </div>
        <button class="toggle${s.particles ? ' on' : ''}" data-setting="particles"></button>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">Scanlines</div>
          <div class="setting-desc">CRT overlay effect</div>
        </div>
        <button class="toggle${s.scanlines ? ' on' : ''}" data-setting="scanlines"></button>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-title">Data</div>

      <div class="setting-row clickable" id="exportBtn">
        <div class="setting-info">
          <div class="setting-name">Export vault</div>
          <div class="setting-desc">Download all credentials as JSON</div>
        </div>
        <span class="setting-arrow">→</span>
      </div>

      <div class="setting-row clickable" id="clearBtn">
        <div class="setting-info">
          <div class="setting-name danger-text">Clear all data</div>
          <div class="setting-desc">Permanently delete all credentials</div>
        </div>
        <span class="setting-arrow danger-text">✕</span>
      </div>
    </div>

    <div class="settings-footer">Vault OS v3.0.0 · Local-only · No cloud sync</div>
  `;

  // toggle buttons
  el.querySelectorAll('.toggle[data-setting]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.setting;
      const next = { ...state.settings, [key]: !state.settings[key] };
      setState({ settings: next });
      saveSettings(next);
      btn.classList.toggle('on', next[key]);

      // side effects
      if (key === 'particles') next.particles ? startParticles() : stopParticles();
      if (key === 'scanlines') {
        const sc = document.querySelector('.scanlines');
        if (sc) sc.style.opacity = next.scanlines ? '.5' : '0';
      }
    });
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    exportJSON(state.entries, state.activityLog);
    showToast('Vault exported!');
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    if (!confirm('Delete ALL credentials? This cannot be undone.')) return;
    nukeAll();
    clearAll();
    renderFilters();
    renderCards();
    showToast('All data cleared');
  });
}
