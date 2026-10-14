import { expect, test } from "@playwright/test";

test.describe("landing intro", () => {
  test("plays the crawl on the first visit and lets it be skipped", async ({ page }) => {
    await page.goto("/");
    const overlay = page.getByRole("dialog", { name: /transmission/i });
    await expect(overlay).toBeVisible();
    const skip = page.getByRole("button", { name: /passer|continuer/i });
    await expect(skip).toBeVisible();
    await skip.click();
    await expect(skip).toBeHidden();
    await expect(overlay).toBeHidden();
    await expect(
      page.getByRole("link", { name: /essayer sans compte/i })
    ).toBeVisible();
  });

  test("does not replay the crawl on the next visit", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /passer|continuer/i }).click();

    await page.reload();
    await expect(page.getByRole("button", { name: /passer|continuer/i })).toHaveCount(0);
  });
});
