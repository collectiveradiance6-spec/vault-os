let timer;
export function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  clearTimeout(timer);
  t.textContent = msg; t.classList.add('show');
  timer = setTimeout(() => t.classList.remove('show'), 2200);
}
