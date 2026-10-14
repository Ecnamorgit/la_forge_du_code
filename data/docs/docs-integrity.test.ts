import { describe, it, expect } from "vitest";
import { htmlDocs, getDocEntry } from "./html";
import { extractDocTokenIds } from "@/lib/markdown";
import type { ChapterData } from "@/data/courses/html/types";
import { chapter1 } from "@/data/courses/html/chapitre-1";
import { chapter2 } from "@/data/courses/html/chapitre-2";
import { chapter3 } from "@/data/courses/html/chapitre-3";
import { chapter4 } from "@/data/courses/html/chapitre-4";
import { chapter5 } from "@/data/courses/html/chapitre-5";
import { chapter6 } from "@/data/courses/html/chapitre-6";
import { chapter7 } from "@/data/courses/html/chapitre-7";
import { chapter8 } from "@/data/courses/html/chapitre-8";

const CHAPTERS: ChapterData[] = [
  chapter1,
  chapter2,
  chapter3,
  chapter4,
  chapter5,
  chapter6,
  chapter7,
  chapter8,
];

describe("reference sheet link integrity", () => {
  it("every sheet `related` points to an existing sheet", () => {
    for (const entry of Object.values(htmlDocs)) {
      for (const id of entry.related ?? []) {
        expect(getDocEntry(id), `related cassé: ${id}`).toBeDefined();
      }
    }
  });

  it("every `docRefs` of all HTML steps points to an existing sheet", () => {
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

  it("every [[doc:ID]] token in briefings points to an existing sheet", () => {
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

  it("every sheet has its essential fields filled in", () => {
    for (const entry of Object.values(htmlDocs)) {
      expect(entry.id, "id manquant").toBeTruthy();
      expect(entry.term, `term manquant: ${entry.id}`).toBeTruthy();
      expect(entry.title, `title manquant: ${entry.id}`).toBeTruthy();
      expect(entry.summary, `summary manquant: ${entry.id}`).toBeTruthy();
      expect(entry.body.trim(), `body vide: ${entry.id}`).toBeTruthy();
    }
  });
});
