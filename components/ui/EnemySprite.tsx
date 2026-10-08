"use client";

/**
 * Ennemi animé tiré de enemy-sprites.png (planche 2816x1536, 4 colonnes x 3
 * lignes, cases de 704x512). Seule la première ligne (Alien-Swifter) sert.
 *
 * En cas d'erreur, l'ennemi traverse de droite à gauche ; en cas de succès,
 * il apparaît puis explose (zoom et fondu).
 */

interface EnemySpriteProps {
  type: "fly" | "explode" | "none";
  trigger: number; // à incrémenter pour relancer l'animation
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
          // Seule la ligne (Y) est fixée ; les keyframes `sprite-enemy-anim` pilotent X.
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
