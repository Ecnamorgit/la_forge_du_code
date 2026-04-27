"use client";

import { useEffect, useState } from "react";

/**
 * Animated enemy sprite from enemy-sprites.png
 * Sheet: 2816x1536, 4 cols x 3 rows → frame = 704x512
 * Row 1 = Alien-Swifter (used for error feedback)
 *
 * On error: enemy flies across from right to left.
 * On success: enemy appears then "explodes" (scale + fade).
 */

interface EnemySpriteProps {
  type: "fly" | "explode" | "none";
  trigger: number; // increment to restart animation
}

export default function EnemySprite({ type, trigger }: EnemySpriteProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger > 0 && type !== "none") {
      setActive(true);
      const duration = type === "fly" ? 2000 : 600;
      const t = setTimeout(() => setActive(false), duration);
      return () => clearTimeout(t);
    }
  }, [trigger, type]);

  if (!active) return null;

  const fw = 704;
  const displaySize = 36;
  const scale = displaySize / fw;

  if (type === "fly") {
    return (
      <div
        className="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none animate-enemy-fly sprite-enemy-anim"
        style={{
          width: displaySize,
          height: displaySize * (512 / 704),
          backgroundImage: "url(/sprites/enemy-sprites.png)",
          backgroundPosition: "0px 0px", // row 1, frame 1
          backgroundSize: `${2816 * scale}px ${1536 * scale}px`,
          imageRendering: "pixelated",
        }}
      />
    );
  }

  // explode
  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none animate-enemy-explode sprite-enemy-anim"
      style={{
        width: displaySize,
        height: displaySize * (512 / 704),
        backgroundImage: "url(/sprites/enemy-sprites.png)",
        backgroundPosition: "0px 0px",
        backgroundSize: `${2816 * scale}px ${1536 * scale}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}
