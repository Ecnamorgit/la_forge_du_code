"use client";

import Link from "next/link";
import Image from "next/image";
import AvatarBadge from "@/components/avatar/AvatarBadge";
import Sprite from "@/components/ui/Sprite";
import { getEmblem } from "@/lib/emblems";
import { BADGE_ICONS, SPRITE_SHEETS_READY } from "@/lib/sprite-config";
import { gradeFromXp, levelFromXp } from "@/lib/grades";
import { cardBgImage, nextUnlock, UNLOCKS, type UnlockContext } from "@/lib/unlocks";

interface CadetCardProps {
  username: string;
  totalXp: number;
  /** Ids of the badges owned (counter and unlockables computation). */
  badges: string[];
  streak: number;
  questsCompleted: number;
  coursesComplete: number;
  chaptersComplete: number;
  /**
   * Ids of the cosmetics owned (`UserState.unlocks`). Without them, the
   * « prochain déblocable » (next unlockable) would re-offer an item earned
   * then lost (liaison tiers are reversible).
   */
  unlocks: string[];
  species: string | null;
  uniformColor: string | null;
  /** Equipped cosmetics, null until the cadet has picked something. */
  frame: string | null;
  title: string | null;
  emblem: string | null;
  /** Equipped card background; the catalog declares a default one. */
  cardBg: string | null;
}

/**
 * Pure-CSS frame rings (see lib/unlocks.ts). `standard`, the default,
 * adds nothing: the medallion keeps its ring in the uniform's color.
 */
const FRAME_RING: Partial<Record<string, string>> = {
  double: "outline outline-2 outline-offset-2 outline-nebula-cyan/50",
  pulse: "animate-pulse",
  orbital: "border-2 border-dashed border-nebula-cyan/70 animate-planet-rotate",
  hex: "border-2 border-nebula-blue/70 [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0%_50%)]",
  corrompu: "border-2 border-nebula-red/70",
  "frame-amiral": "border-2 border-nebula-orange shadow-[0_0_24px_rgba(255,107,44,0.45)]",
};

export default function CadetCard({
  username,
  totalXp,
  badges,
  streak,
  questsCompleted,
  coursesComplete,
  chaptersComplete,
  unlocks,
  species,
  uniformColor,
  frame,
  title,
  emblem,
  cardBg,
}: CadetCardProps) {
  const level = levelFromXp(totalXp);
  const rank = gradeFromXp(totalXp).label;

  const unlockCtx: UnlockContext = {
    streak,
    questsCompleted,
    totalXp,
    badges,
    coursesComplete,
    chaptersComplete,
    owned: unlocks,
  };
  const nextItem = nextUnlock(unlockCtx);

  const titleLabel = title
    ? (UNLOCKS.find((u) => u.id === title && u.axis === "title")?.label ?? null)
    : null;
  const emblemBadge = getEmblem(emblem);
  const frameClass = frame ? (FRAME_RING[frame] ?? "") : "";

  return (
    <aside className="relative overflow-hidden rounded-sm border border-nebula-border/80 bg-nebula-bg-panel/85 p-6 shadow-[0_0_30px_rgba(0,240,255,0.06)] backdrop-blur-md">
      {/* Unlocked card background, purely decorative. */}
      <Image
        src={cardBgImage(cardBg)}
        alt=""
        aria-hidden="true"
        fill
        sizes="320px"
        className="pointer-events-none select-none object-cover opacity-20"
        style={{ imageRendering: "pixelated" }}
      />

      <div className="relative">
        {/* Avatar and name */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className={`inline-flex rounded-full ${frameClass}`}>
              <AvatarBadge
                species={species}
                uniformColor={uniformColor}
                size={80}
                fallbackChar={username.slice(0, 1).toUpperCase()}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-sm border border-nebula-orange bg-nebula-bg-darkest px-1.5 py-0.5 font-tech text-[10px] uppercase tracking-widest text-nebula-orange">
              LV {level}
            </div>
            {emblemBadge && (
              <div
                className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-nebula-cyan bg-nebula-bg-darkest text-sm"
                title={emblemBadge.label}
              >
                {emblemBadge.frame !== null && SPRITE_SHEETS_READY.badges ? (
                  <Sprite
                    sheet={BADGE_ICONS}
                    frame={emblemBadge.frame}
                    displaySize={16}
                    title={emblemBadge.label}
                  />
                ) : (
                  <span>{emblemBadge.icon}</span>
                )}
              </div>
            )}
          </div>
          <div className="font-tech text-lg tracking-wider text-nebula-cyan">
            @{username}
          </div>
          {titleLabel && (
            <div className="mt-0.5 font-tech text-[11px] uppercase tracking-widest text-nebula-text-secondary">
              {titleLabel}
            </div>
          )}
          <Link
            href="/profil"
            className="mt-1 font-tech text-[11px] uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
          >
            Modifier
          </Link>
        </div>

        {/* Stats in a 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Total XP" value={totalXp} accent="cyan" />
          <Stat label="Rang" value={rank} accent="orange" />
          <Stat label="Badges" value={badges.length} accent="blue" />
          {/* « Liaison » rather than « Streak »: it is the term used by the
              banner, the armory and the unlockables. */}
          <Stat label="Liaison" value={`${streak}j`} accent="green" />
        </div>

        {/* Next unlockable */}
        {nextItem && (
          <div className="mt-4 rounded-sm border border-nebula-orange/40 bg-nebula-bg-darkest/50 px-3 py-2.5">
            <div className="font-tech text-[10px] uppercase tracking-widest text-nebula-text-dim">
              Prochain déblocable
            </div>
            <div className="font-tech text-sm text-nebula-orange">{nextItem.def.label}</div>
            <div className="font-tech text-[10px] tracking-wider text-nebula-text-secondary">
              {nextItem.remaining}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href="/profil"
          className="mt-6 block rounded-sm border border-nebula-cyan-dim bg-transparent px-4 py-2.5 text-center font-tech text-xs uppercase tracking-widest text-nebula-cyan transition-all hover:border-nebula-cyan hover:bg-nebula-cyan-faint"
        >
          Voir le profil →
        </Link>
      </div>
    </aside>
  );
}

const ACCENTS: Record<string, { border: string; text: string }> = {
  cyan: { border: "border-nebula-cyan/40", text: "text-nebula-cyan" },
  orange: { border: "border-nebula-orange/40", text: "text-nebula-orange" },
  blue: { border: "border-nebula-blue/40", text: "text-nebula-blue" },
  green: { border: "border-nebula-green-dim", text: "text-nebula-green" },
};

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: keyof typeof ACCENTS;
}) {
  const a = ACCENTS[accent];
  return (
    <div
      className={`rounded-sm border ${a.border} bg-nebula-bg-darkest/50 px-3 py-2.5`}
    >
      <div className={`font-tech text-xl font-bold ${a.text}`}>{value}</div>
      <div className="font-tech text-[10px] uppercase tracking-widest text-nebula-text-dim">
        {label}
      </div>
    </div>
  );
}
