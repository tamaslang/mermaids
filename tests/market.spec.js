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
