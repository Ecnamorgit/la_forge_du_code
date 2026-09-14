import { test, expect, type Page } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * Constat EXE-02 de l'audit de sécurité du 2026-09-12 : une boucle sans fin
 * dans le code de l'apprenant fige l'onglet entier.
 *
 * Le JavaScript s'exécute dans une iframe `srcdoc` sandboxée qui, dans
 * Chromium, partage le fil d'exécution de la page (vérifié le 2026-07-30,
 * cf. lib/sandbox/loop-guard.ts) : le délai de 3 s prévu par le parent ne se
 * déclenche jamais. Le SQL (sql.js) tourne directement sur ce fil. Dans les
 * deux cas, l'apprenant perd la main et doit recharger la page, sans message.
 *
 * Chaque test a sa propre page : un onglet figé ne gêne pas les suivants.
 */

test.use({ storageState: STORAGE_STATE });

/** Remplace tout le contenu de l'éditeur Monaco (cf. html-parcours.spec.ts). */
async function saisir(page: Page, code: string): Promise<void> {
  const editeur = page.locator(".monaco-editor").first();
  await expect(editeur).toBeVisible({ timeout: 30_000 });
  await editeur.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
}

/**
 * L'onglet exécute-t-il encore du code ? On laisse d'abord au code de
 * l'apprenant le temps de démarrer (chargement du moteur SQL, de l'iframe) et
 * au délai de 3 s de se déclencher : sonder aussitôt après le clic passerait
 * avant que la boucle ne fige quoi que ce soit.
 */
async function ongletRepond(page: Page, delaiMs = 10_000): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 6_000));
  return Promise.race([
    page.evaluate(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), delaiMs)),
  ]);
}

/** Recopie les erreurs du navigateur dans la sortie du test, pour les annexes. */
function journaliserErreurs(page: Page): void {
  page.on("console", (m) => {
    if (m.type() === "error") console.log(`[console] ${m.text()}`);
  });
  page.on("pageerror", (e) => console.log(`[page] ${e.message}`));
}

test.beforeEach(({ page }) => journaliserErreurs(page));

const DEPLOYER = /DEPLOYER/;

// Le témoin SQL (une requête normale est exécutée) est porté par
// sql-moteur.spec.ts, constat EXE-07.

test("témoin JavaScript : un programme normal est exécuté et validé", async ({ page }) => {
  await page.goto("/learn/javascript/chapitre-1");
  await saisir(page, 'console.log("Bonjour, station Nebula")');
  await page.getByRole("button", { name: DEPLOYER }).click();
  await expect(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({ timeout: 15_000 });
});

test("SQL : une requête sans fin est interrompue, l'onglet reste utilisable", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/learn/sql/chapitre-1");
  await saisir(
    page,
    "WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM c)\nSELECT count(*) FROM c;"
  );
  await page.getByRole("button", { name: DEPLOYER }).click();

  expect(await ongletRepond(page), "l'onglet est figé").toBe(true);
  await expect(page.getByText(/interrompue/i)).toBeVisible({ timeout: 15_000 });
});

test("JavaScript : une boucle sans fin est interrompue, l'onglet reste utilisable", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/learn/javascript/chapitre-1");
  // Forme que le filtre littéral de loop-guard.ts ne reconnaît pas.
  await saisir(page, "let encore = true;\nwhile (encore) {}");
  await page.getByRole("button", { name: DEPLOYER }).click();

  expect(await ongletRepond(page), "l'onglet est figé").toBe(true);
  await expect(page.getByText(/interrompue/i)).toBeVisible({ timeout: 15_000 });
});
