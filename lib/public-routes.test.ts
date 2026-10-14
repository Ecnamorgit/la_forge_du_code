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
  it("opens the trial chapter", () => {
    expect(isPublicRoute("/learn/html/chapitre-1")).toBe(true);
  });

  it("tolerates a trailing slash", () => {
    expect(isPublicRoute("/learn/html/chapitre-1/")).toBe(true);
  });

  it("closes the chapter after the trial", () => {
    expect(isPublicRoute("/learn/html/chapitre-4")).toBe(false);
  });

  // A prefix match would open chapitre-10 as soon as HTML had more than nine
  // chapters.
  it("closes chapitre-10 (no prefix match)", () => {
    expect(isPublicRoute("/learn/html/chapitre-10")).toBe(false);
    expect(isPublicRoute("/learn/html/chapitre-11")).toBe(false);
  });

  it("closes the same chapter number in another course", () => {
    expect(isPublicRoute("/learn/css/chapitre-1")).toBe(false);
    expect(isPublicRoute("/learn/javascript/chapitre-1")).toBe(false);
  });

  it("closes subpaths of the trial chapter", () => {
    expect(isPublicRoute("/learn/html/chapitre-1/solution")).toBe(false);
  });

  it("closes the course list", () => {
    expect(isPublicRoute("/learn")).toBe(false);
  });

  it("exposes the trial course and chapters", () => {
    expect(TRIAL_COURSE).toBe("html");
    expect(TRIAL_CHAPTERS[0]).toBe("chapitre-1");
  });

  // Strict equality closes every variant of the path (extra slash,
  // different case).
  it("closes multiple trailing slashes", () => {
    expect(isPublicRoute("/learn/html/chapitre-1//")).toBe(false);
  });

  it("closes case variants", () => {
    expect(isPublicRoute("/learn/HTML/chapitre-1")).toBe(false);
    expect(isPublicRoute("/learn/html/Chapitre-1")).toBe(false);
    expect(isPublicRoute("/LEARN/html/chapitre-1")).toBe(false);
  });
});

describe("extended trial", () => {
  it("the trial course map is public", () => {
    expect(isPublicRoute("/learn/html")).toBe(true);
    expect(isPublicRoute("/learn/html/")).toBe(true);
  });

  it("chapters 1 to 3 are public, the following ones are not", () => {
    expect(isPublicRoute("/learn/html/chapitre-1")).toBe(true);
    expect(isPublicRoute("/learn/html/chapitre-2")).toBe(true);
    expect(isPublicRoute("/learn/html/chapitre-3")).toBe(true);
    expect(isPublicRoute("/learn/html/chapitre-4")).toBe(false);
    expect(isPublicRoute("/learn/html/chapitre-8")).toBe(false);
  });

  it("never matches by prefix", () => {
    expect(isPublicRoute("/learn/html/chapitre-10")).toBe(false);
    expect(isPublicRoute("/learn/htmlx")).toBe(false);
    expect(isPublicRoute("/learn/css")).toBe(false);
  });

  it("TRIAL_CHAPTERS is ordered and TRIAL_LAST_CHAPTER is its last item", () => {
    expect(TRIAL_CHAPTERS).toEqual(["chapitre-1", "chapitre-2", "chapitre-3"]);
    expect(TRIAL_LAST_CHAPTER).toBe("chapitre-3");
  });
});

/**
 * Consistency between what `proxy.ts` protects and what we declare to search
 * engines: a protected page listed in the sitemap would make crawlers hit a
 * redirect to /login.
 */
describe("sitemap / robots / middleware consistency", () => {
  it("only lists routes in the sitemap that are actually reachable without an account", () => {
    for (const route of INDEXABLE_ROUTES) {
      const isUnderProtectedPrefix = PROTECTED_PREFIXES.some(
        (p) => route === p || route.startsWith(`${p}/`)
      );
      // A route under a protected prefix is only allowed if the allowlist opens it.
      if (isUnderProtectedPrefix) {
        expect(isPublicRoute(route), `${route} est protégé et hors allowlist`).toBe(true);
      }
    }
  });

  it("lists the trial map and chapters in the sitemap", () => {
    expect(INDEXABLE_ROUTES).toContain(`/learn/${TRIAL_COURSE}`);
    for (const chapter of TRIAL_CHAPTERS) {
      expect(INDEXABLE_ROUTES).toContain(`/learn/${TRIAL_COURSE}/${chapter}`);
    }
  });

  it("lists the landing page and the codex in the sitemap", () => {
    expect(INDEXABLE_ROUTES).toContain("/");
    expect(INDEXABLE_ROUTES).toContain("/codex");
  });

  it("does not disallow any sitemap route through the non-indexable prefixes", () => {
    for (const route of INDEXABLE_ROUTES) {
      for (const prefix of NON_INDEXABLE_PREFIXES) {
        expect(
          route === prefix || route.startsWith(`${prefix}/`),
          `${route} est déclaré au sitemap mais interdit par ${prefix}`
        ).toBe(false);
      }
    }
  });

  it("always protects the authenticated areas", () => {
    for (const prefix of ["/dashboard", "/profil", "/avatar", "/leaderboard"]) {
      expect(PROTECTED_PREFIXES).toContain(prefix);
    }
  });
});
