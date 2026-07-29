import { expect, test } from "@playwright/test";

test.describe("intro d'arrivée", () => {
  test("joue le crawl à la première visite et le laisse passer", async ({ page }) => {
    await page.goto("/");
    const skip = page.getByRole("button", { name: /passer|continuer/i });
    await expect(skip).toBeVisible();
    await skip.click();
    await expect(skip).toBeHidden();
    await expect(
      page.getByRole("link", { name: /essayer sans compte/i })
    ).toBeVisible();
  });

  test("ne rejoue pas le crawl à la visite suivante", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /passer|continuer/i }).click();

    await page.reload();
    await expect(page.getByRole("button", { name: /passer|continuer/i })).toHaveCount(0);
  });
});
