import { test, expect } from "@playwright/test";

async function start(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.locator("#game-canvas")).toBeVisible();
}

const enterBakery = async (page) => {
  await page.evaluate(() => { const s = window.__game.state; s.scroll = 3800 - s.x; });
  await page.keyboard.press("Enter");
};

// Park the mermaid in front of pastry `i`.
const goToPastry = (page, i) => page.evaluate(async (i) => {
  const { bakeryLayout } = await import("/src/bakery.js");
  const s = window.__game.state;
  s.x = bakeryLayout(s.width, s.height).slots[i].x;
}, i);

const info = (page) => page.evaluate(() => {
  const s = window.__game.state;
  return { mode: s.mode, held: s.held, eaten: s.eaten };
});

test("Enter does nothing far from the bakery", async ({ page }) => {
  await start(page);
  await page.keyboard.press("Enter");
  expect((await info(page)).mode).toBe("sea");
});

test("visit the bakery, take a pastry with T, eat it with E, and leave", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  await enterBakery(page);
  expect((await info(page)).mode).toBe("bakery");

  // The café is painted
  await page.waitForTimeout(150);
  const painted = await page.locator("#game-canvas").evaluate((c) => {
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4 * 37) if (d[i] < 235) n++;
    return n;
  });
  expect(painted).toBeGreaterThan(50);

  await goToPastry(page, 1);
  await page.keyboard.press("t");
  expect((await info(page)).held).toBe("donut");

  // A second pastry is refused while the hands are full
  await goToPastry(page, 2);
  await page.keyboard.press("t");
  expect((await info(page)).held).toBe("donut");

  await page.keyboard.press("e");
  expect(await info(page)).toMatchObject({ held: null, eaten: 1 });

  await page.keyboard.press("Enter");
  expect((await info(page)).mode).toBe("sea");
  expect(errors).toEqual([]);
});

test("T does nothing away from the counter, and E with empty hands eats nothing", async ({ page }) => {
  await start(page);
  await enterBakery(page);
  await page.evaluate(() => { const s = window.__game.state; s.x = 40; });
  await page.keyboard.press("t");
  await page.keyboard.press("e");
  expect(await info(page)).toMatchObject({ held: null, eaten: 0 });
});

test("a pastry can be carried out of the bakery and eaten in the sea", async ({ page }) => {
  await start(page);
  await enterBakery(page);
  await goToPastry(page, 0);
  await page.keyboard.press("t");
  await page.keyboard.press("Enter");
  expect(await info(page)).toMatchObject({ mode: "sea", held: "croissant" });
  await page.keyboard.press("e");
  expect(await info(page)).toMatchObject({ held: null, eaten: 1 });
});
