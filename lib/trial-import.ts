/**
 * Filtrage des étapes remontées par le mode essai.
 *
 * Le serveur ne doit accorder que ce que le visiteur pouvait déjà atteindre
 * sans compte : sans ce filtre, /api/me/trial-import deviendrait un
 * « valide-moi tout le cursus » en un appel.
 */

import { TRIAL_CHAPTERS, TRIAL_COURSE } from "./public-routes";
import type { TrialStepRef } from "./trial-user";

/** Borne défensive : les chapitres d'essai n'ont qu'une poignée d'étapes. */
const MAX_STEPS = 50;

const TRIAL_CHAPTER_SET = new Set(TRIAL_CHAPTERS);

// Deux protections indépendantes, à garder toutes les deux : les rejets en
// égalité stricte écartent toute entrée hors du périmètre d'essai, quelle que
// soit sa forme, et l'objet renvoyé reconstruit `course` et `chapter` depuis
// TRIAL_COURSE et TRIAL_CHAPTERS sans jamais recopier l'entrée.
export function filterTrialSteps(steps: unknown): TrialStepRef[] {
  if (!Array.isArray(steps)) return [];

  const seen = new Set<string>();
  const kept: TrialStepRef[] = [];

  for (const entry of steps) {
    if (kept.length >= MAX_STEPS) break;
    if (typeof entry !== "object" || entry === null) continue;

    const { course, chapter, stepIndex } = entry as Record<string, unknown>;
    if (course !== TRIAL_COURSE) continue;
    if (typeof chapter !== "string" || !TRIAL_CHAPTER_SET.has(chapter)) continue;
    if (typeof stepIndex !== "number") continue;
    if (!Number.isInteger(stepIndex) || stepIndex < 0) continue;
    // Valeur canonique reprise du périmètre, jamais de l'entrée.
    const canonicalChapter = TRIAL_CHAPTERS[TRIAL_CHAPTERS.indexOf(chapter)];
    const key = `${canonicalChapter}:${stepIndex}`;
    if (seen.has(key)) continue;

    seen.add(key);
    kept.push({ course: TRIAL_COURSE, chapter: canonicalChapter, stepIndex });
  }

  // Dans l'ordre du parcours : le serveur n'accorde une étape qu'après la
  // précédente (lib/step-order.ts), et rien ne garantit l'ordre dans lequel le
  // navigateur remonte les étapes de l'essai.
  return kept.sort(
    (a, b) =>
      TRIAL_CHAPTERS.indexOf(a.chapter) - TRIAL_CHAPTERS.indexOf(b.chapter) ||
      a.stepIndex - b.stepIndex
  );
}

/** Ids de cinématiques atteignables en essai, construits en dur et jamais dérivés de l'entrée. */
const TRIAL_CINEMATIC_IDS: readonly string[] = [
  `${TRIAL_COURSE}:intro`,
  ...TRIAL_CHAPTERS.map((c) => `${TRIAL_COURSE}:chapter:${c}`),
];

export function filterTrialCinematics(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const provided = new Set(ids.filter((v): v is string => typeof v === "string"));
  return TRIAL_CINEMATIC_IDS.filter((id) => provided.has(id));
}
