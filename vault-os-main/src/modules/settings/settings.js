import { getState, setState } from '../../core/state.js';
import { loadPersistedState } from '../../services/storage.js';
import { lock } from '../lockscreen/lockscreen.js';

export function renderSettings(root) {
  const { theme } = getState();
  root.innerHTML = `
    <section class="settings-panel">
      <h2>Settings</h2>
      <label>
        Theme
        <select id="themeSelect">
          <option value="default" ${theme === 'default' ? 'selected' : ''}>Default</option>
          <option value="red"     ${theme === 'red'     ? 'selected' : ''}>Red</option>
          <option value="blue"    ${theme === 'blue'    ? 'selected' : ''}>Blue</option>
        </select>
      </label>
      <button type="button" id="lockNowBtn" class="btn">Lock vault</button>
    </section>
  `;
  document.getElementById('themeSelect')?.addEventListener('change', e => setState({ theme: e.target.value }));
  document.getElementById('lockNowBtn')?.addEventListener('click', () => lock());
}

export function bootSettings() {}