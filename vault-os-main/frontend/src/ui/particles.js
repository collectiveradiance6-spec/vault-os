const COLORS = ['#7c3aed', '#ff6fae', '#4df0c8', '#ffa855'];
const COUNT  = 80;

let canvas, ctx, particles = [], running = false, raf;

export function initParticles() {
  canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  particles = Array.from({ length: COUNT }, makeParticle);
  running = true;
  resize();
  window.addEventListener('resize', resize);
  draw();
}

export function stopParticles() {
  running = false;
  cancelAnimationFrame(raf);
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
}

export function startParticles() {
  if (running) return;
  running = true;
  draw();
}

function makeParticle() {
  return {
    x:  Math.random() * innerWidth,
    y:  Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    r:  Math.random() * 1.2 + 0.3,
    a:  Math.random() * 0.35 + 0.05,
    c:  COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

function resize() {
  if (!canvas) return;
  canvas.width  = innerWidth;
  canvas.height = innerHeight;
}

function draw() {
  if (!running) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0)            p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0)             p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle   = p.c;
    ctx.globalAlpha = p.a;
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 80) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(124,58,237,${0.08 * (1 - d / 80)})`;
        ctx.lineWidth   = 0.4;
        ctx.stroke();
      }
    }
  }

  raf = requestAnimationFrame(draw);
}
