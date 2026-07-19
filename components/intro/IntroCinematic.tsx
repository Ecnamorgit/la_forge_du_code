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

interface IntroCinematicProps {
  /** Quand false, rien n'est rendu. */
  open: boolean;
  /** Appelé à la fermeture (skip, fin, ou Échap). */
  onClose: () => void;
  /** En reduced-motion : scènes en stills, pas d'auto-défilement ni d'animation. */
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dialogRef = useRef<HTMLDivElement>(null);

  const finish = useCallback(() => {
    markIntroSeen();
    onClose();
  }, [onClose]);

  // Repart à la première scène à chaque ouverture
  // (reset intentionnel : le composant reste monté entre deux ouvertures).
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset volontaire à l'ouverture
      setIndex(0);
    }
  }, [open]);

  // Auto-défilement (désactivé en reduced-motion).
  useEffect(() => {
    if (!open || reducedMotion) return;
    clearTimeout(timerRef.current);
    // `index` vient des deps de l'effet : pas d'updater fonctionnel ici, car
    // appeler `finish()` (setState du parent) dans un updater — censé être
    // pur — déclenche « Cannot update a component while rendering… ».
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

  // Échap ferme ; Tab est piégé dans l'overlay (aria-modal doit contenir le focus).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        finish();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const list = Array.from(focusables);
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish]);

  // Focus l'overlay à l'ouverture, et rend le focus à l'élément déclencheur
  // (ex. bouton « Revoir l'intro ») à la fermeture.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, [open]);

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
      aria-label="Cinématique d'introduction Nebula Command"
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-nebula-bg-darkest outline-none"
    >
      <div className="pointer-events-none absolute inset-0 bg-nebula-stars opacity-40" />

      <div
        key={reducedMotion ? "static" : index}
        className={`relative flex h-auto my-2 w-full max-w-2xl items-center justify-center px-4 ${
          reducedMotion ? "" : "animate-intro-scene-in"
        }`}
      >
        <SceneVisual scene={scene} reducedMotion={reducedMotion} />
      </div>

      <p
        aria-live="polite"
        className="mt-6 max-w-xl px-6 text-center font-tech text-lg tracking-wide text-nebula-cyan sm:text-xl"
      >
        {scene.narration}
      </p>

      {isLast && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/avatar?from=/dashboard"
            onClick={finish}
            className="rounded-sm bg-nebula-cyan px-6 py-3 text-center font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest transition-all hover:translate-y-px active:translate-y-[3px]"
          >
            {"> "}Configurer mon Cadet
          </Link>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <div className="flex gap-2">
          {INTRO_SCENES.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Aller à la scène ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-nebula-cyan" : "bg-nebula-border"
              }`}
            />
          ))}
        </div>
        {reducedMotion && !isLast && (
          <button
            onClick={goNext}
            className="ml-2 font-tech text-xs uppercase tracking-widest text-nebula-cyan hover:underline"
          >
            Suivant →
          </button>
        )}
      </div>

      <div className="absolute right-4 top-4 flex items-center gap-4">
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
          Passer ✕
        </button>
      </div>
    </div>
  );
}
