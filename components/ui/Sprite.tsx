/**
 * Generic pixel-art sprite renderer.
 *
 * Reads a single frame from a sprite sheet using CSS background-position.
 * `image-rendering: pixelated` keeps crisp edges when scaling.
 *
 * The dimension props refer to the *source* frame; pass `displaySize` to
 * render the frame at a different on-screen size while preserving sharpness.
 */

export interface SpriteSheet {
  /** Public URL of the sheet. */
  src: string;
  /** Width of a single frame, in pixels (source). */
  frameWidth: number;
  /** Height of a single frame, in pixels (source). */
  frameHeight: number;
  /** Number of frames per row in the sheet. */
  columns: number;
}

interface SpriteProps {
  sheet: SpriteSheet;
  /** Zero-based frame index, counted left-to-right then top-to-bottom. */
  frame: number;
  /** Optional on-screen size override (single number = square). */
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
  // Use the smaller scale so the frame fits inside `size` x `size` while
  // staying square pixels.
  const scale = Math.min(scaleX, scaleY);

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
