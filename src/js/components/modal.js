// ─────────────────────────────────────────────────────────────────────────────
// src/js/components/modal.js — Vault OS add / edit credential modal
// ─────────────────────────────────────────────────────────────────────────────

import { state, setState } from '../core/state.js';
import { addEntry, updateEntry, deleteEntry, getEntry } from '../services/vault.js';
import { renderCards } from './cards.js';
import { renderFilters } from '../ui/filters.js';
import { ICONS } from '../data/defaults.js';

let modalEl;

export function mountModal() {
  modalEl = document.getElementById('modalOverlay');
  modalEl?.addEventListener('click', e => {
    if (e.target === modalEl) closeModal();
  });
}

export function openAddModal() {
  setState({ editingId: null });
  document.getElementById('modalTitle').textContent = 'Add Credential';
  buildForm(null);
  modalEl?.classList.add('active');
}

export function openEditModal(id) {
  const entry = getEntry(id);
  if (!entry) return;
  setState({ editingId: id });
  document.getElementById('modalTitle').textContent = 'Edit Credential';
  buildForm(entry);
  modalEl?.classList.add('active');
}

export function closeModal() {
  modalEl?.classList.remove('active');
  setState({ editingId: null });
}

// ── Form builder ──────────────────────────────────────────────────────────────
function buildForm(entry) {
  const selIcon   = entry?.icon   ?? ICONS[0];
  const selStatus = entry?.status ?? 'active';

  document.getElementById('modalBody').innerHTML = `
    <label class="input-label">Icon</label>
    <div class="icon-picker" id="iconPicker">
      ${ICONS.map(ic => `
        <div class="icon-opt${ic === selIcon ? ' selected' : ''}" data-icon="${ic}">${ic}</div>
      `).join('')}
    </div>

    <label class="input-label">Status</label>
    <div class="status-select" id="statusSelect">
      <div class="status-opt active-opt${selStatus === 'active'   ? ' selected' : ''}"   data-status="active">Active</div>
      <div class="status-opt inactive-opt${selStatus === 'inactive' ? ' selected' : ''}" data-status="inactive">Inactive</div>
      <div class="status-opt pending-opt${selStatus === 'pending'  ? ' selected' : ''}"  data-status="pending">Pending</div>
    </div>

    <label class="input-label">Name *</label>
    <input  class="input-field" id="f-name"  placeholder="e.g. Discord Bot"         value="${escAttr(entry?.t    ?? '')}"/>

    <label class="input-label">Category</label>
    <input  class="input-field" id="f-cat"   placeholder="e.g. Admin, Discord"       value="${escAttr(entry?.cat  ?? '')}"/>

    <label class="input-label">Username / Email</label>
    <input  class="input-field" id="f-user"  placeholder="user@example.com"          value="${escAttr(entry?.user ?? '')}"/>

    <label class="input-label">Password / Token</label>
    <div style="position:relative">
      <input class="input-field" id="f-pass" type="password" placeholder="••••••••" value="${escAttr(entry?.pass ?? '')}" style="padding-right:38px"/>
      <button class="pass-toggle" id="passToggle" type="button">👁</button>
    </div>

    <label class="input-label">URL</label>
    <input  class="input-field" id="f-url"   placeholder="https://"                  value="${escAttr(entry?.url  ?? '')}"/>

    <label class="input-label">Notes</label>
    <textarea class="input-field" id="f-notes" placeholder="Additional notes…">${escHtml(entry?.notes ?? '')}</textarea>

    <label class="input-label">Tags <span style="color:var(--muted);font-weight:400">(comma-separated)</span></label>
    <input  class="input-field" id="f-tags"  placeholder="admin, primary"            value="${escAttr((entry?.tags ?? []).join(', '))}"/>
  `;

  document.getElementById('modalFooter').innerHTML = `
    ${state.editingId ? `<button class="btn-delete" id="modalDelete">Delete</button>` : ''}
    <button class="btn-cancel" id="modalCancel">Cancel</button>
    <button class="btn-save"   id="modalSave">Save</button>
  `;

  // icon selection
  document.getElementById('iconPicker').addEventListener('click', e => {
    const opt = e.target.closest('.icon-opt');
    if (!opt) return;
    document.querySelectorAll('.icon-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
  });

  // status selection
  document.getElementById('statusSelect').addEventListener('click', e => {
    const opt = e.target.closest('.status-opt');
    if (!opt) return;
    document.querySelectorAll('.status-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
  });

  // password reveal toggle
  document.getElementById('passToggle').addEventListener('click', () => {
    const inp = document.getElementById('f-pass');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('modalSave').addEventListener('click', saveEntry);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalDelete')?.addEventListener('click', () => {
    const id = state.editingId;
    if (!id || !confirm('Delete this credential?')) return;
    deleteEntry(id);
    closeModal();
    renderFilters();
    renderCards();
  });
}

function saveEntry() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) {
    document.getElementById('f-name').focus();
    return;
  }

  const icon   = document.querySelector('.icon-opt.selected')?.dataset.icon   ?? ICONS[0];
  const status = document.querySelector('.status-opt.selected')?.dataset.status ?? 'active';

  const data = {
    t:      name,
    cat:    document.getElementById('f-cat').value.trim()   || 'General',
    icon,   status,
    user:   document.getElementById('f-user').value.trim(),
    pass:   document.getElementById('f-pass').value.trim(),
    url:    document.getElementById('f-url').value.trim(),
    notes:  document.getElementById('f-notes').value.trim(),
    tags:   document.getElementById('f-tags').value
              .split(',').map(s => s.trim()).filter(Boolean),
  };

  if (state.editingId) {
    updateEntry(state.editingId, data);
  } else {
    addEntry(data);
  }

  closeModal();
  renderFilters();
  renderCards();
}

// ── helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escAttr(str) { return escHtml(str); }
