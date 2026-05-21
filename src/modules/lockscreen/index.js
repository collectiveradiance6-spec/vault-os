import { getViewport } from '../../ui/ui.js';
import { login } from '../../core/auth.js';
import { navigate } from '../../core/router.js';

export function mount() {
  const vp = getViewport();
  vp.innerHTML = `
    <div id="lockscreen">
      <div class="lock-core">
        <div class="lock-glyph">⬡</div>
        <h1 class="lock-title">VAULT OS</h1>
        <p class="lock-sub">SECURE RUNTIME — AUTHENTICATE TO CONTINUE</p>
        <form id="lock-form" class="lock-form" autocomplete="off">
          <input type="text" id="lock-user" placeholder="USERNAME" class="lock-input" />
          <input type="password" id="lock-pass" placeholder="PASSWORD" class="lock-input" />
          <button type="submit" class="lock-btn">AUTHENTICATE</button>
        </form>
        <p id="lock-error" class="lock-error hidden">ACCESS DENIED</p>
      </div>
    </div>
  `;

  document.getElementById('lock-form').addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('lock-user').value.trim();
    const pass = document.getElementById('lock-pass').value;
    const err = document.getElementById('lock-error');

    const ok = login(user, pass);
    if (ok) {
      err.classList.add('hidden');
      navigate('dashboard');
    } else {
      err.classList.remove('hidden');
      document.getElementById('lock-pass').value = '';
    }
  });
}
