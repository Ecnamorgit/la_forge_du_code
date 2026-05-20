"use client";

/**
 * Station map using infrastructure.png sprite sheet.
 * Sheet: 2816x1536, 4 cols x 3 rows → frame = 704x512
 * Row 3 (y offset: 1024px) = Centre de Commandement
 * Frame advances as steps are completed.
 *
 * Turrets from defense-systems.png:
 * Row 1 = Light Laser Turret, 4 frames animated
 */

interface StationMapProps {
  completedSteps: number; // 0-4
}

// Turret positions around the station (relative to station center)
const TURRET_POSITIONS = [
  { top: "-10px", left: "50%", transform: "translateX(-50%)" },         // top
  { top: "50%", right: "-14px", transform: "translateY(-50%)" },        // right
  { bottom: "-10px", left: "50%", transform: "translateX(-50%)" },      // bottom
  { top: "50%", left: "-14px", transform: "translateY(-50%)" },         // left
];

export default function StationMap({ completedSteps }: StationMapProps) {
  // Infrastructure sprite: row 3 (Centre de Commandement), frame = completedSteps clamped to 0-3
  const stationFrame = Math.min(completedSteps, 3);
  // Frame size in the sheet
  const fw = 704;
  const fh = 512;
  // Row 3 = y offset 1024
  const stationBgX = -(stationFrame * fw);
  const stationBgY = -(2 * fh); // row index 2 (0-based) = row 3

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 120 }}>
      {/* Ice Moon background */}
      <div
        className="absolute inset-0 opacity-[0.12] animate-planet-rotate pointer-events-none"
        style={{
          backgroundImage: "url(/sprites/celestial-objects.png)",
          backgroundPosition: `0px -${fh}px`, // row 2 = Small Ice Moon, frame 1
          backgroundSize: `${2816 * (120 / fh)}px ${1536 * (120 / fh)}px`,
          imageRendering: "pixelated",
          borderRadius: "50%",
        }}
      />

      {/* Station — Centre de Commandement */}
      <div
        className="relative z-10"
        style={{
          width: 80,
          height: 80 * (fh / fw),
          backgroundImage: "url(/sprites/infrastructure.png)",
          backgroundPosition: `${stationBgX * (80 / fw)}px ${stationBgY * (80 / fw)}px`,
          backgroundSize: `${2816 * (80 / fw)}px ${1536 * (80 / fw)}px`,
          imageRendering: "pixelated",
        }}
      />

      {/* Turrets — appear one per completed step */}
      {Array.from({ length: completedSteps }).map((_, i) => {
        const pos = TURRET_POSITIONS[i];
        return (
          <div
            key={i}
            className="absolute z-20 animate-turret-appear"
            style={{
              ...pos,
              width: 28,
              height: 28 * (fh / fw),
              animationDelay: `${i * 0.15}s`,
            }}
          >
            <div
              className="w-full h-full sprite-turret-anim"
              style={{
                backgroundImage: "url(/sprites/defense-systems.png)",
                backgroundPosition: `0px 0px`, // row 1
                backgroundSize: `${2816 * (28 / fw)}px ${1536 * (28 / fw)}px`,
                imageRendering: "pixelated",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
