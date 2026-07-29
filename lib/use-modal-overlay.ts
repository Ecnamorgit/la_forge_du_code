"use client";

import { useEffect, type RefObject } from "react";

interface UseModalOverlayOptions {
  /** L'overlay est-il actuellement affiché ? */
  open: boolean;
  /** Appelé à la fermeture (Échap, ou tout autre déclencheur du site appelant). */
  onClose: () => void;
  /**
   * Détermine l'élément qui reçoit le focus à l'ouverture. Par défaut,
   * l'overlay lui-même (le nœud pointé par `ref`) est focus — il doit alors
   * porter `tabIndex={-1}`. Fourni pour les cas où un contrôle précis
   * (ex. le bouton « Passer ») doit recevoir le focus initial à la place.
   */
  getInitialFocusTarget?: () => HTMLElement | null;
}

/**
 * Comportement modal partagé par les overlays plein écran de l'app
 * (cinématique post-inscription, crawl d'accueil) :
 *
 * - Échap déclenche `onClose` ;
 * - Tab est piégé dans l'overlay : le focus ne doit jamais atteindre la
 *   page rendue dessous (elle reste dans le DOM — pour les crawlers et les
 *   previews de lien — mais ne doit pas être navigable au clavier tant que
 *   l'overlay est ouvert) ;
 * - Le focus est déplacé dans l'overlay à l'ouverture, et restauré à
 *   l'élément déclencheur (ex. le bouton qui a ouvert l'overlay) à la
 *   fermeture.
 *
 * Les attributs ARIA (`role="dialog"`, `aria-modal`, `aria-label`) restent à
 * la charge de l'appelant : ils portent un libellé propre à chaque overlay.
 */
export function useModalOverlay(
  ref: RefObject<HTMLElement | null>,
  { open, onClose, getInitialFocusTarget }: UseModalOverlayOptions
) {
  // Échap ferme ; Tab est piégé dans l'overlay (aria-modal doit contenir le focus).
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

  // Focus l'overlay (ou la cible fournie) à l'ouverture, et rend le focus à
  // l'élément déclencheur (ex. bouton « Revoir l'intro ») à la fermeture.
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
