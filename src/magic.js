// Magic: using an item from the inventory casts a silly timed spell on the sea.
import { drawItemIcon } from "./market.js";

const INK = "#4a4a4a";
const FONT = '"Comic Sans MS", "Comic Neue", cursive';
export const MAGIC_SECONDS = 20;

export const MAGIC = {
  jamRed: { title: "Crab hula-hoop party", say: "Hula time!" },
  jamPurple: { title: "Crazy fish", say: "Fish go wild!" },
  jamYellow: { title: "Mango spray feast", say: "Mango splash!" },
  jamPink: { title: "Jellyfish parade", say: "Jellies, come!" },
  strawberry: { title: "Strawberry rain", say: "Berry shower!" },
  carrot: { title: "Carrot turbo swim", say: "Zoom!" },
  candy: { title: "Pearl disco", say: "Party time!" },
  jelly: { title: "Wobbly world", say: "Boing!" },
};

const rand = (a, b) => a + Math.random() * (b - a);
const onScreen = (c, w) => c.x > 0 && c.x < w;

// Selection helpers for the inventory page.
export const inventoryIds = (state) => Object.keys(state.inventory);

export function moveSelection(state, d) {
  const n = inventoryIds(state).length;
  state.invSel = n ? (((state.invSel || 0) + d) % n + n) % n : 0;
}

// Uses the highlighted item. Magic only makes sense in the open sea, so indoors it is refused.
export function useItem(state, critters) {
  const ids = inventoryIds(state);
  if (!ids.length) return false;
  const id = ids[Math.min(state.invSel || 0, ids.length - 1)];
  if (!MAGIC[id]) return false;
  if (state.mode !== "sea") {
    state.invMsg = "Swim out into the sea to use magic!";
    return false;
  }
  if (--state.inventory[id] <= 0) delete state.inventory[id];
  state.invSel = Math.min(state.invSel || 0, Math.max(0, inventoryIds(state).length - 1));
  state.invMsg = null;
  state.inventoryOpen = false;
  startMagic(state, id, critters);
  return true;
}

export function stopMagic(state, critters) {
  state.magic = null;
  state.speedMul = 1;
  for (const c of critters) c.fx = null;
}

export function startMagic(state, id, critters) {
  stopMagic(state, critters);
  const { width: w, height: h } = state;
  const m = { id, left: MAGIC_SECONDS, total: MAGIC_SECONDS, t: 0, things: [], timer: 0 };
  state.magic = m;
  state.say = { text: MAGIC[id].say, age: 0 };
  for (const c of critters) {
    c.phase = Math.random() * 6.28;
    if (c.wait > 0 || !onScreen(c, w)) { c.wait = 0; c.x = rand(w * 0.1, w * 0.9); }
  }
  if (id === "jamPink") {
    for (let i = 0; i < 6; i++) m.things.push({ x: rand(0, w), y: rand(h * 0.15, h * 0.7), s: rand(50, 90), vx: rand(15, 40) * (i % 2 ? 1 : -1), phase: rand(0, 6) });
  }
  if (id === "jamYellow") {
    m.spray = { wx: state.scroll + Math.min(w * 0.9, Math.max(w * 0.1, state.x + state.facing * spriteReach(h))), y: state.y };
    for (let i = 0; i < 40; i++) m.things.push({ a: rand(0, 6.28), sp: rand(80, 260), r: rand(3, 8), age: 0 });
  }
  if (id === "candy" || id === "strawberry") m.drops = [];
}

const spriteReach = (h) => Math.min(280, Math.max(120, h * 0.3)) * 0.6;

