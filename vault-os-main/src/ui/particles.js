import { throttle } from '../core/performance.js';

const COLORS = ['#7c5cff','#ff6fae','#4df0c8','#ffa855'];
const COUNT   = 90;
const LINK_D  = 80;

let canvas, ctx, pts = [], running = false, rafId;

const mkPt = () => ({
  x: Math.random() * innerWidth, y: Math.random() * innerHeight,
  vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
  r: Math.random() * 1.2 + .3, a: Math.random() * .35 + .05,
  c: COLORS[Math.floor(Math.random() * 4)],
});

function resize() { if (canvas) { canvas.width = innerWidth; canvas.height = innerHeight; } }

function draw() {
  if (!running) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of pts) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;  if (p.x > canvas.width)  p.x = 0;
    if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < LINK_D) {
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(124,92,255,${.08*(1-d/LINK_D)})`; ctx.lineWidth = .4; ctx.stroke();
      }
    }
  }
  rafId = requestAnimationFrame(draw);
}

export function initParticles() {
  canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  pts = Array.from({ length: COUNT }, mkPt);
  running = true;
  resize();
  window.addEventListener('resize', throttle(resize, 200));
  draw();
}

export function stopParticles() {
  running = false; cancelAnimationFrame(rafId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function startParticles() { if (!running) { running = true; draw(); } }
