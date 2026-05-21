// src/js/core/mobile.js

export function isMobile() {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}