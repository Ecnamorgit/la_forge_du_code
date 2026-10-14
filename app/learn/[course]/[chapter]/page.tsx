import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getChapterData } from "@/lib/courses-registry";
import { isLastChapter } from "@/lib/cinematics/last-chapter";
import { isPublicRoute } from "@/lib/public-routes";
import ChapterClient from "./ChapterClient";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ course: string; chapter: string }>;
}) {
  const { course, chapter } = await params;

  // Défense en profondeur si le proxy est contourné (audit SRV-10). Même règle
  // que lui : sans session, seuls les chapitres d'essai sont ouverts.
  const chapterPath = `/learn/${course}/${chapter}`;
  if (!isPublicRoute(chapterPath)) {
    const session = await auth();
    if (!session?.user?.id) redirect(`/login?from=${encodeURIComponent(chapterPath)}`);
  }

  const chapterData = await getChapterData(course, chapter);

  if (!chapterData) {
    notFound();
  }

  return (
    <ChapterClient
      course={course}
      chapter={chapterData}
      // Calculé côté serveur : `isLastChapter` charge tout le registre des
      // cursus, inutile dans le bundle client.
      isLastChapter={isLastChapter(course, chapterData.slug)}
    />
  );
}
