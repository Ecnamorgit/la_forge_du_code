import { test, expect, type Page } from "@playwright/test";

import { E2E_USER } from "./global-setup";

async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test("course intro: replayable via the button, never auto-plays twice", async ({
  page,
}) => {
  await login(page);
  await page.goto("/learn/html");

  const player = page.getByTestId("cinematic-player");
  // The E2E user, recreated on every run, has never seen the intro: it is
  // expected to play automatically.
  await expect(player).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("cinematic-skip").click();
  await expect(player).toHaveCount(0);

  // On reload, it does not start again.
  await page.reload();
  await expect(page.getByTestId("replay-intro")).toBeVisible({ timeout: 15_000 });
  await expect(player).toHaveCount(0);

  // Deliberate replay: the player opens with the HTML arc narration.
  await page.getByTestId("replay-intro").click();
  await expect(player).toBeVisible();
  await expect(player.getByText(/Selene/).first()).toBeVisible({ timeout: 10_000 });
  await page.getByTestId("cinematic-skip").click();
  await expect(player).toHaveCount(0);
});
