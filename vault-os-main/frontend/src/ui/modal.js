import { getEntries, addEntry, updateEntry, deleteEntry } from '../services/vault.js';
import { showToast } from './toast.js';

const ICONS = ['⬡','🔑','🛡','🔐','⚡','🌐','💎','🚀','🔥','🌊','⚙️','📡','💬','🖥','☁️','🐙'];

let modalEl, editingId = null, afterSave = null;

export function mountModal() {
  modalEl = document.getElementById('modal-overlay');
  modalEl?.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });
}

// ── Simple confirm modal (unchanged API for existing callers) ─────────────────
export function openModal(html, onConfirm = null) {
  modalEl.innerHTML = `
    <div class="modal">
      <div class="modal-body">${typeof html === 'string' ? html : ''}</div>
      ${onConfirm ? `<div class="modal-actions">
        <button id="mc" class="btn-ghost">Cancel</button>
        <button id="mo" class="btn-primary">Confirm</button>
      </div>` : ''}
    </div>`;
  modalEl.classList.remove('hidden');
  modalEl.querySelector('#mc')?.addEventListener('click', closeModal);
  modalEl.querySelector('#mo')?.addEventListener('click', () => { onConfirm(); closeModal(); });
}

export function closeModal() {
  modalEl.classList.add('hidden');
  modalEl.innerHTML = '';
  editingId = null;
  afterSave = null;
}

// ── Add / Edit form modal ─────────────────────────────────────────────────────
export function openAddModal(onDone) {
  editingId = null;
  afterSave = onDone;
  buildForm(null);
}

export function openEditModal(id, onDone) {
  const entry = getEntries().find(e => e.id === id);
  if (!entry) return;
  editingId = id;
  afterSave = onDone;
  buildForm(entry);
}

function buildForm(e) {
  const selIcon   = e?.icon   ?? ICONS[0];
  const selStatus = e?.status ?? 'active';

  modalEl.innerHTML = `
    <div class="modal" style="max-width:380px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <span style="font-size:11px;font-weight:700;letter-spacing:.2em;color:var(--text-accent)">${editingId ? 'EDIT ENTRY' : 'NEW ENTRY'}</span>
        <button class="panel-close" id="formClose">×</button>
      </div>
      <div class="modal-body">
        <label class="form-label">Icon</label>
        <div class="icon-picker" id="iconPicker">
          ${ICONS.map(ic => `<div class="icon-opt${ic === selIcon ? ' selected' : ''}" data-icon="${ic}">${ic}</div>`).join('')}
        </div>
        <label class="form-label">Status</label>
        <div class="status-select">
          <div class="status-opt active-opt${selStatus === 'active'   ? ' selected' : ''}" data-s="active">Active</div>
          <div class="status-opt inactive-opt${selStatus === 'inactive' ? ' selected' : ''}" data-s="inactive">Inactive</div>
          <div class="status-opt pending-opt${selStatus === 'pending'  ? ' selected' : ''}" data-s="pending">Pending</div>
        </div>
        <label class="form-label">Name *</label>
        <input class="form-input" id="fn"   placeholder="e.g. Discord Bot"  value="${escA(e?.name ?? '')}"/>
        <label class="form-label">Category</label>
        <input class="form-input" id="fcat" placeholder="Admin, Discord…"   value="${escA(e?.category ?? '')}"/>
        <label class="form-label">Username / Email</label>
        <input class="form-input" id="fu"   placeholder="user@example.com"  value="${escA(e?.username ?? '')}"/>
        <label class="form-label">Password / Token</label>
        <div class="pass-wrap">
          <input class="form-input" id="fp" type="password" placeholder="••••••••" value="${escA(e?.password ?? '')}"/>
          <button class="pass-toggle" id="ptog" type="button">👁</button>
        </div>
        <label class="form-label">URL</label>
        <input class="form-input" id="furl" placeholder="https://"          value="${escA(e?.url ?? '')}"/>
        <label class="form-label">Notes</label>
        <textarea class="form-input" id="fnotes">${esc(e?.notes ?? '')}</textarea>
        <label class="form-label">Tags <span style="color:var(--text-muted);font-weight:400">(comma-separated)</span></label>
        <input class="form-input" id="ftags" placeholder="admin, primary"   value="${escA((e?.tags ?? []).join(', '))}"/>
      </div>
      <div class="form-footer" style="margin-top:14px">
        ${editingId ? `<button class="btn-form-delete" id="fdel">Delete</button>` : ''}
        <button class="btn-form-cancel" id="fcan">Cancel</button>
        <button class="btn-form-save"   id="fsav">Save</button>
      </div>
    </div>`;

  modalEl.classList.remove('hidden');

  // Icon picker
  modalEl.querySelector('.icon-picker').addEventListener('click', ev => {
    const o = ev.target.closest('.icon-opt');
    if (!o) return;
    modalEl.querySelectorAll('.icon-opt').forEach(x => x.classList.remove('selected'));
    o.classList.add('selected');
  });

  // Status selector
  modalEl.querySelector('.status-select').addEventListener('click', ev => {
    const o = ev.target.closest('.status-opt');
    if (!o) return;
    modalEl.querySelectorAll('.status-opt').forEach(x => x.classList.remove('selected'));
    o.classList.add('selected');
  });

  // Pass toggle
  document.getElementById('ptog').addEventListener('click', () => {
    const inp = document.getElementById('fp');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('formClose').addEventListener('click', closeModal);
  document.getElementById('fcan').addEventListener('click', closeModal);
  document.getElementById('fsav').addEventListener('click', saveForm);
  document.getElementById('fdel')?.addEventListener('click', () => {
    if (!editingId || !confirm('Delete this entry?')) return;
    deleteEntry(editingId);
    closeModal();
    afterSave?.();
    showToast('Entry deleted');
  });
}

function saveForm() {
  const name = document.getElementById('fn').value.trim();
  if (!name) { document.getElementById('fn').focus(); return; }

  const icon   = modalEl.querySelector('.icon-opt.selected')?.dataset.icon ?? ICONS[0];
  const status = modalEl.querySelector('.status-opt.selected')?.dataset.s  ?? 'active';

  const data = {
    name,
    category: document.getElementById('fcat').value.trim()   || 'General',
    icon, status,
    username: document.getElementById('fu').value.trim(),
    password: document.getElementById('fp').value.trim(),
    url:      document.getElementById('furl').value.trim(),
    notes:    document.getElementById('fnotes').value.trim(),
    tags:     document.getElementById('ftags').value.split(',').map(s => s.trim()).filter(Boolean),
  };

  if (editingId) {
    updateEntry(editingId, data);
    showToast('Entry updated');
  } else {
    addEntry(data);
    showToast('Entry added');
  }

  closeModal();
  afterSave?.();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function esc(s)  { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escA(s) { return esc(s); }
