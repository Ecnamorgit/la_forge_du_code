import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

// Session partagée écrite par global-setup : `auth.ts` limite les connexions à
// 10 par 5 minutes et par IP, et la suite dépassait ce seuil quand chaque spec
// se connectait pour son compte.
test.use({ storageState: STORAGE_STATE });

/**
 * Vérifie CF-16 / CF-15 : l'éditeur Monaco se charge bien depuis les assets
 * self-hébergés (/monaco/vs) et AUCUNE requête ne part vers le CDN jsdelivr.
 */
test("Monaco se charge en local, sans le CDN jsdelivr", async ({ page }) => {
  const cdnHits: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("cdn.jsdelivr.net")) cdnHits.push(req.url());
  });

  // La session vient de global-setup (cf. test.use ci-dessus) : plus de
  // connexion ici, le seuil anti-brute-force de auth.ts est partagé par IP.

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
