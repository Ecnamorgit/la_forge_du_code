export interface StepObjective {
  id: string;
  label: string;
}

/**
 * Narrative tone of a failure, used to pick an in-universe error header.
 * "structure" = broken markup/structure, "logic" = faulty logic / loops,
 * "syntax" = syntax error. Omitted = generic. See lib/narrative-feedback.ts.
 */
export type ErrorTone = "structure" | "logic" | "syntax" | "generic";

export interface ValidationResult {
  ok: boolean;
  msg: string;
  obj?: string;
  objList?: string[];
  final?: boolean;
  /** Optional narrative tone for failures (ignored on success). */
  tone?: ErrorTone;
}

export interface Step {
  startCode: string;
  placeholder: string;
  /**
   * Étape-piège : Le Spectre a corrompu le `startCode`, à réparer. La valeur est
   * sa raillerie, affichée à la place de la boîte narrateur. Absent = étape normale.
   */
  spectreTrap?: string;
  narrator: string;
  hint: string;
  briefing: {
    title: string;
    content: string;
  };
  objectives: StepObjective[];
  /** Ids de fiches de référence pertinentes pour cette étape (optionnel). */
  docRefs?: string[];
  /**
   * Nom du composant a monter dans l'apercu React (cursus react uniquement).
   * Explicite par etape : il n'y a pas de regle deductible — selon l'etape
   * c'est le composant de l'exercice, ou le parent qui porte un Provider.
   * Absent sur les cursus sans apercu et sur les chapitres exemptes
   * (cf. lib/sandbox/preview-exemptions.ts).
   */
  previewMount?: string;
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

export interface SqlQueryResult {
  columns: string[];
  rows: unknown[][];
}

export interface ValidatorContext {
  /** Output captured from console.log/info/warn/error. */
  logs: string[];
  /** Runtime error string, or null if execution succeeded. */
  error: string | null;
  /** Last expression value of the executed code. */
  lastValue: unknown;
  /** Real SQL execution result, provided only for the SQL cursus. */
  sql?: {
    /** Last result set produced by the student's SQL (null if none). */
    result: SqlQueryResult | null;
    /** State read back via the step's verify query, when configured. */
    verify: SqlQueryResult | null;
    /** Execution error message, or null on success. */
    error: string | null;
  };
}

export type Validator = (
  code: string,
  context?: ValidatorContext
) => ValidationResult;
