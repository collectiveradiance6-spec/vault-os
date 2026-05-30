// ─────────────────────────────────────────────────────────────────────────────
// src/js/ui/search.js — live search bar
// ─────────────────────────────────────────────────────────────────────────────

import { setState } from '../core/state.js';
import { renderCards } from '../components/cards.js';
import { debounce } from '../core/performance.js';

export function mountSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  const handleInput = debounce(() => {
    setState({ searchQuery: input.value });
    renderCards();
  }, 180);

  input.addEventListener('input', handleInput);
}
