import { describe, expect, it } from "vitest";

import { CHAPTER_SUMMARIES } from "@/lib/chapter-summaries";
import { getChapterData } from "@/lib/courses-registry";
import { PREVIEW_MOUNT_NAME_RE } from "./react-preview";
import { PREVIEW_EXEMPT } from "./preview-exemptions";

/**
 * Chaque étape React doit être dans un des deux cas : elle a un `previewMount`
 * valide, ou son chapitre est exempté avec une raison écrite. Une étape oubliée
 * échoue ici — c'est le seul garde-fou contre un aperçu qui reste vide sans que
 * personne ne s'en aperçoive.
 */
describe("previewMount du cursus React", () => {
  const slugs = CHAPTER_SUMMARIES.react.map((c) => c.slug);

  it("couvre chaque etape, ou l'exempte explicitement", () => {
    for (const slug of slugs) {
      const exempt = PREVIEW_EXEMPT[`react/${slug}`];
      const data = getChapterData("react", slug);
      expect(data, `${slug} absent du registre`).not.toBeNull();

      data!.steps.forEach((step, i) => {
        const ref = `react/${slug} etape ${i + 1}`;
        if (exempt) {
          expect(step.previewMount, `${ref} : chapitre exempte, previewMount inattendu`).toBeUndefined();
          return;
        }
        expect(step.previewMount, `${ref} : previewMount manquant`).toBeDefined();
        expect(
          PREVIEW_MOUNT_NAME_RE.test(step.previewMount!),
          `${ref} : « ${step.previewMount} » n'est pas un identifiant valide`
        ).toBe(true);
      });
    }
  });

  /**
   * Le vrai piège : un previewMount qui nomme un composant que l'étape ne
   * déclare pas. Le `hint` étant la solution de référence, il doit contenir la
   * déclaration de ce composant.
   */
  it("nomme un composant declare dans le hint de l'etape", () => {
    for (const slug of slugs) {
      if (PREVIEW_EXEMPT[`react/${slug}`]) continue;
      const data = getChapterData("react", slug)!;

      data.steps.forEach((step, i) => {
        const nom = step.previewMount!;
        const declare = new RegExp(
          `(?:function\\s+${nom}\\s*\\(|(?:const|let|var)\\s+${nom}\\s*=)`
        ).test(step.hint);
        expect(
          declare,
          `react/${slug} etape ${i + 1} : « ${nom} » n'est pas declare dans le hint`
        ).toBe(true);
      });
    }
  });

  it("chaque exemption porte une raison non vide", () => {
    for (const [cle, raison] of Object.entries(PREVIEW_EXEMPT)) {
      expect(raison.trim().length, `${cle} : raison vide`).toBeGreaterThan(20);
    }
  });
});
