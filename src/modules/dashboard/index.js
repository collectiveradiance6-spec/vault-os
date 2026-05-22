import { getState, setState } from '../../core/state.js';
import {
  getFilteredEntries, getCategories, addEntry, updateEntry,
  deleteEntry, togglePin, touchEntry, addLog, ICONS,
} from '../../services/vault.js';
import { showToast } from '../../ui/toast.js';
import { saveSettings } from '../../services/storage.js';

const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export function mount() {
  // dashboard lives in the static .app shell — just activate
  document.querySelector('.app')?.classList.remove('hidden');
  buildFilterRow();
  renderCards();
  bindSearch();
  bindDock();
  bindAddBtn();
  bindPanel();
  bindModal();
}

// ── FILTER ROW ──────────────────────────────────────────────────────────────
function buildFilterRow() {
  const row = document.getElementById('filterRow');
  if (!row) return;
  const entries = getState('entries');
  const active  = getState('activeFilter');
  row.innerHTML = getCategories().map(c => `
    <button class="filter-chip${c === active ? ' active' : ''}" data-cat="${esc(c)}">
      ${esc(c === 'All' ? `All (${entries.length})` : c)}
    </button>`).join('');
  row.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      setState({ activeFilter: btn.dataset.cat });
      buildFilterRow(); renderCards();
    });
  });
}

