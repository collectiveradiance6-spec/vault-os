// ─────────────────────────────────────────────────────────────────────────────
// src/js/ui/toast.js — ephemeral toast notifications
// ─────────────────────────────────────────────────────────────────────────────

let toastEl, hideTimer;

export function mountToast() {
  toastEl = document.getElementById('toast');
}

export function showToast(msg, duration = 2200) {
  if (!toastEl) return;
  clearTimeout(hideTimer);
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  hideTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
}
