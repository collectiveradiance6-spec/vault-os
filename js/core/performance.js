// src/js/core/performance.js

export function runSafe(task) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(task);
  } else {
    setTimeout(task, 1);
  }
}
// src/js/core/performance.js

import { isMobile } from './mobile.js';

export function safeParticles(initParticles) {
  if (isMobile()) return;
  initParticles();
}
export function isMobile() {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

export function safeParticles(initParticles) {
  if (isMobile()) return;
  initParticles();
}