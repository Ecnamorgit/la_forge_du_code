/**
 * Détermination du « dernier chapitre » d'un cursus.
 *
 * Module SERVEUR uniquement : il importe `lib/courses-registry`, qui tire tout
 * le contenu des cursus (plusieurs centaines de Ko). Ne jamais l'importer
 * depuis un composant client — la page serveur calcule la valeur et la passe
 * en prop (cf. app/learn/[course]/[chapter]/page.tsx).
 */

import { getCourseStatus } from "@/lib/courses-catalog";
import { listChapterSlugs } from "@/lib/courses-registry";

/**
 * Le chapitre est-il le dernier du cursus (→ finale au lieu d'outro) ?
 *
 * Toujours faux sur un cursus « preview » (pilote) : ses chapitres implémentés
 * ne couvrent pas le cursus annoncé, on ne déclenche donc pas la finale de
 * cursus après le seul chapitre disponible.
 */
export function isLastChapter(course: string, chapterSlug: string): boolean {
  if (getCourseStatus(course) === "preview") return false;
  const slugs = listChapterSlugs(course);
  return slugs.length > 0 && slugs[slugs.length - 1] === chapterSlug;
}
