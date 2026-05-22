// ─────────────────────────────────────────────────────────────────────────────
// src/js/components/cards.js — Vault OS credential card grid
// ─────────────────────────────────────────────────────────────────────────────

import { getFilteredEntries } from '../services/vault.js';
import { openPanel } from './panel.js';
import { openEditModal } from './modal.js';

export function renderCards() {
  const grid = document.getElementById('home');
  if (!grid) return;

  const list = getFilteredEntries();
  grid.innerHTML = '';

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">No credentials found</div>
      </div>`;
    return;
  }

  list.forEach((entry, i) => {
    const card = document.createElement('div');
    card.className = `card${entry.pinned ? ' pinned' : ''}`;
    card.style.animationDelay = (i * 0.04) + 's';
    card.dataset.id = entry.id;

    card.innerHTML = `
      <div class="card-header">
        <div class="card-icon-wrap">${entry.icon || '🔑'}</div>
        <div class="card-title-wrap">
          <div class="card-title">${escHtml(entry.t)}</div>
          <div class="card-category">${escHtml(entry.cat)}</div>
        </div>
      </div>
      <div class="card-divider"></div>
      <div class="card-footer">
        <div class="status-badge ${entry.status}">
          <span class="status-dot"></span>
          ${capitalize(entry.status)}
        </div>
        <div class="card-time">${escHtml(entry.lastUsed || '—')}</div>
      </div>
      ${entry.tags?.length ? `
        <div class="card-tags">
          ${entry.tags.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}
        </div>` : ''}
      <div class="card-actions">
        <button class="card-action-btn primary" data-action="view">View</button>
        <button class="card-action-btn"         data-action="edit">Edit</button>
      </div>`;

    // shimmer follow
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--cx', ((e.clientX - r.left) / r.width  * 100) + '%');
      card.style.setProperty('--cy', ((e.clientY - r.top)  / r.height * 100) + '%');
    });

    // click delegation
    card.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'edit') { openEditModal(entry.id); return; }
      openPanel(entry.id);
    });

    // long-press → edit (mobile)
    let lpt;
    card.addEventListener('touchstart', e => {
      const touch = e.touches[0];
      spawnRing(touch.clientX, touch.clientY);
      lpt = setTimeout(() => openEditModal(entry.id), 650);
    }, { passive: true });
    card.addEventListener('touchend',  () => clearTimeout(lpt));
    card.addEventListener('touchmove', () => clearTimeout(lpt));

    grid.appendChild(card);
  });
}

// ── helpers ───────────────────────────────────────────────────────────────────
function spawnRing(x, y) {
  const el = document.createElement('div');
  el.className = 'lp-ring';
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
