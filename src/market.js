// Mermarket: a hill-shaped cave with a stall outside, and a little shop inside run by an octopus.

const INK = "#4a4a4a";
const FONT = '"Comic Sans MS", "Comic Neue", cursive';

export const MARKET_X = 5000;
export const marketWidth = (h) => Math.min(520, Math.max(320, h * 0.82));

export function marketLayout(w, h) {
  const floor = h * 0.86;
  const x0 = w * 0.62;
  const x1 = w * 0.96;
  return { floor, counter: { x0, x1, top: floor - h * 0.2 }, sellerX: (x0 + x1) / 2, shelfTop: h * 0.38, shelfMid: h * 0.58, shelfJelly: h * 0.5 };
}

function outline(ctx, fill, lw = 2.2) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = ctx.lineCap = "round";
  ctx.stroke();
}

function plank(ctx, x0, x1, y, th) {
  ctx.beginPath();
  ctx.roundRect(x0, y, x1 - x0, th, 5);
  outline(ctx, "#e8c89a", 2.4);
}

function pearl(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.6, "#f7eef0");
  g.addColorStop(1, "#d8c7d6");
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.stroke();
}

function strawberry(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, y - s * 0.2);
  ctx.quadraticCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.7);
  ctx.quadraticCurveTo(x + s * 0.5, y + s * 0.6, x + s * 0.5, y - s * 0.2);
  ctx.quadraticCurveTo(x, y - s * 0.45, x - s * 0.5, y - s * 0.2);
  outline(ctx, "#d93a2e", 2);
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y - s * 0.3);
  ctx.lineTo(x, y - s * 0.1);
  ctx.lineTo(x + s * 0.3, y - s * 0.3);
  ctx.lineTo(x + s * 0.1, y - s * 0.6);
  ctx.lineTo(x - s * 0.1, y - s * 0.6);
  ctx.closePath();
  outline(ctx, "#6aa84f", 1.8);
  ctx.fillStyle = "#fff3b0";
  for (const [dx, dy] of [[-0.2, 0.15], [0.15, 0.1], [0, 0.35], [-0.12, 0.45], [0.2, 0.4]]) ctx.fillRect(x + s * dx, y + s * dy, 2.2, 3);
}

function carrot(ctx, x, y, len, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.beginPath();
  ctx.moveTo(-len * 0.13, 0);
  ctx.lineTo(0, -len * 0.9);
  ctx.lineTo(len * 0.13, 0);
  ctx.closePath();
  outline(ctx, "#e8903a", 2);
  ctx.beginPath();
  for (const dx of [-0.1, 0, 0.1]) { ctx.moveTo(len * dx * 0.5, -len * 0.88); ctx.lineTo(len * dx * 1.8, -len * 1.3); }
  outline(ctx, null, 2.4);
  ctx.strokeStyle = "#6aa84f";
  ctx.stroke();
  ctx.restore();
}

