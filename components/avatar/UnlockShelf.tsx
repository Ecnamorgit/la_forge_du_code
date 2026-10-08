"use client";

import { evaluateUnlocks, type UnlockAxis, type UnlockContext } from "@/lib/unlocks";
import { EMBLEM_OPTIONS } from "@/lib/emblems";
import Sprite from "@/components/ui/Sprite";
import { BADGE_ICONS, SPRITE_SHEETS_READY } from "@/lib/sprite-config";

const TITRES: Record<UnlockAxis, string> = {
  frame: "Cadres",
  title: "Titres",
  uniform: "Uniformes",
  cardBg: "Fonds de carte",
};

interface UnlockShelfProps {
  axis: UnlockAxis;
  ctx: UnlockContext;
  /** Id porté actuellement. */
  selected: string | null;
  onSelect: (id: string) => void;
}

/**
 * Rayon d'objets déblocables pour un axe. Les objets non obtenus restent
 * visibles, grisés, avec leur condition et la distance restante. Un objet
 * obtenu ne redevient jamais verrouillé : `ctx.owned` (`UserState.unlocks`)
 * le garantit même quand le streak retombe.
 */
export default function UnlockShelf({ axis, ctx, selected, onSelect }: UnlockShelfProps) {
  const objets = evaluateUnlocks(ctx).filter((u) => u.def.axis === axis);

  return (
    <section className="mb-8">
      <h3 className="mb-3 font-tech text-sm uppercase tracking-widest text-nebula-cyan">
        {TITRES[axis]}
      </h3>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {objets.map(({ def, unlocked, remaining }) => (
          <button
            key={def.id}
            type="button"
            disabled={!unlocked}
            onClick={() => onSelect(def.id)}
            aria-pressed={selected === def.id}
            className={`rounded-sm border px-3 py-2.5 text-left transition-all ${
              !unlocked
                ? "cursor-not-allowed border-nebula-border/50 bg-nebula-bg-darkest/40 opacity-60"
                : selected === def.id
                  ? "border-nebula-cyan bg-nebula-cyan-faint"
                  : "border-nebula-border hover:border-nebula-cyan-dim"
            }`}
          >
            <div className="font-tech text-xs uppercase tracking-wider text-nebula-text">
              {unlocked ? def.label : `🔒 ${def.label}`}
            </div>
            {!unlocked && remaining && (
              <div className="mt-0.5 font-tech text-[10px] tracking-wider text-nebula-orange">
                {remaining}
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

interface EmblemShelfProps {
  /** Ids des badges possédés (cursus + conduite confondus). */
  badges: string[];
  selected: string | null;
  onSelect: (id: string) => void;
}

/**
 * L'axe emblème n'est pas dans le catalogue des déblocables : il se choisit
 * parmi les badges obtenus. Les badges non obtenus restent visibles, grisés,
 * avec leur description en guise de condition.
 */
export function EmblemShelf({ badges, selected, onSelect }: EmblemShelfProps) {
  return (
    <section className="mb-8">
      <h3 className="mb-3 font-tech text-sm uppercase tracking-widest text-nebula-cyan">
        Emblèmes
      </h3>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {EMBLEM_OPTIONS.map((opt) => {
          const unlocked = badges.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!unlocked}
              onClick={() => onSelect(opt.id)}
              aria-pressed={selected === opt.id}
              className={`flex items-center gap-2.5 rounded-sm border px-3 py-2.5 text-left transition-all ${
                !unlocked
                  ? "cursor-not-allowed border-nebula-border/50 bg-nebula-bg-darkest/40 opacity-60"
                  : selected === opt.id
                    ? "border-nebula-cyan bg-nebula-cyan-faint"
                    : "border-nebula-border hover:border-nebula-cyan-dim"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-nebula-border/60 bg-nebula-bg-darkest text-base ${
                  unlocked ? "" : "opacity-50 grayscale"
                }`}
              >
                {opt.frame !== null && SPRITE_SHEETS_READY.badges ? (
                  <Sprite sheet={BADGE_ICONS} frame={opt.frame} displaySize={24} title={opt.label} />
                ) : (
                  <span>{opt.icon}</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-tech text-xs uppercase tracking-wider text-nebula-text">
                  {unlocked ? opt.label : `🔒 ${opt.label}`}
                </span>
                <span
                  className={`block truncate text-[10px] tracking-wider ${
                    unlocked ? "text-nebula-text-dim" : "text-nebula-orange"
                  }`}
                >
                  {opt.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
