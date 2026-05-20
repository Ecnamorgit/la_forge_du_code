"use client";

/**
 * VFX burst on quest banner success.
 * Uses a CSS-only cyan explosion since we don't have a VFX sprite sheet.
 * Multiple expanding rings + particle scatter.
 */

interface VFXBurstProps {
  trigger: number;
}

export default function VFXBurst({ trigger }: VFXBurstProps) {
  if (trigger <= 0) return null;

  return (
    <div
      key={trigger}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[398] pointer-events-none"
    >
      {/* Expanding rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-nebula-cyan animate-vfx-ring"
          style={{
            animationDelay: `${i * 0.1}s`,
            width: 40,
            height: 40,
          }}
        />
      ))}
    </div>
  );
}
