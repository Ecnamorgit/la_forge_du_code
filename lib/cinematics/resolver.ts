/**
 * Résolution d'une cinématique : arc écrit du cursus si présent (registre),
 * sinon repli générique. Garantit de toujours renvoyer une cinématique —
 * jamais de trou, jamais de crash (spec §6).
 */

import { listChapterSlugs } from "@/lib/courses-registry";
import { genericChapterOutro, genericFinale, genericIntro } from "./generic";
import type { Cinematic, CinematicMoment, CourseCinematics } from "./types";

/**
 * Registre des arcs écrits. La Task 2 y branche l'arc HTML ; ajouter un arc =
 * une entrée ici + un fichier data/courses/<slug>/cinematics.ts.
 */
const ARCS: Record<string, CourseCinematics> = {};

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

/** Le chapitre est-il le dernier du cursus (→ finale au lieu d'outro) ? */
export function isLastChapter(course: string, chapterSlug: string): boolean {
  const slugs = listChapterSlugs(course);
  return slugs.length > 0 && slugs[slugs.length - 1] === chapterSlug;
}
