"use client";

/**
 * Traduit un résultat de validation en courte séquence de combat spatial, en
 * CSS pur dans l'esthétique 16 bits. La séquence de succès dépend du thème du
 * cursus (tourelle, réparation, champ) ; celle d'erreur (contre-attaque
 * ennemie) est commune. Purement décoratif (aria-hidden), ne bloque jamais la
 * progression. Les animations sont coupées sous prefers-reduced-motion.
 */

import EnemySprite from "@/components/ui/EnemySprite";
import type { CombatTheme } from "@/lib/combat-theme";

export type CombatOutcome = "fly" | "explode" | "none";

interface CombatVisualizerProps {
  outcome: CombatOutcome;
  /** À incrémenter pour (re)jouer la séquence. */
  trigger: number;
  /** Thème du cursus pour la séquence de succès (tourelle laser par défaut). */
  theme?: CombatTheme;
}

export default function CombatVisualizer({
  outcome,
  trigger,
  theme = "turret",
}: CombatVisualizerProps) {
  if (trigger <= 0 || outcome === "none") return null;

  const isSuccess = outcome === "explode";

  return (
    <div
      key={trigger}
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 overflow-hidden"
    >
      {/* Émetteur du joueur, à gauche ; il ne se charge qu'avec le thème tourelle. */}
      <div
        className={`absolute left-1 top-1/2 ${
          isSuccess && theme === "turret" ? "animate-emitter-charge" : ""
        }`}
        style={{ transform: "translateY(-50%)" }}
      >
        <div className="combat-emitter" />
      </div>

      {/* Séquence de succès, selon le thème. */}
      {isSuccess && theme === "turret" && (
        <div
          className="animate-laser-fire absolute left-5 top-1/2 h-[3px] w-[55%] bg-gradient-to-r from-nebula-cyan via-nebula-cyan to-transparent"
          style={{ boxShadow: "0 0 8px var(--cyan, #00f0ff)" }}
        />
      )}
      {isSuccess && theme === "repair" && (
        <div
          className="animate-combat-repair absolute left-6 top-1/2"
          style={{ transform: "translateY(-50%)" }}
        >
          <div className="combat-brick" />
        </div>
      )}
      {isSuccess && theme === "field" && (
        <div
          className="animate-combat-field absolute left-3 top-1/2"
          style={{ transform: "translateY(-50%)" }}
        >
          <div className="combat-field" />
        </div>
      )}

      {/* Drone ennemi : explose en cas de succès, traverse l'écran en cas d'erreur. */}
      <EnemySprite type={outcome} trigger={trigger} />
    </div>
  );
}
