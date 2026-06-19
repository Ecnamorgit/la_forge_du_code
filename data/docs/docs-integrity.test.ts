import { describe, it, expect } from "vitest";
import { htmlDocs, getDocEntry } from "./html";
import { extractDocTokenIds } from "@/lib/markdown";
import type { ChapterData } from "@/data/courses/html/types";
import { chapitre1 } from "@/data/courses/html/chapitre-1";
import { chapitre2 } from "@/data/courses/html/chapitre-2";
import { chapitre3 } from "@/data/courses/html/chapitre-3";
import { chapitre4 } from "@/data/courses/html/chapitre-4";
import { chapitre5 } from "@/data/courses/html/chapitre-5";
import { chapitre6 } from "@/data/courses/html/chapitre-6";
import { chapitre7 } from "@/data/courses/html/chapitre-7";
import { chapitre8 } from "@/data/courses/html/chapitre-8";

const CHAPTERS: ChapterData[] = [
  chapitre1,
  chapitre2,
  chapitre3,
  chapitre4,
  chapitre5,
  chapitre6,
  chapitre7,
  chapitre8,
];

describe("intégrité des renvois de fiches", () => {
  it("chaque `related` de fiche pointe vers une fiche existante", () => {
    for (const entry of Object.values(htmlDocs)) {
      for (const id of entry.related ?? []) {
        expect(getDocEntry(id), `related cassé: ${id}`).toBeDefined();
      }
    }
  });

  it("chaque `docRefs` de toutes les étapes HTML pointe vers une fiche existante", () => {
    for (const chapter of CHAPTERS) {
      for (const step of chapter.steps) {
        for (const id of step.docRefs ?? []) {
          expect(
            getDocEntry(id),
            `docRefs cassé dans ${chapter.slug}: ${id}`
          ).toBeDefined();
        }
      }
    }
  });

  it("chaque token [[doc:ID]] des briefings pointe vers une fiche existante", () => {
    for (const chapter of CHAPTERS) {
      for (const step of chapter.steps) {
        for (const id of extractDocTokenIds(step.briefing.content)) {
          expect(
            getDocEntry(id),
            `token cassé dans ${chapter.slug}: ${id}`
          ).toBeDefined();
        }
      }
    }
  });

  it("chaque fiche a les champs essentiels renseignés", () => {
    for (const entry of Object.values(htmlDocs)) {
      expect(entry.id, "id manquant").toBeTruthy();
      expect(entry.term, `term manquant: ${entry.id}`).toBeTruthy();
      expect(entry.title, `title manquant: ${entry.id}`).toBeTruthy();
      expect(entry.summary, `summary manquant: ${entry.id}`).toBeTruthy();
      expect(entry.body.trim(), `body vide: ${entry.id}`).toBeTruthy();
    }
  });
});
