const canvas =
  document.getElementById('bgCanvas');

const ctx =
  canvas.getContext('2d');

export function initParticles(){

  resize();

  window.addEventListener(
    'resize',
    resize
  );

  animate();

}

function resize(){

  canvas.width = innerWidth;
  canvas.height = innerHeight;

}

function animate(){

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  requestAnimationFrame(animate);

}