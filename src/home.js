// Furniture for the mermaid's cave, drawn with the same pencil outlines as everything else.

const INK = "#4a4a4a";

function outline(ctx, fill, lw = 2.4) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = ctx.lineCap = "round";
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Deterministic hand-drawn jitter so lines wobble but never flicker between frames.
const jit = (i, amp) => Math.sin(i * 12.9898) * 43758.5453 % 1 * amp;

function wobblyPath(ctx, pts, close, seed = 0) {
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    const x = px + jit(i + seed, 1.6);
    const y = py + jit(i + seed + 50, 1.6);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  if (close) ctx.closePath();
}

export function windowRect(w, h) {
  const ww = Math.min(300, w * 0.24);
  return { x: w * 0.5 - ww / 2, y: h * 0.14, w: ww, h: ww * 0.9 };
}

// Slightly lopsided rounded window outline, sampled as points so every line can wobble like a pencil.
function windowPts(r, grow = 0, seed = 0) {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const pts = [];
  const N = 56;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const px = Math.sign(c) * Math.pow(Math.abs(c), 0.3) * (r.w / 2 + grow);
    const py = Math.sign(sn) * Math.pow(Math.abs(sn), 0.3) * (r.h / 2 + grow);
    pts.push([cx + px + jit(i + seed, 1.5), cy + py + jit(i + seed + 70, 1.5)]);
  }
  return pts;
}

function tracePts(ctx, pts) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

