/**
 * Module serveur uniquement : `lib/courses-registry` charge tout le contenu des
 * cursus (plusieurs centaines de Ko). La page serveur calcule la valeur et la
 * passe en prop (voir `app/learn/[course]/[chapter]/page.tsx`).
 */

import { getCourseStatus } from "@/lib/courses-catalog";
import { listChapterSlugs } from "@/lib/courses-registry";

/**
 * Vrai si le chapitre est le dernier du cursus (finale au lieu d'outro).
 * Toujours faux pour un cursus pilote (`preview`) : ses chapitres ne couvrent
 * pas le cursus annoncé.
 */
export function isLastChapter(course: string, chapterSlug: string): boolean {
  if (getCourseStatus(course) === "preview") return false;
  const slugs = listChapterSlugs(course);
  return slugs.length > 0 && slugs[slugs.length - 1] === chapterSlug;
}
