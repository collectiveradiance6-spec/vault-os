// ─────────────────────────────────────────────────────────────────────────────
// src/js/ui/vault-tab.js — Vault overview tab
// ─────────────────────────────────────────────────────────────────────────────

import { state } from '../core/state.js';
import { getStats } from '../services/vault.js';

export function renderVault() {
  renderStats();
  renderLog();
}

function renderStats() {
  const el = document.getElementById('vaultStats');
  if (!el) return;
  const { total, active, pinned, pending } = getStats();
  el.innerHTML = `
    <div class="vault-stat">
      <div class="vault-stat-num" style="color:var(--success)">${active}</div>
      <div class="vault-stat-label">Active</div>
    </div>
    <div class="vault-stat">
      <div class="vault-stat-num" style="color:var(--accent1)">${total}</div>
      <div class="vault-stat-label">Total</div>
    </div>
    <div class="vault-stat">
      <div class="vault-stat-num" style="color:var(--warn)">${pinned}</div>
      <div class="vault-stat-label">Pinned</div>
    </div>
    <div class="vault-stat">
      <div class="vault-stat-num" style="color:var(--accent2)">${pending}</div>
      <div class="vault-stat-label">Pending</div>
    </div>`;
}

function renderLog() {
  const el = document.getElementById('activityLog');
  if (!el) return;

  if (!state.activityLog.length) {
    el.innerHTML = '<div class="log-empty">No activity yet</div>';
    return;
  }

  el.innerHTML = state.activityLog.slice(0, 30).map(l => `
    <div class="log-entry">
      <div class="log-dot ${l.type}"></div>
      <div>
        <div class="log-text">${escHtml(l.text)}</div>
        <div class="log-time">${escHtml(l.time)}</div>
      </div>
    </div>`).join('');
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
