import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * Les indices sont affichés comme du texte et non injectés comme du HTML
 * (audit EXE-04) : beaucoup contiennent du code HTML ou JSX à recopier, comme
 * celui de la première étape du chapitre 2 HTML.
 */

test.use({ storageState: STORAGE_STATE });

const CODE_DE_L_INDICE =
  '<a href="https://developer.mozilla.org" target="_blank">Documentation MDN</a>';

test("l'indice montre le code à taper, sans l'injecter dans la page", async ({ page }) => {
  await page.goto("/learn/html/chapitre-2");

  const boutonIndice = page.getByRole("button", { name: /Indice/ });
  const lienInjecte = page.getByRole("link", { name: "Documentation MDN" });
  await expect(boutonIndice).toBeVisible({ timeout: 30_000 });
  await expect(lienInjecte).toHaveCount(0);

  await boutonIndice.click();

  // La boîte d'indice : en-tête « H.E.L.P. », et le texte de l'indice.
  const boite = page
    .locator("div.fixed")
    .filter({ hasText: "H.E.L.P." })
    .filter({ hasText: "Documentation MDN" });
  await expect(boite).toBeVisible();

  // Comptage immédiat, sans attente : l'indice se referme seul après 6 s, et
  // un contrôle qui patiente verrait le lien disparaître avec la boîte.
  await test.step("aucun lien n'est injecté dans la page", async () => {
    expect.soft(await lienInjecte.count()).toBe(0);
  });

  await test.step("le code de l'indice est affiché tel quel", async () => {
    await expect.soft(boite).toContainText(CODE_DE_L_INDICE);
  });
});
