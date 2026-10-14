"use client";

import { useUser } from "@/lib/use-user";
import { getCourseProgress } from "@/lib/user-store";
import { nullProgressLabel, nullProgressAriaLabel } from "@/lib/null-progress";

interface NullProgressBarProps {
  course: string;
  /** The course's playable chapters (slug + step count), for the computation. */
  chapters: { slug: string; totalSteps: number }[];
}

/**
 * A course's « recul du Spectre » (Spectre retreat) gauge: the corruption
 * (purple) is pushed back by a cyan→green fill as steps are completed. Progress
 * is read via getCourseProgress; stable render (0%) until the store is hydrated.
 */
export default function NullProgressBar({ course, chapters }: NullProgressBarProps) {
  const { state, hydrated } = useUser();
  const pct = hydrated ? getCourseProgress(state, course, chapters) : 0;
  const { title, tone } = nullProgressLabel(pct);
  const isPurged = tone === "purged";

  return (
    <div aria-label={nullProgressAriaLabel(pct)}>
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
