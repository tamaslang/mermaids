import { test, expect } from "@playwright/test";

async function start(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.locator("#game-canvas")).toBeVisible();
}

const nearRace = (page) => page.evaluate(() => {
  const s = window.__game.state;
  s.scroll = 2600 - s.x;
});

test("Enter does nothing far from the race cave", async ({ page }) => {
  await start(page);
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => window.__game.state.mode)).toBe("sea");
});

test("start the race, collect hoops and bubbles, finish and return to the sea", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  await nearRace(page);
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => window.__game.state.mode)).toBe("race");
  expect(await page.evaluate(() => window.__game.state.race.hoops.length)).toBe(8);

  // The canvas is painted with the course
  await page.waitForTimeout(150);
  const painted = await page.locator("#game-canvas").evaluate((c) => {
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4 * 37) if (d[i] < 235) n++;
    return n;
  });
  expect(painted).toBeGreaterThan(50);

  // Flying through a hoop removes it; popping a bubble scores
  await page.evaluate(() => {
    const s = window.__game.state;
    s.scroll = s.race.hoops[0].wx - s.x;
    s.y = s.race.hoops[0].fy * s.height;
  });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__game.state.race.hoops.length)).toBe(7);
  await page.evaluate(() => {
    const s = window.__game.state;
    const b = s.race.bubbles[0];
    s.scroll = b.wx - s.x;
    s.y = b.fy * s.height;
  });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__game.state.race.popped)).toBe(1);

  // Collect the rest, then finish
  for (let i = 0; i < 7; i++) {
    await page.evaluate(() => {
      const s = window.__game.state;
      const h = s.race.hoops[0];
      if (!h) return;
      s.scroll = h.wx - s.x;
      s.y = h.fy * s.height;
    });
    await page.waitForTimeout(80);
  }
  expect(await page.evaluate(() => window.__game.state.race.done)).toBe(true);

  await page.keyboard.press("Enter");
  const out = await page.evaluate(() => ({ mode: window.__game.state.mode, scroll: window.__game.state.scroll }));
  expect(out.mode).toBe("sea");
  expect(out.scroll).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("missing a hoop leaves it in place and Enter quits the race", async ({ page }) => {
  await start(page);
  await nearRace(page);
  await page.keyboard.press("Enter");
  await page.evaluate(() => {
    const s = window.__game.state;
    s.scroll = s.race.hoops[0].wx - s.x;
    s.y = s.height * 0.02 + 30; // far above the hoop
    s.race.hoops[0].fy = 0.9;
  });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__game.state.race.hoops.length)).toBe(8);
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => window.__game.state.mode)).toBe("sea");
});
