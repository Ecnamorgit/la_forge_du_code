/**
 * Server-only module: `lib/courses-registry` loads the full content of every
 * course (several hundred KB). The server page computes the value and
 * passes it as a prop (see `app/(platform)/learn/[course]/[chapter]/page.tsx`).
 */

import { getCourseStatus } from "@/lib/courses-catalog";
import { listChapterSlugs } from "@/lib/courses-registry";

/**
 * True if the chapter is the last one of the course (finale instead of outro).
 * Always false for a pilot course (`preview`): its chapters do not cover
 * the announced course.
 */
export function isLastChapter(course: string, chapterSlug: string): boolean {
  if (getCourseStatus(course) === "preview") return false;
  const slugs = listChapterSlugs(course);
  return slugs.length > 0 && slugs[slugs.length - 1] === chapterSlug;
}
