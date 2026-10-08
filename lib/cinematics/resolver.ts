/**
 * Résolution d'une cinématique : arc écrit du cursus s'il existe, sinon repli
 * générique. Renvoie toujours une cinématique.
 */

import { HTML_CINEMATICS } from "@/data/courses/html/cinematics";
import { genericChapterOutro, genericFinale, genericIntro } from "./generic";
import type { Cinematic, CinematicMoment, CourseCinematics } from "./types";

/**
 * Arcs écrits par cursus. Ajouter un arc : une entrée ici et un fichier
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
