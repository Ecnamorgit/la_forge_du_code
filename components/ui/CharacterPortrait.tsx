import Sprite from "@/components/ui/Sprite";
import { CHARACTER_FRAMES, type SpeakerId } from "@/lib/characters";
import { CHARACTER_PORTRAITS, SPRITE_SHEETS_READY } from "@/lib/sprite-config";

/**
 * A speaker's pixel portrait from /sprites/characters.png, or `emoji` while
 * the sheet is not ready. Decorative: the speaker's name is always written
 * next to it, so the portrait is hidden from screen readers.
 */
export default function CharacterPortrait({
  speaker,
  emoji,
  size = 16,
  className = "",
}: {
  speaker: SpeakerId;
  emoji: string;
  size?: number;
  className?: string;
}) {
  if (!SPRITE_SHEETS_READY.characters) {
    return (
      <span aria-hidden className={className}>
        {emoji}
      </span>
    );
  }
  return (
    <span aria-hidden className={`inline-flex align-middle ${className}`.trim()}>
      <Sprite sheet={CHARACTER_PORTRAITS} frame={CHARACTER_FRAMES[speaker]} displaySize={size} />
    </span>
  );
}
