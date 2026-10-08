import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";
import { E2E_USER, STORAGE_STATE } from "./global-setup";

/**
 * Efface la progression du compte e2e sur un chapitre : l'interface ouvre la
 * première étape non faite, et le compte est partagé entre tests et specs.
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
 * Parcours HTML de bout en bout : le chapitre 1 joué jusqu'à l'écran de
 * complétion, puis le panneau de référence sur un chapitre tardif.
 */

async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

async function setEditorContent(page: Page, code: string): Promise<void> {
  const editor = page.locator(".monaco-editor").first();
  await editor.click();
  // insertText remplace la sélection sans déclencher l'auto-fermeture des
  // balises de Monaco.
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
}

const CH1_SOLUTIONS = [
  "<!DOCTYPE html>\n<html></html>",
  "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n</html>",
  "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>",
];

/**
 * L'aperçu HTML est une coquille chargée par `src` depuis une origine dédiée
 * (audit EXE-03), qui rend le HTML de l'apprenant dans une iframe imbriquée.
 */
test.describe("aperçu HTML sur l'origine dédiée", () => {
  // Session partagée écrite par global-setup (limite de connexions par IP).
  test.use({ storageState: STORAGE_STATE });

  test("l'aperçu HTML est rendu depuis une origine distincte", async ({ page }) => {
  await repartirDuDebut("html", "chapitre-1");
  await page.goto("/learn/html/chapitre-1");
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });

  const apercu = page.locator('iframe[title="Apercu"]');
  await expect(apercu).toHaveCount(1);
  const src = await apercu.getAttribute("src");
  expect(src, "l'aperçu doit être chargé par src, plus par srcDoc").not.toBeNull();
  const origineApercu = new URL(src!).origin;
  const origineApp = new URL(page.url()).origin;
  expect(new URL(src!).pathname).toBe("/bac-a-sable/html");
  expect(
    origineApercu,
    `l'aperçu (${origineApercu}) doit être servi depuis une autre origine que l'app (${origineApp})`
  ).not.toBe(origineApp);

  // Sans <!DOCTYPE>, ce HTML se rend sans valider l'étape : seul le rendu
  // est vérifié ici.
  await setEditorContent(page, "<h1>Bonjour Nebula</h1>");
  await page.getByRole("button", { name: /DEPLOYER/ }).click();

  // Sélecteur DOM plutôt que `getByRole` : l'arbre d'accessibilité ne traverse
  // pas de façon fiable deux iframes opaques imbriquées.
  const scene = page
    .frameLocator('iframe[title="Apercu"]')
    .frameLocator('iframe[title="Rendu HTML"]');
  await expect(scene.locator("h1")).toHaveText("Bonjour Nebula", { timeout: 20_000 });
  });
});

test("chapitre 1 HTML : jouable de bout en bout jusqu'à la complétion", async ({
  page,
}) => {
  // Indépendant de ce qui a tourné avant sur ce compte partagé.
  await repartirDuDebut("html", "chapitre-1");
  await login(page);
  await page.goto("/learn/html/chapitre-1");

  await expect(page.locator(".monaco-editor").first()).toBeVisible({
    timeout: 30_000,
  });

  const total = CH1_SOLUTIONS.length;

  for (let i = 0; i < total; i++) {
    const isLast = i === total - 1;

    await setEditorContent(page, CH1_SOLUTIONS[i]);
    await page.getByRole("button", { name: /DEPLOYER/ }).click();

    await expect(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({
      timeout: 10_000,
    });

    const bannerBtn = page.getByRole("button", {
      name: isLast ? /TERMINER LE PROTOCOLE/ : /SYSTÈME SUIVANT/,
    });
    await expect(bannerBtn).toBeVisible({ timeout: 10_000 });
    await bannerBtn.click();

    if (isLast) {
      // L'outro précède l'écran de complétion : l'utilisateur E2E, recréé à
      // chaque run, ne l'a jamais vue.
      await expect(page.getByTestId("cinematic-player")).toBeVisible({
        timeout: 15_000,
      });
      await page.getByTestId("cinematic-skip").click();
      await expect(page.getByText(/COMPLÉTÉE/)).toBeVisible({ timeout: 10_000 });
    } else {
      await expect(
        page.getByText(`Étape ${i + 2} sur ${total}`).first()
      ).toBeVisible({ timeout: 10_000 });
    }
  }
});

test("le panneau de référence s'ouvre depuis un docRef d'un chapitre tardif (ch8)", async ({
  page,
}) => {
  await login(page);
  await page.goto("/learn/html/chapitre-8");

  const panel = page.getByTestId("doc-panel");
  await expect(panel).toHaveAttribute("aria-hidden", "true");

  await page.locator('button[data-doc-ref="html/video"]').click();
  await expect(panel).toHaveAttribute("aria-hidden", "false");
  await expect(panel.getByText("La balise <video>")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(panel).toHaveAttribute("aria-hidden", "true");
});
