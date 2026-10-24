// Animated underwater backdrop: depth gradient + rising bubbles.
export function startOcean(canvas) {
  const ctx = canvas.getContext("2d");
  const bubbles = Array.from({ length: 40 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 2 + Math.random() * 6,
    speed: 0.02 + Math.random() * 0.05,
  }));
  let last = performance.now();

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  function frame(now) {
    const dt = (now - last) / 1000;
    last = now;
    const { width: w, height: h } = canvas;

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#0a6e9e");
    sky.addColorStop(1, "#021b33");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(200,245,255,0.5)";
    ctx.lineWidth = 1.5;
    for (const b of bubbles) {
      b.y -= b.speed * dt;
      if (b.y < -0.05) {
        b.y = 1.05;
        b.x = Math.random();
      }
      ctx.beginPath();
      ctx.arc(b.x * w, b.y * h, b.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);
}
