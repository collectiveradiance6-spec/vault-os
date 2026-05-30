// ─────────────────────────────────────────────────────────────────────────────
// src/js/components/lockscreen.js — Vault OS PIN lock
// ─────────────────────────────────────────────────────────────────────────────

import { state, setState } from '../core/state.js';
import { addLog } from '../services/vault.js';

const PIN      = '202020';
const MAX_FAIL = 3;

let pinInput  = '';
let attempts  = 0;

// ── DOM refs (resolved after mount) ──────────────────────────────────────────
let lockEl, dotsEl, hintEl;

export function mountLockscreen() {
  lockEl  = document.getElementById('lockScreen');
  dotsEl  = document.getElementById('dots');
  hintEl  = document.getElementById('lockHint');

  buildKeypad();
  renderDots();
  startClock();
}

function buildKeypad() {
  const kp = document.getElementById('keypad');
  kp.innerHTML = '';

  ['1','2','3','4','5','6','7','8','9','⌫','0','OK'].forEach(k => {
    const btn = document.createElement('div');
    btn.className = `key${k === 'OK' ? ' enter-btn' : k === '⌫' ? ' action' : ''}`;
    btn.textContent = k;
    btn.addEventListener('click', () => pressKey(k));

    // ripple origin on hover
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--rx', ((e.clientX - r.left) / r.width * 100) + '%');
      btn.style.setProperty('--ry', ((e.clientY - r.top)  / r.height * 100) + '%');
    });

    kp.appendChild(btn);
  });
}

function renderDots() {
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  for (let i = 0; i < PIN.length; i++) {
    const d = document.createElement('div');
    d.className = `dot${i < pinInput.length ? ' filled' : ''}`;
    dotsEl.appendChild(d);
  }
}

function pressKey(k) {
  if (k === '⌫') {
    pinInput = pinInput.slice(0, -1);
  } else if (k === 'OK') {
    checkPin();
    return;
  } else if (pinInput.length < PIN.length) {
    pinInput += k;
    if (pinInput.length === PIN.length) checkPin();
  }
  renderDots();
}

function checkPin() {
  if (pinInput === PIN) {
    unlock();
  } else {
    attempts++;
    pinInput = '';

    // shake + error state
    document.querySelectorAll('.dot').forEach(d => d.classList.add('error'));
    setTimeout(renderDots, 400);

    if (hintEl) {
      hintEl.textContent = attempts >= MAX_FAIL
        ? 'Hint: 2 · 0 · 2 · 0 · 2 · 0'
        : `Incorrect PIN — ${MAX_FAIL - attempts} attempt${MAX_FAIL - attempts !== 1 ? 's' : ''} left`;
    }
  }
}

function unlock() {
  lockEl?.classList.add('fade-out');
  setState({ locked: false });
  addLog('Vault unlocked', 'ok');
}

// ── Lock screen clock ─────────────────────────────────────────────────────────
function startClock() {
  function tick() {
    const now  = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    const cl   = document.getElementById('lockClock');
    const dl   = document.getElementById('lockDate');
    if (cl) cl.textContent = time;
    if (dl) dl.textContent = date;
  }
  tick();
  setInterval(tick, 1000);
}
