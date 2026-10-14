import Sprite from "@/components/ui/Sprite";
import { MISSION_ICONS, SPRITE_SHEETS_READY } from "@/lib/sprite-config";
import { getCourseIconFrame } from "@/lib/courses-catalog";

/**
 * A course's pixel icon, taken from /sprites/mission-icons.png when the sheet
 * is ready (SPRITE_SHEETS_READY.mission), otherwise the emoji. `className` (for
 * example a Tailwind text size) also applies to the emoji.
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
