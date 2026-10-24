import { test, expect } from "@playwright/test";

test("welcome screen loads without errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e));

  const response = await page.goto("/");

  expect(response.ok()).toBeTruthy();
  await expect(page).toHaveTitle("Mermaids");
  await expect(page.locator("h1")).toHaveText("Mermaids");
  await expect(page.getByRole("img", { name: "A mermaid" })).toBeVisible();
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
