import { navigate } from '../core/router.js';
import { getState, subscribe } from '../core/state.js';
import { canAccess } from '../core/permissions.js';

const DOCK_ITEMS = [
  { id: 'dashboard', label: '⬡', title: 'Dashboard' },
  { id: 'admin', label: '⚙', title: 'Admin' },
  { id: 'settings', label: '◈', title: 'Settings' },
];

export function initDock() {
  const container = document.getElementById('dock-container');
  _render(container);

  subscribe('activeModule', () => _render(container));
  subscribe('user', () => _render(container));
}

function _render(container) {
  const active = getState('activeModule');
  const locked = getState('locked');

  container.innerHTML = locked ? '' : `
    <nav id="dock">
      ${DOCK_ITEMS
        .filter(item => canAccess(item.id))
        .map(item => `
          <button
            class="dock-btn ${active === item.id ? 'active' : ''}"
            data-module="${item.id}"
            title="${item.title}"
          >${item.label}</button>
        `).join('')}
    </nav>
  `;

  container.querySelectorAll('.dock-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.module));
  });
}
