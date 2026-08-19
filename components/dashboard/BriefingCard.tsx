"use client";

import Link from "next/link";
import Image from "next/image";
import type { Briefing } from "@/lib/quests";
import QuestLine from "./QuestLine";

interface BriefingCardProps {
  briefing: Briefing | null;
  courseTitle: string;
  courseProgress: number;
  /** Lien vers l'étape suivante du cursus actif. */
  resumeHref: string;
  resumeLabel: string;
  /** Construit le lien d'un ordre à partir du cursus qu'il vise. */
  hrefForQuest: (course: string | null, chapter: string | null) => string;
}

export default function BriefingCard({
  briefing,
  courseTitle,
  courseProgress,
  resumeHref,
  resumeLabel,
  hrefForQuest,
}: BriefingCardProps) {
  const effort = briefing?.quests.find((q) => q.slot === "effort") ?? null;
  const autres = briefing?.quests.filter((q) => q.slot !== "effort") ?? [];
  const termine = briefing?.complete ?? false;

  return (
    <article className="relative overflow-hidden rounded-sm border border-nebula-cyan/40 bg-nebula-bg-panel/85 p-5 backdrop-blur-md shadow-[0_0_40px_rgba(0,240,255,0.08)] lg:p-7">
      <div className="pointer-events-none absolute -right-12 -top-12 opacity-25">
        <Image
          src="/planet-green-v2.png"
          alt=""
          width={200}
          height={200}
          className="animate-planet-rotate"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      <div className="relative">
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
            <span>Progression du cursus</span>
            <span className="text-nebula-cyan">{courseProgress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full border border-nebula-border bg-nebula-bg-editor/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-nebula-cyan to-nebula-green shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all duration-700"
              style={{ width: `${courseProgress}%` }}
            />
          </div>
        </div>

        <div className="mb-2 font-tech text-xs uppercase tracking-[0.22em] text-nebula-text-dim">
          {termine ? "BRIEFING COMPLET" : "ORDRE DU JOUR"}
        </div>

        {termine ? (
          <>
            <h3 className="mb-3 font-tech text-3xl uppercase tracking-wider text-nebula-green">
              Mission du jour accomplie
            </h3>
            <p className="mb-7 font-body text-base leading-relaxed text-nebula-text-secondary">
              Tous les ordres sont validés, Cadet. Rien ne t&apos;empêche de continuer.
            </p>
          </>
        ) : (
          <>
            <h3 className="mb-3 font-tech text-3xl uppercase tracking-wider text-nebula-cyan [text-shadow:0_0_18px_rgba(0,240,255,0.3)]">
              {effort ? effort.label : courseTitle}
            </h3>
            {effort && (
              <p className="mb-5 font-body text-sm text-nebula-text-dim">
                {effort.progress} / {effort.target} · +{effort.xp} XP
              </p>
            )}
          </>
        )}

        <Link
          href={effort && !effort.done ? hrefForQuest(effort.course, effort.chapter) : resumeHref}
          className="inline-block rounded-sm bg-nebula-cyan px-7 py-3 font-tech text-base font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all hover:translate-y-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none"
        >
          {"> "}
          {resumeLabel}
          <span className="terminal-cursor">_</span>
        </Link>

        {autres.length > 0 && (
          <div className="mt-6 space-y-2.5">
            {autres.map((q) => (
              <QuestLine key={q.id} quest={q} href={hrefForQuest(q.course, q.chapter)} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
