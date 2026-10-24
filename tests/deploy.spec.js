import { test, expect } from "@playwright/test";

// GitHub Pages serves from /mermaids/, so absolute asset paths would break.
test("assets use relative URLs and all load", async ({ page }) => {
  const failed = [];
  page.on("response", (r) => { if (!r.ok()) failed.push(r.url()); });
  await page.goto("/");

  const urls = await page.$$eval("link[href], script[src]", (els) =>
    els.map((e) => e.getAttribute("href") ?? e.getAttribute("src")));
  expect(urls.length).toBeGreaterThan(0);
  for (const u of urls) expect(u.startsWith("/")).toBe(false);
  expect(failed).toEqual([]);
});
