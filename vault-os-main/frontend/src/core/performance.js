import { isMobile } from './mobile.js';

export const runDeferred = task => requestAnimationFrame(() => requestAnimationFrame(task));
export const runSafe     = task => typeof requestIdleCallback !== 'undefined'
  ? requestIdleCallback(task) : setTimeout(task, 1);
export const safeParticles = fn => { if (!isMobile()) runDeferred(fn); };

export function throttle(fn, ms = 16) {
  let last = 0;
  return (...args) => {
    const now = performance.now();
    if (now - last < ms) return;
    last = now;
    return fn(...args);
  };
}

export function debounce(fn, ms = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
