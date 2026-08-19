import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

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
});
