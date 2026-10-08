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
 * Import de la progression d'essai vers un compte (CF-9), déclenché à
 * l'arrivée sur /avatar. On réutilise E2E_USER plutôt que de créer un compte.
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

/** État serveur de l'utilisateur connecté, lu par l'API. */
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

    // Le compte partagé a pu valider ces étapes dans une autre spec
    // (html-parcours.spec.ts) : on vérifie l'état final plutôt qu'un delta.
    const seededSteps = [0, 1, 2];

    // Chapitre d'essai terminé avant inscription. La valeur `xp` importe peu :
    // le serveur recalcule l'XP à partir du barème.
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
    expect(res.status()).toBe(200);

    const body = (await res.json()) as { imported: number };
    // Les étapes déjà validées ne sont pas recomptées : seule une borne est sûre.
    expect(body.imported).toBeGreaterThanOrEqual(0);
    expect(body.imported).toBeLessThanOrEqual(seededSteps.length);

    // L'état est relu sur le serveur, pas dans le localStorage seedé ici.
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
