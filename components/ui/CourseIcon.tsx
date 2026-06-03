import Sprite from "@/components/ui/Sprite";
import { MISSION_ICONS, SPRITE_SHEETS_READY } from "@/lib/sprite-config";
import { getCourseIconFrame } from "@/lib/courses-catalog";

/**
 * Renders a course's pixel icon from /sprites/mission-icons.png once that sheet
 * ships (SPRITE_SHEETS_READY.mission), otherwise the emoji fallback. The `className`
 * (e.g. a Tailwind text size) styles the emoji span so today's layout is unchanged.
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