// ── CARD GRID ────────────────────────────────────────────────────────────────
export function renderCards() {
  const grid = document.getElementById('home');
  if (!grid) return;
  const list = getFilteredEntries();
  if (!list.length) {
    grid.innerHTML = `<div class="empty"><div class="empty-icon">🔍</div><div class="empty-text">No credentials found</div></div>`;
    return;
  }
  grid.innerHTML = list.map((e, i) => `
    <div class="card${e.pinned ? ' pinned' : ''}" data-id="${e.id}" style="animation-delay:${i * .04}s">
      <div class="card-header">
        <div class="card-icon-wrap">${e.icon}</div>
        <div class="card-title-wrap">
          <div class="card-title">${esc(e.t)}</div>
          <div class="card-category">${esc(e.cat)}</div>
        </div>
      </div>
      <div class="card-divider"></div>
      <div class="card-footer">
        <div class="status-badge ${e.status}"><span class="status-dot"></span>${cap(e.status)}</div>
        <div class="card-time">${esc(e.lastUsed)}</div>
      </div>
      ${e.tags?.length ? `<div class="card-tags">${e.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="card-actions">
        <button class="card-action-btn primary" data-action="view">View</button>
        <button class="card-action-btn" data-action="edit">Edit</button>
      </div>
    </div>`).join('');

  grid.querySelectorAll('.card').forEach(card => {
    // shimmer follow
    card.addEventListener('pointermove', ev => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--cx', ((ev.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--cy', ((ev.clientY - r.top)  / r.height * 100) + '%');
    });
    // click
    card.addEventListener('click', ev => {
      const action = ev.target.closest('[data-action]')?.dataset.action;
      if (action === 'edit') { openEditModal(card.dataset.id); return; }
      openPanel(card.dataset.id);
    });
    // long-press on mobile
    let lpt;
    card.addEventListener('touchstart', ev => {
      const t = ev.touches[0];
      spawnRing(t.clientX, t.clientY);
      lpt = setTimeout(() => openEditModal(card.dataset.id), 650);
    }, { passive: true });
    card.addEventListener('touchend',  () => clearTimeout(lpt));
    card.addEventListener('touchmove', () => clearTimeout(lpt));
  });
}

function spawnRing(x, y) {
  const el = document.createElement('div');
  el.className = 'lp-ring';
  el.style.cssText = `left:${x}px;top:${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

// ── SEARCH ───────────────────────────────────────────────────────────────────
function bindSearch() {
  document.getElementById('searchInput')?.addEventListener('input', e => {
    setState({ searchQuery: e.target.value });
    renderCards();
  });
}

// ── DOCK ─────────────────────────────────────────────────────────────────────
function bindDock() {
  ['creds','vault','settings'].forEach(tab => {
    document.getElementById(`dock-${tab}`)?.addEventListener('click', () => switchTab(tab));
  });
}

function switchTab(tab) {
  setState({ activeTab: tab });
  const titles = { creds:['Credentials','Admin access vault'], vault:['Vault','Security overview'], settings:['Settings','Preferences'] };
  document.getElementById('tabTitle').textContent = titles[tab][0];
  document.getElementById('tabSub').textContent   = titles[tab][1];
  ['creds','vault','settings'].forEach(t => {
    const el = document.getElementById(`tab${t.charAt(0).toUpperCase()}${t.slice(1)}`);
    if (el) el.style.display = t === tab ? (t === 'creds' ? 'flex' : 'block') : 'none';
    document.getElementById(`dock-${t}`)?.classList.toggle('active', t === tab);
  });
  if (tab === 'vault')    renderVaultTab();
  if (tab === 'settings') renderSettingsTab();
}

// ── ADD BUTTON ────────────────────────────────────────────────────────────────
function bindAddBtn() {
  document.getElementById('addBtn')?.addEventListener('click', () => openAddModal());
}

// ── PANEL ─────────────────────────────────────────────────────────────────────
function bindPanel() {
  document.getElementById('overlay')?.addEventListener('click', closePanel);
}

function openPanel(id) {
  const { entries, settings } = getState();
  const e = entries.find(x => x.id === id); if (!e) return;
  touchEntry(id); addLog(`Viewed: ${e.t}`, 'ok');

  document.getElementById('panelHeader').innerHTML = `
    <div class="panel-title-group">
      <div class="panel-icon">${e.icon}</div>
      <div><div class="panel-title">${esc(e.t)}</div><div class="panel-subtitle">${esc(e.cat)}</div></div>
    </div>
    <button class="panel-close" id="pClose">×</button>`;
  document.getElementById('pClose').addEventListener('click', closePanel);

  document.getElementById('panelBody').innerHTML = `
    <div class="section-label">Credentials</div>
    ${e.user ? `<div class="field-group"><div class="field-label">Username</div><div class="field-box"><div class="field-val revealed">${esc(e.user)}</div><div class="field-actions"><button class="ficon" data-copy="${esc(e.user)}" data-lbl="Username">📋</button></div></div></div>` : ''}
    ${e.pass ? `<div class="field-group"><div class="field-label">Password</div><div class="field-box"><div class="field-val${settings.mask ? '' : ' revealed'}" id="pval">${esc(e.pass)}</div><div class="field-actions"><button class="ficon" id="revBtn">👁</button><button class="ficon" data-copy="${esc(e.pass)}" data-lbl="Password">📋</button></div></div></div>` : ''}
    ${e.url  ? `<div class="field-group"><div class="field-label">URL</div><div class="field-box"><div class="field-val url-val">${esc(e.url)}</div><div class="field-actions"><button class="ficon" data-copy="${esc(e.url)}" data-lbl="URL">📋</button><a class="ficon" href="${esc(e.url)}" target="_blank" rel="noopener">↗</a></div></div></div>` : ''}
    ${e.notes ? `<div class="section-label">Notes</div><div class="notes-box">${esc(e.notes)}</div>` : ''}
    <div class="section-label">Details</div>
    <div class="meta-row"><span class="meta-key">Created</span><span class="meta-val">${esc(e.created)}</span></div>
    <div class="meta-row"><span class="meta-key">Last used</span><span class="meta-val">Just now</span></div>
    <div class="meta-row"><span class="meta-key">Status</span><span class="meta-val" style="color:var(--${e.status==='active'?'success':e.status==='pending'?'warn':'danger'})">${cap(e.status)}</span></div>
    <div class="meta-row"><span class="meta-key">Pinned</span><span class="meta-val">${e.pinned ? '📌 Yes' : 'No'}</span></div>
    ${e.tags?.length ? `<div class="meta-row"><span class="meta-key">Tags</span><div class="card-tags">${e.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>` : ''}
    <div class="panel-actions">
      <button class="panel-btn pin-btn" id="ppinBtn">${e.pinned ? '📌 Unpin' : '📌 Pin'}</button>
      <button class="panel-btn edit-btn" id="peditBtn">✏ Edit</button>
      <button class="panel-btn delete-btn" id="pdelBtn">✕ Delete</button>
    </div>`;

  document.getElementById('revBtn')?.addEventListener('click', () => document.getElementById('pval')?.classList.toggle('revealed'));
  document.getElementById('panelBody').querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
    navigator.clipboard.writeText(b.dataset.copy).catch(() => {});
    showToast(`${b.dataset.lbl} copied!`); addLog(`Copied: ${b.dataset.lbl}`, 'ok');
  }));
  document.getElementById('ppinBtn').addEventListener('click', () => { togglePin(id); openPanel(id); renderCards(); });
  document.getElementById('peditBtn').addEventListener('click', () => { closePanel(); openEditModal(id); });
  document.getElementById('pdelBtn').addEventListener('click', () => {
    if (!confirm(`Delete "${e.t}"?`)) return;
    deleteEntry(id); closePanel(); buildFilterRow(); renderCards();
  });

  document.getElementById('overlay').classList.add('active');
  document.getElementById('panel').classList.add('active');
  renderCards();
}

function closePanel() {
  document.getElementById('overlay').classList.remove('active');
  document.getElementById('panel').classList.remove('active');
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function bindModal() {
  document.getElementById('modalOverlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);
}

function openAddModal() {
  setState({ editingId: null });
  document.getElementById('modalTitle').textContent = 'Add Credential';
  buildForm(null);
  document.getElementById('modalOverlay').classList.add('active');
}

function openEditModal(id) {
  const e = getState('entries').find(x => x.id === id); if (!e) return;
  setState({ editingId: id });
  document.getElementById('modalTitle').textContent = 'Edit Credential';
  buildForm(e);
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  setState({ editingId: null });
}

function buildForm(e) {
  const selIcon   = e?.icon   ?? ICONS[0];
  const selStatus = e?.status ?? 'active';
  document.getElementById('modalBody').innerHTML = `
    <label class="input-label">Icon</label>
    <div class="icon-picker">${ICONS.map(ic => `<div class="icon-opt${ic===selIcon?' selected':''}" data-icon="${ic}">${ic}</div>`).join('')}</div>
    <label class="input-label">Status</label>
    <div class="status-select">
      <div class="status-opt active-opt${selStatus==='active'?' selected':''}"   data-s="active">Active</div>
      <div class="status-opt inactive-opt${selStatus==='inactive'?' selected':''}" data-s="inactive">Inactive</div>
      <div class="status-opt pending-opt${selStatus==='pending'?' selected':''}"  data-s="pending">Pending</div>
    </div>
    <label class="input-label">Name *</label><input class="input-field" id="fn"   placeholder="e.g. Discord Bot" value="${esc(e?.t??'')}"/>
    <label class="input-label">Category</label><input class="input-field" id="fc" placeholder="Admin, Discord…"  value="${esc(e?.cat??'')}"/>
    <label class="input-label">Username</label><input class="input-field" id="fu" placeholder="user@example.com" value="${esc(e?.user??'')}"/>
    <label class="input-label">Password</label>
    <div class="pass-wrap"><input class="input-field" id="fp" type="password" placeholder="••••••••" value="${esc(e?.pass??'')}"/><button class="pass-toggle" id="ptog">👁</button></div>
    <label class="input-label">URL</label><input class="input-field" id="furl" placeholder="https://" value="${esc(e?.url??'')}"/>
    <label class="input-label">Notes</label><textarea class="input-field" id="fn2">${esc(e?.notes??'')}</textarea>
    <label class="input-label">Tags <span style="color:var(--muted);font-weight:400">(comma-separated)</span></label>
    <input class="input-field" id="ftags" placeholder="admin, primary" value="${esc((e?.tags??[]).join(', '))}"/>`;

  document.getElementById('modalFooter').innerHTML = `
    ${getState('editingId') ? `<button class="btn-delete" id="mDel">Delete</button>` : ''}
    <button class="btn-cancel" id="mCan">Cancel</button>
    <button class="btn-save"   id="mSav">Save</button>`;

  document.getElementById('modalBody').querySelector('.icon-picker').addEventListener('click', ev => {
    const o = ev.target.closest('.icon-opt'); if (!o) return;
    document.querySelectorAll('.icon-opt').forEach(x => x.classList.remove('selected')); o.classList.add('selected');
  });
  document.getElementById('modalBody').querySelector('.status-select').addEventListener('click', ev => {
    const o = ev.target.closest('.status-opt'); if (!o) return;
    document.querySelectorAll('.status-opt').forEach(x => x.classList.remove('selected')); o.classList.add('selected');
  });
  document.getElementById('ptog').addEventListener('click', () => {
    const i = document.getElementById('fp'); i.type = i.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('mCan').addEventListener('click', closeModal);
  document.getElementById('mSav').addEventListener('click', saveEntry);
  document.getElementById('mDel')?.addEventListener('click', () => {
    const id = getState('editingId');
    if (!id || !confirm('Delete this entry?')) return;
    deleteEntry(id); closeModal(); buildFilterRow(); renderCards();
  });
}

function saveEntry() {
  const name = document.getElementById('fn').value.trim();
  if (!name) { document.getElementById('fn').focus(); return; }
  const icon   = document.querySelector('.icon-opt.selected')?.dataset.icon   ?? ICONS[0];
  const status = document.querySelector('.status-opt.selected')?.dataset.s    ?? 'active';
  const editingId = getState('editingId');
  const data = {
    t: name, cat: document.getElementById('fc').value.trim() || 'General',
    icon, status,
    user:  document.getElementById('fu').value.trim(),
    pass:  document.getElementById('fp').value.trim(),
    url:   document.getElementById('furl').value.trim(),
    notes: document.getElementById('fn2').value.trim(),
    tags:  document.getElementById('ftags').value.split(',').map(s => s.trim()).filter(Boolean),
    pinned: editingId ? (getState('entries').find(e => e.id === editingId)?.pinned ?? false) : false,
    created: editingId ? (getState('entries').find(e => e.id === editingId)?.created ?? new Date().toLocaleDateString()) : new Date().toLocaleDateString(),
    lastUsed: 'Just now',
  };
  if (editingId) updateEntry(editingId, data); else addEntry(data);
  closeModal(); buildFilterRow(); renderCards();
}

// ── VAULT TAB ─────────────────────────────────────────────────────────────────
function renderVaultTab() {
  const { entries, activityLog } = getState();
  const active = entries.filter(e => e.status === 'active').length;
  const pinned = entries.filter(e => e.pinned).length;
  const pending = entries.filter(e => e.status === 'pending').length;
  document.getElementById('vaultStats').innerHTML = `
    <div class="vault-stat"><div class="vault-stat-num" style="color:var(--success)">${active}</div><div class="vault-stat-label">Active</div></div>
    <div class="vault-stat"><div class="vault-stat-num" style="color:var(--accent1)">${entries.length}</div><div class="vault-stat-label">Total</div></div>
    <div class="vault-stat"><div class="vault-stat-num" style="color:var(--warn)">${pinned}</div><div class="vault-stat-label">Pinned</div></div>
    <div class="vault-stat"><div class="vault-stat-num" style="color:var(--accent2)">${pending}</div><div class="vault-stat-label">Pending</div></div>`;
  document.getElementById('activityLog').innerHTML = activityLog.slice(0,30).map(l =>
    `<div class="log-entry"><div class="log-dot ${l.type}"></div><div><div class="log-text">${esc(l.text)}</div><div class="log-time">${esc(l.time)}</div></div></div>`
  ).join('') || '<div style="color:var(--muted);font-size:12px;padding:8px 0">No activity yet</div>';
}

// ── SETTINGS TAB ──────────────────────────────────────────────────────────────
function renderSettingsTab() {
  const { settings, user } = getState();
  document.getElementById('tabSettings').innerHTML = `
    <div class="settings-section">
      <div class="settings-title">Account</div>
      <div class="setting-row">
        <div class="setting-info"><div class="setting-name">${esc(user?.username ?? '—')}</div><div class="setting-desc">Discord · ${esc(user?.role ?? 'user')}</div></div>
        <button id="logoutBtn" style="font-size:11px;font-weight:700;color:var(--danger);letter-spacing:.1em;padding:4px 10px;border:1px solid rgba(255,79,106,.3);border-radius:8px">LOGOUT</button>
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-title">Security</div>
      <div class="setting-row"><div class="setting-info"><div class="setting-name">Mask credentials</div><div class="setting-desc">Blur passwords by default</div></div><button class="toggle${settings.mask?' on':''}" data-k="mask"></button></div>
      <div class="setting-row"><div class="setting-info"><div class="setting-name">Auto-lock</div><div class="setting-desc">Re-lock after 5 min inactivity</div></div><button class="toggle${settings.autoLock?' on':''}" data-k="autoLock"></button></div>
      <div class="setting-row"><div class="setting-info"><div class="setting-name">Clipboard clear</div><div class="setting-desc">Wipe clipboard after 30s</div></div><button class="toggle${settings.clipboardClear?' on':''}" data-k="clipboardClear"></button></div>
    </div>
    <div class="settings-section">
      <div class="settings-title">Display</div>
      <div class="setting-row"><div class="setting-info"><div class="setting-name">Particle field</div><div class="setting-desc">Animated canvas background</div></div><button class="toggle${settings.particles?' on':''}" data-k="particles"></button></div>
      <div class="setting-row"><div class="setting-info"><div class="setting-name">Scanlines</div><div class="setting-desc">CRT overlay effect</div></div><button class="toggle${settings.scanlines?' on':''}" data-k="scanlines"></button></div>
    </div>
    <div class="settings-section">
      <div class="settings-title">Data</div>
      <div class="setting-row clickable" id="expBtn"><div class="setting-info"><div class="setting-name">Export vault</div><div class="setting-desc">Download all credentials as JSON</div></div><span style="font-size:16px;opacity:.5">→</span></div>
      <div class="setting-row clickable" id="clrBtn"><div class="setting-info"><div class="setting-name danger-text">Clear all data</div><div class="setting-desc">Permanently delete everything</div></div><span style="font-size:16px;opacity:.5;color:var(--danger)">✕</span></div>
    </div>
    <div class="settings-footer">Vault OS v3.0 · Discord OAuth · Cloudflare + Render</div>`;

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    const { logout } = await import('../../core/auth.js');
    logout();
    document.getElementById('lockScreen')?.classList.remove('fade-out');
    document.querySelector('.app')?.classList.add('hidden');
  });

  document.getElementById('tabSettings').querySelectorAll('.toggle[data-k]').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.k;
      const next = { ...getState('settings'), [k]: !getState('settings')[k] };
      setState({ settings: next }); saveSettings(next);
      btn.classList.toggle('on', next[k]);
      if (k === 'particles') {
        import('../../ui/particles.js').then(({ startParticles, stopParticles }) =>
          next.particles ? startParticles() : stopParticles());
      }
      if (k === 'scanlines') {
        document.querySelector('.scanlines').style.opacity = next.scanlines ? '.5' : '0';
      }
    });
  });

  document.getElementById('expBtn')?.addEventListener('click', () => {
    const { exportJSON } = require('../../services/storage.js');
    const { entries, activityLog } = getState();
    exportJSON(entries, activityLog); showToast('Vault exported!'); addLog('Vault exported', 'ok');
  });
  document.getElementById('clrBtn')?.addEventListener('click', () => {
    if (!confirm('Delete ALL credentials? Cannot be undone.')) return;
    const { nukeAll } = require('../../services/vault.js');
    const { clearAll } = require('../../services/storage.js');
    nukeAll(); clearAll(); buildFilterRow(); renderCards(); showToast('All data cleared');
  });
}
