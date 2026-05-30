import { getViewport }                      from '../../ui/ui.js';
import { getState }                         from '../../core/state.js';
import { getEntries, getStats, exportJSON } from '../../services/vault.js';
import { clearVault }                       from '../../services/storage.js';
import { openModal }                        from '../../ui/modal.js';
import { showToast }                        from '../../ui/toast.js';

const API  = import.meta.env.VITE_API_URL;
const SKEY = 'vault_os_session';
const tok  = () => JSON.parse(sessionStorage.getItem(SKEY) || 'null')?.token;
const auth = () => ({ Authorization: `Bearer ${tok()}` });

export async function mount() {
  const user    = getState('user');
  const stats   = getStats();
  const session = getState('session');
  const remaining = session?.storedAt
    ? Math.max(0, Math.round((session.storedAt + 8 * 3600000 - Date.now()) / 60000))
    : '—';

  getViewport().innerHTML = `
    <div id="admin-panel">
      <div class="dash-header">
        <h2 class="dash-title">ADMIN CONTROL</h2>
        <span class="role-badge">${user?.role?.toUpperCase() ?? 'ADMIN'}</span>
      </div>

      <div class="vault-stat-grid" style="margin-bottom:24px">
        <div class="vault-stat"><div class="vault-stat-num" style="color:var(--success)">${stats.active}</div><div class="vault-stat-label">Active</div></div>
        <div class="vault-stat"><div class="vault-stat-num" style="color:var(--text-accent)">${stats.total}</div><div class="vault-stat-label">Entries</div></div>
        <div class="vault-stat"><div class="vault-stat-num" style="color:var(--warn)">${stats.pinned}</div><div class="vault-stat-label">Pinned</div></div>
        <div class="vault-stat"><div class="vault-stat-num" style="color:var(--text-secondary)">${remaining}m</div><div class="vault-stat-label">Session</div></div>
      </div>

      <div class="admin-grid">
        <div class="admin-card">
          <div class="admin-card-title">OPERATOR</div>
          <div class="admin-stat" style="font-size:15px;word-break:break-all">${user?.username ?? '—'}</div>
          <div style="font-size:10px;color:var(--text-muted);font-family:var(--mono);margin-top:4px">${user?.id ?? ''}</div>
          ${user?.avatar ? `<img src="${user.avatar}" style="width:40px;height:40px;border-radius:50%;margin-top:10px;border:2px solid var(--border-accent)"/>` : ''}
        </div>

        <div class="admin-card">
          <div class="admin-card-title">PERMISSIONS</div>
          <div id="perm-list" style="display:flex;flex-direction:column;gap:4px;margin-top:4px">
            <div style="font-size:10px;color:var(--text-muted)">Loading…</div>
          </div>
        </div>

        <div class="admin-card">
          <div class="admin-card-title">SERVER STATS</div>
          <div id="server-stats" style="font-size:11px;color:var(--text-secondary)">Fetching…</div>
        </div>

        <div class="admin-card">
          <div class="admin-card-title">ACTIVE SESSIONS</div>
          <div id="session-list" style="font-size:11px;color:var(--text-secondary)">Fetching…</div>
        </div>

        <div class="admin-card">
          <div class="admin-card-title">EXPORT VAULT</div>
          <p style="font-size:11px;color:var(--text-secondary)">Download all ${stats.total} local entries as JSON.</p>
          <button id="btn-export" class="btn-primary" style="margin-top:auto">EXPORT JSON</button>
        </div>

        <div class="admin-card danger-zone">
          <div class="admin-card-title">DANGER ZONE</div>
          <p style="font-size:11px;color:var(--text-secondary)">Permanently deletes all stored credentials.</p>
          <button id="btn-wipe" class="btn-danger" style="margin-top:auto">WIPE VAULT DATA</button>
        </div>
      </div>

      <div style="margin-top:28px">
        <div class="section-label" style="display:flex;align-items:center;justify-content:space-between">
          Audit Log
          <button id="btn-export-audit" class="btn-ghost" style="font-size:9px;padding:4px 10px">EXPORT</button>
        </div>
        <div id="audit-log" style="margin-top:8px">
          <div style="font-size:11px;color:var(--text-muted);padding:8px 0">Loading audit events…</div>
        </div>
      </div>
    </div>`;

  document.getElementById('btn-export').addEventListener('click', () => { exportJSON(); showToast('Vault exported!'); });
  document.getElementById('btn-wipe').addEventListener('click', () =>
    openModal('WIPE ALL VAULT DATA? This cannot be undone.', () => {
      clearVault(); showToast('Vault wiped'); setTimeout(() => location.reload(), 800);
    })
  );
  document.getElementById('btn-export-audit')?.addEventListener('click', _exportAudit);

  await Promise.all([_loadPermissions(), _loadServerStats(), _loadSessions(), _loadAuditEvents()]);
}

