"use client";

import { useCallback, useEffect, useState } from "react";

import StarWarsCrawl from "./StarWarsCrawl";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <StarWarsCrawl
        reducedMotion={reducedMotion}
        onComplete={handleClose}
        onSkip={handleClose}
      />
    </div>
  );
}
