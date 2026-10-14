"use client";

import PixelLogo from "./PixelLogo";

type BrandLogoProps = {
  size?: number;
  className?: string;
  /** Ignored, kept for compatibility with existing call sites. */
  priority?: boolean;
  /** Main menu: missed laser shots escape and fly across the screen. */
  fx?: boolean;
};

/** Brand logo: the Coalition Nebula fleet crest (see PixelLogo). */
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
