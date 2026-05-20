"use client";

import { useCallback, useEffect, useState } from "react";

import { isSoundEnabled, setSoundEnabled } from "./audio";

/** Reactive accessor to the sound preference (localStorage-backed). */
export function useSoundPreference(): {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (v: boolean) => void;
} {
  // Default to true on first render so SSR + first paint match. Real value is
  // read in the effect once we know we're in the browser.
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    setEnabledState(isSoundEnabled());
    const onChange = (e: Event) => {
      setEnabledState((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener("nebula:sound-changed", onChange);
    return () => window.removeEventListener("nebula:sound-changed", onChange);
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    setSoundEnabled(v);
    setEnabledState(v);
  }, []);

  const toggle = useCallback(() => {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabledState(next);
  }, [enabled]);

  return { enabled, toggle, setEnabled };
}
