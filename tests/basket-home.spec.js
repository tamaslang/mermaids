import { test, expect } from "@playwright/test";

async function start(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.locator("#game-canvas")).toBeVisible();
}

const st = (page) => page.evaluate(() => { const s = window.__game.state; return { mode: s.mode, has: s.hasBasket, home: s.homeBasket, basket: s.basket }; });

test("take the basket home, press G at the table to put it down, A to pick it up again", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  await page.evaluate(() => { const s = window.__game.state; s.scroll = 5000 - s.x; });
  await page.keyboard.press("Enter");
  await page.evaluate(async () => {
    const { basketSpot, marketItems } = await import("/src/market.js");
    const s = window.__game.state;
    const b = basketSpot(s.width, s.height);
    s.x = b.x; s.y = b.y;
    window.__game.keys.clear();
  });
  await page.keyboard.press("a");
  expect((await st(page)).has).toBe(true);
  await page.keyboard.press("Enter"); // leave the shop with the basket
  expect(await st(page)).toMatchObject({ mode: "sea", has: true });

  await page.evaluate(() => { const s = window.__game.state; s.scroll = 1400 - s.x; });
  await page.keyboard.press("Enter");
  expect((await st(page)).mode).toBe("home");

  await page.evaluate(() => { const s = window.__game.state; s.x = s.width * 0.8; s.y = s.height * 0.7; });
  await page.keyboard.press("g");
  expect((await st(page)).has).toBe(true);

  await page.evaluate(() => { const s = window.__game.state; s.x = s.width * 0.5; s.y = s.height * 0.7; });
  await page.keyboard.press("g");
  expect(await st(page)).toMatchObject({ has: false, home: [] });
  await page.waitForTimeout(200);

  await page.keyboard.press("a");
  expect(await st(page)).toMatchObject({ has: true, home: null });
  expect(errors).toEqual([]);
});
