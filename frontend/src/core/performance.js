import { isMobile } from './mobile.js';

export const runDeferred = fn => requestAnimationFrame(() => requestAnimationFrame(fn));
export const runSafe = fn => typeof requestIdleCallback !== 'undefined' ? requestIdleCallback(fn) : setTimeout(fn, 1);
export const safeParticles = fn => { if (!isMobile()) runDeferred(fn); };
