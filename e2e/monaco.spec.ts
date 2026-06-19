import { test, expect } from "@playwright/test";

import { E2E_USER } from "./global-setup";

/**
 * Vérifie CF-16 / CF-15 : l'éditeur Monaco se charge bien depuis les assets
 * self-hébergés (/monaco/vs) et AUCUNE requête ne part vers le CDN jsdelivr.
 */
test("Monaco se charge en local, sans le CDN jsdelivr", async ({ page }) => {
  const cdnHits: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("cdn.jsdelivr.net")) cdnHits.push(req.url());
  });

  // Connexion avec l'utilisateur vérifié seedé.
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  // Ouvre une leçon qui monte l'éditeur Monaco.
  await page.goto("/learn/javascript/chapitre-1");
  await expect(page.locator(".monaco-editor").first()).toBeVisible({
    timeout: 30_000,
  });

  expect(
    cdnHits,
    `Requêtes inattendues vers jsdelivr : ${cdnHits.join(", ")}`
  ).toEqual([]);
});
