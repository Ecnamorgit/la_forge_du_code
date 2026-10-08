import { test, expect } from "@playwright/test";

/**
 * Parcours d'essai sans compte (pas de storageState) : carte publique,
 * chapitres 1 à 3 jouables avec cinématiques, inscription requise au-delà.
 */

test("la carte HTML est publique, avec verrous d'inscription au-delà du chapitre 3", async ({
  page,
}) => {
  await page.goto("/learn/html");
  // Pas de redirection vers /login.
  await expect(page).toHaveURL(/\/learn\/html$/);

  // L'intro se lance seule à la première visite.
  await expect(page.getByTestId("cinematic-player")).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("cinematic-skip").click();
  await expect(page.getByTestId("cinematic-player")).toHaveCount(0);

  // Nœuds hors essai : verrouillés vers l'inscription.
  await expect(page.getByText("Inscription requise").first()).toBeVisible();

  // Une fois vue (nc_cine_seen), elle ne se relance pas au rechargement.
  await page.reload();
  await expect(page.getByTestId("replay-intro")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("cinematic-player")).toHaveCount(0);
});

test("un chapitre protégé redirige vers la connexion", async ({ page }) => {
  await page.goto("/learn/html/chapitre-4");
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
});

test("le chapitre 1 en essai joue l'outro puis propose le chapitre suivant", async ({
  page,
}) => {
  // Marque l'intro comme vue pour ne tester ici que l'outro.
  await page.goto("/learn/html/chapitre-1");
  await page.evaluate(() => {
    window.localStorage.setItem("nc_cine_seen", JSON.stringify(["html:intro"]));
  });

  const solutions = [
    "<!DOCTYPE html>\n<html></html>",
    "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n</html>",
    "<!DOCTYPE html>\n<html>\n<head>\n<title>Mission Selene</title>\n</head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>",
  ];
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
  for (let i = 0; i < solutions.length; i++) {
    const editor = page.locator(".monaco-editor").first();
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.insertText(solutions[i]);
    await page.getByRole("button", { name: /DEPLOYER/ }).click();
    await expect(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({ timeout: 10_000 });
    const bannerBtn = page.getByRole("button", {
      name: i === solutions.length - 1 ? /TERMINER LE PROTOCOLE/ : /SYSTÈME SUIVANT/,
    });
    await bannerBtn.click();
  }

  // L'outro du chapitre 1 mène au chapitre 2.
  const player = page.getByTestId("cinematic-player");
  await expect(player).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /Chapitre suivant/ }).click();
  await expect(page).toHaveURL(/\/learn\/html\/chapitre-2/, { timeout: 15_000 });
});
