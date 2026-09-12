import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * Constat EXE-04 de l'audit de sécurité du 2026-09-12 : les indices sont
 * injectés dans la page comme du HTML.
 *
 * `HintBox` affichait `step.hint` via `dangerouslySetInnerHTML`. Or 68 indices
 * sur 192 contiennent du code HTML ou JSX à recopier : au lieu d'être montré,
 * ce code était interprété. L'indice de la première étape du chapitre 2 HTML
 * (« Ajoute <a href=…>Documentation MDN</a>. ») devenait un vrai lien dans la
 * page, et l'apprenant ne voyait jamais le code à taper. Le même mécanisme
 * injecte des <style>, <img> ou <form> dans l'interface ; et si les cours
 * passaient un jour en base de données, ce serait une XSS stockée.
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
