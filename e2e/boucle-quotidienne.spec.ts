import { test, expect, type Page } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * Étapes 1 et 2 du chapitre 1 JavaScript, la progression HTML étant observée
 * par d'autres specs. Deux étapes, car l'ordre de reprise du briefing vise 1
 * ou 2 étapes selon le tirage du jour (lib/quests.ts).
 */
const SOLUTIONS_JS_CH1 = [
  'console.log("Bonjour, station Nebula");',
  'let cadet = "Nova";\nconsole.log(cadet);',
];

interface Ordre {
  id: string;
  slot: string;
  label: string;
  progress: number;
  target: number;
  done: boolean;
}

interface EtatServeur {
  totalXp: number;
  completedSteps: Record<string, number[]>;
  briefing: { quests: Ordre[]; complete: boolean } | null;
  liaison: { streak: number; activeToday: boolean };
}

/** État vu par le serveur, et non lu dans le DOM. */
async function lireEtat(page: Page): Promise<EtatServeur> {
  const res = await page.request.get("/api/me");
  expect(res.ok(), `GET /api/me a échoué : ${res.status()}`).toBeTruthy();
  return res.json();
}

/**
 * Pose le code directement sur le modèle Monaco, qui fermerait sinon une
 * seconde fois guillemets et parenthèses à la frappe. Le `onChange` React est
 * déclenché comme pour une vraie saisie.
 */
async function definirCodeEditeur(page: Page, code: string): Promise<void> {
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
  const resultat = await page.evaluate((value) => {
    const monaco = (window as unknown as { monaco?: typeof import("monaco-editor") }).monaco;
    if (!monaco) return "no-monaco";
    // `ChapterWorkspace` est remonté à chaque étape : `getModels()` peut encore
    // porter le modèle précédent, d'où la préférence pour l'éditeur monté.
    const editeurs = monaco.editor.getEditors();
    const model = editeurs.length ? editeurs[0].getModel() : (monaco.editor.getModels()[0] ?? null);
    if (!model) return "no-models";
    model.setValue(value);
    return "ok";
  }, code);
  expect(resultat, "impossible de poser le code sur le modèle Monaco").toBe("ok");
}

/**
 * Ouvre un chapitre et ramène la pagination à son étape 1.
 *
 * Utile quand Playwright relance le test sans rejouer `globalSetup` : les
 * étapes déjà validées feraient reprendre `ChapterClient` plus loin. Il
 * affiche l'étape 1 tant que `GET /api/me` n'a pas répondu, d'où l'attente de
 * cette réponse avant de lire l'état des boutons.
 */
async function ouvrirChapitreAEtape1(page: Page, url: string): Promise<void> {
  const hydratation = page
    .waitForResponse(
      (r) => r.url().includes("/api/me") && r.request().method() === "GET",
      { timeout: 15_000 }
    )
    .catch(() => null);
  await page.goto(url);
  await hydratation;

  const precedent = page.getByRole("button", { name: /précédent/i });
  await expect(precedent).toBeVisible({ timeout: 30_000 });
  // Le chapitre compte 4 étapes : 3 clics ramènent toujours à la première.
  for (let i = 0; i < 3; i++) {
    if (await precedent.isDisabled()) break;
    await precedent.click();
  }
  await expect(precedent).toBeDisabled();
}

