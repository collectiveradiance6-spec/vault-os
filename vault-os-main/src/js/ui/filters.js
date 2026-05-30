// ─────────────────────────────────────────────────────────────────────────────
// src/js/ui/filters.js — category filter chip bar
// ─────────────────────────────────────────────────────────────────────────────

import { state, setState } from '../core/state.js';
import { getCategories } from '../services/vault.js';
import { renderCards } from '../components/cards.js';

export function renderFilters() {
  const row = document.getElementById('filterRow');
  if (!row) return;

  const cats = getCategories();
  row.innerHTML = '';

  cats.forEach(cat => {
    const chip = document.createElement('button');
    chip.className = `filter-chip${cat === state.activeFilter ? ' active' : ''}`;
    chip.textContent = cat === 'All'
      ? `All (${state.entries.length})`
      : cat;

    chip.addEventListener('click', () => {
      setState({ activeFilter: cat });
      renderFilters();
      renderCards();
    });

    row.appendChild(chip);
  });
}
