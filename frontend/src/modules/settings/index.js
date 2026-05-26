import { getViewport }                      from '../../ui/ui.js';
import { getState, setState }               from '../../core/state.js';
import { startParticles, stopParticles }    from '../../ui/particles.js';
import { exportJSON, getStats }             from '../../services/vault.js';
import { showToast }                        from '../../ui/toast.js';
import { logout }                           from '../../core/auth.js';
import { navigate }                         from '../../core/router.js';

const SKEY = 'vault_os_settings';
const load = () => { try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch { return {}; } };
const save = s => localStorage.setItem(SKEY, JSON.stringify(s));

export function mount() {
  const saved = load();
  const stats = getStats();
  const user  = getState('user');

  getViewport().innerHTML = `
    <div id="settings-panel">
      <div class="dash-header">
        <h2 class="dash-title">SETTINGS</h2>
        <span class="dash-meta">${user?.username?.toUpperCase() ?? ''}</span>
      </div>
      <div class="settings-grid">

        <div class="settings-title-row">APPEARANCE</div>

        <div class="settings-row">
          <div class="setting-info">
            <div class="setting-name">Theme</div>
            <div class="setting-desc">Interface color scheme</div>
          </div>
          <select id="set-theme" class="settings-select">
            <option value="dark"  ${saved.theme !== 'dim' && saved.theme !== 'abyss' ? 'selected':''}>Dark</option>
            <option value="dim"   ${saved.theme === 'dim'   ? 'selected':''}>Dim</option>
            <option value="abyss" ${saved.theme === 'abyss' ? 'selected':''}>Abyss</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="setting-info">
            <div class="setting-name">Particle field</div>
            <div class="setting-desc">Animated canvas background</div>
          </div>
          <button class="toggle${saved.particles !== false ? ' on':''}" data-key="particles"></button>
        </div>

        <div class="settings-row">
          <div class="setting-info">
            <div class="setting-name">Scanlines</div>
            <div class="setting-desc">CRT overlay effect</div>
          </div>
          <button class="toggle${saved.scanlines ? ' on':''}" data-key="scanlines"></button>
        </div>

        <div class="settings-title-row" style="margin-top:10px">SECURITY</div>

        <div class="settings-row">
          <div class="setting-info">
            <div class="setting-name">Mask credentials</div>
            <div class="setting-desc">Blur passwords in detail view by default</div>
          </div>
          <button class="toggle${saved.maskCredentials !== false ? ' on':''}" data-key="maskCredentials"></button>
        </div>

        <div class="settings-row">
          <div class="setting-info">
            <div class="setting-name">Auto-lock (minutes)</div>
            <div class="setting-desc">Re-lock session after inactivity</div>
          </div>
          <input type="number" id="set-autolock" class="settings-input-sm"
            value="${saved.autoLock ?? 30}" min="5" max="480"/>
        </div>

        <div class="settings-title-row" style="margin-top:10px">DATA</div>

        <div class="settings-row clickable" id="btn-export-set">
          <div class="setting-info">
            <div class="setting-name">Export vault</div>
            <div class="setting-desc">${stats.total} entries as JSON</div>
          </div>
          <span style="font-size:16px;opacity:.5">→</span>
        </div>

        <div class="settings-title-row" style="margin-top:10px">SESSION</div>

        <div class="settings-row clickable" id="btn-logout-set">
          <div class="setting-info">
            <div class="setting-name" style="color:var(--danger)">Sign out</div>
            <div class="setting-desc">End current Discord session</div>
          </div>
          <span style="font-size:16px;opacity:.5;color:var(--danger)">→</span>
        </div>

        <div style="display:flex;gap:.75rem;margin-top:8px">
          <button id="btn-save" class="btn-primary">SAVE SETTINGS</button>
          <span id="save-confirm" class="settings-confirm hidden">SAVED ✓</span>
        </div>
      </div>
      <div class="settings-footer">VAULT OS v3.0 · LOCAL STORAGE · DISCORD OAUTH</div>
    </div>`;

  // Toggles
  document.getElementById('settings-panel').querySelectorAll('.toggle[data-key]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('on');
      const k = btn.dataset.key, val = btn.classList.contains('on');
      save({ ...load(), [k]: val });
      if (k === 'particles') val ? startParticles() : stopParticles();
      if (k === 'scanlines') document.body.classList.toggle('scanlines', val);
    });
  });

  document.getElementById('btn-save').addEventListener('click', () => {
    const theme    = document.getElementById('set-theme').value;
    const autoLock = parseInt(document.getElementById('set-autolock').value) || 30;
    save({ ...load(), theme, autoLock });
    setState('theme', theme);
    document.documentElement.dataset.theme = theme;
    const c = document.getElementById('save-confirm');
    c.classList.remove('hidden');
    showToast('Settings saved');
    setTimeout(() => c?.classList.add('hidden'), 2000);
  });

  document.getElementById('btn-export-set').addEventListener('click', () => {
    exportJSON(); showToast('Vault exported!');
  });

  document.getElementById('btn-logout-set').addEventListener('click', async () => {
    await logout(); navigate('lockscreen');
  });
}
