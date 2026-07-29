"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import StarWarsCrawl from "./StarWarsCrawl";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro";
import { useModalOverlay } from "@/lib/use-modal-overlay";

/** Évènement window déclenchant une relecture depuis n'importe quel bouton. */
export const REPLAY_INTRO_EVENT = "nebula:replay-intro";

/**
 * Monte le crawl par-dessus la landing.
 *
 * Overlay, jamais redirection : la landing est rendue en HTML dessous, pour
 * que les crawlers et les previews de lien voient la vraie page.
 *
 * Auto-lecture une seule fois par navigateur (drapeau `nc_intro_seen`). Les
 * 5 scènes animées restent au premier login, côté dashboard.
 */
export default function IntroCinematicMount() {
  const [open, setOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    markIntroSeen();
    setOpen(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectures ponctuelles au montage
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!hasSeenIntro()) setOpen(true);

    const onReplay = () => setOpen(true);
    window.addEventListener(REPLAY_INTRO_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_INTRO_EVENT, onReplay);
  }, []);

  // Même contrat modal que la cinématique post-inscription (Échap, piège à
  // Tab) : la landing reste rendue dessous pour les crawlers, mais ne doit
  // pas être atteignable au clavier tant que le crawl est ouvert. Le focus
  // initial va au bouton « Passer »/« Continuer » plutôt qu'au conteneur, car
  // c'est le seul contrôle utile ici.
  useModalOverlay(overlayRef, {
    open,
    onClose: handleClose,
    getInitialFocusTarget: () =>
      overlayRef.current?.querySelector<HTMLElement>("button") ?? null,
  });

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Transmission d'introduction Nebula Command"
      tabIndex={-1}
      className="fixed inset-0 z-[100] outline-none"
    >
      <StarWarsCrawl
        reducedMotion={reducedMotion}
        onComplete={handleClose}
        onSkip={handleClose}
      />
    </div>
  );
}
