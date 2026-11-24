import Sprite from "@/components/ui/Sprite";
import { MISSION_ICONS, SPRITE_SHEETS_READY } from "@/lib/sprite-config";
import { getCourseIconFrame } from "@/lib/courses-catalog";

/**
 * A course's pixel icon, taken from /sprites/mission-icons.png when the sheet
 * is ready (SPRITE_SHEETS_READY.mission) and holds this course's frame,
 * otherwise the emoji. `className` (for
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
  // No frame: the course's icon is not drawn in the sheet yet.
  const frame = getCourseIconFrame(slug);
  if (SPRITE_SHEETS_READY.mission && frame !== null) {
    return (
      <Sprite
        sheet={MISSION_ICONS}
        frame={frame}
        displaySize={size}
        title={slug}
        className={className}
      />
    );
  }
  return <span className={className}>{emoji}</span>;
}
