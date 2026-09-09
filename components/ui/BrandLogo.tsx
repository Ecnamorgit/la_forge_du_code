"use client";

import PixelLogo from "./PixelLogo";

type BrandLogoProps = {
  size?: number;
  className?: string;
  /** Kept for call-site compatibility (was forwarded to next/image). */
  priority?: boolean;
  /** Main-menu extra: missed laser bolts escape and cross the screen. */
  fx?: boolean;
};

/**
 * Brand logo — the Coalition Nebula fleet crest in true 2D pixel art
 * (see PixelLogo): spinning gold-bordered écusson (orange star over the
 * cyan `</>`) orbited by a human fighter chasing an alien saucer.
 */
export default function BrandLogo({
  size = 40,
  className = "",
  fx = false,
}: BrandLogoProps) {
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <PixelLogo size={size} fx={fx} />
    </div>
  );
}
