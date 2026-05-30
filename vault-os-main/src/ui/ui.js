import { subscribe } from '../core/state.js';
import { initDock } from './dock.js';

export function initUI() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <canvas id="bgCanvas"></canvas>
    <div id="vault-shell">
      <div id="topbar">
        <span class="topbar-brand">VAULT OS</span>
        <span id="topbar-user"></span>
        <button id="btn-logout" class="topbar-btn" style="display:none">LOGOUT</button>
      </div>
      <div id="viewport"></div>
      <div id="dock-container"></div>
    </div>
    <div id="modal-overlay" class="hidden"></div>
  `;

  initDock();
  _bindTopbar();

  // React to auth state
  subscribe('user', user => {
    const el = document.getElementById('topbar-user');
    const btn = document.getElementById('btn-logout');
    if (user) {
      el.textContent = `${user.username} [${user.role}]`;
      btn.style.display = '';
    } else {
      el.textContent = '';
      btn.style.display = 'none';
    }
  });
}

function _bindTopbar() {
  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    const { logout } = await import('../core/auth.js');
    const { navigate } = await import('../core/router.js');
    logout();
    navigate('lockscreen');
  });
}

export function getViewport() {
  return document.getElementById('viewport');
}
