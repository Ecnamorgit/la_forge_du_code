import Sprite from "@/components/ui/Sprite";
import { MISSION_ICONS, SPRITE_SHEETS_READY } from "@/lib/sprite-config";
import { getCourseIconFrame } from "@/lib/courses-catalog";

/**
 * Icône pixel d'un cursus, tirée de /sprites/mission-icons.png quand la planche
 * est prête (SPRITE_SHEETS_READY.mission), sinon l'emoji. `className` (par
 * exemple une taille de texte Tailwind) s'applique aussi à l'emoji.
 */
export default function CourseIcon({
  slug,
  emoji,
  size = 40,
  className = "",
}: {
  slug: string;
  emoji: string;
  size?: number;
  className?: string;
}) {
  if (SPRITE_SHEETS_READY.mission) {
    return (
      <Sprite
        sheet={MISSION_ICONS}
        frame={getCourseIconFrame(slug)}
        displaySize={size}
        title={slug}
        className={className}
      />
    );
  }
  return <span className={className}>{emoji}</span>;
}
