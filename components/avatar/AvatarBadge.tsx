import Image from "next/image";
import { getSpecies, getUniformColor } from "@/lib/avatar";

interface AvatarBadgeProps {
  species: string | null;
  uniformColor: string | null;
  /** Diamètre en pixels. */
  size?: number;
  /** Caractère affiché tant que l'espèce n'est pas choisie. */
  fallbackChar?: string;
}

/**
 * Médaillon d'avatar (pixel art ou emoji), cerclé et éclairé à la couleur de
 * l'uniforme.
 */
export default function AvatarBadge({
  species,
  uniformColor,
  size = 64,
  fallbackChar = "?",
}: AvatarBadgeProps) {
  const sp = getSpecies(species);
  const col = getUniformColor(uniformColor);
  const emoji = sp?.emoji ?? fallbackChar;
  const ring = col?.hex ?? "#2a3a55";
  const glow = col?.glow ?? "rgba(42,58,85,0.3)";
  const fontSize = Math.round(size * 0.5);

  return (
    <div
      aria-hidden
      className="relative flex shrink-0 items-center justify-center rounded-full bg-nebula-bg-darkest overflow-hidden"
      style={{
        width: size,
        height: size,
        border: `2px solid ${ring}`,
        boxShadow: `0 0 ${Math.round(size / 4)}px ${glow}`,
        fontSize,
        lineHeight: 1,
      }}
    >
      {sp?.image ? (
        <Image
          src={sp.image}
          alt={sp.label}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />
      ) : (
        <span style={{ fontSize }}>{emoji}</span>
      )}
    </div>
  );
}
