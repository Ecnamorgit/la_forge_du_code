"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import StarWarsCrawl from "./StarWarsCrawl";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro";
import { useModalOverlay } from "@/lib/use-modal-overlay";

/** Window event that triggers a replay from any button. */
export const REPLAY_INTRO_EVENT = "nebula:replay-intro";

/**
 * Mounts the crawl on top of the landing page. It is an overlay, not a
 * redirect: the landing page stays rendered underneath for crawlers and
 * link previews. Autoplays only once per browser
 * (`nc_intro_seen` flag); the five animated scenes play on first
 * login, on the dashboard side.
 */
export default function IntroCinematicMount() {
  const [open, setOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    markIntroSeen();
    setOpen(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off reads on mount
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!hasSeenIntro()) setOpen(true);

    const onReplay = () => setOpen(true);
    window.addEventListener(REPLAY_INTRO_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_INTRO_EVENT, onReplay);
  }, []);

  // Same modal contract as the post-signup cinematic: the landing page
  // underneath must not be reachable by keyboard. Initial focus goes to the
  // « Passer »/« Continuer » (skip/continue) button, the only useful control here.
  useModalOverlay(overlayRef, {
    open,
    onClose: handleClose,
    getInitialFocusTarget: () =>
      overlayRef.current?.querySelector<HTMLElement>("button") ?? null,
  });

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Transmission d'introduction de La Forge du Code"
      tabIndex={-1}
      className="fixed inset-0 z-[100] outline-none"
    >
      <StarWarsCrawl
        reducedMotion={reducedMotion}
        onComplete={handleClose}
        onSkip={handleClose}
      />
    </div>
  );
}
