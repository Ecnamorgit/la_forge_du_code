import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Audit SRV-10: the chapter page checks the session itself. It is called
 * directly, without a session, as a visitor who had bypassed the proxy
 * would see it.
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

describe("chapter page, without relying on the proxy",() => {
  beforeEach(() => {
    session.value = null;
  });

  it("redirects a visitor without a session to login on a protected chapter",async () => {
    await expect(openChapter("html", "chapitre-5")).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("redirects a visitor without a session to login on another course",async () => {
    await expect(openChapter("css", "chapitre-1")).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("serves a trial chapter without a session",async () => {
    await expect(openChapter("html", "chapitre-1")).resolves.toBeTruthy();
  });

  it("serves a protected chapter to a signed-in account",async () => {
    session.value = { user: { id: "cadet" } };
    await expect(openChapter("html", "chapitre-5")).resolves.toBeTruthy();
  });
});
