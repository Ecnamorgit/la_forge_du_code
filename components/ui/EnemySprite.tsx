"use client";

/**
 * Animated enemy taken from enemy-sprites.png (2816x1536 sheet, 4 columns x 3
 * rows, 704x512 cells). Only the first row (Alien-Swifter) is used.
 *
 * On error, the enemy flies across from right to left; on success,
 * it appears then explodes (zoom and fade).
 */

interface EnemySpriteProps {
  type: "fly" | "explode" | "none";
  trigger: number; // increment to restart the animation
}

export default function EnemySprite({ type, trigger }: EnemySpriteProps) {
  if (trigger <= 0 || type === "none") return null;

  const fw = 704;
  const displaySize = 36;
  const scale = displaySize / fw;

  if (type === "fly") {
    return (
      <div
        key={trigger}
        className="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none animate-enemy-fly sprite-enemy-anim"
        style={{
          width: displaySize,
          height: displaySize * (512 / 704),
          backgroundImage: "url(/sprites/enemy-sprites.png)",
          // Only the row (Y) is fixed; the `sprite-enemy-anim` keyframes drive X.
          backgroundPositionY: "0px",
          backgroundSize: `${2816 * scale}px ${1536 * scale}px`,
          imageRendering: "pixelated",
        }}
      />
    );
  }

  // Explosion
  return (
    <div
      key={trigger}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none animate-enemy-explode sprite-enemy-anim"
      style={{
        width: displaySize,
        height: displaySize * (512 / 704),
        backgroundImage: "url(/sprites/enemy-sprites.png)",
        backgroundPositionY: "0px",
        backgroundSize: `${2816 * scale}px ${1536 * scale}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}
