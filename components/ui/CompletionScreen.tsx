"use client";

import Image from "next/image";
import Link from "next/link";
import Sprite from "@/components/ui/Sprite";
import ShareButton from "@/components/ui/ShareButton";
import { BADGE_ICONS } from "@/lib/sprite-config";

interface CompletionScreenProps {
  show: boolean;
  totalXp: number;
  badgeIcon: string;
  badgeLabel: string;
  /** Optional frame in /sprites/badges.png. Falls back to badgeIcon emoji. */
  badgeFrame?: number;
  /** Badge id — when set, a share button generates a public success card. */
  badgeId?: string;
  onClose?: () => void;
  href?: string;
}

export default function CompletionScreen({
  show,
  totalXp,
  badgeIcon,
  badgeLabel,
  badgeFrame,
  badgeId,
  onClose,
  href,
}: CompletionScreenProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[rgba(3,6,13,0.97)] animate-overlay-in">
      <div className="max-w-[520px] rounded-sm border border-nebula-cyan bg-nebula-bg-panel px-16 py-12 text-center shadow-[0_0_80px_rgba(0,240,255,0.15),0_0_160px_rgba(0,240,255,0.05)] animate-modal-pop-in">
        <span className="mb-5 block text-7xl animate-orbit-spin">🛸</span>
        <div className="mb-3.5 font-tech text-xl leading-relaxed tracking-widest text-nebula-cyan [text-shadow:0_0_30px_rgba(0,240,255,0.4)]">
          MISSION
          <br />
          COMPLÉTÉE
        </div>
        <div className="mb-6 font-body text-lg leading-relaxed text-nebula-text-secondary">
          Félicitations, Ingénieur. Les protocoles sont opérationnels et la base est sécurisée.
        </div>
        <div className="mb-4 font-tech text-base tracking-wider text-nebula-green">
          ⚡ XP TOTAL : {totalXp} XP
        </div>
        <div className="mb-7 inline-flex items-center gap-2 rounded-sm border border-nebula-blue bg-nebula-bg-dark px-4 py-2 font-tech text-xs tracking-wider text-nebula-blue">
          {badgeFrame !== undefined ? (
            <Sprite sheet={BADGE_ICONS} frame={badgeFrame} displaySize={20} title={badgeLabel} />
          ) : badgeIcon.startsWith("/") ? (
            <Image src={badgeIcon} alt="Badge" width={20} height={20} className="h-5 w-5 object-contain" />
          ) : (
            <span>{badgeIcon}</span>
          )}
          BADGE : {badgeLabel}
        </div>
        {badgeId && (
          <div className="mb-6 flex justify-center">
            <ShareButton badgeId={badgeId} badgeLabel={badgeLabel} xp={totalXp} />
          </div>
        )}
        <br />
        {href ? (
          <Link
            href={href}
            className="inline-block rounded-sm bg-nebula-cyan px-8 py-3 font-tech text-sm font-bold uppercase tracking-widest text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all hover:translate-y-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none"
          >
            CONTINUER →
          </Link>
        ) : (
          <button
            onClick={onClose}
            className="relative rounded-sm border-none bg-nebula-cyan px-5 py-2 font-tech text-xs uppercase tracking-widest text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] hover:top-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:top-1 active:shadow-none"
          >
            CONTINUER →
          </button>
        )}
      </div>
    </div>
  );
}