/** Échappe une chaîne pour l'insérer telle quelle dans une RegExp. */
function echapper(texte: string): string {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Parcours de bout en bout de la boucle quotidienne (CF-12), avec la session
 * partagée écrite par global-setup.
 */
test.describe("boucle quotidienne", () => {
  test.use({ storageState: STORAGE_STATE });

  test.beforeEach(async ({ page }) => {
    // E2E_USER est recréé sans avatar, et /dashboard affiche l'écran-titre tant
    // qu'aucun avatar n'est choisi : on en pose un par l'API.
    const res = await page.request.post("/api/me/avatar", {
      data: { species: "humain", uniformColor: "cyan", role: "pilote" },
    });
    expect(res.ok(), `POST /api/me/avatar a échoué : ${res.status()}`).toBeTruthy();
  });

  test("le bandeau de liaison et le briefing s'affichent, un ordre mène en mission", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page.getByText(/jour.? de liaison/i)).toBeVisible();

    await expect(page.getByText(/ordre du jour|briefing complet/i)).toBeVisible();

    const missionLink = page.getByRole("link", { name: /mission/i }).first();
    await expect(missionLink).toBeVisible();
    await missionLink.click();
    await expect(page).toHaveURL(/\/learn\//);
  });

  test("l'ancien bouton « Récupérer le bonus » de la mission du jour a disparu", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: /récupérer le bonus/i })).toHaveCount(0);
  });

  test("l'armurerie montre des objets verrouillés avec leur condition", async ({ page }) => {
    await page.goto("/avatar");

    // Un objet non obtenu reste visible avec sa condition (UnlockShelf.tsx) ;
    // un cadet neuf a toujours au moins un cadre verrouillé de ce type.
    await expect(
      page.getByText(/encore .* de liaison|encore .* ordre/i).first()
    ).toBeVisible();
  });

  /**
   * Briefing affiché, étapes validées, ordre accompli, XP persistée. L'état
   * final est lu sur le serveur (`GET /api/me`), qui fait foi sur l'XP, puis
   * retrouvé dans le dashboard.
   */
  test("deux étapes validées accomplissent un ordre du jour, et l'XP est persistée", async ({
    page,
  }) => {
    // Trois navigations, un montage Monaco et deux exécutions du bac à sable :
    // le budget par défaut de 30 s est trop juste.
    test.slow();

    const avant = await lireEtat(page);
    const dejaFaites = new Set(avant.completedSteps["javascript/chapitre-1"] ?? []);

    await page.goto("/dashboard");
    await expect(page.getByText(/ordre du jour|briefing complet/i)).toBeVisible();

    await ouvrirChapitreAEtape1(page, "/learn/javascript/chapitre-1");

    for (const [etape, code] of SOLUTIONS_JS_CH1.entries()) {
      // `ChapterClient` sauvegarde sans attendre (`void completeStep(...)`), et
      // seulement si l'étape n'était pas déjà validée. On n'attend donc la
      // requête que si elle doit partir, sinon le délai complet s'écoulerait.
      const sauvegarde = dejaFaites.has(etape)
        ? null
        : page
            .waitForResponse(
              (r) => r.url().includes("/api/me/step") && r.request().method() === "POST",
              { timeout: 20_000 }
            )
            .catch(() => null);

      await definirCodeEditeur(page, code);
      await page.getByRole("button", { name: /DEPLOYER/ }).click();

      await expect(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({ timeout: 15_000 });
      if (sauvegarde) await sauvegarde;
      const suivant = page.getByRole("button", { name: /SYSTÈME SUIVANT/ });
      await expect(suivant).toBeVisible({ timeout: 15_000 });
      await suivant.click();
    }

    const apres = await lireEtat(page);

    expect(apres.completedSteps["javascript/chapitre-1"]).toEqual(
      expect.arrayContaining([0, 1])
    );

    // Une étape déjà validée ne rapporte pas d'XP : la comparaison stricte
    // suppose qu'au moins une des deux était neuve.
    expect(apres.totalXp).toBeGreaterThan(0);
    if (dejaFaites.size < SOLUTIONS_JS_CH1.length) {
      expect(apres.totalXp).toBeGreaterThan(avant.totalXp);
    }

    // La liaison ne compte que le travail réel, pas la visite du dashboard.
    expect(apres.liaison.activeToday).toBe(true);

    // L'ordre de reprise est toujours tiré, avec une cible d'au plus 2
    // (lib/quests.ts).
    const reprise = apres.briefing?.quests.find((q) => q.slot === "reprise");
    expect(reprise, "le briefing doit toujours porter un ordre de reprise").toBeDefined();
    expect(reprise!.progress).toBeGreaterThanOrEqual(reprise!.target);
    expect(reprise!.done).toBe(true);

    // `QuestLine` préfixe l'ordre accompli d'un ✓ ; le libellé vient du serveur.
    await page.goto("/dashboard");
    await expect(
      page.getByText(new RegExp(`✓\\s*${echapper(reprise!.label)}`))
    ).toBeVisible();
  });
});
