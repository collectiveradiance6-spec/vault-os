import { getState, setState } from '../../core/state.js';
import { addLog } from '../../services/vault.js';

const PIN = '202020';

export function mount() {
  const lockScreen = document.getElementById('lockScreen');
  if (!lockScreen) return;

  buildKeypad();
  renderDots();
  startLockClock();
}

export function dismiss() {
  const el = document.getElementById('lockScreen');
  if (el) el.classList.add('fade-out');
  addLog('Vault unlocked', 'ok');
}

function buildKeypad() {
  const kp = document.getElementById('keypad');
  if (!kp) return;
  kp.innerHTML = '';
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].forEach(k => {
    const b = document.createElement('div');
    b.className = 'key' + (k === 'OK' ? ' enter-btn' : k === '⌫' ? ' action' : '');
    b.textContent = k;
    b.addEventListener('click', () => pressKey(k));
    b.addEventListener('pointermove', ev => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--rx', ((ev.clientX - r.left) / r.width * 100) + '%');
      b.style.setProperty('--ry', ((ev.clientY - r.top) / r.height * 100) + '%');
    });
    kp.appendChild(b);
  });
}

function renderDots() {
  const d = document.getElementById('dots');
  if (!d) return;
  d.innerHTML = '';
  const pinInput = getState('pinInput') || '';
  for (let i = 0; i < PIN.length; i++) {
    const el = document.createElement('div');
    el.className = 'dot' + (i < pinInput.length ? ' filled' : '');
    d.appendChild(el);
  }
}

function pressKey(k) {
  let pinInput = getState('pinInput') || '';
  if (k === '⌫') pinInput = pinInput.slice(0, -1);
  else if (k === 'OK') checkPin();
  else if (pinInput.length < PIN.length) {
    pinInput += k;
    if (pinInput.length === PIN.length) checkPin();
  }
  setState({ pinInput });
  renderDots();
}

function checkPin() {
  const pinInput = getState('pinInput') || '';
  if (pinInput === PIN) {
    dismiss();
  } else {
    let attempts = (getState('pinAttempts') || 0) + 1;
    setState({ pinAttempts: attempts, pinInput: '' });
    document.querySelectorAll('.dot').forEach(d => d.classList.add('error'));
    setTimeout(renderDots, 400);
    const h = document.getElementById('lockHint');
    if (h) h.textContent = attempts >= 3 ? 'Hint: 2 · 0 · 2 · 0 · 2 · 0' : 'Incorrect PIN';
  }
  renderDots();
}

function startLockClock() {
  function tick() {
    const now = new Date();
    const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const d = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    const lockClock = document.getElementById('lockClock');
    const lockDate = document.getElementById('lockDate');
    if (lockClock) lockClock.textContent = t;
    if (lockDate) lockDate.textContent = d;
  }
  tick();
  setInterval(tick, 1000);
}
