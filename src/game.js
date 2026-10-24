import { createCritters, updateCritters, drawCritters } from "./critters.js";
import { makeWaterTile, drawTile, drawCave } from "./paper.js";

export const SPEED = 260;
export const WORLD_SPEED = 220;

const ACCEL = 8;
const TURN_RATE = 12;

export const spriteWidth = (h) => Math.min(280, Math.max(120, h * 0.3));

// Half extents of the drawn mermaid, so her whole body (not just her centre) stays on screen.
function margins(height) {
  const sw = spriteWidth(height);
  return { mx: sw * 0.48, my: sw * 0.28 };
}

const FLIP_SECONDS = 0.65;

// Where the reef entrance sits in the world (foreground layer, scrolls 1:1).
export const HOME_X = 1400;
export const reefWidth = (h) => Math.min(520, Math.max(300, h * 0.8));

export function createState(width, height) {
  return { width, height, x: width * 0.25, y: height / 2, vx: 0, vy: 0, facing: 1, turn: 1, flip: 0, scroll: 0, mode: "sea", sitting: null };
}

export function nearDoor(state) {
  return state.mode === "sea" && Math.abs(HOME_X - state.scroll - state.x) < reefWidth(state.height) * 0.3;
}

// Two shell-and-pearl sofas standing on the cave floor.
export function homeLayout(w, h) {
  const sofaW = Math.min(260, w * 0.24);
  const floor = h * 0.86;
  return { floor, sofaW, sofaH: sofaW * 0.6, sofas: [{ x: w * 0.3 }, { x: w * 0.7 }] };
}

export function nearSofa(state) {
  if (state.mode !== "home") return -1;
  const { sofas, sofaW } = homeLayout(state.width, state.height);
  return sofas.findIndex((f) => Math.abs(f.x - state.x) < sofaW * 0.6 && state.y > state.height * 0.45);
}

export function toggleDoor(state) {
  if (state.mode === "sea") {
    if (!nearDoor(state)) return;
    state.mode = "home";
    state.x = margins(state.height).mx + 20;
    state.y = homeLayout(state.width, state.height).floor - state.height * 0.12;
    state.vx = state.vy = 0;
    state.facing = 1;
  } else {
    state.mode = "sea";
    state.sitting = null;
    state.vx = state.vy = 0;
    state.scroll = Math.max(0, HOME_X - state.width * 0.5);
    state.x = HOME_X - state.scroll;
  }
}

export function toggleSit(state) {
  if (state.sitting !== null) { state.sitting = null; return; }
  const i = nearSofa(state);
  if (i < 0) return;
  state.sitting = i;
  state.vx = state.vy = 0;
  state.x = homeLayout(state.width, state.height).sofas[i].x;
}

export function startFlip(state) {
  if (!state.flip) state.flip = 0.0001;
}

// Pure update: `keys` is a Set of normalised direction names.
// Velocity eases toward the target so swimming starts and stops smoothly.
export function step(state, keys, dt) {
  const dx = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
  const dy = (keys.has("down") ? 1 : 0) - (keys.has("up") ? 1 : 0);
  if (state.sitting !== null) {
    if (dx || dy) state.sitting = null;
    else { state.vx = state.vy = 0; return; }
  }
  const len = Math.hypot(dx, dy) || 1;
  const ease = Math.min(1, ACCEL * dt);
  state.vx += ((dx / len) * SPEED - state.vx) * ease;
  state.vy += ((dy / len) * SPEED - state.vy) * ease;
  if (!dx && Math.abs(state.vx) < 1) state.vx = 0;
  if (!dy && Math.abs(state.vy) < 1) state.vy = 0;

  const { mx, my } = margins(state.height);
  state.x = Math.min(state.width - mx, Math.max(mx, state.x + state.vx * dt));
  state.y = Math.min(state.height - my, Math.max(my, state.y + state.vy * dt));

  if (state.flip) {
    state.flip += dt / FLIP_SECONDS;
    if (state.flip >= 1) state.flip = 0;
  }

  if (dx) state.facing = dx;
  state.turn += (state.facing - state.turn) * Math.min(1, TURN_RATE * dt);
  if (Math.abs(state.facing - state.turn) < 0.01) state.turn = state.facing;

  if (state.mode === "sea") state.scroll = Math.max(0, state.scroll + (state.vx / SPEED) * WORLD_SPEED * dt);
}

