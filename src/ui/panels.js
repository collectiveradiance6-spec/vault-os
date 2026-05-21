let _activePanel = null;

export function openPanel(id) {
  closePanel();
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.classList.add('active');
  _activePanel = id;

  // Backdrop close
  document.addEventListener('keydown', _escClose);
}

export function closePanel() {
  if (!_activePanel) return;
  document.getElementById(_activePanel)?.classList.remove('active');
  _activePanel = null;
  document.removeEventListener('keydown', _escClose);
}

function _escClose(e) {
  if (e.key === 'Escape') closePanel();
}
