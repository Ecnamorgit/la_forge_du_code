/**
 * Affiche une case d'une planche de sprites pixel art par background-position,
 * sans lissage. Les dimensions de la planche sont celles de la source ;
 * `displaySize` fixe la taille à l'écran.
 */

export interface SpriteSheet {
  /** URL publique de la planche. */
  src: string;
  /** Largeur d'une case, en pixels source. */
  frameWidth: number;
  /** Hauteur d'une case, en pixels source. */
  frameHeight: number;
  /** Nombre de cases par ligne. */
  columns: number;
}

interface SpriteProps {
  sheet: SpriteSheet;
  /** Index de la case à partir de 0, de gauche à droite puis de haut en bas. */
  frame: number;
  /** Côté du carré dans lequel la case est affichée. */
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
  // La plus petite échelle, pour que la case tienne dans `size` x `size`.
  const rawScale = Math.min(scaleX, scaleY);
  // En agrandissement, échelle entière pour garder des pixels nets ; en
  // réduction, l'échelle reste fractionnaire.
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
