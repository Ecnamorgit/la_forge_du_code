/**
 * Ordre de progression appliqué par le serveur (audit EXE-01). Il reprend les
 * deux règles de l'interface : dans un chapitre, l'étape n n'est proposée
 * qu'après la réussite de l'étape n-1 ; sur la carte, un chapitre n'est
 * déverrouillé qu'une fois le précédent terminé (`LevelNode`, via
 * `isChapterComplete`). Plus stricte, la règle bloquerait un apprenant
 * honnête ; plus lâche, un script sauterait tout le parcours.
 */

export interface ChapterSteps {
  slug: string;
  totalSteps: number;
}

export interface DoneStep {
  chapter: string;
  stepIndex: number;
}

export type StepOrderVerdict = { ok: true } | { ok: false; reason: string };

export function checkStepOrder(
  chapters: readonly ChapterSteps[],
  done: readonly DoneStep[],
  chapter: string,
  stepIndex: number
): StepOrderVerdict {
  const position = chapters.findIndex((c) => c.slug === chapter);
  if (position === -1) return { ok: false, reason: "Chapitre hors du parcours." };

  if (stepIndex > 0) {
    const precedenteFaite = done.some(
      (d) => d.chapter === chapter && d.stepIndex === stepIndex - 1
    );
    return precedenteFaite
      ? { ok: true }
      : { ok: false, reason: "Termine d'abord l'étape précédente." };
  }

  if (position === 0) return { ok: true };

  const precedent = chapters[position - 1];
  const faites = done.filter((d) => d.chapter === precedent.slug).length;
  return faites >= precedent.totalSteps
    ? { ok: true }
    : { ok: false, reason: "Termine d'abord le chapitre précédent." };
}
