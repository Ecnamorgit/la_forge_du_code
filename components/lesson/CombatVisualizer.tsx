"use client";

/**
 * Combat visualizer (chantier 4/5) — turns a validation result into a short
 * space-combat beat, CodinGame-style but with pure CSS in the 16-bit aesthetic.
 * The success beat is themed per cursus (turret/repair/field); the error beat
 * (enemy counter-attack) is shared. Purely decorative (aria-hidden), never
 * blocks progression. Motion collapses under prefers-reduced-motion.
 */

import EnemySprite from "@/components/ui/EnemySprite";
import type { CombatTheme } from "@/lib/combat-theme";

export type CombatOutcome = "fly" | "explode" | "none";

interface CombatVisualizerProps {
  outcome: CombatOutcome;
  /** Increment to (re)play the sequence. */
  trigger: number;
  /** Cursus theme for the success beat. Default: turret (JS/laser). */
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
      {/* Player emitter (left). Only charges for the turret (laser) theme. */}
      <div
        className={`absolute left-1 top-1/2 ${
          isSuccess && theme === "turret" ? "animate-emitter-charge" : ""
        }`}
        style={{ transform: "translateY(-50%)" }}
      >
        <div className="combat-emitter" />
      </div>

      {/* Success beat — themed. */}
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

      {/* Enemy drone — explodes on success, sweeps across on error. */}
      <EnemySprite type={outcome} trigger={trigger} />
    </div>
  );
}
