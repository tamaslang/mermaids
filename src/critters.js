import { drawSpeech } from "./speech.js";

// Decorative background animals. They never interact with the mermaid.

const KINDS = {
  fish: { sprites: ["fish", "fish2"], width: [50, 80], speed: [60, 130], depth: 0.4, lane: [0.1, 0.7] },
  turtle: { sprites: ["turtle"], width: [100, 140], speed: [25, 45], depth: 0.5, lane: [0.2, 0.6] },
  crab: { sprites: ["crab"], width: [60, 80], speed: [18, 35], depth: 0.8, lane: null },
};

export const SAY_SECONDS = 2;
export const REPLY_DELAY = 0.9;
const GREET_RANGE = 300;

// The closest visible critter within greeting range, or null.
export function nearestCritter(list, x, y, w, range = GREET_RANGE) {
  let best = null;
  let bestD = range;
  for (const c of list) {
    if (c.wait > 0 || c.x < 0 || c.x > w) continue;
    const d = Math.hypot(c.x - x, c.y - y);
    if (d < bestD) { best = c; bestD = d; }
  }
  return best;
}

// The critter pauses, turns toward the mermaid and says hello back a moment later.
export function greet(c, fromX) {
  c.dir = fromX >= c.x ? 1 : -1;
  c.hold = REPLY_DELAY + SAY_SECONDS;
  c.say = { text: "Hello!", age: 0, delay: REPLY_DELAY };
}

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
    if (c.say) c.say.age += dt;
    if (c.say && c.say.age > c.say.delay + SAY_SECONDS) c.say = null;
    if (c.hold > 0) c.hold -= dt;
    c.x += (c.hold > 0 ? 0 : c.dir * c.speed * dt) - worldDx * KINDS[c.kind].depth;
    if (c.x < -c.w * 1.5 || c.x > w + c.w * 1.5) spawn(c, w, h, false);
  }
}

export function drawCritterSpeech(ctx, list) {
  for (const c of list) {
    if (c.wait > 0 || !c.say || c.say.age < c.say.delay) continue;
    const fade = Math.min(1, (c.say.delay + SAY_SECONDS - c.say.age) / 0.4);
    drawSpeech(ctx, c.x, c.y - c.w * 0.3, c.say.text, fade);
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
