"use client";

import { useEffect, useState } from "react";

/**
 * Vrai si le visiteur demande moins d'animations. Lu une fois au montage, sans
 * abonnement : les cinématiques fixent leur rythme à l'ouverture. Rend `false`
 * au premier rendu (SSR compris), puis la vraie valeur après l'hydratation.
 */
export function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle au montage
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return reducedMotion;
}
