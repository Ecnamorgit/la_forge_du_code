/**
 * Displays one cell of a pixel art sprite sheet via background-position,
 * without smoothing. The sheet dimensions are those of the source;
 * `displaySize` sets the on-screen size.
 */

export interface SpriteSheet {
  /** Public URL of the sheet. */
  src: string;
  /** Width of a cell, in source pixels. */
  frameWidth: number;
  /** Height of a cell, in source pixels. */
  frameHeight: number;
  /** Number of cells per row. */
  columns: number;
}

interface SpriteProps {
  sheet: SpriteSheet;
  /** 0-based cell index, left to right then top to bottom. */
  frame: number;
  /** Side of the square in which the cell is displayed. */
  displaySize?: number;
  className?: string;
  title?: string;
}

export default function Sprite({
  sheet,
  frame,
  displaySize,
  className = "",
  title,
}: SpriteProps) {
  const { src, frameWidth, frameHeight, columns } = sheet;
  const col = frame % columns;
  const row = Math.floor(frame / columns);

  const size = displaySize ?? Math.max(frameWidth, frameHeight);
  const scaleX = size / frameWidth;
  const scaleY = size / frameHeight;
  // The smaller scale, so the cell fits within `size` x `size`.
  const rawScale = Math.min(scaleX, scaleY);
  // When upscaling, use an integer scale to keep pixels crisp; when
  // downscaling, the scale stays fractional.
  const scale = rawScale >= 1 ? Math.floor(rawScale) : rawScale;

  return (
    <span
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 ${className}`.trim()}
      style={{
        width: frameWidth * scale,
        height: frameHeight * scale,
        backgroundImage: `url(${src})`,
        backgroundPosition: `${-col * frameWidth * scale}px ${-row * frameHeight * scale}px`,
        backgroundSize: `${columns * frameWidth * scale}px auto`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
      }}
    />
  );
}
