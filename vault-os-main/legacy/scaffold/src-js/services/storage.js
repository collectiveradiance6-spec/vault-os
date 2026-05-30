export function loadVault() {
  return JSON.parse(localStorage.getItem('vault') || '[]');
}

export function saveVault(data) {
  localStorage.setItem('vault', JSON.stringify(data));
}
