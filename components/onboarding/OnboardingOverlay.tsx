"use client";

import { useState } from "react";

import { useUser } from "@/lib/use-user";

interface Slide {
  icon: string;
  tag: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: "🛸",
    tag: "PROTOCOLE 01",
    title: "BRIEFING DE MISSION",
    body:
      "Bienvenue à bord, Cadet. La station Nebula te confie une mission : maîtriser les protocoles HTML, CSS et JavaScript. Chaque chapitre est une mission, chaque étape un protocole à valider.",
  },
  {
    icon: "⚙️",
    tag: "PROTOCOLE 02",
    title: "DÉPLOIE TON CODE",
    body:
      "À gauche, le briefing et tes objectifs. À droite, l'éditeur de code. Tape ton code, puis clique DEPLOYER pour exécuter. Si tu valides tous les objectifs, l'étape est marquée terminée.",
  },
  {
    icon: "⚡",
    tag: "PROTOCOLE 03",
    title: "SYSTÈME XP & BADGES",
    body:
      "Chaque étape complétée te rapporte de l'XP et fait monter ton niveau. Terminer un chapitre entier débloque un badge spécial — visible sur ton profil. Reviens chaque jour pour faire grimper ton streak.",
  },
  {
    icon: "🚀",
    tag: "PROTOCOLE 04",
    title: "PRÊT À DÉCOLLER",
    body:
      "Trois cursus t'attendent : HTML pour les fondations, CSS pour le visuel, JavaScript pour la logique. Choisis ton parcours depuis le dashboard et lance ta première mission.",
  },
];

export default function OnboardingOverlay() {
  const { state, hydrated, markOnboarded } = useUser();
  const [step, setStep] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  if (!hydrated || hidden || state.onboardedAt) return null;

  const slide = SLIDES[step];
  const isFirst = step === 0;
  const isLast = step === SLIDES.length - 1;

  const handleDismiss = async () => {
    setLocalError(null);
    setDismissing(true);
    try {
      await markOnboarded();
      setHidden(true);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Erreur d'enregistrement");
    } finally {
      setDismissing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-[600] flex items-center justify-center bg-[rgba(3,6,13,0.92)] px-4 py-6 backdrop-blur-sm animate-overlay-in"
    >
      <div className="w-full max-w-lg rounded-sm border border-nebula-cyan/60 bg-nebula-bg-panel p-6 shadow-[0_0_60px_rgba(0,240,255,0.18),0_0_140px_rgba(0,240,255,0.06)] animate-modal-pop-in sm:p-8">
        <div className="mb-4 flex items-center justify-between font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
          <span className="text-nebula-blue">◈ {slide.tag}</span>
          <span>
            {step + 1} / {SLIDES.length}
          </span>
        </div>

        <div className="mb-5 text-center">
          <div className="mb-3 text-5xl sm:text-6xl">{slide.icon}</div>
          <h2
            id="onboarding-title"
            className="font-tech text-2xl tracking-[0.15em] text-nebula-cyan [text-shadow:0_0_22px_rgba(0,240,255,0.35)] sm:text-3xl"
          >
            {slide.title}
          </h2>
        </div>

        <p className="mb-6 min-h-[6rem] font-body text-base leading-relaxed text-nebula-text-secondary">
          {slide.body}
        </p>

        {/* Progress dots */}
        <div className="mb-5 flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-nebula-cyan shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                  : i < step
                    ? "w-4 bg-nebula-green"
                    : "w-4 bg-nebula-border"
              }`}
            />
          ))}
        </div>

        {localError && (
          <p className="mb-3 text-center font-tech text-[11px] uppercase tracking-wider text-nebula-red">
            {localError}
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={dismissing}
            className="font-tech text-xs uppercase tracking-widest text-nebula-text-dim transition-colors hover:text-nebula-text-secondary disabled:opacity-40"
          >
            Passer
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={isFirst || dismissing}
              className="rounded-sm border border-nebula-border bg-transparent px-3 py-2 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-all enabled:hover:border-nebula-cyan enabled:hover:text-nebula-cyan disabled:opacity-30 sm:px-4"
            >
              ← Préc.
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={handleDismiss}
                disabled={dismissing}
                className="rounded-sm bg-nebula-cyan px-4 py-2 font-tech text-xs font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all enabled:hover:translate-y-px enabled:hover:shadow-[0_3px_0_var(--cyan-dim)] enabled:active:translate-y-[3px] enabled:active:shadow-none disabled:opacity-50 sm:px-6 sm:text-sm"
              >
                {dismissing ? "..." : "> Commencer"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(SLIDES.length - 1, s + 1))}
                disabled={dismissing}
                className="rounded-sm bg-nebula-cyan px-4 py-2 font-tech text-xs font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all hover:translate-y-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none sm:px-6 sm:text-sm"
              >
                Suivant →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
