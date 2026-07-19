"use client";

import { useCallback, useEffect, useState } from "react";

import IntroCinematic from "./IntroCinematic";

/** Évènement window déclenchant une relecture depuis n'importe quel bouton. */
export const REPLAY_INTRO_EVENT = "nebula:replay-intro";

/**
 * Monte la cinématique sur la landing pour la relecture manuelle uniquement
 * (bouton « Revoir l'intro »). L'unique lecture automatique vit dans le
 * dashboard, à la première connexion d'un compte sans avatar — l'intro ne
 * doit PAS se jouer à la simple arrivée sur le site.
 */
export default function IntroCinematicMount() {
  const [open, setOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle au montage (matchMedia), pas une synchro continue
    setReducedMotion(rm);

    const onReplay = () => setOpen(true);
    window.addEventListener(REPLAY_INTRO_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_INTRO_EVENT, onReplay);
  }, []);

  return (
    <IntroCinematic open={open} reducedMotion={reducedMotion} onClose={handleClose} />
  );
}
