import { getState, setState } from '../../core/state.js';
import { loadPersistedState } from '../../services/storage.js';
import { emit } from '../../core/eventBus.js';
import { navigate } from '../../core/router.js';

const STUB_PIN = '000000';
let enteredPin = '';

export function renderLockscreen() {
  const el = document.getElementById('lockScreen');
  if (!el) return;
  const { locked } = getState();
  el.classList.toggle('hidden', !locked);
  el.classList.remove('fade-out');
  if (!locked) { enteredPin = ''; return; }
  el.innerHTML = `
    <div class="lock-inner">
      <h1>Vault OS</h1>
      <p class="lock-hint">Enter 6-digit PIN</p>
      <div class="pin-dots" aria-hidden="true">${'•'.repeat(enteredPin.length)}${'○'.repeat(6 - enteredPin.length)}</div>
      <div class="pin-pad">
        ${[1,2,3,4,5,6,7,8,9,'clear',0,'back'].map(k => {
          const label = k === 'clear' ? 'C' : k === 'back' ? '⌫' : k;
          return `<button type="button" data-key="${k}">${label}</button>`;
        }).join('')}
      </div>
    </div>
  `;
  el.querySelector('.pin-pad')?.addEventListener('click', onPadClick);
}

function onPadClick(e) {
  const btn = e.target.closest('[data-key]');
  if (!btn) return;
  const key = btn.dataset.key;
  if (key === 'clear') enteredPin = '';
  else if (key === 'back') enteredPin = enteredPin.slice(0, -1);
  else enteredPin += String(key);
  renderLockscreen();
  if (enteredPin.length >= 6) tryUnlock();
}

function tryUnlock() {
  if (enteredPin === STUB_PIN) unlock();
  else { enteredPin = ''; renderLockscreen(); emit('lock:denied', null); }
}

export function lock() {
  enteredPin = '';
  setState({ locked: true });
  emit('lock:locked', null);
  renderLockscreen();
}

export function unlock() {
  enteredPin = '';
  const el = document.getElementById('lockScreen');
  el?.classList.add('fade-out');
  setTimeout(() => {
    setState({ locked: false });
    emit('lock:unlocked', null);
    renderLockscreen();
    navigate(getState().activeModule || 'dashboard');
  }, 280);
}

export function bootLockscreen() { renderLockscreen(); }