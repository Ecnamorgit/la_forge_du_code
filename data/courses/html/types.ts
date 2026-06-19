export interface StepObjective {
  id: string;
  label: string;
}

export interface ValidationResult {
  ok: boolean;
  msg: string;
  obj?: string;
  objList?: string[];
  final?: boolean;
}

export interface Step {
  startCode: string;
  placeholder: string;
  narrator: string;
  hint: string;
  briefing: {
    title: string;
    content: string;
  };
  objectives: StepObjective[];
  /** Ids de fiches de référence pertinentes pour cette étape (optionnel). */
  docRefs?: string[];
  bannerIcon: string;
  /** Optional frame index in /sprites/banner-icons.png. Falls back to bannerIcon emoji. */
  bannerFrame?: number;
  bannerTtl: string;
  bannerSub: string;
  bannerXp: string;
  missionIcon: string;
  /** Optional frame index in /sprites/mission-icons.png. Falls back to missionIcon emoji. */
  missionFrame?: number;
  missionTag: string;
  missionTtl: string;
}

export interface ChapterData {
  slug: string;
  tag: string;
  title: string;
  subtitle: string;
  totalXp: number;
  steps: Step[];
  completionBadge: string;
  completionBadgeLabel: string;
}

export interface ValidatorContext {
  /** Output captured from console.log/info/warn/error. */
  logs: string[];
  /** Runtime error string, or null if execution succeeded. */
  error: string | null;
  /** Last expression value of the executed code. */
  lastValue: unknown;
}

export type Validator = (
  code: string,
  context?: ValidatorContext
) => ValidationResult;
