export function mountClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const tick = () => el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  tick(); setInterval(tick, 1000);
}
