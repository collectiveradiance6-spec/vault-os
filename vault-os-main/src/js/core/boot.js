// ─────────────────────────────────────────────────────────────────────────────
// src/js/core/boot.js — Vault OS entry point
// ─────────────────────────────────────────────────────────────────────────────

import { initApp } from '../app.js';

function setVH() {
  document.documentElement.style.setProperty(
    '--vh', `${window.innerHeight * 0.01}px`
  );
}

function boot() {
  setVH();
  window.addEventListener('resize',            setVH);
  window.addEventListener('orientationchange', setVH);
  requestAnimationFrame(initApp);
}

document.addEventListener('DOMContentLoaded', boot);
