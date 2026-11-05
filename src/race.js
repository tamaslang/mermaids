// The hoop race: swim through every hoop (they vanish) and pop bubbles for bonus points.

const INK = "#4a4a4a";

export const RACE_X = 2600;
export const HOOP_COUNT = 8;
export const raceCaveWidth = (h) => Math.min(420, Math.max(260, h * 0.65));

export function createRace() {
  const hoops = [];
  const bubbles = [];
  for (let i = 0; i < HOOP_COUNT; i++) {
    hoops.push({ wx: 600 + i * 420, fy: 0.5 + Math.sin(i * 1.7) * 0.28 });
  }
  for (let i = 0; i < 6; i++) {
    bubbles.push({ wx: 800 + i * 560, fy: 0.5 + Math.cos(i * 2.3) * 0.3 });
  }
  return { hoops, bubbles, time: 0, popped: 0, done: false };
}

export const hoopRadius = (h) => Math.max(36, h * 0.1);
export const bubbleRadius = (h) => Math.max(16, h * 0.04);

// Hoops and bubbles are removed the moment the mermaid touches them.
export function updateRace(state, dt) {
  const r = state.race;
  if (!r || r.done) return;
  r.time += dt;
  const wx = state.scroll + state.x;
  const reach = Math.max(30, state.height * 0.05);
  r.hoops = r.hoops.filter((p) => !(Math.abs(p.wx - wx) < reach && Math.abs(p.fy * state.height - state.y) < hoopRadius(state.height)));
  const before = r.bubbles.length;
  const near = bubbleRadius(state.height) + reach;
  r.bubbles = r.bubbles.filter((b) => Math.hypot(b.wx - wx, b.fy * state.height - state.y) > near);
  r.popped += before - r.bubbles.length;
  if (!r.hoops.length) r.done = true;
}

function wobbleRing(ctx, x, y, rx, ry, seed) {
  ctx.beginPath();
  for (let i = 0; i <= 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const j = 1 + Math.sin(i * 5 + seed) * 0.03;
    const px = x + Math.cos(a) * rx * j;
    const py = y + Math.sin(a) * ry * j;
    if (i) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
}

export function drawHoop(ctx, x, y, r, i) {
  ctx.save();
  ctx.lineCap = ctx.lineJoin = "round";
  wobbleRing(ctx, x, y, r * 0.32, r, i);
  ctx.strokeStyle = i % 2 ? "#f3a6b8" : "#ffd36b";
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  wobbleRing(ctx, x, y, r * 0.32 + 5, r + 5, i);
  ctx.stroke();
  wobbleRing(ctx, x, y, r * 0.32 - 5, r - 5, i + 3);
  ctx.stroke();
  ctx.restore();
}

export function drawRaceBubble(ctx, x, y, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(200,225,245,0.55)";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, Math.PI * 1.2);
  ctx.stroke();
  ctx.restore();
}

export function drawRace(ctx, state, w, h) {
  const r = state.race;
  r.hoops.forEach((p, i) => drawHoop(ctx, p.wx - state.scroll, p.fy * h, hoopRadius(h), i));
  for (const b of r.bubbles) drawRaceBubble(ctx, b.wx - state.scroll, b.fy * h, bubbleRadius(h));
  ctx.save();
  ctx.font = `${Math.round(Math.max(16, h * 0.035))}px "Comic Sans MS", "Comic Neue", cursive`;
  ctx.textAlign = "left";
  ctx.fillStyle = "#444";
  ctx.fillText(`Hoops left: ${r.hoops.length}   Bubbles popped: ${r.popped}   Time: ${r.time.toFixed(1)}s`, 20, h * 0.06);
  ctx.restore();
}

// A rocky cave mouth with a wooden "RACE" sign, standing on the sea floor.
export function drawRaceCave(ctx, x, h) {
  const cw = raceCaveWidth(h);
  const ch = cw * 0.75;
  const base = h - 6;
  ctx.save();
  ctx.lineCap = ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - cw / 2, base);
  ctx.quadraticCurveTo(x - cw * 0.55, base - ch, x, base - ch);
  ctx.quadraticCurveTo(x + cw * 0.55, base - ch, x + cw / 2, base);
  ctx.closePath();
  ctx.fillStyle = "#b9b4c9";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - cw * 0.22, base);
  ctx.quadraticCurveTo(x - cw * 0.24, base - ch * 0.6, x, base - ch * 0.6);
  ctx.quadraticCurveTo(x + cw * 0.24, base - ch * 0.6, x + cw * 0.22, base);
  ctx.closePath();
  ctx.fillStyle = "#5a5470";
  ctx.fill();
  ctx.stroke();
  const sw = cw * 0.5;
  const sy = base - ch - 6;
  ctx.beginPath();
  ctx.moveTo(x, sy + 12);
  ctx.lineTo(x, base - ch * 0.8);
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(x - sw / 2, sy - 30, sw, 38, 6);
  ctx.fillStyle = "#e8c89a";
  ctx.fill();
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = `bold ${Math.round(sw * 0.24)}px "Comic Sans MS", "Comic Neue", cursive`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("RACE", x, sy - 11);
  ctx.restore();
}
