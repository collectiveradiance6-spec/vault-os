import { subscribe, getState } from '../core/state.js';
import { logout, loginWithDiscord } from '../core/auth.js';
import { navigate } from '../core/router.js';
import { initDock } from './dock.js';
import { initVault } from '../services/vault.js';

export function initUI() {
  initVault();

  const app = document.getElementById('app');
  app.innerHTML = `
    <canvas id="bgCanvas"></canvas>
    <div id="vault-shell">
      <header id="topbar">
        <span class="topbar-brand">⬡ VAULT OS</span>
        <div class="topbar-right">
          <span id="topbar-user"></span>
          <button id="btn-logout" class="topbar-btn" style="display:none">LOGOUT</button>
        </div>
      </header>
      <main id="viewport"></main>
      <div id="dock-container"></div>
    </div>
    <div id="modal-overlay" class="hidden"></div>
  `;

  initDock();

  subscribe('user', user => {
    const userEl = document.getElementById('topbar-user');
    const logoutBtn = document.getElementById('btn-logout');
    if (user) {
      userEl.textContent = `${user.username} · ${user.role.toUpperCase()}`;
      logoutBtn.style.display = '';
    } else {
      userEl.textContent = '';
      logoutBtn.style.display = 'none';
    }
  });

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    logout();
    navigate('lockscreen');
  });
}

export const getViewport = () => document.getElementById('viewport');
