// Paper-and-crayon water: cream paper with scribbled blue strokes, as a horizontally wrapping tile.
function rng(seed) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

export function makeWaterTile(w, h, seed = 7) {
  const tile = document.createElement("canvas");
  tile.width = Math.max(1, Math.round(w));
  tile.height = Math.max(1, Math.round(h));
  const ctx = tile.getContext("2d");
  const r = rng(seed);

  ctx.fillStyle = "#f6f3ea";
  ctx.fillRect(0, 0, tile.width, tile.height);

  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = `rgba(110,100,90,${0.03 + r() * 0.05})`;
    ctx.fillRect(r() * tile.width, r() * tile.height, 1.5, 1.5);
  }

  ctx.strokeStyle = "rgba(111,168,220,0.55)";
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  const count = Math.round((tile.width * tile.height) / 3500);
  for (let i = 0; i < count; i++) {
    const x = r() * tile.width;
    const y = r() * tile.height;
    const len = 50 + r() * 130;
    const bend = (r() - 0.5) * 40;
    for (const dx of [-tile.width, 0, tile.width]) {
      ctx.beginPath();
      ctx.moveTo(x + dx, y);
      ctx.quadraticCurveTo(x + dx + bend, y + len / 2, x + dx + (r() * 20 - 10), y + len);
      ctx.stroke();
    }
  }
  return tile;
}

export function drawTile(ctx, tile, offset, w) {
  let x = -(((offset % tile.width) + tile.width) % tile.width);
  for (; x < w; x += tile.width) ctx.drawImage(tile, x, 0);
}

// Cosy cave interior: warm paper, scribbled rock walls closing in from the edges and a sandy floor.
export function drawCave(ctx, w, h, floor) {
  const r = rng(11);
  ctx.fillStyle = "#f3e6d6";
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h * 0.5, h * 0.3, w / 2, h * 0.5, Math.max(w, h) * 0.75);
  g.addColorStop(0, "rgba(120,80,90,0)");
  g.addColorStop(1, "rgba(120,80,90,0.45)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.lineCap = "round";
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 220; i++) {
    const x = r() * w;
    const y = r() * floor;
    const edge = Math.min(x, w - x, y) / (w * 0.3);
    if (r() < edge) continue;
    ctx.strokeStyle = `rgba(150,90,110,${0.25 + r() * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 50, y + 10 + r() * 40);
    ctx.stroke();
  }

  ctx.fillStyle = "#ecd6a8";
  ctx.fillRect(0, floor, w, h - floor);
  ctx.strokeStyle = "#7a6a58";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, floor);
  for (let x = 0; x <= w; x += 20) ctx.lineTo(x, floor + (r() - 0.5) * 5);
  ctx.stroke();
}
