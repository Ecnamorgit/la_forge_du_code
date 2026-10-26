import type { Metadata } from "next";
import { getChapterData } from "@/lib/courses-registry";
import { buildChapterTitle } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string; chapter: string }>;
}): Promise<Metadata> {
  const { course, chapter } = await params;
  const data = await getChapterData(course, chapter);

  if (!data) {
    return {
      title: "La Forge du Code — Chapitre introuvable",
    };
  }

  return {
    title: buildChapterTitle(data.title),
    description: data.subtitle,
    alternates: { canonical: `/learn/${course}/${chapter}` },
  };
}

export default function ChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
