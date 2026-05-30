import { getState } from '../../core/state.js';
import { on } from '../../core/eventBus.js';
import { filterCards } from '../../ui/search.js';

export function renderDashboard(root) {
  const { entries } = getState();
  root.innerHTML = `
    <section class="home credential-grid" id="vaultGrid">
      ${entries.map(e => `
        <article class="card glass" data-id="${e.id}">
          <div class="card-icon">${e.icon ?? '🔒'}</div>
          <h3>${escapeHtml(e.t)}</h3>
          <p class="card-meta">${escapeHtml(e.cat ?? '')}</p>
        </article>
      `).join('')}
    </section>
  `;
  filterCards();
}

export function bootDashboard() {
  on('state:change', () => {
    const s = getState();
    if (!s.locked && s.activeModule === 'dashboard') {
      const root = document.getElementById('moduleRoot');
      if (root) renderDashboard(root);
    }
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}