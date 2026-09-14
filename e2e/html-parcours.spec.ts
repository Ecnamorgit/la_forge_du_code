import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";

import { assertTestDatabaseUrl } from "../lib/e2e-db-guard";
import { E2E_USER } from "./global-setup";

/**
 * Efface la progression du compte e2e sur un chapitre : l'interface ouvre la
 * première étape non faite, et le compte est partagé entre tests et specs.
 * Sans ça, un test qui valide une étape ferait démarrer le suivant sur la
 * mauvaise étape.
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
 * Parcours HTML de bout en bout.
 *
 * 1) On joue intégralement le chapitre 1 (3 étapes) : saisie dans Monaco →
 *    DEPLOYER → bannière de réussite → étape suivante → écran de complétion.
 * 2) On vérifie que le panneau de référence (docRefs) fonctionne sur un
 *    chapitre tardif (ch8), preuve que le câblage docRefs ch2-8 est actif.
 */

async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

/** Remplace tout le contenu de l'éditeur Monaco par `code`. */
async function setEditorContent(page: Page, code: string): Promise<void> {
  const editor = page.locator(".monaco-editor").first();
  await editor.click();
  // Ctrl+A sélectionne tout DANS Monaco (éditeur focus), puis insertText
  // remplace la sélection sans déclencher l'auto-fermeture des balises.
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
}

// Solutions valides pour chaque étape du chapitre 1.
const CH1_SOLUTIONS = [
  "<!DOCTYPE html>\n<html></html>",
  "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n</html>",
  "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>",
];

/**
 * Constat EXE-03 : l'aperçu HTML n'est plus un `srcdoc` (qui hérite de la CSP
 * du site) mais une coquille chargée par `src` depuis une origine DÉDIÉE, qui
 * rend le HTML de l'apprenant dans une iframe imbriquée. On vérifie deux choses
 * qu'un `srcdoc` rendait impossibles : la coquille est servie depuis une autre
 * origine que l'app, et le HTML de l'apprenant s'y rend bien (deux niveaux
 * d'iframe traversés par Playwright au niveau du protocole).
 *
 * Placé en tête de fichier : le chapitre 1 est encore vierge pour l'utilisateur
 * E2E (recréé à chaque run), avant que le test de complétion ne le termine.
 */
test("l'aperçu HTML est rendu depuis une origine distincte", async ({ page }) => {
  await repartirDuDebut("html", "chapitre-1");
  await login(page);
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

  // HTML volontairement INVALIDE pour l'étape (pas de <!DOCTYPE>) : il se rend
  // quand même, mais ne déclenche ni bannière de réussite ni avancement d'étape
  // — ce test prouve le RENDU cross-origin, pas la validation.
  await setEditorContent(page, "<h1>Bonjour Nebula</h1>");
  await page.getByRole("button", { name: /DEPLOYER/ }).click();

  // Le HTML se rend dans la scène imbriquée (coquille → scène) : on entre les
  // DEUX frames en chaînant `frameLocator` depuis `page`. On cible par sélecteur
  // DOM et non `getByRole` : l'arbre d'accessibilité ne traverse pas de façon
  // fiable deux iframes opaques imbriquées (vérifié empiriquement).
  const scene = page
    .frameLocator('iframe[title="Apercu"]')
    .frameLocator('iframe[title="Rendu HTML"]');
  await expect(scene.locator("h1")).toHaveText("Bonjour Nebula", { timeout: 20_000 });
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

    // Feedback de validation.
    await expect(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({
      timeout: 10_000,
    });

    // Bannière de réussite → bouton d'avancement.
    const bannerBtn = page.getByRole("button", {
      name: isLast ? /TERMINER LE PROTOCOLE/ : /SYSTÈME SUIVANT/,
    });
    await expect(bannerBtn).toBeVisible({ timeout: 10_000 });
    await bannerBtn.click();

    if (isLast) {
      // L'outro de chapitre s'intercale toujours avant l'écran de complétion :
      // l'utilisateur E2E est recréé à chaque run (e2e/global-setup.ts), il
      // n'a donc jamais vu cette cinématique. Assertion stricte pour attraper
      // une régression de l'auto-play.
      await expect(page.getByTestId("cinematic-player")).toBeVisible({
        timeout: 15_000,
      });
      await page.getByTestId("cinematic-skip").click();
      await expect(page.getByText(/COMPLÉTÉE/)).toBeVisible({ timeout: 10_000 });
    } else {
      // L'étape suivante est montée (nouveau startCode dans l'éditeur).
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
