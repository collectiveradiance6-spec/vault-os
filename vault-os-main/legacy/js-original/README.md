# Legacy `js/` tree

Pre-stabilization scripts lived at repo-root `js/`. Canonical implementations are under `src/`.

Root `js/` now holds **thin re-exports** for backward-compatible imports. Full originals are preserved in this folder where copied during stabilization.

`filters.js` and `tabs.js` here are **not** in the Vite boot graph. Active search/filter logic is `src/ui/search.js`. Root `js/filters.js` re-exports `filterCards` from there; `js/tabs.js` is an empty deprecation stub.
