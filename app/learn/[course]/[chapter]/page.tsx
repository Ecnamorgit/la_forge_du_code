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

  // Défense en profondeur (constat SRV-10) : le proxy renvoie déjà vers la
  // connexion, mais une page qui ne se garde pas elle-même servirait son
  // contenu au premier contournement du proxy. Même règle que lui : sans
  // session, seuls les chapitres d'essai sont ouverts.
  const chemin = `/learn/${course}/${chapter}`;
  if (!isPublicRoute(chemin)) {
    const session = await auth();
    if (!session?.user?.id) redirect(`/login?from=${encodeURIComponent(chemin)}`);
  }

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
