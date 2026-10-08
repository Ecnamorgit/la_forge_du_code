"use client";

import PixelLogo from "./PixelLogo";

type BrandLogoProps = {
  size?: number;
  className?: string;
  /** Ignoré, conservé pour la compatibilité des appels existants. */
  priority?: boolean;
  /** Menu principal : les tirs laser ratés s'échappent et traversent l'écran. */
  fx?: boolean;
};

/** Logo de la marque : l'écusson de la flotte Coalition Nebula (voir PixelLogo). */
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
