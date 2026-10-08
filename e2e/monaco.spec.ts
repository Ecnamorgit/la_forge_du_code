import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

// Session partagée écrite par global-setup (limite de connexions par IP).
test.use({ storageState: STORAGE_STATE });

/** CF-15 et CF-16 : Monaco se charge depuis les assets self-hébergés (/monaco/vs). */
test("Monaco se charge en local, sans le CDN jsdelivr", async ({ page }) => {
  const cdnHits: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("cdn.jsdelivr.net")) cdnHits.push(req.url());
  });

  await page.goto("/learn/javascript/chapitre-1");
  await expect(page.locator(".monaco-editor").first()).toBeVisible({
    timeout: 30_000,
  });

  expect(
    cdnHits,
    `Requêtes inattendues vers jsdelivr : ${cdnHits.join(", ")}`
  ).toEqual([]);
});
