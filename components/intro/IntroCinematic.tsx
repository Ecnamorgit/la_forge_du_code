"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Sprite from "@/components/ui/Sprite";
import {
  INTRO_SCENES,
  INTRO_SCENE_DURATION_MS,
  markIntroSeen,
  type IntroScene,
} from "@/lib/intro";
import { INTRO_CINEMATIC, SPRITE_SHEETS_READY } from "@/lib/sprite-config";
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

/** Rend le visuel d'une scène : sprite si l'art est prêt, sinon placeholder. */
function SceneVisual({
  scene,
  reducedMotion,
}: {
  scene: IntroScene;
  reducedMotion: boolean;
}) {
  if (SPRITE_SHEETS_READY.intro) {
    return <Sprite sheet={INTRO_CINEMATIC} frame={scene.id} displaySize={320} />;
  }
  const pixel = { imageRendering: "pixelated" as const };
  switch (scene.visual) {
    case "logo":
      return (
        <Image
          src="/brand_logo_pixel.png"
          alt=""
          width={128}
          height={128}
          className={reducedMotion ? "" : "animate-planet-rotate"}
          style={pixel}
        />
      );
    case "cadet":
      return (
        <Image src="/role-ingenieur-v2.png" alt="" width={140} height={140} style={pixel} />
      );
    case "orbit":
      return (
        <div className="relative h-40 w-40">
          <Image
            src="/brand_logo_pixel.png"
            alt=""
            width={56}
            height={56}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={pixel}
          />
          {["HTML", "CSS", "JS"].map((label, i) => (
            <span
              key={label}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                reducedMotion ? "" : "animate-intro-orbit"
              }`}
              style={{ animationDelay: `${i * -2}s` }}
            >
              <span className="rounded-sm border border-nebula-cyan/50 bg-nebula-bg-panel px-2 py-1 font-tech text-[10px] tracking-widest text-nebula-cyan">
                {label}
              </span>
            </span>
          ))}
        </div>
      );
    case "planet":
      return (
        <Image
          src="/planet-ring-v2.png"
          alt=""
          width={160}
          height={160}
          className={reducedMotion ? "" : "animate-intro-planet-settle"}
          style={pixel}
        />
      );
    case "invite":
      return (
        <Image
          src="/planet-gas-v2.png"
          alt=""
          width={120}
          height={120}
          className={reducedMotion ? "" : "animate-planet-rotate"}
          style={pixel}
        />
      );
  }
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

  // Repart à la première scène et lit la préférence son à chaque ouverture
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
    timerRef.current = setTimeout(() => {
      setIndex((i) => {
        if (i >= INTRO_SCENES.length - 1) {
          finish();
          return i;
        }
        return i + 1;
      });
    }, INTRO_SCENE_DURATION_MS);
    return () => clearTimeout(timerRef.current);
  }, [open, index, reducedMotion, finish]);

  // Cue sonore par scène (uniquement si le son est activé).
  useEffect(() => {
    if (!open || !soundOn) return;
    if (index === INTRO_SCENES.length - 1) playFanfare();
    else playDeployBip();
  }, [open, index, soundOn]);

  // Échap ferme.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish]);

  // Focus l'overlay à l'ouverture (navigation clavier).
  useEffect(() => {
    if (open) dialogRef.current?.focus();
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
        className={`relative flex h-56 w-full max-w-2xl items-center justify-center ${
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
            href="/signup"
            onClick={finish}
            className="rounded-sm bg-nebula-cyan px-6 py-3 text-center font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest transition-all hover:translate-y-px active:translate-y-[3px]"
          >
            {"> "}Démarrer la mission
          </Link>
          <Link
            href="/learn"
            onClick={finish}
            className="rounded-sm border border-nebula-cyan-dim px-6 py-3 text-center font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-cyan transition-all hover:border-nebula-cyan"
          >
            Explorer les cursus
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
