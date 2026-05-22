const el = () => document.getElementById('modal-overlay');

export function openModal(html, onConfirm = null) {
  const o = el();
  o.innerHTML = `
    <div class="modal">
      <div class="modal-body">${html}</div>
      ${onConfirm ? `<div class="modal-actions">
        <button id="mc" class="btn-ghost">Cancel</button>
        <button id="mo" class="btn-primary">Confirm</button>
      </div>` : ''}
    </div>`;
  o.classList.remove('hidden');
  o.querySelector('#mc')?.addEventListener('click', closeModal);
  o.querySelector('#mo')?.addEventListener('click', () => { onConfirm(); closeModal(); });
  o.addEventListener('click', e => { if (e.target === o) closeModal(); });
}

export function closeModal() {
  const o = el();
  o.classList.add('hidden');
  o.innerHTML = '';
}
