import { initApp } from './app.js';

function setVH() {
  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`
  );
}

function boot() {
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);

  requestAnimationFrame(() => {
    initApp().catch(err => {
      console.error('[Boot] Fatal error:', err);
    });
  });
}

document.addEventListener('DOMContentLoaded', boot);
