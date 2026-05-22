// ─────────────────────────────────────────────────────────────────────────────
// src/js/ui/fluid-bg.js — pointer-reactive CSS variable gradient
// ─────────────────────────────────────────────────────────────────────────────

import { throttle } from '../core/performance.js';

export function mountFluidBg() {
  let tx = 0, ty = 0, cx = 0, cy = 0;

  const onMove = throttle(e => {
    tx = (e.clientX / innerWidth  - 0.5) * 14;
    ty = (e.clientY / innerHeight - 0.5) * 14;
  }, 16);

  window.addEventListener('pointermove', onMove);

  (function animate() {
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    document.documentElement.style.setProperty('--px', cx + 'px');
    document.documentElement.style.setProperty('--py', cy + 'px');
    requestAnimationFrame(animate);
  })();
}
