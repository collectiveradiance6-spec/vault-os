const modal =
  document.getElementById('modalOverlay');

export function openModal(){

  modal.classList.add('active');

}

export function closeModal(){

  modal.classList.remove('active');

}