import { makeWaterTile, drawTile } from "./paper.js";

// Animated backdrop for the menu: drifting crayon water + pencil bubbles.
export function startOcean(canvas) {
  const ctx = canvas.getContext("2d");
  const bubbles = Array.from({ length: 24 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 3 + Math.random() * 7,
    speed: 0.02 + Math.random() * 0.05,
  }));
  let tile;
  let offset = 0;
  let last = null;

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    tile = makeWaterTile(canvas.width, canvas.height, 7);
  }

  function frame(now) {
    const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.05);
    last = now;
    const { width: w, height: h } = canvas;
    offset += 8 * dt;
    drawTile(ctx, tile, offset, w);

    ctx.strokeStyle = "rgba(70,70,70,0.6)";
    ctx.lineWidth = 1.8;
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
