import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

// Shared session written by global-setup (per-IP login limit).
test.use({ storageState: STORAGE_STATE });

test("the doc panel opens from a chip and closes with Escape", async ({
  page,
}) => {
  await page.goto("/learn/html/chapitre-1");

  const panel = page.getByTestId("doc-panel");
  await expect(panel).toHaveAttribute("aria-hidden", "true");

  // Inline chip in the briefing.
  await page.locator('button[data-doc-id="html/doctype"]').first().click();
  await expect(panel).toHaveAttribute("aria-hidden", "false");
  await expect(panel.getByText("La déclaration <!DOCTYPE html>")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(panel).toHaveAttribute("aria-hidden", "true");

  // The "Références de cette étape" (this step's references) cluster.
  await page.locator('button[data-doc-ref="html/html-element"]').click();
  await expect(panel).toHaveAttribute("aria-hidden", "false");
  await expect(panel.getByText("L'élément racine <html>")).toBeVisible();
});
