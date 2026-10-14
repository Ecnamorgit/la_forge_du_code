"use client";

import { useCallback, useSyncExternalStore } from "react";

import { isSoundEnabled, setSoundEnabled } from "./audio";

function subscribe(callback: () => void): () => void {
  window.addEventListener("nebula:sound-changed", callback);
  return () => window.removeEventListener("nebula:sound-changed", callback);
}

/**
 * Reactive sound preference, stored in localStorage. `setSoundEnabled`
 * writes the value and emits "nebula:sound-changed", which `useSyncExternalStore`
 * subscribes to. It is `true` on the server and during hydration.
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
