// ─────────────────────────────────────────────────────────────────────────────
// src/js/core/performance.js — Vault OS perf helpers
// ─────────────────────────────────────────────────────────────────────────────

export function isMobile() {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

/**
 * Run a task when the browser is idle (or after a short delay on older engines).
 */
export function runIdle(task) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(task, { timeout: 2000 });
  } else {
    setTimeout(task, 16);
  }
}

/**
 * Throttle a function to at most once per `ms` milliseconds.
 */
export function throttle(fn, ms = 16) {
  let last = 0;
  return (...args) => {
    const now = performance.now();
    if (now - last < ms) return;
    last = now;
    return fn(...args);
  };
}

/**
 * Debounce: only fire after `ms` ms of silence.
 */
export function debounce(fn, ms = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Only init particles if not on mobile and particles setting is on.
 */
export function safeParticles(init, settingOn = true) {
  if (!settingOn || isMobile()) return;
  init();
}
