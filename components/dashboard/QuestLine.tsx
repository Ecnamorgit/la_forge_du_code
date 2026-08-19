"use client";

import Link from "next/link";
import type { Quest } from "@/lib/quests";

/** Un ordre compact : libellé, barre de progression, lien vers l'endroit visé. */
export default function QuestLine({ quest, href }: { quest: Quest; href: string }) {
  const pct = Math.round((quest.progress / quest.target) * 100);
  return (
    <div className="rounded-sm border border-nebula-border/70 bg-nebula-bg-darkest/50 px-4 py-3">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span
          className={`font-tech text-xs uppercase tracking-wider ${
            quest.done ? "text-nebula-green" : "text-nebula-text-secondary"
          }`}
        >
          {quest.done ? "✓ " : "› "}
          {quest.label}
        </span>
        <span className="shrink-0 font-tech text-[11px] tracking-wider text-nebula-text-dim">
          +{quest.xp} XP
        </span>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-nebula-bg-editor/80">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            quest.done ? "bg-nebula-green" : "bg-nebula-cyan"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-tech text-[10px] uppercase tracking-widest text-nebula-text-dim">
          {quest.progress} / {quest.target}
        </span>
        {!quest.done && (
          <Link
            href={href}
            className="font-tech text-[10px] uppercase tracking-widest text-nebula-cyan hover:underline"
          >
            Y aller →
          </Link>
        )}
      </div>
    </div>
  );
}
