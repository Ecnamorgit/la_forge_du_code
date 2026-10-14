import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Audit SRV-10 : la page chapitre vérifie la session elle-même. On l'appelle
 * directement, sans session, comme le verrait un visiteur qui aurait
 * contourné le proxy.
 */

const session = vi.hoisted(() => ({ value: null as null | { user: { id: string } } }));

vi.mock("@/auth", () => ({ auth: async () => session.value }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));
vi.mock("./ChapterClient", () => ({ default: () => null }));

import ChapterPage from "./page";

const openChapter = (course: string, chapter: string) =>
  ChapterPage({ params: Promise.resolve({ course, chapter }) });

describe("page chapitre, sans compter sur le proxy", () => {
  beforeEach(() => {
    session.value = null;
  });

  it("renvoie vers la connexion un visiteur sans session sur un chapitre protégé", async () => {
    await expect(openChapter("html", "chapitre-5")).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("renvoie vers la connexion un visiteur sans session sur un autre cursus", async () => {
    await expect(openChapter("css", "chapitre-1")).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("sert un chapitre d'essai sans session", async () => {
    await expect(openChapter("html", "chapitre-1")).resolves.toBeTruthy();
  });

  it("sert un chapitre protégé à un compte connecté", async () => {
    session.value = { user: { id: "cadet" } };
    await expect(openChapter("html", "chapitre-5")).resolves.toBeTruthy();
  });
});
