/**
 * Filtering of the steps sent up by trial mode.
 *
 * The server must only grant what the visitor could already reach without an
 * account: without this filter, /api/me/trial-import would become a
 * "complete the whole course for me" in a single call.
 */

import { TRIAL_CHAPTERS, TRIAL_COURSE } from "./public-routes";
import type { TrialStepRef } from "./trial-user";

/** Defensive cap: the trial chapters only have a handful of steps. */
const MAX_STEPS = 50;

const TRIAL_CHAPTER_SET = new Set(TRIAL_CHAPTERS);

// Two independent protections, keep both: the strict-equality rejections
// discard any entry outside the trial scope, whatever its shape, and the
// returned object rebuilds `course` and `chapter` from TRIAL_COURSE and
// TRIAL_CHAPTERS without ever copying the entry.
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
    // Canonical value taken from the scope, never from the entry.
    const canonicalChapter = TRIAL_CHAPTERS[TRIAL_CHAPTERS.indexOf(chapter)];
    const key = `${canonicalChapter}:${stepIndex}`;
    if (seen.has(key)) continue;

    seen.add(key);
    kept.push({ course: TRIAL_COURSE, chapter: canonicalChapter, stepIndex });
  }

  // In journey order: the server only grants a step after the previous one
  // (lib/step-order.ts), and nothing guarantees the order in which the
  // browser sends up the trial steps.
  return kept.sort(
    (a, b) =>
      TRIAL_CHAPTERS.indexOf(a.chapter) - TRIAL_CHAPTERS.indexOf(b.chapter) ||
      a.stepIndex - b.stepIndex
  );
}

/** Cutscene ids reachable in the trial, hard-coded and never derived from the input. */
const TRIAL_CINEMATIC_IDS: readonly string[] = [
  `${TRIAL_COURSE}:intro`,
  ...TRIAL_CHAPTERS.map((c) => `${TRIAL_COURSE}:chapter:${c}`),
];

export function filterTrialCinematics(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const provided = new Set(ids.filter((v): v is string => typeof v === "string"));
  return TRIAL_CINEMATIC_IDS.filter((id) => provided.has(id));
}
