import { test, expect } from "@playwright/test";

async function start(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.locator("#game-canvas")).toBeVisible();
}

const give = (page, inv) => page.evaluate((inv) => { window.__game.state.inventory = inv; }, inv);
const magic = (page) => page.evaluate(() => {
  const s = window.__game.state;
  return s.magic ? { id: s.magic.id, left: s.magic.left } : null;
});

test("choose an inventory item with the arrows and use it with Enter: the spell starts with a countdown", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  await give(page, { strawberry: 1, jamRed: 2 });
  await page.keyboard.press("i");
  await page.keyboard.press("ArrowDown");
  expect(await page.evaluate(() => window.__game.state.invSel)).toBe(1);
  await page.keyboard.press("Enter");
  const m = await magic(page);
  expect(m.id).toBe("jamRed");
  expect(m.left).toBeGreaterThan(18);
  expect(m.left).toBeLessThanOrEqual(20);
  const s = await page.evaluate(() => ({ ...window.__game.state.inventory, open: window.__game.state.inventoryOpen, mode: window.__game.state.mode }));
  expect(s).toMatchObject({ jamRed: 1, strawberry: 1, open: false, mode: "sea" });
  await page.waitForTimeout(1200);
  expect((await magic(page)).left).toBeLessThan(m.left);
  expect(errors).toEqual([]);
});

for (const id of ["jamRed", "jamPurple", "jamYellow", "jamPink", "strawberry", "carrot", "candy", "jelly"]) {
  test(`${id} magic runs without errors, then ends and restores the sea`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await start(page);
    await give(page, { [id]: 1 });
    await page.keyboard.press("i");
    await page.keyboard.press("Enter");
    expect((await magic(page)).id).toBe(id);
    expect(await page.evaluate(() => window.__game.state.inventory)).toEqual({});
    await page.waitForTimeout(800);
    await page.evaluate(() => { window.__game.state.magic.left = 0.2; });
    await page.waitForTimeout(500);
    expect(await magic(page)).toBeNull();
    expect(await page.evaluate(() => ({ mul: window.__game.state.speedMul, fx: window.__game.critters.some((c) => c.fx) }))).toEqual({ mul: 1, fx: false });
    expect(errors).toEqual([]);
  });
}

test("red jam makes the crabs dance and carrots make you swim faster", async ({ page }) => {
  await start(page);
  await give(page, { jamRed: 1, carrot: 1 });
  await page.keyboard.press("i");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__game.critters.filter((c) => c.kind === "crab").every((c) => c.fx && c.fx.hoop !== undefined))).toBe(true);
  await page.keyboard.press("i");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__game.state.speedMul)).toBeGreaterThan(2);
});

test("yellow jam draws the fish towards the spray", async ({ page }) => {
  await start(page);
  await give(page, { jamYellow: 1 });
  await page.keyboard.press("i");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(3500);
  const near = await page.evaluate(() => {
    const g = window.__game;
    const sx = g.state.magic.spray.wx - g.state.scroll;
    const fish = g.critters.filter((c) => c.kind === "fish");
    return fish.every((f) => Math.hypot(f.x - sx, f.y - g.state.magic.spray.y) < 130);
  });
  expect(near).toBe(true);
});

test("magic is refused indoors and the item is kept; empty inventory does nothing", async ({ page }) => {
  await start(page);
  await page.keyboard.press("i");
  await page.keyboard.press("Enter");
  expect(await magic(page)).toBeNull();
  await give(page, { candy: 1 });
  await page.evaluate(() => { window.__game.state.mode = "market"; });
  await page.keyboard.press("Enter");
  expect(await magic(page)).toBeNull();
  expect(await page.evaluate(() => ({ inv: window.__game.state.inventory, msg: window.__game.state.invMsg }))).toEqual({ inv: { candy: 1 }, msg: "Swim out into the sea to use magic!" });
});
