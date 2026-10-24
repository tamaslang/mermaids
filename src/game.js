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

export function startGame(canvas) {
  const ctx = canvas.getContext("2d");
  const keys = new Set();
  const state = createState(canvas.width, canvas.height);
  let last = null;
  let running = true;

  const onDown = (e) => { const k = KEY_MAP[e.key]; if (k) { keys.add(k); e.preventDefault(); } };
  const onUp = (e) => { const k = KEY_MAP[e.key]; if (k) keys.delete(k); };
  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);

  function draw() {
    const { width: w, height: h } = canvas;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0a6e9e");
    g.addColorStop(1, "#021b33");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Scrolling seabed rocks
    ctx.fillStyle = "#0b3a4a";
    for (let i = -1; i < w / 120 + 2; i++) {
      const wx = i * 120 - (state.scroll % 120);
      const rockH = 30 + ((((Math.floor((i * 120 + state.scroll) / 120) * 37) % 40) + 40) % 40);
      ctx.beginPath();
      ctx.ellipse(wx + 60, h, 70, rockH, 0, Math.PI, 0);
      ctx.fill();
    }

    // Mermaid: hair, tail, head
    ctx.fillStyle = "#ff7b54";
    ctx.beginPath();
    ctx.ellipse(state.x + 4, state.y - 10, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2ec4b6";
    ctx.beginPath();
    ctx.ellipse(state.x - 20, state.y, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe0bd";
    ctx.beginPath();
    ctx.arc(state.x + 14, state.y - 10, 14, 0, Math.PI * 2);
    ctx.fill();
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
    stop() {
      running = false;
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    },
  };
}
