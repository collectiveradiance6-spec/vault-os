export function openPanel() {
  document.getElementById('panel')?.classList.add('active');
  document.getElementById('panelOverlay')?.classList.add('active');
}

export function closePanel() {
  document.getElementById('panel')?.classList.remove('active');
  document.getElementById('panelOverlay')?.classList.remove('active');
}
