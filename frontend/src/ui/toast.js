let el, timer;

export function mountToast() {
  el = document.getElementById('toast');
}

export function showToast(msg, ms = 2300) {
  if (!el) return;
  clearTimeout(timer);
  el.textContent = msg;
  el.classList.add('show');
  timer = setTimeout(() => el?.classList.remove('show'), ms);
}
