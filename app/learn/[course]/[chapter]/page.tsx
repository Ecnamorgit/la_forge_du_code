"use client";

import { chapitre1 } from "@/data/courses/html/chapitre-1";
import ChapterClient from "./ChapterClient";

export default function ChapterPage() {
  return <ChapterClient chapter={chapitre1} />;
}
