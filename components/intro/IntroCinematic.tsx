"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import IntroSceneCanvas from "@/components/intro/IntroSceneCanvas";
import {
  INTRO_SCENES,
  INTRO_SCENE_DURATION_MS,
  markIntroSeen,
  type IntroScene,
} from "@/lib/intro";
import {
  setSoundEnabled,
  unlockAudio,
  playDeployBip,
  playFanfare,
} from "@/lib/audio";
import { useModalOverlay } from "@/lib/use-modal-overlay";

interface IntroCinematicProps {
  /** Quand false, rien n'est rendu. */
  open: boolean;
  /** Appelé à la fermeture : bouton « Fermer », fin ou Échap. */
  onClose: () => void;
  /** En reduced-motion : scènes fixes, sans auto-défilement ni animation. */
  reducedMotion?: boolean;
}

/**
 * Rend le visuel d'une scène : mini-cinématique three.js pixelisée par-dessus
 * l'image pixel art (IntroSceneCanvas), ou l'image seule en reduced-motion.
 */
function SceneVisual({
  scene,
  reducedMotion,
}: {
  scene: IntroScene;
  reducedMotion: boolean;
}) {
  const src = `/sprites/intro/scene-${scene.id}.png`;
  return (
    <div className="relative overflow-hidden rounded-md border border-nebula-cyan/40 shadow-[0_0_30px_rgba(0,240,255,0.25)]">
      {reducedMotion ? (
        <Image
          src={src}
          alt={scene.narration}
          width={640}
          height={360}
          priority
          className="h-auto max-h-[300px] w-full max-w-[560px] object-cover sm:max-h-[360px]"
          style={{ imageRendering: "pixelated" }}
        />
      ) : (
        <IntroSceneCanvas sceneId={scene.id} src={src} alt={scene.narration} />
      )}
    </div>
  );
}

export default function IntroCinematic({
  open,
  onClose,
  reducedMotion = false,
}: IntroCinematicProps) {
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dialogRef = useRef<HTMLDivElement>(null);

  const finish = useCallback(() => {
    markIntroSeen();
    onClose();
  }, [onClose]);

  // Retour à la première scène à chaque ouverture : le composant reste monté
  // entre deux ouvertures. Le crawl, lui, est joué sur la landing
  // (IntroCinematicMount), jamais ici.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setIndex(0);
  }

  // Auto-défilement des scènes (désactivé en reduced-motion).
  useEffect(() => {
    if (!open || reducedMotion) return;
    clearTimeout(timerRef.current);
    // `index` vient des deps : pas d'updater fonctionnel, car appeler
    // `finish()` (setState du parent) dans un updater, censé être pur,
    // déclenche « Cannot update a component while rendering… ».
    timerRef.current = setTimeout(() => {
      if (index >= INTRO_SCENES.length - 1) finish();
      else setIndex(index + 1);
    }, INTRO_SCENE_DURATION_MS);
    return () => clearTimeout(timerRef.current);
  }, [open, index, reducedMotion, finish]);

  // Cue sonore par scène (uniquement si le son est activé).
  useEffect(() => {
    if (!open || !soundOn) return;
    if (index === INTRO_SCENES.length - 1) playFanfare();
    else playDeployBip();
  }, [open, index, soundOn]);

  // Échap ferme, Tab reste piégé dans l'overlay et le focus initial va au
  // conteneur (voir use-modal-overlay).
  useModalOverlay(dialogRef, { open, onClose: finish });

  if (!open) return null;

  const scene = INTRO_SCENES[index];
  const isLast = index === INTRO_SCENES.length - 1;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) unlockAudio();
  };

  const goNext = () => {
    setIndex((i) => (i >= INTRO_SCENES.length - 1 ? i : i + 1));
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Cinématique d'introduction de La Forge du Code"
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-nebula-bg-darkest outline-none"
    >
      <div className="absolute right-4 top-4 z-30 flex items-center gap-4">
        <button
          onClick={toggleSound}
          aria-label={soundOn ? "Couper le son" : "Activer le son"}
          className="text-lg transition-transform hover:scale-110"
        >
          {soundOn ? "🔊" : "🔇"}
        </button>
        <button
          onClick={finish}
          className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
        >
          Fermer ✕
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-nebula-stars opacity-50" />

      <div
        key={reducedMotion ? "static" : index}
        className={`relative my-2 flex h-auto w-full max-w-2xl items-center justify-center px-4 ${
          reducedMotion ? "" : "animate-intro-scene-in"
        }`}
      >
        <SceneVisual scene={scene} reducedMotion={reducedMotion} />
      </div>

      <p
        aria-live="polite"
        className="mt-4 min-h-[4rem] max-w-xl px-6 text-center font-tech text-lg tracking-wide text-nebula-cyan sm:text-xl"
      >
        {scene.narration}
      </p>

      {/* Navigation manuelle entre les scènes */}
      <div className="mt-4 flex items-center justify-center gap-4 z-20">
        {index > 0 && (
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="rounded-sm border border-nebula-border bg-nebula-bg-panel/80 px-4 py-2 font-tech text-xs uppercase tracking-widest text-nebula-cyan transition-colors hover:border-nebula-cyan"
          >
            ← Précédent
          </button>
        )}

        {!isLast ? (
          <button
            onClick={goNext}
            className="rounded-sm bg-nebula-cyan px-5 py-2 font-tech text-xs font-bold uppercase tracking-widest text-nebula-bg-darkest transition-all hover:brightness-110"
          >
            Suivant →
          </button>
        ) : (
          <Link
            href="/avatar?from=/dashboard"
            onClick={finish}
            className="rounded-sm bg-nebula-cyan px-6 py-2.5 text-center font-tech text-xs font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest transition-all hover:translate-y-px active:translate-y-[3px]"
          >
            {"> "}Configurer mon Cadet
          </Link>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3 z-20">
        <div className="flex gap-2">
          {INTRO_SCENES.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Aller à la scène ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                i === index ? "bg-nebula-cyan scale-125 shadow-[0_0_8px_rgba(0,240,255,0.8)]" : "bg-nebula-border hover:bg-nebula-cyan/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
