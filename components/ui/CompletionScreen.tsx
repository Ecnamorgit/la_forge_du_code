"use client";

import Image from "next/image";
import Link from "next/link";
import Sprite from "@/components/ui/Sprite";
import ShareButton from "@/components/ui/ShareButton";
import { BADGE_ICONS } from "@/lib/sprite-config";
import { getConductBadge } from "@/lib/conduct-badges";

interface CompletionScreenProps {
  show: boolean;
  totalXp: number;
  badgeIcon: string;
  badgeLabel: string;
  /** Case dans /sprites/badges.png ; à défaut, `badgeIcon` est affiché. */
  badgeFrame?: number;
  /** Id du badge : s'il est fourni, un bouton de partage génère une carte publique. */
  badgeId?: string;
  /** Libellés des ordres du jour accomplis par cette étape. */
  completedQuests?: string[];
  /** Ids des badges de conduite obtenus par cette étape (catalogue lib/conduct-badges.ts). */
  newConductBadges?: string[];
  /** Message de liaison ponctuel (relais consommé, rupture). */
  notice?: string | null;
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
  completedQuests,
  newConductBadges,
  notice,
  onClose,
  href,
}: CompletionScreenProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[rgba(3,6,13,0.97)] animate-overlay-in">
      <div className="max-w-[520px] max-h-[90vh] overflow-y-auto rounded-sm border border-nebula-cyan bg-nebula-bg-panel px-16 py-12 text-center shadow-[0_0_80px_rgba(0,240,255,0.15),0_0_160px_rgba(0,240,255,0.05)] animate-modal-pop-in">
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
        {completedQuests && completedQuests.length > 0 && (
          <div className="mb-4 rounded-sm border border-nebula-green-dim bg-nebula-bg-darkest/60 px-4 py-3 text-left">
            <div className="mb-1 font-tech text-[10px] uppercase tracking-widest text-nebula-green">
              Ordre du jour accompli
            </div>
            {completedQuests.map((label, idx) => (
              <div key={`${idx}-${label}`} className="font-body text-sm text-nebula-text-secondary">
                ✓ {label}
              </div>
            ))}
          </div>
        )}
        {newConductBadges && newConductBadges.length > 0 && (
          <div className="mb-4 rounded-sm border border-nebula-blue-dim bg-nebula-bg-darkest/60 px-4 py-3 text-left">
            <div className="mb-1 font-tech text-[10px] uppercase tracking-widest text-nebula-blue">
              {newConductBadges.length > 1 ? "Badges de conduite obtenus" : "Badge de conduite obtenu"}
            </div>
            {newConductBadges.map((id) => {
              const badge = getConductBadge(id);
              if (!badge) return null;
              return (
                <div key={id} className="font-body text-sm text-nebula-text-secondary">
                  {badge.icon} {badge.label}
                </div>
              );
            })}
          </div>
        )}
        {notice && (
          <p className="mb-4 font-body text-sm text-nebula-orange">{notice}</p>
        )}
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
