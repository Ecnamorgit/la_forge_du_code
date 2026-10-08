"use client";

import { useCallback, useSyncExternalStore } from "react";

import { isSoundEnabled, setSoundEnabled } from "./audio";

function subscribe(callback: () => void): () => void {
  window.addEventListener("nebula:sound-changed", callback);
  return () => window.removeEventListener("nebula:sound-changed", callback);
}

/**
 * Préférence de son réactive, stockée dans localStorage. `setSoundEnabled`
 * écrit la valeur et émet "nebula:sound-changed", auquel `useSyncExternalStore`
 * s'abonne. Vaut `true` côté serveur et pendant l'hydratation.
 */
export function useSoundPreference(): {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (v: boolean) => void;
} {
  const enabled = useSyncExternalStore(subscribe, isSoundEnabled, () => true);

  const setEnabled = useCallback((v: boolean) => {
    setSoundEnabled(v);
  }, []);

  const toggle = useCallback(() => {
    setSoundEnabled(!isSoundEnabled());
  }, []);

  return { enabled, toggle, setEnabled };
}
