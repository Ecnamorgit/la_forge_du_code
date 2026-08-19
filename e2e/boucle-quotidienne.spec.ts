import { test, expect, type Page } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * Le cursus JavaScript, chapitre 1, étapes 1 et 2 — et surtout pas le chapitre
 * HTML.
 *
 * `html/chapitre-1` est joué intégralement par `html-parcours.spec.ts`, qui
 * suppose de démarrer à l'étape 1 ; or `ChapterClient` reprend à la première
 * étape NON validée (`autoStep`). Valider une étape de ce chapitre ici ferait
 * démarrer html-parcours à l'étape 2 avec la solution de l'étape 1, et le
 * casserait. `javascript/chapitre-1` n'est ouvert que par `monaco.spec.ts`,
 * qui se contente de vérifier que l'éditeur se monte.
 *
 * Deux étapes et pas une : l'ordre de reprise du briefing est tiré entre
 * « Valide une étape » (cible 1) et « Valide 2 étapes » (cible 2)
 * (lib/quests.ts, emplacement `reprise`, toujours pourvu). Deux étapes
 * l'accomplissent dans les deux cas, quel que soit le tirage du jour.
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

/** L'état tel que le SERVEUR le voit — jamais une valeur lue dans le DOM. */
async function lireEtat(page: Page): Promise<EtatServeur> {
  const res = await page.request.get("/api/me");
  expect(res.ok(), `GET /api/me a échoué : ${res.status()}`).toBeTruthy();
  return res.json();
}

/**
 * Pose le code directement sur le modèle Monaco.
 *
 * Monaco ferme automatiquement guillemets et parenthèses à la frappe : taper
 * un code qui porte déjà ses fermetures produit un code double-fermé. On passe
 * donc par `window.monaco`, exposé globalement par le loader une fois
 * l'éditeur monté — ça déclenche le même `onDidChangeModelContent`, donc le
 * même `onChange` côté React, qu'une vraie saisie. Motif repris de
 * `react-preview.spec.ts`.
 */
