import type { Metadata } from "next";
import { getChapterData } from "@/lib/courses-registry";

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

  const cleanTitle = data.title.replace(/\n/g, " ");
  return {
    title: `La Forge du Code — ${data.tag} : ${cleanTitle}`,
    description: data.subtitle,
  };
}

export default function ChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
