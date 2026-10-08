import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * Le moteur SQL se charge dans le navigateur (audit EXE-07). Le bundler prend
 * la variante « browser » de sql.js, qui réclame `sql-wasm-browser.wasm` ; les
 * tests unitaires, sous Node, utilisent la variante par défaut.
 */

test.use({ storageState: STORAGE_STATE });

test("le cursus SQL exécute une requête et valide l'étape", async ({ page }) => {
  const erreurs: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") erreurs.push(m.text());
  });
  page.on("pageerror", (e) => erreurs.push(e.message));

  await page.goto("/learn/sql/chapitre-1");
  const editeur = page.locator(".monaco-editor").first();
  await expect(editeur).toBeVisible({ timeout: 30_000 });
  await editeur.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(
    "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, nom VARCHAR(50) NOT NULL, niveau INTEGER DEFAULT 1);\n" +
      "INSERT INTO pilotes (id, nom, niveau) VALUES (1, 'Lia', 5);"
  );
  await page.getByRole("button", { name: /DEPLOYER/ }).click();

  await test.step("l'étape est validée", async () => {
    await expect.soft(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({ timeout: 15_000 });
  });

  await test.step("aucune erreur de chargement du moteur", async () => {
    expect.soft(erreurs.filter((e) => /wasm/i.test(e))).toEqual([]);
  });
});
