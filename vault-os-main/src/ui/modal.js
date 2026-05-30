import { ICONS } from '../services/vault.js';
import { getState, setState } from '../core/state.js';
import { addEntry, updateEntry, getEntry, deleteEntry } from '../services/vault.js';

export function openAddModal() {
  setState({ editingId: null });
  document.getElementById('modalTitle').textContent = 'Add Credential';
  buildForm(null);
  document.getElementById('modalOverlay').classList.add('active');
}

export function openEditModal(id) {
  const entry = getEntry(id);
  if (!entry) return;
  setState({ editingId: id });
  document.getElementById('modalTitle').textContent = 'Edit Credential';
  buildForm(entry);
  document.getElementById('modalOverlay').classList.add('active');
}

export function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  setState({ editingId: null });
}

function buildForm(entry) {
  const selIcon = entry?.icon ?? ICONS[0];
  const selStatus = entry?.status ?? 'active';
  const editingId = getState('editingId');

  document.getElementById('modalBody').innerHTML = `
    <label class="input-label">Icon</label>
    <div class="icon-picker">${ICONS.map(ic => `<div class="icon-opt${ic === selIcon ? ' selected' : ''}" data-icon="${ic}">${ic}</div>`).join('')}</div>
    <label class="input-label">Status</label>
    <div class="status-select">
      <div class="status-opt active-opt${selStatus === 'active' ? ' selected' : ''}" data-s="active">Active</div>
      <div class="status-opt inactive-opt${selStatus === 'inactive' ? ' selected' : ''}" data-s="inactive">Inactive</div>
      <div class="status-opt pending-opt${selStatus === 'pending' ? ' selected' : ''}" data-s="pending">Pending</div>
    </div>
    <label class="input-label">Name *</label><input class="input-field" id="fn" placeholder="e.g. Discord Bot" value="${escA(entry?.t ?? '')}"/>
    <label class="input-label">Category</label><input class="input-field" id="fc" placeholder="Admin, Discord…" value="${escA(entry?.cat ?? '')}"/>
    <label class="input-label">Username</label><input class="input-field" id="fu" placeholder="user@example.com" value="${escA(entry?.user ?? '')}"/>
    <label class="input-label">Password</label><div class="pass-wrap"><input class="input-field" id="fp" type="password" placeholder="••••••••" value="${escA(entry?.pass ?? '')}"/><button class="pass-toggle" id="ptog">👁</button></div>
    <label class="input-label">URL</label><input class="input-field" id="furl" placeholder="https://" value="${escA(entry?.url ?? '')}"/>
    <label class="input-label">Notes</label><textarea class="input-field" id="fn2">${esc(entry?.notes ?? '')}</textarea>
    <label class="input-label">Tags <span style="color:var(--muted);font-weight:400">(comma-separated)</span></label>
    <input class="input-field" id="ftags" placeholder="admin, primary" value="${escA((entry?.tags ?? []).join(', '))}"/>`;

  document.getElementById('modalFooter').innerHTML = `
    ${editingId ? `<button class="btn-delete" id="mDel">Delete</button>` : ''}
    <button class="btn-cancel" id="mCan">Cancel</button>
    <button class="btn-save" id="mSav">Save</button>`;

  document.getElementById('modalBody').querySelector('.icon-picker').addEventListener('click', ev => {
    const o = ev.target.closest('.icon-opt');
    if (!o) return;
    document.querySelectorAll('.icon-opt').forEach(x => x.classList.remove('selected'));
    o.classList.add('selected');
  });

  document.getElementById('modalBody').querySelector('.status-select').addEventListener('click', ev => {
    const o = ev.target.closest('.status-opt');
    if (!o) return;
    document.querySelectorAll('.status-opt').forEach(x => x.classList.remove('selected'));
    o.classList.add('selected');
  });

  document.getElementById('ptog').addEventListener('click', () => {
    const i = document.getElementById('fp');
    i.type = i.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('mCan').addEventListener('click', closeModal);
  document.getElementById('mSav').addEventListener('click', saveEntry);
  document.getElementById('mDel')?.addEventListener('click', () => {
    if (!editingId || !confirm('Delete this entry?')) return;
    deleteEntry(editingId);
    closeModal();
  });
}

function saveEntry() {
  const name = document.getElementById('fn').value.trim();
  if (!name) {
    document.getElementById('fn').focus();
    return;
  }

  const icon = document.querySelector('.icon-opt.selected')?.dataset.icon ?? ICONS[0];
  const sEl = document.querySelector('.status-opt.selected');
  const status = sEl?.dataset.s ?? 'active';
  const editingId = getState('editingId');

  const entryData = {
    t: name,
    cat: document.getElementById('fc').value.trim() || 'General',
    icon,
    status,
    user: document.getElementById('fu').value.trim(),
    pass: document.getElementById('fp').value.trim(),
    url: document.getElementById('furl').value.trim(),
    notes: document.getElementById('fn2').value.trim(),
    tags: document.getElementById('ftags')
      .value.split(',')
      .map(s => s.trim())
      .filter(Boolean),
  };

  if (editingId) {
    const existing = getEntry(editingId);
    updateEntry(editingId, {
      ...entryData,
      pinned: existing?.pinned ?? false,
      created: existing?.created,
    });
  } else {
    addEntry({
      ...entryData,
      created: new Date().toLocaleDateString(),
      lastUsed: 'Just now',
    });
  }

  closeModal();
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