// `drawOutside` paints the sea as seen from the doorstep; it is clipped and scaled into the window.
function drawWindow(ctx, w, h, drawOutside) {
  const r = windowRect(w, h);
  const k = 0.65;
  ctx.save();
  tracePts(ctx, windowPts(r));
  ctx.clip();
  ctx.translate(r.x - w * 0.3 * k, r.y - h * 0.4 * k);
  ctx.scale(k, k);
  drawOutside(ctx);
  ctx.restore();

  // Solid wooden frame with scratchy crayon hatching and sketchy, doubled pencil outlines
  const outer = windowPts(r, 8, 11);
  const inner = windowPts(r, -1, 23);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  tracePts(ctx, windowPts(r, 3.5, 5));
  ctx.strokeStyle = "#c98a6a";
  ctx.lineWidth = 9;
  ctx.stroke();
  let seed = 17;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  ctx.strokeStyle = "rgba(120,70,50,0.55)";
  ctx.lineWidth = 1.3;
  for (let n = 0; n < 3; n++) {
    outer.forEach(([ox, oy], i) => {
      const [ix, iy] = inner[i];
      const f = rnd() * 0.6;
      ctx.beginPath();
      ctx.moveTo(ox + (ix - ox) * f + (rnd() - 0.5) * 3, oy + (iy - oy) * f + (rnd() - 0.5) * 3);
      ctx.lineTo(ox + (ix - ox) * (f + 0.35), oy + (iy - oy) * (f + 0.35));
      ctx.stroke();
    });
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  tracePts(ctx, outer);
  ctx.stroke();
  tracePts(ctx, windowPts(r, 10.5, 41));
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.55;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2;
  tracePts(ctx, inner);
  ctx.stroke();
  tracePts(ctx, windowPts(r, -3, 59));
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.45;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Hand-ruled cross bars, drawn twice so they look sketched
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(201,138,106,0.95)";
  for (const o of [0, 1.6]) {
    wobblyPath(ctx, [[cx + o, r.y + 4], [cx - o, cy], [cx + o, r.y + r.h - 4]], false, 31 + o);
    ctx.stroke();
    wobblyPath(ctx, [[r.x + 4, cy + o], [cx, cy - o], [r.x + r.w - 4, cy + o]], false, 37 + o);
    ctx.stroke();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  wobblyPath(ctx, [[cx, r.y + 4], [cx, r.y + r.h - 4]], false, 44);
  ctx.stroke();
  wobblyPath(ctx, [[r.x + 4, cy], [r.x + r.w - 4, cy]], false, 47);
  ctx.stroke();

  // Sill
  wobblyPath(ctx, [[r.x - 12, r.y + r.h + 14], [r.x + r.w + 12, r.y + r.h + 14], [r.x + r.w + 8, r.y + r.h + 4], [r.x - 8, r.y + r.h + 4]], true, 53);
  outline(ctx, "#e8c89a", 2.4);
  ctx.restore();
}

function drawFrame(ctx, img, x, y, fw, tilt) {
  const fh = fw * 1.2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  roundRect(ctx, -fw / 2, -fh / 2, fw, fh, 4);
  outline(ctx, "#d9b38c", 3);
  ctx.fillStyle = "#fbf6ea";
  ctx.fillRect(-fw / 2 + 6, -fh / 2 + 6, fw - 12, fh - 12);
  const iw = fw - 18;
  const ih = Math.min(fh - 18, iw * (img.height / img.width));
  const iw2 = ih * (img.width / img.height);
  ctx.drawImage(img, -iw2 / 2, -ih / 2, iw2, ih);
  ctx.restore();
}

function drawTable(ctx, x, floor, tw, th, t) {
  const top = floor - th;
  ctx.beginPath();
  ctx.moveTo(x - tw * 0.38, top + 8);
  ctx.quadraticCurveTo(x - tw * 0.46, floor - th * 0.4, x - tw * 0.42, floor);
  ctx.lineTo(x - tw * 0.3, floor);
  ctx.quadraticCurveTo(x - tw * 0.3, floor - th * 0.4, x - tw * 0.28, top + 8);
  ctx.moveTo(x + tw * 0.38, top + 8);
  ctx.quadraticCurveTo(x + tw * 0.46, floor - th * 0.4, x + tw * 0.42, floor);
  ctx.lineTo(x + tw * 0.3, floor);
  ctx.quadraticCurveTo(x + tw * 0.3, floor - th * 0.4, x + tw * 0.28, top + 8);
  outline(ctx, "#f3a6b8");
  roundRect(ctx, x - tw / 2, top, tw, 14, 7);
  outline(ctx, "#e8c89a", 2.6);

  // Pearl bowl
  ctx.beginPath();
  ctx.ellipse(x + tw * 0.22, top - 6, tw * 0.15, 10, 0, 0, Math.PI);
  outline(ctx, "#f7d6cb");
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + tw * (0.14 + i * 0.08), top - 12 - (i === 1 ? 5 : 0), 5, 0, Math.PI * 2);
    outline(ctx, "#f4f4f4", 1.6);
  }

  // Jellyfish lamp with a pulsing glow
  const lx = x - tw * 0.2;
  const ly = top - 52;
  const pulse = 0.85 + Math.sin(t / 600) * 0.15;
  const g = ctx.createRadialGradient(lx, ly, 4, lx, ly, 110 * pulse);
  g.addColorStop(0, "rgba(255,236,150,0.55)");
  g.addColorStop(1, "rgba(255,236,150,0)");
  ctx.fillStyle = g;
  ctx.fillRect(lx - 120, ly - 120, 240, 240);
  ctx.beginPath();
  ctx.moveTo(lx, ly + 18);
  ctx.lineTo(lx, top);
  outline(ctx, null, 3);
  ctx.beginPath();
  ctx.moveTo(lx - 22, ly + 16);
  ctx.quadraticCurveTo(lx - 24, ly - 26, lx, ly - 26);
  ctx.quadraticCurveTo(lx + 24, ly - 26, lx + 22, ly + 16);
  ctx.quadraticCurveTo(lx, ly + 8, lx - 22, ly + 16);
  outline(ctx, "#fff0a8");
  ctx.beginPath();
  for (const dx of [-12, 0, 12]) {
    ctx.moveTo(lx + dx, ly + 14);
    ctx.quadraticCurveTo(lx + dx + 4, ly + 24, lx + dx - 2, ly + 32);
  }
  outline(ctx, null, 1.8);
  ctx.beginPath();
  ctx.moveTo(lx - tw * 0.1, top);
  ctx.lineTo(lx + tw * 0.1, top);
  outline(ctx, null, 4);
}

export function drawFurniture(ctx, w, h, floor, sprites, t, drawOutside) {
  drawWindow(ctx, w, h, drawOutside);

  const fw = Math.min(70, w * 0.085);
  drawFrame(ctx, sprites.queen, w * 0.1, h * 0.26, fw, -0.05);
  drawFrame(ctx, sprites.jellyking, w * 0.2, h * 0.32, fw * 0.95, 0.04);
  drawFrame(ctx, sprites.fish, w * 0.15, h * 0.46, fw * 0.7, 0.03);

  drawTable(ctx, w * 0.5, floor, Math.min(150, w * 0.16), h * 0.17, t);
}
