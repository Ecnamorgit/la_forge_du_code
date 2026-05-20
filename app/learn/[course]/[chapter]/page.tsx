import { notFound } from "next/navigation";
import { getChapterData } from "@/lib/courses-registry";
import ChapterClient from "./ChapterClient";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ course: string; chapter: string }>;
}) {
  const { course, chapter } = await params;
  const chapterData = getChapterData(course, chapter);

  if (!chapterData) {
    notFound();
  }

  return <ChapterClient course={course} chapter={chapterData} />;
}
