import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

// Session partagée écrite par global-setup : `auth.ts` limite les connexions à
// 10 par 5 minutes et par IP, et la suite dépassait ce seuil quand chaque spec
// se connectait pour son compte.
test.use({ storageState: STORAGE_STATE });

test("le panneau de doc s'ouvre depuis un chip et se ferme avec Échap", async ({
  page,
}) => {
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
