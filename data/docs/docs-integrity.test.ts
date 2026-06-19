import { describe, it, expect } from "vitest";
import { htmlDocs, getDocEntry } from "./html";
import { extractDocTokenIds } from "@/lib/markdown";
import { chapitre1 } from "@/data/courses/html/chapitre-1";

describe("intégrité des renvois de fiches", () => {
  it("chaque `related` de fiche pointe vers une fiche existante", () => {
    for (const entry of Object.values(htmlDocs)) {
      for (const id of entry.related ?? []) {
        expect(getDocEntry(id), `related cassé: ${id}`).toBeDefined();
      }
    }
  });

  it("chaque `docRefs` du chapitre 1 pointe vers une fiche existante", () => {
    for (const step of chapitre1.steps) {
      for (const id of step.docRefs ?? []) {
        expect(getDocEntry(id), `docRefs cassé: ${id}`).toBeDefined();
      }
    }
  });

  it("chaque token [[doc:ID]] du briefing pointe vers une fiche existante", () => {
    for (const step of chapitre1.steps) {
      for (const id of extractDocTokenIds(step.briefing.content)) {
        expect(getDocEntry(id), `token cassé: ${id}`).toBeDefined();
      }
    }
  });
});
