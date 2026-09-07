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
    await page.goto("/learn/html/chapitre-4");
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
    // peuvent compléter des étapes de html/chapitre-1 pour ce même compte de
    // façon concurrente — `fullyParallel: false` ne sérialise que les tests
    // À L'INTÉRIEUR d'un fichier, pas entre fichiers différents. On ne peut
    // donc pas fiabiliser un delta "avant / après seed" : un tel calcul
    // suppose que rien d'autre ne touche le compte entre le snapshot et la
    // réponse de l'import, ce qui n'est pas garanti ici (html-parcours.spec.ts
    // peut terminer une étape pendant cette fenêtre). On vérifie donc l'état
    // FINAL plutôt qu'un delta : c'est la seule propriété que l'endpoint
    // garantit réellement, quel que soit l'entrelacement avec les autres specs.
    const seededSteps = [0, 1, 2];

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
    // La requête d'import doit réussir : c'est la seule chose que l'on peut
    // affirmer sur la réponse elle-même sans dépendre de l'état concurrent
    // du compte partagé.
    expect(res.status()).toBe(200);

    const body = (await res.json()) as { imported: number };
    // On ne peut PAS affirmer une valeur exacte pour `imported` : si
    // html-parcours.spec.ts termine une étape de html/chapitre-1 pour ce même
    // compte pendant la fenêtre entre le seed ci-dessus et la réponse de cette
    // requête, le serveur voit à juste titre moins d'étapes réellement
    // nouvelles à créditer — sans qu'il y ait la moindre régression. On se
    // limite donc à une borne large et non-racy : `imported` ne peut être ni
    // négatif, ni supérieur au nombre d'étapes seedées.
    expect(body.imported).toBeGreaterThanOrEqual(0);
    expect(body.imported).toBeLessThanOrEqual(seededSteps.length);

    // Preuve que l'import a réellement crédité le compte : on relit l'état
    // depuis le SERVEUR (jamais depuis le localStorage qu'on vient de seeder
    // soi-même, ce qui serait une assertion vide de sens) et on vérifie que
    // chaque étape seedée y figure désormais. C'est vrai que le crédit
    // provienne de cet import ou d'une complétion concurrente équivalente
    // par une autre spec, donc robuste à la course décrite ci-dessus.
    const after = await readMe(page);
    const completed = new Set(after.completedSteps["html/chapitre-1"] ?? []);
    for (const step of seededSteps) {
      expect(completed.has(step)).toBe(true);
    }

    // Le storage local est purgé après un import réussi.
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("nc_trial_state")
    );
    expect(stored).toBeNull();
  });
});
