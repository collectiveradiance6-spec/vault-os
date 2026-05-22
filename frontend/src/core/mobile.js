const _mobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
  || window.matchMedia('(max-width: 768px)').matches;

export const isMobile = () => _mobile;
export const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
