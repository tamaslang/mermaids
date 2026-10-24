import { test, expect } from "@playwright/test";

async function start(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.locator("#game-canvas")).toBeVisible();
}

test("holding B blows bubbles that rise and pop", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  await page.keyboard.down("b");
  await page.waitForTimeout(600);
  const count = await page.evaluate(() => window.__game.state.puffs.length);
  expect(count).toBeGreaterThan(3);
  await page.keyboard.up("b");
  await page.waitForTimeout(3500);
  expect(await page.evaluate(() => window.__game.state.puffs.length)).toBe(0);
  expect(errors).toEqual([]);
});

test("H says hello to a nearby animal, who says hello back a moment later", async ({ page }) => {
  await start(page);
  await page.evaluate(() => {
    const g = window.__game;
    const c = g.critters[0];
    c.wait = 0;
    c.x = g.state.x + 120;
    c.y = g.state.y;
  });
  await page.keyboard.press("h");
  const first = await page.evaluate(() => ({ me: window.__game.state.say?.text, them: window.__game.critters[0].say }));
  expect(first.me).toBe("Hello!");
  expect(first.them.age).toBeLessThan(first.them.delay);

  await page.waitForTimeout(1300);
  const later = await page.evaluate(() => window.__game.critters[0].say);
  expect(later.age).toBeGreaterThan(later.delay);
  await page.waitForTimeout(2200);
  expect(await page.evaluate(() => window.__game.critters[0].say)).toBeNull();
});

test("H does nothing when no animal is close", async ({ page }) => {
  await start(page);
  await page.evaluate(() => {
    for (const c of window.__game.critters) c.wait = 99;
  });
  await page.keyboard.press("h");
  expect(await page.evaluate(() => window.__game.state.say)).toBeNull();
});
