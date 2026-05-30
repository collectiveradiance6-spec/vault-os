import { exportJSON } from '../../services/storage.js';
import { getState } from '../../core/state.js';

export function renderAdmin(root) {
  root.innerHTML = `
    <section class="admin-panel">
      <h2>Admin</h2>
      <p>Local vault tools.</p>
      <button type="button" id="exportVaultBtn" class="btn">Export backup</button>
    </section>
  `;
  document.getElementById('exportVaultBtn')?.addEventListener('click', () => {
    const { entries, activityLog } = getState();
    exportJSON(entries, activityLog);
  });
}

export function bootAdmin() {}