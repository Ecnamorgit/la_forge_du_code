import type { ErrorTone, ValidationResult } from "@/data/courses/html/types";

/**
 * Utilities for the static validators: the typed code is not executed, it is
 * analysed by pattern matching (git, python, react, typescript, nodejs...).
 */

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Removes full-line comments that start with `marker` ("//", "#", "--").
 * End-of-line comments are kept so that a `https://...` URL is not
 * truncated. This way, instructions written as comments in the `startCode`
 * can never satisfy a pattern.
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

/** One occurrence of `.methodName(...)` located by `findCallBody`. */
export interface CallMatch {
  /** The text between the call's parentheses (the raw argument). */
  body: string;
  /** Index of the "." that opens the call (`.methodName`). */
  start: number;
  /** Index just after the call's closing parenthesis. */
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
 * Finds the index of the closing delimiter that matches the one opened at
 * `openIdx` (`(`, `{` or `[`), ignoring the contents of '...', "..." and
 * `...` strings. Returns -1 if the delimiter is unbalanced or if
 * `openIdx` does not point to an opening delimiter.
 *
 * Plain depth counter: delimiters inside a regex literal are not
 * recognised.
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
 * Returns the end index (exclusive) of the expression starting at `fromIdx`:
 * the first `;` at depth zero, or the first closing delimiter that would
 * take the depth below zero (end of the enclosing block). Ignores the
 * contents of strings.
 *
 * Used to isolate the value of a `return X` even when X contains
 * parentheses, braces or brackets (e.g. `return { ...etat };`).
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
 * Looks for the next `.methodName(...)` call starting at `fromIndex` and
 * returns the contents of its parentheses, with balanced depth. Call again with
 * `fromIndex = match.end` to walk through every occurrence, for example
 * when an unrelated `.map()` comes before the one in the JSX render.
 *
 * Heuristic scanner, not a parser: parentheses in a regex literal or in an
 * end-of-line comment throw off the count.
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
      // For example `.methodNameAutre(`: resume the search just after it.
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
 * Checks that a `.methodName(` call is chained right after `index` (spaces
 * and line breaks allowed), as in `.filter(...).map(...)`. `index`
 * is usually the `match.end` returned by `findCallBody`.
 */
export function isFollowedByCall(code: string, index: number, methodName: string): boolean {
  let i = index;
  while (i < code.length && /\s/.test(code[i])) i++;
  return code.slice(i, i + methodName.length + 2) === `.${methodName}(`;
}

/**
 * Tests whether the length of `varName` is compared to zero (`varName.length === 0`,
 * `varName.length < 1` or `!varName.length`). Anchoring on the name avoids
 * accepting a check on the source collection, which is never empty, instead of
 * the filtered array the exercise targets.
 *
 * Text search: aliases (`const x = varName; x.length === 0`) are
 * not resolved.
 */
export function hasEmptyLengthCheck(code: string, varName: string): boolean {
  const v = escapeRegExp(varName);
  return (
    new RegExp(`\\b${v}\\.length\\s*===\\s*0\\b`).test(code) ||
    new RegExp(`\\b${v}\\.length\\s*<\\s*1\\b`).test(code) ||
    new RegExp(`!\\s*${v}\\.length\\b`).test(code)
  );
}

// Helpers for JSX and direct function calls (a tag's props, indirection
// to a named function), used by React chapters 6 to 8.

/**
 * Locates a JSX tag `<tagName ...>` (opening or self-closing) and
 * returns the text of its attributes. Braces are balanced and strings
 * ignored, so that a `>` in an arrow function (`onChange={(e) => ...}`)
 * does not close the tag too early.
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
 * Extracts the brace-delimited contents of a JSX prop `attrName={ ... }`,
 * balancing inner braces (block-bodied arrow function, object literal...).
 * Returns null if the prop is missing from `tagBody`.
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
 * Finds the next direct function call `fnName(...)`, such as
 * `setFormulaire(...)` or `useReducer(...)`, and returns its full argument
 * (balanced parentheses, strings ignored). Call again with
 * `fromIndex = match.end` to iterate, as with `findCallBody`.
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
 * Returns the body of a named function (`function nom(...) {}`,
 * `const nom = (...) => {}` or `const nom = function (...) {}`), with balanced
 * braces. Used to follow a JSX indirection such as
 * `onSubmit={handleSubmit}` to the handler's definition.
 *
 * Only one level of indirection; a body without braces
 * (`const f = (e) => e.preventDefault()`) is not recognised.
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
