import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Constat SRV-10 de l'audit de sécurité du 2026-09-12 : la page d'un chapitre
 * ne vérifiait pas la session elle-même et comptait sur le seul proxy.
 *
 * Or next 16.2.4 portait plusieurs contournements publics du proxy (corrigés
 * par DEP-01). Le jour où un nouveau contournement apparaît, une page qui ne
 * se garde pas elle-même sert son contenu à n'importe qui. La carte du cursus
 * se protégeait déjà (défense en profondeur) ; la page chapitre, non.
 *
 * On appelle ici la page directement, sans session : c'est exactement ce que
 * verrait un visiteur si le proxy était contourné.
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

const ouvrir = (course: string, chapter: string) =>
  ChapterPage({ params: Promise.resolve({ course, chapter }) });

describe("page chapitre, sans compter sur le proxy", () => {
  beforeEach(() => {
    session.value = null;
  });

  it("renvoie vers la connexion un visiteur sans session sur un chapitre protégé", async () => {
    await expect(ouvrir("html", "chapitre-5")).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("renvoie vers la connexion un visiteur sans session sur un autre cursus", async () => {
    await expect(ouvrir("css", "chapitre-1")).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("sert un chapitre d'essai sans session", async () => {
    await expect(ouvrir("html", "chapitre-1")).resolves.toBeTruthy();
  });

  it("sert un chapitre protégé à un compte connecté", async () => {
    session.value = { user: { id: "cadet" } };
    await expect(ouvrir("html", "chapitre-5")).resolves.toBeTruthy();
  });
});
