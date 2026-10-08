"use client";

import { useEffect, useState } from "react";

interface LevelUpOverlayProps {
  /** Incrémenté à chaque célébration à afficher. */
  trigger: number;
  /** Niveau tout juste atteint ; ignoré si `unlockLabel` est fourni. */
  level: number;
  /**
   * Libellé du cosmétique tout juste débloqué. S'il est fourni, l'overlay
   * annonce ce déblocage au lieu d'une montée de niveau.
   */
  unlockLabel?: string;
}

/**
 * Célébration plein écran (montée de niveau ou déblocage), masquée après
 * 2,4 s. En `pointer-events-none`, elle n'intercepte aucun clic et n'a donc
 * pas besoin de bouton de fermeture.
 */
export default function LevelUpOverlay({ trigger, level, unlockLabel }: LevelUpOverlayProps) {
  // `show` est dérivé de `trigger` : l'effet ne modifie que `dismissed`, et
  // seulement depuis le minuteur.
  const [dismissed, setDismissed] = useState(0);

  useEffect(() => {
    if (trigger === 0) return;
    const id = setTimeout(() => setDismissed(trigger), 2400);
    return () => clearTimeout(id);
  }, [trigger]);

  const show = trigger !== 0 && trigger !== dismissed;
  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-[450] flex items-center justify-center animate-level-up-in"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.18)_0%,rgba(0,240,255,0.04)_35%,transparent_70%)]" />
      <div className="relative text-center">
        <div className="mb-2 font-tech text-xs uppercase tracking-[0.6em] text-nebula-text-secondary [text-shadow:0_0_12px_rgba(0,240,255,0.4)]">
          {unlockLabel ? "★ NOUVEAU DÉBLOCAGE ★" : "★ NIVEAU FRANCHI ★"}
        </div>
        <div
          className="font-tech text-7xl font-bold uppercase tracking-[0.15em] text-nebula-cyan [text-shadow:0_0_28px_rgba(0,240,255,0.7),0_0_56px_rgba(0,240,255,0.35)] sm:text-8xl"
          style={{ animation: "level-up-pulse 1.6s ease-out forwards" }}
        >
          {unlockLabel ? "DÉBLOQUÉ" : "NIVEAU FRANCHI"}
        </div>
        <div className="mt-3 font-tech text-2xl tracking-[0.3em] text-nebula-green [text-shadow:0_0_18px_rgba(0,255,136,0.5)] sm:text-3xl">
          {unlockLabel ? `▲ ${unlockLabel}` : `▲ NIVEAU ${level}`}
        </div>
      </div>
    </div>
  );
}
