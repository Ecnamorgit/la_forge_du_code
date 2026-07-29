import { expect, test, type Page } from "@playwright/test";

import { E2E_USER } from "./global-setup";

/** Passe l'overlay du crawl s'il est présent. */
async function skipIntro(page: Page) {
  const skip = page.getByRole("button", { name: /passer|continuer/i });
  if (await skip.isVisible().catch(() => false)) await skip.click();
}

test.describe("essai sans compte", () => {
  test("un visiteur atteint le chapitre d'essai depuis la landing", async ({ page }) => {
    await page.goto("/");
    await skipIntro(page);

    await page.getByRole("link", { name: /essayer sans compte/i }).click();
    await expect(page).toHaveURL(/\/learn\/html\/chapitre-1/);
    await expect(page.getByText(/mode essai/i)).toBeVisible();
  });

  test("le mur tient sur les autres chapitres", async ({ page }) => {
    await page.goto("/learn/html/chapitre-2");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/learn/css/chapitre-1");
    await expect(page).toHaveURL(/\/login/);
  });

  test("la progression d'essai survit à un rechargement", async ({ page }) => {
    await page.goto("/learn/html/chapitre-1");
    await expect(page.getByText(/mode essai/i)).toBeVisible();

    const stored = await page.evaluate(() => {
      window.localStorage.setItem(
        "nc_trial_state",
        JSON.stringify({ completedSteps: [0], xp: 25 })
      );
      return window.localStorage.getItem("nc_trial_state");
    });
    expect(stored).toContain("25");

    await page.reload();
    const after = await page.evaluate(() =>
      window.localStorage.getItem("nc_trial_state")
    );
    expect(after).toContain("25");
  });
});

/**
 * Parcours authentifié : import de la progression d'essai vers un vrai
 * compte (CF-9), vérifié sur /avatar où l'effet d'import se déclenche.
 *
 * On réutilise le fixture E2E_USER plutôt que de passer par le formulaire
 * d'inscription (interdit ici : création de compte réelle).
 */

async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

interface MeState {
  totalXp: number;
  completedSteps: Record<string, number[]>;
}

/** Lit l'état serveur de l'utilisateur connecté via l'API (pas d'accès DB direct). */
async function readMe(page: Page): Promise<MeState> {
  const res = await page.request.get("/api/me");
  expect(res.ok()).toBeTruthy();
  return res.json();
}

test.describe("import de la progression d'essai vers un compte", () => {
  test("la progression d'essai est importée à l'arrivée sur /avatar", async ({
    page,
  }) => {
    await login(page);

    // E2E_USER est un fixture PARTAGÉ : d'autres specs (ex. html-parcours.spec.ts)
    // peuvent déjà avoir complété html/chapitre-1 pour ce même compte dans la
    // même exécution de la suite. On lit donc l'état AVANT le seed et on calcule
    // le nombre d'étapes réellement nouvelles, plutôt que de supposer un compte
    // vierge ou de coder en dur un total attendu — c'est ce qui rend
    // l'assertion robuste, que ce test s'exécute avant ou après les autres.
    const before = await readMe(page);
    const alreadyDone = new Set(before.completedSteps["html/chapitre-1"] ?? []);
    const seededSteps = [0, 1, 2];
    const newlyExpected = seededSteps.filter((i) => !alreadyDone.has(i)).length;

    // Seed de l'état d'essai complet (3/3 étapes) dans le storage local, comme
    // le ferait un visiteur ayant terminé le chapitre d'essai avant de
    // s'inscrire. La valeur `xp` n'a pas besoin d'être exacte : le serveur
    // recalcule lui-même l'XP à partir du barème réel, il ne fait jamais
    // confiance à la valeur envoyée par le client.
    await page.evaluate(() => {
      window.localStorage.setItem(
        "nc_trial_state",
        JSON.stringify({ completedSteps: [0, 1, 2], xp: 75 })
      );
    });

    const importResponse = page.waitForResponse(
      (res) =>
        /\/api\/me\/trial-import$/.test(res.url()) &&
        res.request().method() === "POST"
    );
    await page.goto("/avatar");
    const res = await importResponse;
    expect(res.ok()).toBeTruthy();

    const body = (await res.json()) as { imported: number };
    // Le nombre d'étapes réellement importées doit correspondre exactement à
    // ce qui manquait avant le seed : ni ré-attribution d'étapes déjà
    // complétées (idempotence de completeStep), ni sous-comptage.
    expect(body.imported).toBe(newlyExpected);

    const after = await readMe(page);
    if (newlyExpected > 0) {
      // Preuve directe que l'import crédite réellement le compte.
      expect(after.totalXp).toBeGreaterThan(before.totalXp);
    } else {
      // Toutes les étapes étaient déjà créditées avant ce test : aucun
      // double-crédit ne doit se produire.
      expect(after.totalXp).toBe(before.totalXp);
    }

    // Que le crédit vienne de cet import ou d'une complétion antérieure dans
    // la même exécution, le compte doit désormais refléter les 3 étapes du
    // chapitre d'essai.
    expect([...(after.completedSteps["html/chapitre-1"] ?? [])].sort((a, b) => a - b)).toEqual([
      0, 1, 2,
    ]);

    // Le storage local est purgé après un import réussi.
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("nc_trial_state")
    );
    expect(stored).toBeNull();
  });
});
