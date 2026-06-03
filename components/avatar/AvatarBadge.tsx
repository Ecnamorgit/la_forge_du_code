import { getSpecies, getUniformColor } from "@/lib/avatar";

interface AvatarBadgeProps {
  species: string | null;
  uniformColor: string | null;
  /** Diameter in pixels. Default 64. */
  size?: number;
  /** Optional override character (when species not yet set, falls back to '?'). */
  fallbackChar?: string;
}

/**
 * Visual representation of a user's avatar: a circular emoji medallion with
 * an accent border + glow matching the uniform color. Pure, reusable, used in
 * DashboardNav, /profil, /avatar preview, leaderboard rows (eventually).
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
      className="relative flex shrink-0 items-center justify-center rounded-full bg-nebula-bg-darkest"
      style={{
        width: size,
        height: size,
        border: `2px solid ${ring}`,
        boxShadow: `0 0 ${Math.round(size / 4)}px ${glow}`,
        fontSize,
        lineHeight: 1,
      }}
    >
      <span style={{ fontSize }}>{emoji}</span>
    </div>
  );
}
