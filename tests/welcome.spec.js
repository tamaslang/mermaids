import { test, expect } from "@playwright/test";

test("welcome screen loads without errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e));

  const response = await page.goto("/");

  expect(response.ok()).toBeTruthy();
  await expect(page).toHaveTitle("Mermaids");
  await expect(page.locator("h1")).toHaveText("Mermaids");
  const queen = page.getByRole("img", { name: "A mermaid" });
  await expect(queen).toBeVisible();
  await expect.poll(() => queen.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
  await expect(page.getByRole("button", { name: "Start Game" })).toBeVisible();
  await expect(page.locator("#ocean")).toBeVisible();
  expect(errors).toEqual([]);
});

test("Start Game button leaves the welcome screen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();

  await expect(page.locator("#welcome")).toBeHidden();
  await expect(page.locator("#playing")).toBeVisible();
});

test("Enter key starts the game", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Enter");

  await expect(page.locator("#welcome")).toBeHidden();
});

test("ocean canvas is painted", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(200);
  const painted = await page.evaluate(() => {
    const c = document.getElementById("ocean");
    const [r, g, b, a] = c.getContext("2d").getImageData(1, 1, 1, 1).data;
    return a > 0 && r + g + b > 0;
  });
  expect(painted).toBe(true);
});

for (const size of [{ width: 1100, height: 640 }, { width: 400, height: 800 }]) {
  test(`welcome content is horizontally centred at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    for (const sel of ["h1", ".queen", "#start"]) {
      const box = await page.locator(sel).boundingBox();
      expect(Math.abs(box.x + box.width / 2 - size.width / 2), sel).toBeLessThan(2);
    }
  });
}

test("controls legend is shown on the welcome screen and fits the viewport", async ({ page }) => {
  await page.goto("/");
  const legend = page.getByLabel("Controls");
  await expect(legend).toBeVisible();
  for (const key of ["Space", "B (hold)", "H", "Enter", "E"]) await expect(legend).toContainText(key);
  const box = await legend.boundingBox();
  const vp = page.viewportSize();
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
});

test("the mermaid is on screen even if the window is resized right as the game starts", async ({ page }) => {
  await page.goto("/");
  await page.setViewportSize({ width: 700, height: 500 });
  await page.getByRole("button", { name: "Start Game" }).click();
  await page.setViewportSize({ width: 900, height: 600 });
  await page.waitForTimeout(300);
  const s = await page.evaluate(() => { const g = window.__game.state; return { x: g.x, y: g.y, w: g.width, h: g.height }; });
  expect(s.x).toBeGreaterThan(0);
  expect(s.x).toBeLessThan(s.w);
  expect(s.y).toBeGreaterThan(0);
  expect(s.y).toBeLessThan(s.h);
});

test("a game state that started with no size recovers on resize", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  const s = await page.evaluate(async () => {
    const { createState, resizeState } = await import("/src/game.js");
    const st = createState(0, 0);
    resizeState(st, 800, 600);
    return { x: st.x, y: st.y };
  });
  expect(s).toEqual({ x: 200, y: 300 });
});

test("the game still starts when the browser refuses a canvas context at first", async ({ page }) => {
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    let refused = 0;
    HTMLCanvasElement.prototype.getContext = function (...args) {
      if (this.id === "game-canvas" && refused < 5) { refused++; return null; }
      return orig.apply(this, args);
    };
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();
  await page.waitForFunction(() => window.__game);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__game.state.x)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
