export function initUI() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="vault-shell">
      <div class="topbar">Vault OS</div>
      <div class="content"></div>
    </div>
  `;
}