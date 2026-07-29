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
 * Nombre d'échecs consécutifs sur une même étape avant que Le Spectre
 * (l'antagoniste, cf. bible §2 & §3) ne s'invite dans la console pour narguer
 * le Cadet. On laisse passer la première erreur (feedback système neutre) : la
 * persistance est ce qui "attire" le Spectre, ce qui le rend menaçant sans
 * spammer.
 */
export const SPECTRE_TAUNT_THRESHOLD = 2;

/**
 * Répliques du Spectre — froides, cryptiques (bible §2). On en montre une seule
 * à la fois, choisie de façon déterministe par le compteur d'échecs pour rester
 * testable et éviter la répétition immédiate.
 */
export const SPECTRE_TAUNTS: readonly string[] = [
  "Encore une anomalie. Le systeme te rejette, Cadet.",
  "Chaque erreur nourrit le Spectre. Poursuis.",
  "Ton code se fissure. Je n'ai qu'a attendre.",
  "Deploiement refuse. Comme prevu.",
  "Tu confonds agitation et competence.",
  "Le vide corrige ce que tu laisses casse.",
];

/**
 * Réplique du Spectre pour un rang d'échec donné (1 = 1er échec, 2 = 2e...).
 * Renvoie `null` tant que le seuil n'est pas atteint, sinon une raillerie
 * choisie par rotation. Déterministe : même rang → même réplique.
 */
export function getSpectreTaunt(failCount: number): string | null {
  if (!Number.isFinite(failCount) || failCount < SPECTRE_TAUNT_THRESHOLD) {
    return null;
  }
  const offset = Math.trunc(failCount) - SPECTRE_TAUNT_THRESHOLD;
  return SPECTRE_TAUNTS[offset % SPECTRE_TAUNTS.length];
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

/**
 * Tonalité par défaut selon le langage de l'étape, quand ni le validateur ni
 * l'inférence runtime n'ont fixé de tonalité. HTML (et CSS, servi en "html")
 * → structure ; JS/SQL restent génériques (undefined → « BRECHE DETECTEE »).
 */
const DEFAULT_TONE_BY_LANGUAGE: Record<
  "html" | "javascript" | "sql",
  ErrorTone | undefined
> = {
  html: "structure",
  javascript: undefined,
  sql: undefined,
};

/**
 * Résout la tonalité d'un échec : priorité au tone du validateur, puis à
 * l'inférence depuis l'erreur JS runtime, puis au défaut du langage.
 */
export function resolveErrorTone(
  validatorTone: ErrorTone | undefined,
  jsError: string | null,
  language: "html" | "javascript" | "sql",
): ErrorTone | undefined {
  return validatorTone ?? inferToneFromError(jsError) ?? DEFAULT_TONE_BY_LANGUAGE[language];
}
