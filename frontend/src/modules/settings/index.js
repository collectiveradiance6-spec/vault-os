import { getViewport } from '../../ui/ui.js';
import { getState, setState } from '../../core/state.js';

const KEY = 'vault_os_settings';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = s => localStorage.setItem(KEY, JSON.stringify(s));

export function mount() {
  const saved = load();
  getViewport().innerHTML = `
    <div id="settings-panel">
      <div class="dash-header">
        <h2 class="dash-title">SETTINGS</h2>
      </div>
      <div class="settings-grid">
        <div class="settings-row">
          <label class="settings-label">THEME</label>
          <select id="set-theme" class="settings-select">
            <option value="dark"  ${saved.theme === 'dark'  ? 'selected' : ''}>DARK</option>
            <option value="dim"   ${saved.theme === 'dim'   ? 'selected' : ''}>DIM</option>
            <option value="abyss" ${saved.theme === 'abyss' ? 'selected' : ''}>ABYSS</option>
          </select>
        </div>
        <div class="settings-row">
          <label class="settings-label">PARTICLES</label>
          <input type="checkbox" id="set-particles" class="settings-toggle" ${saved.particles !== false ? 'checked' : ''} />
        </div>
        <div class="settings-row">
          <label class="settings-label">SCANLINES</label>
          <input type="checkbox" id="set-scanlines" class="settings-toggle" ${saved.scanlines ? 'checked' : ''} />
        </div>
        <div class="settings-row">
          <label class="settings-label">AUTO-LOCK (minutes)</label>
          <input type="number" id="set-autolock" class="settings-input-sm" value="${saved.autoLock ?? 30}" min="5" max="480" />
        </div>
        <button id="btn-save" class="btn-primary">SAVE SETTINGS</button>
        <p id="save-confirm" class="settings-confirm hidden">SAVED ✓</p>
      </div>
    </div>`;

  document.getElementById('btn-save').addEventListener('click', () => {
    const s = {
      theme:     document.getElementById('set-theme').value,
      particles: document.getElementById('set-particles').checked,
      scanlines: document.getElementById('set-scanlines').checked,
      autoLock:  parseInt(document.getElementById('set-autolock').value) || 30,
    };
    save(s);
    setState('theme', s.theme);
    document.documentElement.dataset.theme = s.theme;
    document.body.classList.toggle('scanlines', s.scanlines);
    const c = document.getElementById('save-confirm');
    c.classList.remove('hidden');
    setTimeout(() => c?.classList.add('hidden'), 2000);
  });
}
