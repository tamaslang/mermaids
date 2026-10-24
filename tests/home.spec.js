import { test, expect } from "@playwright/test";

const st = (page) => page.evaluate(() => {
  const s = window.__game.state;
  return { mode: s.mode, sitting: s.sitting, x: s.x, scroll: s.scroll };
});

async function start(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.locator("#game-canvas")).toBeVisible();
}

const nearHome = (page) => page.evaluate(() => {
  const s = window.__game.state;
  s.scroll = 1400 - s.x;
});

test("Enter does nothing when the home is far away", async ({ page }) => {
  await start(page);
  await page.keyboard.press("Enter");
  expect((await st(page)).mode).toBe("sea");
});

test("enter the home, sit on a sofa, stand up and leave", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  await nearHome(page);
  await page.keyboard.press("Enter");
  expect((await st(page)).mode).toBe("home");

  // Cave is painted
  const painted = await page.locator("#game-canvas").evaluate((c) => {
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4 * 37) if (d[i] < 235) n++;
    return n;
  });
  expect(painted).toBeGreaterThan(50);

  // Sitting needs a sofa nearby
  await page.keyboard.press("e");
  expect((await st(page)).sitting).toBe(null);
  await page.evaluate(() => {
    const s = window.__game.state;
    s.x = s.width * 0.3;
    s.y = s.height * 0.75;
  });
  await page.keyboard.press("e");
  expect((await st(page)).sitting).toBe(0);
  await page.waitForTimeout(200);
  await page.screenshot({ path: "test-results/home-sitting.png" });

  // Swimming stands her up again
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(100);
  await page.keyboard.up("ArrowRight");
  expect((await st(page)).sitting).toBe(null);

  await page.keyboard.press("Enter");
  const out = await st(page);
  expect(out.mode).toBe("sea");
  expect(out.scroll).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("the furnished home shows the outside creatures through the window", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  await nearHome(page);
  await page.keyboard.press("Enter");
  const x0 = await page.evaluate(() => window.__game.critters.map((c) => c.x));
  await page.waitForTimeout(600);
  const x1 = await page.evaluate(() => window.__game.critters.map((c) => c.x));
  expect(x1.some((x, i) => x !== x0[i])).toBe(true);

  // The window area (above the table, centred) is painted with the outside scene
  const painted = await page.locator("#game-canvas").evaluate((c) => {
    const d = c.getContext("2d").getImageData(c.width * 0.45, c.height * 0.2, c.width * 0.1, c.height * 0.15).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 2] > d[i] + 15) n++;
    return n;
  });
  expect(painted).toBeGreaterThan(20);
  expect(errors).toEqual([]);
});