export function updateMagic(state, critters, dt, w, h) {
  const m = state.magic;
  for (const c of critters) c.fx = null;
  if (!m) return;
  m.t += dt;
  m.left -= dt;
  if (m.left <= 0) { stopMagic(state, critters); return; }
  const t = m.t;
  for (const c of critters) {
    if (c.wait > 0) continue;
    const p = c.phase || 0;
    if (m.id === "jamRed" && c.kind === "crab") {
      c.hold = 0.2;
      c.fx = { dx: Math.sin(t * 3 + p) * 10, dy: -Math.abs(Math.sin(t * 6 + p)) * c.w * 0.4, rot: Math.sin(t * 6 + p) * 0.2, hoop: t * 9 + p };
    } else if (m.id === "jamPurple" && c.kind === "fish") {
      c.crazy = (c.crazy || 0) - dt;
      if (c.crazy <= 0) { c.dir = Math.random() < 0.5 ? 1 : -1; c.crazy = rand(0.3, 0.9); }
      c.x += c.dir * c.speed * 2.5 * dt;
      c.y = Math.min(h * 0.85, Math.max(h * 0.08, c.y + Math.sin(t * 9 + p) * 140 * dt));
      if (c.x < 0) c.dir = 1;
      if (c.x > w) c.dir = -1;
      c.fx = { rot: Math.sin(t * 12 + p) * 0.7 };
    } else if (m.id === "jamYellow" && c.kind === "fish") {
      const sx = m.spray.wx - state.scroll;
      const a = t * 2 + p;
      const r = 25 + (p % 1) * 60;
      const tx = sx + Math.cos(a) * r;
      const ty = m.spray.y + Math.sin(a) * r * 0.6;
      c.dir = tx >= c.x ? 1 : -1;
      c.x += (tx - c.x) * Math.min(1, 2.5 * dt);
      c.y += (ty - c.y) * Math.min(1, 2.5 * dt);
      c.hold = 0;
      c.fx = { dy: Math.sin(t * 14 + p) * 3 };
    } else if (m.id === "candy") {
      c.fx = { dy: -Math.abs(Math.sin(t * 5 + p)) * 22, rot: Math.sin(t * 5 + p) * 0.18 };
    } else if (m.id === "jelly") {
      const k = Math.sin(t * 8 + p) * 0.25;
      c.fx = { sx: 1 + k, sy: 1 - k };
    } else if (m.id === "strawberry" && c.kind !== "crab") {
      c.fx = { dy: Math.sin(t * 4 + p) * 4 };
    }
  }

  if (m.id === "jamPink") {
    for (const j of m.things) {
      j.x += j.vx * dt;
      if (j.x < -100) j.x = w + 100;
      if (j.x > w + 100) j.x = -100;
    }
  } else if (m.id === "jamYellow") {
    for (const s of m.things) s.age += dt;
  } else if (m.id === "strawberry" || m.id === "candy") {
    m.timer -= dt;
    if (m.timer <= 0) {
      m.timer = m.id === "strawberry" ? 0.18 : 0.12;
      m.drops.push(m.id === "strawberry"
        ? { x: rand(0, w), y: -30, vy: rand(110, 200), sw: rand(0, 6), s: rand(32, 48) }
        : { x: rand(0, w), y: h + 20, vy: -rand(80, 180), sw: rand(0, 6), s: rand(6, 16), hue: rand(0, 360) });
    }
    for (const d of m.drops) { d.y += d.vy * dt; d.x += Math.sin(t * 2 + d.sw) * 20 * dt; }
    m.drops = m.drops.filter((d) => d.y > -60 && d.y < h + 60);
    if (m.id === "strawberry") {
      m.sayTimer = (m.sayTimer || 0) - dt;
      if (m.sayTimer <= 0) {
        m.sayTimer = 1.6;
        const list = critters.filter((c) => c.wait <= 0 && onScreen(c, w) && !c.say);
        if (list.length) list[Math.floor(Math.random() * list.length)].say = { text: "Yum!", age: 0, delay: 0 };
      }
    }
  } else if (m.id === "carrot") {
    state.speedMul = 2.2;
    m.timer -= dt;
    if (m.timer <= 0) {
      m.timer = 0.1;
      m.things.push({ x: state.x, y: state.y + 10, age: 0, vy: rand(20, 60) });
    }
    for (const q of m.things) { q.age += dt; q.y += q.vy * dt; }
    m.things = m.things.filter((q) => q.age < 1.2);
  }
}

