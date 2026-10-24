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
    const px = Math.sign(c) * Math.pow(Math.abs(c), 0.45) * (r.w / 2 + grow);
    const py = Math.sign(sn) * Math.pow(Math.abs(sn), 0.45) * (r.h / 2 + grow);
    pts.push([cx + px + jit(i + seed, 2.4), cy + py + jit(i + seed + 70, 2.4)]);
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

  // Crayon-scribbled wooden frame: a thick band of short strokes between two wobbly pencil outlines
  const outer = windowPts(r, 9, 11);
  const inner = windowPts(r, -1, 23);
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(201,138,106,0.9)";
  ctx.lineWidth = 3.4;
  outer.forEach(([ox, oy], i) => {
    const [ix, iy] = inner[i];
    for (let j = 0; j < 3; j++) {
      const f = 0.1 + j * 0.35;
      ctx.beginPath();
      ctx.moveTo(ox + (ix - ox) * f, oy + (iy - oy) * f);
      ctx.lineTo(ox + (ix - ox) * (f + 0.4), oy + (iy - oy) * (f + 0.4));
      ctx.stroke();
    }
  });
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  tracePts(ctx, outer);
  ctx.stroke();
  ctx.lineWidth = 2;
  tracePts(ctx, inner);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  tracePts(ctx, windowPts(r, 10.5, 41));
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

// A TV shaped like a scallop shell: fanned ribs, a scalloped rim and the screen in the middle.
function shellOutline(x, bottom, tw, th, steps = 6) {
  const cy = bottom - th * 0.42;
  const rx = tw / 2;
  const ry = th * 0.58;
  const pts = [[x - tw * 0.13, bottom]];
  pts.push([x - rx * 0.9, cy + ry * 0.35]);
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j <= 4; j++) {
      const a = Math.PI + ((i + j / 4) / steps) * Math.PI;
      const bump = 1 + 0.1 * Math.sin((j / 4) * Math.PI);
      pts.push([x + Math.cos(a) * rx * bump, cy + Math.sin(a) * ry * bump]);
    }
  }
  pts.push([x + rx * 0.9, cy + ry * 0.35]);
  pts.push([x + tw * 0.13, bottom]);
  return { pts, cy, rx, ry };
}

