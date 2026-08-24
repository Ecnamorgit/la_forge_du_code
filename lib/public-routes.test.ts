import { describe, expect, it } from "vitest";

import {
  INDEXABLE_ROUTES,
  NON_INDEXABLE_PREFIXES,
  PROTECTED_PREFIXES,
  TRIAL_CHAPTERS,
  TRIAL_COURSE,
  TRIAL_LAST_CHAPTER,
  isPublicRoute,
} from "./public-routes";

describe("isPublicRoute", () => {
  it("ouvre le chapitre d'essai", () => {
    expect(isPublicRoute("/learn/html/chapitre-1")).toBe(true);
  });

  it("tolère un slash final", () => {
    expect(isPublicRoute("/learn/html/chapitre-1/")).toBe(true);
  });

  it("ferme le chapitre suivant l'essai", () => {
    expect(isPublicRoute("/learn/html/chapitre-4")).toBe(false);
  });

  // Le piège : un match par préfixe ouvrirait chapitre-10 le jour où HTML
  // dépassera 9 chapitres. CSS en a déjà 10, JavaScript 12.
  it("ferme chapitre-10 (pas de match par préfixe)", () => {
    expect(isPublicRoute("/learn/html/chapitre-10")).toBe(false);
    expect(isPublicRoute("/learn/html/chapitre-11")).toBe(false);
  });

  it("ferme le même numéro de chapitre dans un autre cursus", () => {
    expect(isPublicRoute("/learn/css/chapitre-1")).toBe(false);
    expect(isPublicRoute("/learn/javascript/chapitre-1")).toBe(false);
  });

  it("ferme les sous-chemins du chapitre d'essai", () => {
    expect(isPublicRoute("/learn/html/chapitre-1/solution")).toBe(false);
  });

  it("ferme la liste des cursus", () => {
    expect(isPublicRoute("/learn")).toBe(false);
  });

  it("expose le cursus et les chapitres d'essai", () => {
    expect(TRIAL_COURSE).toBe("html");
    expect(TRIAL_CHAPTERS[0]).toBe("chapitre-1");
  });

  // Revue adversariale : l'égalité stricte doit fermer toute variante du
  // chemin, jamais l'ouvrir. Un slash surnuméraire ou une casse différente
  // ne doivent jamais donner accès.
  it("ferme les slashes finaux multiples", () => {
    expect(isPublicRoute("/learn/html/chapitre-1//")).toBe(false);
  });

  it("ferme les variantes de casse", () => {
    expect(isPublicRoute("/learn/HTML/chapitre-1")).toBe(false);
    expect(isPublicRoute("/learn/html/Chapitre-1")).toBe(false);
    expect(isPublicRoute("/LEARN/html/chapitre-1")).toBe(false);
  });
});

describe("essai étendu", () => {
  it("la carte du cursus d'essai est publique", () => {
    expect(isPublicRoute("/learn/html")).toBe(true);
    expect(isPublicRoute("/learn/html/")).toBe(true);
  });

  it("les chapitres 1 à 3 sont publics, pas les suivants", () => {
    expect(isPublicRoute("/learn/html/chapitre-1")).toBe(true);
    expect(isPublicRoute("/learn/html/chapitre-2")).toBe(true);
    expect(isPublicRoute("/learn/html/chapitre-3")).toBe(true);
    expect(isPublicRoute("/learn/html/chapitre-4")).toBe(false);
    expect(isPublicRoute("/learn/html/chapitre-8")).toBe(false);
  });

  it("jamais de match par préfixe", () => {
    expect(isPublicRoute("/learn/html/chapitre-10")).toBe(false);
    expect(isPublicRoute("/learn/htmlx")).toBe(false);
    expect(isPublicRoute("/learn/css")).toBe(false);
  });

  it("TRIAL_CHAPTERS est ordonné et TRIAL_LAST_CHAPTER en est le dernier", () => {
    expect(TRIAL_CHAPTERS).toEqual(["chapitre-1", "chapitre-2", "chapitre-3"]);
    expect(TRIAL_LAST_CHAPTER).toBe("chapitre-3");
  });
});

/**
 * Cohérence entre ce que le middleware protège et ce qu'on déclare aux
 * moteurs. Sans ces tests, déclarer une page protégée au sitemap ferait
 * explorer les crawlers contre une redirection vers /login — silencieusement.
 */
describe("cohérence sitemap / robots / middleware", () => {
  it("ne déclare au sitemap que des routes réellement atteignables sans compte", () => {
    for (const route of INDEXABLE_ROUTES) {
      const isUnderProtectedPrefix = PROTECTED_PREFIXES.some(
        (p) => route === p || route.startsWith(`${p}/`)
      );
      // Une route sous préfixe protégé n'est admise que si l'allowlist l'ouvre.
      if (isUnderProtectedPrefix) {
        expect(isPublicRoute(route), `${route} est protégé et hors allowlist`).toBe(true);
      }
    }
  });

  it("déclare la carte et les chapitres d'essai au sitemap", () => {
    expect(INDEXABLE_ROUTES).toContain(`/learn/${TRIAL_COURSE}`);
    for (const chapter of TRIAL_CHAPTERS) {
      expect(INDEXABLE_ROUTES).toContain(`/learn/${TRIAL_COURSE}/${chapter}`);
    }
  });

  it("déclare la landing et le codex au sitemap", () => {
    expect(INDEXABLE_ROUTES).toContain("/");
    expect(INDEXABLE_ROUTES).toContain("/codex");
  });

  it("n'interdit aucune route du sitemap via les préfixes non indexables", () => {
    for (const route of INDEXABLE_ROUTES) {
      for (const prefix of NON_INDEXABLE_PREFIXES) {
        expect(
          route === prefix || route.startsWith(`${prefix}/`),
          `${route} est déclaré au sitemap mais interdit par ${prefix}`
        ).toBe(false);
      }
    }
  });

  it("protège toujours les espaces authentifiés", () => {
    for (const prefix of ["/dashboard", "/profil", "/avatar", "/leaderboard"]) {
      expect(PROTECTED_PREFIXES).toContain(prefix);
    }
  });
});
