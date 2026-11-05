// The bakery: a croissant-shaped cave in the sea, and inside it a pearl-furnished café with a pastry counter.

const INK = "#4a4a4a";
const FONT = '"Comic Sans MS", "Comic Neue", cursive';

export const BAKERY_X = 3800;
export const bakeryWidth = (h) => Math.min(460, Math.max(280, h * 0.72));

export const PASTRIES = ["croissant", "donut", "cupcake", "pearltart"];

export function bakeryLayout(w, h) {
  const floor = h * 0.86;
  const x0 = w * 0.56;
  const x1 = w * 0.94;
  const top = floor - h * 0.24;
  const gap = (x1 - x0) / (PASTRIES.length + 1);
  const size = Math.min(gap * 0.7, h * 0.09);
  const slots = PASTRIES.map((type, i) => ({ type, x: x0 + gap * (i + 1), y: top - size * 0.35 }));
  return { floor, counter: { x0, x1, top }, slots, size, gap, ladyX: (x0 + x1) / 2, tables: [w * 0.14, w * 0.37] };
}

// Index of the pastry the mermaid is hovering in front of, or -1.
export function nearPastry(state) {
  if (state.mode !== "bakery") return -1;
  const { slots, gap } = bakeryLayout(state.width, state.height);
  let best = -1;
  let bestD = gap / 2;
  slots.forEach((s, i) => {
    const d = Math.abs(s.x - state.x);
    if (d < bestD) { best = i; bestD = d; }
  });
  return best;
}

function outline(ctx, fill, lw = 2.2) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = ctx.lineCap = "round";
  ctx.stroke();
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
  ctx.beginPath();
  ctx.arc(x - r * 0.4, y - r * 0.4, r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fill();
}

function fork(ctx, x, y, len, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  ctx.lineWidth = len * 0.14;
  ctx.beginPath();
  ctx.moveTo(0, len * 0.1);
  ctx.lineTo(0, len);
  ctx.stroke();
  ctx.lineWidth = len * 0.07;
  ctx.beginPath();
  for (const dx of [-0.16, 0, 0.16]) {
    ctx.moveTo(len * dx, len * 0.1);
    ctx.lineTo(len * dx, -len * 0.25);
  }
  ctx.moveTo(-len * 0.16, len * 0.1);
  ctx.lineTo(len * 0.16, len * 0.1);
  ctx.stroke();
  ctx.strokeStyle = "#e6e6ee";
  ctx.lineWidth = len * 0.06;
  ctx.beginPath();
  ctx.moveTo(0, len * 0.15);
  ctx.lineTo(0, len * 0.95);
  ctx.stroke();
  ctx.restore();
}

