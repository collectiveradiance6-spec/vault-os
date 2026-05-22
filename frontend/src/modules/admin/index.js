import { getViewport } from '../../ui/ui.js';
import { getState } from '../../core/state.js';
import { getEntries } from '../../services/vault.js';
import { clearVault } from '../../services/storage.js';
import { openModal } from '../../ui/modal.js';

export function mount() {
  const user = getState('user');
  const session = getState('session');
  const entries = getEntries();
  const remaining = session?.storedAt
    ? Math.max(0, Math.round((session.storedAt + 8 * 3600000 - Date.now()) / 60000))
    : '—';

  getViewport().innerHTML = `
    <div id="admin-panel">
      <div class="dash-header">
        <h2 class="dash-title">ADMIN CONTROL</h2>
        <span class="role-badge">${user?.role?.toUpperCase()}</span>
      </div>
      <div class="admin-grid">
        <div class="admin-card">
          <div class="admin-card-title">VAULT ENTRIES</div>
          <div class="admin-stat">${entries.length}</div>
        </div>
        <div class="admin-card">
          <div class="admin-card-title">SESSION REMAINING</div>
          <div class="admin-stat">${remaining}m</div>
        </div>
        <div class="admin-card">
          <div class="admin-card-title">DISCORD ID</div>
          <div class="admin-stat" style="font-size:14px">${user?.id || '—'}</div>
        </div>
        <div class="admin-card">
          <div class="admin-card-title">EXPORT</div>
          <button id="btn-export" class="btn-primary" style="margin-top:8px">EXPORT JSON</button>
        </div>
        <div class="admin-card danger-zone">
          <div class="admin-card-title">DANGER ZONE</div>
          <button id="btn-wipe" class="btn-danger" style="margin-top:8px">WIPE VAULT DATA</button>
        </div>
      </div>
    </div>`;

  document.getElementById('btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(getEntries(), null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `vault_export_${Date.now()}.json`,
    });
    a.click();
  });

  document.getElementById('btn-wipe').addEventListener('click', () =>
    openModal('WIPE ALL VAULT DATA? This cannot be undone.', () => { clearVault(); location.reload(); }));
}
