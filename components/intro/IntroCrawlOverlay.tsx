"use client";

import { useRef, useState } from "react";

import StarWarsCrawl from "./StarWarsCrawl";
import { useModalOverlay } from "@/lib/use-modal-overlay";

/**
 * The crawl dialog itself. Loaded on demand by `IntroCinematicMount`, so a
 * visitor who has already seen the intro never downloads it.
 */
export default function IntroCrawlOverlay({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [reducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Same modal contract as the post-signup cinematic: the landing page
  // underneath must not be reachable by keyboard. Initial focus goes to the
  // « Passer »/« Continuer » (skip/continue) button, the only useful control here.
  useModalOverlay(overlayRef, {
    open: true,
    onClose,
    getInitialFocusTarget: () =>
      overlayRef.current?.querySelector<HTMLElement>("button") ?? null,
  });

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Transmission d'introduction de La Forge du Code"
      tabIndex={-1}
      className="fixed inset-0 z-[100] outline-none"
    >
      <StarWarsCrawl reducedMotion={reducedMotion} onComplete={onClose} onSkip={onClose} />
    </div>
  );
}
