import { exportVaultBackup } from '@services/vault.js';

export function renderAdmin(root) {
  root.innerHTML = `
    <section class="admin-panel">
      <h2>Admin</h2>
      <p>Local vault tools (stabilization stub).</p>
      <button type="button" id="exportVaultBtn" class="btn">Export backup</button>
    </section>
  `;

  document.getElementById('exportVaultBtn')?.addEventListener('click', exportVaultBackup);
}

export function bootAdmin() {}
