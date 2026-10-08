import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";
import { E2E_USER, STORAGE_STATE } from "./global-setup";

/**
 * Efface la progression du compte e2e sur un chapitre : l'interface ouvre la
 * première étape non faite, et d'autres specs partagent ce compte.
 */
async function repartirDuDebut(course: string, chapter: string): Promise<void> {
  assertTestDatabaseUrl(process.env.DATABASE_URL);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      'DELETE FROM "StepCompletion" WHERE "userId" = $1 AND course = $2 AND chapter = $3',
      [E2E_USER.id, course, chapter]
    );
  } finally {
    await client.end();
  }
}

/**
 * Une boucle sans fin dans le code de l'apprenant ne doit pas figer l'onglet
 * (audit EXE-02) : le JavaScript est instrumenté (lib/sandbox/loop-protect.ts)
 * et le SQL s'exécute dans un Worker arrêté passé le délai.
 *
 * Chaque test a sa propre page : un onglet figé ne gêne pas les suivants.
 */

test.use({ storageState: STORAGE_STATE });

/** Remplace tout le contenu de l'éditeur Monaco. */
async function saisir(page: Page, code: string): Promise<void> {
  const editeur = page.locator(".monaco-editor").first();
  await expect(editeur).toBeVisible({ timeout: 30_000 });
  await editeur.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
}

/**
 * Vérifie que l'onglet exécute encore du code, après avoir laissé au code de
 * l'apprenant le temps de démarrer et au délai d'interruption de s'écouler.
 */
async function ongletRepond(page: Page, delaiMs = 10_000): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 6_000));
  return Promise.race([
    page.evaluate(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), delaiMs)),
  ]);
}

/** Recopie les erreurs du navigateur dans la sortie du test. */
function journaliserErreurs(page: Page): void {
  page.on("console", (m) => {
    if (m.type() === "error") console.log(`[console] ${m.text()}`);
  });
  page.on("pageerror", (e) => console.log(`[page] ${e.message}`));
}

test.beforeEach(({ page }) => journaliserErreurs(page));

const DEPLOYER = /DEPLOYER/;

// Le témoin SQL est dans sql-moteur.spec.ts.

test("témoin JavaScript : un programme normal est exécuté et validé", async ({ page }) => {
  await repartirDuDebut("javascript", "chapitre-1");
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
  // Le message apparaît aussi dans la console, d'où `.first()`.
  await expect(page.getByText(/interrompue/i).first()).toBeVisible({ timeout: 15_000 });
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
  // Le message apparaît aussi dans la console, d'où `.first()`.
  await expect(page.getByText(/interrompue/i).first()).toBeVisible({ timeout: 15_000 });
});
