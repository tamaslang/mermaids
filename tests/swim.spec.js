import { test, expect } from "@playwright/test";

async function start(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.locator("#game-canvas")).toBeVisible();
}

const pos = (page) => page.evaluate(() => ({ x: window.__game.state.x, y: window.__game.state.y, s: window.__game.state.scroll }));

test("world scrolls on its own", async ({ page }) => {
  await start(page);
  const a = await pos(page);
  await page.waitForTimeout(300);
  const b = await pos(page);
  expect(b.s).toBeGreaterThan(a.s);
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
