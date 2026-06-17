"use client";

import dynamic from "next/dynamic";

const ThreeLogoCanvas = dynamic(() => import("./ThreeLogoCanvas"), {
  ssr: false,
});

type BrandLogoProps = {
  size?: number;
  className?: string;
  /** Kept for call-site compatibility (was forwarded to next/image). */
  priority?: boolean;
};

/**
 * Brand logo — full pixel-art 3D scene (see ThreeLogoCanvas): gravitating
 * gold core, two rotating rings and a voxel ship orbiting the whole thing.
 *
 * The canvas overflows the layout box (inset -22%) so the logo renders
 * larger and the ship's orbit isn't clipped, without pushing surrounding
 * layout around.
 */
export default function BrandLogo({ size = 40, className = "" }: BrandLogoProps) {
  return (
    <div
      className={`relative shrink-0 ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-[-22%]">
        <ThreeLogoCanvas />
      </div>
    </div>
  );
}
