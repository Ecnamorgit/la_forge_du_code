"use client";

import { useCallback, useEffect, useState } from "react";

import CinematicPlayer from "@/components/cinematics/CinematicPlayer";
import { getCinematic } from "@/lib/cinematics/resolver";
import { cinematicId } from "@/lib/cinematics/types";
import {
  useCinematicSeen,
  type CinematicSeenMode,
} from "@/lib/cinematics/use-cinematic-seen";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

interface CourseCinematicsMountProps {
  course: string;
  seenMode?: CinematicSeenMode;
}

/**
 * Monte les cinématiques de la page cursus : auto-joue l'intro à la première
 * visite (jamais rejouée automatiquement — règle de la spec §5), et offre
 * « Revoir le briefing » en permanence + « Revoir la finale » une fois le
 * cursus terminé (la finale vue prouve la complétion).
 */
export default function CourseCinematicsMount({
  course,
  seenMode = "server",
}: CourseCinematicsMountProps) {
  const { loaded, seen, mark } = useCinematicSeen(course, seenMode);
  const [playing, setPlaying] = useState<"intro" | "finale" | null>(null);
  const [autoChecked, setAutoChecked] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const introId = cinematicId(course, { kind: "intro" });
  const finaleId = cinematicId(course, { kind: "finale" });

  // Auto-play de l'intro, une seule décision par montage, jamais si déjà vue.
  useEffect(() => {
    if (!loaded || autoChecked) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- decision d'auto-lecture ponctuelle au montage
    setAutoChecked(true);
    if (!seen.has(introId)) setPlaying("intro");
  }, [loaded, autoChecked, seen, introId]);

  // Référence stable : `CinematicPlayer` remet à zéro son minuteur de scène
  // quand `onClose` change d'identité, ce qu'un rendu parent quelconque
  // provoquerait avec une flèche inline.
  const close = useCallback(() => {
    if (playing) mark(playing === "intro" ? introId : finaleId);
    setPlaying(null);
  }, [playing, mark, introId, finaleId]);

  return (
    <>
      <div className="relative z-20 flex justify-end gap-3 px-4 pt-2">
        <button
          onClick={() => setPlaying("intro")}
          data-testid="replay-intro"
          className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
        >
          ▶ Revoir le briefing
        </button>
        {seen.has(finaleId) && (
          <button
            onClick={() => setPlaying("finale")}
            data-testid="replay-finale"
            className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
          >
            ▶ Revoir la finale
          </button>
        )}
      </div>
      <CinematicPlayer
        cinematic={getCinematic(course, playing === "finale" ? { kind: "finale" } : { kind: "intro" })}
        open={playing !== null}
        onClose={close}
        reducedMotion={reducedMotion}
        finalCtaLabel="Lancer la mission ->"
      />
    </>
  );
}
