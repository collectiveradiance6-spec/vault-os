import { getViewport } from '../../ui/ui.js';
import { getState } from '../../core/state.js';
import { getEntries, clearVault } from '../../services/storage.js';
import { openModal } from '../../ui/modal.js';

export function mount() {
  const vp = getViewport();
  const user = getState('user');

  vp.innerHTML = `
    <div id="admin-panel">
      <div class="dash-header">
        <h2 class="dash-title">ADMIN CONTROL</h2>
        <span class="dash-meta role-badge">${user?.role?.toUpperCase()}</span>
      </div>
      <div class="admin-grid">
        <div class="admin-card">
          <div class="admin-card-title">VAULT STATS</div>
          <div class="admin-stat" id="stat-entries">— entries</div>
        </div>
        <div class="admin-card danger-zone">
          <div class="admin-card-title">DANGER ZONE</div>
          <button id="btn-wipe" class="btn-danger">WIPE VAULT DATA</button>
        </div>
        <div class="admin-card">
          <div class="admin-card-title">SESSION</div>
          <div class="admin-stat" id="stat-session">—</div>
        </div>
        <div class="admin-card">
          <div class="admin-card-title">EXPORT</div>
          <button id="btn-export" class="btn-primary">EXPORT JSON</button>
        </div>
      </div>
    </div>
  `;

  // Populate stats
  import('../../services/vault.js').then(({ getEntries }) => {
    document.getElementById('stat-entries').textContent = `${getEntries().length} entries`;
  });

  const session = getState('session');
  if (session?.expires) {
    const remaining = Math.round((session.expires - Date.now()) / 60000);
    document.getElementById('stat-session').textContent = `${remaining}m remaining`;
  }

  document.getElementById('btn-wipe').addEventListener('click', () => {
    openModal('WIPE ALL VAULT DATA? This cannot be undone.', () => {
      clearVault();
      location.reload();
    });
  });

  document.getElementById('btn-export').addEventListener('click', async () => {
    const { getEntries } = await import('../../services/vault.js');
    const blob = new Blob([JSON.stringify(getEntries(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vault_export_${Date.now()}.json`;
    a.click();
  });
}
