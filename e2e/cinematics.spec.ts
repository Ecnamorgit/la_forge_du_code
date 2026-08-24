import { test, expect, type Page } from "@playwright/test";

import { E2E_USER } from "./global-setup";

async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test("intro de cursus : rejouable via le bouton, jamais deux auto-play", async ({
  page,
}) => {
  await login(page);
  await page.goto("/learn/html");

  const player = page.getByTestId("cinematic-player");
  // L'utilisateur E2E est recréé à chaque run (e2e/global-setup.ts) : ses
  // CinematicView sont donc toujours vides et l'auto-play de l'intro est
  // attendu, pas seulement toléré. Assertion stricte pour que la régression
  // « l'intro ne se joue plus » fasse échouer la suite.
  await expect(player).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("cinematic-skip").click();
  await expect(player).toHaveCount(0);

  // Rechargement : plus jamais d'auto-play.
  await page.reload();
  await expect(page.getByTestId("replay-intro")).toBeVisible({ timeout: 15_000 });
  await expect(player).toHaveCount(0);

  // Relecture volontaire : le lecteur s'ouvre avec la narration de l'arc HTML.
  await page.getByTestId("replay-intro").click();
  await expect(player).toBeVisible();
  await expect(player.getByText(/Selene/).first()).toBeVisible({ timeout: 10_000 });
  await page.getByTestId("cinematic-skip").click();
  await expect(player).toHaveCount(0);
});
