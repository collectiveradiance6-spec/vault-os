// Single definition — no duplicates

const _isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
  || window.matchMedia('(max-width: 768px)').matches;

export function isMobile() {
  return _isMobile;
}

export function isTouch() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
