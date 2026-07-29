import type { ErrorTone, ValidationResult } from "@/data/courses/html/types";

/**
 * Shared helpers for STATIC validators — i.e. courses that don't execute in the
 * JS sandbox (git, sql, python, react, typescript, nodejs, ...). Validation is
 * performed by pattern-matching the source code the student typed.
 */

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Strip WHOLE-LINE comments that begin with the given marker (e.g. "//", "#",
 * "--"). Inline/trailing comments are intentionally preserved so embedded URLs
 * such as `https://...` inside real code stay intact. This removes the French
 * instructional comments shipped in each step's `startCode` so they can never
 * trigger a false-positive match.
 */
export function stripLineComments(code: string, marker: string): string {
  const re = new RegExp(`^\\s*${escapeRegExp(marker)}.*$`, "gm");
  return code.replace(re, "");
}

/** Count how many times a pattern occurs in the code. */
export function countMatches(code: string, re: RegExp): number {
  const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
  return (code.match(new RegExp(re.source, flags)) ?? []).length;
}

export function fail(msg: string, tone?: ErrorTone): ValidationResult {
  return tone ? { ok: false, msg, tone } : { ok: false, msg };
}

export function pass(
  msg: string,
  objList: string[],
  final = false
): ValidationResult {
  return final ? { ok: true, msg, objList, final: true } : { ok: true, msg, objList };
}

/** Une occurrence de `.methodName(...)` localisee par `findCallBody`. */
export interface CallMatch {
  /** Le texte entre les parentheses de l'appel (l'argument brut). */
  body: string;
  /** Index du "." qui ouvre l'appel (`.methodName`). */
  start: number;
  /** Index juste apres la parenthese fermante de l'appel. */
  end: number;
}

/**
 * Trouve la parenthese fermante correspondant a celle ouverte en `openIdx`,
 * en ignorant le contenu des chaines '...', "..." et `...` (pour ne pas se
 * faire piquer par une parenthese textuelle dans une chaine de caracteres).
 */
function findMatchingParen(code: string, openIdx: number): number {
  let depth = 0;
  for (let i = openIdx; i < code.length; i++) {
    const ch = code[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      i = skipStringLiteral(code, i, ch);
      continue;
    }
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function skipStringLiteral(code: string, start: number, quote: string): number {
  let i = start + 1;
  while (i < code.length) {
    if (code[i] === "\\") {
      i += 2;
      continue;
    }
    if (code[i] === quote) return i;
    i++;
  }
  return i;
}

/**
 * Cherche le prochain appel `.methodName(...)` a partir de `fromIndex` et
 * renvoie le contenu de ses parentheses en equilibrant leur profondeur —
 * plutot qu'en cherchant juste la position du PREMIER `.methodName(` et du
 * PREMIER `.autreMethode(` dans tout le fichier, ce qui casse des qu'un
 * appel sans rapport avec l'exercice apparait ailleurs dans le code (ex: un
 * `.map()` de calcul intermediaire avant le vrai rendu JSX).
 *
 * Appeler successivement avec `fromIndex = match.end` pour iterer sur
 * TOUTES les occurrences (utile quand plusieurs appels a la meme methode
 * coexistent et qu'on veut savoir si AU MOINS UN correspond au motif
 * attendu).
 *
 * Limite : c'est un scanner heuristique par comptage de parentheses, pas un
 * vrai parseur JS/TSX. Il ignore les parentheses a l'interieur de chaines
 * de caracteres, mais pas celles dans des commentaires deja retires par
 * `stripLineComments`, ni celles dans une regex litterale ou un template
 * multi-lignes complexe. Suffisant pour verifier la forme d'un exercice
 * pedagogique dont on connait la structure attendue — pas pour analyser du
 * code JS/TSX arbitraire.
 */
export function findCallBody(
  code: string,
  methodName: string,
  fromIndex = 0
): CallMatch | null {
  const marker = `.${methodName}`;
  let searchFrom = fromIndex;
  while (searchFrom <= code.length) {
    const dotIdx = code.indexOf(marker, searchFrom);
    if (dotIdx === -1) return null;
    let cursor = dotIdx + marker.length;
    while (cursor < code.length && /\s/.test(code[cursor])) cursor++;
    if (code[cursor] !== "(") {
      // Ce n'etait pas .methodName( mais par ex .methodNameAutreChose( :
      // on reprend la recherche juste apres.
      searchFrom = dotIdx + marker.length;
      continue;
    }
    const closeIdx = findMatchingParen(code, cursor);
    if (closeIdx === -1) {
      searchFrom = dotIdx + marker.length;
      continue;
    }
    return { body: code.slice(cursor + 1, closeIdx), start: dotIdx, end: closeIdx + 1 };
  }
  return null;
}

/**
 * Verifie qu'un appel `.methodName(` suit immediatement `index` (apres
 * d'eventuels espaces/retours a la ligne) — c'est-a-dire qu'il est CHAINE
 * juste apres, comme dans `.filter(...).map(...)`. A utiliser avec
 * `match.end` renvoye par `findCallBody`.
 */
export function isFollowedByCall(code: string, index: number, methodName: string): boolean {
  let i = index;
  while (i < code.length && /\s/.test(code[i])) i++;
  return code.slice(i, i + methodName.length + 2) === `.${methodName}(`;
}

/**
 * Teste si la longueur d'UNE variable precise est comparee a zero, sous une
 * forme usuelle : `varName.length === 0`, `varName.length < 1`, ou
 * `!varName.length`. Ancre sur le nom de variable pour eviter qu'un test de
 * longueur sur un AUTRE tableau (ex: la collection source avant filtrage)
 * ne soit pris pour le bon test — l'erreur pedagogique classique etant de
 * tester le tableau d'origine, qui n'est jamais vide, au lieu du tableau
 * derive que l'exercice cible.
 *
 * Limite : recherche textuelle simple, ne resout pas les alias (`const x =
 * varName; x.length === 0` n'est pas detecte comme un test sur `varName`).
 */
export function hasEmptyLengthCheck(code: string, varName: string): boolean {
  const v = escapeRegExp(varName);
  return (
    new RegExp(`\\b${v}\\.length\\s*===\\s*0\\b`).test(code) ||
    new RegExp(`\\b${v}\\.length\\s*<\\s*1\\b`).test(code) ||
    new RegExp(`!\\s*${v}\\.length\\b`).test(code)
  );
}
