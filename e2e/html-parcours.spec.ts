import { test, expect, type Page } from "@playwright/test";

import { E2E_USER } from "./global-setup";

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

test("chapitre 1 HTML : jouable de bout en bout jusqu'à la complétion", async ({
  page,
}) => {
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
