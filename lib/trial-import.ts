/**
 * Filtrage des étapes remontées par le mode essai.
 *
 * Le serveur ne doit accorder que ce que le visiteur pouvait déjà atteindre
 * sans compte : sans ce filtre, /api/me/trial-import deviendrait un
 * « valide-moi tout le cursus » en un appel.
 */

import { TRIAL_CHAPTER, TRIAL_COURSE } from "./public-routes";
import type { TrialStepRef } from "./trial-user";

/** Borne défensive : le chapitre d'essai n'a qu'une poignée d'étapes. */
const MAX_STEPS = 50;

export function filterTrialSteps(steps: unknown): TrialStepRef[] {
  if (!Array.isArray(steps)) return [];

  const seen = new Set<number>();
  const kept: TrialStepRef[] = [];

  for (const entry of steps) {
    if (kept.length >= MAX_STEPS) break;
    if (typeof entry !== "object" || entry === null) continue;

    const { course, chapter, stepIndex } = entry as Record<string, unknown>;
    if (course !== TRIAL_COURSE) continue;
    if (chapter !== TRIAL_CHAPTER) continue;
    if (typeof stepIndex !== "number") continue;
    if (!Number.isInteger(stepIndex) || stepIndex < 0) continue;
    if (seen.has(stepIndex)) continue;

    seen.add(stepIndex);
    kept.push({ course: TRIAL_COURSE, chapter: TRIAL_CHAPTER, stepIndex });
  }

  return kept;
}
