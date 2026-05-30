import { throttle } from '../core/performance.js';

export function mountFluidBg() {
  let tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener('pointermove', throttle(e => {
    tx = (e.clientX / innerWidth  - .5) * 14;
    ty = (e.clientY / innerHeight - .5) * 14;
  }, 16));
  (function loop() {
    cx += (tx - cx) * .07; cy += (ty - cy) * .07;
    document.documentElement.style.setProperty('--px', cx + 'px');
    document.documentElement.style.setProperty('--py', cy + 'px');
    requestAnimationFrame(loop);
  })();
}
