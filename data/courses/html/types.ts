export interface StepObjective {
  id: string;
  label: string;
}

/**
 * Narrative tone of a failure, which picks the error header shown:
 * "structure" for broken markup, "logic" for faulty logic or a faulty
 * loop, "syntax" for a syntax error. Absent: generic
 * (lib/narrative-feedback.ts).
 */
export type ErrorTone = "structure" | "logic" | "syntax" | "generic";

export interface ValidationResult {
  ok: boolean;
  msg: string;
  obj?: string;
  objList?: string[];
  final?: boolean;
  /** Narrative tone of the failure, ignored on success. */
  tone?: ErrorTone;
}

export interface Step {
  startCode: string;
  placeholder: string;
  /**
   * Trap step: the Spectre has corrupted the `startCode`, which must be repaired. The
   * value is its taunt, shown in place of the narrator box. Absent = normal step.
   */
  spectreTrap?: string;
  narrator: string;
  hint: string;
  briefing: {
    title: string;
    content: string;
  };
  objectives: StepObjective[];
  /** Ids of reference sheets relevant to this step (optional). */
  docRefs?: string[];
  /**
   * Component to mount in the React preview (React course only): the
   * exercise's component, or the parent that holds a Provider. Absent when there
   * is no preview and on exempted chapters (lib/sandbox/preview-exemptions.ts).
   */
  previewMount?: string;
  bannerIcon: string;
  /** Cell in /sprites/banner-icons.png; when absent, the logo is shown. */
  bannerFrame?: number;
  bannerTtl: string;
  bannerSub: string;
  bannerXp: string;
  missionIcon: string;
  /** Cell in the mission icon sprite sheet. */
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

export interface SqlQueryResult {
  columns: string[];
  rows: unknown[][];
}

export interface ValidatorContext {
  /** Captured output of console.log/info/warn/error. */
  logs: string[];
  /** Runtime error, or null on success. */
  error: string | null;
  /** Value of the last executed expression. */
  lastValue: unknown;
  /** Result of the real SQL execution, provided for the SQL course only. */
  sql?: {
    /** Last result set produced by the learner's SQL, or null. */
    result: SqlQueryResult | null;
    /** State read back by the step's `verify` query, if there is one. */
    verify: SqlQueryResult | null;
    /** Runtime error message, or null on success. */
    error: string | null;
  };
}

export type Validator = (
  code: string,
  context?: ValidatorContext
) => ValidationResult;
