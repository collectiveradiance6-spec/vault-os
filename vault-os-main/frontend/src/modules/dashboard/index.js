import { getViewport }          from '../../ui/ui.js';
import { getState }             from '../../core/state.js';
import {
  getFilteredEntries,
  getCategories,
  getEntries,
}                               from '../../services/vault.js';
import { openPanel }            from '../../ui/panel.js';
import { openAddModal, openEditModal } from '../../ui/modal.js';
import { debounce }             from '../../core/performance.js';

let activeFilter = 'All';
let searchQ      = '';

export function mount() {
  const user = getState('user');

  getViewport().innerHTML = `
    <div id="dashboard">
      <div class="dash-header">
        <h2 class="dash-title">VAULT DASHBOARD</h2>
        <span class="dash-meta">${user?.username?.toUpperCase() ?? ''} · ${new Date().toLocaleDateString()}</span>
      </div>

      <div class="dash-toolbar">
        <div class="search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="vault-search" placeholder="Search credentials…" autocomplete="off"/>
        </div>
        <button id="btn-add" class="btn-primary">＋ NEW</button>
      </div>

      <div class="filter-row" id="filter-row"></div>
      <div class="vault-grid" id="vault-grid"></div>
    </div>`;

  buildFilters();
  renderGrid();

  // Search (debounced)
  document.getElementById('vault-search').addEventListener('input',
    debounce(e => { searchQ = e.target.value; renderGrid(); }, 180)
  );

  // Add button
  document.getElementById('btn-add').addEventListener('click', () => {
    openAddModal(() => { buildFilters(); renderGrid(); });
  });
}

// Called by panel after delete
export function refreshGrid() { buildFilters(); renderGrid(); }

// ── Filters ───────────────────────────────────────────────────────────────────
function buildFilters() {
  const row = document.getElementById('filter-row');
  if (!row) return;
  row.innerHTML = getCategories().map(c => `
    <button class="filter-chip${c === activeFilter ? ' active' : ''}" data-cat="${c}">
      ${c === 'All' ? `All (${getEntries().length})` : c}
    </button>`).join('');
  row.querySelectorAll('.filter-chip').forEach(chip =>
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.cat;
      buildFilters();
      renderGrid();
    })
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────────
function renderGrid() {
  const grid = document.getElementById('vault-grid');
  if (!grid) return;

  const list = getFilteredEntries(activeFilter, searchQ);

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">${searchQ ? 'No results' : 'No entries — add one to begin'}</div>
      </div>`;
    return;
  }

  grid.innerHTML = list.map((e, i) => `
    <div class="vault-card${e.pinned ? ' pinned' : ''}" data-id="${e.id}" style="animation-delay:${i * 0.04}s">
      <div class="card-header">
        <div class="card-icon-wrap">${e.icon}</div>
        <div class="card-title-wrap">
          <div class="card-name">${esc(e.name)}</div>
          <div class="card-cat">${esc(e.category)}</div>
        </div>
      </div>
      <div class="card-divider"></div>
      <div class="card-footer">
        <div class="status-badge ${e.status}">
          <span class="status-dot"></span>${cap(e.status)}
        </div>
        <div class="card-time">${esc(e.lastUsed)}</div>
      </div>
      ${e.tags?.length ? `<div class="card-tags">${e.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="card-actions">
        <button class="card-action-btn primary" data-action="view">View</button>
        <button class="card-action-btn"         data-action="edit">Edit</button>
      </div>
    </div>`).join('');

  grid.querySelectorAll('.vault-card').forEach(card => {
    const id = card.dataset.id;

    // Shimmer on hover
    card.addEventListener('pointermove', ev => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--cx', ((ev.clientX - r.left) / r.width  * 100) + '%');
      card.style.setProperty('--cy', ((ev.clientY - r.top)  / r.height * 100) + '%');
    });

    // Click delegation
    card.addEventListener('click', ev => {
      const action = ev.target.closest('[data-action]')?.dataset.action;
      if (action === 'edit') {
        openEditModal(id, () => { buildFilters(); renderGrid(); });
      } else {
        openPanel(id);
      }
    });

    // Long-press → edit (mobile)
    let lpt;
    card.addEventListener('touchstart', ev => {
      const touch = ev.touches[0];
      const ring = document.createElement('div');
      ring.className = 'lp-ring';
      ring.style.left = touch.clientX + 'px';
      ring.style.top  = touch.clientY + 'px';
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 700);
      lpt = setTimeout(() => openEditModal(id, () => { buildFilters(); renderGrid(); }), 650);
    }, { passive: true });
    card.addEventListener('touchend',  () => clearTimeout(lpt));
    card.addEventListener('touchmove', () => clearTimeout(lpt));
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
