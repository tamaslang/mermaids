import { makeWaterTile, drawTile } from "./paper.js";

export const SPEED = 260;
export const WORLD_SPEED = 120;

export function createState(width, height) {
  return { width, height, x: width * 0.25, y: height / 2, scroll: 0, size: 40 };
}

// Pure update: `keys` is a Set of normalised direction names.
export function step(state, keys, dt) {
  const dx = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
  const dy = (keys.has("down") ? 1 : 0) - (keys.has("up") ? 1 : 0);
  const len = Math.hypot(dx, dy) || 1;
  const m = state.size;
  state.x = Math.min(state.width - m, Math.max(m, state.x + (dx / len) * SPEED * dt));
  state.y = Math.min(state.height - m, Math.max(m, state.y + (dy / len) * SPEED * dt));
  state.scroll += (WORLD_SPEED + (dx > 0 ? SPEED * 0.5 : 0)) * dt;
}

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
  let last = null;
  let running = true;

  const onDown = (e) => { const k = KEY_MAP[e.key]; if (k) { keys.add(k); e.preventDefault(); } };
  const onUp = (e) => { const k = KEY_MAP[e.key]; if (k) keys.delete(k); };
  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);

  const water = makeWaterTile(canvas.width, canvas.height, 21);
  const SPRITE_W = 150;

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
    const sh = SPRITE_W * (sprites.mermaid.height / sprites.mermaid.width);
    ctx.drawImage(sprites.mermaid, state.x - SPRITE_W / 2, state.y - sh / 2 + bob, SPRITE_W, sh);
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
    },
  };
}
