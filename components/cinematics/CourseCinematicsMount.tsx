"use client";

import { useEffect, useState } from "react";

import CinematicPlayer from "@/components/cinematics/CinematicPlayer";
import { getCinematic } from "@/lib/cinematics/resolver";
import { cinematicId } from "@/lib/cinematics/types";
import { useCinematicSeen } from "@/lib/cinematics/use-cinematic-seen";

interface CourseCinematicsMountProps {
  course: string;
}

/**
 * Monte les cinématiques de la page cursus : auto-joue l'intro à la première
 * visite (jamais rejouée automatiquement — règle de la spec §5), et offre
 * « Revoir le briefing » en permanence + « Revoir la finale » une fois le
 * cursus terminé (la finale vue prouve la complétion).
 */
export default function CourseCinematicsMount({ course }: CourseCinematicsMountProps) {
  const { loaded, seen, mark } = useCinematicSeen(course);
  const [playing, setPlaying] = useState<"intro" | "finale" | null>(null);
  const [autoChecked, setAutoChecked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle au montage
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const introId = cinematicId(course, { kind: "intro" });
  const finaleId = cinematicId(course, { kind: "finale" });

  // Auto-play de l'intro, une seule décision par montage, jamais si déjà vue.
  useEffect(() => {
    if (!loaded || autoChecked) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- decision d'auto-lecture ponctuelle au montage
    setAutoChecked(true);
    if (!seen.has(introId)) setPlaying("intro");
  }, [loaded, autoChecked, seen, introId]);

  const close = () => {
    if (playing) mark(playing === "intro" ? introId : finaleId);
    setPlaying(null);
  };

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
