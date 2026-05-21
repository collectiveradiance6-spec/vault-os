const canvas = document.getElementById('bgCanvas');
const ctx = canvas?.getContext('2d');

export function initParticles() {
  if (!canvas || !ctx) return;

  resize();
  window.addEventListener('resize', resize);
  animate();
}

function resize() {
  if (!canvas) return;
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

function animate() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  requestAnimationFrame(animate);
}
