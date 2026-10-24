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
