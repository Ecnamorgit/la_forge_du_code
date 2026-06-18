"use client";

import { useCallback, useSyncExternalStore } from "react";

import { isSoundEnabled, setSoundEnabled } from "./audio";

function subscribe(callback: () => void): () => void {
  window.addEventListener("nebula:sound-changed", callback);
  return () => window.removeEventListener("nebula:sound-changed", callback);
}

/**
 * Reactive accessor to the sound preference (localStorage-backed).
 *
 * Modelled as an external store: `setSoundEnabled` writes localStorage and
 * dispatches "nebula:sound-changed", which `useSyncExternalStore` subscribes to.
 * SSR + first client paint default to `true`; the real value is read once mounted.
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
