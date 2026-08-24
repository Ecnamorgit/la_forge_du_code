/**
 * Filtrage des étapes remontées par le mode essai.
 *
 * Le serveur ne doit accorder que ce que le visiteur pouvait déjà atteindre
 * sans compte : sans ce filtre, /api/me/trial-import deviendrait un
 * « valide-moi tout le cursus » en un appel.
 */

import { TRIAL_CHAPTERS, TRIAL_COURSE } from "./public-routes";
import type { TrialStepRef } from "./trial-user";

/** Borne défensive : le chapitre d'essai n'a qu'une poignée d'étapes. */
const MAX_STEPS = 50;

// Deux protections indépendantes cohabitent ici, et il ne faut retirer
// aucune des deux en pensant que l'autre suffit :
//  1. Les branches de rejet en égalité stricte ci-dessous (le garde-fou
//     principal) : elles éliminent toute entrée qui ne correspond pas
//     exactement au cursus/chapitre d'essai attendu, quelle que soit sa forme
//     (objet piégé, prototype pollué, tableau, etc.).
//  2. La défense en profondeur : l'objet renvoyé par ce filtre construit
//     `course`/`chapter` en dur à partir de TRIAL_COURSE/TRIAL_CHAPTERS, il ne
//     recopie jamais les valeurs fournies par l'appelant. Même si le garde 1
//     avait une faille, aucune valeur arbitraire ne pourrait s'échapper par
//     ce chemin.
export function filterTrialSteps(steps: unknown): TrialStepRef[] {
  if (!Array.isArray(steps)) return [];

  const seen = new Set<number>();
  const kept: TrialStepRef[] = [];

  for (const entry of steps) {
    if (kept.length >= MAX_STEPS) break;
    if (typeof entry !== "object" || entry === null) continue;

    const { course, chapter, stepIndex } = entry as Record<string, unknown>;
    if (course !== TRIAL_COURSE) continue;
    if (chapter !== TRIAL_CHAPTERS[0]) continue;
    if (typeof stepIndex !== "number") continue;
    if (!Number.isInteger(stepIndex) || stepIndex < 0) continue;
    if (seen.has(stepIndex)) continue;

    seen.add(stepIndex);
    kept.push({ course: TRIAL_COURSE, chapter: TRIAL_CHAPTERS[0], stepIndex });
  }

  return kept;
}