async function _loadPermissions() {
  const el = document.getElementById('perm-list');
  if (!el || !API) { el && (el.innerHTML = '<div style="font-size:10px;color:var(--text-muted)">Local mode</div>'); return; }
  try {
    const res  = await fetch(`${API}/rbac/permissions`, { headers: auth() });
    if (!res.ok) { el.innerHTML = '<div style="font-size:10px;color:var(--danger)">Access denied</div>'; return; }
    const { permissions } = await res.json();
    el.innerHTML = permissions.map(p =>
      `<div style="font-size:10px;font-family:var(--mono);background:var(--accent-dim);color:var(--text-accent);padding:2px 7px;border-radius:6px;display:inline-block">${p}</div>`
    ).join('');
  } catch { el.innerHTML = '<div style="font-size:10px;color:var(--text-muted)">Offline</div>'; }
}

async function _loadServerStats() {
  const el = document.getElementById('server-stats');
  if (!el || !API) { el && (el.textContent = 'No backend configured'); return; }
  try {
    const res  = await fetch(`${API}/admin/stats`, { headers: auth() });
    if (!res.ok) { el.textContent = 'Admin required'; return; }
    const d = await res.json();
    el.innerHTML = `
      <div class="meta-row"><span class="meta-key">Users</span><span class="meta-val">${d.totalUsers}</span></div>
      <div class="meta-row"><span class="meta-key">Server entries</span><span class="meta-val">${d.totalEntries}</span></div>
      <div class="meta-row"><span class="meta-key">Live sessions</span><span class="meta-val">${d.activeSessions}</span></div>`;
  } catch { el.textContent = 'Backend unreachable'; }
}

async function _loadSessions() {
  const el = document.getElementById('session-list');
  if (!el || !API) { el && (el.textContent = 'Local mode'); return; }
  try {
    const res = await fetch(`${API}/admin/sessions`, { headers: auth() });
    if (!res.ok) { el.textContent = 'Admin required'; return; }
    const list = await res.json();
    if (!list.length) { el.textContent = 'No active sessions'; return; }
    el.innerHTML = list.map(s => `
      <div class="log-entry">
        <div class="log-dot ok"></div>
        <div>
          <div class="log-text">${s.userId} · ${s.role}</div>
          <div class="log-time">${s.age} ago · ···${s.tokenHint}</div>
        </div>
        <button class="ficon" style="margin-left:auto;flex-shrink:0" data-uid="${s.userId}" title="Terminate">✕</button>
      </div>`).join('');
    el.querySelectorAll('[data-uid]').forEach(btn =>
      btn.addEventListener('click', async () => {
        await fetch(`${API}/admin/sessions/${btn.dataset.uid}`, { method: 'DELETE', headers: auth() });
        showToast('Session terminated');
        _loadSessions();
      })
    );
  } catch { el.textContent = 'Backend unreachable'; }
}

async function _loadAuditEvents() {
  const el = document.getElementById('audit-log');
  if (!el || !API) { el && (el.innerHTML = '<div style="font-size:11px;color:var(--text-muted)">No backend configured</div>'); return; }
  try {
    const res = await fetch(`${API}/audit/events?limit=30`, { headers: auth() });
    if (!res.ok) { el.innerHTML = '<div style="font-size:11px;color:var(--text-muted)">Admin required</div>'; return; }
    const { events, total } = await res.json();
    if (!events.length) { el.innerHTML = '<div style="font-size:11px;color:var(--text-muted)">No events yet</div>'; return; }
    el.innerHTML = events.map(e => `
      <div class="log-entry">
        <div class="log-dot ok"></div>
        <div>
          <div class="log-text">${e.username} → <strong>${e.action}</strong></div>
          <div class="log-time">${new Date(e.ts).toLocaleTimeString()} · ${e.userId}</div>
        </div>
      </div>`).join('') + (total > 30 ? `<div style="font-size:10px;color:var(--text-muted);padding:8px 0">Showing 30 of ${total} events</div>` : '');
  } catch { el.innerHTML = '<div style="font-size:11px;color:var(--text-muted)">Backend unreachable</div>'; }
}

async function _exportAudit() {
  if (!API) { showToast('No backend configured'); return; }
  try {
    const res = await fetch(`${API}/audit/export`, { headers: auth() });
    if (!res.ok) { showToast('Admin required'); return; }
    const blob = await res.blob();
    const a    = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob), download: `audit_${Date.now()}.json`,
    });
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    showToast('Audit log exported!');
  } catch { showToast('Export failed'); }
}
