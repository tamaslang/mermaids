// Decorative background animals. They never interact with the mermaid.

const KINDS = {
  fish: { sprites: ["fish", "fish2"], width: [50, 80], speed: [60, 130], depth: 0.4, lane: [0.1, 0.7] },
  turtle: { sprites: ["turtle"], width: [100, 140], speed: [25, 45], depth: 0.5, lane: [0.2, 0.6] },
  crab: { sprites: ["crab"], width: [60, 80], speed: [18, 35], depth: 0.8, lane: null },
};

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function spawn(c, w, h, first) {
  const k = KINDS[c.kind];
  c.sprite = pick(k.sprites);
  c.w = rand(...k.width) * Math.min(1.4, Math.max(0.7, h / 600));
  c.dir = Math.random() < 0.5 ? 1 : -1;
  c.speed = rand(...k.speed);
  c.y = k.lane ? rand(k.lane[0], k.lane[1]) * h : h - c.w * 0.45 - 8;
  c.x = first ? rand(0, w) : c.dir === 1 ? -c.w : w + c.w;
  c.wait = first ? 0 : rand(1, 8);
}

export function createCritters(w, h) {
  const kinds = ["fish", "fish", "fish", "fish", "turtle", "turtle", "crab", "crab"];
  return kinds.map((kind) => {
    const c = { kind };
    spawn(c, w, h, true);
    return c;
  });
}

// `worldDx` is how far the world scrolled this frame, so critters drift with the parallax.
export function updateCritters(list, dt, worldDx, w, h) {
  for (const c of list) {
    if (c.wait > 0) { c.wait -= dt; continue; }
    c.x += c.dir * c.speed * dt - worldDx * KINDS[c.kind].depth;
    if (c.x < -c.w * 1.5 || c.x > w + c.w * 1.5) spawn(c, w, h, false);
  }
}

export function drawCritters(ctx, list, sprites, t) {
  for (const c of list) {
    if (c.wait > 0) continue;
    const img = sprites[c.sprite];
    const ch = c.w * (img.height / img.width);
    const bob = c.kind === "crab" ? 0 : Math.sin(t / 700 + c.speed) * 4;
    ctx.save();
    ctx.translate(c.x, c.y + bob);
    if (c.dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -c.w / 2, -ch / 2, c.w, ch);
    ctx.restore();
  }
}
