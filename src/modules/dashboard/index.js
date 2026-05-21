import { getViewport } from '../../ui/ui.js';
import { getEntries, addEntry, deleteEntry, searchEntries } from '../../services/vault.js';
import { openModal } from '../../ui/modal.js';
import { getState } from '../../core/state.js';

export function mount() {
  const vp = getViewport();
  const user = getState('user');

  vp.innerHTML = `
    <div id="dashboard">
      <div class="dash-header">
        <h2 class="dash-title">VAULT DASHBOARD</h2>
        <span class="dash-meta">${user?.username?.toUpperCase()} · ${new Date().toLocaleDateString()}</span>
      </div>
      <div class="dash-toolbar">
        <input type="text" id="vault-search" class="vault-search" placeholder="Search entries..." />
        <button id="btn-add-entry" class="btn-primary">+ NEW ENTRY</button>
      </div>
      <div id="vault-grid" class="vault-grid"></div>
    </div>
  `;

  _renderGrid(getEntries());

  document.getElementById('vault-search').addEventListener('input', e => {
    const q = e.target.value;
    _renderGrid(q ? searchEntries(q) : getEntries());
  });

  document.getElementById('btn-add-entry').addEventListener('click', _openAddModal);
}

function _renderGrid(entries) {
  const grid = document.getElementById('vault-grid');
  if (!grid) return;

  if (!entries.length) {
    grid.innerHTML = `<div class="vault-empty">NO ENTRIES. ADD ONE TO BEGIN.</div>`;
    return;
  }

  grid.innerHTML = entries.map(e => `
    <div class="vault-card" data-id="${e.id}">
      <div class="card-icon">${e.icon || '⬡'}</div>
      <div class="card-body">
        <div class="card-name">${e.name}</div>
        <div class="card-cat">${e.category || 'Uncategorized'}</div>
      </div>
      <div class="card-actions">
        <button class="card-btn btn-copy" data-value="${e.username}" title="Copy username">⊕</button>
        <button class="card-btn btn-delete" data-id="${e.id}" title="Delete">✕</button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => navigator.clipboard.writeText(btn.dataset.value || ''));
  });

  grid.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      openModal('Delete this entry?', () => {
        deleteEntry(btn.dataset.id);
        _renderGrid(getEntries());
      });
    });
  });
}

function _openAddModal() {
  openModal(`
    <h3>NEW VAULT ENTRY</h3>
    <input id="new-name" class="lock-input" placeholder="Name (e.g. GitHub)" />
    <input id="new-cat" class="lock-input" placeholder="Category" />
    <input id="new-user" class="lock-input" placeholder="Username" />
    <input id="new-pass" class="lock-input" type="password" placeholder="Password" />
    <input id="new-url" class="lock-input" placeholder="URL" />
  `, () => {
    addEntry({
      name: document.getElementById('new-name').value,
      category: document.getElementById('new-cat').value,
      username: document.getElementById('new-user').value,
      password: document.getElementById('new-pass').value,
      url: document.getElementById('new-url').value,
      icon: '⬡',
      tags: [],
    });
    _renderGrid(getEntries());
  });
}
