/**
 * Habillage narratif des retours de validation.
 *
 * Les validateurs renvoient un `msg` technique. Ce module traduit le `tone`
 * facultatif d'un résultat en en-tête de « rapport d'anomalie système »
 * (docs/conception_storytelling.md §4), sans réécrire chaque message.
 */

import type { ErrorTone } from "@/data/courses/html/types";

export type { ErrorTone };

const ERROR_HEADERS: Record<ErrorTone, string> = {
  // Structure manquante ou cassée (balise non fermée, par exemple).
  structure: "DÉCOMPRESSION SECTEUR",
  // Logique fautive ou boucle infinie.
  logic: "SURCHAUFFE RÉACTEUR",
  // Erreur de syntaxe.
  syntax: "SIGNAL BROUILLÉ",
  // Tout le reste.
  generic: "BRÈCHE DÉTECTÉE",
};

export function getErrorHeader(tone?: ErrorTone): string {
  return (tone && ERROR_HEADERS[tone]) || ERROR_HEADERS.generic;
}

export function getSuccessHeader(): string {
  return "SYSTÈME EN LIGNE";
}

/**
 * Nombre d'échecs consécutifs sur une étape avant que le Spectre
 * (l'antagoniste, bible §2 et §3) ne vienne narguer le cadet dans la console.
 * La première erreur reçoit un retour système neutre.
 */
export const SPECTRE_TAUNT_THRESHOLD = 2;

/**
 * Répliques du Spectre (bible §2). Une seule à la fois, choisie de façon
 * déterministe par le compteur d'échecs.
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
 * Réplique du Spectre pour un rang d'échec (1 = premier échec) : `null` sous
 * le seuil, sinon une réplique choisie par rotation.
 */
export function getSpectreTaunt(failCount: number): string | null {
  if (!Number.isFinite(failCount) || failCount < SPECTRE_TAUNT_THRESHOLD) {
    return null;
  }
  const offset = Math.trunc(failCount) - SPECTRE_TAUNT_THRESHOLD;
  return SPECTRE_TAUNTS[offset % SPECTRE_TAUNTS.length];
}

/**
 * Tonalité déduite d'une erreur d'exécution JS (lib/sandbox/run-js.ts) : un
 * délai dépassé ou une boucle infinie donne `logic`, une SyntaxError `syntax`.
 * `undefined` sinon, pour garder la tonalité du validateur ou le générique.
 */
export function inferToneFromError(error: string | null): ErrorTone | undefined {
  if (!error) return undefined;
  if (/interrompue|boucle infinie|timeout/i.test(error)) return "logic";
  if (/^syntaxerror/i.test(error)) return "syntax";
  return undefined;
}

/**
 * Tonalité par défaut selon le langage de l'étape, faute de tonalité du
 * validateur ou d'inférence. HTML (et CSS, servi en "html") donne `structure` ;
 * JS et SQL restent génériques.
 */
const DEFAULT_TONE_BY_LANGUAGE: Record<
  "html" | "javascript" | "sql" | "react",
  ErrorTone | undefined
> = {
  html: "structure",
  javascript: undefined,
  sql: undefined,
  // Les validateurs React posent une tonalité explicite quand elle compte ; un
  // défaut `structure` étiquetterait à tort les erreurs de logique.
  react: undefined,
};

/**
 * Tonalité d'un échec : celle du validateur, sinon celle déduite de l'erreur
 * JS, sinon le défaut du langage.
 */
export function resolveErrorTone(
  validatorTone: ErrorTone | undefined,
  jsError: string | null,
  language: "html" | "javascript" | "sql" | "react",
): ErrorTone | undefined {
  return validatorTone ?? inferToneFromError(jsError) ?? DEFAULT_TONE_BY_LANGUAGE[language];
}