// A yummy pastry centred on (x, y); `s` is roughly its width.
export function drawPastry(ctx, type, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  if (type === "croissant") {
    const lobes = [-0.36, -0.18, 0, 0.18, 0.36];
    lobes.forEach((o, i) => {
      const k = 1 - Math.abs(o) * 1.1;
      ctx.beginPath();
      ctx.ellipse(o * s * 1.9, Math.abs(o) * s * 0.7, s * 0.2 * k + s * 0.05, s * 0.34 * k + s * 0.06, o * 1.6, 0, Math.PI * 2);
      outline(ctx, i % 2 ? "#e0a050" : "#eab868", 2);
    });
    ctx.strokeStyle = "#b9742e";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, s * 0.3, s * 0.12, Math.PI, Math.PI * 2);
    ctx.stroke();
  } else if (type === "donut") {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.42, 0, 0, Math.PI * 2);
    outline(ctx, "#e9b26a");
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.03, s * 0.44, s * 0.34, 0, 0, Math.PI * 2);
    outline(ctx, "#f58db3");
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.02, s * 0.14, s * 0.1, 0, 0, Math.PI * 2);
    outline(ctx, "#fff6e8", 1.8);
    const sprinkles = [["#fff", -0.3, -0.1], ["#8be0ff", 0.25, -0.18], ["#ffe14d", 0.32, 0.08], ["#fff", -0.2, 0.15], ["#8be0ff", 0.0, -0.27]];
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    for (const [c, dx, dy] of sprinkles) {
      ctx.strokeStyle = c;
      ctx.beginPath();
      ctx.moveTo(s * dx, s * dy);
      ctx.lineTo(s * dx + 4, s * dy + 2);
      ctx.stroke();
    }
  } else if (type === "cupcake") {
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.05);
    ctx.lineTo(-s * 0.22, s * 0.38);
    ctx.lineTo(s * 0.22, s * 0.38);
    ctx.lineTo(s * 0.3, -s * 0.05);
    ctx.closePath();
    outline(ctx, "#c99ae0");
    ctx.strokeStyle = "rgba(74,74,74,0.5)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (const dx of [-0.1, 0.1]) { ctx.moveTo(s * dx * 1.2, -s * 0.03); ctx.lineTo(s * dx, s * 0.37); }
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.36, -s * 0.04);
    ctx.quadraticCurveTo(-s * 0.4, -s * 0.3, -s * 0.15, -s * 0.28);
    ctx.quadraticCurveTo(-s * 0.1, -s * 0.5, s * 0.08, -s * 0.42);
    ctx.quadraticCurveTo(s * 0.3, -s * 0.38, s * 0.22, -s * 0.24);
    ctx.quadraticCurveTo(s * 0.42, -s * 0.2, s * 0.36, -s * 0.04);
    ctx.closePath();
    outline(ctx, "#ffd2e4");
    ctx.beginPath();
    ctx.arc(s * 0.02, -s * 0.5, s * 0.07, 0, Math.PI * 2);
    outline(ctx, "#e8403a", 1.8);
  } else {
    // pearl tart: fluted golden shell holding a big pearl
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, -s * 0.02);
    ctx.lineTo(-s * 0.3, s * 0.3);
    ctx.lineTo(s * 0.3, s * 0.3);
    ctx.lineTo(s * 0.42, -s * 0.02);
    ctx.closePath();
    outline(ctx, "#e6b36a");
    ctx.strokeStyle = "#b9742e";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (const dx of [-0.25, -0.08, 0.08, 0.25]) { ctx.moveTo(s * dx * 1.3, 0); ctx.lineTo(s * dx, s * 0.29); }
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.02, s * 0.42, s * 0.12, 0, 0, Math.PI * 2);
    outline(ctx, "#ffe9a8", 1.8);
    pearl(ctx, 0, -s * 0.2, s * 0.22);
  }
  ctx.restore();
}

function plate(ctx, x, y, w) {
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, w * 0.12, 0, 0, Math.PI * 2);
  outline(ctx, "#fdfaf2", 1.8);
}

function drawChair(ctx, x, floor, size, flip) {
  const seatY = floor - size * 0.7;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, seatY);
  ctx.lineTo(x - size * 0.34, floor);
  ctx.moveTo(x + size * 0.3, seatY);
  ctx.lineTo(x + size * 0.34, floor);
  outline(ctx, null, 4);
  ctx.beginPath();
  ctx.moveTo(x + flip * size * 0.34, seatY);
  ctx.lineTo(x + flip * size * 0.34, seatY - size * 0.8);
  outline(ctx, null, 4);
  ctx.beginPath();
  ctx.roundRect(x - size * 0.42, seatY - size * 0.12, size * 0.84, size * 0.16, 7);
  outline(ctx, "#f3a6b8");
  pearl(ctx, x + flip * size * 0.34, seatY - size * 0.9, size * 0.2);
}

