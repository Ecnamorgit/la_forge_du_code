"use client";

import { useEffect, useState } from "react";

/**
 * Le visiteur demande-t-il une réduction des animations ?
 *
 * Lecture ponctuelle au montage (pas d'abonnement) : les cinématiques décident
 * de leur rythme à l'ouverture, changer de préférence en cours de lecture n'a
 * pas de sens. Rend `false` au premier rendu (SSR compris), puis la vraie
 * valeur juste après l'hydratation.
 */
export function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle au montage
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return reducedMotion;
}
