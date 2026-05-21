const panel =
  document.getElementById('panel');

const overlay =
  document.getElementById('panelOverlay');

export function openPanel(){

  panel.classList.add('active');

  overlay.classList.add('active');

}

export function closePanel(){

  panel.classList.remove('active');

  overlay.classList.remove('active');

}