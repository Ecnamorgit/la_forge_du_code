"use client";

/**
 * Combat visualizer (chantier 4) — turns a validation result into a short
 * space-combat beat, CodinGame-style but with pure CSS in the 16-bit aesthetic.
 *
 * - "explode" (success): the player emitter charges and fires a cyan laser; the
 *   enemy drone is hit and explodes.
 * - "fly" (error): the enemy drone sweeps across the console (counter-attack).
 *
 * It is purely decorative (aria-hidden) and never blocks progression: the host
 * keeps driving XP / banner on its own. Motion collapses under
 * `prefers-reduced-motion` via globals.css.
 */

import EnemySprite from "@/components/ui/EnemySprite";

export type CombatOutcome = "fly" | "explode" | "none";

interface CombatVisualizerProps {
  outcome: CombatOutcome;
  /** Increment to (re)play the sequence. */
  trigger: number;
}

export default function CombatVisualizer({
  outcome,
  trigger,
}: CombatVisualizerProps) {
  if (trigger <= 0 || outcome === "none") return null;

  const isSuccess = outcome === "explode";

  return (
    <div
      key={trigger}
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 overflow-hidden"
    >
      {/* Player emitter (left). Charges its reactor on a successful shot. */}
      <div
        className={`absolute left-1 top-1/2 ${isSuccess ? "animate-emitter-charge" : ""}`}
        style={{ transform: "translateY(-50%)" }}
      >
        <div className="combat-emitter" />
      </div>

      {/* Cyan laser beam on success, sweeping toward the enemy. */}
      {isSuccess && (
        <div
          className="animate-laser-fire absolute left-5 top-1/2 h-[3px] w-[55%] bg-gradient-to-r from-nebula-cyan via-nebula-cyan to-transparent"
          style={{ boxShadow: "0 0 8px var(--cyan, #00f0ff)" }}
        />
      )}

      {/* Enemy drone — explodes on success, sweeps across on error. */}
      <EnemySprite type={outcome} trigger={trigger} />
    </div>
  );
}
