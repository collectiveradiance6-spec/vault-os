import { loginWithDiscord } from '../../core/auth.js';

export function mount() {
  // lockscreen is already in the static HTML shell — just wire the button
  const btn = document.getElementById('btn-discord-login');
  if (btn) btn.addEventListener('click', loginWithDiscord);
}

export function dismiss() {
  const el = document.getElementById('lockScreen');
  if (el) el.classList.add('fade-out');
}
