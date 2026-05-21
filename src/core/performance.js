import { isMobile } from './mobile.js';

export function runSafe(task) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(task);
  } else {
    setTimeout(task, 1);
  }
}

export function runDeferred(task) {
  requestAnimationFrame(() => requestAnimationFrame(task));
}

export function safeParticles(initFn) {
  if (isMobile()) return;
  runDeferred(initFn);
}
