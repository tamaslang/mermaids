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
