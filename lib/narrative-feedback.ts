/**
 * Narrative wrapping for validation feedback.
 *
 * Validators return a technical `msg`. This module maps a result's optional
 * `tone` to a "system anomaly report" header
 * (docs/conception_storytelling.md §4), without rewriting each message.
 */

import type { ErrorTone } from "@/data/courses/html/types";

export type { ErrorTone };

const ERROR_HEADERS: Record<ErrorTone, string> = {
  // Missing or broken structure (an unclosed tag, for example).
  structure: "DÉCOMPRESSION SECTEUR",
  // Faulty logic or infinite loop.
  logic: "SURCHAUFFE RÉACTEUR",
  // Syntax error.
  syntax: "SIGNAL BROUILLÉ",
  // Everything else.
  generic: "BRÈCHE DÉTECTÉE",
};

export function getErrorHeader(tone?: ErrorTone): string {
  return (tone && ERROR_HEADERS[tone]) || ERROR_HEADERS.generic;
}

export function getSuccessHeader(): string {
  return "SYSTÈME EN LIGNE";
}

/**
 * Number of consecutive failures on a step before the Spectre
 * (the antagonist, bible §2 and §3) starts taunting the cadet in the console.
 * The first error gets neutral system feedback.
 */
export const SPECTRE_TAUNT_THRESHOLD = 2;

/**
 * Spectre lines (bible §2). One at a time, picked deterministically
 * from the failure counter.
 */
export const SPECTRE_TAUNTS: readonly string[] = [
  "Encore une anomalie. Le système te rejette, Cadet.",
  "Chaque erreur nourrit le Spectre. Poursuis.",
  "Ton code se fissure. Je n'ai qu'à attendre.",
  "Déploiement refusé. Comme prévu.",
  "Tu confonds agitation et compétence.",
  "Le vide corrige ce que tu laisses cassé.",
];

/**
 * Spectre line for a failure rank (1 = first failure): `null` below the
 * threshold, otherwise a line picked by rotation.
 */
export function getSpectreTaunt(failCount: number): string | null {
  if (!Number.isFinite(failCount) || failCount < SPECTRE_TAUNT_THRESHOLD) {
    return null;
  }
  const offset = Math.trunc(failCount) - SPECTRE_TAUNT_THRESHOLD;
  return SPECTRE_TAUNTS[offset % SPECTRE_TAUNTS.length];
}

/**
 * Tone inferred from a JS runtime error (lib/sandbox/run-js.ts): a timeout
 * or an infinite loop gives `logic`, a SyntaxError gives `syntax`.
 * `undefined` otherwise, to keep the validator's tone or the generic one.
 */
export function inferToneFromError(error: string | null): ErrorTone | undefined {
  if (!error) return undefined;
  if (/interrompue|boucle infinie|timeout/i.test(error)) return "logic";
  if (/^syntaxerror/i.test(error)) return "syntax";
  return undefined;
}

/**
 * Default tone based on the step's language, when there is no validator
 * tone and no inference. HTML (and CSS, served as "html") gives `structure`;
 * JS and SQL stay generic.
 */
const DEFAULT_TONE_BY_LANGUAGE: Record<
  "html" | "javascript" | "sql" | "react",
  ErrorTone | undefined
> = {
  html: "structure",
  javascript: undefined,
  sql: undefined,
  // React validators set an explicit tone when it matters; a `structure`
  // default would wrongly label logic errors.
  react: undefined,
};

/**
 * Tone of a failure: the validator's, otherwise the one inferred from the JS
 * error, otherwise the language default.
 */
export function resolveErrorTone(
  validatorTone: ErrorTone | undefined,
  jsError: string | null,
  language: "html" | "javascript" | "sql" | "react",
): ErrorTone | undefined {
  return validatorTone ?? inferToneFromError(jsError) ?? DEFAULT_TONE_BY_LANGUAGE[language];
}
