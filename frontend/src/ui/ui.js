import { subscribe, getState } from '../core/state.js';
import { logout, loginWithDiscord } from '../core/auth.js';
import { navigate }   from '../core/router.js';
import { initDock }   from './dock.js';
import { initVault }  from '../services/vault.js';
import { mountPanel } from './panel.js';
import { mountModal } from './modal.js';
import { mountToast } from './toast.js';

export function initUI() {
  initVault();

  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Background layers -->
    <canvas id="bgCanvas"></canvas>
    <div class="energy"></div>
    <div class="vignette"></div>

    <!-- Toast -->
    <div class="toast" id="toast"></div>

    <!-- App shell -->
    <div id="vault-shell">
      <header id="topbar">
        <span class="topbar-brand">⬡ VAULT OS</span>
        <div class="status-pill" id="systemStatus">SECURE</div>
        <div class="topbar-right">
          <span id="topbar-user"></span>
          <button id="btn-logout" class="topbar-btn" style="display:none">LOGOUT</button>
        </div>
      </header>

      <main id="viewport"></main>

      <div id="dock-container"></div>
    </div>

    <!-- Detail bottom-sheet -->
    <div class="panel-overlay" id="panel-overlay"></div>
    <div class="bottom-panel"  id="detail-panel">
      <div class="panel-handle"></div>
      <div class="panel-header" id="panel-header"></div>
      <div class="panel-body"   id="panel-body"></div>
    </div>

    <!-- Modal overlay -->
    <div id="modal-overlay" class="hidden"></div>
  `;

  initDock();
  mountPanel();
  mountModal();
  mountToast();

  // Topbar user/logout reactivity
  subscribe('user', user => {
    const userEl   = document.getElementById('topbar-user');
    const logoutEl = document.getElementById('btn-logout');
    if (user) {
      userEl.textContent   = `${user.username} · ${user.role.toUpperCase()}`;
      logoutEl.style.display = '';
    } else {
      userEl.textContent   = '';
      logoutEl.style.display = 'none';
    }
  });

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    logout();
    navigate('lockscreen');
  });
}

export const getViewport = () => document.getElementById('viewport');
