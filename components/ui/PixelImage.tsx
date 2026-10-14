import type { CSSProperties } from "react";

type PixelImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
  /** Above the fold: load right away instead of lazily. */
  eager?: boolean;
};

/**
 * Plain `<img>` for small pixel-art files. next/image would add its client
 * runtime (about 9 KB gzipped) to the page for images that weigh a few KB
 * and must not be resampled anyway. `width` and `height` still reserve the
 * space, so the layout does not shift.
 */
export default function PixelImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  eager = false,
}: PixelImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- deliberate, see the comment above
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
      style={{ imageRendering: "pixelated", ...style }}
    />
  );
}
