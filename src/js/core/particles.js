// ─────────────────────────────────────────────────────────────────────────────
// src/js/core/particles.js — Vault OS canvas particle field
// ─────────────────────────────────────────────────────────────────────────────

import { throttle } from './performance.js';

const COLORS = ['#7c5cff', '#ff6fae', '#4df0c8', '#ffa855'];
const COUNT  = 90;
const LINK_DIST = 80;

let canvas, ctx, particles = [], running = false, rafId;

function makeParticle() {
  return {
    x:  Math.random() * innerWidth,
    y:  Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    r:  Math.random() * 1.2 + 0.3,
    a:  Math.random() * 0.35 + 0.05,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
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
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0)             p.x = canvas.width;
    if (p.x > canvas.width)  p.x = 0;
    if (p.y < 0)             p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle  = p.color;
    ctx.globalAlpha = p.a;
    ctx.fill();
  }

  // connection lines
  ctx.globalAlpha = 1;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < LINK_DIST) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(124,92,255,${0.08 * (1 - d / LINK_DIST)})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }
  }

  rafId = requestAnimationFrame(draw);
}

export function initParticles(canvasEl) {
  canvas   = canvasEl ?? document.getElementById('bgCanvas');
  ctx      = canvas.getContext('2d');
  particles = Array.from({ length: COUNT }, makeParticle);
  running  = true;

  resize();
  window.addEventListener('resize', throttle(resize, 200));
  draw();
}

export function stopParticles() {
  running = false;
  cancelAnimationFrame(rafId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function startParticles() {
  if (running) return;
  running = true;
  draw();
}
