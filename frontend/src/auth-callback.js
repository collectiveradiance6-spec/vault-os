// Runs on /auth page after Discord redirects back
// Token arrives in URL fragment: /auth#token=xxx (never in query string)

const label = document.getElementById('label');
const errorEl = document.getElementById('error');

function showError(msg) {
  label.style.display = 'none';
  errorEl.style.display = 'block';
  errorEl.textContent = msg;
  setTimeout(() => { window.location.href = '/'; }, 3000);
}

(function handleCallback() {
  // Check for error in query string
  const params = new URLSearchParams(window.location.search);
  if (params.get('error')) {
    showError('AUTHENTICATION FAILED — REDIRECTING');
    return;
  }

  // Extract token from fragment
  const fragment = window.location.hash.slice(1);
  const fragParams = new URLSearchParams(fragment);
  const token = fragParams.get('token');

  if (!token) {
    showError('NO TOKEN RECEIVED — REDIRECTING');
    return;
  }

  // Persist token
  sessionStorage.setItem('vault_os_session', JSON.stringify({
    token,
    storedAt: Date.now(),
  }));

  // Clear fragment from URL for security, then redirect to app
  history.replaceState(null, '', '/auth');
  label.textContent = 'ACCESS GRANTED';
  setTimeout(() => { window.location.href = '/'; }, 800);
})();
