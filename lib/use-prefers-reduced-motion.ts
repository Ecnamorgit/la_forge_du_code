"use client";

import { useEffect, useState } from "react";

/**
 * True if the visitor asks for reduced motion. Read once on mount, with no
 * subscription: cutscenes set their pace when they open. Returns `false`
 * on the first render (SSR included), then the real value after hydration.
 */
export function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read on mount
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return reducedMotion;
}
