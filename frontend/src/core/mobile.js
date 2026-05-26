const _isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
  || window.matchMedia('(max-width: 768px)').matches;

export const isMobile = () => _isMobile;
export const isTouch  = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
