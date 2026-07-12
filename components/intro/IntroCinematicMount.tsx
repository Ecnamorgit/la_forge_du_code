"use client";

import { useCallback, useEffect, useState } from "react";

import IntroCinematic from "./IntroCinematic";
import { hasSeenIntro, shouldAutoPlayIntro } from "@/lib/intro";

/** Évènement window déclenchant une relecture depuis n'importe quel bouton. */
export const REPLAY_INTRO_EVENT = "nebula:replay-intro";

export default function IntroCinematicMount() {
  const [open, setOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle au montage (matchMedia/localStorage), pas une synchro continue
    setReducedMotion(rm);
    if (shouldAutoPlayIntro(hasSeenIntro(), rm)) setOpen(true);

    const onReplay = () => setOpen(true);
    window.addEventListener(REPLAY_INTRO_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_INTRO_EVENT, onReplay);
  }, []);

  return (
    <IntroCinematic open={open} reducedMotion={reducedMotion} onClose={handleClose} />
  );
}