function drawTV(ctx, sprites, x, bottom, tw, t) {
  const th = tw * 0.85;
  const { pts, cy, rx, ry } = shellOutline(x, bottom, tw, th);

  wobblyPath(ctx, pts, true, 3);
  ctx.fillStyle = "#f7c2d0";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.lineJoin = ctx.lineCap = "round";
  ctx.stroke();
  wobblyPath(ctx, pts, true, 9);
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Fan ribs radiating from the hinge
  ctx.strokeStyle = "#c0687f";
  ctx.lineWidth = 2;
  for (let i = 1; i < 6; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    wobblyPath(ctx, [[x, bottom], [x + Math.cos(a) * rx * 1.05, cy + Math.sin(a) * ry * 1.05]], false, i * 5);
    ctx.stroke();
  }

  // Screen
  const sx = x;
  const sy = cy - ry * 0.05;
  const srx = rx * 0.62;
  const sry = ry * 0.62;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(sx, sy, srx, sry, 0, 0, Math.PI * 2);
  ctx.clip();
  // Sunset drawn like the rest of the game: crayon scribbles on paper with pencil outlines
  const top = sy - sry;
  const horizon = sy + sry * 0.3;
  ctx.fillStyle = "#f8f3e6";
  ctx.fillRect(sx - srx, top, srx * 2, sry * 2);
  let seed = 5;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  ctx.lineCap = "round";
  const scribble = (y0, y1, color, count, slant) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.2;
    for (let i = 0; i < count; i++) {
      const px = sx - srx + rnd() * srx * 2;
      const py = y0 + rnd() * (y1 - y0);
      const len = 8 + rnd() * 10;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + len * slant, py + (rnd() - 0.5) * 4);
      ctx.stroke();
    }
  };
  const bandH = (horizon - top) / 4;
  scribble(top, top + bandH * 1.2, "rgba(140,100,190,0.85)", 70, 1);
  scribble(top + bandH * 0.9, top + bandH * 2.2, "rgba(236,110,150,0.85)", 80, 1);
  scribble(top + bandH * 1.9, top + bandH * 3.2, "rgba(255,150,70,0.9)", 80, 1);
  scribble(top + bandH * 2.9, horizon, "rgba(255,210,90,0.9)", 70, 1);
  scribble(horizon, sy + sry, "rgba(80,120,190,0.85)", 110, 1);

  const sunR = sry * 0.32;
  ctx.beginPath();
  ctx.arc(sx, horizon, sunR, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = "#f8f3e6";
  ctx.fill();
  scribble(horizon - sunR, horizon, "rgba(255,196,40,0.95)", 40, 0.2);
  ctx.strokeStyle = "#8a5a2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sx, horizon, sunR, Math.PI, 0);
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + ((i + 0.5) / 7) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(sx + Math.cos(a) * sunR * 1.25, horizon + Math.sin(a) * sunR * 1.25);
    ctx.lineTo(sx + Math.cos(a) * sunR * 1.6, horizon + Math.sin(a) * sunR * 1.6);
    ctx.stroke();
  }
  ctx.strokeStyle = "#555";
  ctx.beginPath();
  ctx.moveTo(sx - srx, horizon);
  for (let xx = 0; xx <= srx * 2; xx += 12) ctx.lineTo(sx - srx + xx, horizon + Math.sin(xx) * 0.8);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,225,140,0.95)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const yy = horizon + 8 + i * (sry * 0.16);
    const len = sunR * (1.4 - i * 0.28);
    const dx = Math.sin(t / 500 + i) * 4;
    ctx.beginPath();
    ctx.moveTo(sx - len + dx, yy);
    ctx.lineTo(sx + len + dx, yy);
    ctx.stroke();
  }
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  [0, 1, 2].forEach((i) => {
    const prog = (((t / 6000 + i * 0.33) % 1.4) - 0.2);
    const bx = sx - srx + prog * srx * 2;
    const by = top + sry * (0.45 + i * 0.18) + Math.sin(t / 900 + i * 2) * 5;
    const bs = sry * (0.12 - i * 0.015);
    const flap = Math.sin(t / 130 + i * 1.7) * bs * 0.7;
    ctx.beginPath();
    ctx.moveTo(bx - bs, by - flap);
    ctx.quadraticCurveTo(bx - bs * 0.4, by - bs * 0.5 - flap * 0.5, bx, by);
    ctx.quadraticCurveTo(bx + bs * 0.4, by - bs * 0.5 - flap * 0.5, bx + bs, by - flap);
    ctx.stroke();
  });
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(sx, sy, srx, sry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.stroke();
}

// Low side table for the TV
function drawTVTable(ctx, x, floor, tw, th) {
  const top = floor - th;
  for (const dir of [-1, 1]) {
    wobblyPath(ctx, [[x + dir * tw * 0.4, top + 6], [x + dir * tw * 0.46, floor - th * 0.4], [x + dir * tw * 0.42, floor], [x + dir * tw * 0.32, floor], [x + dir * tw * 0.33, top + 6]], true, dir + 20);
    outline(ctx, "#f3a6b8");
  }
  roundRect(ctx, x - tw / 2, top, tw, 12, 6);
  outline(ctx, "#e8c89a", 2.6);
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

  const tvW = Math.min(170, w * 0.17);
  const tvTableH = h * 0.13;
  drawTVTable(ctx, w * 0.9, floor, tvW * 0.8, tvTableH);
  drawTV(ctx, sprites, w * 0.9, floor - tvTableH, tvW, t);
  drawTable(ctx, w * 0.5, floor, Math.min(150, w * 0.16), h * 0.17, t);
}
