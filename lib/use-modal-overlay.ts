"use client";

import { useEffect, type RefObject } from "react";

interface UseModalOverlayOptions {
  /** True when the overlay is shown. */
  open: boolean;
  /** Called on close (Escape, or any other trigger from the calling site). */
  onClose: () => void;
  /**
   * Element that receives focus on open. Defaults to the overlay itself
   * (the node `ref` points to, which must then have `tabIndex={-1}`); provide
   * it when a specific control, such as the "Passer" button, should get it.
   */
  getInitialFocusTarget?: () => HTMLElement | null;
}

/**
 * Modal behavior for full-screen overlays (post-signup cutscene, welcome
 * crawl). Escape triggers `onClose`. Tab stays trapped in the overlay: the
 * page underneath stays in the DOM for crawlers and link previews, but must
 * not be keyboard-navigable. Focus moves into the overlay on open and returns
 * to the triggering element on close.
 *
 * ARIA attributes (`role="dialog"`, `aria-modal`, `aria-label`) are up to
 * the caller.
 */
export function useModalOverlay(
  ref: RefObject<HTMLElement | null>,
  { open, onClose, getInitialFocusTarget }: UseModalOverlayOptions
) {
  // Escape closes; Tab stays in the overlay, as aria-modal requires.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = ref.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const list = Array.from(focusables);
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === ref.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, ref]);

  // Initial focus on open, returned to the triggering element (the
  // "Revoir l'intro" button, for example) on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const target = getInitialFocusTarget?.() ?? ref.current;
    target?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `getInitialFocusTarget` is deliberately not a dep: calling it on every render would re-run the effect.
  }, [open, ref]);
}