function jar(ctx, x, base, s, color, label) {
  ctx.beginPath();
  ctx.roundRect(x - s * 0.4, base - s * 0.8, s * 0.8, s * 0.8, 6);
  outline(ctx, color);
  ctx.beginPath();
  ctx.roundRect(x - s * 0.44, base - s * 0.92, s * 0.88, s * 0.14, 4);
  outline(ctx, "#fff1d6", 2);
  ctx.beginPath();
  ctx.roundRect(x - s * 0.28, base - s * 0.6, s * 0.56, s * 0.34, 3);
  outline(ctx, "#fffdf5", 1.4);
  ctx.fillStyle = INK;
  ctx.font = `${Math.round(s * 0.2)}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, base - s * 0.43);
}

export function drawOctopus(ctx, x, y, s, t) {
  const sway = Math.sin(t / 600) * s * 0.04;
  ctx.save();
  ctx.lineJoin = ctx.lineCap = "round";
  for (const dx of [-0.34, -0.17, 0, 0.17, 0.34]) {
    ctx.beginPath();
    ctx.moveTo(x + s * dx, y - s * 0.2);
    ctx.quadraticCurveTo(x + s * dx * 1.5 + sway, y + s * 0.15, x + s * dx * 1.2 - sway, y + s * 0.38);
    ctx.lineWidth = s * 0.13;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.lineWidth = s * 0.09;
    ctx.strokeStyle = "#b49ad0";
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x - s * 0.42, y - s * 0.15);
  ctx.quadraticCurveTo(x - s * 0.5, y - s * 0.85, x, y - s * 0.85);
  ctx.quadraticCurveTo(x + s * 0.5, y - s * 0.85, x + s * 0.42, y - s * 0.15);
  ctx.quadraticCurveTo(x, y - s * 0.05, x - s * 0.42, y - s * 0.15);
  outline(ctx, "#b49ad0");
  ctx.fillStyle = "#222";
  for (const dx of [-0.15, 0.15]) {
    ctx.beginPath();
    ctx.arc(x + s * dx, y - s * 0.5, s * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#c0392b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.4, s * 0.1, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "rgba(240,130,150,0.5)";
  for (const dx of [-0.26, 0.26]) {
    ctx.beginPath();
    ctx.arc(x + s * dx, y - s * 0.38, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawJellyDome(ctx, x, shelfY, s, t) {
  const bob = Math.sin(t / 700) * 2;
  ctx.beginPath();
  ctx.roundRect(x - s * 0.7, shelfY, s * 1.4, 12, 4);
  outline(ctx, "#e8c89a", 2.4);
  // jellyfish inside
  const jx = x;
  const jy = shelfY - s * 0.3 + bob;
  ctx.beginPath();
  ctx.moveTo(jx - s * 0.2, jy);
  ctx.quadraticCurveTo(jx - s * 0.22, jy - s * 0.3, jx, jy - s * 0.3);
  ctx.quadraticCurveTo(jx + s * 0.22, jy - s * 0.3, jx + s * 0.2, jy);
  ctx.quadraticCurveTo(jx, jy - s * 0.07, jx - s * 0.2, jy);
  outline(ctx, "#fff0a8");
  ctx.beginPath();
  for (const dx of [-0.12, 0, 0.12]) {
    ctx.moveTo(jx + s * dx, jy);
    ctx.quadraticCurveTo(jx + s * dx + 5, jy + s * 0.15, jx + s * dx - 3, jy + s * 0.3);
  }
  outline(ctx, null, 1.8);
  // glass dome with a knob
  ctx.beginPath();
  ctx.moveTo(x - s * 0.62, shelfY);
  ctx.quadraticCurveTo(x - s * 0.66, shelfY - s * 0.95, x, shelfY - s * 0.95);
  ctx.quadraticCurveTo(x + s * 0.66, shelfY - s * 0.95, x + s * 0.62, shelfY);
  ctx.closePath();
  ctx.fillStyle = "rgba(200,225,245,0.3)";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, shelfY - s * 1.02, s * 0.07, 0, Math.PI * 2);
  outline(ctx, "#fff1d6", 2);
}

function sign(ctx, cx, cy, w, hh, text, fill = "#fffdf5") {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - hh / 2, w, hh, 7);
  outline(ctx, fill, 2.6);
  ctx.fillStyle = INK;
  ctx.font = `bold ${Math.round(hh * 0.5)}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy + 1);
  ctx.restore();
}

function drawCandyBowl(ctx, x, floor, s) {
  ctx.beginPath();
  ctx.moveTo(x - s * 0.18, floor);
  ctx.lineTo(x - s * 0.08, floor - s * 0.45);
  ctx.lineTo(x + s * 0.08, floor - s * 0.45);
  ctx.lineTo(x + s * 0.18, floor);
  ctx.closePath();
  outline(ctx, "#e8c89a");
  const top = floor - s * 0.45;
  ctx.beginPath();
  ctx.ellipse(x, top - s * 0.3, s * 0.45, s * 0.38, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(200,225,245,0.35)";
  ctx.fill();
  const cols = ["#f3a6b8", "#fff1d6", "#c99ae0", "#8fc7c7", "#ffd36b"];
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4;
    const rr = (i % 4) * s * 0.07 + s * 0.04;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * rr * 1.5, top - s * 0.3 + Math.sin(a) * rr * 1.2, s * 0.08, 0, Math.PI * 2);
    outline(ctx, cols[i % cols.length], 1.4);
  }
  ctx.beginPath();
  ctx.ellipse(x, top - s * 0.3, s * 0.45, s * 0.38, 0, 0, Math.PI * 2);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.stroke();
}

