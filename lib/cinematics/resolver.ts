/**
 * Cinematic resolution: the course's written arc if it exists, otherwise the
 * generic fallback. Always returns a cinematic.
 */

import { HTML_CINEMATICS } from "@/data/courses/html/cinematics";
import { genericChapterOutro, genericFinale, genericIntro } from "./generic";
import type { Cinematic, CinematicMoment, CourseCinematics } from "./types";

/**
 * Written arcs per course. To add an arc: one entry here and a file
 * `data/courses/<slug>/cinematics.ts`.
 */
const ARCS: Record<string, CourseCinematics> = {
  html: HTML_CINEMATICS,
};

export function getCinematic(course: string, moment: CinematicMoment): Cinematic {
  const arc = ARCS[course];
  if (arc) {
    if (moment.kind === "intro") return arc.courseIntro;
    if (moment.kind === "finale") return arc.courseFinale;
    const outro = arc.chapterOutros[moment.chapter];
    if (outro) return outro;
  }
  if (moment.kind === "intro") return genericIntro(course);
  if (moment.kind === "finale") return genericFinale(course);
  return genericChapterOutro(course, moment.chapter);
}
