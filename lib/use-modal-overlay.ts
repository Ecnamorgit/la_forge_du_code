"use client";

import { useEffect, type RefObject } from "react";

interface UseModalOverlayOptions {
  /** Vrai quand l'overlay est affiché. */
  open: boolean;
  /** Appelé à la fermeture (Échap, ou tout autre déclencheur du site appelant). */
  onClose: () => void;
  /**
   * Élément qui reçoit le focus à l'ouverture. Par défaut, l'overlay lui-même
   * (nœud pointé par `ref`, qui doit alors porter `tabIndex={-1}`) ; à fournir
   * quand un contrôle précis, comme le bouton « Passer », doit le recevoir.
   */
  getInitialFocusTarget?: () => HTMLElement | null;
}

/**
 * Comportement modal des overlays plein écran (cinématique post-inscription,
 * crawl d'accueil). Échap déclenche `onClose`. Tab reste piégé dans l'overlay :
 * la page dessous reste dans le DOM pour les robots et les aperçus de lien,
 * mais ne doit pas être navigable au clavier. Le focus entre dans l'overlay à
 * l'ouverture et revient à l'élément déclencheur à la fermeture.
 *
 * Les attributs ARIA (`role="dialog"`, `aria-modal`, `aria-label`) restent à
 * la charge de l'appelant.
 */
export function useModalOverlay(
  ref: RefObject<HTMLElement | null>,
  { open, onClose, getInitialFocusTarget }: UseModalOverlayOptions
) {
  // Échap ferme ; Tab reste dans l'overlay, comme l'exige aria-modal.
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

  // Focus initial à l'ouverture, rendu à l'élément déclencheur (bouton
  // « Revoir l'intro », par exemple) à la fermeture.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const target = getInitialFocusTarget?.() ?? ref.current;
    target?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `getInitialFocusTarget` n'est volontairement pas une dep : le rappeler à chaque render déclencherait la ré-exécution de l'effet.
  }, [open, ref]);
}