async function definirCodeEditeur(page: Page, code: string): Promise<void> {
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
  const resultat = await page.evaluate((value) => {
    const monaco = (window as unknown as { monaco?: typeof import("monaco-editor") }).monaco;
    if (!monaco) return "no-monaco";
    // `ChapterWorkspace` est remonté à chaque changement d'étape (clé) :
    // `getModels()` peut donc encore porter le modèle de l'étape précédente.
    // On passe par l'éditeur monté, seul à désigner le modèle réellement
    // affiché, et on ne retombe sur `getModels()` que s'il n'y en a aucun.
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
 * Les étapes déjà validées font reprendre `ChapterClient` plus loin : sans ce
 * retour, une reprise après échec — Playwright rejoue le test, jamais
 * `globalSetup` — appliquerait la solution de l'étape 1 à l'étape 2. On revient
 * donc par la pagination client, sans toucher à la base.
 *
 * `ChapterClient` affiche l'étape 1 par défaut tant que `GET /api/me` n'a pas
 * répondu, puis bascule vers l'étape réellement reprise : on attend la réponse
 * avant de lire l'état des boutons (piège documenté dans
 * `react-preview.spec.ts`).
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
  // Le chapitre compte 4 étapes : 3 clics suffisent à revenir à la première
  // depuis n'importe laquelle.
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
 * Parcours de bout en bout de la boucle quotidienne (CF-12).
 *
 * Session partagée écrite par global-setup : `auth.ts` limite les connexions
 * à 10 par 5 minutes et par IP, et la suite dépasserait ce seuil si chaque
 * spec se connectait pour son compte — même mécanisme que les autres specs
 * (doc-panel, monaco, react-preview, web-vitals).
 */
test.describe("boucle quotidienne", () => {
  test.use({ storageState: STORAGE_STATE });

  test.beforeEach(async ({ page }) => {
    // `app/dashboard/page.tsx` bascule sur l'écran-titre (IntroCinematic) tant
    // que `hasAvatar(state)` est faux (lib/user-store.ts) — c'est-à-dire tant
    // qu'aucune espèce/couleur/rôle n'a été choisi. E2E_USER est recréé sans
    // avatar par global-setup (species/uniformColor/role nuls) et aucune spec
    // existante ne complète ce formulaire. Sans cette étape, /dashboard
    // n'affiche jamais le bandeau de liaison ni le briefing : on le fait ici
    // via l'API déjà utilisée par app/avatar/page.tsx, plutôt que de rejouer
    // le formulaire dans l'UI à chaque test.
    const res = await page.request.post("/api/me/avatar", {
      data: { species: "humain", uniformColor: "cyan", role: "pilote" },
    });
    expect(res.ok(), `POST /api/me/avatar a échoué : ${res.status()}`).toBeTruthy();
  });

  test("le bandeau de liaison et le briefing s'affichent, un ordre mène en mission", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Le bandeau de liaison est en tête de page (components/dashboard/LiaisonBanner.tsx).
    await expect(page.getByText(/jour.? de liaison/i)).toBeVisible();

    // Le briefing porte au moins un ordre, ou annonce qu'il est déjà bouclé
    // (components/dashboard/BriefingCard.tsx).
    await expect(page.getByText(/ordre du jour|briefing complet/i)).toBeVisible();

    // Aller travailler : le bouton principal du briefing mène à une étape du
    // cursus actif.
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

    // Règle centrale de components/avatar/UnlockShelf.tsx : un objet non
    // obtenu reste visible, grisé, avec sa condition affichée (lib/unlocks.ts
    // génère "encore N jour(s) de liaison" / "encore N ordre(s)" / etc). Un
    // cadet fraîchement créé (streak par défaut à 1, aucun ordre validé) a au
    // moins un cadre verrouillé de ce type : ne pas se contenter de vérifier
    // qu'un cadenas 🔒 existe, la condition doit être lisible.
    await expect(
      page.getByText(/encore .* de liaison|encore .* ordre/i).first()
    ).toBeVisible();
  });

  /**
   * La moitié aval du parcours exigé par la spec (Partie 5, « Tests ») :
   * connexion → briefing affiché → une étape validée → un ordre passe à l'état
   * accompli → l'XP est persistée.
   *
   * L'état d'arrivée est lu depuis le SERVEUR (`GET /api/me`) puis retrouvé
   * dans l'interface : c'est le serveur qui fait foi sur l'XP — elle n'est
   * jamais calculée côté client (lib/me-server.ts) — et le dashboard qui doit
   * la montrer.
   */
  test("deux étapes validées accomplissent un ordre du jour, et l'XP est persistée", async ({
    page,
  }) => {
    const avant = await lireEtat(page);
    const dejaFaites = new Set(avant.completedSteps["javascript/chapitre-1"] ?? []);

    // Le briefing est affiché AVANT le travail : c'est la première moitié du
    // parcours, et la condition de la seconde.
    await page.goto("/dashboard");
    await expect(page.getByText(/ordre du jour|briefing complet/i)).toBeVisible();

    await ouvrirChapitreAEtape1(page, "/learn/javascript/chapitre-1");

    for (const code of SOLUTIONS_JS_CH1) {
      // La sauvegarde serveur part depuis `ChapterClient` sans être attendue
      // par l'interface (`void completeStep(...)`) : sans ce guet, la lecture
      // d'état plus bas pourrait précéder l'écriture. Elle ne part pas du tout
      // quand l'étape était déjà validée — d'où le `catch`, qui laisse ce cas
      // passer sans faire échouer le test pour la mauvaise raison.
      const sauvegarde = page
        .waitForResponse(
          (r) => r.url().includes("/api/me/step") && r.request().method() === "POST",
          { timeout: 20_000 }
        )
        .catch(() => null);

      await definirCodeEditeur(page, code);
      await page.getByRole("button", { name: /DEPLOYER/ }).click();

      // Validation réussie côté client (components/lesson/ChapterWorkspace.tsx)…
      await expect(page.getByText("SYSTEME EN LIGNE")).toBeVisible({ timeout: 15_000 });
      await sauvegarde;
      // …puis la bannière de réussite, dont le bouton avance d'une étape.
      const suivant = page.getByRole("button", { name: /SYSTEME SUIVANT/ });
      await expect(suivant).toBeVisible({ timeout: 15_000 });
      await suivant.click();
    }

    const apres = await lireEtat(page);

    // 1. Les deux étapes sont persistées côté serveur.
    expect(apres.completedSteps["javascript/chapitre-1"]).toEqual(
      expect.arrayContaining([0, 1])
    );

    // 2. L'XP a bien été versée. La comparaison stricte n'a de sens que si au
    // moins une des deux étapes était neuve : rejouer ce test sur un compte qui
    // les a déjà validées ne verse rien (`alreadyDone`), et c'est correct.
    expect(apres.totalXp).toBeGreaterThan(0);
    if (dejaFaites.size < SOLUTIONS_JS_CH1.length) {
      expect(apres.totalXp).toBeGreaterThan(avant.totalXp);
    }

    // 3. La liaison ne monte que sur travail réel : elle est acquise pour
    // aujourd'hui maintenant, et ne l'était pas sur la simple visite du
    // dashboard faite plus haut.
    expect(apres.liaison.activeToday).toBe(true);

    // 4. Un ordre est passé à l'état accompli. L'emplacement « reprise » est
    // toujours pourvu et sa cible ne dépasse jamais 2 (lib/quests.ts).
    const reprise = apres.briefing?.quests.find((q) => q.slot === "reprise");
    expect(reprise, "le briefing doit toujours porter un ordre de reprise").toBeDefined();
    expect(reprise!.progress).toBeGreaterThanOrEqual(reprise!.target);
    expect(reprise!.done).toBe(true);

    // 5. Et l'interface le dit : `QuestLine` préfixe d'un ✓ l'ordre accompli.
    // Le libellé vient du serveur, jamais d'une chaîne recopiée ici.
    await page.goto("/dashboard");
    await expect(
      page.getByText(new RegExp(`✓\\s*${echapper(reprise!.label)}`))
    ).toBeVisible();
  });
});
