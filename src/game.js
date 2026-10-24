import { makeWaterTile, drawTile } from "./paper.js";

export const SPEED = 260;
export const WORLD_SPEED = 220;

const ACCEL = 8;
const TURN_RATE = 12;

export function createState(width, height) {
  return { width, height, x: width * 0.25, y: height / 2, vx: 0, vy: 0, facing: 1, turn: 1, scroll: 0, size: 40 };
}

// Pure update: `keys` is a Set of normalised direction names.
// Velocity eases toward the target so swimming starts and stops smoothly.
export function step(state, keys, dt) {
  const dx = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
  const dy = (keys.has("down") ? 1 : 0) - (keys.has("up") ? 1 : 0);
  const len = Math.hypot(dx, dy) || 1;
  const ease = Math.min(1, ACCEL * dt);
  state.vx += ((dx / len) * SPEED - state.vx) * ease;
  state.vy += ((dy / len) * SPEED - state.vy) * ease;
  if (!dx && Math.abs(state.vx) < 1) state.vx = 0;
  if (!dy && Math.abs(state.vy) < 1) state.vy = 0;

  const m = state.size;
  state.x = Math.min(state.width - m, Math.max(m, state.x + state.vx * dt));
  state.y = Math.min(state.height - m, Math.max(m, state.y + state.vy * dt));

  if (dx) state.facing = dx;
  state.turn += (state.facing - state.turn) * Math.min(1, TURN_RATE * dt);
  if (Math.abs(state.facing - state.turn) < 0.01) state.turn = state.facing;

  if (state.vx > 0) state.scroll += (state.vx / SPEED) * WORLD_SPEED * dt;
}

// Keep the mermaid at the same relative spot when the screen size changes.
export function resizeState(state, width, height) {
  state.x = (state.x / state.width) * width;
  state.y = (state.y / state.height) * height;
  state.width = width;
  state.height = height;
}

export const spriteWidth = (h) => Math.min(280, Math.max(120, h * 0.3));

const KEY_MAP = {
  ArrowLeft: "left", a: "left", A: "left",
  ArrowRight: "right", d: "right", D: "right",
  ArrowUp: "up", w: "up", W: "up",
  ArrowDown: "down", s: "down", S: "down",
};

export function startGame(canvas, sprites) {
  const ctx = canvas.getContext("2d");
  const keys = new Set();
  const state = createState(canvas.width, canvas.height);
  let water = makeWaterTile(canvas.width, canvas.height, 21);

  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h || (w === canvas.width && h === canvas.height)) return;
    canvas.width = w;
    canvas.height = h;
    resizeState(state, w, h);
    water = makeWaterTile(w, h, 21);
  }
  window.addEventListener("resize", onResize);
  let last = null;
  let running = true;

  const onDown = (e) => { const k = KEY_MAP[e.key]; if (k) { keys.add(k); e.preventDefault(); } };
  const onUp = (e) => { const k = KEY_MAP[e.key]; if (k) keys.delete(k); };
  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);

  function draw() {
    const { width: w, height: h } = canvas;
    drawTile(ctx, water, state.scroll * 0.3, w);

    // Mid layer: coral pillars, parallax, deterministic per world slot
    const SLOT = 520;
    const first = Math.floor((state.scroll * 0.6) / SLOT);
    for (let k = first; k <= first + Math.ceil(w / SLOT) + 1; k++) {
      const ch = 170 + ((k * 53) % 90);
      const cw = ch * (sprites.coral.width / sprites.coral.height);
      ctx.drawImage(sprites.coral, k * SLOT - state.scroll * 0.6, h - ch - 10, cw, ch);
    }

    // Seabed weeds in the foreground at full scroll speed
    const weedW = 400;
    const weedH = 90;
    let wx = -(state.scroll % weedW);
    for (; wx < w; wx += weedW) ctx.drawImage(sprites.weeds, wx, h - weedH, weedW, weedH);

    // Mermaid, with a gentle bob
    const bob = Math.sin(state.scroll / 40) * 3;
    const sw = spriteWidth(h);
    const sh = sw * (sprites.mermaid.height / sprites.mermaid.width);
    ctx.save();
    ctx.translate(state.x, state.y + bob);
    ctx.scale(state.turn, 1);
    ctx.rotate((state.vy / SPEED) * 0.35);
    ctx.drawImage(sprites.mermaid, -sw / 2, -sh / 2, sw, sh);
    ctx.restore();
  }

  function frame(now) {
    if (!running) return;
    step(state, keys, last === null ? 0 : Math.min((now - last) / 1000, 0.05));
    last = now;
    draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    state,
    sprites,
    stop() {
      running = false;
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("resize", onResize);
    },
  };
}
