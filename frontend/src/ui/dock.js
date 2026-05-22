import { navigate } from '../core/router.js';
import { getState, subscribe } from '../core/state.js';
import { canAccess } from '../core/permissions.js';

const ITEMS = [
  { id: 'dashboard', label: '⬡', title: 'Dashboard' },
  { id: 'admin',     label: '⚙', title: 'Admin' },
  { id: 'settings',  label: '◈', title: 'Settings' },
];

export function initDock() {
  const el = document.getElementById('dock-container');
  const render = () => {
    const locked = getState('locked');
    const active = getState('activeModule');
    el.innerHTML = locked ? '' : `
      <nav id="dock">
        ${ITEMS.filter(i => canAccess(i.id)).map(i => `
          <button class="dock-btn${active === i.id ? ' active' : ''}" data-module="${i.id}" title="${i.title}">${i.label}</button>
        `).join('')}
      </nav>`;
    el.querySelectorAll('.dock-btn').forEach(b => b.addEventListener('click', () => navigate(b.dataset.module)));
  };
  subscribe('activeModule', render);
  subscribe('locked', render);
}
