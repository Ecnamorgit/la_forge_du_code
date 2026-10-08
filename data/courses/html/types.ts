export interface StepObjective {
  id: string;
  label: string;
}

/**
 * Ton narratif d'un échec, qui choisit l'en-tête d'erreur affiché :
 * "structure" pour un balisage cassé, "logic" pour une logique ou une boucle
 * fautive, "syntax" pour une erreur de syntaxe. Absent : générique
 * (lib/narrative-feedback.ts).
 */
export type ErrorTone = "structure" | "logic" | "syntax" | "generic";

export interface ValidationResult {
  ok: boolean;
  msg: string;
  obj?: string;
  objList?: string[];
  final?: boolean;
  /** Ton narratif de l'échec, ignoré en cas de succès. */
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
   * Composant à monter dans l'aperçu React (cursus React uniquement) : celui
   * de l'exercice, ou le parent qui porte un Provider. Absent sans aperçu et
   * sur les chapitres exemptés (lib/sandbox/preview-exemptions.ts).
   */
  previewMount?: string;
  bannerIcon: string;
  /** Case dans /sprites/banner-icons.png ; à défaut, le logo est affiché. */
  bannerFrame?: number;
  bannerTtl: string;
  bannerSub: string;
  bannerXp: string;
  missionIcon: string;
  /** Case dans la planche des icônes de mission. */
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
  /** Sortie capturée de console.log/info/warn/error. */
  logs: string[];
  /** Erreur d'exécution, ou null en cas de succès. */
  error: string | null;
  /** Valeur de la dernière expression exécutée. */
  lastValue: unknown;
  /** Résultat de l'exécution SQL réelle, fourni pour le seul cursus SQL. */
  sql?: {
    /** Dernier jeu de résultats produit par le SQL de l'apprenant, ou null. */
    result: SqlQueryResult | null;
    /** État relu par la requête `verify` de l'étape, si elle existe. */
    verify: SqlQueryResult | null;
    /** Message d'erreur d'exécution, ou null en cas de succès. */
    error: string | null;
  };
}

export type Validator = (
  code: string,
  context?: ValidatorContext
) => ValidationResult;
