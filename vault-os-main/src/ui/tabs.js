import { getState, setState } from '../core/state.js';
import { renderVault }    from './vault-tab.js';
import { renderSettings } from './settings-tab.js';

const TABS = ['creds', 'vault', 'settings'];
const TITLES = {
  creds:    ['Credentials', 'Admin access vault'],
  vault:    ['Vault',       'Security overview'],
  settings: ['Settings',   'Preferences'],
};

export function mountTabs() {
  TABS.forEach(tab => {
    document.getElementById('dock-' + tab)
      ?.addEventListener('click', () => switchTab(tab));
  });
}

export function switchTab(tab) {
  setState({ activeTab: tab });
  TABS.forEach(t => {
    const el = document.getElementById('tab' + cap(t));
    if (!el) return;
    el.style.display = t === tab ? (t === 'creds' ? 'flex' : 'block') : 'none';
    document.getElementById('dock-' + t)?.classList.toggle('active', t === tab);
  });
  const [title, sub] = TITLES[tab] ?? ['', ''];
  const titleEl = document.getElementById('tabTitle');
  const subEl   = document.getElementById('tabSub');
  if (titleEl) titleEl.textContent = title;
  if (subEl)   subEl.textContent   = sub;
  if (tab === 'vault')    renderVault();
  if (tab === 'settings') renderSettings();
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }