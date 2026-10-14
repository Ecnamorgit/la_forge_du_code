import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

// Shared session written by global-setup (per-IP login limit).
test.use({ storageState: STORAGE_STATE });

/** CF-15 and CF-16: Monaco loads from the self-hosted assets (/monaco/vs). */
test("Monaco loads locally, without the jsdelivr CDN", async ({ page }) => {
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
