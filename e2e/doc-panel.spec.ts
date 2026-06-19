import { test, expect } from "@playwright/test";

import { E2E_USER } from "./global-setup";

test("le panneau de doc s'ouvre depuis un chip et se ferme avec Échap", async ({
  page,
}) => {
  // Connexion (route /learn protégée).
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  await page.goto("/learn/html/chapitre-1");

  const panel = page.getByTestId("doc-panel");
  await expect(panel).toHaveAttribute("aria-hidden", "true");

  // Chip inline dans le briefing.
  await page.locator('button[data-doc-id="html/doctype"]').first().click();
  await expect(panel).toHaveAttribute("aria-hidden", "false");
  await expect(panel.getByText("La déclaration <!DOCTYPE html>")).toBeVisible();

  // Échap ferme.
  await page.keyboard.press("Escape");
  await expect(panel).toHaveAttribute("aria-hidden", "true");

  // Cluster « Références de cette étape ».
  await page.locator('button[data-doc-ref="html/html-element"]').click();
  await expect(panel).toHaveAttribute("aria-hidden", "false");
  await expect(panel.getByText("L'élément racine <html>")).toBeVisible();
});