// Keep the mermaid at the same relative spot when the screen size changes.
export function resizeState(state, width, height) {
  state.x = (state.x / state.width) * width;
  state.y = (state.y / state.height) * height;
  state.width = width;
  state.height = height;
  const { mx, my } = margins(height);
  state.x = Math.min(width - mx, Math.max(mx, state.x));
  state.y = Math.min(height - my, Math.max(my, state.y));
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

  const onDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); if (!e.repeat) toggleDoor(state); return; }
    if ((e.key === "e" || e.key === "E") && !e.repeat) { toggleSit(state); return; }
    if (e.key === " ") {
      e.preventDefault();
      if (!e.repeat) startFlip(state);
      return;
    }
    const k = KEY_MAP[e.key];
    if (k) { keys.add(k); e.preventDefault(); }
  };
  const onUp = (e) => { const k = KEY_MAP[e.key]; if (k) keys.delete(k); };
  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);

  const critters = createCritters(canvas.width, canvas.height);
  const bubbles = Array.from({ length: 28 }, () => ({
    x: Math.random(), y: Math.random(), r: 3 + Math.random() * 8, speed: 0.04 + Math.random() * 0.06, depth: 0.3 + Math.random() * 0.5,
  }));

  function drawBubbles(dt) {
    const { width: w, height: h } = canvas;
    ctx.save();
    ctx.strokeStyle = "rgba(70,70,70,0.6)";
    ctx.lineWidth = 1.8;
    for (const b of bubbles) {
      b.y -= b.speed * dt;
      if (b.y < -0.05) { b.y = 1.05; b.x = Math.random(); }
      const shift = state.mode === "sea" ? state.scroll * b.depth : 0;
      const x = (((b.x * w - shift) % w) + w) % w;
      ctx.beginPath();
      ctx.arc(x, b.y * h, b.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function hint(text) {
    const { width: w, height: h } = canvas;
    ctx.save();
    ctx.font = `${Math.round(Math.max(16, h * 0.04))}px "Comic Sans MS", "Comic Neue", cursive`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#444";
    ctx.fillText(text, w / 2, h * 0.08);
    ctx.restore();
  }

  let prevScroll = 0;
  function drawSea(dt) {
    const { width: w, height: h } = canvas;
    const dWorld = state.scroll - prevScroll;
    prevScroll = state.scroll;
    drawTile(ctx, water, state.scroll * 0.3, w);
    drawBubbles(dt);
    updateCritters(critters, dt, dWorld, w, h);

    // Mid layer: coral pillars, parallax, deterministic per world slot
    const SLOT = 520;
    const first = Math.floor((state.scroll * 0.6) / SLOT);
    for (let k = first; k <= first + Math.ceil(w / SLOT) + 1; k++) {
      const ch = 170 + ((k * 53) % 90);
      const cw = ch * (sprites.coral.width / sprites.coral.height);
      ctx.drawImage(sprites.coral, k * SLOT - state.scroll * 0.6, h - ch - 10, cw, ch);
    }

    drawCritters(ctx, critters, sprites, performance.now());

    // Kelp forest between the coral and the foreground
    const KSLOT = 310;
    const kfirst = Math.floor((state.scroll * 0.8) / KSLOT);
    for (let k = kfirst; k <= kfirst + Math.ceil(w / KSLOT) + 1; k++) {
      if ((k * 7) % 3 === 0) continue;
      const kh = 150 + ((k * 37) % 110);
      ctx.drawImage(sprites.kelp, k * KSLOT - state.scroll * 0.8, h - kh - 4, kh / 3, kh);
    }

    // The mermaid's home: a coral reef with a doorway
    const rw = reefWidth(h);
    const rh = rw * (sprites.reef.height / sprites.reef.width);
    ctx.drawImage(sprites.reef, HOME_X - state.scroll - rw / 2, h - rh - 6, rw, rh);

    // Seabed weeds in the foreground at full scroll speed
    const weedW = 400;
    const weedH = 90;
    let wx = -(state.scroll % weedW);
    for (; wx < w; wx += weedW) ctx.drawImage(sprites.weeds, wx, h - weedH, weedW, weedH);

    drawMermaid(Math.sin(state.scroll / 40) * 3);
    if (nearDoor(state)) hint("Press Enter to go home");
  }

  function drawHome(dt) {
    const { width: w, height: h } = canvas;
    const { floor, sofaW, sofaH, sofas } = homeLayout(w, h);
    drawCave(ctx, w, h, floor);
    drawBubbles(dt);
    sofas.forEach((f) => ctx.drawImage(sprites.sofa, f.x - sofaW / 2, floor - sofaH, sofaW, sofaH));
    drawMermaid(Math.sin(performance.now() / 500) * 3);
    if (state.sitting !== null) hint("Enter leaves home, any arrow stands up");
    else if (nearSofa(state) >= 0) hint("Press E to sit");
    else hint("Press Enter to leave home");
  }

  function drawMermaid(bob) {
    const h = canvas.height;
    const sw = spriteWidth(h);
    ctx.save();
    if (state.sitting !== null) {
      const { floor, sofaH } = homeLayout(canvas.width, h);
      const sitW = sw * 0.85;
      const sitH = sitW * (sprites.mermaidSit.height / sprites.mermaidSit.width);
      ctx.translate(state.x, floor - sofaH * 0.42);
      ctx.drawImage(sprites.mermaidSit, -sitW * 0.45, -sitH * 0.82, sitW, sitH);
    } else {
      const sh = sw * (sprites.mermaid.height / sprites.mermaid.width);
      ctx.translate(state.x, state.y + bob);
      ctx.scale(state.turn, 1);
      ctx.rotate((state.vy / SPEED) * 0.35 + state.flip * Math.PI * 2 * state.facing);
      ctx.drawImage(sprites.mermaid, -sw / 2, -sh / 2, sw, sh);
    }
    ctx.restore();
  }

  function draw(dt) {
    if (state.mode === "home") drawHome(dt);
    else drawSea(dt);
  }

  function frame(now) {
    if (!running) return;
    const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.05);
    step(state, keys, dt);
    last = now;
    draw(dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    state,
    sprites,
    bubbles,
    critters,
    stop() {
      running = false;
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("resize", onResize);
    },
  };
}