function drawBunny(ctx, x, floor, s) {
  const y = floor - s * 0.3;
  ctx.beginPath();
  ctx.ellipse(x - s * 0.28, y - s * 0.28, s * 0.09, s * 0.26, -0.3, 0, Math.PI * 2);
  outline(ctx, "#f3a6b8", 2);
  ctx.beginPath();
  ctx.ellipse(x - s * 0.08, y - s * 0.3, s * 0.09, s * 0.26, 0.2, 0, Math.PI * 2);
  outline(ctx, "#f3a6b8", 2);
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.4, s * 0.3, 0, 0, Math.PI * 2);
  outline(ctx, "#fff1ee", 2.2);
  ctx.beginPath();
  ctx.arc(x + s * 0.32, y + s * 0.02, s * 0.12, 0, Math.PI * 2);
  outline(ctx, "#fff1ee", 2);
  ctx.fillStyle = "#e8403a";
  for (const dx of [-0.1, 0.1]) {
    ctx.beginPath();
    ctx.arc(x - s * 0.1 + s * dx, y - s * 0.04, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawMarket(ctx, state, w, h, t) {
  const L = marketLayout(w, h);
  const s = Math.min(1.2, w / 1000);

  // Top shelf: strawberry stall sign and a crate of carrots
  const topY = L.shelfTop;
  plank(ctx, w * 0.04, w * 0.52, topY, 16);
  const sx0 = w * 0.07;
  const sx1 = w * 0.39;
  ctx.beginPath();
  ctx.moveTo(sx0, topY - 90 * s);
  ctx.lineTo(sx1, topY - 70 * s);
  ctx.lineTo(sx1 - 6, topY - 8);
  ctx.lineTo(sx0 + 4, topY - 8);
  ctx.closePath();
  outline(ctx, "#fffdf5", 2.6);
  ctx.fillStyle = INK;
  ctx.font = `bold ${Math.round(34 * s)}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Strawberry", (sx0 + sx1) / 2, topY - 42 * s);
  for (const fx of [0.2, 0.52, 0.82]) strawberry(ctx, sx0 + (sx1 - sx0) * fx, topY - 112 * s, 26 * s);

  const cx = w * 0.44;
  for (const [dx, lean] of [[-16, 0.3], [0, 0], [16, -0.3]]) carrot(ctx, cx + dx * s, topY - 40 * s, 62 * s, lean);
  ctx.beginPath();
  ctx.roundRect(cx - 38 * s, topY - 44 * s, 76 * s, 38 * s, 4);
  outline(ctx, "#fff1d6", 2.4);
  ctx.fillStyle = INK;
  ctx.font = `${Math.round(20 * s)}px ${FONT}`;
  ctx.fillText("Carrots", cx, topY - 25 * s);

  // Middle shelf of jam jars
  const midY = L.shelfMid;
  plank(ctx, w * 0.05, w * 0.42, midY, 18);
  [["#e8403a", "Jam"], ["#c99ae0", "Jam"], ["#f3a6b8", "Jam"], ["#ffd36b", "Jam"]].forEach(([c, l], i) => jar(ctx, w * 0.09 + i * w * 0.085, midY, 62 * s, c, l));

  // Jellyfish under glass, upper right
  drawJellyDome(ctx, w * 0.73, L.shelfJelly, 100 * s, t);

  drawCandyBowl(ctx, w * 0.4, L.floor, 130 * s);
  drawBunny(ctx, w * 0.12, L.floor, 110 * s);

  // Octopus seller behind a pearl-trimmed counter
  drawOctopus(ctx, L.sellerX, L.counter.top + 30, Math.min(180, h * 0.3), t);
  const { x0, x1, top } = L.counter;
  ctx.beginPath();
  ctx.roundRect(x0, top, x1 - x0, L.floor - top, 8);
  outline(ctx, "#f7d6cb", 2.6);
  for (let px = x0 + 14; px < x1; px += 28) pearl(ctx, px, top, 13);
}

export const sellerSpot = (w, h) => {
  const L = marketLayout(w, h);
  return { x: L.sellerX, y: L.counter.top - Math.min(180, h * 0.3) * 0.9 };
};

// Hill-shaped cave with shells, bubbles, a "mermarket" sign and a little stall with an octopus.
export function drawMarketEntrance(ctx, x, h) {
  const cw = marketWidth(h);
  const base = h - 6;
  const ch = cw * 1.0;
  ctx.save();
  ctx.lineCap = ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - cw / 2, base);
  ctx.bezierCurveTo(x - cw * 0.52, base - ch * 0.95, x - cw * 0.2, base - ch, x + cw * 0.05, base - ch);
  ctx.bezierCurveTo(x + cw * 0.4, base - ch, x + cw * 0.5, base - ch * 0.5, x + cw / 2, base);
  ctx.closePath();
  outline(ctx, "#d9b8c4", 2.8);

  // Decorations: shells and bubbles scattered over the hill
  const deco = [[-0.34, 0.7, "s"], [-0.05, 0.5, "s"], [0.38, 0.55, "s"], [-0.4, 0.4, "b"], [-0.2, 0.55, "b"], [0.2, 0.8, "b"], [0.36, 0.3, "b"], [0.42, 0.8, "b"], [-0.3, 0.2, "f"], [0.05, 0.95, "b"]];
  for (const [dx, dy, kind] of deco) {
    const px = x + cw * dx;
    const py = base - ch * dy;
    if (kind === "b") {
      ctx.beginPath();
      ctx.arc(px, py, cw * 0.025, 0, Math.PI * 2);
      outline(ctx, "rgba(200,225,245,0.6)", 1.8);
    } else if (kind === "s") {
      ctx.beginPath();
      ctx.moveTo(px - cw * 0.04, py);
      ctx.quadraticCurveTo(px - cw * 0.05, py - cw * 0.07, px, py - cw * 0.07);
      ctx.quadraticCurveTo(px + cw * 0.05, py - cw * 0.07, px + cw * 0.04, py);
      ctx.closePath();
      outline(ctx, "#f3a6b8", 1.8);
      ctx.beginPath();
      for (const o of [-0.02, 0, 0.02]) { ctx.moveTo(px + cw * o * 0.4, py); ctx.lineTo(px + cw * o, py - cw * 0.06); }
      outline(ctx, null, 1.2);
    } else {
      ctx.beginPath();
      ctx.moveTo(px - cw * 0.03, py);
      ctx.quadraticCurveTo(px, py - cw * 0.03, px + cw * 0.03, py);
      ctx.quadraticCurveTo(px, py + cw * 0.03, px - cw * 0.03, py);
      outline(ctx, "#f0b8a0", 1.8);
    }
  }

  // Inner arch with the stall
  const ax = x + cw * 0.04;
  const aw = cw * 0.5;
  const ah = ch * 0.55;
  ctx.beginPath();
  ctx.moveTo(ax - aw / 2, base);
  ctx.bezierCurveTo(ax - aw * 0.55, base - ah * 1.1, ax + aw * 0.55, base - ah * 1.1, ax + aw / 2, base);
  ctx.closePath();
  outline(ctx, "#8a6a86", 2.6);
  const stallW = aw * 0.62;
  const sy = base - aw * 0.42;
  drawOctopus(ctx, ax, sy + stallW * 0.1, stallW * 0.7, performance.now());
  ctx.beginPath();
  ctx.roundRect(ax - stallW / 2, sy + stallW * 0.1, stallW, base - sy - stallW * 0.1, 4);
  outline(ctx, "#f7d6cb", 2.4);
  for (const px of [ax - stallW / 2 + 5, ax + stallW / 2 - 5]) {
    for (let py = sy - stallW * 0.4; py < sy + stallW * 0.1; py += stallW * 0.11) pearl(ctx, px, py, stallW * 0.05);
  }
  ctx.beginPath();
  ctx.moveTo(ax - stallW * 0.58, sy - stallW * 0.42);
  ctx.lineTo(ax + stallW * 0.58, sy - stallW * 0.42);
  ctx.lineTo(ax + stallW * 0.5, sy - stallW * 0.26);
  ctx.lineTo(ax - stallW * 0.5, sy - stallW * 0.26);
  ctx.closePath();
  outline(ctx, "#5a5470", 2.4);

  // Sign
  const signY = base - ch * 0.78;
  ctx.beginPath();
  ctx.moveTo(x - cw * 0.2, signY - 6);
  ctx.quadraticCurveTo(x - cw * 0.17, signY - 40, x - cw * 0.12, signY - 40);
  outline(ctx, "#f3a6b8", 2);
  sign(ctx, x - cw * 0.02, signY + cw * 0.04, cw * 0.62, cw * 0.19, "mermarket", "#fffdf5");
  ctx.beginPath();
  ctx.moveTo(x + cw * 0.02, signY - cw * 0.06);
  ctx.quadraticCurveTo(x + cw * 0.0, signY - cw * 0.14, x - cw * 0.04, signY - cw * 0.15);
  ctx.quadraticCurveTo(x + cw * 0.04, signY - cw * 0.2, x + cw * 0.08, signY - cw * 0.14);
  ctx.quadraticCurveTo(x + cw * 0.09, signY - cw * 0.08, x + cw * 0.02, signY - cw * 0.06);
  outline(ctx, "#f3a6b8", 2);
  ctx.restore();
}