// Extras drawn over the critters: spray, jellyfish, rain, trails, disco light.
export function drawMagic(ctx, state, w, h, now) {
  const m = state.magic;
  if (!m) return;
  ctx.save();
  if (m.id === "jamPink") {
    for (const j of m.things) drawJelly(ctx, j.x, j.y + Math.sin(m.t * 1.5 + j.phase) * 18, j.s, m.t + j.phase);
  } else if (m.id === "jamYellow") {
    const sx = m.spray.wx - state.scroll;
    const eaten = 1 - m.t / m.total;
    for (const s of m.things) {
      const e = Math.min(1, s.age / 1.2);
      const d = s.sp * (1 - Math.pow(1 - e, 3)) * 0.5;
      const x = sx + Math.cos(s.a) * d;
      const y = m.spray.y + Math.sin(s.a) * d * 0.7 - (1 - e) * 4;
      ctx.beginPath();
      ctx.arc(x, y, s.r * (0.4 + 0.6 * eaten), 0, Math.PI * 2);
      ctx.fillStyle = "#ffd36b";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  } else if (m.id === "strawberry") {
    for (const d of m.drops) drawItemIcon(ctx, "strawberry", d.x, d.y, d.s);
  } else if (m.id === "candy") {
    ctx.fillStyle = `hsla(${(m.t * 120) % 360}, 90%, 80%, ${0.16 + 0.1 * Math.sin(m.t * 6)})`;
    ctx.fillRect(0, 0, w, h);
    for (const d of m.drops) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.s, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${d.hue}, 80%, 88%)`;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  } else if (m.id === "carrot") {
    for (const q of m.things) {
      ctx.globalAlpha = 1 - q.age / 1.2;
      drawItemIcon(ctx, "carrot", q.x - state.facing * 60 - q.age * 40 * state.facing, q.y, 30);
    }
  }
  ctx.restore();
}

function drawJelly(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = ctx.lineCap = "round";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * s * 0.14, s * 0.2);
    for (let k = 1; k <= 4; k++) ctx.lineTo(i * s * 0.14 + Math.sin(t * 3 + k + i) * s * 0.07, s * 0.2 + k * s * 0.14);
    ctx.stroke();
  }
  const squish = 1 + Math.sin(t * 3) * 0.08;
  ctx.beginPath();
  ctx.moveTo(-s * 0.4, s * 0.2);
  ctx.quadraticCurveTo(-s * 0.45, -s * 0.5 * squish, 0, -s * 0.5 * squish);
  ctx.quadraticCurveTo(s * 0.45, -s * 0.5 * squish, s * 0.4, s * 0.2);
  ctx.closePath();
  ctx.fillStyle = "#f3a6b8";
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// The countdown, shown in every room while a spell is running.
export function drawMagicHud(ctx, state, w, h) {
  const m = state.magic;
  if (!m) return;
  const size = Math.round(Math.max(16, h * 0.035));
  const bw = Math.min(360, w * 0.5);
  const x = w - bw - 16;
  const y = 14;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, bw, size * 2.6, 12);
  ctx.fillStyle = "rgba(255,253,245,0.9)";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  drawItemIcon(ctx, m.id, x + 30, y + size * 1.3, size * 1.5);
  ctx.fillStyle = INK;
  ctx.font = `${size}px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(MAGIC[m.id].title, x + 58, y + size * 0.85);
  ctx.textAlign = "right";
  ctx.fillText(`${Math.ceil(m.left)}s`, x + bw - 14, y + size * 0.85);
  ctx.beginPath();
  ctx.roundRect(x + 58, y + size * 1.7, bw - 76, size * 0.4, 6);
  ctx.fillStyle = "#e8e2d0";
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x + 58, y + size * 1.7, Math.max(0, (bw - 76) * (m.left / m.total)), size * 0.4, 6);
  ctx.fillStyle = "#b49ad0";
  ctx.fill();
  ctx.restore();
}
