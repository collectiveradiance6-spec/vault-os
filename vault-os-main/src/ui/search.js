import { setState } from '../core/state.js';
import { renderCards } from '../js/components/cards.js';

let _debTimer;
export function mountSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    clearTimeout(_debTimer);
    _debTimer = setTimeout(() => {
      setState({ searchQuery: input.value });
      renderCards();
    }, 180);
  });
}
export function filterCards() {
  setState({ searchQuery: document.getElementById('searchInput')?.value ?? '' });
  renderCards();
}