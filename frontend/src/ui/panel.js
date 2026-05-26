import { getEntries, touchEntry, togglePin, deleteEntry, updateEntry } from '../services/vault.js';
import { navigate } from '../core/router.js';
import { showToast } from './toast.js';
import { openEditModal } from './modal.js';

let panelEl, overlayEl, currentId;

export function mountPanel() {
  panelEl  = document.getElementById('detail-panel');
  overlayEl = document.getElementById('panel-overlay');
  overlayEl?.addEventListener('click', closePanel);
}

export function openPanel(id) {
  const entry = getEntries().find(e => e.id === id);
  if (!entry) return;
  currentId = id;
  touchEntry(id);

  renderHeader(entry);
  renderBody(entry);

  overlayEl?.classList.add('active');
  panelEl?.classList.add('active');
}

export function closePanel() {
  panelEl?.classList.remove('active');
  overlayEl?.classList.remove('active');
  currentId = null;
}

// ── Header ────────────────────────────────────────────────────────────────────
function renderHeader(e) {
  document.getElementById('panel-header').innerHTML = `
    <div class="panel-title-group">
      <div class="panel-icon-wrap">${e.icon}</div>
      <div>
        <div class="panel-title">${esc(e.name)}</div>
        <div class="panel-sub">${esc(e.category)}</div>
      </div>
    </div>
    <button class="panel-close" id="panelCloseBtn">×</button>`;
  document.getElementById('panelCloseBtn').addEventListener('click', closePanel);
}

// ── Body ──────────────────────────────────────────────────────────────────────
function renderBody(e) {
  const body = document.getElementById('panel-body');
  body.innerHTML = `
    <div class="section-label">Credentials</div>

    ${e.username ? `
    <div class="field-group">
      <div class="field-label">Username / Email</div>
      <div class="field-box">
        <div class="field-val revealed">${esc(e.username)}</div>
        <div class="field-actions">
          <button class="ficon" data-copy="${escA(e.username)}" data-lbl="Username" title="Copy">📋</button>
        </div>
      </div>
    </div>` : ''}

    ${e.password ? `
    <div class="field-group">
      <div class="field-label">Password / Token</div>
      <div class="field-box">
        <div class="field-val" id="pval">${esc(e.password)}</div>
        <div class="field-actions">
          <button class="ficon" id="revBtn" title="Toggle">👁</button>
          <button class="ficon" data-copy="${escA(e.password)}" data-lbl="Password" title="Copy">📋</button>
        </div>
      </div>
    </div>` : ''}

    ${e.url ? `
    <div class="field-group">
      <div class="field-label">URL</div>
      <div class="field-box">
        <div class="field-val url-val">${esc(e.url)}</div>
        <div class="field-actions">
          <button class="ficon" data-copy="${escA(e.url)}" data-lbl="URL" title="Copy">📋</button>
          <a class="ficon" href="${escA(e.url)}" target="_blank" rel="noopener" title="Open">↗</a>
        </div>
      </div>
    </div>` : ''}

    ${e.notes ? `
    <div class="section-label">Notes</div>
    <div class="notes-box">${esc(e.notes)}</div>` : ''}

    <div class="section-label">Details</div>
    <div class="meta-row"><span class="meta-key">Created</span><span class="meta-val">${new Date(e.createdAt).toLocaleDateString()}</span></div>
    <div class="meta-row"><span class="meta-key">Last accessed</span><span class="meta-val">${esc(e.lastUsed)}</span></div>
    <div class="meta-row"><span class="meta-key">Status</span>
      <span class="meta-val" style="color:var(--${e.status === 'active' ? 'success' : e.status === 'pending' ? 'warn' : 'danger'})">${cap(e.status)}</span></div>
    <div class="meta-row"><span class="meta-key">Pinned</span><span class="meta-val">${e.pinned ? '📌 Yes' : 'No'}</span></div>

    ${e.tags?.length ? `
    <div class="meta-row">
      <span class="meta-key">Tags</span>
      <div class="card-tags">${e.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    </div>` : ''}

    <div class="panel-actions">
      <button class="panel-btn" id="pinPanelBtn">${e.pinned ? '📌 Unpin' : '📌 Pin'}</button>
      <button class="panel-btn edit" id="editPanelBtn">✏ Edit</button>
      <button class="panel-btn danger" id="delPanelBtn">✕ Delete</button>
    </div>`;

  // Copy buttons
  body.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy).catch(() => {});
      showToast(`${btn.dataset.lbl} copied!`);
    });
  });

  // Reveal toggle
  document.getElementById('revBtn')?.addEventListener('click', () => {
    document.getElementById('pval')?.classList.toggle('revealed');
  });

  // Pin
  document.getElementById('pinPanelBtn').addEventListener('click', () => {
    togglePin(e.id);
    const updated = getEntries().find(x => x.id === e.id);
    if (updated) { renderHeader(updated); renderBody(updated); }
  });

  // Edit
  document.getElementById('editPanelBtn').addEventListener('click', () => {
    closePanel();
    openEditModal(e.id);
  });

  // Delete
  document.getElementById('delPanelBtn').addEventListener('click', () => {
    if (!confirm(`Delete "${e.name}"?`)) return;
    deleteEntry(e.id);
    closePanel();
    // Re-render dashboard if active
    import('../modules/dashboard/index.js').then(m => m.refreshGrid?.());
    showToast('Entry deleted');
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function esc(s)  { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escA(s) { return esc(s); }
function cap(s)  { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
