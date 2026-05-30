// ─────────────────────────────────────────────────────────────────────────────
// src/js/components/panel.js — Vault OS detail bottom-sheet
// ─────────────────────────────────────────────────────────────────────────────

import { getEntry, touchEntry, deleteEntry, togglePin } from '../services/vault.js';
import { state } from '../core/state.js';
import { openEditModal } from './modal.js';
import { renderCards } from './cards.js';
import { addLog } from '../services/vault.js';
import { showToast } from '../ui/toast.js';

let panelEl, overlayEl;

export function mountPanel() {
  panelEl  = document.getElementById('panel');
  overlayEl = document.getElementById('overlay');
  overlayEl?.addEventListener('click', closePanel);
}

export function openPanel(id) {
  const entry = getEntry(id);
  if (!entry) return;

  touchEntry(id);
  addLog(`Viewed: ${entry.t}`, 'ok');

  renderPanelHeader(entry);
  renderPanelBody(entry);

  overlayEl?.classList.add('active');
  panelEl?.classList.add('active');

  // re-render cards so lastUsed updates
  renderCards();
}

export function closePanel() {
  panelEl?.classList.remove('active');
  overlayEl?.classList.remove('active');
}

// ── Internal renders ──────────────────────────────────────────────────────────
function renderPanelHeader(entry) {
  const el = document.getElementById('panelHeader');
  if (!el) return;
  el.innerHTML = `
    <div class="panel-title-group">
      <div class="panel-icon">${entry.icon}</div>
      <div>
        <div class="panel-title">${escHtml(entry.t)}</div>
        <div class="panel-subtitle">${escHtml(entry.cat)}</div>
      </div>
    </div>
    <button class="panel-close" id="panelCloseBtn">×</button>`;
  document.getElementById('panelCloseBtn').addEventListener('click', closePanel);
}

function renderPanelBody(entry) {
  const el = document.getElementById('panelBody');
  if (!el) return;

  const masked = state.settings.mask;

  el.innerHTML = `
    <div class="section-label">Credentials</div>

    ${entry.user ? `
    <div class="field-group">
      <div class="field-label">Username / Email</div>
      <div class="field-box">
        <div class="field-val revealed">${escHtml(entry.user)}</div>
        <div class="field-actions">
          <button class="ficon" data-copy="${escAttr(entry.user)}" data-label="Username" title="Copy">📋</button>
        </div>
      </div>
    </div>` : ''}

    ${entry.pass ? `
    <div class="field-group">
      <div class="field-label">Password / Token</div>
      <div class="field-box">
        <div class="field-val${masked ? '' : ' revealed'}" id="panelPassVal">${escHtml(entry.pass)}</div>
        <div class="field-actions">
          <button class="ficon" id="revealBtn" title="Toggle visibility">👁</button>
          <button class="ficon" data-copy="${escAttr(entry.pass)}" data-label="Password" title="Copy">📋</button>
        </div>
      </div>
    </div>` : ''}

    ${entry.url ? `
    <div class="field-group">
      <div class="field-label">URL</div>
      <div class="field-box">
        <div class="field-val revealed url-val">${escHtml(entry.url)}</div>
        <div class="field-actions">
          <button class="ficon" data-copy="${escAttr(entry.url)}" data-label="URL" title="Copy">📋</button>
          <a class="ficon" href="${escAttr(entry.url)}" target="_blank" rel="noopener" title="Open">↗</a>
        </div>
      </div>
    </div>` : ''}

    ${entry.notes ? `
    <div class="section-label">Notes</div>
    <div class="notes-box">${escHtml(entry.notes)}</div>` : ''}

    <div class="section-label">Details</div>
    <div class="meta-row"><span class="meta-key">Created</span><span class="meta-val">${escHtml(entry.created)}</span></div>
    <div class="meta-row"><span class="meta-key">Last accessed</span><span class="meta-val">${escHtml(entry.lastUsed)}</span></div>
    <div class="meta-row"><span class="meta-key">Status</span>
      <span class="meta-val status-${entry.status}">${capitalize(entry.status)}</span></div>
    <div class="meta-row"><span class="meta-key">Pinned</span>
      <span class="meta-val">${entry.pinned ? '📌 Yes' : 'No'}</span></div>

    ${entry.tags?.length ? `
    <div class="meta-row">
      <span class="meta-key">Tags</span>
      <div class="card-tags">${entry.tags.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>
    </div>` : ''}

    <div class="panel-actions">
      <button class="panel-btn pin-btn"    data-id="${entry.id}">${entry.pinned ? '📌 Unpin' : '📌 Pin'}</button>
      <button class="panel-btn edit-btn"   data-id="${entry.id}">✏ Edit</button>
      <button class="panel-btn delete-btn" data-id="${entry.id}">✕ Delete</button>
    </div>`;

  // wire up events
  el.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy).catch(() => {});
      showToast(`${btn.dataset.label} copied!`);
      addLog(`Copied: ${btn.dataset.label}`, 'ok');
    });
  });

  document.getElementById('revealBtn')?.addEventListener('click', () => {
    document.getElementById('panelPassVal')?.classList.toggle('revealed');
  });

  el.querySelector('.pin-btn')?.addEventListener('click', () => {
    togglePin(entry.id);
    openPanel(entry.id); // re-render panel
    renderCards();
  });

  el.querySelector('.edit-btn')?.addEventListener('click', () => {
    closePanel();
    openEditModal(entry.id);
  });

  el.querySelector('.delete-btn')?.addEventListener('click', () => {
    if (!confirm(`Delete "${entry.t}"?`)) return;
    deleteEntry(entry.id);
    closePanel();
    renderCards();
  });
}

// ── helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escAttr(str) { return escHtml(str); }
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
