import { notFound } from "next/navigation";
import { getChapterData } from "@/lib/courses-registry";
import { isLastChapter } from "@/lib/cinematics/last-chapter";
import ChapterClient from "./ChapterClient";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ course: string; chapter: string }>;
}) {
  const { course, chapter } = await params;
  const chapterData = await getChapterData(course, chapter);

  if (!chapterData) {
    notFound();
  }

  return (
    <ChapterClient
      course={course}
      chapter={chapterData}
      // Calculé ici : `isLastChapter` tire le registre complet des cursus,
      // qui n'a rien à faire dans le bundle client.
      isLastChapter={isLastChapter(course, chapterData.slug)}
    />
  );
}
