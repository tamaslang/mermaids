import { test, expect } from "@playwright/test";

async function start(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.locator("#game-canvas")).toBeVisible();
}

const mode = (page) => page.evaluate(() => window.__game.state.mode);

const painted = (page) => page.locator("#game-canvas").evaluate((c) => {
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 0; i < d.length; i += 4 * 37) if (d[i] < 235) n++;
  return n;
});

test("Enter does nothing far from Mermarket", async ({ page }) => {
  await start(page);
  await page.keyboard.press("Enter");
  expect(await mode(page)).toBe("sea");
});

test("visit Mermarket, see the shop painted, and leave back to the sea", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);

  // The entrance is drawn in the sea
  await page.evaluate(() => { const s = window.__game.state; s.scroll = 5000 - s.x; });
  await page.waitForTimeout(150);
  expect(await painted(page)).toBeGreaterThan(50);

  await page.keyboard.press("Enter");
  expect(await mode(page)).toBe("market");
  await page.waitForTimeout(150);
  expect(await painted(page)).toBeGreaterThan(50);
  expect(await page.evaluate(() => window.__game.state.ladySay.text)).toContain("Mermarket");

  await page.keyboard.press("Enter");
  const out = await page.evaluate(() => ({ mode: window.__game.state.mode, scroll: window.__game.state.scroll }));
  expect(out.mode).toBe("sea");
  expect(out.scroll).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

const enterMarket = async (page) => {
  await page.evaluate(() => { const s = window.__game.state; s.scroll = 5000 - s.x; });
  await page.keyboard.press("Enter");
};

const park = (page, id) => page.evaluate(async (id) => {
  const { marketItems } = await import("/src/market.js");
  const s = window.__game.state;
  const it = marketItems(s.width, s.height).find((i) => i.id === id);
  s.x = it.x;
  s.y = it.y;
}, id);

const goToTill = (page) => page.evaluate(() => {
  const s = window.__game.state;
  s.x = s.width * 0.8;
  s.y = s.height * 0.6;
});

const shop = (page) => page.evaluate(() => {
  const s = window.__game.state;
  return { basket: s.basket, inventory: s.inventory, open: s.inventoryOpen };
});

test("take things into the basket, pay at the till with P, see them in the inventory with I", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  await enterMarket(page);

  await park(page, "strawberry");
  await page.keyboard.press("t");
  await park(page, "jamPurple");
  await page.keyboard.press("t");
  await park(page, "strawberry");
  await page.keyboard.press("t");
  expect((await shop(page)).basket).toEqual(["strawberry", "jamPurple", "strawberry"]);
  expect((await shop(page)).inventory).toEqual({});

  await goToTill(page);
  await page.keyboard.press("p");
  expect(await shop(page)).toMatchObject({ basket: [], inventory: { strawberry: 2, jamPurple: 1 } });

  await page.keyboard.press("i");
  expect((await shop(page)).open).toBe(true);
  await page.waitForTimeout(150);
  expect(await painted(page)).toBeGreaterThan(50);
  await page.keyboard.press("i");
  expect((await shop(page)).open).toBe(false);
  expect(errors).toEqual([]);
});

test("P away from the till pays nothing, an empty basket stays empty, and unpaid things are put back when leaving", async ({ page }) => {
  await start(page);
  await enterMarket(page);

  await goToTill(page);
  await page.keyboard.press("p");
  expect(await shop(page)).toMatchObject({ basket: [], inventory: {} });

  await park(page, "carrot");
  await page.keyboard.press("t");
  await page.evaluate(() => { const s = window.__game.state; s.x = 40; s.y = s.height * 0.3; });
  await page.keyboard.press("p");
  expect((await shop(page)).basket).toEqual(["carrot"]);

  await page.keyboard.press("Enter");
  expect(await shop(page)).toMatchObject({ basket: [], inventory: {} });
});

test("T far from any shelf item takes nothing", async ({ page }) => {
  await start(page);
  await enterMarket(page);
  await page.evaluate(() => { const s = window.__game.state; s.x = 40; s.y = s.height * 0.85; });
  await page.keyboard.press("t");
  expect((await shop(page)).basket).toEqual([]);
});
