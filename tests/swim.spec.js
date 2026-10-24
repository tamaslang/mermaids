import { test, expect } from "@playwright/test";

async function start(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.locator("#game-canvas")).toBeVisible();
}

const pos = (page) => page.evaluate(() => ({ x: window.__game.state.x, y: window.__game.state.y, s: window.__game.state.scroll }));

test("world stays still when the mermaid is not swimming right, and scrolls when she is", async ({ page }) => {
  await start(page);
  const a = await pos(page);
  await page.waitForTimeout(300);
  const b = await pos(page);
  expect(b.s).toBe(a.s);

  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(300);
  await page.keyboard.up("ArrowRight");
  const c = await pos(page);
  expect(c.s).toBeGreaterThan(b.s);

  await page.waitForTimeout(100);
  const d = await pos(page);
  await page.waitForTimeout(300);
  expect((await pos(page)).s).toBe(d.s);
});

test("arrow keys move the mermaid", async ({ page }) => {
  await start(page);
  const a = await pos(page);
  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(300);
  await page.keyboard.up("ArrowUp");
  const b = await pos(page);
  expect(b.y).toBeLessThan(a.y);

  await page.keyboard.down("d");
  await page.waitForTimeout(300);
  await page.keyboard.up("d");
  const c = await pos(page);
  expect(c.x).toBeGreaterThan(b.x);
});

test("mermaid stays inside the screen", async ({ page }) => {
  await start(page);
  await page.keyboard.down("ArrowDown");
  await page.waitForTimeout(2500);
  await page.keyboard.up("ArrowDown");
  const p = await pos(page);
  const h = await page.evaluate(() => window.__game.state.height);
  expect(p.y).toBeLessThanOrEqual(h);
});

test("game canvas is painted and the page has no errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e));
  await start(page);
  await page.waitForTimeout(200);
  const painted = await page.evaluate(() => {
    const c = document.getElementById("game-canvas");
    const d = c.getContext("2d").getImageData(c.width / 2, c.height / 2, 1, 1).data;
    return d[3] > 0 && d[0] + d[1] + d[2] > 0;
  });
  expect(painted).toBe(true);
  expect(errors).toEqual([]);
});

test("all hand-drawn sprites load", async ({ page }) => {
  await start(page);
  const bad = await page.evaluate(() =>
    Object.entries(window.__game.sprites).filter(([, i]) => !i.naturalWidth).map(([n]) => n));
  expect(bad).toEqual([]);
});

test("mermaid is drawn on screen at start and after a resize", async ({ page }) => {
  await start(page);
  const visible = () => page.evaluate(() => {
    const c = document.getElementById("game-canvas");
    const { x, y } = window.__game.state;
    const ctx = c.getContext("2d");
    // Mermaid hair/tail are saturated colours; the paper and water are not.
    const d = ctx.getImageData(Math.max(0, x - 90), Math.max(0, y - 40), 180, 80).data;
    let colourful = 0;
    for (let i = 0; i < d.length; i += 4) if (Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 90 && d[i + 3] > 0 && d[i] > 150) colourful++;
    return { colourful, inside: x > 0 && x < c.width && y > 0 && y < c.height };
  });
  await page.waitForTimeout(150);
  let v = await visible();
  expect(v.inside).toBe(true);
  expect(v.colourful).toBeGreaterThan(20);

  await page.setViewportSize({ width: 500, height: 900 });
  await page.waitForTimeout(200);
  v = await visible();
  expect(v.inside).toBe(true);
  expect(v.colourful).toBeGreaterThan(20);
});
