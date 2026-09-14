import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * Constat EXE-07, découvert le 2026-09-14 en préparant la démonstration
 * d'EXE-02 : le moteur SQL ne se charge pas dans le navigateur.
 *
 * sql.js 1.14 déclare une variante « browser » dans ses `exports`. Le bundler
 * du site la choisit, et elle réclame `sql-wasm-browser.wasm` ; or seul
 * `sql-wasm.wasm` était hébergé dans public/sql. Le chargement échoue (404),
 * aucune requête ne s'exécute, et le cursus SQL est inutilisable, en local
 * comme en production. Les tests unitaires tournent sous Node, qui prend la
 * variante par défaut : ils ne pouvaient pas le voir.
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
