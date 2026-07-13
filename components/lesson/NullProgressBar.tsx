"use client";

import { useUser } from "@/lib/use-user";
import { getCourseProgress } from "@/lib/user-store";
import { nullProgressLabel } from "@/lib/null-progress";

interface NullProgressBarProps {
  course: string;
  /** Chapitres jouables du cursus (slug + nombre d'étapes), pour le calcul. */
  chapters: { slug: string; totalSteps: number }[];
}

/**
 * Jauge « recul du Null » d'un cursus : la corruption (violet) est repoussée
 * par un remplissage cyan→vert à mesure des étapes validées. Progression lue
 * via getCourseProgress ; rendu stable (0 %) tant que le store n'est pas hydraté.
 */
export default function NullProgressBar({ course, chapters }: NullProgressBarProps) {
  const { state, hydrated } = useUser();
  const pct = hydrated ? getCourseProgress(state, course, chapters) : 0;
  const { title, tone } = nullProgressLabel(pct);
  const isPurged = tone === "purged";

  return (
    <div aria-label={`Recul du Null : ${pct}% du secteur purgé`}>
      <div className="mb-1 flex items-center justify-between">
        <span
          className={`font-tech text-[10px] uppercase tracking-[0.3em] ${
            isPurged ? "text-nebula-green" : "text-nebula-text-secondary"
          }`}
        >
          {title}
        </span>
        <span className="font-tech text-[10px] tracking-widest text-nebula-text-dim">
          {pct}%
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-sm bg-nebula-spectre/25">
        <div
          className="absolute inset-y-0 left-0 rounded-sm bg-gradient-to-r from-nebula-cyan to-nebula-green transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
