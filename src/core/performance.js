export const isMobile = () => /Mobi|Android|iPhone/i.test(navigator.userAgent);
export const runDeferred = fn => requestAnimationFrame(() => requestAnimationFrame(fn));
export const runSafe = fn => typeof requestIdleCallback !== 'undefined' ? requestIdleCallback(fn) : setTimeout(fn, 1);
export const throttle = (fn, ms) => { let t = 0; return (...a) => { const n = performance.now(); if (n - t < ms) return; t = n; fn(...a); }; };
export const safeParticles = fn => { if (!isMobile()) runDeferred(fn); };
