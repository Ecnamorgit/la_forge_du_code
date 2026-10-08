import type { ErrorTone, ValidationResult } from "@/data/courses/html/types";

/**
 * Utilitaires des validateurs statiques : le code saisi n'est pas exécuté, il
 * est analysé par motifs (git, python, react, typescript, nodejs...).
 */

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Retire les lignes entièrement commentées qui commencent par `marker` ("//",
 * "#", "--"). Les commentaires de fin de ligne sont conservés pour ne pas
 * tronquer une URL `https://...`. Les consignes en commentaire du `startCode`
 * ne peuvent ainsi jamais satisfaire un motif.
 */
export function stripLineComments(code: string, marker: string): string {
  const re = new RegExp(`^\\s*${escapeRegExp(marker)}.*$`, "gm");
  return code.replace(re, "");
}

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

/** Une occurrence de `.methodName(...)` localisée par `findCallBody`. */
export interface CallMatch {
  /** Le texte entre les parenthèses de l'appel (l'argument brut). */
  body: string;
  /** Index du "." qui ouvre l'appel (`.methodName`). */
  start: number;
  /** Index juste après la parenthèse fermante de l'appel. */
  end: number;
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
 * Trouve l'index du délimiteur fermant qui correspond à celui ouvert en
 * `openIdx` (`(`, `{` ou `[`), en ignorant le contenu des chaînes '...',
 * "..." et `...`. Renvoie -1 si le délimiteur n'est pas équilibré ou si
 * `openIdx` ne pointe pas sur un délimiteur ouvrant.
 *
 * Simple compteur de profondeur : les délimiteurs d'une regex littérale ne
 * sont pas reconnus.
 */
export function matchClosing(code: string, openIdx: number): number {
  const pairs: Record<string, string> = { "(": ")", "{": "}", "[": "]" };
  const open = code[openIdx];
  if (open === undefined) return -1;
  const close = pairs[open];
  if (close === undefined) return -1;

  let depth = 0;
  for (let i = openIdx; i < code.length; i++) {
    const ch = code[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      i = skipStringLiteral(code, i, ch);
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Renvoie l'indice de fin (exclu) de l'expression qui commence à `fromIdx` :
 * le premier `;` de profondeur zéro, ou le premier délimiteur fermant qui
 * ferait passer la profondeur sous zéro (fin du bloc englobant). Ignore le
 * contenu des chaînes.
 *
 * Sert à isoler la valeur d'un `return X` même quand X contient des
 * parenthèses, accolades ou crochets (ex. `return { ...etat };`).
 */
export function statementEnd(code: string, fromIdx: number): number {
  let depth = 0;
  for (let i = fromIdx; i < code.length; i++) {
    const ch = code[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      i = skipStringLiteral(code, i, ch);
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") depth++;
    else if (ch === ")" || ch === "}" || ch === "]") {
      if (depth === 0) return i;
      depth--;
    } else if (ch === ";" && depth === 0) {
      return i;
    }
  }
  return code.length;
}

/**
 * Cherche le prochain appel `.methodName(...)` à partir de `fromIndex` et
 * renvoie le contenu de ses parenthèses, profondeur équilibrée. Rappeler avec
 * `fromIndex = match.end` pour parcourir toutes les occurrences, par exemple
 * quand un `.map()` sans rapport précède celui du rendu JSX.
 *
 * Scanner heuristique, pas un parseur : les parenthèses d'une regex littérale
 * ou d'un commentaire de fin de ligne faussent le comptage.
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
      // Par exemple `.methodNameAutre(` : on reprend la recherche juste après.
      searchFrom = dotIdx + marker.length;
      continue;
    }
    const closeIdx = matchClosing(code, cursor);
    if (closeIdx === -1) {
      searchFrom = dotIdx + marker.length;
      continue;
    }
    return { body: code.slice(cursor + 1, closeIdx), start: dotIdx, end: closeIdx + 1 };
  }
  return null;
}

/**
 * Vérifie qu'un appel `.methodName(` est chaîné juste après `index` (espaces
 * et retours à la ligne admis), comme dans `.filter(...).map(...)`. `index`
 * est en général le `match.end` renvoyé par `findCallBody`.
 */
export function isFollowedByCall(code: string, index: number, methodName: string): boolean {
  let i = index;
  while (i < code.length && /\s/.test(code[i])) i++;
  return code.slice(i, i + methodName.length + 2) === `.${methodName}(`;
}

/**
 * Teste si la longueur de `varName` est comparée à zéro (`varName.length === 0`,
 * `varName.length < 1` ou `!varName.length`). L'ancrage sur le nom évite
 * d'accepter un test sur la collection source, jamais vide, au lieu du tableau
 * filtré visé par l'exercice.
 *
 * Recherche textuelle : les alias (`const x = varName; x.length === 0`) ne
 * sont pas résolus.
 */
export function hasEmptyLengthCheck(code: string, varName: string): boolean {
  const v = escapeRegExp(varName);
  return (
    new RegExp(`\\b${v}\\.length\\s*===\\s*0\\b`).test(code) ||
    new RegExp(`\\b${v}\\.length\\s*<\\s*1\\b`).test(code) ||
    new RegExp(`!\\s*${v}\\.length\\b`).test(code)
  );
}

// Helpers JSX et appels de fonction directs (props d'une balise, indirection
// vers une fonction nommée), utilisés par les chapitres React 6 à 8.

/**
 * Localise une balise JSX `<tagName ...>` (ouvrante ou auto-fermante) et
 * renvoie le texte de ses attributs. Les accolades sont équilibrées et les
 * chaînes ignorées, pour qu'un `>` dans une flèche (`onChange={(e) => ...}`)
 * ne ferme pas la balise trop tôt.
 */
export function findJsxTagAttrs(
  code: string,
  tagName: string,
  fromIndex = 0
): { body: string; start: number; end: number } | null {
  const openRe = new RegExp(`<${tagName}\\b`);
  const rel = code.slice(fromIndex).search(openRe);
  if (rel === -1) return null;
  const start = fromIndex + rel;
  let i = start + tagName.length + 1;
  let depth = 0;
  while (i < code.length) {
    const ch = code[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      i = skipStringLiteral(code, i, ch) + 1;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (ch === ">" && depth === 0) {
      return { body: code.slice(start, i + 1), start, end: i + 1 };
    }
    i++;
  }
  return null;
}

/**
 * Extrait le contenu entre accolades d'une prop JSX `attrName={ ... }`, en
 * équilibrant les accolades internes (flèche à corps bloc, objet littéral...).
 * Renvoie null si la prop est absente de `tagBody`.
 */
export function extractAttrValue(tagBody: string, attrName: string): string | null {
  const marker = new RegExp(`\\b${escapeRegExp(attrName)}\\s*=\\s*\\{`);
  const m = marker.exec(tagBody);
  if (!m) return null;
  let i = m.index + m[0].length;
  let depth = 1;
  const start = i;
  while (i < tagBody.length && depth > 0) {
    const ch = tagBody[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      i = skipStringLiteral(tagBody, i, ch) + 1;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    i++;
  }
  return tagBody.slice(start, i - 1);
}

/**
 * Trouve le prochain appel de fonction direct `fnName(...)`, comme
 * `setFormulaire(...)` ou `useReducer(...)`, et renvoie son argument complet
 * (parenthèses équilibrées, chaînes ignorées). Rappeler avec
 * `fromIndex = match.end` pour itérer, comme pour `findCallBody`.
 */
export function findBareCallBody(
  code: string,
  fnName: string,
  fromIndex = 0
): { body: string; start: number; end: number } | null {
  const nameRe = new RegExp(`\\b${escapeRegExp(fnName)}\\s*\\(`);
  let searchFrom = fromIndex;
  while (searchFrom <= code.length) {
    const rel = code.slice(searchFrom).search(nameRe);
    if (rel === -1) return null;
    const m = nameRe.exec(code.slice(searchFrom));
    const start = searchFrom + rel;
    const openIdx = start + (m ? m[0].length - 1 : 0);
    let depth = 0;
    let i = openIdx;
    let closeIdx = -1;
    for (; i < code.length; i++) {
      const ch = code[i];
      if (ch === "'" || ch === '"' || ch === "`") {
        i = skipStringLiteral(code, i, ch);
        continue;
      }
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          closeIdx = i;
          break;
        }
      }
    }
    if (closeIdx === -1) {
      searchFrom = openIdx + 1;
      continue;
    }
    return { body: code.slice(openIdx + 1, closeIdx), start, end: closeIdx + 1 };
  }
  return null;
}

/**
 * Renvoie le corps d'une fonction nommée (`function nom(...) {}`,
 * `const nom = (...) => {}` ou `const nom = function (...) {}`), accolades
 * équilibrées. Sert à suivre une indirection JSX comme
 * `onSubmit={handleSubmit}` jusqu'à la définition du handler.
 *
 * Un seul niveau d'indirection ; un corps sans accolades
 * (`const f = (e) => e.preventDefault()`) n'est pas reconnu.
 */
export function findNamedFunctionBody(code: string, name: string): string | null {
  const n = escapeRegExp(name);
  let m = new RegExp(`function\\s+${n}\\s*\\([^)]*\\)\\s*\\{`).exec(code);
  if (!m) {
    m = new RegExp(
      `(?:const|let|var)\\s+${n}\\s*=\\s*(?:function\\s*)?\\([^)]*\\)\\s*(?:=>)?\\s*\\{`
    ).exec(code);
  }
  if (!m) return null;
  const braceStart = m.index + m[0].length - 1;
  let depth = 0;
  let i = braceStart;
  for (; i < code.length; i++) {
    const ch = code[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      i = skipStringLiteral(code, i, ch);
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  return code.slice(braceStart + 1, i);
}
