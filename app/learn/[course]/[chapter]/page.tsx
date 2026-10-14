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

  // Defense in depth if the proxy is bypassed (audit SRV-10). Same rule as
  // the proxy: without a session, only the trial chapters are open.
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
      // Computed server-side: `isLastChapter` loads the whole course
      // registry, which the client bundle does not need.
      isLastChapter={isLastChapter(course, chapterData.slug)}
    />
  );
}
