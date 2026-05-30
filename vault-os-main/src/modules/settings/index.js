import { getViewport } from '../../ui/ui.js';
import { getState, setState } from '../../core/state.js';

const SETTINGS_KEY = 'vault_os_settings';

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch { return {}; }
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function mount() {
  const vp = getViewport();
  const saved = loadSettings();

  vp.innerHTML = `
    <div id="settings-panel">
      <div class="dash-header">
        <h2 class="dash-title">SETTINGS</h2>
      </div>
      <div class="settings-grid">
        <div class="settings-row">
          <div class="settings-label">THEME</div>
          <div class="settings-control">
            <button class="btn-seg ${saved.theme !== 'light' ? 'active' : ''}" data-theme="dark">DARK</button>
            <button class="btn-seg ${saved.theme === 'light' ? 'active' : ''}" data-theme="light">LIGHT</button>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-label">PARTICLES</div>
          <label class="toggle">
            <input type="checkbox" id="toggle-particles" ${saved.particles !== false ? 'checked' : ''} />
            <span class="toggle-track"></span>
          </label>
        </div>
        <div class="settings-row">
          <div class="settings-label">SCANLINES</div>
          <label class="toggle">
            <input type="checkbox" id="toggle-scanlines" ${saved.scanlines !== false ? 'checked' : ''} />
            <span class="toggle-track"></span>
          </label>
        </div>
        <div class="settings-row">
          <div class="settings-label">MASK PASSWORDS</div>
          <label class="toggle">
            <input type="checkbox" id="toggle-mask" ${saved.mask !== false ? 'checked' : ''} />
            <span class="toggle-track"></span>
          </label>
        </div>
        <div class="settings-row">
          <div class="settings-label">VERSION</div>
          <div class="settings-value">VAULT OS v1.0.0</div>
        </div>
      </div>
    </div>
  `;

  vp.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      vp.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.documentElement.setAttribute('data-theme', theme);
      setState('theme', theme);
      saveSettings({ ...loadSettings(), theme });
    });
  });

  ['particles', 'scanlines', 'mask'].forEach(key => {
    document.getElementById(`toggle-${key}`)?.addEventListener('change', e => {
      saveSettings({ ...loadSettings(), [key]: e.target.checked });
      if (key === 'scanlines') {
        document.getElementById('vault-shell')?.classList.toggle('scanlines', e.target.checked);
      }
    });
  });
}
