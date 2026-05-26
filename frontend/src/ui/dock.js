import { navigate }           from '../core/router.js';
import { getState, subscribe } from '../core/state.js';
import { canAccess }           from '../core/permissions.js';

const ITEMS = [
  { id: 'dashboard', icon: '🔑', label: 'Vault' },
  { id: 'admin',     icon: '⚙️', label: 'Admin' },
  { id: 'settings',  icon: '◈',  label: 'Settings' },
];

export function initDock() {
  const container = document.getElementById('dock-container');
  const render = () => {
    const locked = getState('locked');
    const active = getState('activeModule');
    container.innerHTML = locked ? '' : `
      <nav id="dock">
        ${ITEMS.filter(i => canAccess(i.id)).map(i => `
          <button class="dock-btn${active === i.id ? ' active' : ''}" data-module="${i.id}">
            <span class="dock-icon">${i.icon}</span>
            <span>${i.label}</span>
          </button>`).join('')}
      </nav>`;
    container.querySelectorAll('.dock-btn')
      .forEach(b => b.addEventListener('click', () => navigate(b.dataset.module)));
  };
  subscribe('activeModule', render);
  subscribe('locked', render);
}
