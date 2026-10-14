/**
 * Progression order enforced by the server (audit EXE-01). It mirrors the
 * two UI rules: within a chapter, step n is only offered once step n-1 is
 * passed; on the map, a chapter is only unlocked once the previous one is
 * finished (`LevelNode`, via `isChapterComplete`). Any stricter and the rule
 * would block an honest learner; any looser and a script could skip the
 * whole journey.
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
    const previousDone = done.some(
      (d) => d.chapter === chapter && d.stepIndex === stepIndex - 1
    );
    return previousDone
      ? { ok: true }
      : { ok: false, reason: "Termine d'abord l'étape précédente." };
  }

  if (position === 0) return { ok: true };

  const previousChapter = chapters[position - 1];
  const doneCount = done.filter((d) => d.chapter === previousChapter.slug).length;
  return doneCount >= previousChapter.totalSteps
    ? { ok: true }
    : { ok: false, reason: "Termine d'abord le chapitre précédent." };
}
