"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CHARACTERS } from "@/lib/characters";
import {
  CINEMATIC_SCENE_DURATION_MS,
  type Cinematic,
  type CinematicScene,
} from "@/lib/cinematics/types";
import { typewriterSlice } from "@/lib/cinematics/typewriter";
import { playDeployBip, playFanfare } from "@/lib/audio";
import { useModalOverlay } from "@/lib/use-modal-overlay";

interface CinematicPlayerProps {
  cinematic: Cinematic;
  /** Quand false, rien n'est rendu. */
  open: boolean;
  /** Appelé à la fermeture — fin naturelle, « Passer », ou Échap. */
  onClose: () => void;
  /** En reduced-motion : texte affiché d'un bloc, pas d'auto-défilement ni d'effets. */
  reducedMotion?: boolean;
  /** Libellé du bouton final (défaut : "Continuer ->"). */
  finalCtaLabel?: string;
}

/** Libellé et glyphe du locuteur ("system" n'est pas dans CHARACTERS). */
function speakerLabel(scene: CinematicScene): { glyph: string; name: string; title: string } {
  if (scene.speaker === "system") {
    return { glyph: "🛰️", name: "SYSTÈME", title: "Station Nebula" };
  }
  const c = CHARACTERS[scene.speaker];
  return { glyph: c.glyph, name: c.name, title: c.title };
}

/** Classes du panneau visuel par variante (fond composé en CSS, pas d'asset). */
const VISUAL_CLASSES: Record<CinematicScene["visual"], string> = {
  briefing: "border-nebula-cyan/40 shadow-[0_0_30px_rgba(0,240,255,0.25)]",
  station: "border-nebula-cyan/40 shadow-[0_0_30px_rgba(0,240,255,0.25)]",
  spectre: "border-red-500/50 shadow-[0_0_30px_rgba(255,40,60,0.3)]",
  victory: "border-amber-400/50 shadow-[0_0_30px_rgba(255,200,60,0.3)]",
};

const FX_CLASSES: Record<NonNullable<CinematicScene["fx"]>, string> = {
  none: "",
  alert: "animate-pulse bg-red-500/10",
  glitch: "bg-red-900/10",
  victory: "bg-amber-400/10",
};

export default function CinematicPlayer({
  cinematic,
  open,
  onClose,
  reducedMotion = false,
  finalCtaLabel = "Continuer ->",
}: CinematicPlayerProps) {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset à chaque ouverture (le composant reste monté entre deux ouvertures —
  // même patron que IntroCinematic).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setIndex(0);
      setElapsed(0);
    }
  }

  const finish = useCallback(() => onClose(), [onClose]);

  // Auto-défilement (désactivé en reduced-motion). `index` en dep, pas
  // d'updater fonctionnel : appeler finish() (setState parent) dans un updater
  // pur déclencherait « Cannot update a component while rendering… ».
  useEffect(() => {
    if (!open || reducedMotion) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (index >= cinematic.scenes.length - 1) finish();
      else {
        setIndex(index + 1);
        setElapsed(0);
      }
    }, CINEMATIC_SCENE_DURATION_MS);
    return () => clearTimeout(timerRef.current);
  }, [open, index, reducedMotion, finish, cinematic.scenes.length]);

  // Horloge de la machine à écrire (60 ms ≈ fluide sans surcoût).
  useEffect(() => {
    if (!open || reducedMotion) return;
    clearInterval(tickRef.current);
    tickRef.current = setInterval(() => setElapsed((e) => e + 60), 60);
    return () => clearInterval(tickRef.current);
  }, [open, index, reducedMotion]);

  // Cue sonore par scène — no-op tant que le son global n'est pas activé
  // (lib/audio est gardé par setSoundEnabled, déjà piloté ailleurs).
  useEffect(() => {
    if (!open) return;
    if (index === cinematic.scenes.length - 1) playFanfare();
    else playDeployBip();
  }, [open, index, cinematic.scenes.length]);

  useModalOverlay(dialogRef, { open, onClose: finish });

  if (!open) return null;

  const scene = cinematic.scenes[index];
  const isLast = index === cinematic.scenes.length - 1;
  const speaker = speakerLabel(scene);
  const shownText = reducedMotion ? scene.narration : typewriterSlice(scene.narration, elapsed);

  const goNext = () => {
    if (isLast) finish();
    else {
      setIndex(index + 1);
      setElapsed(0);
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Cinématique de mission"
      tabIndex={-1}
      data-testid="cinematic-player"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-nebula-bg-darkest outline-none"
    >
      {/* Passer : toujours visible (règle de la spec). */}
      <button
        onClick={finish}
        data-testid="cinematic-skip"
        className="absolute right-4 top-4 z-30 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
      >
        Passer ✕
      </button>

      <div className="pointer-events-none absolute inset-0 bg-nebula-stars opacity-50" />
      {scene.fx && scene.fx !== "none" && !reducedMotion && (
        <div className={`pointer-events-none absolute inset-0 ${FX_CLASSES[scene.fx]}`} />
      )}

      {/* Panneau visuel de la scène. */}
      <div
        key={reducedMotion ? "static" : index}
        className={`relative my-2 flex min-h-[160px] w-full max-w-2xl items-center justify-center rounded-md border px-4 py-10 ${
          VISUAL_CLASSES[scene.visual]
        } ${reducedMotion ? "" : "animate-intro-scene-in"}`}
      >
        <span aria-hidden className="text-6xl">{speaker.glyph}</span>
      </div>

      {/* Locuteur + narration. */}
      <p className="mt-4 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
        {speaker.glyph} {speaker.name} — {speaker.title}
      </p>
      <p
        aria-live="polite"
        className="mt-2 min-h-[4rem] max-w-xl px-6 text-center font-tech text-lg tracking-wide text-nebula-cyan sm:text-xl"
      >
        {/* Le texte complet reste dans le DOM pour les lecteurs d'écran. */}
        <span className="sr-only">{scene.narration}</span>
        <span aria-hidden>{shownText}</span>
      </p>

      <div className="mt-4 flex items-center justify-center gap-4 z-20">
        <button
          onClick={goNext}
          className="rounded-sm bg-nebula-cyan px-5 py-2 font-tech text-xs font-bold uppercase tracking-widest text-nebula-bg-darkest transition-all hover:brightness-110"
        >
          {isLast ? finalCtaLabel : "Suivant →"}
        </button>
      </div>

      <div className="mt-6 flex gap-2 z-20">
        {cinematic.scenes.map((s, i) => (
          <span
            key={s.id}
            className={`h-2.5 w-2.5 rounded-full ${
              i === index ? "bg-nebula-cyan scale-125" : "bg-nebula-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
