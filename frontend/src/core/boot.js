import { initApp }           from './app.js';
import { handleAuthCallback } from '../auth-callback.js';

function setVH() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}

function boot() {
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);

  // Handle Discord OAuth redirect — token in hash
  if (window.location.hash.includes('token=')) {
    handleAuthCallback();
  }

  requestAnimationFrame(() => initApp().catch(err => console.error('[Boot] Fatal:', err)));
}

document.addEventListener('DOMContentLoaded', boot);
