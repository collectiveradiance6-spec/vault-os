import { getState, setState } from '../core/state.js';
import { getCategories } from '../services/vault.js';
import { renderCards } from '../js/components/cards.js';

export function renderFilters() {
  const row = document.getElementById('filterRow');
  if (!row) return;
  const cats   = getCategories();
  const active = getState('activeFilter');
  const total  = getState('entries').length;
  row.innerHTML = '';
  cats.forEach(cat => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip' + (cat === active ? ' active' : '');
    chip.textContent = cat === 'All' ? 'All (' + total + ')' : cat;
    chip.addEventListener('click', () => {
      setState({ activeFilter: cat });
      renderFilters();
      renderCards();
    });
    row.appendChild(chip);
  });
}