import { getViewport } from '../../ui/ui.js';
import { getEntries, addEntry, deleteEntry, searchEntries } from '../../services/vault.js';
import { openModal } from '../../ui/modal.js';
import { getState } from '../../core/state.js';

export function mount() {
  const user = getState('user');
  getViewport().innerHTML = `
    <div id="dashboard">
      <div class="dash-header">
        <h2 class="dash-title">DASHBOARD</h2>
        <span class="dash-meta">${user?.username?.toUpperCase()} · ${new Date().toLocaleDateString()}</span>
      </div>
      <div class="dash-toolbar">
        <input id="vault-search" class="vault-search" placeholder="Search entries…" />
        <button id="btn-add" class="btn-primary">+ NEW ENTRY</button>
      </div>
      <div id="vault-grid" class="vault-grid"></div>
    </div>`;

  render(getEntries());

  document.getElementById('vault-search').addEventListener('input', e => {
    render(e.target.value ? searchEntries(e.target.value) : getEntries());
  });

  document.getElementById('btn-add').addEventListener('click', openAdd);
}

function render(entries) {
  const grid = document.getElementById('vault-grid');
  if (!grid) return;
  grid.innerHTML = !entries.length
    ? `<div class="vault-empty">NO ENTRIES — ADD ONE TO BEGIN</div>`
    : entries.map(e => `
      <div class="vault-card">
        <div class="card-icon">${e.icon || '⬡'}</div>
        <div class="card-body">
          <div class="card-name">${e.name}</div>
          <div class="card-cat">${e.category || 'General'}</div>
        </div>
        <div class="card-actions">
          <button class="card-btn btn-copy" data-val="${e.username || ''}" title="Copy username">⊕</button>
          <button class="card-btn btn-delete" data-id="${e.id}" title="Delete">✕</button>
        </div>
      </div>`).join('');

  grid.querySelectorAll('.btn-copy').forEach(b =>
    b.addEventListener('click', () => navigator.clipboard.writeText(b.dataset.val)));
  grid.querySelectorAll('.btn-delete').forEach(b =>
    b.addEventListener('click', () =>
      openModal('Delete this entry?', () => { deleteEntry(b.dataset.id); render(getEntries()); })));
}

function openAdd() {
  openModal(`
    <h3>NEW VAULT ENTRY</h3>
    <input id="n-name" class="lock-input" placeholder="Name" />
    <input id="n-cat"  class="lock-input" placeholder="Category" />
    <input id="n-user" class="lock-input" placeholder="Username" />
    <input id="n-pass" class="lock-input" type="password" placeholder="Password" />
    <input id="n-url"  class="lock-input" placeholder="URL" />`,
  () => {
    addEntry({
      name: document.getElementById('n-name').value,
      category: document.getElementById('n-cat').value,
      username: document.getElementById('n-user').value,
      password: document.getElementById('n-pass').value,
      url: document.getElementById('n-url').value,
      icon: '⬡', tags: [],
    });
    render(getEntries());
  });
}
