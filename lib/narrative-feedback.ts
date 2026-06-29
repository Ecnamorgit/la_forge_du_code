/**
 * Narrative framing for validation feedback.
 *
 * Validators return a precise, technical `msg` (kept for debuggability). This
 * module turns the optional `tone` of a result into an in-universe header — the
 * "system anomaly report" voice from the storytelling bible
 * (docs/conception_storytelling.md §4) — so failure feedback stays immersive
 * without rewriting every validator message.
 */

import type { ErrorTone } from "@/data/courses/html/types";

export type { ErrorTone };

const ERROR_HEADERS: Record<ErrorTone, string> = {
  // Missing/broken structure (e.g. unclosed tag): the hull is breached.
  structure: "DECOMPRESSION SECTEUR",
  // Faulty logic / infinite loop: the reactor overheats.
  logic: "SURCHAUFFE REACTEUR",
  // Syntax error: the transmission is garbled.
  syntax: "SIGNAL BROUILLE",
  // Anything else falls back to the historical generic header.
  generic: "BRECHE DETECTEE",
};

export function getErrorHeader(tone?: ErrorTone): string {
  return (tone && ERROR_HEADERS[tone]) || ERROR_HEADERS.generic;
}

export function getSuccessHeader(): string {
  return "SYSTEME EN LIGNE";
}

/**
 * Best-effort narrative tone from a JS sandbox runtime error string
 * (see lib/sandbox/run-js.ts). A timeout/infinite loop reads as a reactor
 * overheat; a SyntaxError reads as a garbled signal. Returns undefined when
 * nothing matches so callers can keep a validator-provided tone or the generic.
 */
export function inferToneFromError(error: string | null): ErrorTone | undefined {
  if (!error) return undefined;
  if (/interrompue|boucle infinie|timeout/i.test(error)) return "logic";
  if (/^syntaxerror/i.test(error)) return "syntax";
  return undefined;
}
