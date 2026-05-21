const overlay = () => document.getElementById('modal-overlay');

export function openModal(html, onConfirm = null) {
  const el = overlay();
  el.innerHTML = `
    <div class="modal">
      <div class="modal-body">${html}</div>
      ${onConfirm ? `<div class="modal-actions">
        <button id="modal-cancel" class="btn-ghost">Cancel</button>
        <button id="modal-confirm" class="btn-primary">Confirm</button>
      </div>` : ''}
    </div>
  `;
  el.classList.remove('hidden');

  el.querySelector('#modal-cancel')?.addEventListener('click', closeModal);
  el.querySelector('#modal-confirm')?.addEventListener('click', () => {
    onConfirm?.();
    closeModal();
  });
  el.addEventListener('click', e => { if (e.target === el) closeModal(); });
}

export function closeModal() {
  const el = overlay();
  el.classList.add('hidden');
  el.innerHTML = '';
}
