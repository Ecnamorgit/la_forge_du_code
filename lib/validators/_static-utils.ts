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
 * Trouve l'index du delimiteur fermant correspondant a celui ouvert en
 * `openIdx`. Accepte `(`, `{` et `[`, en ignorant le contenu des chaines
 * '...', "..." et `...`. Renvoie -1 si le delimiteur n'est pas equilibre, ou
 * si `openIdx` ne pointe pas sur un delimiteur ouvrant connu.
 *
 * Meme limite que le reste de ce module : c'est un compteur de profondeur, pas
 * un parseur. Il ne voit pas les delimiteurs dans une regex litterale.
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

// ---------------------------------------------------------------------------
// Helpers JSX / appels bruts, partages par les validateurs statiques qui
// scannent du JSX (props d'une balise, indirection vers une fonction nommee).
// Promus depuis lib/validators/react/chapitre-6.ts (voir finding 4 de la
// revue) car chapitre-6 n'est pas le seul a en avoir besoin : chapitre-7
// (hooks personnalises) et chapitre-8 (contexte, useReducer) manipulent eux
// aussi des appels BRUTS (`useReducer(...)`, `createContext(...)`, pas des
// `.methodName(...)`) et de l'indirection de handler JSX.
// ---------------------------------------------------------------------------

/**
 * Localise une balise JSX `<tagName ...>` (ouvrante ou auto-fermante) et
 * renvoie le texte de ses attributs, en equilibrant les accolades `{ }` (et
 * en ignorant '..' , "..", `..`) pour qu'un `>` a l'interieur d'une fleche
 * (`onChange={(e) => ...}`) ne termine pas la balise trop tot.
 *
 * Limite : un scanner heuristique, pas un parseur JSX. Ne gere pas un enfant
 * JSX passe en valeur de prop avant la fin de la balise ciblee. Suffisant
 * pour reperer LA balise <input>/<form>/<button> unique de ces exercices.
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
 * equilibrant les accolades internes (fleche avec corps bloc, objet litteral
 * imbrique...). Renvoie null si la prop est absente de `tagBody`.
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
 * Trouve la prochaine occurrence d'un appel de fonction BARE (pas de `.` qui
 * precede, contrairement a `findCallBody` ci-dessus qui cible specifiquement
 * `.methodName(...)`) — utile pour `setFormulaire(...)`, `useReducer(...)`,
 * `createContext(...)`, qui sont des appels de fonction directs, pas des
 * methodes d'objet. Equilibre les parentheses et ignore les chaines, pour
 * capturer tout l'argument meme s'il contient lui-meme des parentheses (ex:
 * une fleche `(prev) => ({...})`).
 *
 * Appeler avec `fromIndex = match.end` pour iterer sur toutes les
 * occurrences, comme pour `findCallBody`.
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
 * Retrouve le corps d'une fonction NOMMEE (declaration `function nom(...) {}`
 * ou `const nom = (...) => {}` / `const nom = function(...) {}`), en
 * equilibrant les accolades. Sert a suivre une indirection JSX (ex:
 * `onSubmit={handleSubmit}`, `onChange={handleChange}`) jusqu'a la
 * definition de la fonction quand la prop ne contient qu'un identifiant
 * plutot qu'une fleche inline.
 *
 * Limite : ne resout qu'UN niveau d'indirection (pas de handler qui renvoie
 * lui-meme une autre fonction), et suppose un corps de bloc `{ ... }` — un
 * corps expression sans accolades (`const f = (e) => e.preventDefault()`)
 * n'est pas suivi par ce helper.
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