function drawTable(ctx, x, floor, size, h) {
  const topY = floor - h * 0.22;
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x, floor);
  outline(ctx, null, 6);
  ctx.beginPath();
  ctx.ellipse(x, floor, size * 0.25, size * 0.05, 0, 0, Math.PI * 2);
  outline(ctx, "#f3a6b8", 2);
  ctx.beginPath();
  ctx.ellipse(x, topY, size * 0.62, size * 0.11, 0, 0, Math.PI * 2);
  outline(ctx, "#fff1d6", 2.4);
  const pr = size * 0.17;
  pearl(ctx, x - size * 0.34, topY - pr * 0.7, pr);
  pearl(ctx, x + size * 0.38, topY - pr * 0.5, pr * 0.85);
  plate(ctx, x, topY + 2, size * 0.34);
  drawPastry(ctx, "croissant", x, topY - size * 0.1, size * 0.28);
  fork(ctx, x + size * 0.2, topY - size * 0.02, size * 0.22, 0.3);
}

function drawLady(ctx, x, top, size, t) {
  const bob = Math.sin(t / 700) * 2;
  const y = top - size * 0.1 + bob;
  ctx.save();
  ctx.lineJoin = ctx.lineCap = "round";
  // body with apron
  ctx.beginPath();
  ctx.roundRect(x - size * 0.34, y - size * 0.9, size * 0.68, size * 1.0, 18);
  outline(ctx, "#8fc7c7");
  ctx.beginPath();
  ctx.roundRect(x - size * 0.24, y - size * 0.62, size * 0.48, size * 0.72, 12);
  outline(ctx, "#fffdf5");
  // arms
  ctx.beginPath();
  ctx.ellipse(x - size * 0.36, y - size * 0.4, size * 0.09, size * 0.24, 0.25, 0, Math.PI * 2);
  outline(ctx, "#f6e2c9");
  ctx.beginPath();
  ctx.ellipse(x + size * 0.36, y - size * 0.4, size * 0.09, size * 0.24, -0.25, 0, Math.PI * 2);
  outline(ctx, "#f6e2c9");
  // head
  ctx.beginPath();
  ctx.arc(x, y - size * 1.1, size * 0.3, 0, Math.PI * 2);
  outline(ctx, "#f6e2c9");
  // hair bun and hat
  ctx.beginPath();
  ctx.arc(x, y - size * 1.5, size * 0.12, 0, Math.PI * 2);
  outline(ctx, "#8a5fb0");
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 1.28);
  ctx.quadraticCurveTo(x - size * 0.38, y - size * 1.66, x - size * 0.08, y - size * 1.58);
  ctx.quadraticCurveTo(x + size * 0.04, y - size * 1.76, x + size * 0.16, y - size * 1.58);
  ctx.quadraticCurveTo(x + size * 0.38, y - size * 1.62, x + size * 0.28, y - size * 1.28);
  ctx.closePath();
  outline(ctx, "#ffffff");
  // face
  ctx.fillStyle = "#222";
  for (const dx of [-0.1, 0.1]) {
    ctx.beginPath();
    ctx.arc(x + size * dx, y - size * 1.13, size * 0.028, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#c0392b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - size * 1.05, size * 0.09, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "rgba(240,130,150,0.5)";
  for (const dx of [-0.19, 0.19]) {
    ctx.beginPath();
    ctx.arc(x + size * dx, y - size * 1.04, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCounter(ctx, L, h) {
  const { x0, x1, top } = L.counter;
  ctx.beginPath();
  ctx.roundRect(x0, top, x1 - x0, L.floor - top, 12);
  outline(ctx, "#f7d6cb", 2.6);
  ctx.beginPath();
  ctx.roundRect(x0 - 10, top - 8, x1 - x0 + 20, 16, 8);
  outline(ctx, "#fff1d6", 2.6);
  for (let px = x0 + 26; px < x1 - 10; px += 52) pearl(ctx, px, top + (L.floor - top) * 0.5, 15);
}

function drawLabelledSign(ctx, cx, cy, w, text) {
  const hh = w * 0.3;
  ctx.save();
  ctx.lineJoin = ctx.lineCap = "round";
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - hh / 2, w, hh, 8);
  outline(ctx, "#e8c89a", 2.6);
  ctx.fillStyle = INK;
  ctx.font = `bold ${Math.round(hh * 0.62)}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy + 2);
  ctx.restore();
}

// Everything inside, drawn after the cave background and before the mermaid.
export function drawBakery(ctx, state, w, h, t) {
  const L = bakeryLayout(w, h);
  const chair = Math.min(80, w * 0.09);
  L.tables.forEach((tx) => {
    drawChair(ctx, tx - chair * 1.3, L.floor, chair, 1);
    drawChair(ctx, tx + chair * 1.3, L.floor, chair, -1);
  });
  L.tables.forEach((tx) => drawTable(ctx, tx, L.floor, Math.min(150, w * 0.17), h));
  drawLady(ctx, L.ladyX, L.counter.top, Math.min(120, h * 0.2), t);
  drawCounter(ctx, L, h);
  L.slots.forEach((s) => {
    plate(ctx, s.x, s.y + L.size * 0.4, L.size * 1.2);
    drawPastry(ctx, s.type, s.x, s.y, L.size);
  });
  fork(ctx, L.counter.x0 + 22, L.counter.top - 4, L.size * 0.55, -0.2);
  drawLabelledSign(ctx, w * 0.5, h * 0.2, Math.min(260, w * 0.3), "Bakery");
  const sel = nearPastry(state);
  if (sel >= 0) {
    const s = L.slots[sel];
    ctx.save();
    ctx.strokeStyle = "#e8403a";
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.arc(s.x, s.y, L.size * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export const ladySpot = (w, h) => {
  const L = bakeryLayout(w, h);
  return { x: L.ladyX, y: L.counter.top - Math.min(120, h * 0.2) * 1.7 };
};

// The croissant-shaped cave mouth with a BAKERY sign, standing on the sea floor.
export function drawBakeryEntrance(ctx, x, h) {
  const cw = bakeryWidth(h);
  const base = h - 6;
  const R = cw * 0.36;
  const ry = cw * 0.42;
  ctx.save();
  ctx.lineCap = ctx.lineJoin = "round";
  const N = 9;
  const order = Array.from({ length: N }, (_, i) => i).sort((p, q) => Math.abs(q - (N - 1) / 2) - Math.abs(p - (N - 1) / 2));
  for (const i of order) {
    const f = i / (N - 1);
    const a = Math.PI * (1.02 + 0.96 * f);
    const k = 0.5 + 0.5 * Math.sin(f * Math.PI);
    const cx = x + Math.cos(a) * R;
    const cy = base + Math.sin(a) * ry;
    const rot = a + Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, cw * 0.085 + cw * 0.03 * k, cw * 0.17 * k + cw * 0.04, rot, 0, Math.PI * 2);
    outline(ctx, i % 2 ? "#e0a050" : "#eab868", 2.6);
  }
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    const a = Math.PI * (1.02 + 0.96 * f);
    const k = 0.5 + 0.5 * Math.sin(f * Math.PI);
    ctx.strokeStyle = "rgba(150,90,30,0.55)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * R, base + Math.sin(a) * ry, cw * 0.05, cw * 0.1 * k, a + Math.PI / 2, 0.3, 2.6);
    ctx.stroke();
  }
  // doorway
  ctx.beginPath();
  ctx.moveTo(x - cw * 0.17, base);
  ctx.quadraticCurveTo(x - cw * 0.19, base - cw * 0.38, x, base - cw * 0.38);
  ctx.quadraticCurveTo(x + cw * 0.19, base - cw * 0.38, x + cw * 0.17, base);
  ctx.closePath();
  outline(ctx, "#5a3d2e", 2.4);
  // sign on a post above the croissant
  const top = base - ry - cw * 0.32;
  ctx.beginPath();
  ctx.moveTo(x, top + cw * 0.1);
  ctx.lineTo(x, top + cw * 0.26);
  outline(ctx, null, 4);
  drawLabelledSign(ctx, x, top, cw * 0.62, "BAKERY");
  ctx.restore();
}
