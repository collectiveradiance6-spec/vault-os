import { getEntry, deleteEntry, togglePin, addLog, touchEntry } from '../services/vault.js';
import { getState, setState } from '../core/state.js';
import { openEditModal } from './modal.js';

let _activePanel = null;

export function openPanel(id) {
  closePanel();
  const entry = getEntry(id);
  if (!entry) return;

  touchEntry(id);
  addLog(`Viewed: ${entry.t}`, 'ok');

  const settings = getState('settings');
  const masked = settings.mask;

  const panelHeader = document.getElementById('panelHeader');
  panelHeader.innerHTML = `
    <div class="panel-title-group">
      <div class="panel-icon">${entry.icon}</div>
      <div>
        <div class="panel-title">${esc(entry.t)}</div>
        <div class="panel-subtitle">${esc(entry.cat)}</div>
      </div>
    </div>
    <button class="panel-close" id="pClose">×</button>`;
  document.getElementById('pClose').addEventListener('click', closePanel);

  const panelBody = document.getElementById('panelBody');
  panelBody.innerHTML = `
    <div class="section-label">Credentials</div>
    ${entry.user ? `<div class="field-group"><div class="field-label">Username</div><div class="field-box"><div class="field-val revealed">${esc(entry.user)}</div><div class="field-actions"><button class="ficon" data-copy="${escA(entry.user)}" data-lbl="Username">📋</button></div></div></div>` : ''}
    ${entry.pass ? `<div class="field-group"><div class="field-label">Password</div><div class="field-box"><div class="field-val${masked ? '' : ' revealed'}" id="pval">${esc(entry.pass)}</div><div class="field-actions"><button class="ficon" id="revBtn">👁</button><button class="ficon" data-copy="${escA(entry.pass)}" data-lbl="Password">📋</button></div></div></div>` : ''}
    ${entry.url ? `<div class="field-group"><div class="field-label">URL</div><div class="field-box"><div class="field-val url-val">${esc(entry.url)}</div><div class="field-actions"><button class="ficon" data-copy="${escA(entry.url)}" data-lbl="URL">📋</button><a class="ficon" href="${escA(entry.url)}" target="_blank" rel="noopener">↗</a></div></div></div>` : ''}
    ${entry.notes ? `<div class="section-label">Notes</div><div class="notes-box">${esc(entry.notes)}</div>` : ''}
    <div class="section-label">Details</div>
    <div class="meta-row"><span class="meta-key">Created</span><span class="meta-val">${esc(entry.created ?? '—')}</span></div>
    <div class="meta-row"><span class="meta-key">Last used</span><span class="meta-val">Just now</span></div>
    <div class="meta-row"><span class="meta-key">Status</span><span class="meta-val" style="color:var(--${entry.status === 'active' ? 'success' : entry.status === 'pending' ? 'warn' : 'danger'})">${cap(entry.status)}</span></div>
    <div class="meta-row"><span class="meta-key">Pinned</span><span class="meta-val">${entry.pinned ? '📌 Yes' : 'No'}</span></div>
    ${entry.tags?.length ? `<div class="meta-row"><span class="meta-key">Tags</span><div class="card-tags">${entry.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>` : ''}
    <div class="panel-actions">
      <button class="panel-btn" id="pinBtn">${entry.pinned ? '📌 Unpin' : '📌 Pin'}</button>
      <button class="panel-btn edit-btn" id="editBtn">✏ Edit</button>
      <button class="panel-btn delete-btn" id="delBtn">✕ Delete</button>
    </div>`;

  document.getElementById('revBtn')?.addEventListener('click', () =>
    document.getElementById('pval')?.classList.toggle('revealed')
  );

  panelBody.querySelectorAll('[data-copy]').forEach(b =>
    b.addEventListener('click', () => {
      navigator.clipboard.writeText(b.dataset.copy).catch(() => {});
      showToast(b.dataset.lbl + ' copied!');
      addLog('Copied: ' + b.dataset.lbl, 'ok');
    })
  );

  document.getElementById('pinBtn').addEventListener('click', () => {
    togglePin(id);
    openPanel(id);
  });

  document.getElementById('editBtn').addEventListener('click', () => {
    closePanel();
    openEditModal(id);
  });

  document.getElementById('delBtn').addEventListener('click', () => {
    if (!confirm(`Delete "${entry.t}"?`)) return;
    deleteEntry(id);
    closePanel();
  });

  document.getElementById('overlay').classList.add('active');
  document.getElementById('panel').classList.add('active');
  _activePanel = id;
}

export function closePanel() {
  if (!_activePanel) return;
  document.getElementById('overlay')?.classList.remove('active');
  document.getElementById('panel')?.classList.remove('active');
  _activePanel = null;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escA(s) {
  return esc(s);
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
